import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
// import OpenAIAPI from "./openai.js";
import AnthropicAPI from "./anthropic.js";
config();

export default class Telegram extends AnthropicAPI {
  previousMessage = "";

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

  async getGPTCompletion(text) {
    return await this.getChatCompletion(
      this.previousMessage,
      this.trimMessage(text)
    );
  }

  async sendMessage(m) {
    const response = await this.getGPTCompletion(m.text);

    this.previousMessage = response;
    this.telegram.sendMessage(m.chat.id, response);
  }

  async sendError(m, message) {
    this.telegram.sendMessage(m.chat.id, message);
  }

  handleMessage() {
    this.telegram.on("message", (m) => {
      try {
        if (!m.text) return;

        this.handleMentionedMessage(m);
        this.sendMessage(m);
      } catch (error) {
        this.sendError(m, error.message);
      }
    });
  }
}
