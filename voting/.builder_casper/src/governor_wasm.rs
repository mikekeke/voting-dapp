#![no_main]
use odra::Instance;
#[no_mangle]
fn call() {
    let schemas = vec![];
    let mut entry_points = odra::casper::casper_types::EntryPoints::new();
    entry_points.add_entry_point(odra::casper::casper_types::EntryPoint::new(
        stringify!(init),
        {
            let mut params: Vec<odra::casper::casper_types::Parameter> = Vec::new();
            params.push(odra::casper::casper_types::Parameter::new(
                stringify!(name),
                odra::casper::casper_types::CLType::String,
            ));
            params
        },
        odra::casper::casper_types::CLType::Unit,
        odra::casper::casper_types::EntryPointAccess::Groups(vec![
            odra::casper::casper_types::Group::new("constructor_group"),
        ]),
        odra::casper::casper_types::EntryPointType::Contract,
    ));
    entry_points.add_entry_point(odra::casper::casper_types::EntryPoint::new(
        stringify!(new_proposal),
        {
            let mut params: Vec<odra::casper::casper_types::Parameter> = Vec::new();
            params.push(odra::casper::casper_types::Parameter::new(
                stringify!(statement),
                odra::casper::casper_types::CLType::String,
            ));
            params
        },
        odra::casper::casper_types::CLType::Unit,
        odra::casper::casper_types::EntryPointAccess::Public,
        odra::casper::casper_types::EntryPointType::Contract,
    ));
    entry_points.add_entry_point(odra::casper::casper_types::EntryPoint::new(
        stringify!(get_rpoposal),
        {
            let mut params: Vec<odra::casper::casper_types::Parameter> = Vec::new();
            params.push(odra::casper::casper_types::Parameter::new(
                stringify!(id),
                odra::casper::casper_types::CLType::U64,
            ));
            params
        },
        odra::casper::casper_types::CLType::Any,
        odra::casper::casper_types::EntryPointAccess::Public,
        odra::casper::casper_types::EntryPointType::Contract,
    ));
    #[allow(unused_variables)]
    let contract_package_hash = odra::casper::utils::install_contract(entry_points, schemas);
    use odra::casper::casper_contract::unwrap_or_revert::UnwrapOrRevert;
    let constructor_access = odra::casper::utils::create_constructor_group(contract_package_hash);
    let constructor_name = odra::casper::utils::load_constructor_name_arg();
    match constructor_name.as_str() {
        stringify!(init) => {
            let odra_address = odra::types::Address::try_from(contract_package_hash)
                .map_err(|err| {
                    let code = odra::types::ExecutionError::from(err).code();
                    odra::casper::casper_types::ApiError::User(code)
                })
                .unwrap_or_revert();
            let mut contract_ref = voting::governor::GovernorRef::at(&odra_address);
            let name = odra::casper::casper_contract::contract_api::runtime::get_named_arg(
                stringify!(name),
            );
            contract_ref.init(name);
        }
        _ => odra::casper::utils::revert_on_unknown_constructor(),
    };
    odra::casper::utils::revoke_access_to_constructor_group(
        contract_package_hash,
        constructor_access,
    );
}
#[no_mangle]
fn init() {
    odra::casper::utils::assert_no_attached_value();
    let mut _contract = voting::governor::Governor::instance("contract");
    let name =
        odra::casper::casper_contract::contract_api::runtime::get_named_arg(stringify!(name));
    _contract.init(name);
}
#[no_mangle]
fn new_proposal() {
    odra::casper::utils::assert_no_attached_value();
    let mut _contract = voting::governor::Governor::instance("contract");
    let statement =
        odra::casper::casper_contract::contract_api::runtime::get_named_arg(stringify!(statement));
    _contract.new_proposal(statement);
}
#[no_mangle]
fn get_rpoposal() {
    odra::casper::utils::assert_no_attached_value();
    let mut _contract = voting::governor::Governor::instance("contract");
    use odra::casper::casper_contract::unwrap_or_revert::UnwrapOrRevert;
    let id = odra::casper::casper_contract::contract_api::runtime::get_named_arg(stringify!(id));
    let result = _contract.get_rpoposal(id);
    let result = odra::casper::casper_types::CLValue::from_t(result).unwrap_or_revert();
    odra::casper::casper_contract::contract_api::runtime::ret(result);
}
