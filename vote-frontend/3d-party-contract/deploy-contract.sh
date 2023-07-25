#!/usr/bin/env bash

casper-client put-deploy \
  --node-address ${NODE_ADDR} \
  --chain-name casper-net-1 \
  --secret-key ${SECRET_KEY} \
  --payment-amount 22000000000 \
  --session-path ./contract.wasm
