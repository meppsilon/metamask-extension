import { MESSAGE_TYPE } from '../../../../../shared/constants/app';

/**
 * This RPC method that gets metamask contacts via addressBook.
 */

const getAddressBook = {
  methodNames: [MESSAGE_TYPE.GET_ADDRESS_BOOK],
  implementation: getAddressBookHandler,
  hookNames: {
    getAddressBook: true,
  },
};
export default getAddressBook;

/**
 * @typedef {Record<string, Function>} AddressBookHandlerOptions
 * @property {Function} getAddressBook - Gets contacts from address book
 */

/**
 *
 * @param {import('json-rpc-engine').JsonRpcRequest<unknown>} _req - The JSON-RPC request object.
 * @param {import('json-rpc-engine').JsonRpcResponse<true>} res - The JSON-RPC response object.
 * @param {Function} _next - The json-rpc-engine 'next' callback.
 * @param {Function} end - The json-rpc-engine 'end' callback.
 * @param {AddressBookHandlerOptions} options - The RPC method hooks.
 */
async function getAddressBookHandler(
  _req,
  res,
  _next,
  end,
  { getAddressBook: _getAddressBook },
) {
  res.result = await _getAddressBook();
  return end();
}
