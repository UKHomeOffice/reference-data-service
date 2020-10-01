import {
  map, mount, route,
} from 'navi';

import { withAuthentication } from './utils';

const routes = mount({
  '/': map((request, context) => withAuthentication(route({
    title: context.t('pages.home.title'),
    getView: () => import('../../pages/home'),
  }))),
  '/logout': map((request, context) => withAuthentication(route({
    title: context.t('logout'),
    getView: () => import('../../components/header/Logout'),
  }))),
});

export default routes;
