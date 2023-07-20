import axios from "axios";
import { useEffect, useState } from "react";
import { ICurrentKey, IProposals } from './AppTypes'
import { Voting } from "./Voting";


export const Proposals: React.FC<{pubKey: ICurrentKey}> = ({pubKey}) => {
  const [proposals, setProposals] = useState<IProposals>({ proposals: [] });

  useEffect(() => {
    async function getProposals() {
      // const resp = await axios.get<IProposals>("http://localhost:8080/debug/proposals");
      const resp = await axios.get<IProposals>("http://localhost:8080/proposals");
      // const data = await resp.js
      console.log("--------------------")
      console.log(resp.data)
      setProposals(resp.data)
    };
    getProposals()

  }, []);
  return (
    <div className="section__proposals">
      {proposals.proposals.length ? <ul className="proposals">
        {proposals.proposals.map(p => (
          <li key={p.id}>
            <p>{p.id} - {p.statement} - y: {p.yea} - n: {p.nay}</p>
            <Voting 
              pubKey={pubKey}
              proposalId={p.id}
              />
          </li>
        ))}

      </ul> : <div>No proposals found yet</div>}
    </div>
  );
};