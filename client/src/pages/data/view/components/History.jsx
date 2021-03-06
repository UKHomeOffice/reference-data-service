import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import ApplicationSpinner from '../../../../components/ApplicationSpinner';
import { useAxios } from '../../../../utils/hooks';
import { Card } from '../../../../components/styles';
import { getDescription } from '../../../../utils/dataUtil';

const History = ({ entityId, dataId, definition, businessKey }) => {
  const { t } = useTranslation();
  const [data, setData] = useState({
    isLoading: true,
    failed: false,
    page: 0,
    total: 0,
    content: [],
  });

  const axiosInstance = useAxios();

  useEffect(() => {
    if (axiosInstance) {
      axiosInstance({
        headers: {
          Prefer: 'count=exact',
        },
        method: 'GET',
        url: `/refdata/${entityId}`,
        params: {
          [`${businessKey}`]: `eq.${dataId}`,
          limit: 10,
          offset: 0,
          order: 'validto.desc.nullsfirst',
        },
      })
        .then((response) => {
          const totalCount = response.headers['content-range'].split('/')[1];
          setData({
            isLoading: false,
            failed: false,
            content: response.data,
            page: 0,
            total: totalCount,
          });
        })
        .catch(() => {
          setData({
            isLoading: false,
            failed: true,
            page: 0,
            total: 0,
            content: [],
          });
        });
    }
  }, [axiosInstance, setData, businessKey, dataId, entityId]);

  const loadNext = useCallback(
    (page) => {
      axiosInstance({
        method: 'GET',
        url: `/refdata/${entityId}`,
        params: {
          limit: 10,
          offset: page,
          order: 'id.asc',
          [`${businessKey}`]: `eq.${dataId}`,
        },
      }).then((response) => {
        setData({
          ...data,
          page,
          content: _.union(data.content, response.data),
        });
      });
    },
    [axiosInstance, setData, data, businessKey, entityId, dataId]
  );

  return data.isLoading ? (
    <ApplicationSpinner />
  ) : (
    <>
      <h2 className="govuk-heading-l">{t('pages.data.record.actions.history')}</h2>
      <h3 className="govuk-heading-m">
        {' '}
        {t('pages.data.history.size.keyWithCount', { count: data.total })}
      </h3>
      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
      <ul className="govuk-list">
        <InfiniteScroll
          next={() => {
            loadNext(data.page + 10);
          }}
          dataLength={data.content.length}
          hasMore={data.content.length < data.total}
          height={700}
          loader={
            <h5 id="loading-text" className="govuk-heading-s govuk-!-margin-top-3">
              {t('pages.data.history.loading', { dataId })}
            </h5>
          }
          endMessage={
            <h5 id="no-more-data" className="govuk-heading-s govuk-!-margin-top-3">
              {t('pages.data.history.no-more', { dataId })}
            </h5>
          }
        >
          {data.content.map((d) => (
            <li key={uuidv4()}>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                  <Card>
                    <dl className="govuk-summary-list govuk-summary-list--no-border">
                      {Object.keys(definition.properties).map((c) => {
                        const obj = getDescription(c, definition);
                        return (
                          <div className="govuk-summary-list__row" key={uuidv4()}>
                            <dt className="govuk-summary-list__key">{`${obj.label}:`}</dt>
                            <dd className="govuk-summary-list__value">{d[c]}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </Card>
                </div>
              </div>
            </li>
          ))}
        </InfiniteScroll>
      </ul>
    </>
  );
};

History.propTypes = {
  definition: PropTypes.shape({
    properties: PropTypes.shape({}).isRequired,
  }).isRequired,
  businessKey: PropTypes.string.isRequired,
  dataId: PropTypes.string.isRequired,
  entityId: PropTypes.string.isRequired,
};

export default History;
