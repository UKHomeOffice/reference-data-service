import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { JSONPath } from 'jsonpath-plus';
import _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useAxios } from '../../../utils/hooks';
import DownloadToCSV from './components/DownloadToCSV';

const DataListPage = ({ entityId }) => {
  const { t } = useTranslation();
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [appliedColumns, setAppliedColumns] = useState([]);

  const checkBoxRefs = useRef([]);
  const [definition, setDefinition] = useState({
    properties: {},
    description: '{}',
  });
  const [count, setCount] = useState(0);
  const [entityData, setEntityData] = useState({
    isLoading: false,
    data: [],
    page: 0,
    total: 0,
  });
  const axiosInstance = useAxios();

  useEffect(() => {
    const loadDefinition = async () => {
      if (axiosInstance) {
        try {
          const response = await axiosInstance('/refdata');
          setDefinition(
            JSONPath({
              path: `$.definitions['${entityId}']`,
              json: response.data,
            })[0],
          );

          const countResponse = await axiosInstance({
            method: 'GET',
            url: `/refdata/${entityId}`,
            params: {
              limit: 1,
              offset: 0,
              select: 'id',
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
      axiosInstance({
        method: 'GET',
        url: `/refdata/${entityId}`,
        params: {
          limit: 10,
          offset: page,
          order: 'id.asc',
          select: selectedColumns.map((col) => col.key).toString(),
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
    [axiosInstance, entityData, setEntityData, entityId, selectedColumns],
  );

  const loadData = useCallback(() => {
    setEntityData({
      ...entityData,
      isLoading: true,
    });
    axiosInstance({
      method: 'GET',
      url: `/refdata/${entityId}`,
      params: {
        limit: 10,
        offset: 0,
        order: 'id.asc',
        select: selectedColumns.map((col) => col.key).toString(),
      },
      headers: {
        Prefer: 'count=exact',
      },
    })
      .then((response) => {
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
  }, [axiosInstance, setEntityData, entityData, selectedColumns, entityId, setAppliedColumns]);

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
                  const { description } = definition.properties[k];
                  let parsed = description.replace(/(?:\r\n|\r|\n)/g, '');
                  if (parsed.indexOf('Note') !== -1) {
                    parsed = parsed.substring(0, parsed.indexOf('Note'));
                  }
                  const obj = JSON.parse(parsed);
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
                              }),
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
          {appliedColumns.map((g) => (
            <strong
              key={uuidv4()}
              className="govuk-tag govuk-tag--green govuk-!-margin-bottom-3 govuk-!-margin-left-1"
            >
              {g.label}
            </strong>
          ))}
          <hr className="govuk-section-break govuk-section-break--visible" />

          {entityData.data.length !== 0 ? (
            <DownloadToCSV
              entity={entityId}
              appliedColumns={appliedColumns}
              count={entityData.total}
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
              loader={(
                <h5 id="loading-text" className="govuk-heading-s govuk-!-margin-top-3">
                  {t('pages.data.loading', { entity: entityId })}
                </h5>
              )}
              endMessage={(
                <h5 id="no-more-data" className="govuk-heading-s govuk-!-margin-top-3">
                  {t('pages.data.no-more-data', { entity: entityId })}
                </h5>
              )}
            >
              {entityData.data.map((data) => (
                <li key={uuidv4()}>
                  <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                      <Card>
                        <dl className="govuk-summary-list govuk-summary-list--no-border">
                          {appliedColumns.map((c) => (
                            <div className="govuk-summary-list__row" key={uuidv4()}>
                              <dt className="govuk-summary-list__key">{`${c.label}:`}</dt>
                              <dd className="govuk-summary-list__value">
                                {resolveData(data[c.key])}
                              </dd>
                            </div>
                          ))}
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

const ScrollWrapper = styled.div`
  max-height: 600px;
  overflow: auto;
`;

const Card = styled.div`
  border-bottom: 3px solid #005ea5;
  box-sizing: border-box;
`;
DataListPage.propTypes = {
  entityId: PropTypes.string.isRequired,
};
export default DataListPage;
