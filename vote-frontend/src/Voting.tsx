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
import { casperClient, contractClient, NETWORK_NAME } from './CasperNetwork'

enum Vote {
  Yea,
  Nay
}

export const Voting: React.FC<{ pubKey: ICurrentKey, proposalId: number }> = ({ pubKey, proposalId }) => {

  return (
    <div>
      <button onClick={() => {
        vote(pubKey, proposalId, Vote.Yea).catch(err => alert(err))
      }}>Yea</button>
      <button onClick={() => {
        vote(pubKey, proposalId, Vote.Nay).catch(err => alert(err))
      }}>Nay</button>
    </div>
  );
};

// todo: important
// const CasperWalletProvider = window.CasperWalletProvider;
// const provider = CasperWalletProvider();


async function vote(iPubKey: ICurrentKey, proposalId: number, vote: Vote) {

  // todo: important
  if (!iPubKey.pubKey) {
    throw new Error("Key is missing. Is wallet connected?")
  };

  const keyHash = iPubKey.pubKey!;

  const endpoint = vote === Vote.Yea ? "vote_for" : "vote_against";

  const deploy = contractClient.callEntrypoint(
    endpoint,
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
