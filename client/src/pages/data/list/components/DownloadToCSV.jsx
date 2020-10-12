import React, { useCallback, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { CSVLink } from 'react-csv';
import PropTypes from 'prop-types';
import { useAxios } from '../../../../utils/hooks';

const DownloadToCSV = ({ entity, appliedColumns }) => {
  const { t } = useTranslation();
  const csvLinkRef = useRef();
  const axiosInstance = useAxios();
  const [csvData, setCsvData] = useState({
    isGenerating: false,
    data: [],
  });

  const loadCsvData = useCallback(() => {
    setCsvData({
      ...csvData,
      isGenerating: true,
    });
    axiosInstance({
      method: 'GET',
      url: `/refdata/${entity}`,
      params: {
        order: 'id.asc',
        select: appliedColumns.map((col) => col.key).toString(),
      },
      headers: {
        Prefer: 'count=exact',
      },
    }).then((response) => {
      setCsvData({
        isGenerating: false,
        data: response.data,
      });
      csvLinkRef.current.link.click();
    }).catch(() => {
      setCsvData({
        isGenerating: false,
        data: [],
      });
    });
  }, [axiosInstance, appliedColumns, setCsvData, csvLinkRef, csvData]);

  return (
    <div className="govuk-!-margin-top-3">
      <button
        id="download"
        className={`govuk-button ${csvData.isGenerating ? 'govuk-button--disabled' : ''}`}
        type="button"
        data-module="govuk-button"
        disabled={csvData.isGenerating}
        onClick={() => {
          loadCsvData();
        }}
      >
        { csvData.isGenerating ? t('pages.data.list.csv.generating') : t('pages.data.list.csv.generate')}
      </button>
      <CSVLink
        data={csvData.data}
        headers={appliedColumns}
        ref={csvLinkRef}
        filename={`${entity}.csv`}
        style={{ display: 'hidden' }}
        target="_blank"
      />
    </div>
  );
};

DownloadToCSV.propTypes = {
  entity: PropTypes.string.isRequired,
  appliedColumns: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
  })).isRequired,
};
export default DownloadToCSV;