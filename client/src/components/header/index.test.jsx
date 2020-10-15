import React from 'react';
import { shallow, mount } from 'enzyme';
import Header from './index';
import { mockNavigate, mockGetCurrentValue } from '../../setupTests';

describe('Header', () => {
  beforeEach(() => {
    mockGetCurrentValue.mockImplementation(() => ({
      url: {
        pathname: 'test',
      },
    }));
  });
  it('renders without crashing', () => {
    shallow(<Header />);
  });

  it('can click logout', () => {
    const wrapper = mount(<Header />);
    wrapper.find('a[id="logout"]').at(0).simulate('click');
    expect(mockNavigate).toBeCalledWith('/logout');
  });
  it('can click home', () => {
    const wrapper = mount(<Header />);
    wrapper.find('a[id="home"]').at(0).simulate('click');
    expect(mockNavigate).toBeCalledWith('/');
  });

  it('can click dataset', () => {
    const wrapper = mount(<Header />);
    wrapper.find('a[id="dataset"]').at(0).simulate('click');
    expect(mockNavigate).toBeCalledWith('/');
  });
  it('can click new data set', () => {
    const wrapper = mount(<Header />);
    wrapper.find('a[id="newDataSet"]').at(0).simulate('click');
    expect(mockNavigate).toBeCalledWith('/dataset/new');
  });

  it('can click change requests', () => {
    const wrapper = mount(<Header />);
    wrapper.find('a[id="change-requests"]').at(0).simulate('click');
    expect(mockNavigate).toBeCalledWith('/change-requests');
  });
  it('new data set highlighted', () => {
    mockGetCurrentValue.mockImplementation(() => ({
      url: {
        pathname: '/dataset/new',
      },
    }));
    const wrapper = mount(<Header />);
    expect(wrapper.find('.govuk-header__navigation-item--active').at(0).exists()).toBe(true);
  });
  it('data set highlighted', () => {
    mockGetCurrentValue.mockImplementation(() => ({
      url: {
        pathname: '/schema',
      },
    }));
    const wrapper = mount(<Header />);
    expect(wrapper.find('.govuk-header__navigation-item--active').at(0).exists()).toBe(true);
  });
});
