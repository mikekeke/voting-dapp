import { CLAnyType, CLStringBytesParser, CLU64BytesParser, CLValue, CLValueBuilder, CLValueBytesParsers, CLValueParsers, CasperClient, Contracts, decodeBase16, encodeBase16 } from "casper-js-sdk";
import { Env } from "./Types"
import { readKeys } from "./Utils";
import { blake2b } from '@noble/hashes/blake2b';

const NODE_URL = 'http://localhost:11101/rpc';
const NETWORK_NAME = 'casper-net-1';

const casperClient = new CasperClient(NODE_URL);
const contract = new Contracts.Contract(casperClient);

const adminKeys = readKeys("../nctl-docker/users/user-1");

async function query() {


  const rootHash = await casperClient.nodeClient.getStateRootHash();
  const accountHash = adminKeys.publicKey.toAccountHashStr();
  const state = await casperClient.nodeClient
    .getBlockState(rootHash, accountHash, []);

  const packageHash =
    state
      .Account
      ?.namedKeys
      .find(key => key.name === "gov_contract_key")
      ?.key


  const contractHash = await casperClient.nodeClient
    .getBlockState(rootHash, packageHash!, [])
    .then(p => p.ContractPackage?.versions[0].contractHash.replace("contract", "hash"));

  contract.setContractHash(contractHash!);
  const stateRootHashToUse = await casperClient.nodeClient.getStateRootHash();

  // const govName = await contract.queryContractDictionary("state", mk_var_key("name_contract"))
  const govName = await casperClient.nodeClient.getDictionaryItemByName(
    stateRootHashToUse,
    contractHash!,
    "state",
    mk_var_key("name_contract"),
    { rawData: true }
  );
  console.log(govName)

  const key = mk_dict_key("proposals_contract", CLValueBuilder.u64(0));


  const storedValue = await casperClient.nodeClient.getDictionaryItemByName(
    stateRootHashToUse,
    contractHash!,
    "state",
    key,
    { rawData: true }
  );
  const valueBytes = storedValue
  console.log(valueBytes)

  // const proposal: CLValue = await contract.queryContractDictionary(
  //   "state",
  //   key
  // )

  // full bytes
  // const s = '0800000050726f706f73616c0d000000746573742070726f706f73616c';
               '0800000050726f706f73616c00000000000000000d000000746573742070726f706f73616c'
  // cut one
  // const s = '50726f706f73616c0d000000746573742070726f706f73616c';
  // for cut:
  // {
  //   result: OkImpl {
  //     ok: true,
  //     err: false,
  //     val: t { isCLValue: true, data: 'test proposal' }
  //   },
  //   remainder: Uint8Array(0) []
  // }
  
  const s = '50726f706f73616c00000000000000000d000000746573742070726f706f73616c';
  const b = decodeBase16(s);
  console.log(b)
  console.log("---- Proposal value:")

  const res = new CLU64BytesParser().fromBytesWithRemainder(b)
  console.log(res)
  const res2 = new CLU64BytesParser().fromBytesWithRemainder(res.remainder!)
  console.log(res2)
  const res3 = new CLStringBytesParser().fromBytesWithRemainder(res.remainder!)
  console.log(res3)

}


function mk_var_key(key: string) {

  const bytes = CLValueParsers.toBytes(CLValueBuilder.string(key)).unwrap();
  const blaked = blake2b(bytes, { dkLen: 32 });
  return encodeBase16(blaked)
}

function mk_dict_key(dict_name: string, key: CLValue) {
  const nameBytes = new TextEncoder().encode(dict_name);
  const keyBytes = CLValueParsers.toBytes(key).unwrap();
  const finalBytes = new Uint8Array(nameBytes.length + keyBytes.length);
  finalBytes.set(nameBytes);
  finalBytes.set(keyBytes, nameBytes.length);
  const blaked = blake2b(finalBytes, { dkLen: 32 });

  return encodeBase16(blaked)
}

function test() {
  console.log(`Var hex: ${mk_var_key("name_contract")}`)
  console.log(`Dict hex: ${mk_dict_key("proposals_contract", CLValueBuilder.u64(0))}`)
}

// test()
query()