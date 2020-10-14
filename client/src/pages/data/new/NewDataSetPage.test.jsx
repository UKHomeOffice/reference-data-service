import React from 'react';
import { shallow } from 'enzyme';
import NewDataSetPage from './NewDataSetPage';

describe('NewDataSetPage', () => {
  it('renders without crashing', () => {
    shallow(<NewDataSetPage />);
  });
});
