import { Env } from "./Types";
import { readWasm } from "./Utils";
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

} from "casper-js-sdk";


const WASM = readWasm("./wasm/governor.wasm");
// const WASM = readWasm("./wasm/flipper.wasm");
const DEPLOY_GAS_PRICE = 330560983230;

export async function installGovernor(env: Env) {
  const installDeploy = env.contractClient.install(
    WASM,
    RuntimeArgs.fromMap({
      odra_cfg_package_hash_key_name: CLValueBuilder.string("gov_contract_key"),
      odra_cfg_allow_key_override: CLValueBuilder.bool(true),
      odra_cfg_is_upgradable: CLValueBuilder.bool(true),
      odra_cfg_constructor : CLValueBuilder.string("init"),
      name: CLValueBuilder.string("test-lol")
    }),
    DEPLOY_GAS_PRICE.toString(),
    env.adminKeys.publicKey, // TODO: make contract client from env as it looks inside-out now?
    env.network,
    [env.adminKeys]
  );


  const deplHash = await installDeploy.send(env.nodeRpcUrl);
  const result = await env.casperClient.nodeClient.waitForDeploy(installDeploy);

  console.log(`Gov res`); 
  console.log(result.execution_results[0].result);
  await setContractHash(env);
  return "f"

}

export async function makeProposal(env: Env, proposal: string) { 
  
  const depl = env.contractClient.callEntrypoint(
    "new_proposal",
    RuntimeArgs.fromMap({statement: CLValueBuilder.string(proposal)}),
    env.adminKeys.publicKey,
    env.network,
    "330560983230",
    [env.adminKeys]
  )
  const deplHash = await depl.send(env.nodeRpcUrl);
  const result = await env.casperClient.nodeClient.waitForDeploy(depl);

  console.log(`Prop res`); 
  console.log(result.execution_results[0].result); 
  return deplHash
}

async function setContractHash(env: Env) {
  const rootHash = await env.casperClient.nodeClient.getStateRootHash();
  const accountHash = env.adminKeys.publicKey.toAccountHashStr();
  const state = await env.casperClient.nodeClient
    .getBlockState(rootHash, accountHash, []);

  const packageHash =
    state
      .Account
      ?.namedKeys
      .find(key => key.name === "gov_contract_key")
      ?.key


  const contractHash = await env.casperClient.nodeClient
    .getBlockState(rootHash, packageHash!, [])
    .then(p => p.ContractPackage?.versions[0].contractHash.replace("contract", "hash"));

  env.contractClient.setContractHash(contractHash!)
}
