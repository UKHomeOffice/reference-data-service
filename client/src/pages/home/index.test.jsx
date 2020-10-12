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
    definitions: {
      behavioursigns: {
        description: '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        required: [
          'id',
          'name',
          'warning',
          'danger',
        ],
        properties: {
          id: {
            format: 'integer',
            type: 'integer',
            description: '{"label": "Identifier", "description": "Unique identifying column.", "summaryview": "false"}\n\nNote:\nThis is a Primary Key.<pk/>',
          },
          name: {
            maxLength: 30,
            format: 'character varying',
            type: 'string',
            description: '{"label": "Name", "description": "Name of behaviour", "summaryview": "true"}',
          },
          warning: {
            format: 'boolean',
            type: 'boolean',
            description: '{"label": "Warning", "description": "Warning Sign?", "summaryview": "true"}',
          },
          danger: {
            format: 'boolean',
            type: 'boolean',
            description: '{"label": "Danger", "description": "Danger Sign?", "summaryview": "true"}',
          },
          validfrom: {
            format: 'timestamp with time zone',
            type: 'string',
            description: '{"label": "Valid from date", "description": "Item valid from date.", "summaryview" : "false"}',
          },
          validto: {
            format: 'timestamp with time zone',
            type: 'string',
            description: '{"label": "Valid to date", "description": "Item valid to date.", "summaryview" : "false"}',
          },
        },
        type: 'object',
      },
      bffunctiontypes: {
        description: '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        required: [
          'id',
          'bffunction',
        ],
        properties: {
          id: {
            format: 'uuid',
            type: 'string',
            description: '{"label": "Identifier", "description": "Unique identifying column.", "summaryview": "false"}\n\nNote:\nThis is a Primary Key.<pk/>',
          },
          bffunction: {
            maxLength: 20,
            format: 'character varying',
            type: 'string',
            description: '{"label": "Function", "description": "The type of border crossing.", "summaryview": "true"}',
          },
          validfrom: {
            format: 'timestamp with time zone',
            type: 'string',
            description: '{"label": "Valid from date", "description": "Item valid from date.", "summaryview" : "false"}',
          },
          validto: {
            format: 'timestamp with time zone',
            type: 'string',
            description: '{"label": "Valid to date", "description": "Item valid to date.", "summaryview" : "false"}',
          },
        },
        type: 'object',
      },
    },
  };
  beforeEach(() => {
    mockAxios.reset();
    // eslint-disable-next-line no-unused-vars
    mockAxios.onGet('/refdata/bffunctiontypes').reply(((config) => [
      200,
      [{ id: 'test' }],
      {
        'content-range': '0-10/23',
      },
    ]));
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
    // eslint-disable-next-line no-unused-vars
    mockAxios.onGet('/refdata/behavioursigns').reply(((config) => [
      200,
      [{ id: 'test' }],
      {
        'content-range': '0-10/23',
      },
    ]));
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
    expect(mockNavigate).toBeCalledWith('/schema/behavioursigns', { replace: false });
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
