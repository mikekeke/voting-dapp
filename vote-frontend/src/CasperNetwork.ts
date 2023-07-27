import { CLPublicKey, CasperClient, Contracts, DeployUtil } from "casper-js-sdk";
import { IDeployedGovernor, IProposals } from "./AppTypes";
import axios from "axios";
import { theKeys } from "./Utils";
import { USE_CASPER_WALLET } from "./Settings";

export const PROPOSAL_GAS = "5000000000";
export const VOTE_GAS = "2500000000";
export const FINALIZE_GAS = "3000000000";

export const NODE_URL = 'http://localhost:3001/http://94.130.10.55:7777';
export const NETWORK_NAME = 'casper-test';

const CasperWalletProvider = window.CasperWalletProvider;
export const walletProvider = CasperWalletProvider();

export const casperClient = new CasperClient(NODE_URL);
export const contractClient = new Contracts.Contract(casperClient);

export const QUERY_SERVICE_URL = "http://localhost:8080"

export async function queryDeployedGovernor(): Promise<IDeployedGovernor> {
  console.log("Query deployed governor")
  let resp = await axios.get<IDeployedGovernor>("http://localhost:8080/governor")
  return resp.data
}

export async function queryProposals(): Promise<IProposals> {
  try {
    console.log("Query proposals")
    const resp = await axios.get<IProposals>("http://localhost:8080/proposals");
    return resp.data
  } catch (e) {
    console.error(e)
    return { proposals: [] }
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function signAndSubmitDeploy(deploy: DeployUtil.Deploy, keyHash: string) {
  console.log(`Signing deploy`)
  const signedDeploy = await signDeploy(deploy, keyHash);

  console.log("Magic sleep...");
  /*! if deploy timestamp will be later in time than node current time,
      node will treat such deploy as invalid. This happened to me when
      sending deploys to some public nodes on testnet.
  */
  await sleep(1000); 

  console.log(`Sending deploy to the network "${NETWORK_NAME}"...`)
  const deployHash = await casperClient.putDeploy(signedDeploy);
  
  console.log(`Deploy hash: ${deployHash}`);
  const result = await casperClient.nodeClient.waitForDeploy(signedDeploy);
  const failure = result.execution_results[0].result.Failure;
  const success = result.execution_results[0].result.Success;
  return [success, failure]
}

async function signDeploy(deploy: DeployUtil.Deploy, keyHash: string): Promise<DeployUtil.Deploy> {
  if (USE_CASPER_WALLET) {
    return signWithBrowserExtension(deploy, keyHash);
  } else {
    return signWithPredefinedKey(deploy);
  }
}

async function signWithBrowserExtension(deploy: DeployUtil.Deploy, keyHash: string) {
  const deployJson = DeployUtil.deployToJson(deploy);
  try {
    const signature = await walletProvider.sign(JSON.stringify(deployJson), keyHash);
    if (signature.cancelled) {
      throw new Error("Sign cancelled")
    };
    return DeployUtil.setSignature(
      deploy,
      signature.signature,
      CLPublicKey.fromHex(keyHash)
    );
  } catch (e) {
    console.error(`Could not sing deploy. Error: ${e}`);
    throw new Error(`Could not sing deploy. Error: ${e}`);
  }
}

async function signWithPredefinedKey(deploy: DeployUtil.Deploy) {
  return deploy.sign([theKeys()])
}
