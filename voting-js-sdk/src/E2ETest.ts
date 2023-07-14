import { ContractWASM, CEP18Client, InstallArgs, EVENTS_MODE } from 'casper-cep18-js-client';
import { findKey, readKeys } from "./Utils";
import { CasperClient, Contracts, RuntimeArgs } from 'casper-js-sdk';
import { deployTokensContract } from './FungibleTokens';
import { installGovernor, makeProposal } from './Governor';
import { Env } from './Types';
import { Contract } from 'casper-js-sdk/dist/lib/Contracts';



const NODE_URL = 'http://localhost:11101/rpc';
const NETWORK_NAME = 'casper-net-1';

const casperClient = new CasperClient(NODE_URL);

const adminKeys = readKeys("../nctl-docker/users/user-1");
const user6Keys = readKeys("../nctl-docker/users/user-6");



async function run() {
  const cep18 = await deployTokensContract(NODE_URL, NETWORK_NAME, adminKeys);

  console.log(`Contract hash: ${cep18.contractHash}`)
  const env = new Env(
    NODE_URL,
    NETWORK_NAME,
    adminKeys
  );
  const res = await installGovernor(env);

  const propRes = await makeProposal(env, "test proposal")

  // var balance = await cep18.balanceOf(user6Keys.publicKey);
  // console.log(`Balance before: ${balance}`);
  // const t1 = cep18.transfer(
  //   { recipient: user6Keys.publicKey, amount: 50_000_000 },
  //   5_000_000_000, // Payment amount
  //   adminKeys.publicKey,
  //   NETWORK_NAME,
  //   [adminKeys] // Optional
  // );
  // await t1.send(NODE_URL); //If not await here: Error: Error: deploy not known
  // const transferRes = await casperClient.nodeClient.waitForDeploy(t1);
  // console.log(transferRes.execution_results[0].result);
  // var balance = await cep18.balanceOf(user6Keys.publicKey);
  // console.log(`Balance after: ${balance}`);


}

run()
  .then(res => console.log(`Result: ${res}`))
  .catch(err => console.error(`Error: ${err}`))