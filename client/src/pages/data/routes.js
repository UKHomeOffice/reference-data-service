import {
  map, mount, route,
} from 'navi';

import React from 'react';
import { withAuthentication } from '../routes/utils';
import DataListPage from './list/DataListPage';

const routes = mount({
  '/': map((request, context) => withAuthentication(route({
    title: context.t('pages.data.list.title'),
    getView: () => <DataListPage entityId={request.params.id} />,
  }))),

});

export default routes;
