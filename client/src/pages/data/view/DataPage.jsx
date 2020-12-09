import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { JSONPath } from 'jsonpath-plus';
import config from 'react-global-configuration';
import FullData from './components/FullData';
import { RefDataSetContext } from '../../../utils/RefDataSetContext';
import History from './components/History';
import EditData from './components/EditData';
import ChangeRequests from './components/ChangeRequests';
import { useAxios } from '../../../utils/hooks';

const editDataRowProcess = config.get('processes.editDataRowProcess');
const deleteDataRowProcess = config.get('processes.deleteDataRowProcess');

const editDataRowForm = config.get('forms.editDataRowForm');
const deleteDataRowForm = config.get('forms.deleteDataRowForm');

const DataPage = ({ entityId, dataId, businessKey }) => {
  const [selectedOption, setSelectedOption] = useState('data');

  const { dataSetContext } = useContext(RefDataSetContext);
  const definition = JSONPath({
    path: `$.definitions['${entityId}']`,
    json: dataSetContext,
  })[0];

  const { t } = useTranslation();

  const axiosInstance = useAxios();

  const [disableEdit, setDisableEdit] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (axiosInstance) {
      const params = {
        processDefinitionKeyIn: `${editDataRowProcess},${deleteDataRowProcess}`,
        variables: `entity_eq_${entityId},dataId_eq_${dataId}`,
      };
      Promise.all([
        axiosInstance({
          url: '/camunda/engine-rest/history/process-instance/count',
          method: 'GET',
          params,
        }),
        axiosInstance({
          url: '/camunda/engine-rest/process-instance/count',
          method: 'GET',
          params,
        }),
      ])
        .then((values) => {
          const historyResponse = values[0];
          const activeResponse = values[1];
          setCount(historyResponse.data.count);
          setDisableEdit(activeResponse.data.count !== 0);
        })
        .catch(() => {
          setCount(0);
          setDisableEdit(true);
        });
    }
  }, [axiosInstance, entityId, dataId, selectedOption]);

  const renderView = (param) => {
    switch (param) {
      case 'history':
        return (
          <History
            {...{
              entityId,
              dataId,
              businessKey,
              definition,
            }}
          />
        );
      case 'change-requests':
        return (
          <ChangeRequests
            {...{
              entityId,
              dataId,
              businessKey,
              definition,
              editDataRowProcess,
              deleteDataRowProcess,
              count,
            }}
          />
        );
      case 'edit':
        return (
          <EditData
            processName={editDataRowProcess}
            formName={editDataRowForm}
            {...{
              entityId,
              dataId,
              businessKey,
              definition,
            }}
            handleCancel={() => {
              setSelectedOption('data');
            }}
            handleOnSubmit={() => {
              setSelectedOption('change-requests');
            }}
          />
        );
      case 'delete':
        return (
          <EditData
            handleCancel={() => {
              setSelectedOption('data');
            }}
            handleOnSubmit={() => {
              setSelectedOption('change-requests');
            }}
            processName={deleteDataRowProcess}
            formName={deleteDataRowForm}
            {...{
              entityId,
              dataId,
              businessKey,
              definition,
            }}
          />
        );
      default:
        return (
          <FullData
            {...{
              entityId,
              dataId,
              businessKey,
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

      {disableEdit ? (
        <div className="govuk-warning-text" id="runningInstanceWarning">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-warning-text__assistive">Warning</span>
            {t('pages.data.running-instance')}
          </strong>
        </div>
      ) : null}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <ul className="govuk-list">
            <li>
              <CustomLink
                active={selectedOption === 'data'}
                className="govuk-link govuk-link--no-visited-state"
                href="#"
                id="data"
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
                id="history"
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
                className={`govuk-link ${disableEdit ? 'disable' : ''}`}
                href="#"
                id="edit"
                aria-disabled={disableEdit}
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
                active={selectedOption === 'delete'}
                className={`govuk-link ${disableEdit ? 'disable' : ''}`}
                href="#"
                aria-disabled={disableEdit}
                id="delete"
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
                id="change-requests"
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
        <div className="govuk-grid-column-three-quarters">{renderView(selectedOption)}</div>
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

DataPage.defaultProps = {
  view: 'data',
};

DataPage.propTypes = {
  view: PropTypes.string,
  businessKey: PropTypes.string.isRequired,
  entityId: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
};

export default DataPage;
