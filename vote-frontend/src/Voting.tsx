import {
  RuntimeArgs,
  CLPublicKey,
  CLValueBuilder,

} from "casper-js-sdk";
import { ICurrentKey } from "./AppTypes";
import { contractClient, NETWORK_NAME, signAndSubmitDeploy, VOTE_GAS } from './CasperNetwork'

enum Vote {
  Yea = '"yea"',
  Nay = '"nay"'
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
  console.log(`Voting ${vote} for proposal ${proposalId}`);

  if (!iPubKey.pubKey) {
    throw new Error("Public key is missing. Is wallet connected?")
  };

  const keyHash = iPubKey.pubKey!;

  const endpoint = vote === Vote.Yea ? "vote_for" : "vote_against";

  // todo: should be extracted to some contract client
  const deploy = contractClient.callEntrypoint(
    endpoint,
    RuntimeArgs.fromMap({ proposal_id: CLValueBuilder.u64(proposalId) }),
    CLPublicKey.fromHex(keyHash),
    NETWORK_NAME,
    VOTE_GAS,
  );

  const [success, failure] = await signAndSubmitDeploy(deploy, keyHash);
  if (failure) {
    let msg =
      failure!.error_message === "User error: 0"
        ? 'you voted on this proposal already'
        : failure!.error_message;

    msg = `Failed to vote: ${msg}`;
    alert(msg);
    console.error(msg);
  } else {
    alert(`Voted successfully for ${proposalId}!`);
    console.log(`Voted successfully for ${proposalId}`);
    console.log({
      proposalId: proposalId,
      keyHash: keyHash,
      result: success
    });
  }
}
