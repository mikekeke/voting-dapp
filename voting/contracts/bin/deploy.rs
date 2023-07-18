// #[cfg(not(feature = "casper-livenet"))]
// compile_error!("This crate can only be used for CasperLabs Livenet");

use odra::client_env;
use odra::types::Address;
use std::str::FromStr;
// use hex::decode;

use contracts::governor::GovernorDeployer;
// const DEPLOY_COST: u64 = 82518089110;
const DEPLOY_COST: u64 = 110_000_000_000u64;

fn main() {
    //todo: get name from CLI
    let name = String::from("test name");
    client_env::set_gas(DEPLOY_COST);
    let mut gov_contract = GovernorDeployer::init(name);
}
