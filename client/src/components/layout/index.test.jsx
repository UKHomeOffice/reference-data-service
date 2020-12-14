import React from 'react';
import { shallow, mount } from 'enzyme';
import Layout from './index';
import Logger from '../../utils/logger';
import { mockGoBack, mockGetCurrentValue } from '../../setupTests';

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
}));

jest.mock('../../utils/RefDataSetContext');

describe('Layout', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  it('renders without crashing', () => {
    mockGetCurrentValue.mockImplementation(() => ({
      url: {
        pathname: '/test',
      },
    }));

    shallow(
      <Layout>
        <div>Hello</div>
      </Layout>
    );
  });

  it('can click reset', async () => {
    const ErrorComponent = () => {
      throw new Error('Failed');
    };

    mockGetCurrentValue.mockImplementation(() => ({
      url: {
        pathname: '/test',
      },
    }));
    const wrapper = await mount(
      <Layout>
        <ErrorComponent />
      </Layout>
    );
    expect(wrapper.find('.govuk-error-summary').length).toBe(1);
    // eslint-disable-next-line no-console
    expect(console.error).toBeCalled();
    expect(Logger.error).toBeCalled();

    const alert = wrapper.find('.govuk-error-summary__body').at(0);
    alert.find('button').at(0).simulate('click');
  });

  it('can click on back button', () => {
    const wrapper = shallow(
      <Layout>
        <div>Hello</div>
      </Layout>
    );
    wrapper
      .find('a')
      .at(0)
      .simulate('click', {
        preventDefault: () => {},
      });
    expect(mockGoBack).toBeCalled();
  });

  it('no back button if current path /', () => {
    mockGetCurrentValue.mockImplementation(() => ({
      url: {
        pathname: '/',
      },
    }));
    const wrapper = shallow(
      <Layout>
        <div>Hello</div>
      </Layout>
    );

    expect(wrapper.find('a').length).toBe(0);
  });
});
