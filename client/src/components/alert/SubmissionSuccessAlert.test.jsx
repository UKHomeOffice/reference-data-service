import React from 'react';
import { shallow } from 'enzyme';
import SubmissionSuccessAlert from './SubmissionSuccessAlert';

describe('SubmissionSuccessAlert', () => {
  it('can render with reference', () => {
    const wrapper = shallow(<SubmissionSuccessAlert reference="reference" message="hello" />);

    expect(wrapper.text()).toContain('reference');
  });

  it('can render without reference', () => {
    const wrapper = shallow(<SubmissionSuccessAlert message="hello" />);
    expect(wrapper.text()).not.toContain('reference');
  });

  it('can execute default close', () => {
    const wrapper = shallow(<SubmissionSuccessAlert reference="reference" message="hello" />);

    const closeButton = wrapper.find('button').at(0);
    closeButton.simulate('click');
  });

  it('can handle onclose ', () => {
    const handleOnClose = jest.fn();
    const wrapper = shallow(
      <SubmissionSuccessAlert reference="reference" message="hello" handleOnClose={handleOnClose} />
    );

    const closeButton = wrapper.find('button').at(0);
    closeButton.simulate('click');
    expect(handleOnClose).toBeCalled();
  });
});
