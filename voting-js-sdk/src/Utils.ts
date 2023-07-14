import * as fs from 'fs';

import {
  CLPublicKey,
  CasperClient,
  Keys
} from "casper-js-sdk";

export function readWasm(path: fs.PathOrFileDescriptor): Uint8Array {
  return new Uint8Array(fs.readFileSync(path))
}

export function readKeys(path: String): Keys.AsymmetricKey {
  return Keys.Ed25519.parseKeyFiles(
    path + "/public_key.pem",
    path + "/secret_key.pem")
}

export async function findKey(
  casperClient: CasperClient,
  contractAccount: CLPublicKey, contractKey: string): Promise<string | undefined> {
  const rootHash = await casperClient.nodeClient.getStateRootHash()
  const accountHash = contractAccount.toAccountHashStr()
  const state = await casperClient.nodeClient
    .getBlockState(rootHash, accountHash, [])
  return state
    .Account
    ?.namedKeys
    .find(key => key.name === contractKey)
    ?.key
}

export function getResult() {
  
}