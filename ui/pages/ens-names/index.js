import React from 'react';
import MenuBar from '../../components/app/menu-bar';
import { EthOverview } from '../../components/app/wallet-overview';
import ListItem from '../../components/ui/list-item';
import classnames from 'classnames';


const EnsNames = () => {
  return (
    <div className="main-container">
      <div className="home__container">
        <div className="home__main-view">
          <div className="home__balance-wrapper">
            <EthOverview />
          </div>
          <ListItem
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
          />
        </div>
      </div>
    </div>
  );
};

export default EnsNames;
