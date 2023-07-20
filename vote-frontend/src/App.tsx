import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
// import { Wallet } from './Wallet';
import { Proposals } from './Proposals';
import { ICurrentKey } from './AppTypes'
import { Wallet } from './Wallet';
import { Voting } from './Voting';
import { casperClient, contractClient } from './CasperNetwork'
// import Wallet from './Wallet';
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
  encodeBase16

} from "casper-js-sdk";

declare global {
  interface Window {
    CasperWalletProvider: any;
  }
}

// const GOVERNOR_PACKAGE_HASH_KEY = "governor_package_hash";

// todo: how to pass it from outside? From input field?
const PACKAGE_HASH = "hash-19cbef0e3af5edf681e4f016c9e2703fc63a1cf6abdd3bfc58aa891b32784524";

function App() {
  const [pubKey, setPubKey] = useState<ICurrentKey>({ pubKey: undefined });
  const [contractHash, setContractHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    findContractHash(PACKAGE_HASH)
      .then(setContractHash)
  });

  const setKey = (keyHash: string) => {
    setPubKey({ pubKey: keyHash })
  }

  return (
    <div className="App">
      <p>Current key: {pubKey.pubKey}</p>
      <p>Contract hash: {contractHash}</p>
      <Wallet
        pubKey={pubKey}
        setKey={setKey}
      />
      <Proposals pubKey={pubKey}/>
    </div>
  );
}

export default App;

async function findContractHash(packageHash: string): Promise<string> {
  const rootHash = await casperClient.nodeClient.getStateRootHash();
  let contractHash = await casperClient.nodeClient
    .getBlockState(rootHash, packageHash, [])
    .then(p => p.ContractPackage?.versions[0].contractHash);

  console.log(`Contract hash: ${contractHash}`)
  if (!contractHash) {
    throw new Error(`Failed to find contract hash for package hash ${packageHash}`)
  }
  contractHash = contractHash!.replace("contract-", "hash-");
  contractClient.setContractHash(contractHash);
  return contractHash
}