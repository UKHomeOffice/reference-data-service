import React, { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Formio } from 'react-formio';
import { useKeycloak } from '@react-keycloak/web';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-extraneous-dependencies
import FormioUtils from 'formiojs/utils';
import { useAxios } from '../../../../utils/hooks';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';
import { augmentRequest, interpolate } from '../../../../utils/formioSupport';
import FileService from '../../../../utils/FileService';
import { getDescription } from '../../../../utils/dataUtil';
import { AlertContext } from '../../../../utils/AlertContext';

const EditData = ({
  entityId,
  dataId,
  definition,
  businessKey,
  handleOnSubmit,
  processName,
  formName,
  handleCancel,
  titleKey,
  submissionSuccessKey,
}) => {
  const formRef = useRef();
  const { t } = useTranslation();
  const axiosInstance = useAxios();
  const [keycloak] = useKeycloak();
  const [submitting, setSubmitting] = useState(false);
  const { setAlertContext } = useContext(AlertContext);

  const [formDefinition, setFormDefinition] = useState({
    isLoading: true,
    isFailed: false,
  });

  const [data, setData] = useState({
    isLoading: true,
    isFailed: false,
  });

  const fileService = new FileService(keycloak);

  const submitForm = (editData) => {
    setSubmitting(true);
    const variables = {
      status: {
        value: 'SUBMITTED',
        type: 'string',
      },
      entity: {
        value: entityId,
        type: 'string',
      },
      dataId: {
        value: dataId,
        type: 'string',
      },
      dataOwner: {
        type: 'string',
        value: definition.owner,
      },
      [formDefinition.name]: {
        value: JSON.stringify(editData),
        type: 'json',
      },
    };
    axiosInstance({
      method: 'POST',
      url: `/camunda/engine-rest/process-definition/key/${processName}/start`,
      data: {
        variables,
        businessKey: editData.businessKey,
      },
    })
      .then(() => {
        setAlertContext({
          type: 'form-submission',
          status: 'successful',
          message: t(submissionSuccessKey),
          reference: `${editData.businessKey}`,
        });
        setSubmitting(false);
        handleOnSubmit();
      })
      .catch(() => {
        setSubmitting(false);
      });
  };

  useEffect(() => {
    const loadFormDefinition = () => {
      return axiosInstance({
        method: 'GET',
        url: `/form/name/${formName}`,
      });
    };

    const loadData = () => {
      return axiosInstance({
        method: 'GET',
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
        },
        params: {
          and: `(or(validfrom.is.null,validfrom.lt.${moment().toISOString()}),or(validto.is.null,validto.gt.${moment().toISOString()}))`,
        },
        url: `/refdata/${entityId}?${businessKey}=eq.${dataId}`,
      });
    };

    if (axiosInstance) {
      Promise.all([loadFormDefinition(), loadData()])
        .then((values) => {
          setFormDefinition({
            isLoading: false,
            isFailed: false,
            ...values[0].data,
          });
          setData({
            isLoading: false,
            failed: false,
            ...values[1].data,
          });
        })
        .catch(() => {
          setData({
            isLoading: false,
            failed: true,
          });
          setFormDefinition({
            isLoading: false,
            isFailed: true,
          });
        });
    }
  }, [axiosInstance, setFormDefinition, businessKey, dataId, entityId, formName, processName]);

  if (formDefinition.isLoading && data.isLoading) {
    return <ApplicationSpinner />;
  }

  const host = `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ''
  }`;

  /* istanbul ignore next */
  Formio.baseUrl = host;
  Formio.projectUrl = host;
  Formio.plugins = [augmentRequest(keycloak, formDefinition.id)];

  const businessKeyComponent = FormioUtils.getComponent(data.components, 'businessKey');
  interpolate(data, {
    keycloakContext: {
      accessToken: keycloak.token,
      refreshToken: keycloak.refreshToken,
      sessionId: keycloak.tokenParsed.session_state,
      email: keycloak.tokenParsed.email,
      givenName: keycloak.tokenParsed.given_name,
      familyName: keycloak.tokenParsed.family_name,
      subject: keycloak.subject,
      url: keycloak.authServerUrl,
      realm: keycloak.realm,
      roles: keycloak.tokenParsed.realm_access.roles,
      groups: keycloak.tokenParsed.groups,
    },
    businessKey: businessKeyComponent ? businessKeyComponent.defaultValue : null,
  });

  return !formDefinition.isFailed && !data.isFailed ? (
    <>
      <h2 className="govuk-heading-l">{t(titleKey)}</h2>
      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Form
            ref={formRef}
            form={formDefinition}
            submission={{
              data: {
                properties: definition.properties
                  ? Object.keys(definition.properties).map((k) => {
                    if (k === 'validto' || k === 'validfrom') {
                      return {
                        property: {
                          label: getDescription(k, definition).label,
                          [k]: data[k],
                          key: k,
                          originalValue: data[k],
                        },
                      };
                    }
                    return {
                      property: {
                        label: getDescription(k, definition).label,
                        key: k,
                        value: data[k],
                        originalValue: data[k],
                      },
                    };
                  })
                  : [],
              },
            }}
            onNextPage={() => {
              window.scrollTo(0, 0);
            }}
            onPrevPage={() => {
              window.scrollTo(0, 0);
            }}
            onSubmit={(editData) => {
              if (!submitting) {
                submitForm(editData.data);
              }
            }}
            onError={(errors) => {
              setAlertContext({
                type: 'form-error',
                errors,
                form: formRef.current,
              });
            }}
            options={{
              breadcrumbSettings: {
                clickable: false,
              },
              noAlerts: true,
              fileService,
              readOnly: submitting,
              hooks: {
                beforeCancel: async () => {
                  handleCancel();
                },
                buttonSettings: {
                  showCancel: true,
                },
                beforeSubmit: (submission, next) => {
                  const { versionId, id, title, name } = formDefinition;
                  // eslint-disable-next-line no-param-reassign
                  submission.data.form = {
                    formVersionId: versionId,
                    formId: id,
                    title,
                    name,
                    submissionDate: new Date(),
                    submittedBy: keycloak.tokenParsed.email,
                  };
                  next();
                },
              },
            }}
          />
        </div>
      </div>
    </>
  ) : null;
};

EditData.defaultProps = {
  handleCancel: () => {},
  submissionSuccessKey: 'pages.data.edit.submission-success',
  titleKey: 'pages.data.edit.title',
};

EditData.propTypes = {
  submissionSuccessKey: PropTypes.string,
  titleKey: PropTypes.string,
  processName: PropTypes.string.isRequired,
  formName: PropTypes.string.isRequired,
  handleCancel: PropTypes.func,
  handleOnSubmit: PropTypes.func.isRequired,
  businessKey: PropTypes.string.isRequired,
  definition: PropTypes.shape({
    properties: PropTypes.shape({}),
  }).isRequired,
  entityId: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
};

export default EditData;
