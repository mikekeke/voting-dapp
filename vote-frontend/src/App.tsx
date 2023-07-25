import { useEffect, useState } from 'react';
import './App.css';
import { Proposals } from './Proposals';
import { IContractInfo, ICurrentKey } from './AppTypes'
import { Wallet } from './Wallet';
import { casperClient, contractClient, queryDeployedGovernor } from './CasperNetwork'
import { NewProposal } from './NewProposal';

declare global {
  interface Window {
    CasperWalletProvider: any;
  }
}

function App() {
  const [pubKey, setPubKey] = useState<ICurrentKey>({ pubKey: undefined });
  const [contractInfo, setContractInfo] = useState<IContractInfo | undefined>(undefined);

  useEffect(() => {
    intiContractClient()
      .then(setContractInfo)
  });

  const setKey = (keyHash: string) => {
    setPubKey({ pubKey: keyHash })
  }

  return (
    <div className="App">
      <p>Governor package hash: {contractInfo?.package_hash}</p>
      <p>Governor contract hash: {contractInfo?.contract_hash}</p>
      <p>Current pub key: {pubKey.pubKey}</p>
      <Wallet
        pubKey={pubKey}
        setKey={setKey}
      />
      <NewProposal pubKey={pubKey}/>
      <Proposals pubKey={pubKey} />
    </div>
  );
}

export default App;

// Finds contract hash using package hash received from Odra livenet deployer.
async function intiContractClient(): Promise<IContractInfo> {

  const deployedGovernor = await queryDeployedGovernor();
  const packageHash = deployedGovernor.package_hash;
  const rootHash = await casperClient.nodeClient.getStateRootHash();
  let contractHash = await casperClient.nodeClient
    .getBlockState(rootHash, packageHash, [])
    .then(p => p.ContractPackage?.versions[0].contractHash);

  if (!contractHash) {
    throw new Error(`Failed to find contract hash for package hash ${packageHash}`)
  }
  contractHash = contractHash!.replace("contract-", "hash-");
  contractClient.setContractHash(contractHash);
  return {package_hash: packageHash,
    contract_hash: contractHash}
}
