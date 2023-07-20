// #[cfg(not(feature = "casper-livenet"))]
// compile_error!("This crate can only be used for CasperLabs Livenet");

use odra::client_env;
use odra::types::Address;
use std::fs;
use std::str::FromStr;

use actix_cors::Cors;
use actix_web::{error, get, post, web, App, HttpResponse, HttpServer, Responder};
use contracts::{
    deployed_governor::{self, DeployedGovernor},
    governor::{GovernorDeployer, GovernorRef},
    types::ProposalId,
};
use log::{info, trace, warn};
use serde_json;

use query_service::dto::{ProposalDTO, ProposalsDTO};

#[get("/proposal/{proposal_id}")]
async fn get_proposal(
    info: web::Path<u64>,
    data: web::Data<ClientState>,
) -> actix_web::Result<impl Responder> {
    let proposal_id = info.into_inner();
    let result = web::block(move || {
        let mut gov = GovernorDeployer::register(data.contract_address);

        gov.get_proposal(proposal_id)
    })
    .await
    .map_err(|_| error::ErrorInternalServerError("Failed to query proposal from chain"))?;

    Ok(HttpResponse::Ok().json(ProposalDTO::from(result)))
}

// Will fail with "not implemented error" if no proposals were created,
// coz there will be no corresponding Named Key in Contract context created yet, I suppose
#[get("/proposals")]
async fn all_proposals(data: web::Data<ClientState>) -> actix_web::Result<impl Responder> {
    let result = web::block(move || {
        let mut gov = GovernorDeployer::register(data.contract_address);

        let num_of_proposals = gov.last_proposal_id();
        let mut proposals = ProposalsDTO::empty();
        for n in 0..=num_of_proposals {
            proposals.add(ProposalDTO::from(gov.get_proposal(n)));
        }

        proposals
    })
    .await
    .map_err(|_| error::ErrorInternalServerError("Failed to query proposals from chain"))?;

    Ok(HttpResponse::Ok().json(result))
}

#[get("debug/proposals")]
async fn debug_proposals(data: web::Data<ClientState>) -> actix_web::Result<impl Responder> {
    let mut proposals = ProposalsDTO::empty();
    for n in 0..=4 {
        proposals.add(ProposalDTO {
            id: n,
            statement: format!("Proposal #{}", n),
            yea: n.try_into().unwrap(),
            nay: 0,
        });
    }

    Ok(HttpResponse::Ok().json(proposals))
}

struct ClientState {
    contract_address: Address,
}

#[actix_web::main] // or #[tokio::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::permissive();
        
        let deployed_governor = DeployedGovernor::load_from_file("./../governor.json");
        let contract_address =
            Address::from_str(deployed_governor.get_package_hash()).expect(
                "Should be able to parse address from {}"
            );
        App::new()
            .wrap(cors)
            .app_data(web::Data::new(ClientState { contract_address }))
            .service(get_proposal)
            .service(all_proposals)
            .service(debug_proposals)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
