import {
  map, mount, route,
} from 'navi';

import { withAuthentication } from '../routes/utils';

const routes = mount({
  '/': map((request, context) => withAuthentication(route({
    title: context.t('pages.data.list.title'),
    getView: () => import('../data/list/DataListPage'),
  }))),

});

export default routes;
