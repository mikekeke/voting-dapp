// import express from 'express';
const express = require('express');
import { createProxyMiddleware, Filter, Options, RequestHandler } from 'http-proxy-middleware';

const app = express();

app.use('/rpc', createProxyMiddleware(
  {
    // target: 'http://localhost:11101',
    target: 'https://rpc.integration.casperlabs.io',
    changeOrigin: true
  }));
app.listen(3001);