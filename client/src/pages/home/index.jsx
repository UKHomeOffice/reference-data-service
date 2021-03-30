import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled, { css } from 'styled-components';
import { useNavigation } from 'react-navi';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import _ from 'lodash';
import ApplicationSpinner from '../../components/ApplicationSpinner';
import Entity from './components/Entity';
import { RefDataSetContext } from '../../utils/RefDataSetContext';

const Home = ({ entity }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const { dataSetContext } = useContext(RefDataSetContext);

  const dataSets = {
    data: dataSetContext,
  };

  // eslint-disable-next-line no-unused-vars
  const filteredDefinitions = _.pickBy(dataSets.data.definitions, (value) => {
    return value && value.description && value.description !== '';
  });

  const [entityKeys, setEntityKeys] = useState(Object.keys(filteredDefinitions));

  const [key, setKey] = useState(entity ? `${entity}` : `${Object.keys(filteredDefinitions)[0]}`);

  const renderData = () => {
    if (!filteredDefinitions) {
      return null;
    }

    return (
      <>
        <div className="govuk-input__wrapper govuk-!-margin-top-1 govuk-!-margin-bottom-3">
          <input
            className="govuk-input"
            id="filter"
            name="filter"
            type="text"
            placeholder={t('pages.home.filter')}
            onChange={(e) => {
              if (e.target.value) {
                setEntityKeys(
                  Object.keys(filteredDefinitions).filter((k) =>
                    k.toLowerCase().match(e.target.value)
                  )
                );
              } else {
                setEntityKeys(Object.keys(filteredDefinitions));
                setKey(Object.keys(filteredDefinitions)[0]);
              }
            }}
            spellCheck="false"
          />
        </div>
        <ul className="govuk-list" id="entityList">
          <InfiniteScroll dataLength={entityKeys.length} hasMore={false} height={900}>
            {entityKeys.map((k) => (
              <li key={k}>
                <CustomLink
                  href={`/schema/${k}`}
                  active={key === k}
                  className="govuk-link govuk-link--no-visited-state"
                  onClick={async (e) => {
                    e.preventDefault();
                    setKey(k);
                    await navigation.navigate(`/schema/${k}`, {
                      replace: false,
                    });
                  }}
                >
                  {k}
                </CustomLink>
              </li>
            ))}
          </InfiniteScroll>
        </ul>
      </>
    );
  };

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">{t('pages.home.title')}</h1>
          <p className="govuk-body-l">{t('pages.home.description')}</p>
          <h1 className="govuk-heading-l">{t('pages.home.data-set-title')}</h1>
        </div>
      </div>
      <hr className="govuk-section-break govuk-section-break--s govuk-section-break--visible" />
      {dataSets.isLoading ? (
        <ApplicationSpinner translationKey="pages.home.loading" position="relative" top="100px" />
      ) : (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-quarter govuk-!-margin-top-3">
            <h3 className="govuk-heading-m">{t('pages.home.entities.title')}</h3>
            {renderData()}
          </div>
          <div className="govuk-grid-column-three-quarters">
            {key && filteredDefinitions && filteredDefinitions[key] ? (
              <Entity
                definition={filteredDefinitions[key]}
                entity={{ ...dataSets.data.paths[`/${key}`], key: `/${key}` }}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export const CustomLink = styled.a`
  ${({ active }) =>
    active &&
    css`
      background-color: #ffdd00;
    `}
`;

Home.defaultProps = {
  entity: null,
};

Home.propTypes = {
  entity: PropTypes.string,
};

export default Home;
