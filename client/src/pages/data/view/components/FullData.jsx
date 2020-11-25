import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';
import { useAxios } from '../../../../utils/hooks';
import { getDescription } from '../../../../utils/schemaUtil';

const FullData = ({ dataId, entityId, primaryKey, definition }) => {
  const [data, setData] = useState({
    isLoading: true,
    failed: false,
  });

  const axiosInstance = useAxios();

  useEffect(() => {
    if (axiosInstance) {
      axiosInstance({
        method: 'GET',
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
        },
        url: `/refdata/${entityId}?${primaryKey}=eq.${dataId}&validto=is.null`,
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
  }, [axiosInstance]);

  if (data.isLoading) {
    return <ApplicationSpinner />;
  }

  if (data.failed) {
    return null;
  }

  return (
    <>
      <Card>
        <dl className="govuk-summary-list govuk-summary-list--no-border">
          <div className="govuk-summary-list__row" key={uuidv4()}>
            <dt className="govuk-summary-list__key">Version</dt>
            <dd className="govuk-summary-list__value">
              <strong className="govuk-tag govuk-tag--turquoise">Latest</strong>
            </dd>
          </div>
          {Object.keys(definition.properties).map((c) => {
            const obj = getDescription(c, definition);
            return (
              <div className="govuk-summary-list__row" key={uuidv4()}>
                <dt className="govuk-summary-list__key">{`${obj.label}:`}</dt>
                <dd className="govuk-summary-list__value">{data[c]}</dd>
              </div>
            );
          })}
        </dl>
      </Card>
    </>
  );
};

const Card = styled.div`
  border-bottom: 3px solid #005ea5;
  box-sizing: border-box;
`;

FullData.propTypes = {
  definition: PropTypes.shape({
    properties: PropTypes.shape({}).isRequired,
  }).isRequired,
  primaryKey: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
  entityId: PropTypes.string.isRequired,
};

export default FullData;
