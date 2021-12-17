import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeWarning } from '../../../../ducks/ens';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { hideModal } from '../../../../store/actions';
import Button from '../../../ui/button';

const EnsExpirationModal = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const ensDomain = useSelector(
    (state) => state.appState.modal.modalState.props.ensDomain,
  );
  console.log(`ensDomain`, ensDomain);
  return (
    <div>
      <h2 style={{ padding: '24px', fontWeight: 'bold', fontSize: '18px' }}>
        Your ENS is about to expire!
      </h2>
      <div
        style={{
          margin: '16px',
          padding: '8px',
          border: '1px solid #D6D9DC',
          color: 'red',
          borderRadius: '8px',
        }}
      >
        <div>Your ENS domain: {ensDomain.name}</div>
        <div style={{ paddingBottom: '32px' }}>
          Expires {ensDomain.expiry.toLocaleString()}
        </div>
      </div>

      <div className="account-details-modal__divider" />

      <div style={{ padding: '0 24px 24px' }}>
        <Button
          type="secondary"
          large
          className="export-private-key-modal__button export-private-key-modal__button--cancel"
          onClick={() => {
            dispatch(hideModal());
            dispatch(closeWarning(ensDomain.name));
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={() => {
            dispatch(hideModal());
            dispatch(closeWarning(ensDomain.name));
            window.open(ensDomain.url);
          }}
          type="primary"
          large
          className="export-private-key-modal__button"
        >
          Renew
        </Button>
      </div>
    </div>
  );
};

export default EnsExpirationModal;
