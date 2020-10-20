import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from 'react-navi';
import styled from 'styled-components';
import config from 'react-global-configuration';
import SkipLink from '../SkipLink';

const Header = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const path = navigation.getCurrentValue().url.pathname;
  return (
    <>
      <header className="govuk-header" role="banner" data-module="govuk-header">
        <SkipLink />
        <div className="govuk-header__container govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <HeaderContent>
                <a
                  href="/"
                  id="home"
                  onClick={async (e) => {
                    e.preventDefault();
                    await navigation.navigate('/');
                  }}
                  className="govuk-header__link govuk-header__link--service-name"
                >
                  {t('header.service-name')}
                </a>
                <>
                  <button
                    type="button"
                    className="govuk-header__menu-button govuk-js-header-toggle"
                    aria-controls="navigation"
                    aria-label="Show or hide Top Level Navigation"
                  >
                    {t('header.menu')}
                  </button>
                  <nav>
                    <ul
                      id="navigation"
                      className="govuk-header__navigation "
                      aria-label="Top Level Navigation"
                    >
                      <li
                        className={`govuk-header__navigation-item ${
                          path === '/' || path.startsWith('/schema')
                            ? 'govuk-header__navigation-item--active'
                            : ''
                        }`}
                      >
                        <a
                          className="govuk-header__link"
                          href="/"
                          id="dataset"
                          onClick={async (e) => {
                            e.preventDefault();
                            await navigation.navigate('/');
                          }}
                        >
                          {t('pages.home.data-set-title')}
                        </a>
                      </li>
                      <li
                        className={`govuk-header__navigation-item ${
                          path === '/dataset/new' ? 'govuk-header__navigation-item--active' : ''
                        }`}
                      >
                        <a
                          className="govuk-header__link"
                          href="/dataset/new"
                          id="newDataSet"
                          onClick={async (e) => {
                            e.preventDefault();
                            await navigation.navigate('/dataset/new');
                          }}
                        >
                          {t('pages.new-dataset.title')}
                        </a>
                      </li>
                      <li
                        className={`govuk-header__navigation-item ${
                          path.startsWith('/change-requests')
                            ? 'govuk-header__navigation-item--active'
                            : ''
                        }`}
                      >
                        <a
                          className="govuk-header__link"
                          href="/change-requests"
                          id="change-requests"
                          onClick={async (e) => {
                            e.preventDefault();
                            await navigation.navigate('/change-requests');
                          }}
                        >
                          {t('pages.change-requests.title')}
                        </a>
                      </li>
                    </ul>
                  </nav>
                </>
              </HeaderContent>
            </div>
            <StyledCol>
              <NavLink
                id="support"
                className="govuk-header__link"
                href={config.get('supportUrl')}
                target="_blank"
              >
                {t('header.support')}
              </NavLink>
              <NavLink
                className="govuk-header__link"
                href="/logout"
                id="logout"
                onClick={async (e) => {
                  e.preventDefault();
                  await navigation.navigate('/logout');
                }}
              >
                {t('header.sign-out')}
              </NavLink>
            </StyledCol>
          </div>
        </div>
      </header>
      <div className="govuk-phase-banner govuk-width-container">
        <p className="govuk-phase-banner__content">
          <strong className="govuk-tag govuk-phase-banner__content__tag ">
            {config.get('uiVersion')}
          </strong>
          <span>
            <strong className="govuk-tag govuk-phase-banner__content__tag ">
              {config.get('uiEnvironment')}
            </strong>
          </span>
          <span className="govuk-phase-banner__text">
            {t('header.new-service-1')}{' '}
            <a
              className="govuk-link"
              href={config.get('serviceDeskUrl')}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('header.new-service-2')}
            </a>{' '}
            {t('header.new-service-3')}
          </span>
        </p>
      </div>
    </>
  );
};

const StyledCol = styled.div`
  @includes govuk-grid-column-one-half;
  font-weight: bold;
  padding-top: 5px;
  margin-right: 20px;
  text-align: right;
  padding-bottom: 10px;
`;

const NavLink = styled.a`
  margin-left: 20px;
`;

const HeaderContent = styled.div`
  @includes: govuk-header__content;
  width: 100%;
`;

export default Header;
