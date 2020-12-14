import React from 'react';
import { mount, shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from '@testing-library/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Form } from 'react-formio';
import ChangeRequests from './ChangeRequests';
import { mockNavigate } from '../../../../setupTests';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';

describe('ChangeRequests', () => {
  const mockAxios = new MockAdapter(axios);

  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
  });

  it('renders without crashing', () => {
    shallow(<ChangeRequests />);
  });

  it('renders application loader', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance').reply(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve([200, {}]);
          }, 3000);
        })
    );

    const wrapper = mount(
      <ChangeRequests
        count={10}
        entityId="icao"
        editDataRowProcess="editDataRowProcess"
        businessKey="key"
        dataId="dataId"
        deleteDataRowProcess="deleteDataRowProcess"
        definition={{}}
      />
    );

    expect(wrapper.find(ApplicationSpinner).length).toBe(1);
  });

  it('loads change requests', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance').reply(200, [
      {
        id: 'processInstanceId',
      },
    ]);

    mockAxios.onGet('/camunda/engine-rest/history/variable-instance').reply(200, [
      {
        name: 'editDataRowForm',
        value: {},
      },
      {
        name: 'status',
        value: 'SUBMITTED',
      },
    ]);

    const wrapper = mount(
      <ChangeRequests
        count={10}
        entityId="icao"
        editDataRowProcess="editDataRowProcess"
        businessKey="key"
        dataId="dataId"
        deleteDataRowProcess="deleteDataRowProcess"
        definition={{}}
      />
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(ApplicationSpinner).length).toBe(0);
    expect(wrapper.find(InfiniteScroll).length).toBe(1);
  });

  it('can load next', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance').reply(200, [
      {
        id: 'processInstanceId',
      },
    ]);

    mockAxios.onGet('/camunda/engine-rest/history/variable-instance').reply(200, [
      {
        name: 'editDataRowForm',
        value: {},
      },
      {
        name: 'status',
        value: 'SUBMITTED',
      },
    ]);

    const wrapper = mount(
      <ChangeRequests
        count={10}
        entityId="icao"
        editDataRowProcess="editDataRowProcess"
        businessKey="key"
        dataId="dataId"
        deleteDataRowProcess="deleteDataRowProcess"
        definition={{}}
      />
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const infiniteScroll = wrapper.find(InfiniteScroll).at(0);
    await act(async () => {
      infiniteScroll.props().next();
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(mockAxios.history.get.length).toBe(4);
  });

  it('can render view form on change request', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance').reply(200, [
      {
        id: 'processInstanceId',
      },
    ]);

    mockAxios.onGet('/camunda/engine-rest/history/variable-instance').reply(200, [
      {
        processInstanceId: 'processInstanceId',
        name: 'editDataRowForm',
        value: {
          form: {
            formVersionId: 'formVersionId',
            name: 'editDataRowForm',
          },
        },
      },
      {
        name: 'status',
        processInstanceId: 'processInstanceId',
        value: 'SUBMITTED',
      },
    ]);

    mockAxios.onGet('/form/version/formVersionId').reply(200, {
      schema: {
        title: 'form name',
        components: [],
      },
    });

    const wrapper = mount(
      <ChangeRequests
        count={10}
        entityId="icao"
        editDataRowProcess="editDataRowProcess"
        businessKey="key"
        dataId="dataId"
        deleteDataRowProcess="deleteDataRowProcess"
        definition={{}}
      />
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find('button[id="viewForm"]').length).toBe(1);
    const viewFormButton = wrapper.find('button[id="viewForm"]').at(0);

    await act(async () => {
      await viewFormButton.simulate('click', {
        preventDefault: () => {},
      });
      await new Promise((resolve) => setInterval(resolve, 2000));
      await wrapper.update();
    });

    expect(wrapper.find(Form).length).toBe(1);
  });
});
