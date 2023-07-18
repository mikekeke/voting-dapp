use odra::{
    execution_error, types::Address, Mapping, OdraType, Sequence, UnwrapOrRevert, Variable,
};

#[odra::module]
pub struct Governor {
    ids_gen: Sequence<ProposalId>,
    owner: Variable<Address>,
    name: Variable<String>,
    proposals: Mapping<ProposalId, Proposal>,
    // To track who voted already
    voters_registry: Mapping<(ProposalId, Address), ()>,
}

pub type ProposalId = u64;

#[derive(OdraType, Debug, PartialEq, Eq)]
pub struct Proposal {
    pub id: ProposalId,
    pub statement: String,
    pub yea: u32,
    pub nay: u32,
}

impl Proposal {
    fn new(id: ProposalId, statement: String) -> Self {
        Proposal {
            id,
            statement,
            yea: 0,
            nay: 0,
        }
    }
}

execution_error! {
  pub enum Error {
      OnlyOwnerCanRegProposal => 1,
  }
}

#[odra::module]
impl Governor {
    #[odra(init)]
    pub fn init(&mut self, name: String) {
        self.owner.set(odra::contract_env::caller());
        self.name.set(name);
    }

    pub fn new_proposal(&mut self, statement: String) {
        let caller = odra::contract_env::caller();
        if caller != self.owner.get().unwrap_or_revert() {
            odra::contract_env::revert(Error::OnlyOwnerCanRegProposal)
        }

        let next_id = self.ids_gen.next_value();
        self.proposals
            .set(&next_id, Proposal::new(next_id, statement))
    }

    pub fn get_proposal(&mut self, id: ProposalId) -> Proposal {
        self.proposals.get(&id).unwrap_or_revert()
    }

    //todo factor out common code
    pub fn vote_for(&mut self, id: ProposalId) {
        let proposal = self.proposals.get(&id).unwrap_or_revert(); //todo custom error
        self.register_caller(id, caller);
        will call self.ensure_did_not_vote(id, caller);

        let proposal = Proposal {
            yea: proposal.yea + 1,
            ..proposal
        };
        
        self.proposals.set(&id, proposal);
    }

    pub fn vote_against(&mut self, id: ProposalId) {
        let proposal = self.proposals.get(&id).unwrap_or_revert(); //todo custom error
        self.register_caller(id, caller);
        will call self.ensure_did_not_vote(id, caller);

        let proposal = Proposal {
            yea: proposal.yea - 1,
            ..proposal
        };
        self.proposals.set(&id, proposal);
    }
}

#[cfg(test)]
mod tests {
    use odra::test_env;

    use super::{GovernorDeployer, Proposal};

    #[test]
    fn mk_proposal() {
        let admin = test_env::get_account(0);
        test_env::set_caller(admin);
        let mut gov_contract = GovernorDeployer::init("test gov".to_string());

        // let report = test_env::gas_report();
        // panic!("Report: {:#?}", report);

        let prop_text = "test proposal".to_string();
        gov_contract.new_proposal(prop_text.clone());
        let p1 = gov_contract.get_proposal(0);
        let prop = Proposal {
            id: 0,
            statement: prop_text.clone(),
            yea: 0,
            nay: 0,
        };
        assert_eq!(prop, p1);
    }

    // #[test]
    // fn try_stuff() {
    //     let gov_hash = "9f7073337f997130ae63f875f7b31e299d9c253f169a1a8cb01f4b722d209274";
    //     // let bytes: [u8] = decode(gov_hash).unwrap()[..];
    //     // let gov_address = Address::from(bytes);
    //     // panic!("{:#?}", gov_address)
    // }
}
