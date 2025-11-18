# GEMINI.md

## Project Overview

This project is an ElysiaJS plugin for handling LINE Messaging API webhooks. It simplifies the process of creating LINE bots by providing a clean, typed, and zero-config integration with the official LINE bot SDK.

The main logic has been refactored into a modular structure within the `src/` directory:
- `core/`: Contains the core logic, like the `LineHelper` class.
- `logger/`: Contains the `LineLogger` class for logging.
- `plugin/`: Contains the main Elysia plugin logic.
- `types/`: Contains all type definitions for the plugin.
- `index.ts`: The main entry point, which exports all public APIs.

This structure separates concerns and makes the codebase easier to maintain and contribute to. The plugin still handles webhook signature validation and provides a `LineHelper` class to easily handle different event types and send messages.

The project is built with Bun and TypeScript.

## Building and Running

### Build

To build the project, run:

```bash
bun run build
```

This will compile the TypeScript source from `src/` and output the JavaScript to the `dist/` directory.

### Running in Development

The project includes an example application in `test/app.ts` that demonstrates how to use the plugin.

Here's the content of `test/app.ts`:

```typescript
import { Elysia } from "elysia";
import { line } from "../src/index";

const app = new Elysia()
  .use(
    line({
      channelSecret: process.env.channelSecret!,
      channelAccessToken: process.env.channelAccessToken!,
      verbose: true,
    })
  )
  .post("/webhook", async ({ line, set }) => {
    if (!line) {
      return "Not a LINE webhook";
    }

    // Register handlers
    line.on("message:text", (event) => {
      line.reply(event.replyToken, {
        type: "text",
        text: `You said: ${event.message.text}`,
      });
    });

    await line.handle();
    return "OK";
  })
  .listen(3000);

console.log(`Elysia is running at http://localhost:3000`);
```

You can run this example with Bun:

```bash
bun run test/app.ts
```

## Development Conventions

*   **Code Style:** The code follows standard TypeScript and ElysiaJS conventions. It is well-documented with TSDoc comments and organized in a modular folder structure within `src/`.
*   **Testing:** There are no explicit tests in the project.
*   **Dependencies:** The project uses `bun` for package management. Dependencies are listed in `package.json`.
*   **Tooling:**
    *   **Bun:** Used for running, building, and package management.
    *   **TypeScript:** For static typing.
    *   **ElysiaJS:** The web framework for which this plugin is built.
