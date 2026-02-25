import { SendPatchClient, type SendPatchClientConfig } from './client';
import { EmailsEndpoint } from './endpoints/emails';

export class SendPatch {
  /** Send transactional emails. */
  readonly emails: EmailsEndpoint;

  private readonly client: SendPatchClient;

  constructor(apiKey: string, config?: Omit<SendPatchClientConfig, 'apiKey'>) {
    this.client = new SendPatchClient({ apiKey, ...config });
    this.emails = new EmailsEndpoint(this.client);
  }
}

export default SendPatch;
