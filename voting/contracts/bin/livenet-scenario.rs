// #[cfg(not(feature = "casper-livenet"))]
// compile_error!("This crate can only be used for CasperLabs Livenet");

use odra::client_env;
use odra::types::Address;
use std::str::FromStr;
// use hex::decode;


use contracts::{deployed_governor::DeployedGovernor, governor::GovernorDeployer};
// const DEPLOY_COST: u64 = 82518089110;
const DEPLOY_COST: u64 = 96_000_000_000;

fn main() {
    client_env::set_gas(DEPLOY_COST);
    let mut gov_contract = GovernorDeployer::init("test".to_string());
    //TODO save hash somehow to load it to the client later

    // DEBUG
    client_env::set_gas(110_000_000_000u64);
    gov_contract.new_proposal("First proposal".to_string());

    client_env::set_gas(110_000_000_000u64);
    gov_contract.new_proposal("Second proposal".to_string());

    let p1 = gov_contract.get_proposal(0);
    println!("Prop1: {:#?}", p1);

    let p2 = gov_contract.get_proposal(1);
    println!("Prop2: {:#?}", p2);

    // client_env::set_gas(110_000_000_000u64);
    // gov_contract.vote_for(1);
    // let p2 = gov_contract.get_proposal(1);
    // println!("Voted Prop2: {:#?}", p2);

    DeployedGovernor::new(gov_contract.address().to_string())
        .save_to_file("./../governor.json")
}
