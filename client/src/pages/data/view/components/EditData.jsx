import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import config from 'react-global-configuration';
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
import { getDescription } from '../../../../utils/schemaUtil';
import { AlertContext } from '../../../../utils/AlertContext';

const editDataRowProcess = config.get('processes.editDataRowProcess');
const formName = config.get('forms.editDataSetForm');

const EditData = ({ entityId, dataId, definition, businessKey, handleOnSubmit }) => {
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

  const submitForm = useCallback(
    (editData) => {
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
        [formDefinition.name]: {
          value: JSON.stringify(editData),
          type: 'json',
        },
      };
      axiosInstance({
        method: 'POST',
        url: `/camunda/engine-rest/process-definition/key/${editDataRowProcess}/start`,
        data: {
          variables,
          businessKey: editData.businessKey,
        },
      })
        .then(async () => {
          setAlertContext({
            type: 'form-submission',
            status: 'successful',
            message: t('pages.data.edit.submission-success'),
            reference: `${editData.businessKey}`,
          });
          setSubmitting(false);
          handleOnSubmit();
        })
        .catch(() => {
          setSubmitting(false);
        });
    },
    [axiosInstance, formDefinition.name, setAlertContext, t, handleOnSubmit, entityId, dataId]
  );

  useEffect(() => {
    const loadFormDefinition = async () => {
      if (axiosInstance) {
        try {
          const response = await axiosInstance({
            method: 'GET',
            url: `/form/name/${formName}`,
          });
          setFormDefinition({
            isLoading: false,
            isFailed: false,
            ...response.data,
          });
        } catch (e) {
          setFormDefinition({
            isLoading: false,
            isFailed: true,
          });
        }
      }
    };

    const loadData = () => {
      axiosInstance({
        method: 'GET',
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
        },
        params: {
          and: `(or(validfrom.is.null,validfrom.lt.${moment().toISOString()}),or(validto.is.null,validto.gt.${moment().toISOString()}))`,
        },
        url: `/refdata/${entityId}?${businessKey}=eq.${dataId}`,
      })
        .then((response) => {
          setData({
            isLoading: false,
            failed: false,
            ...response.data,
          });
        })
        .catch(() => {
          setData({
            isLoading: false,
            failed: true,
          });
        });
    };

    if (axiosInstance) {
      loadFormDefinition().then(() => {});
      loadData();
    }
  }, [axiosInstance, setFormDefinition, businessKey, dataId, entityId]);

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
      <h2 className="govuk-heading-l">{t('pages.data.edit.title')}</h2>
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
              submitForm(editData.data);
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
                beforeCancel: async () => {},
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

EditData.propTypes = {
  handleOnSubmit: PropTypes.func.isRequired,
  businessKey: PropTypes.string.isRequired,
  definition: PropTypes.shape({
    properties: PropTypes.shape({}),
  }).isRequired,
  entityId: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
};

export default EditData;
