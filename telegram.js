import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { OpenAI } from "./openai.js";
config();

export class Telegram extends OpenAI {
  previousMessage = [];

  constructor() {
    super();
    this.telegram = new TelegramBot(process.env.TELEGRAM_TOKEN, {
      polling: true,
    });
    this.handleMessage();
  }

  checkPreviousMessage() {
    if (this.previousMessage.length > 1) this.previousMessage.shift();
  }

  trimMessage(text) {
    return text.startsWith("/") ? text.slice(1).trimStart() : text;
  }

  handleMentionedMessage(m) {
    if (m.reply_to_message) {
      this.previousMessage.shift();
      this.previousMessage.push(m.reply_to_message.text);
    }
  }

  async getGPTCompletion(text) {
    return await this.getChatCompletion(
      this.previousMessage[0],
      this.trimMessage(text),
      "gpt-3.5-turbo-1106"
    );
  }

  async sendMessage(m) {
    const response = await this.getGPTCompletion(m.text);
    this.previousMessage.push(response);
    this.telegram.sendMessage(m.chat.id, response);
  }

  handleMessage() {
    this.telegram.on("message", (m) => {
      if (!m.text) return;

      this.checkPreviousMessage();
      this.handleMentionedMessage(m);
      this.sendMessage(m);
    });
  }
}
