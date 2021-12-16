import { createSlice } from '@reduxjs/toolkit';
import ENS from 'ethjs-ens';
import log from 'loglevel';
import networkMap from 'ethereum-ens-network-map';
import { isConfusing } from 'unicode-confusables';
import { isHexString } from 'ethereumjs-util';
// import fetchWithCache from '../../helpers/utils/fetch-with-cache';

import { getCurrentChainId } from '../selectors';
import {
  CHAIN_ID_TO_NETWORK_ID_MAP,
  MAINNET_NETWORK_ID,
} from '../../shared/constants/network';
import {
  CONFUSING_ENS_ERROR,
  ENS_ILLEGAL_CHARACTER,
  ENS_NOT_FOUND_ON_NETWORK,
  ENS_NOT_SUPPORTED_ON_NETWORK,
  ENS_NO_ADDRESS_FOR_NAME,
  ENS_REGISTRATION_ERROR,
  ENS_UNKNOWN_ERROR,
} from '../pages/send/send.constants';
import { isValidDomainName } from '../helpers/utils/util';
import { CHAIN_CHANGED } from '../store/actionConstants';
import {
  BURN_ADDRESS,
  isBurnAddress,
  isValidHexAddress,
} from '../../shared/modules/hexstring-utils';

// Local Constants
const ZERO_X_ERROR_ADDRESS = '0x';

const initialState = {
  stage: 'UNINITIALIZED',
  resolution: null,
  error: null,
  warning: null,
  network: null,
  domainsLoading: false,
  domains: [],
  domainsError: null,
};

export const ensInitialState = initialState;

const name = 'ENS';

let ens = null;

