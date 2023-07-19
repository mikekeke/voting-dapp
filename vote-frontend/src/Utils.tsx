
import {
  CLPublicKey,
  CasperClient,
  Keys,
  decodeBase64
} from "casper-js-sdk";


export function userTwoKeys(): Keys.AsymmetricKey {
  const privateKey = Keys.Ed25519.parsePrivateKey(
    decodeBase64("MC4CAQAwBQYDK2VwBCIEIJ3WEDyVs7vJpLbBtrsqSeOBAZaX9q0lCiGKYtGzqXgF"));
  console.log("parsing keys")
  return Keys.Ed25519.parseKeyPair(
    Keys.Ed25519.privateToPublicKey(privateKey),
    privateKey
  )
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
