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
import { ICurrentKey } from "./AppTypes";
import { userTwoKeys } from "./Utils";

export const Vote: React.FC<{ pubKey: ICurrentKey, }> = ({ pubKey }) => {
  // const [proposals, setProposals] = useState<IProposals>({ proposals: [] });
  const proposalId = 0; //todo: move to args


  return (
    <button onClick={() => { buildVoteDeploy(pubKey, proposalId).catch(err => alert(err)) }}>Vote for</button>
  );
};


// const CasperWalletProvider = window.CasperWalletProvider;
// const provider = CasperWalletProvider();

// todo: move everything to config or args
const NODE_URL = 'http://localhost:11101/rpc';
const NETWORK_NAME = 'casper-net-1';
const CONTRACT_HASH = "hash-a37ea1228f9ebe17268fef4a29bb2ded0d6e917a76ce01eb6379e07609eead20";

const casperClient = new CasperClient(NODE_URL);  // todo: move to config
const contract = new Contracts.Contract(casperClient);

async function buildVoteDeploy(iPubKey: ICurrentKey, proposalId: number) {
  contract.setContractHash(CONTRACT_HASH);

  // todo: important
  // if (!iPubKey.pubKey) {
  //   throw new Error("Key is missing. Is wallet connected?")
  // };

  // const keyHash = iPubKey.pubKey!;
  const keyHash = userTwoKeys().publicKey.toHex();
  console.log(`Real PKH ${keyHash}`);

  const deploy = contract.callEntrypoint(
    "vote_for",
    RuntimeArgs.fromMap({ proposal_id: CLValueBuilder.u64(proposalId) }),
    CLPublicKey.fromHex(keyHash),
    NETWORK_NAME,
    "110000000000", //todo: put real price
    [userTwoKeys()]
  );

  const signedDeploy = await signDeploy(deploy, keyHash);

  const deployHash = await casperClient.putDeploy(signedDeploy);
  console.log(`Vote for deploy hash: ${deployHash}`);
  const result = await casperClient.nodeClient.waitForDeploy(signedDeploy);
  console.log('----- VOTE FOR RESULT -----');
  console.log(result);
}

async function signDeploy(deploy: DeployUtil.Deploy, keyHash: string): Promise<DeployUtil.Deploy> {
  const deployJson = DeployUtil.deployToJson(deploy);
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

  //   return deploy.sign([readKeys("../nctl-docker/users/user-2")])
  // }
  return deploy.sign([userTwoKeys()])
  // return deploy
}