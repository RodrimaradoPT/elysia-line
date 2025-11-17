// test/app.ts
import { Elysia } from "elysia";
import { line } from "../src/index";

const app = new Elysia()
  .use(
    line({
      channelSecret: "e4401e00b74bd2999a3f4892434517ce",
      channelAccessToken:
        "PEr48O9Lnhb4Pb2uWF0eLMRlsI675R///Wabgy5uo3kJGTtWp8nUx+1SRY+LTX8u0lx9jixmkZjd7QmplARwloB3ZXNy1dXcTywmEyjI4F2cvUFQQJjlmr1MBnlJchQ7FZkjbO9/Y2/s2D70ZVNN0wdB04t89/1O/w1cDnyilFU=",
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
