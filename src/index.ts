// Credit: KrataiB
// src/index.ts
/**
 * elysia-line
 *
 * LINE Messaging API webhook plugin for Elysia with official SDK integration
 *
 * @example
 * ```ts
 * import { Elysia } from 'elysia'
 * import { line } from 'elysia-line'
 *
 * new Elysia()
 * .use(
 * line({
 * channelSecret: process.env.LINE_CHANNEL_SECRET!,
 * channelAccessToken: process.env.LINE_ACCESS_TOKEN!
 * })
 * )
 * .post('/webhook', ({ line }) =>
 * line.on('message:text', (event) =>
 * line.reply(event.replyToken, {
 * type: 'text',
 * text: event.message.text
 * })
 * )
 * )
 * .listen(3000)
 * ```
 *
 * @module
 */

import { Elysia } from "elysia";
import {
  messagingApi,
  type WebhookEvent,
  type WebhookRequestBody,
  type MessageEvent,
  type FollowEvent,
  type UnfollowEvent,
  type JoinEvent,
  type LeaveEvent,
  type PostbackEvent,
  type BeaconEvent,
  type AudioEventMessage,
  type FileEventMessage,
  type ImageEventMessage,
  type LocationEventMessage,
  type StickerEventMessage,
  type TextEventMessage,
  type VideoEventMessage,
} from "@line/bot-sdk";
import { createHmac } from "crypto";



/**
 * LINE webhook plugin configuration
 */
export interface LineOptions {
  /**
   * LINE channel secret for signature verification (required)
   */
  channelSecret: string;

  /**
   * LINE channel access token (required for sending messages)
   */
  channelAccessToken: string;

  /**
   * Enable verbose logging for debugging.
   * When true, debug messages will be outputted in JSON format.
   * Defaults to false.
   */
  verbose?: boolean;
}

export type MessageEventMap = {
  "message:text": TextEventMessage;
  "message:image": ImageEventMessage;
  "message:video": VideoEventMessage;
  "message:audio": AudioEventMessage;
  "message:file": FileEventMessage;
  "message:location": LocationEventMessage;
  "message:sticker": StickerEventMessage;
};

export type WebhookEventMap = {
  [K in keyof MessageEventMap]: MessageEvent & { message: MessageEventMap[K] };
} & {
  follow: FollowEvent;
  unfollow: UnfollowEvent;
  join: JoinEvent;
  leave: LeaveEvent;
  postback: PostbackEvent;
  beacon: BeaconEvent;
  "*": WebhookEvent;
};

/**
 * Event handler type
 */
type EventHandler<T extends WebhookEvent = WebhookEvent> = (
  event: T
) => void | Promise<void>;

type EventHandlers = Map<
  keyof WebhookEventMap,
  EventHandler<WebhookEventMap[keyof WebhookEventMap]>[]
>;

/**
 * LINE Helper - Provides easy-to-use methods for handling LINE events
 */
export class LineHelper {
  private client: messagingApi.MessagingApiClient;
  private events: WebhookEvent[] = [];
  private handlers: EventHandlers = new Map();
  private verbose: boolean;

  constructor(channelAccessToken: string, events: WebhookEvent[], verbose: boolean) {
    this.client = new messagingApi.MessagingApiClient({
      channelAccessToken,
    });
    this.events = events;
    this.verbose = verbose;
  }

  private log(level: "log" | "error", message: string, data?: any) {
    if (!this.verbose) return;
    const prefix = `[LINE Plugin] [${level.toUpperCase()}]`;
    if (data) {
      console[level](prefix, message, data);
    } else {
      console[level](prefix, message);
    }
  }


  /**
   * Register event handler
   *
   * @example
   * ```ts
   * line.on('message:text', (event) => {
   * console.log(event.message.text)
   * })
   *
   * line.on('*', (event) => {
   * console.log('Received any event:', event.type)
   * })
   * ```
   */
  on<K extends keyof WebhookEventMap>(
    eventType: K,
    handler: EventHandler<WebhookEventMap[K]>
  ): this {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers
      .get(eventType)!
      .push(handler as EventHandler<WebhookEventMap[keyof WebhookEventMap]>);
    return this;
  }

  /**
   * Execute registered handlers
   */
  async handle(): Promise<void> {
    const promises: (void | Promise<void>)[] = [];
    const wildcardHandlers = this.handlers.get("*") || [];

    for (const event of this.events) {
      // Handle wildcard handlers
      for (const handler of wildcardHandlers) {
        promises.push(handler(event));
      }

      // Handle specific message types
      if (event.type === "message" && event.message) {
        const messageType =
          `message:${event.message.type}` as keyof WebhookEventMap;
        const handlers = this.handlers.get(messageType) || [];

        for (const handler of handlers) {
          promises.push(handler(event));
        }
      }

      // Handle generic event types
      const handlers =
        this.handlers.get(event.type as keyof WebhookEventMap) || [];
      for (const handler of handlers) {
        promises.push(handler(event));
      }
    }

    try {
      await Promise.all(promises);
    } catch (e) {
      this.log("error", "Error handling events", e);
    }
  }

