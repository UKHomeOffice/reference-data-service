import { map, mount, route } from 'navi';

import React from 'react';
import { withAuthentication } from '../routes/utils';
import DataListPage from './list/DataListPage';
import DataPage from './view/DataPage';

const routes = mount({
  '/': map((request, context) =>
    withAuthentication(
      route({
        title: context.t('pages.data.list.title'),
        // eslint-disable-next-line react/jsx-filename-extension
        getView: () => <DataListPage entityId={request.params.id} />,
      })
    )
  ),
  '/:dataId': map((request, context) =>
    withAuthentication(
      route({
        title: context.t('pages.data.view-record', {
          entity: request.params.id,
          dataId: request.params.dataId,
        }),
        getView: () => <DataPage entityId={request.params.id} dataId={request.params.dataId} />,
      })
    )
  ),
});

export default routes;
