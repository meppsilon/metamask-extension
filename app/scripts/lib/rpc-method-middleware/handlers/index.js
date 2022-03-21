import addEthereumChain from './add-ethereum-chain';
import ethAccounts from './eth-accounts';
import getAddressBook from './get-address-book';
import getSettings from './get-settings';
import getProviderState from './get-provider-state';
import logWeb3ShimUsage from './log-web3-shim-usage';
import requestAccounts from './request-accounts';
import sendMetadata from './send-metadata';
import switchEthereumChain from './switch-ethereum-chain';
import watchAsset from './watch-asset';

const handlers = [
  addEthereumChain,
  ethAccounts,
  getAddressBook,
  getSettings,
  getProviderState,
  logWeb3ShimUsage,
  requestAccounts,
  sendMetadata,
  switchEthereumChain,
  watchAsset,
];
export default handlers;
