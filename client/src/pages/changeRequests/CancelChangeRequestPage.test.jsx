import React from 'react';
import { mount, shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from '@testing-library/react';
import moment from 'moment';
import CancelChangeRequestPage from './CancelChangeRequestPage';
import { mockNavigate } from '../../setupTests';
import ApplicationSpinner from '../../components/ApplicationSpinner';
import ChangeRequest from './components/ChangeRequest';

describe('CancelChangeRequestPage', () => {
  const mockAxios = new MockAdapter(axios);

  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
  });

  it('renders without crashing', () => {
    shallow(<CancelChangeRequestPage id="test" />);
  });

  it('renders application spinner if loading request', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance/test').reply(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve([200, []]);
        }, 3000);
      }),
    );
    const wrapper = mount(<CancelChangeRequestPage id="test" />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(ApplicationSpinner).at(0).exists()).toBe(true);
  });

  it('renders request', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance/test').reply(200, {
      id: 'test',
      processDefinitionName: 'Test process',
      startUserId: 'test',
      startTime: moment().toISOString(),
    });
    mockAxios.onGet('/camunda/engine-rest/variable-instance').reply(200, [
      {
        name: 'status',
        value: 'SUBMITTED',
        type: 'string',
      },
      {
        name: 'test',
        value: JSON.stringify({ test: 'test' }),
        type: 'Json',
      },
    ]);
    const wrapper = mount(<CancelChangeRequestPage id="test" />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(ApplicationSpinner).at(0).exists()).toBe(false);
    expect(wrapper.find(ChangeRequest).at(0).exists()).toBe(true);
    expect(wrapper.find('button').at(0).props().disabled).toBe(true);
  });

  it('does not continue to Application loader if api fails', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance/test').reply(500, {});
    const wrapper = mount(<CancelChangeRequestPage id="test" />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(ApplicationSpinner).at(0).exists()).toBe(false);
  });

  it('can cancel', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance/test').reply(200, {
      id: 'test',
      processDefinitionName: 'Test process',
      startUserId: 'test',
      startTime: moment().toISOString(),
    });
    mockAxios.onGet('/camunda/engine-rest/variable-instance').reply(200, [
      {
        name: 'status',
        value: 'SUBMITTED',
        type: 'string',
      },
      {
        name: 'test',
        value: JSON.stringify({ test: 'test' }),
        type: 'Json',
      },
    ]);

    mockAxios.onPost('/camunda/engine-rest/message').reply(200, {});

    const wrapper = mount(<CancelChangeRequestPage id="test" />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const reason = wrapper.find('textarea').at(0);
    await act(async () => {
      reason.simulate('change', {
        target: {
          value: 'test',
        },
      });

      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    await act(async () => {
      wrapper.find('button').at(0).simulate('click');
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(mockAxios.history.post.length).toBe(1);
    expect(mockNavigate).toBeCalledWith('/change-requests');
  });

  it('does not navigate away if cancel fails', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance/test').reply(200, {
      id: 'test',
      processDefinitionName: 'Test process',
      startUserId: 'test',
      startTime: moment().toISOString(),
    });
    mockAxios.onGet('/camunda/engine-rest/variable-instance').reply(200, [
      {
        name: 'status',
        value: 'SUBMITTED',
        type: 'string',
      },
      {
        name: 'test',
        value: JSON.stringify({ test: 'test' }),
        type: 'Json',
      },
    ]);

    mockAxios.onPost('/camunda/engine-rest/message').reply(500, {});

    const wrapper = mount(<CancelChangeRequestPage id="test" />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const reason = wrapper.find('textarea').at(0);
    await act(async () => {
      reason.simulate('change', {
        target: {
          value: 'test',
        },
      });

      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    await act(async () => {
      wrapper.find('button').at(0).simulate('click');
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(mockNavigate).not.toBeCalledWith('/change-requests');
  });
});
