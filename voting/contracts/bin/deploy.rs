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
    //todo: get name from CLI
    let name = String::from("test name");
    client_env::set_gas(DEPLOY_COST);
    let mut contract = GovernorDeployer::init(name);
    let address = contract.address();
    DeployedGovernor::new(contract.address().to_string()).save_to_file("./../governor.json")
}
