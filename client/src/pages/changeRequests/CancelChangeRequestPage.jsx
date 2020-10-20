import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useNavigation } from 'react-navi';
import { useKeycloak } from '@react-keycloak/web';
import ApplicationSpinner from '../../components/ApplicationSpinner';
import { useAxios } from '../../utils/hooks';
import ChangeRequest from './components/ChangeRequest';

const CancelChangeRequestPage = ({ id }) => {
  const axiosInstance = useAxios();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [keycloak] = useKeycloak();
  const [request, setRequest] = useState({
    isLoading: true,
    data: {},
  });
  const [reason, setReason] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const cancel = useCallback(() => {
    setSubmitting(true);
    axiosInstance({
      method: 'POST',
      url: '/camunda/engine-rest/message',
      data: {
        messageName: 'cancel-request',
        businessKey: request.data.businessKey,
        processInstanceId: request.data.id,
        processVariables: {
          submittedBy: {
            value: keycloak.tokenParsed.email,
            type: 'string',
          },
          reason: {
            value: reason,
            type: 'string',
          },
        },
      },
    })
      .then(async () => {
        setSubmitting(false);
        await navigation.navigate('/change-requests');
      })
      .catch(() => {
        setSubmitting(false);
      });
  }, [axiosInstance, navigation, request, reason, keycloak.tokenParsed.email, setSubmitting]);

  useEffect(() => {
    const fetchInstance = async () => {
      if (axiosInstance) {
        try {
          const response = await axiosInstance({
            method: 'GET',
            url: `/camunda/engine-rest/history/process-instance/${id}`,
          });

          const variableResponses =
            response.data.length !== 0
              ? await axiosInstance({
                  method: 'GET',
                  url: '/camunda/engine-rest/variable-instance',
                  params: {
                    deserializeValues: false,
                    processInstanceIdIn: id,
                  },
                })
              : {
                  data: [],
                };
          const processInstance = response.data;

          setRequest({
            isLoading: false,
            data: {
              ...processInstance,
              variables: variableResponses.data.map((v) => ({
                type: v.type,
                valueInfo: v.valueInfo,
                id: v.id,
                name: v.name,
                value: v.type === 'Json' ? JSON.parse(v.value) : v.value,
              })),
            },
          });
        } catch (e) {
          setRequest({
            isLoading: false,
            data: {},
          });
        }
      }
    };

    fetchInstance();
  }, [axiosInstance, setRequest, id]);

  if (request.isLoading) {
    return <ApplicationSpinner />;
  }

  return (
    <>
      <span className="govuk-caption-l">Cancel request</span>
      <h2 className="govuk-heading-l">
        {request.data.processDefinitionName} ({request.data.businessKey})
      </h2>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <ChangeRequest
            request={request.data}
            cancelComponent={
              <>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    {t('pages.change-requests.labels.reason')}
                  </dt>
                  <dd className="govuk-summary-list__value">
                    <div id="reason-hint" className="govuk-hint">
                      {t('pages.change-requests.labels.reason-hint')}
                    </div>
                    <textarea
                      className="govuk-textarea"
                      id="reason"
                      name="reason"
                      rows="5"
                      onChange={(e) => {
                        setReason(e.target.value);
                      }}
                      aria-describedby="more-detail-hint"
                    />
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key" />
                  <dd className="govuk-summary-list__value">
                    <button
                      data-module="govuk-button"
                      type="button"
                      disabled={!reason || reason === '' || submitting}
                      onClick={cancel}
                      className="govuk-button govuk-button--warning govuk-!-margin-bottom-0"
                    >
                      {t('pages.change-requests.labels.actions.cancel')}
                    </button>
                  </dd>
                </div>
              </>
            }
          />
        </div>
      </div>
    </>
  );
};

CancelChangeRequestPage.propTypes = {
  id: PropTypes.string.isRequired,
};

export default CancelChangeRequestPage;