  /**
   * Reply to a message
   *
   * @example
   * ```ts
   * await line.reply(event.replyToken, {
   * type: 'text',
   * text: 'Hello!'
   * })
   * ```
   */
  async reply(
    replyToken: string,
    messages: messagingApi.Message | messagingApi.Message[]
  ): Promise<void> {
    await this.client.replyMessage({
      replyToken,
      messages: Array.isArray(messages) ? messages : [messages],
    });
  }

  /**
   * Push message to user/group/room
   *
   * @example
   * ```ts
   * await line.push('U1234567890', {
   * type: 'text',
   * text: 'Hello!'
   * })
   * ```
   */
  async push(
    to: string,
    messages: messagingApi.Message | messagingApi.Message[]
  ): Promise<void> {
    await this.client.pushMessage({
      to,
      messages: Array.isArray(messages) ? messages : [messages],
    });
  }
  /**
   * Get raw events
   */
  getEvents(): WebhookEvent[] {
    return this.events;
  }

  /**
   * Get messaging API client for advanced usage
   */
  getClient(): messagingApi.MessagingApiClient {
    return this.client;
  }
}

/**
 * LINE Store interface
 */
export interface LineStore {
  "line-events": WebhookEvent[];
  "line-destination": string;
}

/**
 * LINE context added to Elysia
 */
export interface LineContext {
  line: LineHelper | undefined;
}

/**
 * Validate LINE signature
 */
function validateSignature(
  body: string,
  signature: string,
  channelSecret: string
): boolean {
  const hash = createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");

  return hash === signature;
}

/**
 * LINE Messaging API webhook plugin for Elysia
 *
 * @example
 * Echo bot:
 * ```ts
 * import { Elysia } from 'elysia'
 * import { line } from 'elysia-line'
 *
 * new Elysia()
 * .use(line({
 * channelSecret: process.env.LINE_CHANNEL_SECRET!,
 * channelAccessToken: process.env.LINE_ACCESS_TOKEN!
 * }))
 * .post('/webhook', ({ line }) =>
 * line.on('message:text', (event) =>
 * line.reply(event.replyToken, {
 * type: 'text',
 * text: event.message.text
 * })
 * )
 * )
 * ```
 */
export const line = (options: LineOptions) => {
  const { channelSecret, channelAccessToken, verbose = false } = options;

  if (!channelSecret) {
    throw new Error(
      "channelSecret is required. Get it from LINE Developers Console."
    );
  }

  if (!channelAccessToken) {
    throw new Error(
      "channelAccessToken is required. Get it from LINE Developers Console."
    );
  }

  return new Elysia({
    name: "elysia-line",
    seed: options,
  })
    .state("line-events", [] as WebhookEvent[])
    .state("line-destination", "" as string)
    .onRequest(async ({ request, set, store }) => {
      // We only care about POST requests
      if (request.method !== "POST") {
        return;
      }

      const signature = request.headers.get("x-line-signature");
      if (verbose) console.log("[LINE Plugin] [LOG] --- LINE Webhook Request ---");
      if (verbose) console.log("[LINE Plugin] [LOG] Headers:", Object.fromEntries(request.headers.entries()));

      if (!signature) {
        if (verbose) console.log("[LINE Plugin] [LOG] Request is not from LINE (missing signature). Ignoring.");
        return;
      }
      if (verbose) console.log("[LINE Plugin] [LOG] Signature found:", signature);


      let body: string;
      try {
        body = await request.text();
        if (verbose) console.log("[LINE Plugin] [LOG] Request body read successfully.");
        if (verbose) console.log("[LINE Plugin] [LOG] Body:", body);
      } catch (e) {
        console.error("[LINE Plugin] [ERROR] FATAL: Failed to read request body:", e);
        return;
      }

      // Validate signature
      const isValid = validateSignature(body, signature, channelSecret);
      if (verbose) console.log(`[LINE Plugin] [LOG] Signature validation result: ${isValid ? "VALID" : "INVALID"}`);
      if (!isValid) {
        console.error("[LINE Plugin] [ERROR] FATAL: Invalid signature. Request will be ignored.");
        return;
      }

      // Parse webhook payload
      try {
        const payload: WebhookRequestBody = JSON.parse(body);
        if (verbose) console.log("[LINE Plugin] [LOG] Request body parsed successfully.");

        // Populate store for later use in derive/handler
        store["line-events"] = payload.events ?? [];
        store["line-destination"] = payload.destination ?? "";
        if (verbose) console.log("[LINE Plugin] [LOG] Store populated with events and destination.");
      } catch (e) {
        console.error("[LINE Plugin] [ERROR] FATAL: Invalid JSON body:", e);
        return;
      }
      if (verbose) console.log("[LINE Plugin] [LOG] --- onRequest Hook Completed Successfully ---");
    })
    .derive({ as: "global" }, ({ store }) => {
      // Only provide line helper if there are events
      const events = store["line-events"] as WebhookEvent[];

      if (!events || events.length === 0) {
        return {
          line: undefined,
        };
      }

      return {
        line: new LineHelper(channelAccessToken, events, verbose),
      };
    });
};

export default line;

/**
 * Re-export commonly used types
 */
export type {
  WebhookEvent,
  WebhookRequestBody,
  MessageEvent,
  TextEventMessage,
  ImageEventMessage,
  VideoEventMessage,
  AudioEventMessage,
  FileEventMessage,
  LocationEventMessage,
  StickerEventMessage,
} from "@line/bot-sdk";
