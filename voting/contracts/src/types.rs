use odra::OdraType;

pub type ProposalId = u64;

#[derive(OdraType, Debug, PartialEq, Eq)]
pub enum Vote {
    Yea,
    Nay,
}

#[derive(OdraType, Debug, PartialEq, Eq)]
pub struct Proposal {
    pub id: ProposalId,
    pub statement: String,
    pub yea: u32,
    pub nay: u32,
}

impl Proposal {
    pub fn new(id: ProposalId, statement: String) -> Self {
        Proposal {
            id,
            statement,
            yea: 0,
            nay: 0,
        }
    }
}
