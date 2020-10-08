import React from 'react';
import PropTypes, { shape } from 'prop-types';
import _ from 'lodash';
import { useNavigation } from 'react-navi';
import { useTranslation } from 'react-i18next';
import Schema from './Schema';

const Entity = ({ entity, definition }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const summary = JSON.parse(entity.get.summary);
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
          <a
            href={`/schema/${entity.key}/data`}
            onClick={async (e) => {
              e.preventDefault();
              await navigation.navigate(`/schema${entity.key}/data`);
            }}
            className="govuk-link govuk-link--no-visited-state govuk-!-font-size-19"
          >
            {t('pages.data.view-data')}
          </a>
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-top-3">
        <div className="govuk-grid-column-full">
          <Schema definition={definition} />
        </div>
      </div>

    </>
  );
};

Entity.propTypes = {
  definition: PropTypes.shape({}).isRequired,
  entity: PropTypes.shape({
    key: PropTypes.string.isRequired,
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
