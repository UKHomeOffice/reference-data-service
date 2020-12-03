import React from 'react';
import { shallow } from 'enzyme';
import ChangeRequests from './ChangeRequests';

describe('ChangeRequests', () => {
  it('renders without crashing', () => {
    shallow(<ChangeRequests />);
  });
});
