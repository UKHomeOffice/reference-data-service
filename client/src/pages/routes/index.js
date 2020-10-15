import { lazy, map, mount, redirect, route } from 'navi';

import React from 'react';
import { withAuthentication } from './utils';
import Home from '../home';
import NewDataSetPage from '../data/new/NewDataSetPage';
import ChangeRequestsPage from '../changeRequests/ChangeRequestsPage';

const routes = mount({
  '/': map((request, context) =>
    withAuthentication(
      route({
        title: context.t('pages.home.title'),
        getView: () => import('../../pages/home'),
      })
    )
  ),
  '/schema/:id': map((request, context) =>
    withAuthentication(
      route({
        title: context.t('pages.home.title'),
        getView: () => <Home entity={request.params.id} />,
      })
    )
  ),
  '/dataset/new': map((request, context) =>
    withAuthentication(
      route({
        title: context.t('pages.new-dataset.title'),
        getView: () => <NewDataSetPage />,
      })
    )
  ),
  '/change-requests': map((request, context) =>
    withAuthentication(
      route({
        title: context.t('pages.change-requests.title'),
        getView: () => <ChangeRequestsPage />,
      })
    )
  ),
  '/schema/:id/data': lazy(() => import('../data/routes')),
  '/logout': map((request, context) =>
    withAuthentication(
      route({
        title: context.t('logout'),
        getView: () => import('../../components/header/Logout'),
      })
    )
  ),
  '/login': map(async (request, context) =>
    context.isAuthenticated
      ? redirect(request.params.redirectTo ? decodeURIComponent(request.params.redirectTo) : '/')
      : lazy(() => import('../../components/Login'))
  ),
});

export default routes;
