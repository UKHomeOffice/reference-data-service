import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formio, Form } from 'react-formio';
import gds from '@digitalpatterns/formio-gds-template';
import { useKeycloak } from '@react-keycloak/web';
import _ from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import FormioUtils from 'formiojs/utils';
import { useNavigation } from 'react-navi';
import config from 'react-global-configuration';
import FileService from '../../../utils/FileService';
import { augmentRequest, interpolate } from '../../../utils/formioSupport';
import { useAxios } from '../../../utils/hooks';
import ApplicationSpinner from '../../../components/ApplicationSpinner';
import { AlertContext } from '../../../utils/AlertContext';
import './NewDataSetPage.scss';

Formio.use(gds);

const NewDataSetPage = () => {
  const { t } = useTranslation();
  const [keycloak] = useKeycloak();
  const axiosInstance = useAxios();
  const { alertContext, setAlertContext } = useContext(AlertContext);
  const formRef = useRef();
  const [submissionData, setSubmissionData] = useState({});
  const navigation = useNavigation();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    isLoading: true,
    data: {},
  });
  const host = `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ''
  }`;

  /* istanbul ignore next */
  Formio.baseUrl = host;
  Formio.projectUrl = host;
  Formio.plugins = [augmentRequest(keycloak, form.id)];
  const fileService = new FileService(keycloak);

  const submitDataSetRequest = useCallback(() => {
    setSubmitting(true);
    const variables = {
      status: {
        value: 'SUBMITTED',
        type: 'string',
      },
      [form.data.name]: {
        value: JSON.stringify(submissionData.data),
        type: 'json',
      },
    };
    axiosInstance({
      method: 'POST',
      url: `/camunda/engine-rest/process-definition/key/${config.get(
        'processes.newDataSetProcess'
      )}/start`,
      data: {
        variables,
        businessKey: submissionData.data.businessKey,
      },
    })
      .then(async () => {
        setAlertContext({
          type: 'form-submission',
          status: 'successful',
          message: t('pages.new-dataset.submission-success'),
          reference: `${submissionData.data.businessKey}`,
        });
        setSubmitting(false);
        await navigation.navigate('/change-requests');
      })
      .catch(() => {
        setSubmitting(false);
      });
  }, [
    axiosInstance,
    navigation,
    setSubmitting,
    form.data.name,
    setAlertContext,
    t,
    submissionData.data,
  ]);

  useEffect(() => {
    if (axiosInstance) {
      axiosInstance({
        method: 'GET',
        url: `/form/name/${config.get('newDataSetForm')}`,
      })
        .then((response) => {
          setForm({
            isLoading: false,
            data: response.data,
          });
        })
        .catch(() => {
          setForm({
            isLoading: false,
            data: {},
          });
        });
    }
  }, [axiosInstance]);

  const validate = (formInstance, data) => {
    if (!formInstance || !alertContext) {
      return;
    }
    let instance;
    // eslint-disable-next-line no-underscore-dangle
    if (formInstance._form.display === 'wizard') {
      instance = formInstance.currentPage;
    } else {
      instance = formInstance;
    }

    if (instance && instance.isValid(data.value, true)) {
      setAlertContext(null);
    } else {
      const errors = _.filter(
        alertContext.errors,
        (error) => data.changed && error.component.key !== data.changed.component.key
      );

      if (errors.length === 0) {
        setAlertContext(null);
      } else {
        setAlertContext({
          type: 'form-error',
          errors,
          form: formRef.current,
        });
      }
    }
  };

  const renderForm = () => {
    if (Object.keys(form.data).length === 0) {
      return null;
    }
    return (
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Form
            ref={formRef}
            form={form.data}
            onNextPage={() => {
              window.scrollTo(0, 0);
            }}
            onPrevPage={() => {
              window.scrollTo(0, 0);
            }}
            onChange={(data) => {
              setSubmissionData(data);
              if (formRef.current) {
                validate(formRef.current.formio, data);
              }
            }}
            onSubmit={() => {
              submitDataSetRequest();
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
              readOnly: submitting,
              noAlerts: true,
              fileService,
              hooks: {
                beforeCancel: async () => {
                  await navigation.navigate('/');
                },
                buttonSettings: {
                  showCancel: true,
                },
                beforeSubmit: (submission, next) => {
                  const { versionId, id, title, name } = form;
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
    );
  };

  if (!form.isLoading) {
    const businessKeyComponent = FormioUtils.getComponent(form.data.components, 'businessKey');
    interpolate(form.data, {
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
  }
  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">{t('pages.new-dataset.title')}</h2>
        </div>
      </div>

      {form.isLoading ? <ApplicationSpinner /> : renderForm()}
    </>
  );
};

export default NewDataSetPage;
