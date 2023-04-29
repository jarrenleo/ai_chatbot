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

  checkMessage(message) {
    if (this.previousMessage.length > 1) this.previousMessage.shift();
    if (message.reply_to_message) {
      this.previousMessage.shift();
      this.previousMessage.push(message.reply_to_message.text);
    }
  }

  getCurrentMessage(message) {
    return message.text.startsWith("/")
      ? message.text.slice(1).trimStart()
      : message.text;
  }

  async getGPTCompletion(message) {
    return await this.getChatCompletion(
      this.previousMessage[0],
      this.getCurrentMessage(message)
    );
  }

  async sendAndUpdateMessage(c, message) {
    const response = await this.getGPTCompletion(message);
    c.reply(response);
    this.previousMessage.push(response);
  }

  handleMessage() {
    this.telegram.on(message("text"), async (c) => {
      const message = c.update.message;
      this.checkMessage(message);
      this.sendAndUpdateMessage(c, message);
    });
  }
}
