import React from 'react';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from '@testing-library/react';
import DownloadToCSV from './DownloadToCSV';

describe('DownloadToCSV', () => {
  const mockAxios = new MockAdapter(axios);
  beforeEach(() => {
    mockAxios.reset();
  });
  it('can download to csv', async () => {
    mockAxios
      .onGet('/refdata/icao')
      .reply(200, [
        { name: 'Gobernador Crespo Aeroclub Airport' },
        { name: 'Maybee Airport' },
        { name: 'Wonken Airport' },
        { name: 'Dry Bay Airport' },
      ]);
    const wrapper = mount(
      <DownloadToCSV
        appliedColumns={[
          {
            label: 'Name',
            key: 'name',
          },
        ]}
        entity="icao"
      />,
    );

    const downloadButton = wrapper.find('button[id="download"]').at(0);
    await act(async () => {
      downloadButton.simulate('click');
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(mockAxios.history.get.length).toBe(1);
  });

  it('download button disabled if already clicked', async () => {
    mockAxios
      .onGet('/refdata/icao')
      .reply(
        () => new Promise((resolve) => {
          setTimeout(() => {
            resolve([
              200,
              [
                { name: 'Gobernador Crespo Aeroclub Airport' },
                { name: 'Maybee Airport' },
                { name: 'Wonken Airport' },
                { name: 'Dry Bay Airport' },
              ],
            ]);
          }, 3000);
        }),
      );

    const wrapper = mount(
      <DownloadToCSV
        appliedColumns={[
          {
            label: 'Name',
            key: 'name',
          },
        ]}
        entity="icao"
      />,
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const downloadButton = wrapper.find('button[id="download"]').at(0);
    await act(async () => {
      downloadButton.simulate('click');
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });
    expect(wrapper.find('button[id="download"]').at(0).props().disabled).toBe(true);
  });

  it('can handle api failure', async () => {
    mockAxios
      .onGet('/refdata/icao')
      .reply(500, []);

    const wrapper = mount(
      <DownloadToCSV
        appliedColumns={[
          {
            label: 'Name',
            key: 'name',
          },
        ]}
        entity="icao"
      />,
    );

    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const downloadButton = wrapper.find('button[id="download"]').at(0);
    await act(async () => {
      downloadButton.simulate('click');
      await new Promise((resolve) => setInterval(resolve, 500));
      await wrapper.update();
    });
    expect(wrapper.find('button[id="download"]').at(0).props().disabled).toBe(false);
  });
});
