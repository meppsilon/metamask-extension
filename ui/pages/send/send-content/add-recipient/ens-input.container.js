import { debounce } from 'lodash';
import { connect } from 'react-redux';
import {
  lookupEnsName,
  fetchEnsDomains,
  initializeEnsSlice,
  resetEnsResolution,
} from '../../../../ducks/ens';
import EnsInput from './ens-input.component';

function mapDispatchToProps(dispatch) {
  return {
    lookupEnsName: debounce((ensName) => dispatch(lookupEnsName(ensName)), 150),
    fetchEnsDomains: debounce(
      (ensName) => dispatch(fetchEnsDomains(ensName)),
      150,
    ),
    initializeEnsSlice: () => dispatch(initializeEnsSlice()),
    resetEnsResolution: debounce(() => dispatch(resetEnsResolution()), 300),
  };
}

export default connect(null, mapDispatchToProps)(EnsInput);
