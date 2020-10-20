import React from 'react';
import { mount, shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from '@testing-library/react';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';
import ChangeRequestsPage from './ChangeRequestsPage';
import { mockNavigate } from '../../setupTests';
import ChangeRequest from './components/ChangeRequest';

describe('ChangeRequestsPage', () => {
  const mockAxios = new MockAdapter(axios);

  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
    mockAxios.onGet('/camunda/engine-rest/process-definition').reply(200, [
      {
        name: 'New data set request',
        key: 'newDataSetProcess',
        id: 'test',
      },
    ]);

    mockAxios.onGet('/camunda/engine-rest/history/process-instance').reply(200, [
      {
        id: 'id',
        startUserId: 'test',
        processDefinitionName: 'New data set request',
        startTime: moment().toISOString(),
      },
    ]);

    mockAxios.onGet('/camunda/engine-rest/history/process-instance/count').reply(200, {
      count: 1,
    });

    mockAxios.onGet('/camunda/engine-rest/history/variable-instance').reply(200, [
      {
        name: 'status',
        value: 'SUBMITTED',
        type: 'string',
        processInstanceId: 'id',
      },
      {
        name: 'test',
        value: JSON.stringify({ test: 'test' }),
        type: 'Json',
        processInstanceId: 'id',
      },
    ]);
  });

  it('renders without crashing', () => {
    shallow(<ChangeRequestsPage />);
  });

  it('can render requests and filters', async () => {
    const wrapper = mount(<ChangeRequestsPage />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(ChangeRequest).length).toBe(1);
    expect(wrapper.find('input[type="checkbox"]').length).toBe(1);
  });

  it('can handle api failure', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance').reply(500, {});

    const wrapper = mount(<ChangeRequestsPage />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(ChangeRequest).length).toBe(0);
    expect(wrapper.find('input[type="checkbox"]').length).toBe(1);
  });

  it('can handle request type filter', async () => {
    const wrapper = mount(<ChangeRequestsPage />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const filterType = wrapper.find('input[type="checkbox"]').at(0);
    await act(async () => {
      filterType.simulate('change', {
        target: {
          checked: true,
        },
      });
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });
    expect(
      mockAxios.history.get.filter((r) => r.url === '/camunda/engine-rest/history/process-instance')
        .length
    ).toBe(2);

    await act(async () => {
      filterType.simulate('change', {
        target: {
          checked: false,
        },
      });
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    expect(
      mockAxios.history.get.filter((r) => r.url === '/camunda/engine-rest/history/process-instance')
        .length
    ).toBe(3);
  });

  it('can handle filter by requester', async () => {
    const wrapper = mount(<ChangeRequestsPage />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const yourRequestOnly = wrapper.find('input[id="your-requests-only"]').at(0);
    await act(async () => {
      yourRequestOnly.simulate('change');
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    const allRequests = wrapper.find('input[id="all-requests"]').at(0);
    await act(async () => {
      allRequests.simulate('change');
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });

    expect(
      mockAxios.history.get.filter((r) => r.url === '/camunda/engine-rest/history/process-instance')
        .length
    ).toBe(3);
  });

  it('can handle load more', async () => {
    const wrapper = mount(<ChangeRequestsPage />);
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

    expect(
      mockAxios.history.get.filter((r) => r.url === '/camunda/engine-rest/history/process-instance')
        .length
    ).toBe(2);
  });

  it('can navigate to cancel a request', async () => {
    const wrapper = mount(<ChangeRequestsPage />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const cancelButton = wrapper.find('button[id="cancel"]').at(0);
    cancelButton.simulate('click');
    expect(mockNavigate).toBeCalledWith('/change-requests/id/cancel');
  });

  it('no data rendered', async () => {
    mockAxios.onGet('/camunda/engine-rest/history/process-instance').reply(200, []);

    const wrapper = mount(<ChangeRequestsPage />);
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(wrapper.find(ChangeRequest).length).toBe(0);
  });
});
