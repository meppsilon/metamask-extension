import { MESSAGE_TYPE } from '../../../../../shared/constants/app';

/**
 * This RPC method that gets metamask settings via preferences controller.
 */

const getSettings = {
  methodNames: [MESSAGE_TYPE.GET_SETTINGS],
  implementation: getSettingsHandler,
  hookNames: {
    getSettings: true,
  },
};
export default getSettings;

/**
 * @typedef {Record<string, Function>} SettingsHandlerOptions
 * @property {Function} getSettings - Gets settings from preferences controller
 */

/**
 *
 * @param {import('json-rpc-engine').JsonRpcRequest<unknown>} _req - The JSON-RPC request object.
 * @param {import('json-rpc-engine').JsonRpcResponse<true>} res - The JSON-RPC response object.
 * @param {Function} _next - The json-rpc-engine 'next' callback.
 * @param {Function} end - The json-rpc-engine 'end' callback.
 * @param {SettingsHandlerOptions} options - The RPC method hooks.
 */
async function getSettingsHandler(
  _req,
  res,
  _next,
  end,
  { getSettings: _getSettings },
) {
  res.result = await _getSettings();
  return end();
}
