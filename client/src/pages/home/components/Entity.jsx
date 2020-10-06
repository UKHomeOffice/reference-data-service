import React, { useState } from 'react';
import PropTypes, { shape } from 'prop-types';
import _ from 'lodash';
import Schema from './Schema';
import Data from './Data';

const Entity = ({ entity }) => {
  const summary = JSON.parse(entity.get.summary);
  const [tab, setTab] = useState('schema');
  const tags = _.uniq(_.concat(entity.get.tags,
    entity.post.tags,
    entity.delete.tags,
    entity.patch.tags).flat());

  return (
    <>
      <div className="govuk-grid-row govuk-!-margin-top-3">
        <div className="govuk-grid-column-full">
          <h3 className="govuk-heading-m">{summary.label}</h3>
          {tags.map((g) => (
            <React.Fragment key={g}>
              <strong className="govuk-tag govuk-tag--blue govuk-!-margin-bottom-2">
                {g}
              </strong>
              {' '}
            </React.Fragment>
          ))}
          <p className="govuk-body-l">{summary.description}</p>
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-top-3">
        <div className="govuk-grid-column-full">
          <div className="govuk-tabs" data-module="govuk-tabs">
            <ul className="govuk-tabs__list">
              <li className={`govuk-tabs__list-item ${tab === 'schema' ? 'govuk-tabs__list-item--selected' : ''}`}>
                <a
                  className="govuk-tabs__tab"
                  href="#schema"
                  onClick={(e) => {
                    e.preventDefault();
                    setTab('schema');
                  }}
                >
                  Schema
                </a>
              </li>
              <li className={`govuk-tabs__list-item ${tab === 'data' ? 'govuk-tabs__list-item--selected' : ''}`}>
                <a
                  className="govuk-tabs__tab"
                  href="#data"
                  onClick={(e) => {
                    e.preventDefault();
                    setTab('data');
                  }}
                >
                  Data
                </a>
              </li>
            </ul>
            <div className={`govuk-tabs__panel ${tab === 'schema' ? '' : 'govuk-tabs__panel--hidden'}`} id="schema">
              <Schema entity={entity} />
            </div>
            <div className={`govuk-tabs__panel ${tab === 'data' ? '' : 'govuk-tabs__panel--hidden'}`} id="data">
              <Data entity={entity} />
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

Entity.propTypes = {
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

export default Entity;
