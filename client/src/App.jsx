import React, { Suspense } from 'react';
import './App.scss';
import { Router, View } from 'react-navi';
import HelmetProvider from 'react-navi-helmet';
import { useTranslation } from 'react-i18next';
import config from 'react-global-configuration';
import Keycloak from 'keycloak-js';
import { KeycloakProvider, useKeycloak } from '@react-keycloak/web';
import { initAll } from 'govuk-frontend';
import Layout from './components/layout';
import routes from './pages/routes';
import ApplicationSpinner from './components/ApplicationSpinner';

if (window.ENVIRONMENT_CONFIG) {
  config.set(window.ENVIRONMENT_CONFIG);
} else {
  config.set({
    authUrl: process.env.REACT_APP_AUTH_URL,
    authRealm: process.env.REACT_APP_AUTH_REALM,
    authClientId: process.env.REACT_APP_AUTH_CLIENT_ID,
    uiEnvironment: process.env.REACT_APP_UI_ENVIRONMENT,
    uiVersion: process.env.REACT_APP_UI_VERSION,
    serviceDeskUrl: process.env.REACT_APPP_SERVICE_DESK_URL,
    forms: {
      newDataSetForm: process.env.REACT_APP_NEW_DATA_SET_FORM,
      editDataSetForm: process.env.REACT_APP_EDIT_DATA_ROW_FORM,
    },
    processes: {
      newDataSetProcess: process.env.REACT_APP_NEW_DATA_SET_PROCESS,
      deleteDataSetProcess: process.env.REACT_APP_DELETE_DATA_SET_PROCESS,
      addDataRowProcess: process.env.REACT_APP_NEW_DATA_ROW_PROCESS,
      editDataRowProcess: process.env.REACT_APP_EDIT_DATA_ROW_PROCESS,
      deleteDataRowProcess: process.env.REACT_APP_DELETE_DATA_ROW_PROCESS,
    },
  });
}

const keycloakInstance = new Keycloak({
  realm: config.get('authRealm'),
  url: config.get('authUrl'),
  clientId: config.get('authClientId'),
});
const keycloakProviderInitConfig = {
  onLoad: 'login-required',
  checkLoginIframe: false,
};

const RouterView = () => {
  const { t } = useTranslation();
  const [keycloak, initialized] = useKeycloak();
  if (!initialized) {
    return <ApplicationSpinner translationKey="keycloak.initialising" />;
  }
  initAll();
  return (
    <Router
      hashScrollBehavior="smooth"
      routes={routes}
      context={{ t, isAuthenticated: keycloak.authenticated }}
    >
      <Layout>
        <View />
      </Layout>
    </Router>
  );
};
const App = () => (
  <Suspense fallback={null}>
    <HelmetProvider>
      <KeycloakProvider keycloak={keycloakInstance} initConfig={keycloakProviderInitConfig}>
        <RouterView />
      </KeycloakProvider>
    </HelmetProvider>
  </Suspense>
);

export default App;
