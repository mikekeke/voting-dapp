"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import express from 'express';
const express = require('express');
const http_proxy_middleware_1 = require("http-proxy-middleware");
const app = express();
app.use('/rpc', (0, http_proxy_middleware_1.createProxyMiddleware)({
    // target: 'http://localhost:11101',
    target: 'https://rpc.integration.casperlabs.io',
    changeOrigin: true
}));
app.listen(3001);
