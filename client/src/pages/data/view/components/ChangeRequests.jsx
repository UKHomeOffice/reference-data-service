import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useAxios } from '../../../../utils/hooks';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';

const ChangeRequests = ({
  dataId,
  entityId,
  definition,
  businessKey,
  editDataRowProcess,
  count,
  deleteDataRowProcess,
}) => {
  const axiosInstance = useAxios();
  const { t } = useTranslation();
  const [changeRequests, setChangeRequests] = useState({
    isLoading: true,
    isFailed: false,
    total: count,
    page: 0,
    requests: [],
  });

  useEffect(() => {
    if (axiosInstance) {
      axiosInstance({
        url: '/camunda/engine-rest/history/process-instance',
        method: 'GET',
        params: {
          firstResult: 0,
          maxResults: 10,
          sortBy: 'startTime',
          sortOrder: 'desc',
          processDefinitionKeyIn: `${editDataRowProcess},${deleteDataRowProcess}`,
          variables: `entity_eq_${entityId},dataId_eq_${dataId}`,
        },
      })
        .then((response) => {
          setChangeRequests({
            isLoading: false,
            isFailed: false,
            page: 0,
            total: count,
            requests: response.data,
          });
        })
        .catch(() => {
          setChangeRequests({
            isLoading: false,
            isFailed: true,
            page: 0,
            total: 0,
            requests: [],
          });
        });
    }
  }, [axiosInstance, dataId, entityId, definition, businessKey]);

  if (changeRequests.isLoading) {
    return <ApplicationSpinner />;
  }
  return (
    <>
      <span className="govuk-caption-l">
        {t('pages.data.change-requests.summary', { entity: entityId, dataId })}
      </span>
      <h2 className="govuk-heading-l">
        {' '}
        {t('pages.data.change-requests.size.keyWithCount', { count })}
      </h2>
    </>
  );
};

ChangeRequests.propTypes = {
  count: PropTypes.number.isRequired,
  editDataRowProcess: PropTypes.string.isRequired,
  deleteDataRowProcess: PropTypes.string.isRequired,
  businessKey: PropTypes.string.isRequired,
  definition: PropTypes.shape({
    properties: PropTypes.shape({}),
  }).isRequired,
  entityId: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
};

export default ChangeRequests;
