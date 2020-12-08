import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from 'react-global-configuration';
import InfiniteScroll from 'react-infinite-scroll-component';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigation } from 'react-navi';
import { useAxios } from '../../utils/hooks';
import ChangeRequest from './components/ChangeRequest';
import { transform } from '../../utils/dataUtil';

const ChangeRequestsPage = () => {
  const { t } = useTranslation();
  const axiosInstance = useAxios();
  const navigation = useNavigation();
  const [keycloak] = useKeycloak();
  const [requests, setRequests] = useState({
    isLoading: true,
    data: [],
    total: 0,
    page: 0,
  });
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [selectedRequestTypes, setSelectedRequestTypes] = useState([]);
  const [userRequestsOnly, setUserRequestsOnly] = useState(false);

  useEffect(() => {
    const fetchDefinitions = async () => {
      if (axiosInstance) {
        const processDefinitionsResponse = await axiosInstance({
          method: 'GET',
          url: '/camunda/engine-rest/process-definition',
          params: {
            keysIn: Object.values(config.get('processes')).toString(),
            latestVersion: true,
          },
        });
        setProcessDefinitions(processDefinitionsResponse.data);
      }
    };
    fetchDefinitions();
  }, [axiosInstance, setProcessDefinitions]);
  useEffect(() => {
    const fetchRequests = async () => {
      if (axiosInstance) {
        try {
          const selectedTypes =
            selectedRequestTypes.length !== 0
              ? selectedRequestTypes
              : Object.values(config.get('processes'));

          const params = {
            processDefinitionKeyIn: selectedTypes.toString(),
            firstResult: 0,
            maxResults: 10,
            sortBy: 'startTime',
            sortOrder: 'desc',
          };

          if (userRequestsOnly) {
            params.startedBy = keycloak.tokenParsed.email;
          }

          const response = await axiosInstance({
            method: 'GET',
            url: '/camunda/engine-rest/history/process-instance',
            params,
          });
          const countResponse = await axiosInstance({
            method: 'GET',
            url: '/camunda/engine-rest/history/process-instance/count',
            params: {
              processDefinitionKeyIn: selectedTypes.toString(),
              startedBy: userRequestsOnly ? keycloak.tokenParsed.email : null,
            },
          });

          const variableResponses =
            response.data.length !== 0
              ? await axiosInstance({
                method: 'GET',
                url: '/camunda/engine-rest/history/variable-instance',
                params: {
                  deserializeValues: false,
                  processInstanceIdIn: response.data.map((p) => p.id).toString(),
                },
              })
              : {
                data: [],
              };

          setRequests({
            isLoading: false,
            data: transform(response.data, variableResponses.data),
            page: 0,
            total: countResponse.data.count,
          });
        } catch (e) {
          setRequests({
            isLoading: false,
            total: 0,
            data: [],
            page: 0,
          });
        }
      }
    };
    fetchRequests();
  }, [
    axiosInstance,
    setRequests,
    selectedRequestTypes,
    setProcessDefinitions,
    keycloak.tokenParsed.email,
    userRequestsOnly,
  ]);

  const loadNext = useCallback(
    async (page) => {
      try {
        const selectedTypes =
          selectedRequestTypes.length !== 0
            ? selectedRequestTypes
            : Object.values(config.get('processes'));

        const response = await axiosInstance({
          method: 'GET',
          url: '/camunda/engine-rest/history/process-instance',
          params: {
            processDefinitionKeyIn: selectedTypes.toString(),
            firstResult: page,
            maxResults: 10,
            sortBy: 'startTime',
            sortOrder: 'desc',
            startedBy: userRequestsOnly ? keycloak.tokenParsed.email : null,
          },
        });

        const nextVariablesResponse =
          response.data.length !== 0
            ? await axiosInstance({
              method: 'GET',
              url: '/camunda/engine-rest/history/variable-instance',
              params: {
                deserializeValues: false,
                processInstanceIdIn: response.data.map((p) => p.id).toString(),
              },
            })
            : {
              data: [],
            };

        setRequests({
          ...requests,
          data: _.concat(requests.data, transform(response.data, nextVariablesResponse.data)),
          page,
        });
        // eslint-disable-next-line no-empty
      } catch (e) {}
    },
    [
      axiosInstance,
      requests,
      setRequests,
      selectedRequestTypes,
      userRequestsOnly,
      keycloak.tokenParsed.email,
    ]
  );

  return (
    <>
      <span className="govuk-caption-l">{t('pages.change-requests.title')}</span>
      <h2 className="govuk-heading-l">
        {' '}
        {t('pages.change-requests.size.keyWithCount', { count: requests.total })}
      </h2>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h4 className="govuk-heading-s">
                {t('pages.change-requests.labels.filter.by-request-type')}
              </h4>
              <div className="govuk-checkboxes">
                {processDefinitions.map((p) => (
                  <div key={p.key} className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id={p.key}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRequestTypes(_.concat(selectedRequestTypes, [p.key]));
                        } else {
                          setSelectedRequestTypes(
                            _.filter(selectedRequestTypes, (k) => k !== p.key)
                          );
                        }
                      }}
                      name={p.key}
                      type="checkbox"
                      value={p.key}
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor={p.key}>
                      {p.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h4 className="govuk-heading-s">
                {t('pages.change-requests.labels.filter.by-requester')}
              </h4>
              <div className="govuk-radios">
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="all-requests"
                    name="requester"
                    defaultChecked
                    onChange={() => {
                      setUserRequestsOnly(false);
                    }}
                    type="radio"
                    value="false"
                  />
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label className="govuk-label govuk-radios__label" htmlFor="all-requests">
                    {t('pages.change-requests.labels.filter.all')}
                  </label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="your-requests-only"
                    name="requester"
                    type="radio"
                    value="true"
                    onChange={() => {
                      setUserRequestsOnly(true);
                    }}
                  />
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label className="govuk-label govuk-radios__label" htmlFor="your-requests-only">
                    {t('pages.change-requests.labels.filter.your-requests')}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="govuk-grid-column-three-quarters">
          <ul className="govuk-list">
            <InfiniteScroll
              next={async () => {
                await loadNext(requests.page + 10);
              }}
              dataLength={requests.data.length}
              hasMore={requests.data.length < requests.total}
              height={700}
              loader={
                <h5 id="loading-text" className="govuk-heading-s govuk-!-margin-top-3">
                  {t('pages.change-requests.loading.request')}
                </h5>
              }
              endMessage={
                <h5 id="no-more-data" className="govuk-heading-s govuk-!-margin-top-3">
                  {t('pages.change-requests.loading.no-more')}
                </h5>
              }
            >
              {requests.data.map((data) => (
                <li key={uuidv4()}>
                  <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                      <ChangeRequest
                        request={data}
                        cancelComponent={
                          <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">
                              {t('pages.change-requests.labels.actions.label')}
                            </dt>
                            <dd className="govuk-summary-list__value">
                              <button
                                id="cancel"
                                data-module="govuk-button"
                                type="button"
                                onClick={async () => {
                                  await navigation.navigate(`/change-requests/${data.id}/cancel`);
                                }}
                                className="govuk-button govuk-button--warning govuk-!-margin-bottom-0"
                              >
                                {t('pages.change-requests.labels.actions.cancel')}
                              </button>
                            </dd>
                          </div>
                        }
                      />
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

export default ChangeRequestsPage;
