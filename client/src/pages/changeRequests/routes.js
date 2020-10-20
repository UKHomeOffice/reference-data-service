import { map, mount, route } from 'navi';
import React from 'react';
import { withAuthentication } from '../routes/utils';
import ChangeRequestsPage from './ChangeRequestsPage';
import CancelChangeRequestPage from './CancelChangeRequestPage';

const routes = mount({
  '/': map((request, context) =>
    withAuthentication(
      route({
        title: context.t('pages.change-requests.title'),
        getView: () => <ChangeRequestsPage />,
      })
    )
  ),

  '/:id/cancel': map((request, context) =>
    withAuthentication(
      route({
        title: context.t('pages.change-requests.title'),
        getView: () => <CancelChangeRequestPage id={request.params.id} />,
      })
    )
  ),
});
export default routes;
