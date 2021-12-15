import { connect } from 'react-redux';
import { getSelectedIdentity, getSelectedEns } from '../../../selectors';
import { tryReverseResolveAddress } from '../../../store/actions';
import SelectedAccount from './selected-account.component';

const mapStateToProps = (state) => {
  return {
    selectedIdentity: getSelectedIdentity(state),
    selectedEns: getSelectedEns(state),
  };
};

export default connect(mapStateToProps, { tryReverseResolveAddress })(
  SelectedAccount,
);
