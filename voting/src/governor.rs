use odra::{
    execution_error, types::Address, Mapping, OdraType, Sequence, UnwrapOrRevert, Variable,
};

#[odra::module]
pub struct Governor {
    ids_gen: Sequence<ProposalId>,
    owner: Variable<Address>,
    name: Variable<String>,
    proposals: Mapping<ProposalId, Proposal>,
}

pub type ProposalId = u64;

#[derive(OdraType, Debug)]
// #[odra::module]
pub struct Proposal {
    id: ProposalId,
    statement: String,
    // yes_votes: u32,
    // no_votes: u32,
}

impl Proposal {
    fn new(id: ProposalId, statement: String) -> Self {
        Proposal {
            id,
            statement,
            // yes_votes: 0,
            // no_votes: 0,
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

    pub fn get_rpoposal(&mut self, id: ProposalId) -> Proposal {
        self.proposals.get(&id).unwrap_or_revert()
    }

}

#[cfg(test)]
mod tests {
    use odra::test_env;

    use super::{GovernorDeployer, Proposal};

    #[test]
    fn mk_proposal() {
        let admin = test_env::get_account(0);
        let user1 = test_env::get_account(1);
        test_env::set_caller(admin);
        let mut gov_contract = GovernorDeployer::init("test".to_string());
        // test_env::set_caller(user1);
        gov_contract.new_proposal("test".into());
        let p1 = gov_contract.get_rpoposal(0);
        panic!("{:#?}", p1)
        // let prop = Proposal {
        //     id: 0,
        //     statement: "test proposal".to_string(),
        //     yes_votes: 0,
        //     no_votes: 0,
        // };
        
        // panic!("{}", gov_contract.get_naname())
    }
}
