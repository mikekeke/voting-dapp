import { ContractWASM, CEP18Client, InstallArgs, EVENTS_MODE } from 'casper-cep18-js-client';
import { findKey, readKeys } from "./Utils";
import { CasperClient, Contracts, RuntimeArgs } from 'casper-js-sdk';
import { deployTokensContract } from './FungibleTokens';
import { installGovernor, makeProposal, debugKeys } from './Governor';
import { Env } from './Types';
import { Contract } from 'casper-js-sdk/dist/lib/Contracts';






const NODE_URL = 'http://localhost:11101/rpc';
const NETWORK_NAME = 'casper-net-1';
const adminKeys = readKeys("../nctl-docker/users/user-1");

// const user6Keys = readKeys("../nctl-docker/users/user-6");

// const NODE_URL = 'http://94.130.10.55:7777/rpc';
// const NETWORK_NAME = 'casper-test';
// const adminKeys = readKeys("/home/mike/casper-project/test-1-ed25519-keys");

const casperClient = new CasperClient(NODE_URL);


async function run() {
  // const cep18 = await deployTokensContract(NODE_URL, NETWORK_NAME, adminKeys);

  // console.log(`Contract hash: ${cep18.contractHash}`)
  const env = new Env(
    NODE_URL,
    NETWORK_NAME,
    adminKeys
  );
  // const res = await installGovernor(env);
  await debugKeys(env);

  env.contractClient.setContractHash(
    "hash-a37ea1228f9ebe17268fef4a29bb2ded0d6e917a76ce01eb6379e07609eead20");
  // env.contractClient.
  
  const propRes = await makeProposal(env, "GG deploy")
  // let res = await env.casperClient.getDeploy("56d163a09c27de16b891015e0a78152a13f222c526b1d647d78533937c39ef4a");
  // console.log(res[1].execution_results[0].result)


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
function getKeys() {
  throw new Error('Function not implemented.');
}

