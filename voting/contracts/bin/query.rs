// #[cfg(not(feature = "casper-livenet"))]
// compile_error!("This crate can only be used for CasperLabs Livenet");

use odra::client_env;
use odra::types::Address;
use std::str::FromStr;
// use hex::decode;

use contracts::governor::GovernorDeployer;
const DEPLOY_COST: u64 = 82518089110;

fn main() {
    let gov_addr =
        Address::from_str("hash-f914d2e5248780eba85f9db45ad87a5fde794037f4be9d11b82de3290abba397")
            .unwrap();
    let mut gov = GovernorDeployer::register(gov_addr);

    let p = gov.get_proposal(0);
    println!("Prop: {:#?}", p)
}
