nctl-up:
	cd nctl-docker && docker compose up

nctl-up-cors-d:
	cd nctl-docker && docker compose --profile cors-anywhere up -d

nctl-up-detach:
	cd nctl-docker && docker compose up -d

nctl-down:
	cd nctl-docker && docker compose down

nctl-restart:
	cd nctl-docker && docker compose exec -d mynctl /bin/bash "-c" "chmod +x /home/casper/restart.sh && /home/casper/restart.sh"

nctl-copy-keys:
	cd nctl-docker && docker compose cp mynctl:/home/casper/casper-node/utils/nctl/assets/net-1/users .

cp-wasm-to-client:
	cd contract && cargo build --release --target wasm32-unknown-unknown
	wasm-strip contract/target/wasm32-unknown-unknown/release/contract.wasm 2>/dev/null | true
	cp contract/target/wasm32-unknown-unknown/release/contract.wasm client/wasm

build-contracts:
	cd voting && cargo odra build -b casper

update-sdk-wasm:
	cd voting && cargo odra build -b casper && cp ./wasm/*.wasm ../voting-js-sdk/wasm

test-w-odra:
	cd voting && cargo odra test

test-w-casper:
	cd voting && cargo odra test -b casper