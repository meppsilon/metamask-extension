import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import copyToClipboard from 'copy-to-clipboard';
import { shortenAddress } from '../../helpers/utils/util';
import { getSelectedIdentity } from '../../selectors';
import CopyIcon from '../../components/ui/icon/copy-icon.component';
import Tooltip from '../../components/ui/tooltip';
import { toChecksumHexAddress } from '../../../shared/modules/hexstring-utils';
import { SECOND } from '../../../shared/constants/time';
import { useI18nContext } from '../../hooks/useI18nContext';
// import MenuBar from '../../components/app/menu-bar';
// import { EthOverview } from '../../components/app/wallet-overview';
// import ListItem from '../../components/ui/list-item';
// import classnames from 'classnames';

const EnsNames = () => {
  const [copied, setCopied] = useState(false);
  const identity = useSelector(getSelectedIdentity);
  const checksummedAddress = toChecksumHexAddress(identity);
  const t = useI18nContext();
  return (
    <div className="main-container">
      <div className="home__container">
        <div className="home__main-view">
          <div className="home__balance-wrapper">
            <div
              style={{
                fontFamily: 'Roboto',
                fontWeight: 700,
                fontSize: '14px',
                padding: '20px 40px',
                color: '#24292E',
                width: '100%',
              }}
            >
              My ENS
            </div>
            <div
              style={{
                fontFamily: 'Roboto',
                fontStyle: 'normal',
                fontWeight: 'bold',
                fontSize: '32px',
                marginTop: '56px',
                marginBottom: '20px',
              }}
            >
              {identity.ens || identity.name || ''}
            </div>
            <Tooltip
              wrapperClassName="selected-account__tooltip-wrapper"
              position="bottom"
              title={copied ? t('copiedExclamation') : t('copyToClipboard')}
            >
              <div
                style={{ textAlign: 'center' }}
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), SECOND * 3);
                  copyToClipboard(checksummedAddress);
                }}
              >
                {shortenAddress(identity.address)}
                <div className="selected-account__copy">
                  <CopyIcon size={11} color="#989a9b" />
                </div>
              </div>
            </Tooltip>
          </div>
          {/* <ListItem
            className={classnames('asset-list-item', className)}
            data-testid={dataTestId}
            title={
              <button
                className="asset-list-item__token-button"
                onClick={onClick}
                title={`${primary} ${tokenSymbol}`}
              >
                <h2>
                  <span className="asset-list-item__token-value">
                    {primary}
                  </span>
                  <span className="asset-list-item__token-symbol">
                    {tokenSymbol}
                  </span>
                </h2>
              </button>
            }
            titleIcon={titleIcon}
            subtitle={secondary ? <h3 title={secondary}>{secondary}</h3> : null}
            onClick={onClick}
            icon={
              <Identicon
                className={iconClassName}
                diameter={32}
                address={tokenAddress}
                image={tokenImage}
                alt={`${primary} ${tokenSymbol}`}
                imageBorder={identiconBorder}
              />
            }
            midContent={midContent}
            rightContent={
              !isERC721 && (
                <>
                  <i className="fas fa-chevron-right asset-list-item__chevron-right" />
                  {sendTokenButton}
                </>
              )
            }
          /> */}
        </div>
      </div>
    </div>
  );
};

export default EnsNames;
