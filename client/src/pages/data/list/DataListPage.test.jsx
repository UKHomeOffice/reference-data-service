import { shallow } from 'enzyme';
import React from 'react';
import DataListPage from './DataListPage';

describe('DataListPage', () => {
  it('renders without crashing', () => {
    shallow(<DataListPage />);
  });
});
