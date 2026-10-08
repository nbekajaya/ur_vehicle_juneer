import { WsTransport } from "./ws_transport.js";

export function createTransport(config) {
  // Later: switch on config.transportKind for "webserial", "mock", etc.
  return new WsTransport(config.wsUrl);
}