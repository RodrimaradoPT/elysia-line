# GEMINI.md

## Project Overview

This project is an ElysiaJS plugin for handling LINE Messaging API webhooks. It simplifies the process of creating LINE bots by providing a clean, typed, and zero-config integration with the official LINE bot SDK.

The main logic is in `src/index.ts`, which exports a `line` plugin for Elysia. This plugin handles webhook signature validation and provides a `LineHelper` class to easily handle different event types and send messages.

The project is built with Bun and TypeScript.

## Building and Running

### Build

To build the project, run:

```bash
bun run build
```

This will compile the TypeScript source from `src/` and output the JavaScript to the `dist/` directory.

### Running in Development

The `README.md` suggests running the project with:

```bash
bun run index.ts
```

However, `index.ts` only contains `console.log("Hello via Bun!");`. To properly test this plugin, you would need to create a separate Elysia application that uses it.

Here's an example of how you might set up a test server:

```typescript
// test/app.ts
import { Elysia } from 'elysia';
import { line } from '../src/index'; // or 'elysia-line' if installed

const app = new Elysia()
  .use(
    line({
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    })
  )
  .post('/webhook', ({ line }) => {
    line.on('message:text', (event) => {
      console.log('Received text message:', event.message.text);
      return line.reply(event.replyToken, {
        type: 'text',
        text: `You said: ${event.message.text}`,
      });
    });
  })
  .listen(3000);

console.log(`Elysia is running at http://localhost:3000`);
```

You would then run this file with Bun:

```bash
bun run test/app.ts
```

**TODO:** Create a proper example or test file to demonstrate the usage of the plugin.

## Development Conventions

*   **Code Style:** The code follows standard TypeScript and ElysiaJS conventions. It is well-documented with TSDoc comments.
*   **Testing:** There are no explicit tests in the project.
*   **Dependencies:** The project uses `bun` for package management. Dependencies are listed in `package.json`.
*   **Tooling:**
    *   **Bun:** Used for running, building, and package management.
    *   **TypeScript:** For static typing.
    *   **ElysiaJS:** The web framework for which this plugin is built.
