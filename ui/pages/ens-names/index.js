import React, { useState, useEffect } from 'react';
import copyToClipboard from 'copy-to-clipboard';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { shortenAddress } from '../../helpers/utils/util';
import { getSelectedIdentity } from '../../selectors';
import CopyIcon from '../../components/ui/icon/copy-icon.component';
import Tooltip from '../../components/ui/tooltip';
import { toChecksumHexAddress } from '../../../shared/modules/hexstring-utils';
import { SECOND } from '../../../shared/constants/time';
import { useI18nContext } from '../../hooks/useI18nContext';
// import MenuBar from '../../components/app/menu-bar';
// import { EthOverview } from '../../components/app/wallet-overview';
import ListItem from '../../components/ui/list-item';
// import classnames from 'classnames';
import AssetNavigation from '../asset/components/asset-navigation';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';

// funtion to fetch from subgraph the list of names
const getAddressEnsNames = async (address) => {
  const response = await window.fetch(
    'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    {
      method: 'POST',
      body: JSON.stringify({
        query: `
        {
          accounts(where: { id:"${address}" }) {
            id
            registrations {
                domain {
                    id
                    name
                    resolvedAddress {
                        id
                    }
                    resolver {
                        address
                    }
                }
                registrationDate
                expiryDate
            }
          }
          domains(where: {resolvedAddress: "${address}"}) {
              id
              labelhash
              name
          }
        }`,
      }),
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return response.json();
};

const EnsNames = () => {
  const history = useHistory();
  const [ensNames, setEnsNames] = useState([]);
  const [copied, setCopied] = useState(false);
  const identity = useSelector(getSelectedIdentity);
  const checksummedAddress = toChecksumHexAddress(identity.address);
  const t = useI18nContext();
  const selectedAccountName = identity.ens || identity.name;

  const onClick = (url) => {
    window.open(url);
  };

  useEffect(() => {
    const fetchWrapper = async () => {
      // code to run on component mount
      const names = await getAddressEnsNames(identity.address);
      const consolidatedNames = names.data.domains.map((domain) => {
        const registration = names.data.accounts[0].registrations.find(
          (r) => r.domain.name === domain.name,
        );
        let dateString = '';
        if (registration) {
          const date = new Date();
          date.setTime(registration.expiryDate * 1000);
          dateString = date.toLocaleDateString();
        }
        return {
          name: domain.name,
          expiry: dateString,
          url: `https://app.ens.domains/name/${domain.name}/details`,
        };
      });
      setEnsNames(consolidatedNames);
    };
    fetchWrapper();
  }, [identity.address]);

  return (
    <div className="main-container">
      <div className="home__container">
        <div className="home__main-view">
          <div
            className="home__balance-wrapper"
            style={{ marginBottom: '36px' }}
          >
            <AssetNavigation
              accountName={selectedAccountName}
              assetName="My ENS"
              onBack={() => history.push(DEFAULT_ROUTE)}
              style={{ width: '100%' }}
            />
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
              {selectedAccountName}
            </div>
            <Tooltip
              wrapperClassName="selected-account__tooltip-wrapper"
              position="bottom"
              title={copied ? t('copiedExclamation') : t('copyToClipboard')}
            >
              <div
                style={{ textAlign: 'center', cursor: 'pointer' }}
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
          {ensNames.map((nameObj) => (
            <ListItem
              className="asset-list-item"
              data-testid={nameObj.name}
              key={nameObj.name}
              title={
                <div>
                  <div className="asset-list-item__token-value">
                    {nameObj.name}
                  </div>
                  <div className="asset-list-item__token-symbol">
                    {nameObj.expiry && `Expires: ${nameObj.expiry}`}
                  </div>
                </div>
              }
              onClick={() => onClick(nameObj.url)}
              rightContent={
                <>
                  <i className="fas fa-chevron-right asset-list-item__chevron-right" />
                </>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnsNames;
