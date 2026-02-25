import type { SendPatchClient } from '../client';
import { Endpoint } from './endpoint';

export interface EmailAttachment {
  /** The filename of the attachment. */
  filename: string;
  /** Base64-encoded file content. Use this or `path`, not both. */
  content?: string;
  /** URL to a remote file. Use this or `content`, not both. */
  path?: string;
  /** MIME type of the attachment, e.g. `application/pdf`. */
  content_type?: string;
  /** Content-ID for inline images, e.g. `cid:logo`. */
  content_id?: string;
}

export interface SendEmailOptions {
  /** Sender address, e.g. `"Name <name@example.com>"` or `"name@example.com"`. */
  from: string;
  /** One or more recipient addresses. */
  to: string | string[];
  /** Email subject line. */
  subject: string;
  /** Plain-text body. At least one of `text` or `html` is required. */
  text?: string;
  /** HTML body. At least one of `text` or `html` is required. */
  html?: string;
  /** CC recipients. */
  cc?: string | string[];
  /** BCC recipients. */
  bcc?: string | string[];
  /** Reply-to address(es). */
  reply_to?: string | string[];
  /** Schedule the email for future delivery (ISO 8601). */
  scheduled_at?: string;
  /** Custom email headers. */
  headers?: Record<string, string>;
  /** File attachments. */
  attachments?: EmailAttachment[];
}

export interface SendEmailResponse {
  /** Unique identifier for the queued message. */
  message_uuid: string;
  /** Delivery status — will be `"queued"` immediately after sending. */
  status: 'queued' | string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    message: SendEmailResponse;
  };
}

export class EmailsEndpoint extends Endpoint {
  private idempotencyKey?: string;

  constructor(client: SendPatchClient) {
    super(client);
  }

  /**
   * Set an idempotency key so retries do not result in duplicate emails.
   * The key is cleared after each `send()` call.
   */
  withIdempotencyKey(key: string): this {
    this.idempotencyKey = key;
    return this;
  }

  /**
   * Send a transactional email.
   *
   * @example
   * ```ts
   * const result = await sendpatch.emails.send({
   *   from: 'hello@example.com',
   *   to: 'user@example.com',
   *   subject: 'Welcome!',
   *   html: '<p>Thanks for signing up.</p>',
   * });
   * console.log(result.message_uuid);
   * ```
   */
  async send(options: SendEmailOptions): Promise<SendEmailResponse> {
    const headers: Record<string, string> = {};

    if (this.idempotencyKey) {
      headers['Idempotency-Key'] = this.idempotencyKey;
      this.idempotencyKey = undefined;
    }

    const response = await this.httpClient.post<ApiResponse>(
      '/emails',
      options,
      { headers },
    );

    return response.data.message;
  }
}
