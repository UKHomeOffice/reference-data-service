import React, { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAxios } from './hooks';
import ApplicationSpinner from '../components/ApplicationSpinner';

export const RefDataSetContext = createContext({
  dataSetContext: {},
});

export const RefDataSetContextProvider = ({ children }) => {
  const [dataSetContext, setDataSetContext] = useState({
    isLoading: true,
  });
  const axiosInstance = useAxios();
  useEffect(() => {
    const loadDataSet = async () => {
      if (axiosInstance) {
        try {
          const response = await axiosInstance('/refdata');
          setDataSetContext({
            isLoading: false,
            failed: false,
            ...response.data,
          });
          // eslint-disable-next-line no-empty
        } catch (e) {
          setDataSetContext({
            isLoading: false,
            failed: true,
          });
        }
      }
    };
    loadDataSet().then(() => {});
  }, [axiosInstance, setDataSetContext]);

  if (dataSetContext.isLoading) {
    return <ApplicationSpinner />;
  }

  if (dataSetContext.failed) {
    return null;
  }

  return (
    <RefDataSetContext.Provider value={{ dataSetContext }}>{children}</RefDataSetContext.Provider>
  );
};

RefDataSetContextProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
