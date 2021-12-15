import punycode from 'punycode/punycode';
import { ObservableStore } from '@metamask/obs-store';
import log from 'loglevel';
import { CHAIN_ID_TO_NETWORK_ID_MAP } from '../../../../shared/constants/network';
import { toChecksumHexAddress } from '../../../../shared/modules/hexstring-utils';
import Ens from './ens';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_X_ERROR_ADDRESS = '0x';

export default class EnsController {
  constructor({ ens, provider, onNetworkDidChange, getCurrentChainId } = {}) {
    const initState = {
      ensResolutionsByAddress: {},
    };

    this._ens = ens;
    if (!this._ens) {
      const chainId = getCurrentChainId();
      const network = CHAIN_ID_TO_NETWORK_ID_MAP[chainId];
      if (Ens.getNetworkEnsSupport(network)) {
        this._ens = new Ens({
          network,
          provider,
        });
      }
    }

    this.store = new ObservableStore(initState);
    onNetworkDidChange(() => {
      this.store.putState(initState);
      const chainId = getCurrentChainId();
      const network = CHAIN_ID_TO_NETWORK_ID_MAP[chainId];
      if (Ens.getNetworkEnsSupport(network)) {
        this._ens = new Ens({
          network,
          provider,
        });
      } else {
        delete this._ens;
      }
    });
  }

  reverseResolveAddress(address) {
    console.log(`address`, address);
    return this._reverseResolveAddress(toChecksumHexAddress(address));
  }

  async _reverseResolveAddress(address) {
    if (!this._ens) {
      console.log('not ens');
      return undefined;
    }

    console.log('reverse resolve', address);

    const state = this.store.getState();
    if (state.ensResolutionsByAddress[address]) {
      console.log('has state');
      return state.ensResolutionsByAddress[address];
    }

    let domain;
    try {
      domain = await this._ens.reverse(address);
    } catch (error) {
      console.log('domain error', error);
      log.debug(error);
      return undefined;
    }
    console.log(`domain`, domain);

    let registeredAddress;
    try {
      registeredAddress = await this._ens.lookup(domain);
    } catch (error) {
      console.log('registered address error');
      log.debug(error);
      return undefined;
    }
    console.log(`registeredAddress`, registeredAddress);

    if (
      registeredAddress === ZERO_ADDRESS ||
      registeredAddress === ZERO_X_ERROR_ADDRESS
    ) {
      return undefined;
    }

    if (toChecksumHexAddress(registeredAddress) !== address) {
      return undefined;
    }

    this._updateResolutionsByAddress(
      address.toLowerCase(),
      punycode.toASCII(domain),
    );
    return domain;
  }

  _updateResolutionsByAddress(address, domain) {
    const oldState = this.store.getState();
    this.store.putState({
      ensResolutionsByAddress: {
        ...oldState.ensResolutionsByAddress,
        [address]: domain,
      },
    });
  }
}
