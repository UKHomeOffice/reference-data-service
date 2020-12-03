import React from 'react';
import { shallow } from 'enzyme';
import DeleteData from './DeleteData';

describe('DeleteData', () => {
  it('renders without crashing', () => {
    shallow(<DeleteData />);
  });
});
