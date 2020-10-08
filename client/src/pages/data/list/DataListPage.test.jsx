import { mount, shallow } from 'enzyme';
import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from '@testing-library/react';
import DataListPage from './DataListPage';

describe('DataListPage', () => {
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
  });
  it('renders without crashing', () => {
    shallow(<DataListPage entityId="test" />);
  });
  it('can render column boxes', async () => {
    mockAxios.onGet('/refdata').reply(200, apiResponse);
    // eslint-disable-next-line no-unused-vars
    mockAxios.onGet('/refdata/behavioursigns').reply(((config) => [
      200,
      [{ id: 'test' }],
      {
        'content-range': '0-10/23',
      },
    ]));

    const wrapper = mount(<DataListPage entityId="behavioursigns" />);

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find('h2[id="countText"]').at(0).text()).toBe('23');
    expect(wrapper.find('.govuk-checkboxes__input').length).toBe(6);

    expect(wrapper.find('button').at(0).props().disabled).toBe(true);

    await act(async () => {
      wrapper.find('.govuk-checkboxes__input').at(0).simulate('change', {
        target: {
          checked: true,
        },
      });
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find('button').at(0).props().disabled).toBe(false);

    await act(async () => {
      wrapper.find('.govuk-checkboxes__input').at(0).simulate('change', {
        target: {
          checked: false,
        },
      });
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find('button').at(0).props().disabled).toBe(true);
  });

  it('can select a column', async () => {
    mockAxios.onGet('/refdata').reply(200, apiResponse);
    // eslint-disable-next-line no-unused-vars
    mockAxios.onGet('/refdata/behavioursigns').reply(((config) => [
      200,
      [{ id: 'test' }],
      {
        'content-range': '0-10/23',
      },
    ]));

    const wrapper = mount(<DataListPage entityId="behavioursigns" />);

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    await act(async () => {
      wrapper.find('.govuk-checkboxes__input').at(0).simulate('change', {
        target: {
          checked: true,
        },
      });
      await wrapper.find('button').at(0).simulate('click');
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    await act(async () => {
      await wrapper.find('button').at(0).simulate('click');
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(mockAxios.history.get.length).toBe(3);
  });

  it('can handle data failure', async () => {
    mockAxios.onGet('/refdata').reply(200, apiResponse);
    // eslint-disable-next-line no-unused-vars
    mockAxios.onGet('/refdata/behavioursigns').reply(((config) => [
      200,
      [{ id: 'test' }],
      {
        'content-range': '0-10/23',
      },
    ]));

    mockAxios.onGet('/refdata/behavioursigns').reply(500, []);

    const wrapper = mount(<DataListPage entityId="behavioursigns" />);

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    await act(async () => {
      wrapper.find('.govuk-checkboxes__input').at(0).simulate('change', {
        target: {
          checked: true,
        },
      });
      await wrapper.find('button').at(0).simulate('click');
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    await act(async () => {
      await wrapper.find('button').at(0).simulate('click');
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(mockAxios.history.get.length).toBe(3);
  });
});
