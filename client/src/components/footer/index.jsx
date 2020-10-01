import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="govuk-footer " role="contentinfo">
      <div className="govuk-width-container ">
        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow" />
          <hr className="govuk-footer__section-break" />
          <div className="govuk-footer__meta-item">
            <a className="govuk-footer__link govuk-footer__copyright-logo" href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">
              {t('footer.copyright')}
            </a>
          </div>
          <div className="govuk-footer__meta-item">
            {t('footer.powered-by')}
          </div>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
