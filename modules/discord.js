import { config } from "dotenv";
import { Client, GatewayIntentBits, Events } from "discord.js";
import OpenAIAPI from "./openai.js";
config();

export default class Discord extends OpenAIAPI {
  previousMessage = [];
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

  checkPreviousMessage() {
    if (this.previousMessage.length > 1) this.previousMessage.shift();
  }

  async isMentionedMessage(m) {
    if (!m.mentions.repliedUser) return;

    const messageRef = await m.channel.messages.fetch(m.reference.messageId);

    this.previousMessage.shift();
    this.previousMessage.push(messageRef.content);
  }

  trimMessage(m) {
    return m.content.trimStart().slice(2).trimStart();
  }

  async getGPTCompletion(prompt) {
    return await this.getChatCompletion(this.previousMessage[0], prompt);
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
    this.previousMessage.push(response);

    for (const message of messages) {
      m.reply({
        content: message,
      });
    }
  }

  handleMessage() {
    this.discord.on(Events.MessageCreate, async (m) => {
      if (!m.content.trimStart().startsWith("!q")) return;

      this.checkPreviousMessage();
      await this.isMentionedMessage(m);

      const prompt = this.trimMessage(m);
      const response = await this.getGPTCompletion(prompt);
      const messages = this.checkResponse(response);
      this.sendMessage(m, response, messages);
    });
  }
}
