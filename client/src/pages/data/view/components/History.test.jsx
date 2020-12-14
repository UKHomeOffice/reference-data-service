import React from 'react';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from '@testing-library/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import History from './History';
import { mockNavigate } from '../../../../setupTests';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';

describe('History', () => {
  const mockAxios = new MockAdapter(axios);

  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
  });
  const definition = {
    description:
      '{"label": "Behaviour Signs", "description": "Behaviours Warning and Danger Signs", "schemalastupdated": "06/03/2019", "dataversion": 1}',
    required: ['id', 'name', 'warning', 'danger'],
    properties: {
      id: {
        format: 'integer',
        type: 'integer',
        description:
          '{"label": "Identifier", "description": "Unique identifying column.", "summaryview": "false"}\n\nNote:\nThis is a Primary Key.<pk/>',
      },
      name: {
        maxLength: 30,
        format: 'character varying',
        type: 'string',
        description:
          '{"label": "Name", "description": "Name of behaviour", "summaryview": "true",  "businesskey" : "true"}',
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
  };

  it('renders loading bar', async () => {
    mockAxios.onGet('/refdata/behavioursigns').reply(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve([200, {}]);
          }, 3000);
        })
    );

    const wrapper = mount(
      <History
        definition={definition}
        businessKey="id"
        entityId="behavioursigns"
        dataId="000b9094-7ef8-4036-9dd6-9699c5f465e5"
      />
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    expect(wrapper.find(ApplicationSpinner).length).toBe(1);
  });

  it('handles failed history', async () => {
    mockAxios.onGet('/refdata/behavioursigns').reply(500, {});

    const wrapper = mount(
      <History
        definition={definition}
        businessKey="id"
        entityId="behavioursigns"
        dataId="000b9094-7ef8-4036-9dd6-9699c5f465e5"
      />
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(ApplicationSpinner).length).toBe(0);
    expect(wrapper.find('dl').length).toBe(0);
  });

  it('renders history', async () => {
    mockAxios.onGet('/refdata/behavioursigns').reply(
      200,
      [
        {
          id: '000b9094-7ef8-4036-9dd6-9699c5f465e5',
          name: 'test',
        },
      ],
      {
        'content-range': '1/20',
      }
    );
    const wrapper = mount(
      <History
        definition={definition}
        businessKey="id"
        entityId="behavioursigns"
        dataId="000b9094-7ef8-4036-9dd6-9699c5f465e5"
      />
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    expect(wrapper.find(ApplicationSpinner).length).toBe(0);
    expect(wrapper.find('dl').length).toBe(1);
  });

  it('can load next', async () => {
    mockAxios.onGet('/refdata/behavioursigns').reply(
      200,
      [
        {
          id: '000b9094-7ef8-4036-9dd6-9699c5f465e5',
          name: 'test',
        },
      ],
      {
        'content-range': '0-10/20',
      }
    );

    const wrapper = mount(
      <History
        definition={definition}
        businessKey="id"
        entityId="behavioursigns"
        dataId="000b9094-7ef8-4036-9dd6-9699c5f465e5"
      />
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    const infiniteScroll = wrapper.find(InfiniteScroll).at(0);
    expect(infiniteScroll.exists()).toBe(true);

    await act(async () => {
      infiniteScroll.props().next();
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    expect(mockAxios.history.get.length).toBe(2);
  });
});
