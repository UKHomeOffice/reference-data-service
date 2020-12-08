import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/styles';

const ChangeRequest = ({ request, cancelComponent, viewRequest }) => {
  const { t } = useTranslation();
  const resolveStatus = (data) => {
    const s = _.find(data.variables, (v) => v.name === 'status');
    if (!s) {
      return <strong className="govuk-tag govuk-tag--red">Unknown</strong>;
    }
    let colour = '';
    if (s.value === 'SUBMITTED') {
      colour = 'govuk-tag--blue';
    } else if (s.value === 'APPROVED') {
      colour = 'govuk-tag--green';
    } else if (s.value === 'REJECTED') {
      colour = 'govuk-tag--red';
    } else {
      colour = 'govuk-tag--yellow';
    }
    return <strong className={`govuk-tag ${colour}`}>{s.value}</strong>;
  };
  const reason = _.find(request.variables, (v) => v.name === 'reason');
  return (
    <Card>
      <dl className="govuk-summary-list govuk-summary-list--no-border">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {t('pages.change-requests.labels.request-type')}
          </dt>
          <dd className="govuk-summary-list__value">{request.processDefinitionName}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {t('pages.change-requests.labels.submitted-by')}
          </dt>
          <dd className="govuk-summary-list__value">{request.startUserId}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {t('pages.change-requests.labels.submitted-date')}
          </dt>
          <dd className="govuk-summary-list__value">
            {moment(request.startTime).format('DD/MM/YYYY HH:mm')}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {t('pages.change-requests.labels.completed-date')}
          </dt>
          <dd className="govuk-summary-list__value">
            {request.endTime ? moment(request.endTime).format('DD/MM/YYYY HH:mm') : 'Still open'}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{t('pages.change-requests.labels.status')}</dt>
          <dd className="govuk-summary-list__value">{resolveStatus(request)}</dd>
        </div>
        {reason ? (
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{t('pages.change-requests.labels.message')}</dt>
            <dd className="govuk-summary-list__value">
              <p className="govuk-body">{reason.value}</p>
            </dd>
          </div>
        ) : null}
        {!request.endTime ? cancelComponent : null}
      </dl>
      {viewRequest || null}
    </Card>
  );
};

ChangeRequest.defaultProps = {
  viewRequest: null,
};

ChangeRequest.propTypes = {
  viewRequest: PropTypes.node,
  cancelComponent: PropTypes.element.isRequired,
  request: PropTypes.shape({
    id: PropTypes.string,
    processDefinitionName: PropTypes.string,
    startUserId: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    variables: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

export default ChangeRequest;
