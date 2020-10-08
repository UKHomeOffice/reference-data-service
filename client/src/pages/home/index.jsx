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
  const [key, setKey] = useState(entity);
  const axiosInstance = useAxios();
  const dataRef = useRef(dataSets.data);
  useEffect(() => {
    const loadDataSet = async () => {
      if (axiosInstance) {
        if (!Object.values(dataRef.current).some((x) => (x !== null))) {
          try {
            const response = await axiosInstance('/refdata');
            dataRef.current = response.data;
            setDataSets({
              isLoading: false,
              data: dataRef.current,
            });
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
  }, [axiosInstance, setDataSets, setKey, entity]);

  const renderData = () => {
    if (!dataSets.data.paths) {
      return null;
    }
    const entityKeys = Object.keys(dataSets.data.paths);
    return (
      <ul className="govuk-list" id="entityList">
        <InfiniteScroll
          dataLength={entityKeys.length}
          hasMore={false}
          height={900}
        >
          {

          entityKeys.map((k) => (
            <li key={k}>
              <CustomLink
                href={`/schema${k}`}
                active={key === k}
                className="govuk-link"
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
          ))
        }
        </InfiniteScroll>
      </ul>
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
      {dataSets.isLoading ? <ApplicationSpinner translationKey="pages.home.loading" position="relative" top="100px" /> : (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-quarter govuk-!-margin-top-3">
            <h3 className="govuk-heading-m">{t('pages.home.entities.title')}</h3>
            {renderData()}
          </div>
          <div className="govuk-grid-column-three-quarters">
            {
              key && (dataSets.data.paths && dataSets.data.paths[key]) ? (
                <Entity
                  definition={JSONPath({
                    path: `$.definitions['${key.replace('/', '')}']`, json: dataSets.data,
                  })[0]}
                  entity={{ ...dataSets.data.paths[key], key }}
                />

              ) : null
            }
          </div>
        </div>
      )}
    </>
  );
};

export const CustomLink = styled.a`
 ${({ active }) => active && css`background-color: #ffdd00;`}
`;

Home.defaultProps = {
  entity: null,
};

Home.propTypes = {
  entity: PropTypes.string,
};

export default Home;
