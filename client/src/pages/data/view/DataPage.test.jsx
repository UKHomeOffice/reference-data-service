import React from 'react';
import { shallow, mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from '@testing-library/react';
import DataPage from './DataPage';
import { RefDataSetContextProvider } from '../../../utils/RefDataSetContext';
import FullData from './components/FullData';
import History from './components/History';
import ChangeRequests from './components/ChangeRequests';
import EditData from './components/EditData';
import DeleteData from './components/DeleteData';

jest.mock('./components/FullData', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('./components/History', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('./components/EditData', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('./components/DeleteData', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('DataPage', () => {
  const mockAxios = new MockAdapter(axios);
  const apiResponse = {
    paths: {
      '/behavioursigns': {
        get: {
          tags: ['behavioursigns'],
          summary:
            '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        post: {
          tags: ['behavioursigns'],
          summary:
            '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        delete: {
          tags: ['behavioursigns'],
          summary:
            '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        patch: {
          tags: ['behavioursigns'],
          summary:
            '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
      },
      '/bffunctiontypes': {
        get: {
          tags: ['bffunctiontypes'],
          summary:
            '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        post: {
          tags: ['bffunctiontypes'],
          summary:
            '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        delete: {
          tags: ['bffunctiontypes'],
          summary:
            '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
        patch: {
          tags: ['bffunctiontypes'],
          summary:
            '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        },
      },
    },
    definitions: {
      behavioursigns: {
        description:
          '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        required: ['id', 'name', 'warning', 'danger'],
        properties: {
          id: {
            format: 'integer',
            type: 'integer',
            description:
              '{"label": "Identifier", "description": "Unique identifying column.", "summaryview": "false", "businesskey" : "true"}\n\nNote:\nThis is a Primary Key.<pk/>',
          },
          name: {
            maxLength: 30,
            format: 'character varying',
            type: 'string',
            description:
              '{"label": "Name", "description": "Name of behaviour", "summaryview": "true"}',
          },
          warning: {
            format: 'boolean',
            type: 'boolean',
            description:
              '{"label": "Warning", "description": "Warning Sign?", "summaryview": "true"}',
          },
          danger: {
            format: 'boolean',
            type: 'boolean',
            description:
              '{"label": "Danger", "description": "Danger Sign?", "summaryview": "true"}',
          },
          validfrom: {
            format: 'timestamp with time zone',
            type: 'string',
            description:
              '{"label": "Valid from date", "description": "Item valid from date.", "summaryview" : "false"}',
          },
          validto: {
            format: 'timestamp with time zone',
            type: 'string',
            description:
              '{"label": "Valid to date", "description": "Item valid to date.", "summaryview" : "false"}',
          },
        },
        type: 'object',
      },
      bffunctiontypes: {
        description:
          '{"label": "Border function types", "description": "Border functions type clarifications.", "schemalastupdated": "06/03/2019", "dataversion": 1}',
        required: ['id', 'bffunction'],
        properties: {
          id: {
            format: 'uuid',
            type: 'string',
            description:
              '{"label": "Identifier", "description": "Unique identifying column.", "summaryview": "false", "businesskey" : "true"}\n\nNote:\nThis is a Primary Key.<pk/>',
          },
          bffunction: {
            maxLength: 20,
            format: 'character varying',
            type: 'string',
            description:
              '{"label": "Function", "description": "The type of border crossing.", "summaryview": "true"}',
          },
          validfrom: {
            format: 'timestamp with time zone',
            type: 'string',
            description:
              '{"label": "Valid from date", "description": "Item valid from date.", "summaryview" : "false"}',
          },
          validto: {
            format: 'timestamp with time zone',
            type: 'string',
            description:
              '{"label": "Valid to date", "description": "Item valid to date.", "summaryview" : "false"}',
          },
        },
        type: 'object',
      },
    },
  };
  beforeEach(() => {
    mockAxios.reset();
    mockAxios.onGet('/refdata').reply(200, apiResponse);
  });

  it('renders with crashing', () => {
    shallow(<DataPage entityId="behavioursigns" dataId="test" businessKey="id" />);
  });

  it('can render data component', async () => {
    const wrapper = mount(
      <RefDataSetContextProvider>
        <DataPage businessKey="id" entityId="behavioursigns" dataId="id" />
      </RefDataSetContextProvider>
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(FullData).length).toBe(1);
  });

  it('can click on history', async () => {
    const wrapper = mount(
      <RefDataSetContextProvider>
        <DataPage businessKey="id" entityId="behavioursigns" dataId="id" />
      </RefDataSetContextProvider>
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find('a').length).toBe(5);

    const defaultEvent = jest.fn();

    await act(async () => {
      wrapper.find('a[id="history"]').at(0).simulate('click', {
        preventDefault: defaultEvent,
      });
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    expect(defaultEvent).toBeCalled();
    expect(wrapper.find(History).length).toBe(1);

    await act(async () => {
      wrapper.find('a[id="data"]').at(0).simulate('click', {
        preventDefault: defaultEvent,
      });
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    expect(defaultEvent).toBeCalled();

    await act(async () => {
      wrapper.find('a[id="edit"]').at(0).simulate('click', {
        preventDefault: defaultEvent,
      });
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });
    expect(defaultEvent).toBeCalled();
    expect(wrapper.find(EditData).length).toBe(1);

    await act(async () => {
      wrapper.find('a[id="delete"]').at(0).simulate('click', {
        preventDefault: defaultEvent,
      });
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });
    expect(defaultEvent).toBeCalled();
    expect(wrapper.find(DeleteData).length).toBe(1);

    await act(async () => {
      wrapper.find('a[id="change-requests"]').at(0).simulate('click', {
        preventDefault: defaultEvent,
      });
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });
    expect(defaultEvent).toBeCalled();
    expect(wrapper.find(ChangeRequests).length).toBe(1);
  });

  it('renders warning if change request for entity exists', async () => {
    mockAxios.onGet('/camunda/engine-rest/process-instance/count').reply(200, {
      count: 1,
    });
    const wrapper = mount(
      <RefDataSetContextProvider>
        <DataPage businessKey="id" entityId="behavioursigns" dataId="id" />
      </RefDataSetContextProvider>
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find('div[id="runningInstanceWarning"]').length).toBe(1);
    expect(wrapper.find('a[id="edit"]').at(0).props()['aria-disabled']).toBe(true);
    expect(wrapper.find('a[id="delete"]').at(0).props()['aria-disabled']).toBe(true);
  });
  it('renders warning if change request fails', async () => {
    mockAxios.onGet('/camunda/engine-rest/process-instance/count').reply(500, {
      count: 1,
    });
    const wrapper = mount(
      <RefDataSetContextProvider>
        <DataPage businessKey="id" entityId="behavioursigns" dataId="id" />
      </RefDataSetContextProvider>
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find('div[id="runningInstanceWarning"]').length).toBe(1);
    expect(wrapper.find('a[id="edit"]').at(0).props()['aria-disabled']).toBe(true);
    expect(wrapper.find('a[id="delete"]').at(0).props()['aria-disabled']).toBe(true);
  });
});
