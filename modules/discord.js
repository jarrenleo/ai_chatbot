import { config } from "dotenv";
import { Client, GatewayIntentBits, Events } from "discord.js";
import OpenAISDK from "./openai.js";
config();

export default class Discord {
  previousPrompt = "";
  previousResponse = "";
  characterLimit = 2000;

  constructor() {
    this.openai = new OpenAISDK();
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

    this.previousPrompt = "";
    this.previousResponse = messageRef.content;
  }

  async getPrompt(m) {
    try {
      const trimmedMessage = m.content.trimStart().slice(2).trimStart();

      const attachment = m.attachments.first();
      if (!attachment) return trimmedMessage;
      if (!attachment.contentType.includes("text/plain;"))
        throw new Error("Attachment is not supported");

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

  async sendMessage(m, messages) {
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
        const command = m.content.trimStart();
        if (!command.startsWith("!")) return;

        await this.isMentionedMessage(m);

        const currentPrompt = await this.getPrompt(m);

        let model;
        if (command.startsWith("!o")) model = "openai/gpt-5";
        if (command.startsWith("!c")) model = "anthropic/claude-sonnet-4.5";
        if (command.startsWith("!p")) model = "perplexity/sonar-reasoning-pro";

        if (!model) return;

        const response = await this.openai.getResponse(
          model,
          this.previousPrompt,
          this.previousResponse,
          currentPrompt
        );

        if (!response) return;

        const messages = this.checkResponse(response);
        this.sendMessage(m, messages);

        this.previousPrompt = currentPrompt;
        this.previousResponse = response;
      } catch (error) {
        this.sendError(m, error.message);
      }
    });
  }
}
