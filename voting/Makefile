build-casper:
	cd contracts && cargo odra build -b casper

deploy-via-livenet:
	cd contracts \
	&& cargo odra build -b casper \
	&& cargo run --bin deploy --features casper-livenet --no-default-features

livenet-e2e:
	cd contracts \
	&& cargo odra build -b casper \
	&& cargo run --bin livenet-scenario --features casper-livenet --no-default-features

dbg-query:
	cargo run --bin query --features casper-livenet --no-default-features

test-w-mock-vm:
	cd contracts && cargo odra test

test-w-casper:
	cd contracts && cargo odra test -b casper

start-query-service:
	cd query-service && cargo run
