import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';
import { useAxios } from '../../../../utils/hooks';

const History = ({
  entityId, dataId, definition, primaryKey,
}) => {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [data, setData] = useState({
    isLoading: true,
    failed: false,
    page: 0,
    total: 0,
  });

  const axiosInstance = useAxios();

  useEffect(() => {
    if (axiosInstance) {
      axiosInstance({
        method: 'GET',
        url: `/refdata/${entityId}`,
        params: {
          limit: 1,
          offset: 0,
          select: 'id',
          [`${primaryKey}`]: `eq.${dataId}`,
        },
        headers: {
          Prefer: 'count=exact',
        },
      }).then((countResponse) => {
        setCount(countResponse.headers['content-range'].split('/')[1]);
      });

      axiosInstance({
        method: 'GET',
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
        },
        url: `/refdata/${entityId}`,
        params: {
          [`${primaryKey}`]: `eq.${dataId}`,
          limit: 10,
          offset: 0,
        },
      })
        .then((response) => {
          setData({
            isLoading: false,
            failed: false,
            ...response.data,
          });
        })
        .catch(() => {
          setData({
            isLoading: false,
            failed: true,
          });
        });
    }
  }, [axiosInstance, setData, setCount, primaryKey, dataId, entityId]);

  if (data.isLoading) {
    return <ApplicationSpinner />;
  }

  if (data.failed) {
    return null;
  }

  return (
    <>
      <h2 className="govuk-heading-l">
        {t('pages.data.record.actions.history')}
      </h2>
      <h3 className="govuk-heading-m">
        {' '}
        {t('pages.data.history.size.keyWithCount', { count })}
      </h3>
    </>
  );
};

History.propTypes = {
  definition: PropTypes.shape({
    properties: PropTypes.shape({}).isRequired,
  }).isRequired,
  primaryKey: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
  entityId: PropTypes.string.isRequired,
};

export default History;
