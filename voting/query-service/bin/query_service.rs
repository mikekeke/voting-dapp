// #[cfg(not(feature = "casper-livenet"))]
// compile_error!("This crate can only be used for CasperLabs Livenet");

use odra::client_env;
use odra::types::Address;
use std::str::FromStr;
// use hex::decode;

use actix_cors::Cors;
use actix_web::{error, get, post, web, App, HttpResponse, HttpServer, Responder};
use contracts::{
    governor::{GovernorDeployer, GovernorRef},
    types::ProposalId,
};
use log::{info, trace, warn};

use query_service::dto::{ProposalDTO, ProposalsDTO};

#[get("/proposal/{proposal_id}")]
async fn get_proposal(
    info: web::Path<u64>,
    data: web::Data<ClientState>,
) -> actix_web::Result<impl Responder> {
    let proposal_id = info.into_inner();
    let result = web::block(move || {
        let gov_addr = Address::from_str(data.contract_hash.clone().as_str()).unwrap();
        let mut gov = GovernorDeployer::register(gov_addr);

        gov.get_proposal(proposal_id)
    })
    .await
    .map_err(|_| error::ErrorInternalServerError("Failed to query proposal from chain"))?;

    Ok(HttpResponse::Ok().json(result))
}

#[get("/proposals")]
async fn all_proposals(data: web::Data<ClientState>) -> actix_web::Result<impl Responder> {
    let result = web::block(move || {
        let gov_addr = Address::from_str(data.contract_hash.clone().as_str()).unwrap();
        let mut gov = GovernorDeployer::register(gov_addr);

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

struct ClientState {
    contract_hash: String,
}

#[actix_web::main] // or #[tokio::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::permissive();
        // App::new().wrap(cors).service(new_proposal)
        App::new()
            .app_data(web::Data::new(ClientState {
                contract_hash: String::from(
                    "hash-ca2c162c3b3048721341615e64de97d937e6c3d394ab465fa1ec07d97c4db7c5",
                ),
            }))
            .service(get_proposal)
            .service(all_proposals)
        // .route("/get", web::get().to(get_proposal))
        // .route("/new/{text}", web::get().to(new_proposal))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
