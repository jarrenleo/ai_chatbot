import { config } from "dotenv";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import OpenAISDK from "./openai.js";
config();

export default class Telegram extends OpenAISDK {
  previousPrompt = "";
  previousResponse = "";

  constructor() {
    super();
    this.telegram = new Telegraf(process.env.TELEGRAM_TOKEN);
    this.handleMessage();
    this.telegram.launch();
  }

  trimMessage(text) {
    return text.slice(1).trim();
  }

  handleMentionedMessage(m) {
    if (!m.reply_to_message) return;

    this.previousPrompt = "-";
    this.previousResponse = m.reply_to_message.text;
  }

  async sendMessage(ctx, response) {
    try {
      ctx.reply(response, {
        reply_to_message_id: ctx.message.id,
      });
    } catch (error) {
      throw Error(error.message);
    }
  }

  async sendError(ctx, message) {
    ctx.reply(message, {
      reply_to_message_id: ctx.message.id,
    });
  }

  handleMessage() {
    this.telegram.on(message("text"), async (ctx) => {
      try {
        const m = ctx.message;
        this.handleMentionedMessage(m);
        const currentPrompt = this.trimMessage(m.text);
        const response = await this.getChatCompletion(
          this.previousPrompt,
          this.previousResponse,
          currentPrompt
        );
        this.sendMessage(ctx, response);

        this.previousPrompt = currentPrompt;
        this.previousResponse = response;
      } catch (error) {
        this.sendError(ctx, error.message);
      }
    });
  }
}
