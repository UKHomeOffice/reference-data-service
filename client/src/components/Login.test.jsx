import React from 'react';
import { shallow, mount } from 'enzyme';
import { Login } from './Login';
import { mockLogin } from '../setupTests';

describe('Login', () => {
  it('renders without crashing', () => {
    shallow(<Login />);
  });
  it('displays login button', async () => {
    const wrapper = await mount(<Login />);
    expect(wrapper.find('button').length).toBe(1);
  });

  it('keycloak login on button click', async () => {
    const wrapper = await mount(<Login />);
    const button = wrapper.find('button').at(0);
    button.simulate('click');
    expect(mockLogin).toBeCalled();
  });
});
