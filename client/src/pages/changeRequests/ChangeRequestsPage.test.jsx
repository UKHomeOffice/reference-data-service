import React from 'react';
import { shallow } from 'enzyme';
import ChangeRequestsPage from './ChangeRequestsPage';

describe('ChangeRequestsPage', () => {
  it('renders without crashing', () => {
    shallow(<ChangeRequestsPage />);
  });
});
