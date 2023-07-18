use odra::{
    execution_error, types::Address, List, Mapping, OdraType, Sequence, UnwrapOrRevert, Variable,
};

use crate::types::*;

#[odra::module]
pub struct Governor {
    ids_gen: Sequence<ProposalId>,
    admin: Variable<Address>,
    name: Variable<String>,
    proposals: Mapping<ProposalId, Proposal>,
    voters_registry: Mapping<(ProposalId, Address), Vote>,
    all_proposals: List<ProposalId>,
}

execution_error! {
  pub enum Error {
      AddressAlreadyVoted => 0,
      ProposalDoesNotExist => 1
  }
}

#[odra::module]
impl Governor {
    #[odra(init)]
    pub fn init(&mut self, name: String) {
        self.admin.set(odra::contract_env::caller());
        self.name.set(name);
    }

    pub fn get_name(&self) -> String {
        self.name.get().unwrap_or_revert()
    }

    pub fn new_proposal(&mut self, statement: String) {
        let next_id = self.ids_gen.next_value();
        self.proposals
            .set(&next_id, Proposal::new(next_id, statement));
        self.all_proposals.push(next_id);
    }

    pub fn get_proposal(&mut self, proposal_id: ProposalId) -> Proposal {
        self.proposals
            .get(&proposal_id)
            .unwrap_or_revert_with(Error::ProposalDoesNotExist)
    }

    pub fn last_proposal_id(&self) -> ProposalId {
        self.ids_gen.get_current_value()
    }

    pub fn vote_for(&mut self, proposal_id: ProposalId) {
        self.vote(proposal_id, Vote::Yea)
    }

    pub fn vote_against(&mut self, proposal_id: ProposalId) {
        self.vote(proposal_id, Vote::Nay)
    }

    fn vote(&mut self, proposal_id: ProposalId, vote: Vote) {
        let caller = odra::contract_env::caller();
        let registry_key = (proposal_id, caller);

        match self.voters_registry.get(&registry_key) {
            Some(_) => odra::contract_env::revert(Error::AddressAlreadyVoted),
            None => self.voters_registry.set(&registry_key, vote.clone()),
        }

        let proposal = self.get_proposal(proposal_id);

        let proposal = match vote {
            Vote::Yea => Proposal {
                yea: proposal.yea + 1,
                ..proposal
            },
            Vote::Nay => Proposal {
                nay: proposal.nay + 1,
                ..proposal
            },
        };
        self.proposals.set(&proposal_id, proposal)
    }

    fn register_caller(&mut self, proposal_id: ProposalId, caller: Address, vote: Vote) {
        let key = (proposal_id, caller);
        match self.voters_registry.get(&key) {
            Some(_) => odra::contract_env::revert(Error::AddressAlreadyVoted),
            None => self.voters_registry.set(&key, vote),
        }
    }
}

#[cfg(test)]
mod tests {
    use odra::{test_env, types::Address};

    use crate::{governor::Error, GovernorRef};

    use super::{GovernorDeployer, Proposal};

    const TEST_NAME: &str = "Test Name";

    fn deploy_new() -> (Address, GovernorRef) {
        let admin = test_env::get_account(0);
        test_env::set_caller(admin);
        let mut gov_contract = GovernorDeployer::init(TEST_NAME.to_string());
        (admin, gov_contract)
    }

    #[test]
    fn deploy() {
        let (admin, mut contract) = deploy_new();
        assert_eq!(TEST_NAME.to_string(), contract.get_name());
        odra::test_env::assert_exception(Error::ProposalDoesNotExist, || {
            contract.get_proposal(0);
        });
    }

    #[test]
    fn create_and_get_proposal() {
        let (admin, mut contract) = deploy_new();
        let user_1 = test_env::get_account(1);

        test_env::set_caller(user_1);
        let statement = String::from("Do Something");
        contract.new_proposal(statement.clone());

        let expected = Proposal {
            id: 0,
            statement: statement,
            yea: 0,
            nay: 0,
        };

        assert_eq!(expected, contract.get_proposal(0));
        odra::test_env::assert_exception(Error::ProposalDoesNotExist, || {
            contract.get_proposal(1);
        })
    }

    #[test]
    fn vote() {
        let (admin, mut contract) = deploy_new();
        let user_1 = test_env::get_account(1);
        let user_2 = test_env::get_account(2);
        contract.new_proposal(String::from("Some proposal"));

        test_env::set_caller(user_1);
        contract.vote_for(0);
        odra::test_env::assert_exception(Error::AddressAlreadyVoted, || contract.vote_against(0));
        odra::test_env::assert_exception(Error::AddressAlreadyVoted, || contract.vote_against(0));

        test_env::set_caller(user_2);
        contract.vote_against(0);

        let expected = Proposal {
            id: 0,
            statement: String::from("Some proposal"),
            yea: 1,
            nay: 1,
        };
        assert_eq!(expected, contract.get_proposal(0));

        odra::test_env::assert_exception(Error::ProposalDoesNotExist, || contract.vote_against(1));

        odra::test_env::assert_exception(Error::ProposalDoesNotExist, || contract.vote_for(1));
    }

    #[test]
    fn proposal_ids() {
        let (admin, mut contract) = deploy_new();
        let n = 3;
        for idx in 0..=n {
            println!("V: {}", idx);
            contract.new_proposal(format!("Proposal #{}", idx))
        }

        assert_eq!(3, contract.last_proposal_id())
    }
}
