import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { JSONPath } from 'jsonpath-plus';
import FullData from './components/FullData';
import { RefDataSetContext } from '../../../utils/RefDataSetContext';

const DataPage = ({ entityId, dataId, primaryKey }) => {
  const [selectedOption, setSelectedOption] = useState('data');

  const { dataSetContext } = useContext(RefDataSetContext);
  const definition = JSONPath({
    path: `$.definitions['${entityId}']`,
    json: dataSetContext,
  })[0];

  const { t } = useTranslation();
  const renderSwitch = (param) => {
    switch (param) {
      case 'data':
        return (
          <FullData
            {...{
              entityId,
              dataId,
              primaryKey,
              definition,
            }}
          />
        );
      case 'history':
        return <div>History</div>;
      case 'change-requests':
        return <div>Change Requests</div>;
      case 'edit':
        return <div>Edit</div>;
      case 'delete':
        return <div>Delete</div>;
      default:
        return (
          <FullData
            {...{
              entityId,
              dataId,
              primaryKey,
              definition,
            }}
          />
        );
    }
  };

  if (!definition) {
    return null;
  }
  return (
    <>
      <span className="govuk-caption-l">{`${entityId} entity`}</span>
      <h2 className="govuk-heading-l">{dataId}</h2>
      <div className="govuk-inset-text">{JSON.parse(definition.description).description}</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <ul className="govuk-list">
            <li>
              <CustomLink
                active={selectedOption === 'data'}
                className="govuk-link govuk-link--no-visited-state"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedOption('data');
                }}
              >
                {t('pages.data.record.actions.data')}
              </CustomLink>
            </li>
            <li>
              <CustomLink
                active={selectedOption === 'history'}
                className="govuk-link govuk-link--no-visited-state"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedOption('history');
                }}
              >
                {t('pages.data.record.actions.history')}
              </CustomLink>
            </li>
            <li>
              <CustomLink
                active={selectedOption === 'edit'}
                className="govuk-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedOption('edit');
                }}
              >
                {t('pages.data.record.actions.edit')}
              </CustomLink>
            </li>
            <li>
              <CustomLink
                className="govuk-link"
                active={selectedOption === 'delete'}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedOption('delete');
                }}
              >
                {t('pages.data.record.actions.delete')}
              </CustomLink>
            </li>
            <li>
              <CustomLink
                active={selectedOption === 'change-requests'}
                className="govuk-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedOption('change-requests');
                }}
              >
                {t('pages.data.record.actions.change-requests')}
              </CustomLink>
            </li>
          </ul>
        </div>
        <div className="govuk-grid-column-three-quarters">{renderSwitch(selectedOption)}</div>
      </div>
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

DataPage.propTypes = {
  primaryKey: PropTypes.string.isRequired,
  entityId: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
};

export default DataPage;
