import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import { Form } from 'react-formio';
import {mockNavigate, mockScrollToTop} from '../../../../setupTests';
import { AlertContextProvider } from '../../../../utils/AlertContext';
import AlertBanner from '../../../../components/alert/AlertBanner';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';
import EditData from './EditData';

const definition = {
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

describe('EditData', () => {
  const mockAxios = new MockAdapter(axios);
  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
  });
  it('renders application loader', async() => {
    mockAxios.onGet('/form/name/editDataSetForm').reply(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve([200, []]);
        }, 3000);
      }),
    );
    mockAxios.onGet('/refdata/id?businessKey=eq.test').reply(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve([200, []]);
        }, 3000);
      }),
    );
    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <EditData handleOnSubmit={() => {}} businessKey="businessKey" definition={{}} dataId="test" entityId="id"/>
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(wrapper.find(ApplicationSpinner).exists()).toBe(true);
  });

  it('can load form and data', async () => {
    mockAxios.onGet('/form/name/editDataSetForm').reply(200, {
      name: 'editDataSetForm',
      id: 'test',
      components: [{
        key: 'test'
      }]
    });
    mockAxios
      .onGet('/refdata/behavioursigns?id=eq.000b9094-7ef8-4036-9dd6-9699c5f465e5')
      .reply(200, {
        id: '000b9094-7ef8-4036-9dd6-9699c5f465e5',
        name: 'test',
      });

    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner/>
        <EditData handleOnSubmit={() => {
        }}
        businessKey="id"
        definition={definition}
        dataId="000b9094-7ef8-4036-9dd6-9699c5f465e5"
        entityId="behavioursigns"/>
      </AlertContextProvider>,
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(wrapper.find(ApplicationSpinner).exists()).toBe(false);

  });


  it('can submit form', async () => {
    mockAxios.onGet('/form/name/editDataSetForm').reply(200, {
      name: 'editDataSetForm',
      id: 'test',
      components: [{
        key: 'test'
      }]
    });
    mockAxios
      .onGet('/refdata/behavioursigns?id=eq.000b9094-7ef8-4036-9dd6-9699c5f465e5')
      .reply(200, {
        id: '000b9094-7ef8-4036-9dd6-9699c5f465e5',
        name: 'test',
        warning: false,
        danger: false,
        validto: null,
        validfrom: null
      });

    mockAxios.onPost('/camunda/engine-rest/process-definition/key/editDataRowProcess/start')
      .reply(200, {});

    const handleSubmit = jest.fn();
    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner/>
        <EditData handleOnSubmit={handleSubmit}
          businessKey="id"
          definition={definition}
          dataId="000b9094-7ef8-4036-9dd6-9699c5f465e5"
          entityId="behavioursigns"/>
      </AlertContextProvider>,
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const formWrapper = wrapper.find(Form).at(0);

    await act(async () => {
      formWrapper.props().onSubmit({
        data: {
          businessKey: 'businessKey',
          'properties': [

          ]
        }
      });
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(handleSubmit).toBeCalled();
    expect(mockAxios.history.post.length).toBe(1);

  });

  it('can handle next and previous', async() => {
    mockAxios.onGet('/form/name/editDataSetForm').reply(200, {
      name: 'editDataSetForm',
      id: 'test',
      components: [{
        key: 'test'
      }]
    });
    mockAxios
      .onGet('/refdata/behavioursigns?id=eq.000b9094-7ef8-4036-9dd6-9699c5f465e5')
      .reply(200, {
        id: '000b9094-7ef8-4036-9dd6-9699c5f465e5',
        name: 'test',
        warning: false,
        danger: false,
        validto: null,
        validfrom: null
      });

    mockAxios.onPost('/camunda/engine-rest/process-definition/key/editDataRowProcess/start')
      .reply(200, {});

    const handleSubmit = jest.fn();
    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner/>
        <EditData handleOnSubmit={handleSubmit}
          businessKey="id"
          definition={definition}
          dataId="000b9094-7ef8-4036-9dd6-9699c5f465e5"
          entityId="behavioursigns"/>
      </AlertContextProvider>,
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const formWrapper = wrapper.find(Form).at(0);

    formWrapper.props().onNextPage();
    expect(mockScrollToTop).toBeCalled();

    formWrapper.props().onPrevPage();
    expect(mockScrollToTop).toBeCalled();
  });



});
