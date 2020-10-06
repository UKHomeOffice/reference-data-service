import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled, { css } from 'styled-components';
import { useNavigation } from 'react-navi';
import PropTypes from 'prop-types';
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
  useEffect(() => {
    const loadDataSet = async () => {
      if (axiosInstance) {
        try {
          const response = await axiosInstance('/refdata');
          setDataSets({
            isLoading: false,
            data: response.data,
          });
          setKey(entity ? `/${entity}` : Object.keys(response.data.paths)[1]);
        } catch (e) {
          setDataSets({
            isLoading: false,
            data: {},
          });
        }
      }
    };
    loadDataSet();
  }, [axiosInstance, setDataSets, setKey, entity]);

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
          <div className="govuk-grid-column-full">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third govuk-!-margin-top-3">
                <h3 className="govuk-heading-m">{t('pages.home.entities.title')}</h3>
                <ul className="govuk-list" id="entityList">
                  {

                    dataSets.data.paths ? Object.keys(dataSets.data.paths).map((k) => (
                      <li key={k}>
                        <CustomLink
                          href={`/entity${k}`}
                          active={key === k}
                          className="govuk-link"
                          onClick={async (e) => {
                            e.preventDefault();
                            setKey(k);
                            await navigation.navigate(`/entity${k}`, {
                              replace: false,
                            });
                          }}
                        >
                          {k.replace('/', '')}
                        </CustomLink>
                      </li>
                    )) : null
                }
                </ul>
              </div>
              <div className="govuk-grid-column-two-thirds">
                {
                  key && (dataSets.data.paths && dataSets.data.paths[key]) ? (
                    <Entity entity={dataSets.data.paths[key]} />
                  ) : null
                }
              </div>
            </div>
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
