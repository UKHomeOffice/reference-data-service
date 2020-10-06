import {
  lazy,
  map, mount, redirect, route,
} from 'navi';

import React from 'react';
import { withAuthentication } from './utils';
import Home from '../home';

const routes = mount({
  '/': map((request, context) => withAuthentication(route({
    title: context.t('pages.home.title'),
    getView: () => import('../../pages/home'),
  }))),
  '/entity/:id': map((request, context) => withAuthentication(route({
    title: context.t('pages.home.title'),
    getView: () => <Home entity={request.params.id} />,
  }))),
  '/logout': map((request, context) => withAuthentication(route({
    title: context.t('logout'),
    getView: () => import('../../components/header/Logout'),
  }))),
  '/login': map(async (request, context) => (context.isAuthenticated
    ? redirect(
      request.params.redirectTo
        ? decodeURIComponent(request.params.redirectTo)
        : '/',
    )
    : lazy(() => import('../../components/Login')))),
});

export default routes;
