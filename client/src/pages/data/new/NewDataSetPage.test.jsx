import React from 'react';
import { mount, shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from '@testing-library/react';
import { Form } from 'react-formio';
import NewDataSetPage from './NewDataSetPage';
import { AlertContextProvider } from '../../../utils/AlertContext';
import AlertBanner from '../../../components/alert/AlertBanner';
import ApplicationSpinner from '../../../components/ApplicationSpinner';
import { mockNavigate, mockScrollToTop } from '../../../setupTests';
import FormErrorsAlert from '../../../components/alert/FormErrorsAlert';

const form = {
  name: 'test',
  display: 'form',
  versionId: 'version',
  title: 'title',
  components: [
    {
      id: 'eoduazt',
      key: 'textField1',
      case: '',
      mask: false,
      tags: '',
      type: 'textfield',
      input: true,
      label: 'Text Field',
      logic: [],
      hidden: false,
      prefix: '',
      suffix: '',
      unique: false,
      validate: {
        json: '',
        custom: '',
        unique: false,
        pattern: '',
        multiple: false,
        required: true,
        maxLength: '',
        minLength: '',
        customMessage: '',
        customPrivate: false,
        strictDateValidation: false,
      },
      widget: {
        type: 'input',
      },
    },
    {
      id: 'e23op57',
      key: 'submit',
      size: 'md',
      type: 'button',
      block: false,
      input: true,
      label: 'Submit',
      theme: 'primary',
      action: 'submit',
      hidden: false,
      prefix: '',
      suffix: '',
      unique: false,
      widget: {
        type: 'input',
      },
    },
  ],
};
describe('NewDataSetPage', () => {
  const mockAxios = new MockAdapter(axios);

  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
  });
  it('renders without crashing', () => {
    shallow(<NewDataSetPage />);
  });

  it('renders application spinner', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve([200, []]);
        }, 3000);
      }),
    );
    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(wrapper.find(ApplicationSpinner).exists()).toBe(true);
  });

  it('renders form', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(200, form);

    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(Form).at(0).exists()).toBe(true);
  });

  it('handles form api load error', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(500, {});

    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(Form).length).toBe(0);
  });

  it('can submit form', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(200, form);

    mockAxios
      .onPost('/camunda/engine-rest/process-definition/key/newDataSetProcess/start')
      .reply(201, {});

    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const formWrapper = wrapper.find(Form).at(0);

    await act(async () => {
      await formWrapper.props().onSubmit();
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockNavigate).toBeCalledWith('/change-requests');
  });

  it('can handle api failure', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(200, form);

    mockAxios
      .onPost('/camunda/engine-rest/process-definition/key/newDataSetProcess/start')
      .reply(500, {});

    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const formWrapper = wrapper.find(Form).at(0);

    await act(async () => {
      await formWrapper.props().onSubmit();
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(mockNavigate).not.toBeCalled();
  });

  it('can scroll to the top on next and previous', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(200, form);
    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
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

  it('renders form errors', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(200, form);
    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const formWrapper = wrapper.find(Form).at(0);
    await formWrapper.instance().createPromise;

    await act(async () => {
      formWrapper.instance().props.onError([
        {
          component: {
            id: 'id',
            key: 'textField',
          },
          message: 'Textfield is required',
        },
      ]);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    expect(wrapper.find(FormErrorsAlert).exists()).toBe(true);
  });

  it('can cancel form', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(200, form);
    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const formWrapper = wrapper.find(Form).at(0);
    await act(async () => {
      await formWrapper.props().options.hooks.beforeCancel();
      await new Promise((resolve) => setInterval(resolve, 50));
      await wrapper.update();
    });
    expect(mockNavigate).toBeCalledWith('/');
  });

  it('can handle before submit', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(200, form);
    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });

    const formWrapper = wrapper.find(Form).at(0);
    const next = jest.fn();
    const submission = {
      data: {},
    };
    await act(async () => {
      await formWrapper.props().options.hooks.beforeSubmit(submission, next);
      await new Promise((resolve) => setInterval(resolve, 50));
      await wrapper.update();
    });
    expect(next).toBeCalled();
    expect(submission.data.form).toBeDefined();
  });

  it('can handle validation', async () => {
    mockAxios.onGet('/form/name/newDataSetForm').reply(200, form);
    const wrapper = await mount(
      <AlertContextProvider>
        <AlertBanner />
        <NewDataSetPage />
      </AlertContextProvider>,
    );
    await act(async () => {
      await Promise.resolve(wrapper);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    const formWrapper = wrapper.find(Form).at(0);

    await act(async () => {
      formWrapper.instance().props.onError([
        {
          component: {
            id: 'eoduazt',
            key: 'textField1',
          },
          message: 'Textfield is required',
        },
      ]);
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(wrapper.find(FormErrorsAlert).exists()).toBe(true);

    await act(async () => {
      formWrapper.instance().props.onChange({
        changed: {
          component: {
            id: 'eoduazt',
            key: 'textField1',
          },
          isValid: true,
        },
      });
      await new Promise((resolve) => setInterval(resolve, 1000));
      await wrapper.update();
    });
    expect(wrapper.find(FormErrorsAlert).exists()).toBe(false);
  });
});
