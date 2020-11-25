import React from 'react';
import { shallow } from 'enzyme';
import DataPage from './DataPage';

describe('DataPage', () => {
  it('renders with crashing', () => {
    shallow(<DataPage entityId="test" dataId="test" />);
  });
});
