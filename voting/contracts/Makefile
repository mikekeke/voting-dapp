build-livenet:
	cargo build --bin vote-client --features casper-livenet --no-default-features

build-casper:
	cargo odra build -b casper
# run-livenet:
# 	cargo run --bin vote-client --features casper-livenet --no-default-features

run-livenet:
	cargo run --bin vote-client --features casper-livenet --no-default-features

deploy-livenet:
	cargo odra build -b casper \
	&& cargo run --bin deploy --features casper-livenet --no-default-features

livenet-scenario:
	cargo odra build -b casper \
	&& cargo run --bin livenet-scenario --features casper-livenet --no-default-features

dbg-query:
	cargo run --bin query --features casper-livenet --no-default-features

test-odra-casper:
	cargo odra test -b casper
