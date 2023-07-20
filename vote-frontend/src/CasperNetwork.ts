import {
  CasperClient,
  Contracts,
  RuntimeArgs,
  CLPublicKey,
  DeployUtil,
  Keys,
  GetDeployResult,
  CLValueBuilder,
  CLMap,
  CLString,
  CLBool,
  CLValueParsers,
  encodeBase16,
  decodeBase64

} from "casper-js-sdk";

export const NODE_URL = 'http://localhost:11101/rpc';
export const NETWORK_NAME = 'casper-net-1';

export const casperClient = new CasperClient(NODE_URL);
export const contractClient = new Contracts.Contract(casperClient);

export const OWNER_KEY = Keys.Ed25519.parsePublicKey(
  decodeBase64("0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55")
);
// 0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55
