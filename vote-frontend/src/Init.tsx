import { IContractInfo, ICurrentKey } from './AppTypes'
import { userTwoKeys } from './Utils';
import { casperClient, contractClient, queryDeployedGovernor } from './CasperNetwork';
import { DeployUtil } from 'casper-js-sdk';


// const CasperWalletProvider = window.CasperWalletProvider;

// const provider = CasperWalletProvider();

export const Init: React.FC<{
  pubKey: ICurrentKey,
  setKey: (keyHash: string) => void,
  setContractInfo: (info: IContractInfo) => void,
}> = ({ pubKey, setKey, setContractInfo }) => {

  return (
    <button onClick={() => { connect().catch(err => alert(err)) }}>Connect to wallet</button>
  )

  async function connect() {
    // const connected: boolean = await provider.requestConnection();
    // if (!connected) {
    //   throw new Error("Could not connect to wallet")
    // }
    // const keyHash: string = await provider.getActivePublicKey();
    // setKey(keyHash)

    // todo: fake keys; should get it from wallet extension
    const keyHash = userTwoKeys().publicKey.toHex();
    setKey(keyHash)

    // set package and contract hash
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
    setContractInfo({
      package_hash: packageHash,
      contract_hash: contractHash
    })
  }
};