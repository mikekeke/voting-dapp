import {
  RuntimeArgs,
  CLPublicKey,
  CLValueBuilder,

} from "casper-js-sdk";
import { ICurrentKey } from "./AppTypes";
import {
  contractClient,
  FINALIZE_GAS,
  NETWORK_NAME,
  signAndSubmitDeploy
} from './CasperNetwork'

export const FinalizeVoting: React.FC<{
  pubKey: ICurrentKey, proposalId: number
}> = ({ pubKey, proposalId }) => {

  return (
    <div>
      <button onClick={() => {
        finalize(pubKey, proposalId).catch(err => alert(err))
      }}>Finish voting</button>
    </div>
  );
};

// todo: important
// const CasperWalletProvider = window.CasperWalletProvider;
// const provider = CasperWalletProvider();

async function finalize(iPubKey: ICurrentKey, proposalId: number) {
  console.log(`Finalizing voting for proposal ${proposalId}`);

  if (!iPubKey.pubKey) {
    throw new Error("Public key is missing. Is wallet connected?")
  };

  const keyHash = iPubKey.pubKey!;

  // todo: should be extracted to some contract client
  const deploy = contractClient.callEntrypoint(
    "finalize_voting",
    RuntimeArgs.fromMap({ proposal_id: CLValueBuilder.u64(proposalId) }),
    CLPublicKey.fromHex(keyHash),
    NETWORK_NAME,
    FINALIZE_GAS,
  );

  const [success, failure] = await signAndSubmitDeploy(deploy, keyHash);
  if (failure) {
    const msg = `Failed to finalize voteing: ${failure!.error_message}`;
    alert(msg);
    console.error(msg);
  } else {
    alert(`Voting finished successfully for ${proposalId}!`);
    console.log(`Voting finished successfully for ${proposalId}`);
    console.log({
      proposalId: proposalId,
      keyHash: keyHash,
      result: success
    });
  }
}
