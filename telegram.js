import { config } from "dotenv";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { OpenAI } from "./openai.js";
config();

export class Telegram extends OpenAI {
  previousMessage = [];

  constructor() {
    super();
    this.telegram = this.init();
    this.telegram.launch();
    this.handleMessage();
  }

  init() {
    return new Telegraf(process.env.TELEGRAM_TOKEN);
  }

  handleMessage() {
    this.telegram.on(message("text"), async (context) => {
      if (this.previousMessage.length > 1) this.previousMessage.shift();

      const currentMessage = context.update.message.text;
      const response = await this.getChatCompletion(
        this.previousMessage[0],
        currentMessage
      );

      context.reply(response);
      this.previousMessage.push(response);
    });
  }
}
