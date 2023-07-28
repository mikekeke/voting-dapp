# Voting dApp

- [Voting dApp](#voting-dapp)
  - [Project description](#project-description)
  - [Repo structure](#repo-structure)
    - [3d-party-contract](#3d-party-contract)
    - [nctl-docker](#nctl-docker)
    - [node-proxy](#node-proxy)
    - [testnet-keys](#testnet-keys)
    - [voting](#voting)
    - [voting-frontend](#voting-frontend)
  - [Contract on-chain and backend](#contract-on-chain-and-backend)
    - [Odra framework](#odra-framework)
      - [Odra pros](#odra-pros)
      - [Odra cons](#odra-cons)
    - [Codebase](#codebase)
  - [Contract frontend](#contract-frontend)
    - [Signing](#signing)
  - [Deploying the project](#deploying-the-project)
    - ['Resetting' contract state](#resetting-contract-state)
    - [Switching the network](#switching-the-network)
    - [Testnet deploy](#testnet-deploy)
      - [Step 1 - keys](#step-1---keys)
      - [Step 2 - build and test](#step-2---build-and-test)
      - [Step 3 - prepare environment](#step-3---prepare-environment)
      - [Step 4 - deploy governor](#step-4---deploy-governor)
      - [Step 5 - query service](#step-5---query-service)
      - [Step 6 - 3d-party-contract](#step-6---3d-party-contract)
      - [Step 7 - proxy](#step-7---proxy)

## Project description

This is example of full-stack project that implements some simple DAO contract. On-chain part is written with [Odra framework](https://odra.dev/docs/) that greatly simplifies contract writing, but also have some drawbacks (see [Contract on-chain and backend section](#contract-on-chain-and-backend)). User interaction happens through React application.

After main contract is deployed on-chain users can:

- Create new proposals. Currently, proposal consists of some description and 3d party arbitrary contract that can be called. On-chain and backend parts do not have any limits on what contract endpoint with what arguments can be called. But frontend UI currently have some limitations on what arguments can be passed to the contract endpoint. For more details see [Contract frontend section](#contract-frontend).
- Vote on created proposals. There are no restrictions at the moment and anybody can vote, but only one time per proposal. The initial idea was to allow user to vote according their stake represented by some ERC20 standard token, but it was omitted due to development time limitations.
- Close voting. No limits here currently again - anybody can close voting. But if proposal receives majority of "YES" votes, contract inside proposal will be executed, and the one who closes voting will need to pay gas price for whatever was executed there.

## Repo structure

### 3d-party-contract

Simple contract that will be used for the demo purposes. Contract is written in vanilla/default/low-level Casper. Directory also contains shell scripts to deploy this contract and query node using `casper-client` (analog of `cardano-cli`).

### nctl-docker

Docker image to start local private network using `nctl` tool provided by the Casper ecosystem. There are `Make` commands available to start, stop, restart network and to copy predefined funded keys. Keys are copied already and into [nctl-docker/users](./nctl-docker/users/) directory, but if node version changes old keys may stop working. Node version set through [docker-compose file](./nctl-docker/docker-compose.yaml).

### node-proxy

TypeScript proxy server. Casper nodes require CORS. This proxy server solves the issue proxying requests from browser frontend. For more details see [Deploying the project section](#deploying-the-project).

### testnet-keys

Funded keys on `testnet` network. Can be imported to `Casper Wallet` browser extension.

### voting

Contains two Rust packages:
- Smart DAO smart contract and deployer for it implemented using Odra framework
- Query service to query network global state

For more details see [Contract on-chain and backend section](#contract-on-chain-and-backend)

### voting-frontend

React app with basic UI that allows to create new proposals, vote on them and close them. [Contract frontend section](#contract-on-chain-and-backend).

## Contract on-chain and backend

Smart contract is implemented using [Odra framework](https://odra.dev/docs/). Odra abstracts away all low-level Casper code and generates query layer for on-chain global state related to the contract and also generates `Deployers` that can contract endpoints on real network.

### Odra framework
A bigger example of using Odra framework in some core ecosystem project: [Casper DAO contracts](https://github.com/make-software/dao-contracts)

#### Odra pros

- A lot of low-level code is abstracted away. In bigger projects you will probably want to abstract out low-level Casper code anyway to not to write a lot of boilerplate. So Odra gives you that already.
- Code looks more like plain Rust: contract is `struct` and contract endpoints are public methods of `impl`. All storage interactions also hidden behind `struct` fields that mimics regular types like variables of type `T`, lists, maps and etc..
- Tests are kept in the same `.rs` file as in regular Rust code, not in the separate package like in `vanilla` casper examples. It also possible to test either with Odra mock VM aor with "official" casper mock VM. Odra tests gives slightly better error messages (but I'd go with Casper VM tests followed by E2E test on local private network as a final check).
- `Deployer` is generated for each contract. It gives simple abstraction for calling contract entry points - they are called just as regular methods via dot-notation. `livenet` feature allows to deploy and call contract on real network.
- Has events support build-in with some quality of life improvements (uses [casper-event-standard](https://github.com/make-software/casper-event-standard))

#### Odra cons

Names of `NamedKeys` and `Dictionary` keys used to store data on-chain are not transparent. With low-level Casper code contract author defines set of constants for `NamedKeys` names and name of the `Dictionaries` he uses. All that names can be be found in the source code and checked. Odra from the other side stores all contract's is single `Dictionary` (currently it is called `state`) and names generation is hidden from the developer.

At the moment, if contract `struct` has `Variable`, the value is stored inside this `state` dictionary, and name for the key is generated by concatenating contract name with variable name and then converted to bytes and hashed. Encoded hash is used as a key for on-chain storage. If one contract has another contract as its field, then both contract names are concatenated and then variable name added to them, converted to bytes and hashed. If something is stored in the `Mapping`, then name of the field that is used for `Mapping` in contract `struct` becomes "dictionary" name, and when something is added into `Mapping`, contract name is concatenated with `Mapping` field name ("dictionary" name), converted to bytes and hashed, then the key that user uses to store data in `Mapping` also converted to bytes and added to hash. Then hash is encoded and resulted value used as a key name for on-chain `state` `Dictionary` (so it sort of like Redis keys namespaces, but also hashed).

Sources for v0.4.0 can be found [here](https://github.com/odradev/odra/blob/release/0.4.0/odra-casper/shared/src/key_maker.rs#L12) and [here](https://github.com/odradev/odra/blob/release/0.4.0/odra-casper/livenet/src/casper_client.rs#L397).

The problem is that algorithm of keys generation is hidden from the contract developer and is subject to change. It makes querying data from chain less straightforward. Although it is possible to recreate keys creation in, say, React application (and it was tested and works), algorithm of key creation may change in the future (Odra devs also warns about it).

From the other side, it is possible to use `getters` in contract `impl` to read values from the contract `struct` fields. Odra will generate `Deployer` for each contract and this methods will be available through the contract reference that `Deployer` returns after contract initialization. Those getters are just wrappers around JSON RPC requests to the node and does not require any gas to be called. Now the question is - how to get those getters available for the front-end.

With current Odra version `0.4.0` there is no out-of-the box solution. Current solution was to write simple [web-service](./voting/query-service/) that provides REST API on top of contract "getters".

Other possible variants:
- In release `0.6.0` Odra team plans to add [WASM client](https://github.com/odradev/odra/issues/202) which will be auto-generated from the contract getters (or maybe straight from struct fields) and can be run in the browser.
- Emit events when contract state changes. Those events can be indexed by some custom indexer and then front-end can query this indexer. Seems like [casper.cloud](https://cspr.cloud/) can become a general solution for it (it is probably one of results of the [casper-dao-middleware](https://github.com/make-software/casper-dao-middleware) development).

### Codebase

The [root directory](./voting) of Contract on-chain and backend has own Makefile. Commands there allow to build contracts, test them both with Odra-mock and Casper VMs, build and run query service, deploy contract via `livenet` feature and run E2E test. There will be more details on deployment in [Deploying the project section](#deploying-the-project).

Currently contract does not use any Events.

## Contract frontend

Frontend is React application written in TypeScript with very basic UI. This is my first experience both with React and TypeScrip, so I suspect some things there are "pretty suboptimal" 🙃.

Application uses [casper-js-sdk](https://github.com/casper-ecosystem/casper-js-sdk) to build ans submit deploys. `casper-js-sdk` related cody mostly concentrated in the [GovernorClient.ts](./voting-frontend/src/GovernorClient.ts).

### Signing

It is possible to sign deploys either with Casper Wallet browser extension or with some known keys, see [CasperNetwork.ts](./voting-frontend/src/CasperNetwork.ts). To switch the way signing use `USE_CASPER_WALLET` constant in [Settings.ts](./voting-frontend/src/Settings.ts). There are some hardcoded keys in [Utils.tsx](./voting-frontend/src/Utils.tsx) that are parsed from Base64 encoded secret key. Those keys were used for development and debugging. Adjust the module if needed. It is also possible to parse keys from `.pem` files using `casper-js-sdk`.

## Deploying the project

Here will be described the procedure of how to deploy `Governor` contract on testnet, create proposal that will call 3d-party contract and vote on it.

Please read additional instructions in [Switching the network section](#switching-the-network) if you want to try to running project with the local private network, as Casper Wallet browser extension can not connect to the custom network and you will need Base64 encoded secret key or secret key `.pem` file to sign deploys. 

### 'Resetting' contract state

If you want to "reset" state of the contracts described below, just re-deploy them with the same account key. With [nctl-docker local network](./nctl-docker/) there is also [make command available](./Makefile) to reset the network.

### Switching the network

### Testnet deploy

(Step 0: prepare a lot of terminals)

#### Step 1 - keys

To deploy on testnet you will need keys. Keys can be created from Casper Waller browser extension, or using [casper-client](https://docs.casper.network/concepts/accounts-and-keys/). Keys created with Casper client can be imported to Casper Wallet browser extension. 

One secret key `.pem` file will be required to deploy the main contract with the current setup. It is possible to download keys from Casper Wallet browser extension if needed.

After keys are created and added to Casper Wallet you can use [faucet](https://testnet.cspr.live/tools/faucet) to request funds (only one request per address is allowed).

There are some funded keys awaitable in the repo in [testnet-keys dir](./testnet-keys/).

 It is required step as Casper Wallet will be used to sign deployments.

#### Step 2 - build and test

Build and test contracts.
```
cd voting
make test-w-casper
```

There should be no errors.

#### Step 3 - prepare environment

Setup Odra `livenet` environment.

Odra `livenet` feature allows you to deploy and call contracts on the real network right from еру Rust project. Path to the secret key, node url and network name are specified through the [.env file](./voting/contracts/.env). The file is currently set for testnet. `http://94.130.10.55:7777` is the RPC endpoint for some known public node running on testnet.

The is also example for `nctl` docker local network setup in `.env.ln`

#### Step 4 - deploy governor

Deploy main contract - the governor, using Odra `livenet`.

You should be in the `voting` directory.

```
make deploy-via-livenet
```

If everything went OK you should see output like this:

```
💁  INFO : Deploying "governor.wasm".
💁  INFO : Found wasm under "wasm/governor.wasm".
🙄  WAIT : Waiting 15s for "ccd895b021dcb1122032e3a87840c06bd6371a1eb32463b73fd68a689eabb5b3".
🙄  WAIT : Waiting 15s for "ccd895b021dcb1122032e3a87840c06bd6371a1eb32463b73fd68a689eabb5b3".
🙄  WAIT : Waiting 15s for "ccd895b021dcb1122032e3a87840c06bd6371a1eb32463b73fd68a689eabb5b3".
🙄  WAIT : Waiting 15s for "ccd895b021dcb1122032e3a87840c06bd6371a1eb32463b73fd68a689eabb5b3".
💁  INFO : Deploy "ccd895b021dcb1122032e3a87840c06bd6371a1eb32463b73fd68a689eabb5b3" successfully executed.
💁  INFO : Contract "hash-d5e09f8a3836faf50dd0fc416784818ab17da481d6e3f3b2e01539270432b0cc" deployed.
```

You can check deployment hash and contract hash via https://testnet.cspr.live (deploy hash is printed to the terminal in messages like `WAIT : Waiting 15s for "..."`).

During contract deployment `governor.json` file will be created in the `voting` directory. This file will contain contract package hash (but not contract hash - this is important and will be explained down the road). This file will be used by `query-service` so frontend can query it and figure out what contract to call. It was made mostly to speed up develop-debug loop.

#### Step 5 - query service

Start query service.

You should be in the `voting` directory.

```
make run-query-service
```

`query-service` uses "getters" provided by the governor contract to query node, so environment setup for `livenet` Odra feature is also required here. When `make run-query-service` is executed, it copies `.env` file from the `contracts` directory into own `query-service` directory to keep them in sync. Then it starts web-service on port `8080` built with `Actix` Rust library.

#### Step 6 - 3d-party-contract

3d-party contract can be used to test arbitrary contract execution as the result of voting. It is written in low-level Casper and mull code included for reference in [main.rs file](./3d-party-contract/main.rs).

The contract stores single variable on-chain that can be incremented by `counter_inc` entry point by desired amount. Amount is passed through entry point arguments.

All interactions happens thorough shell scripts. Scripts use `casper-client` CLI tool, so you will need it installed.

Enter [3d-party-contract contract directory](./3d-party-contract/) in terminal.

Pick user key to work with and initiate environment. E.g. running `source ./test-net-debug-user-env` will export environment variable for testnet node and secret key that have some casper funds - it was used for debugging.

Call deployment with

```
./deploy-contract.sh
```

You should see something like this:

```
{
  "id": -3930619943095932514,
  "jsonrpc": "2.0",
  "result": {
    "api_version": "1.5.2",
    "deploy_hash": "78bc3f41b7d0a51f291cab8c2e4260a679959c5f37c547cfca4dc7c90b5e3c98"
  }
}
```

Now you can check deploy hash either via `testnet.cspr.live` or by calling `./get-deploy.sh "THE_HASH"`. `testnet.cspr.live` shows you the status in UI. In case of  `./get-deploy.sh ...` seek for `execution_results` key. First `result` in array will contain either `Success` or `Failure`. `Failure` usually contains the reason.

Now we can query account to figure out Contract package hash - we will need it:

```
./query-whole-state.sh
```

Look `named_keys` for something like this:
```
{
  "key": "hash-9556e2bc1477dfce434f1b1768f496792d8059b4746c2815bd52ac7ae6cad66b",
  "name": "counter_package_hash"
}
```

This is the hash we will need later.

(Leave this terminal open - we will need it 🙂)

#### Step 7 - proxy

Casper nodes require CORS. It was told by developers, that starting from version `1.5` cors will be removed, and it was indeed till `1.5.2`. At the current moment testnet nodes run `1.5.2`, so CORS is back.