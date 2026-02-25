# sendpatch

Official Node.js SDK for [SendPatch](https://sendpatch.com) — send transactional email from your app with a single API call.

## Installation

```bash
npm install sendpatch
# or
yarn add sendpatch
# or
pnpm add sendpatch
```

## Requirements

- Node.js 18+ (uses the native `fetch` API)
- A SendPatch API key

## Quick start

```ts
import { SendPatch } from 'sendpatch';

const sendpatch = new SendPatch('sp_your_api_key');

const result = await sendpatch.emails.send({
  from: 'you@example.com',
  to: 'user@example.com',
  subject: 'Hello!',
  html: '<p>Welcome aboard.</p>',
});

console.log(result.message_uuid); // e.g. "msg_01abc..."
```

## Configuration

```ts
const sendpatch = new SendPatch('sp_your_api_key', {
  baseUrl: 'https://api.sendpatch.com/v1', // default
  timeout: 30_000,                          // ms, default 30 s
});
```

| Option    | Type     | Default                              | Description                    |
| --------- | -------- | ------------------------------------ | ------------------------------ |
| `baseUrl` | `string` | `https://api.sendpatch.com/v1`       | Override the API base URL      |
| `timeout` | `number` | `30000`                              | Request timeout in milliseconds |

## Sending email

### `emails.send(options)`

```ts
const result = await sendpatch.emails.send({
  from: 'Acme <noreply@acme.com>',
  to: ['alice@example.com', 'bob@example.com'],
  subject: 'Your receipt',
  text: 'Thanks for your order.',
  html: '<p>Thanks for your order.</p>',
  cc: 'billing@acme.com',
  bcc: 'archive@acme.com',
  reply_to: 'support@acme.com',
  scheduled_at: '2026-03-01T09:00:00Z', // ISO 8601, optional
  headers: { 'X-Order-ID': '12345' },
  attachments: [
    {
      filename: 'receipt.pdf',
      content: '<base64-encoded-content>',
      content_type: 'application/pdf',
    },
  ],
});
```

**Required fields**

| Field     | Type                 | Description                                    |
| --------- | -------------------- | ---------------------------------------------- |
| `from`    | `string`             | Sender address or `"Name <email>"` string      |
| `to`      | `string \| string[]` | One or more recipient addresses                |
| `subject` | `string`             | Email subject line                             |

At least one of `text` or `html` is required.

**Response**

```ts
{
  message_uuid: string;  // Unique ID for the queued message
  status: 'queued' | string;
}
```

### Attachments

| Field          | Type     | Description                                              |
| -------------- | -------- | -------------------------------------------------------- |
| `filename`     | `string` | Name shown to the recipient                              |
| `content`      | `string` | Base64-encoded file content (use this **or** `path`)     |
| `path`         | `string` | URL to a remote file (use this **or** `content`)         |
| `content_type` | `string` | MIME type, e.g. `application/pdf`                        |
| `content_id`   | `string` | Content-ID for inline images, e.g. `cid:logo`            |

### Idempotency

Pass an idempotency key to safely retry failed requests without sending duplicate emails.

```ts
const result = await sendpatch.emails
  .withIdempotencyKey('order-456-receipt')
  .send({ ... });
```

The key is consumed after each `send()` call.

## Error handling

All SDK errors extend `SendPatchError`. Import the specific error classes to handle them individually.

```ts
import {
  SendPatch,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  TimeoutError,
} from 'sendpatch';

try {
  await sendpatch.emails.send({ ... });
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (err instanceof RateLimitError) {
    console.error('Rate limit exceeded — back off and retry');
  } else if (err instanceof ValidationError) {
    console.error('Bad request:', err.message);
  } else if (err instanceof TimeoutError) {
    console.error('Request timed out');
  } else {
    throw err;
  }
}
```

| Error class           | HTTP status | Description                      |
| --------------------- | ----------- | -------------------------------- |
| `AuthenticationError` | 401         | Invalid or missing API key       |
| `PermissionError`     | 403         | API key lacks required scope     |
| `ValidationError`     | 422         | Request payload failed validation |
| `RateLimitError`      | 429         | Too many requests                |
| `HttpRequestError`    | other 4xx/5xx | Unexpected HTTP error           |
| `TimeoutError`        | —           | Request exceeded the timeout     |

`HttpRequestError` exposes `statusCode` and `responseBody` for additional context.

## TypeScript

The SDK is written in TypeScript and ships its own type declarations — no `@types/` package needed.

```ts
import type { SendEmailOptions, SendEmailResponse, EmailAttachment } from 'sendpatch';
```

## License

MIT
