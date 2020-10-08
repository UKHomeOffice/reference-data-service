import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Schema = ({ definition }) => {
  const defDesc = JSON.parse(definition.description);
  const { t } = useTranslation();
  return (
    <>
      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {t('pages.schema.version')}
          </dt>
          <dd className="govuk-summary-list__value">
            { defDesc.dataversion}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            {t('pages.schema.lastupdated')}
          </dt>
          <dd className="govuk-summary-list__value">
            {defDesc.schemalastupdated ? moment(defDesc.schemalastupdated).format('DD/MM/YYYY')
              : 'N/A'}
          </dd>
        </div>
      </dl>
      <div className="govuk-grid-row govuk-!-margin-top-3">
        <div className="govuk-grid-column-full">
          <TableWrapper>
            <CustomTable className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <CustomTh scope="col" className="govuk-table__header">
                    {t('pages.schema.properties.property')}
                  </CustomTh>
                  <CustomTh scope="col" className="govuk-table__header">
                    {t('pages.schema.properties.label')}
                  </CustomTh>
                  <CustomTh scope="col" className="govuk-table__header">
                    {t('pages.schema.properties.description')}
                  </CustomTh>
                  <CustomTh scope="col" className="govuk-table__header">
                    {t('pages.schema.properties.type')}
                  </CustomTh>
                </tr>
              </thead>
              <CustomTBody className="govuk-table__body">

                {
              Object.keys(definition.properties).map((p) => {
                const { description } = definition.properties[p];
                let parsed = description.replace(/(?:\r\n|\r|\n)/g, '');
                if (parsed.indexOf('Note') !== -1) {
                  parsed = parsed.substring(0, parsed.indexOf('Note'));
                }
                const obj = JSON.parse(parsed);
                return (
                  <tr className="govuk-table__row" key={uuidv4()}>
                    <th scope="row" className="govuk-table__header">{p}</th>
                    <td className="govuk-table__cell">{obj.label}</td>
                    <td className="govuk-table__cell">{obj.description}</td>
                    <td className="govuk-table__cell">{definition.properties[p].type}</td>
                  </tr>
                );
              })
            }

              </CustomTBody>
            </CustomTable>
          </TableWrapper>
        </div>
      </div>

    </>
  );
};

Schema.propTypes = {
  definition: PropTypes.shape({
    description: PropTypes.string,
    properties: PropTypes.shape({}),
  }).isRequired,
};

const TableWrapper = styled.div`
  height: 700px;
  overflow: auto;
`;

const CustomTable = styled.table`
  @media (max-width: 768px) {
    display: block;
    overflow-y: scroll;
    height: 400px;
    overflow-x: auto;
    white-space: nowrap;
  }
`;

const CustomTh = styled.th`
  position: sticky;
  top: 0; 
  background: white;
`;

const CustomTBody = styled.tbody`
 height: 100px;       /* Just for the demo          */
    overflow-y: auto;    /* Trigger vertical scroll    */
    overflow-x: hidden;  /* Hide the horizontal scroll */
`;
export default Schema;
