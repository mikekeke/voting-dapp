import { useEffect, useState } from "react";
import { ICurrentKey, IProposals } from './AppTypes'
import { Voting } from "./Voting";
import { queryProposals } from "./CasperNetwork";


export const Proposals: React.FC<{ pubKey: ICurrentKey }> = ({ pubKey }) => {
  const [proposals, setProposals] = useState<IProposals>({ proposals: [] });

  useEffect(() => {
    queryProposals().then(setProposals)
  }, []);

  return (
    <div className="section__proposals">
      <p>Proposals:</p>
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