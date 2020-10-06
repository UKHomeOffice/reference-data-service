import React from 'react';
import { mount, shallow } from 'enzyme';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { act } from '@testing-library/react';
import Home, { CustomLink } from './index';
import ApplicationSpinner from '../../components/ApplicationSpinner';
import { mockNavigate } from '../../setupTests';

describe('Home', () => {
  const mockAxios = new MockAdapter(axios);
  const apiResponse = {
    paths: {
      '/behavioursigns': {
        get: {
          tags: [
            'behavioursigns',
          ],
          summary: '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        post: {
          tags: [
            'behavioursigns',
          ],
          summary: '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        delete: {
          tags: [
            'behavioursigns',
          ],
          summary: '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        patch: {
          tags: [
            'behavioursigns',
          ],
          summary: '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
      },
      '/bffunctiontypes': {
        get: {
          tags: [
            'bffunctiontypes',
          ],
          summary: '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        post: {
          tags: [
            'bffunctiontypes',
          ],
          summary: '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        delete: {
          tags: [
            'bffunctiontypes',
          ],
          summary: '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        patch: {
          tags: [
            'bffunctiontypes',
          ],
          summary: '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
      },
    },
  };
  beforeEach(() => {
    mockAxios.reset();
  });

  it('renders without crashing', () => {
    shallow(<Home />);
  });

  it('can render loading bar', async () => {
    const wrapper = mount(<Home />);
    mockAxios.onGet('/refdata')
      .reply(() => new Promise((resolve) => {
        setTimeout(() => {
          resolve([200, apiResponse]);
        }, 2000);
      }));
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setImmediate(resolve, 1000));
      await wrapper.update();
    });
    expect(wrapper.find(ApplicationSpinner).at(0).exists()).toBe(true);
  });

  it('can render entities', async () => {
    const wrapper = mount(<Home />);
    mockAxios.onGet('/refdata').reply(200, apiResponse);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find('ul[id="entityList"]').at(0).exists()).toBe(true);
    expect(wrapper.find(CustomLink).length).toBe(2);
  });

  it('can pre select entity', async () => {
    const wrapper = mount(<Home entity="bffunctiontypes" />);
    mockAxios.onGet('/refdata').reply(200, apiResponse);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(CustomLink).at(0).props().active).toBe(false);
    const activeLink = wrapper.find(CustomLink).at(1);
    expect(activeLink.props().active).toBe(true);
  });

  it('can select entity', async () => {
    const wrapper = mount(<Home entity="bffunctiontypes" />);
    mockAxios.onGet('/refdata').reply(200, apiResponse);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    await act(async () => {
      wrapper.find(CustomLink).at(0).simulate('click', {
        preventDefault: () => {},
      });
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(mockNavigate).toBeCalledWith('/entity/behavioursigns', { replace: false });
  });

  it('loading bar not displayed if api failure', async () => {
    const wrapper = mount(<Home entity="bffunctiontypes" />);
    mockAxios.onGet('/refdata').reply(500, {});
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(ApplicationSpinner).at(0).exists()).toBe(false);
    expect(wrapper.find(CustomLink).length).toBe(0);
  });
});