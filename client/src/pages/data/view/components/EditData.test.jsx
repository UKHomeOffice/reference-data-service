import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import { mockNavigate } from '../../../../setupTests';
import { AlertContextProvider } from '../../../../utils/AlertContext';
import AlertBanner from '../../../../components/alert/AlertBanner';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';
import EditData from './EditData';

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
});