const slice = createSlice({
  name,
  initialState,
  reducers: {
    ensLookup: (state, action) => {
      // first clear out the previous state
      state.resolution = null;
      state.error = null;
      state.warning = null;
      const { address, ensName, error, network } = action.payload;

      if (error) {
        if (
          isValidDomainName(ensName) &&
          error.message === 'ENS name not defined.'
        ) {
          state.error =
            network === MAINNET_NETWORK_ID
              ? ENS_NO_ADDRESS_FOR_NAME
              : ENS_NOT_FOUND_ON_NETWORK;
        } else if (error.message === 'Illegal Character for ENS.') {
          state.error = ENS_ILLEGAL_CHARACTER;
        } else {
          log.error(error);
          state.error = ENS_UNKNOWN_ERROR;
        }
      } else if (address) {
        if (address === BURN_ADDRESS) {
          state.error = ENS_NO_ADDRESS_FOR_NAME;
        } else if (address === ZERO_X_ERROR_ADDRESS) {
          state.error = ENS_REGISTRATION_ERROR;
        } else {
          state.resolution = address;
        }
        if (isValidDomainName(address) && isConfusing(address)) {
          state.warning = CONFUSING_ENS_ERROR;
        }
      }
    },
    enableEnsLookup: (state, action) => {
      state.stage = 'INITIALIZED';
      state.error = null;
      state.resolution = null;
      state.warning = null;
      state.network = action.payload;
    },
    disableEnsLookup: (state) => {
      state.stage = 'NO_NETWORK_SUPPORT';
      state.error = null;
      state.warning = null;
      state.resolution = null;
      state.network = null;
    },
    ensNotSupported: (state) => {
      state.resolution = null;
      state.warning = null;
      state.error = ENS_NOT_SUPPORTED_ON_NETWORK;
    },
    resetEnsResolution: (state) => {
      state.resolution = null;
      state.warning = null;
      state.error = null;
    },
    fetchEnsDomainsLoading: (state) => {
      state.domainsLoading = true;
      state.domainsError = false;
    },
    fetchEnsDomainsSuccess: (state, action) => {
      state.domainsLoading = false;
      state.domainsError = null;
      state.domains = action.payload;
    },
    fetchEnsDomainsError: (state, action) => {
      state.domainsLoading = false;
      state.domainsError = action.payload;
      state.domains = [];
    },
    resetEnsDomains: (state) => {
      console.log('reset ens domains');
      state.domains = [];
      state.domainsLoading = false;
      state.domainsError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(CHAIN_CHANGED, (state, action) => {
      if (action.payload !== state.currentChainId) {
        state.stage = 'UNINITIALIZED';
        ens = null;
      }
    });
  },
});

const { reducer, actions } = slice;
export default reducer;

const {
  disableEnsLookup,
  ensLookup,
  enableEnsLookup,
  ensNotSupported,
  resetEnsResolution,
  fetchEnsDomainsLoading,
  fetchEnsDomainsSuccess,
  fetchEnsDomainsError,
  resetEnsDomains,
} = actions;
export { resetEnsResolution, resetEnsDomains };

export function initializeEnsSlice() {
  return (dispatch, getState) => {
    const state = getState();
    const chainId = getCurrentChainId(state);
    const network = CHAIN_ID_TO_NETWORK_ID_MAP[chainId];
    const networkIsSupported = Boolean(networkMap[network]);
    if (networkIsSupported) {
      ens = new ENS({ provider: global.ethereumProvider, network });
      dispatch(enableEnsLookup(network));
    } else {
      ens = null;
      dispatch(disableEnsLookup());
    }
  };
}

export function lookupEnsName(ensName) {
  return async (dispatch, getState) => {
    const trimmedEnsName = ensName.trim();
    let state = getState();
    if (state[name].stage === 'UNINITIALIZED') {
      await dispatch(initializeEnsSlice());
    }
    state = getState();
    if (
      state[name].stage === 'NO_NETWORK_SUPPORT' &&
      !(
        isBurnAddress(trimmedEnsName) === false &&
        isValidHexAddress(trimmedEnsName, { mixedCaseUseChecksum: true })
      ) &&
      !isHexString(trimmedEnsName)
    ) {
      await dispatch(ensNotSupported());
    } else {
      log.info(`ENS attempting to resolve name: ${trimmedEnsName}`);
      let address;
      let error;
      try {
        address = await ens.lookup(trimmedEnsName);
      } catch (err) {
        error = err;
      }
      const chainId = getCurrentChainId(state);
      const network = CHAIN_ID_TO_NETWORK_ID_MAP[chainId];
      await dispatch(
        ensLookup({
          ensName: trimmedEnsName,
          address,
          error,
          chainId,
          network,
        }),
      );
    }
  };
}

const silentFailureEnsLookup = async (domain) => {
  let address;
  try {
    address = await ens.lookup(domain.name);
  } catch (e) {
    return undefined;
  }
  return { name: domain.name, address };
};

export function fetchEnsDomains(ensInput) {
  return async (dispatch) => {
    dispatch(fetchEnsDomainsLoading());
    try {
      const response = await window.fetch(
        'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
        {
          method: 'POST',
          body: JSON.stringify({
            query: `
            {
              domains(where: { name_starts_with: "${ensInput}" }) {
                name
                resolvedAddress {
                  id
                }
              }
            }`,
          }),
          headers: { 'Content-Type': 'application/json' },
        },
      );
      const json = await response.json();
      const { domains } = json.data;
      const filteredDomains = domains.filter(
        (domain) => domain.resolvedAddress,
      );
      const resolvedDomains = await Promise.all(
        filteredDomains.map(silentFailureEnsLookup),
      );
      const filteredResolvedDomains = resolvedDomains.filter((domain) =>
        Boolean(domain),
      );
      dispatch(fetchEnsDomainsSuccess(filteredResolvedDomains));
    } catch (e) {
      console.error('ens domains error', e);
      dispatch(fetchEnsDomainsError(e.message));
    }
  };
}

export function getEnsResolution(state) {
  return state[name].resolution;
}

export function getEnsError(state) {
  return state[name].error;
}

export function getEnsWarning(state) {
  return state[name].warning;
}

export function getEnsDomains(state) {
  return state[name].domains;
}
