import { config } from "dotenv";
import { Client, GatewayIntentBits, Events } from "discord.js";
// import OpenAIAPI from "./openai.js";
import AnthropicAPI from "./anthropic.js";
config();

export default class Discord extends AnthropicAPI {
  previousMessage = "";
  characterLimit = 2000;

  constructor() {
    super();
    this.discord = this.initDiscord();
    this.handleMessage();
  }

  initDiscord() {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    client.login(process.env.DISCORD_TOKEN);

    return client;
  }

  async isMentionedMessage(m) {
    if (!m.mentions.repliedUser) return;

    const messageRef = await m.channel.messages.fetch(m.reference.messageId);
    this.previousMessage = messageRef.content;
  }

  async getPrompt(m) {
    try {
      const trimmedMessage = m.content.trimStart().slice(2).trimStart();

      const attachment = m.attachments.first();
      if (!attachment) return trimmedMessage;
      if (attachment.contentType !== "text/plain; charset=utf-8")
        throw new Error("Attachment is not a .txt file");

      const response = await fetch(attachment.url);
      if (!response.ok) throw new Error("Fail to read message from attachment");

      const attachmentMessage = await response.text();

      return `${trimmedMessage}\n${attachmentMessage}`;
    } catch (error) {
      throw Error(error.message);
    }
  }

  checkResponse(response) {
    if (response.length <= this.characterLimit) return [response];

    let messages = [],
      charCount = 0;

    const splitCount = Math.ceil(response.length / (this.characterLimit - 100));

    for (let i = 1; i <= splitCount; ++i) {
      if (i < splitCount) {
        const message = response.slice(
          charCount,
          charCount + this.characterLimit
        );
        const firstSpacingIndex = message.lastIndexOf(" ");

        messages.push(response.slice(charCount, charCount + firstSpacingIndex));
        charCount += firstSpacingIndex;
      } else messages.push(response.slice(charCount));
    }

    return messages;
  }

  async sendMessage(m, response, messages) {
    this.previousMessage = response;

    for (const message of messages) {
      m.reply({
        content: message,
      });
    }
  }

  async sendError(m, message) {
    m.reply({
      content: message,
    });
  }

  handleMessage() {
    this.discord.on(Events.MessageCreate, async (m) => {
      try {
        if (!m.content.trimStart().startsWith("!q")) return;

        await this.isMentionedMessage(m);

        const prompt = await this.getPrompt(m);
        const response = await this.getChatCompletion(
          this.previousMessage,
          prompt
        );
        const messages = this.checkResponse(response);
        this.sendMessage(m, response, messages);
      } catch (error) {
        this.sendError(m, error.message);
      }
    });
  }
}
