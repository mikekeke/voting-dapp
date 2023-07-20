use serde::{Deserialize, Serialize};
use serde_json::Result;
use std::fs;
use std::io::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct DeployedGovernor {
    pub package_key: String,
    pub package_hash: String,
}

impl DeployedGovernor {
    pub fn new(package_hash: String) -> Self {
        DeployedGovernor {
            package_key: "governor_package_hash".to_string(),
            package_hash,
        }
    }

    pub fn save_to_file(&self, path: &str) {
        let res = serde_json::to_string(self).unwrap();
        fs::write(path, res).unwrap();
    }

    pub fn load_from_file(path: &str) -> Self {
        let governor_json = fs::read_to_string(path).expect("Should read governor data from file");
        serde_json::from_str(&governor_json).expect("Should parse JSON with contract data")
    }
}
