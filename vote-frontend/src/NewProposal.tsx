import { useState } from "react";
import { ICurrentKey } from "./AppTypes";
import { NETWORK_NAME, PROPOSAL_GAS, contractClient, signAndSubmitDeploy } from "./CasperNetwork";
import { CLPublicKey, CLValueBuilder, RuntimeArgs } from "casper-js-sdk";

export const NewProposal: React.FC<{ pubKey: ICurrentKey }> = ({ pubKey }) => {
  const [newProposal, setProposal] = useState<string>("");

  async function submitProposal(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!pubKey.pubKey) {
      throw new Error("Public key is missing. Is wallet connected?")
    };

    e.preventDefault();
    if (!newProposal) {
      alert("Please enter a proposal");
    } else {
      await submit(newProposal, pubKey.pubKey!);
      setProposal("");
    }
  };

  return (
    <div className="AddTodo">
      <form>
        <input
          value={newProposal}
          onChange={e => { setProposal(e.target.value) }} />
        <button onClick={e => {
          submitProposal(e).catch(err => alert(err))
        }}>Add Proposal</button>
      </form>
    </div>
  );
};

async function submit(proposal: string, keyHash: string) {
  const deploy = contractClient.callEntrypoint(
    "new_proposal",
    RuntimeArgs.fromMap({ statement: CLValueBuilder.string(proposal) }),
    CLPublicKey.fromHex(keyHash),
    NETWORK_NAME,
    PROPOSAL_GAS,
  );

  const [success, failure] = await signAndSubmitDeploy(deploy, keyHash);
  if (failure) {
    let msg = failure!.error_message === "User error: 0" ? 'you voted already' : failure!.error_message;
    msg = `Failed to submit proposal: ${msg}`;
    alert(msg);
    console.error(msg);
  } else {
    alert(`Proposal created!`);
    console.log(`Proposal created`);

    console.log({
      keyHash: keyHash,
      result: success
    });
  }
}
