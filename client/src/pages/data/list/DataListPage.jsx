import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JSONPath } from 'jsonpath-plus';
import _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { useNavigation } from 'react-navi';
import moment from 'moment';
import { useAxios } from '../../../utils/hooks';
import DownloadToCSV from './components/DownloadToCSV';
import { RefDataSetContext } from '../../../utils/RefDataSetContext';
import { getDescription } from '../../../utils/dataUtil';
import { Card, ScrollWrapper } from '../../../components/styles';

const now = moment().toISOString();

const DataListPage = ({ entityId }) => {
  const { t } = useTranslation();

  const { dataSetContext } = useContext(RefDataSetContext);

  const navigation = useNavigation();

  const [selectedColumns, setSelectedColumns] = useState([]);
  const [appliedColumns, setAppliedColumns] = useState([]);

  const checkBoxRefs = useRef([]);
  const [definition, setDefinition] = useState(
    JSONPath({
      path: `$.definitions['${entityId}']`,
      json: dataSetContext,
    })[0]
  );

  const [count, setCount] = useState(0);
  const [entityData, setEntityData] = useState({
    isLoading: false,
    data: [],
    page: 0,
    total: 0,
  });

  let businessKey;
  Object.keys(definition.properties).forEach((k) => {
    const property = definition.properties[k];
    const { description } = property;
    let parsed = description.replace(/(?:\r\n|\r|\n)/g, '');
    if (parsed.indexOf('Note') !== -1) {
      parsed = parsed.substring(0, parsed.indexOf('Note'));
    }
    const field = JSON.parse(parsed);
    if (field.businesskey === 'true') {
      businessKey = {
        key: k,
        label: field.label,
      };
    }
  });

  const axiosInstance = useAxios();

  useEffect(() => {
    const loadDefinition = async () => {
      if (axiosInstance) {
        try {
          const countResponse = await axiosInstance({
            method: 'GET',
            url: `/refdata/${entityId}`,
            params: {
              limit: 1,
              offset: 0,
              select: 'id',
              and: `(or(validfrom.is.null,validfrom.lt.${now}),or(validto.is.null,validto.gt.${now}))`,
            },
            headers: {
              Prefer: 'count=exact',
            },
          });
          setCount(countResponse.headers['content-range'].split('/')[1]);
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }
    };
    loadDefinition();
  }, [axiosInstance, setDefinition, entityId]);

  const loadNext = useCallback(
    (page) => {
      const modified = [].concat(selectedColumns);
      if (!modified.find((c) => c.key === businessKey.key)) {
        modified.push(businessKey);
      }
      axiosInstance({
        method: 'GET',
        url: `/refdata/${entityId}`,
        params: {
          limit: 10,
          offset: page,
          order: 'id.asc',
          select: modified.map((col) => col.key).toString(),
          and: `(or(validfrom.is.null,validfrom.lt.${now}),or(validto.is.null,validto.gt.${now}))`,
        },
        headers: {
          Prefer: 'count=exact',
        },
      }).then((response) => {
        setEntityData({
          ...entityData,
          page,
          data: _.union(entityData.data, response.data),
        });
      });
    },
    [axiosInstance, entityData, setEntityData, entityId, selectedColumns, businessKey]
  );

  const loadData = useCallback(() => {
    setEntityData({
      ...entityData,
      isLoading: true,
    });

    const modified = [].concat(selectedColumns);
    if (!modified.find((c) => c.key === businessKey.key)) {
      modified.push(businessKey);
    }
    axiosInstance({
      method: 'GET',
      url: `/refdata/${entityId}`,
      params: {
        limit: 10,
        offset: 0,
        order: 'id.asc',
        select: modified.map((col) => col.key).toString(),
        and: `(or(validfrom.is.null,validfrom.lt.${now}),or(validto.is.null,validto.gt.${now}))`,
      },
      headers: {
        Prefer: 'count=exact',
      },
    })
      .then(async (response) => {
        setAppliedColumns(selectedColumns);
        setEntityData({
          isLoading: false,
          data: response.data,
          page: 0,
          total: response.headers['content-range'].split('/')[1],
        });
      })
      .catch(() => {
        setEntityData({
          ...entityData,
        });
      });
  }, [
    axiosInstance,
    setEntityData,
    entityData,
    selectedColumns,
    entityId,
    setAppliedColumns,
    businessKey,
  ]);

  const resolveData = (datum) => {
    if (!datum) {
      return t('pages.data.no-data');
    }
    if (_.isBoolean(datum)) {
      return datum ? 'Yes' : 'No';
    }
    return `${datum}`;
  };

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <span className="govuk-caption-l">{t('pages.data.list.dataset')}</span>
              <h2 className="govuk-heading-l">{entityId}</h2>
            </div>
            <div className="govuk-grid-column-one-half">
              <span className="govuk-caption-l">{t('pages.data.list.total')}</span>
              <h2 className="govuk-heading-l" id="countText">
                {count}
              </h2>
            </div>
          </div>
        </div>
      </div>
      <p className="govuk-body-l">{JSON.parse(definition.description).description}</p>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <ScrollWrapper className="govuk-form-group">
            <fieldset className="govuk-fieldset" aria-describedby="data-fields">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <h1 className="govuk-fieldset__heading">{t('pages.data.list.select.columns')}</h1>
              </legend>
              <div id="data-fields" className="govuk-hint">
                {t('pages.data.list.select.columns-all-that-apply')}
              </div>

              <div className="govuk-checkboxes govuk-!-margin-left-1 govuk-!-margin-top-1">
                {Object.keys(definition.properties).map((k) => {
                  const obj = getDescription(k, definition);
                  return (
                    <div className="govuk-checkboxes__item" key={k}>
                      <input
                        className="govuk-checkboxes__input"
                        ref={(ref) => {
                          checkBoxRefs.current.push(ref);
                        }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColumns(
                              _.concat(selectedColumns, {
                                label: obj.label,
                                key: k,
                              })
                            );
                          } else {
                            setSelectedColumns(_.filter(selectedColumns, (c) => c.key !== k));
                          }
                        }}
                        id={obj.key}
                        name={obj.key}
                        type="checkbox"
                        value={obj.label}
                      />
                      <label className="govuk-label govuk-checkboxes__label" htmlFor={obj.label}>
                        {obj.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          </ScrollWrapper>

          <button
            type="button"
            data-module="govuk-button"
            aria-disabled={entityData.isLoading || selectedColumns.length === 0}
            disabled={entityData.isLoading || selectedColumns.length === 0}
            onClick={() => {
              loadData();
            }}
            className={`govuk-button govuk-!-margin-right-1 ${
              entityData.isLoading ? 'govuk-button--disabled' : ''
            }`}
          >
            {t('pages.data.list.actions.load')}
          </button>
          <button
            type="button"
            id="reset"
            aria-disabled={entityData.isLoading}
            disabled={entityData.isLoading}
            data-module="govuk-button"
            onClick={() => {
              checkBoxRefs.current.forEach((r) => {
                if (r) {
                  // eslint-disable-next-line no-param-reassign
                  r.checked = false;
                }
              });
              setSelectedColumns([]);
            }}
            className={`govuk-button govuk-button--secondary ${
              entityData.isLoading ? 'govuk-button--disabled' : ''
            }`}
          >
            {t('pages.data.list.actions.clear')}
          </button>
        </div>

        <div className="govuk-grid-column-three-quarters">
          <div>
            {selectedColumns.length !== appliedColumns.length ? (
              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">
                  !
                </span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  {t('pages.data.list.not-applied-fields')}
                </strong>
              </div>
            ) : null}
          </div>
          <div>
            {selectedColumns.length === 0 && entityData.data.length === 0 ? (
              <div className="govuk-grid-row" id="columnWarning">
                <div className="govuk-grid-column-full">
                  <div className="govuk-warning-text">
                    <span className="govuk-warning-text__icon" aria-hidden="true">
                      !
                    </span>
                    <strong className="govuk-warning-text__text">
                      <span className="govuk-warning-text__assistive">Warning</span>
                      {t('pages.data.list.requires-columns')}
                    </strong>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {appliedColumns.map((g) => {
            if (!g.label) {
              return null;
            }
            return (
              <strong
                key={uuidv4()}
                className="govuk-tag govuk-tag--green govuk-!-margin-bottom-3 govuk-!-margin-left-1"
              >
                {g.label}
              </strong>
            );
          })}
          <hr className="govuk-section-break govuk-section-break--visible" />

          {entityData.data.length !== 0 ? (
            <DownloadToCSV
              entity={entityId}
              appliedColumns={appliedColumns}
              /* eslint-disable-next-line radix */
              count={Number.parseInt(entityData.total)}
            />
          ) : null}
          <ul className="govuk-list">
            <InfiniteScroll
              next={() => {
                loadNext(entityData.page + 10);
              }}
              dataLength={entityData.data.length}
              hasMore={appliedColumns.length !== 0 && entityData.data.length < count}
              height={700}
              loader={
                <h5 id="loading-text" className="govuk-heading-s govuk-!-margin-top-3">
                  {t('pages.data.loading', { entity: entityId })}
                </h5>
              }
              endMessage={
                <h5 id="no-more-data" className="govuk-heading-s govuk-!-margin-top-3">
                  {t('pages.data.no-more-data', { entity: entityId })}
                </h5>
              }
            >
              {entityData.data.map((data) => (
                <li key={uuidv4()}>
                  <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                      <Card>
                        <dl className="govuk-summary-list govuk-summary-list--no-border">
                          {appliedColumns.map((c) => {
                            if (!c.label) {
                              return null;
                            }
                            return (
                              <div className="govuk-summary-list__row" key={uuidv4()}>
                                <dt className="govuk-summary-list__key">{`${c.label}:`}</dt>
                                <dd className="govuk-summary-list__value">
                                  {resolveData(data[c.key])}
                                </dd>
                              </div>
                            );
                          })}
                          <div className="govuk-summary-list__row" key={uuidv4()}>
                            <dt className="govuk-summary-list__key" />
                            <dd className="govuk-summary-list__value">
                              <a
                                href={`/schema/${entityId}/data/${data[businessKey.key]}/pkName/${
                                  businessKey.key
                                }`}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  await navigation.navigate(
                                    `/schema/${entityId}/data/${data[businessKey.key]}/pkName/${
                                      businessKey.key
                                    }`
                                  );
                                }}
                                className="govuk-link govuk-link--no-visited-state"
                              >
                                {t('pages.data.view')}
                              </a>
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    </div>
                  </div>
                </li>
              ))}
            </InfiniteScroll>
          </ul>
        </div>
      </div>
    </>
  );
};

DataListPage.propTypes = {
  entityId: PropTypes.string.isRequired,
};
export default DataListPage;
