import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { JSONPath } from 'jsonpath-plus';
import _ from 'lodash';
import styled from 'styled-components';
import { useAxios } from '../../../utils/hooks';

const DataListPage = ({ entityId }) => {
  const { t } = useTranslation();
  const [selectedColumns, setSelectedColumns] = useState([]);
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
          setDefinition(JSONPath({
            path: `$.definitions['${entityId}']`, json: response.data,
          })[0]);

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
        } catch (e) {
        }
      }
    };
    loadDefinition();
  }, [axiosInstance, setDefinition, entityId]);

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
    }).then((response) => {
      setEntityData({
        isLoading: false,
        data: response.data,
        page: 0,
        total: response.headers['content-range'].split('/')[1],
      });
    }).catch(() => {
      setEntityData({
        ...entityData,
      });
    });
  }, [axiosInstance, setEntityData, entityData, selectedColumns, entityId]);

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
              <h2 className="govuk-heading-l" id="countText">{count}</h2>
            </div>
          </div>
        </div>
      </div>
      <p className="govuk-body-l">
        {JSON.parse(definition.description).description}
      </p>
      {selectedColumns.length === 0
        ? (
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  {t('pages.data.list.requires-columns')}
                </strong>
              </div>
            </div>
          </div>
        )
        : null }
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <ScrollWrapper className="govuk-form-group">
            <fieldset className="govuk-fieldset" aria-describedby="waste-hint">

              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <h1 className="govuk-fieldset__heading">
                  {t('pages.data.list.select.columns')}
                </h1>
              </legend>
              <div id="waste-hint" className="govuk-hint">
                {t('pages.data.list.select.columns-all-that-apply')}
              </div>

              <div className="govuk-checkboxes govuk-!-margin-left-1 govuk-!-margin-top-1">
                {
                  Object.keys(definition.properties).map((k) => {
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
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedColumns(
                                _.concat(selectedColumns, {
                                  label: obj.label,
                                  key: k,
                                }),
                              );
                            } else {
                              setSelectedColumns(
                                _.filter(selectedColumns, (c) => c.key !== k),
                              );
                            }
                          }}
                          id={obj.label}
                          name={obj.label}
                          type="checkbox"
                          value={obj.label}
                        />
                        <label className="govuk-label govuk-checkboxes__label" htmlFor={obj.label}>
                          {obj.label}
                        </label>
                      </div>
                    );
                  })
                }
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
            className={`govuk-button ${entityData.isLoading ? 'govuk-button--disabled' : ''}`}
          >
            {t('pages.data.list.actions.load')}
          </button>
        </div>

        <div className="govuk-grid-column-three-quarters" />
      </div>
    </>
  );
};

const ScrollWrapper = styled.div`
  height: 600px;
  overflow: auto;
`;

DataListPage.propTypes = {
  entityId: PropTypes.string.isRequired,
};
export default DataListPage;
