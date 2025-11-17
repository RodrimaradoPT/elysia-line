// test/app.ts
import { Elysia } from "elysia";
import { line } from "../src/index";

const app = new Elysia()
  .use(
    line({
      channelSecret: "",
      channelAccessToken:
        "",
      verbose: false,
    })
  )
  .post("/webhook", async ({ line, set }) => {
    if (line) {
      line.on("message:text", (event) => {
        line.reply(event.replyToken, {
          type: "text",
          text: `You said: ${event.message.text}`,
        });

        if (event.source.userId) {
          line.push(event.source.userId, {
            type: "text",
            text: "This is a push message!",
          });
        }
      });

      await line.handle();
      return "OK";
    }

    return "Not a LINE webhook";
  })
  .listen(3000);

console.log(`Elysia is running at http://localhost:3000`);
