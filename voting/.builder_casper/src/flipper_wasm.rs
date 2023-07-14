#![no_main]
use odra::Instance;
#[no_mangle]
fn call() {
    let schemas = vec![];
    let mut entry_points = odra::casper::casper_types::EntryPoints::new();
    entry_points.add_entry_point(odra::casper::casper_types::EntryPoint::new(
        stringify!(initial_settings),
        Vec::<odra::casper::casper_types::Parameter>::new(),
        odra::casper::casper_types::CLType::Unit,
        odra::casper::casper_types::EntryPointAccess::Groups(vec![
            odra::casper::casper_types::Group::new("constructor_group"),
        ]),
        odra::casper::casper_types::EntryPointType::Contract,
    ));
    entry_points.add_entry_point(odra::casper::casper_types::EntryPoint::new(
        stringify!(set),
        {
            let mut params: Vec<odra::casper::casper_types::Parameter> = Vec::new();
            params.push(odra::casper::casper_types::Parameter::new(
                stringify!(value),
                odra::casper::casper_types::CLType::Bool,
            ));
            params
        },
        odra::casper::casper_types::CLType::Unit,
        odra::casper::casper_types::EntryPointAccess::Public,
        odra::casper::casper_types::EntryPointType::Contract,
    ));
    entry_points.add_entry_point(odra::casper::casper_types::EntryPoint::new(
        stringify!(flip),
        Vec::<odra::casper::casper_types::Parameter>::new(),
        odra::casper::casper_types::CLType::Unit,
        odra::casper::casper_types::EntryPointAccess::Public,
        odra::casper::casper_types::EntryPointType::Contract,
    ));
    entry_points.add_entry_point(odra::casper::casper_types::EntryPoint::new(
        stringify!(get),
        Vec::<odra::casper::casper_types::Parameter>::new(),
        odra::casper::casper_types::CLType::Bool,
        odra::casper::casper_types::EntryPointAccess::Public,
        odra::casper::casper_types::EntryPointType::Contract,
    ));
    #[allow(unused_variables)]
    let contract_package_hash = odra::casper::utils::install_contract(entry_points, schemas);
    use odra::casper::casper_contract::unwrap_or_revert::UnwrapOrRevert;
    let constructor_access = odra::casper::utils::create_constructor_group(contract_package_hash);
    let constructor_name = odra::casper::utils::load_constructor_name_arg();
    match constructor_name.as_str() {
        stringify!(initial_settings) => {
            let odra_address = odra::types::Address::try_from(contract_package_hash)
                .map_err(|err| {
                    let code = odra::types::ExecutionError::from(err).code();
                    odra::casper::casper_types::ApiError::User(code)
                })
                .unwrap_or_revert();
            let mut contract_ref = voting::FlipperRef::at(&odra_address);
            contract_ref.initial_settings();
        }
        _ => odra::casper::utils::revert_on_unknown_constructor(),
    };
    odra::casper::utils::revoke_access_to_constructor_group(
        contract_package_hash,
        constructor_access,
    );
}
#[no_mangle]
fn initial_settings() {
    odra::casper::utils::assert_no_attached_value();
    let mut _contract = voting::Flipper::instance("contract");
    _contract.initial_settings();
}
#[no_mangle]
fn set() {
    odra::casper::utils::assert_no_attached_value();
    let mut _contract = voting::Flipper::instance("contract");
    let value =
        odra::casper::casper_contract::contract_api::runtime::get_named_arg(stringify!(value));
    _contract.set(value);
}
#[no_mangle]
fn flip() {
    odra::casper::utils::assert_no_attached_value();
    let mut _contract = voting::Flipper::instance("contract");
    _contract.flip();
}
#[no_mangle]
fn get() {
    odra::casper::utils::assert_no_attached_value();
    let _contract = voting::Flipper::instance("contract");
    use odra::casper::casper_contract::unwrap_or_revert::UnwrapOrRevert;
    let result = _contract.get();
    let result = odra::casper::casper_types::CLValue::from_t(result).unwrap_or_revert();
    odra::casper::casper_contract::contract_api::runtime::ret(result);
}
