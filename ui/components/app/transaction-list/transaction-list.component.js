import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { orderBy } from 'lodash';
import {
  nonceSortedCompletedTransactionsSelector,
  nonceSortedPendingTransactionsSelector,
} from '../../../selectors/transactions';
import { getCurrentChainId } from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import TransactionListItem from '../transaction-list-item';
import SmartTransactionListItem from '../transaction-list-item/smart-transaction-list-item.component';
import Button from '../../ui/button';
import { TOKEN_CATEGORY_HASH } from '../../../helpers/constants/transactions';
import { SWAPS_CHAINID_CONTRACT_ADDRESS_MAP } from '../../../../shared/constants/swaps';
import { TRANSACTION_TYPES } from '../../../../shared/constants/transaction';
import { isEqualCaseInsensitive } from '../../../helpers/utils/util';
import { getCurrentSmartTransactions } from '../../../ducks/swaps/swaps';

const PAGE_INCREMENT = 10;

// When we are on a token page, we only want to show transactions that involve that token.
// In the case of token transfers or approvals, these will be transactions sent to the
// token contract. In the case of swaps, these will be transactions sent to the swaps contract
// and which have the token address in the transaction data.
//
// getTransactionGroupRecipientAddressFilter is used to determine whether a transaction matches
// either of those criteria
const getTransactionGroupRecipientAddressFilter = (
  recipientAddress,
  chainId,
) => {
  return ({ initialTransaction: { txParams } }) => {
    return (
      isEqualCaseInsensitive(txParams?.to, recipientAddress) ||
      (txParams?.to === SWAPS_CHAINID_CONTRACT_ADDRESS_MAP[chainId] &&
        txParams.data.match(recipientAddress.slice(2)))
    );
  };
};

const tokenTransactionFilter = ({
  initialTransaction: { type, destinationTokenSymbol, sourceTokenSymbol },
}) => {
  if (TOKEN_CATEGORY_HASH[type]) {
    return false;
  } else if (type === TRANSACTION_TYPES.SWAP) {
    return destinationTokenSymbol === 'ETH' || sourceTokenSymbol === 'ETH';
  }
  return true;
};

const getFilteredTransactionGroups = (
  transactionGroups,
  hideTokenTransactions,
  tokenAddress,
  chainId,
) => {
  if (hideTokenTransactions) {
    return transactionGroups.filter(tokenTransactionFilter);
  } else if (tokenAddress) {
    return transactionGroups.filter(
      getTransactionGroupRecipientAddressFilter(tokenAddress, chainId),
    );
  }
  return transactionGroups;
};

export default function TransactionList({
  hideTokenTransactions,
  tokenAddress,
}) {
  const [limit, setLimit] = useState(PAGE_INCREMENT);
  const t = useI18nContext();

  const unfilteredPendingTransactions = useSelector(
    nonceSortedPendingTransactionsSelector,
  );
  const unfilteredCompletedTransactions = useSelector(
    nonceSortedCompletedTransactionsSelector,
  );
  const chainId = useSelector(getCurrentChainId);
  const smartTransactions = useSelector(getCurrentSmartTransactions);
  const pendingSmartTransactions = useMemo(
    () =>
      smartTransactions
        .filter((stx) => stx.status === 'pending')
        .map((stx) => ({ ...stx, transactionType: 'smart' })),
    [smartTransactions],
  );

  const cancelledSmartTransactions = useMemo(
    () =>
      smartTransactions
        .filter((stx) => stx.status.startsWith('cancelled'))
        .map((stx) => ({ ...stx, transactionType: 'smart' })),
    [smartTransactions],
  );

  const pendingTransactions = useMemo(
    () =>
      getFilteredTransactionGroups(
        unfilteredPendingTransactions,
        hideTokenTransactions,
        tokenAddress,
        chainId,
      ),
    [
      hideTokenTransactions,
      tokenAddress,
      unfilteredPendingTransactions,
      chainId,
    ],
  );
  const completedTransactions = useMemo(
    () =>
      getFilteredTransactionGroups(
        unfilteredCompletedTransactions,
        hideTokenTransactions,
        tokenAddress,
        chainId,
      ),
    [
      hideTokenTransactions,
      tokenAddress,
      unfilteredCompletedTransactions,
      chainId,
    ],
  );

  const viewMore = useCallback(
    () => setLimit((prev) => prev + PAGE_INCREMENT),
    [],
  );

  const totalPendingTransactions = orderBy(
    pendingSmartTransactions.concat(pendingTransactions),
    [
      (transaction) =>
        transaction.transactionType === 'smart'
          ? transaction.txParams?.nonce
          : transaction.initialTransaction?.txParams?.nonce,
    ],
    ['desc'],
  );

  const totalCompletedTransactions = completedTransactions.concat(
    cancelledSmartTransactions,
  );

  return (
    <div className="transaction-list">
      <div className="transaction-list__transactions">
        {totalPendingTransactions.length > 0 && (
          <div className="transaction-list__pending-transactions">
            <div className="transaction-list__header">
              {`${t('queue')} (${totalPendingTransactions.length})`}
            </div>
            {pendingSmartTransactions.map((smartTransaction, index) => (
              <SmartTransactionListItem
                isEarliestNonce={index === 0}
                smartTransaction={smartTransaction}
                key={`${smartTransaction.nonce}:${index}`}
              />
            ))}
            {pendingTransactions.map((transactionGroup, index) => (
              <TransactionListItem
                isEarliestNonce={index === 0}
                transactionGroup={transactionGroup}
                key={`${transactionGroup.nonce}:${index}`}
              />
            ))}
          </div>
        )}
        <div className="transaction-list__completed-transactions">
          {totalPendingTransactions.length > 0 ? (
            <div className="transaction-list__header">{t('history')}</div>
          ) : null}
          {totalCompletedTransactions.length > 0 ? (
            totalCompletedTransactions
              .slice(0, limit)
              .map((transactionGroup, index) =>
                transactionGroup.transactionType === 'smart' ? (
                  <SmartTransactionListItem
                    smartTransaction={transactionGroup}
                    key={`${transactionGroup.nonce}:${index}`}
                  />
                ) : (
                  <TransactionListItem
                    transactionGroup={transactionGroup}
                    key={`${transactionGroup.nonce}:${limit + index - 10}`}
                  />
                ),
              )
          ) : (
            <div className="transaction-list__empty">
              <div className="transaction-list__empty-text">
                {t('noTransactions')}
              </div>
            </div>
          )}
          {totalCompletedTransactions.length > limit && (
            <Button
              className="transaction-list__view-more"
              type="secondary"
              onClick={viewMore}
            >
              {t('viewMore')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

TransactionList.propTypes = {
  hideTokenTransactions: PropTypes.bool,
  tokenAddress: PropTypes.string,
};

TransactionList.defaultProps = {
  hideTokenTransactions: false,
  tokenAddress: undefined,
};
