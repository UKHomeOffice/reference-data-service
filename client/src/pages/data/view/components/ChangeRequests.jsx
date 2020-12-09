import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { v4 as uuidv4 } from 'uuid';
import { useNavigation } from 'react-navi';
import _ from 'lodash';
import { Form } from 'react-formio';
import config from 'react-global-configuration';
import { useAxios } from '../../../../utils/hooks';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';
import { transform } from '../../../../utils/dataUtil';
import ChangeRequest from '../../../changeRequests/components/ChangeRequest';

const editFormName = config.get('forms.editDataRowForm');
const deleteFormName = config.get('forms.deleteDataRowForm');

const ChangeRequests = ({
  dataId,
  entityId,
  definition,
  businessKey,
  editDataRowProcess,
  count,
  deleteDataRowProcess,
}) => {
  const axiosInstance = useAxios();
  const navigation = useNavigation();
  const [viewChangeRequest, setViewChangeRequest] = useState();

  const { t } = useTranslation();
  const [changeRequests, setChangeRequests] = useState({
    isLoading: true,
    isFailed: false,
    total: count,
    page: 0,
    requests: [],
  });

  const [form, setForm] = useState({
    isLoading: false,
  });

  useEffect(() => {
    if (viewChangeRequest) {
      setForm({
        isLoading: true,
      });

      const formValue = _.find(viewChangeRequest.variables, (v) => {
        return v.name === editFormName || v.name === deleteFormName;
      });
      if (formValue) {
        axiosInstance({
          url: `/form/version/${formValue.value.form.formVersionId}`,
          method: 'GET',
        })
          .then((response) => {
            setForm({
              isLoading: false,
              submission: formValue.value,
              ...response.data.schema,
            });
          })
          .catch(() => {
            setForm({
              isLoading: false,
            });
          });
      }
    }
  }, [viewChangeRequest, axiosInstance]);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const changeResponses = await axiosInstance({
          url: '/camunda/engine-rest/history/process-instance',
          method: 'GET',
          params: {
            firstResult: 0,
            maxResults: 10,
            sortBy: 'startTime',
            sortOrder: 'desc',
            processDefinitionKeyIn: `${editDataRowProcess},${deleteDataRowProcess}`,
            variables: `entity_eq_${entityId},dataId_eq_${dataId}`,
          },
        });

        const processInstanceIds = changeResponses.data
          ? changeResponses.data.map((instance) => {
            return instance.id;
          })
          : [];

        const variablesResponse = await axiosInstance({
          method: 'GET',
          url: '/camunda/engine-rest/history/variable-instance',
          params: {
            deserializeValues: false,
            processInstanceIdIn: processInstanceIds.toString(),
          },
        });

        setChangeRequests({
          isLoading: false,
          isFailed: false,
          page: 0,
          total: count,
          requests: transform(changeResponses.data, variablesResponse.data),
        });
      } catch (e) {
        setChangeRequests({
          isLoading: false,
          isFailed: true,
          page: 0,
          total: 0,
          requests: [],
        });
      }
    };

    if (axiosInstance) {
      loadRequest().then(() => {});
    }
  }, [
    axiosInstance,
    dataId,
    entityId,
    definition,
    businessKey,
    editDataRowProcess,
    deleteDataRowProcess,
    count,
  ]);

  const loadNext = useCallback(
    async (page) => {
      const changeResponses = await axiosInstance({
        url: '/camunda/engine-rest/history/process-instance',
        method: 'GET',
        params: {
          firstResult: page,
          maxResults: 10,
          sortBy: 'startTime',
          sortOrder: 'desc',
          processDefinitionKeyIn: `${editDataRowProcess},${deleteDataRowProcess}`,
          variables: `entity_eq_${entityId},dataId_eq_${dataId}`,
        },
      });

      const processInstanceIds = changeResponses.data
        ? changeResponses.data.map((instance) => {
          return instance.id;
        })
        : [];

      const nextVariablesResponse = await axiosInstance({
        method: 'GET',
        url: '/camunda/engine-rest/history/variable-instance',
        params: {
          deserializeValues: false,
          processInstanceIdIn: processInstanceIds.toString(),
        },
      });

      setChangeRequests({
        ...changeRequests,
        requests: _.concat(
          changeRequests.requests,
          transform(changeResponses.data, nextVariablesResponse.data)
        ),
      });
    },
    [
      axiosInstance,
      changeRequests,
      setChangeRequests,
      dataId,
      deleteDataRowProcess,
      editDataRowProcess,
      entityId,
    ]
  );

  const renderForm = (data) => {
    if (viewChangeRequest && viewChangeRequest.id === data.id) {
      if (form.isLoading) {
        return <div>{t('loading')}</div>;
      }
      return (
        <>
          <h3 className="govuk-heading-m">{form.title}</h3>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
          <Form
            form={form}
            submission={{
              data: form.submission,
            }}
            options={{
              readOnly: true,
            }}
          />
        </>
      );
    }
    return (
      <button
        className="govuk-button"
        id="viewForm"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setViewChangeRequest(data);
        }}
      >
        {t('pages.data.view')}
      </button>
    );
  };

  if (changeRequests.isLoading) {
    return <ApplicationSpinner />;
  }

  const { requests, page } = changeRequests;

  return (
    <>
      <span className="govuk-caption-l">
        {t('pages.data.change-requests.summary', { entity: entityId, dataId })}
      </span>
      <h2 className="govuk-heading-l">
        {' '}
        {t('pages.data.change-requests.size.keyWithCount', { count })}
      </h2>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <ul className="govuk-list">
            <InfiniteScroll
              next={async () => {
                await loadNext(page + 10);
              }}
              dataLength={requests.length}
              hasMore={requests.length < count}
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
              {requests.map((data) => (
                <li key={uuidv4()}>
                  <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                      <ChangeRequest
                        request={data}
                        viewRequest={
                          <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">{renderForm(data)}</div>
                          </div>
                        }
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

ChangeRequests.propTypes = {
  count: PropTypes.number.isRequired,
  editDataRowProcess: PropTypes.string.isRequired,
  deleteDataRowProcess: PropTypes.string.isRequired,
  businessKey: PropTypes.string.isRequired,
  definition: PropTypes.shape({
    properties: PropTypes.shape({}),
  }).isRequired,
  entityId: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
};

export default ChangeRequests;
