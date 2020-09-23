'use strict';

const {
  lightstep,
  opentelemetry,
} = require('lightstep-opentelemetry-launcher-node');

const TARGET_URL = process.env.TARGET_URL || 'http://server:8080/ping';
const sdk = lightstep.configureOpenTelemetry({
  spanEndpoint: "http://collector:55681/v1/trace",
  serviceName: 'client'
});

sdk.start().then(() => {
  const http = require('http');
  setInterval(() => {
    const tracer = opentelemetry.trace.getTracer('otel-client-example');
    const span = tracer.startSpan('client.ping');
    console.log('send: ping');
    tracer.withSpan(span, () => {
      http.get(TARGET_URL, resp => {
        let data = '';
        resp.on('data', chunk => (data += chunk));
        resp.on('end', () => console.log(`recv: ${data}`));
        resp.on('error', err => console.log('Error: ' + err.message));
      });
    });
    span.end();
  }, 500);
});