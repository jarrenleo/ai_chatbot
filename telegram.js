import { config } from "dotenv";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { OpenAI } from "./openai.js";
config();

export class Telegram extends OpenAI {
  previousMessage = [];

  constructor() {
    super();
    this.telegram = this.initTelegram();
    this.handleMessage();
  }

  initTelegram() {
    const client = new Telegraf(process.env.TELEGRAM_TOKEN);
    client.launch();

    return client;
  }

  checkPreviousMessage() {
    if (this.previousMessage.length > 1) this.previousMessage.shift();
  }

  trimMessage(m) {
    return m.text.startsWith("/") ? m.text.slice(1).trimStart() : m.text;
  }

  handleMentionedMessage(m) {
    if (m.reply_to_message) {
      this.previousMessage.shift();
      this.previousMessage.push(m.reply_to_message.text);
    }
  }

  async getGPTCompletion(m) {
    return await this.getChatCompletion(
      this.previousMessage[0],
      this.trimMessage(m)
    );
  }

  async sendMessage(c, m) {
    const response = await this.getGPTCompletion(m);
    this.previousMessage.push(response);
    c.reply(response);
  }

  handleMessage() {
    this.telegram.on(message("text"), async (c) => {
      const m = c.update.message;

      this.checkPreviousMessage(m);
      this.handleMentionedMessage(m);
      this.sendMessage(c, m);
    });
  }
}
