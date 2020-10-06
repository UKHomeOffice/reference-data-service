import React from 'react';
import PropTypes, { shape } from 'prop-types';

const Schema = ({ entity }) => <div>{JSON.stringify(entity)}</div>;

Schema.propTypes = {
  entity: PropTypes.shape({
    get: shape({
      summary: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
    }),
    delete: shape({
      summary: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
    }),
    post: shape({
      summary: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
    }),
    patch: shape({
      summary: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
};

export default Schema;
