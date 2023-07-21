import * as casperJsSdk from "casper-js-sdk";
import { IDeployedGovernor, IProposals } from "./AppTypes";
import axios from "axios";
import { userTwoKeys } from "./Utils";

export const PROPOSAL_GAS = "2800000000";
export const VOTE_GAS = "2100000000";

export const NODE_URL = 'http://localhost:11101/rpc';
export const NETWORK_NAME = 'casper-net-1';

export const casperClient = new casperJsSdk.CasperClient(NODE_URL);
export const contractClient = new casperJsSdk.Contracts.Contract(casperClient);

export const OWNER_KEY = casperJsSdk.Keys.Ed25519.parsePublicKey(
  casperJsSdk.decodeBase64("0184f6d260F4EE6869DDB36affe15456dE6aE045278FA2f467bb677561cE0daD55")
);

export const QUERY_SERVICE_URL = "http://localhost:8080"

export async function queryDeployedGovernor(): Promise<IDeployedGovernor> {
  let resp = await axios.get<IDeployedGovernor>("http://localhost:8080/governor-hash")
  return resp.data
}

export async function queryProposals(): Promise<IProposals> {
  const resp = await axios.get<IProposals>("http://localhost:8080/proposals");
  return resp.data
}

export async function signAndSubmitDeploy(deploy: casperJsSdk.DeployUtil.Deploy, keyHash: string) {
  console.log(`Signing deploy`)
  const signedDeploy = await signDeploy(deploy, keyHash);

  console.log(`Sending deploy to the network "${NETWORK_NAME}"...`)
  const _deployHash = await casperClient.putDeploy(signedDeploy);
  const result = await casperClient.nodeClient.waitForDeploy(signedDeploy);
  const failure = result.execution_results[0].result.Failure;
  const success = result.execution_results[0].result.Success;
  return [success, failure]
}

async function signDeploy(deploy: casperJsSdk.DeployUtil.Deploy, keyHash: string): Promise<casperJsSdk.DeployUtil.Deploy> {
  // ! todo: sign with real wallet section
  // const deployJson = casperJsSdk.DeployUtil.deployToJson(deploy);
  // try {
  //   const signature = await provider.sign(JSON.stringify(deployJson), keyHash);
  //   if (signature.cancelled) {
  //     throw new Error("Sign cancelled")
  //   };
  //   return DeployUtil.setSignature(
  //     deploy,
  //     signature.signature,
  //     CLPublicKey.fromHex(keyHash)
  //   );
  // } catch (e) {
  //   console.log(`Catching signing error here, coz tesntet deployment is broken. 
  //   Will move froward for now with fake local cluster key signign`)
  // }
  // ! todo: sign with real wallet section - END

  //todo: signing with hardcoded local network keys
  // need to ebe replaced with real wallet extension
  return deploy.sign([userTwoKeys()]) 
}