import React from 'react';
import PropTypes from 'prop-types';

const DataPage = ({ entityId, dataId }) => (
  <div>
    {entityId} {dataId}
  </div>
);

DataPage.propTypes = {
  entityId: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
};

export default DataPage;
