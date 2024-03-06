import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import OpenAIAPI from "./openai.js";
// import AnthropicAPI from "./anthropic.js";
config();

export default class Telegram extends OpenAIAPI {
  previousPrompt = "";
  previousResponse = "";

  constructor() {
    super();
    this.telegram = this.initTelegram();
    this.handleMessage();
  }

  initTelegram() {
    return new TelegramBot(process.env.TELEGRAM_TOKEN, {
      polling: true,
    });
  }

  trimMessage(text) {
    return text.startsWith("/") ? text.slice(1).trimStart() : text;
  }

  handleMentionedMessage(m) {
    if (m.reply_to_message) this.previousMessage = m.reply_to_message.text;
  }

  async sendMessage(m, response) {
    try {
      this.telegram.sendMessage(m.chat.id, response);
    } catch (error) {
      throw Error(error.message);
    }
  }

  async sendError(m, message) {
    this.telegram.sendMessage(m.chat.id, message);
  }

  handleMessage() {
    this.telegram.on("message", async (m) => {
      try {
        if (!m.text) return;

        this.handleMentionedMessage(m);
        const currentPrompt = this.trimMessage(m.text);
        const response = await this.getChatCompletion(
          this.previousPrompt,
          this.previousResponse,
          currentPrompt
        );
        this.sendMessage(m, response);

        this.previousPrompt = currentPrompt;
        this.previousResponse = response;
      } catch (error) {
        this.sendError(m, error.message);
      }
    });
  }
}
