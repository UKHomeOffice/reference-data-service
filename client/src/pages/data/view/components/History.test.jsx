import React from 'react';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from '@testing-library/react';
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
                    '{"label": "Identifier", "description": "Unique identifying column.", "summaryview": "false", "primarykey" : "true"}\n\nNote:\nThis is a Primary Key.<pk/>',
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
    mockAxios
      .onGet('/refdata/behavioursigns')
      .reply(
        () => new Promise((resolve) => {
          setTimeout(() => {
            resolve([200, {}]);
          }, 3000);
        }),
      );

    const wrapper = mount(<History
      definition={definition}
      primaryKey="id"
      entityId="behavioursigns"
      dataId="000b9094-7ef8-4036-9dd6-9699c5f465e5"
    />);

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    expect(wrapper.find(ApplicationSpinner).length).toBe(1);
  });
});
