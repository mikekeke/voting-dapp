use serde::{Deserialize, Serialize};
use serde_json::Result;

use contracts::Proposal;

#[derive(Serialize, Deserialize)]
pub struct ProposalDTO {
    id: u64,
    statement: String,
    yea: u32,
    nay: u32,
}

impl From<Proposal> for ProposalDTO {
    fn from(p: Proposal) -> Self {
        ProposalDTO {
            id: p.id,
            statement: p.statement,
            yea: p.yea,
            nay: p.nay,
        }
    }
}
