import type { SendPatchClient } from '../client';

export abstract class Endpoint {
  protected readonly httpClient: SendPatchClient;

  constructor(client: SendPatchClient) {
    this.httpClient = client;
  }
}
