import React from 'react';
import moment from 'moment';
import { mount } from 'enzyme';
import ChangeRequest from './ChangeRequest';

describe('ChangeRequest', () => {
  it('does render cancel component if endtime present', () => {
    const wrapper = mount(
      <ChangeRequest
        request={{
          id: 'id',
          processDefinitionName: 'test',
          startUserId: 'test',
          startTime: moment().toISOString(),
        }}
        cancelComponent={(
          <>
            <div className="govuk-summary-list__row" id="test">
              <dt className="govuk-summary-list__key">Test</dt>
              <dd className="govuk-summary-list__value" />
            </div>
          </>
        )}
      />,
    );

    expect(wrapper.find('div[id="test"]').length).toBe(1);
  });

  it('does  not render cancel component if endtime present', () => {
    const wrapper = mount(
      <ChangeRequest
        request={{
          id: 'id',
          processDefinitionName: 'test',
          startUserId: 'test',
          startTime: moment().toISOString(),
          endTime: moment().toISOString(),
        }}
        cancelComponent={(
          <>
            <div className="govuk-summary-list__row" id="test">
              <dt className="govuk-summary-list__key">Test</dt>
              <dd className="govuk-summary-list__value" />
            </div>
          </>
        )}
      />,
    );

    expect(wrapper.find('div[id="test"]').length).toBe(0);
  });

  it.each`
    status         | tag
    ${'SUBMITTED'} | ${'govuk-tag--blue'}
    ${'APPROVED'}  | ${'govuk-tag--green'}
    ${'REJECTED'}  | ${'govuk-tag--red'}
    ${'CANCELLED'} | ${'govuk-tag--yellow'}
  `('renders status for $status ', async ({ status, tag }) => {
  const wrapper = mount(
    <ChangeRequest
      request={{
        id: 'id',
        processDefinitionName: 'test',
        startUserId: 'test',
        startTime: moment().toISOString(),
        variables: [
          {
            name: 'status',
            value: status,
            type: 'string',
          },
        ],
      }}
      cancelComponent={<div id="test">Test</div>}
    />,
  );
  expect(wrapper.find(`.${tag}`).length).toBe(1);
});
});
