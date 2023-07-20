import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
// import { Wallet } from './Wallet';
import { Proposals } from './Proposals';
import { ICurrentKey } from './AppTypes'
import { Wallet } from './Wallet';
import { Vote } from './Vote';
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
const PACKAGE_HASH = "hash-529374f3bbc36e7e8d7b13cb014e6dab224f5227d37d2dcd0a73ac9901ed73b3";

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
      <Vote pubKey={pubKey} />
      <Proposals />
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