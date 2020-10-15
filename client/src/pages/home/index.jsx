import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled, { css } from 'styled-components';
import { useNavigation } from 'react-navi';
import PropTypes from 'prop-types';
import { JSONPath } from 'jsonpath-plus';
import InfiniteScroll from 'react-infinite-scroll-component';
import ApplicationSpinner from '../../components/ApplicationSpinner';
import { useAxios } from '../../utils/hooks';
import Entity from './components/Entity';

const Home = ({ entity }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [dataSets, setDataSets] = useState({
    isLoading: true,
    data: {},
  });
  const [entityKeys, setEntityKeys] = useState([]);
  const [key, setKey] = useState(entity);
  const axiosInstance = useAxios();
  const dataRef = useRef(dataSets.data);
  useEffect(() => {
    const loadDataSet = async () => {
      if (axiosInstance) {
        if (!Object.values(dataRef.current).some((x) => x !== null)) {
          try {
            const response = await axiosInstance('/refdata');
            dataRef.current = response.data;
            setDataSets({
              isLoading: false,
              data: dataRef.current,
            });
            setEntityKeys(Object.keys(dataRef.current.paths));
            setKey(entity ? `/${entity}` : Object.keys(response.data.paths)[1]);
          } catch (e) {
            setDataSets({
              isLoading: false,
              data: {},
            });
          }
        }
      }
    };
    loadDataSet();
  }, [axiosInstance, setDataSets, setEntityKeys, setKey, entity]);

  const renderData = () => {
    if (!dataSets.data.paths) {
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
                  Object.keys(dataSets.data.paths).filter((k) =>
                    k.replace('/', '').toLowerCase().match(e.target.value)
                  )
                );
              } else {
                setEntityKeys(Object.keys(dataSets.data.paths));
                setKey(Object.keys(dataSets.data.paths)[1]);
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
                  href={`/schema${k}`}
                  active={key === k}
                  className="govuk-link govuk-link--no-visited-state"
                  onClick={async (e) => {
                    e.preventDefault();
                    setKey(k);
                    await navigation.navigate(`/schema${k}`, {
                      replace: false,
                    });
                  }}
                >
                  {k.replace('/', '')}
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
            {key && dataSets.data.paths && dataSets.data.paths[key] ? (
              <Entity
                definition={
                  JSONPath({
                    path: `$.definitions['${key.replace('/', '')}']`,
                    json: dataSets.data,
                  })[0]
                }
                entity={{ ...dataSets.data.paths[key], key }}
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
