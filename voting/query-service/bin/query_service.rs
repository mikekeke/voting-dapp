// #[cfg(not(feature = "casper-livenet"))]
// compile_error!("This crate can only be used for CasperLabs Livenet");

use odra::client_env;
use odra::types::Address;
use std::str::FromStr;
// use hex::decode;

use actix_cors::Cors;
use actix_web::{error, get, post, web, App, HttpResponse, HttpServer, Responder};
use contracts::{governor::{GovernorDeployer, ProposalId}, GovernorRef};
use log::{info, trace, warn};

use query_service::dto::ProposalDTO;

#[get("/query/{proposal_id}")]
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

    let result = serde_json::to_string(&ProposalDTO::from(result))?;
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
                    "hash-73f8ee4eec4d758685a55f656aa6fd9df794b46f9ca20002a2b58796d92d3d36",
                ),
            }))
            .service(get_proposal)
        // .route("/get", web::get().to(get_proposal))
        // .route("/new/{text}", web::get().to(new_proposal))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
