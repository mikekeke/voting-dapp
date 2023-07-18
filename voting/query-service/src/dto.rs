use serde::{Deserialize, Serialize};
use serde_json::Result;

use contracts::types::Proposal;

#[derive(Serialize, Deserialize)]
pub struct ProposalDTO {
    pub id: u64,
    pub statement: String,
    pub yea: u32,
    pub nay: u32,
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

#[derive(Serialize, Deserialize)]
pub struct ProposalsDTO {
    proposals: Vec<ProposalDTO>
}

impl ProposalsDTO {

    pub fn empty() -> Self {
        ProposalsDTO { proposals: Vec::new() }
    }
    pub fn add(&mut self, proposal: ProposalDTO) {
        self.proposals.push(proposal)
    }
}