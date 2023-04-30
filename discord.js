import { config } from "dotenv";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { OpenAI } from "./openai.js";
config();

export class Discord extends OpenAI {
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

  checkCommand(m) {
    return m.content.startsWith("!q");
  }

  checkMessage() {
    if (this.previousMessage.length > 1) this.previousMessage.shift();
  }

  trimMessage(m) {
    return m.content.trimStart().slice(2).trimStart();
  }

  splitMessage(response) {
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

  async getGPTCompletion(m) {
    return await this.getChatCompletion(
      this.previousMessage[0],
      this.trimMessage(m)
    );
  }

  async sendAndUpdateMessage(m) {
    const response = await this.getGPTCompletion(m);
    this.previousMessage.push(response);

    if (response.length <= this.characterLimit) {
      m.reply({
        content: response,
      });
      return;
    }

    const messages = this.splitMessage(response);
    for (const message of messages) {
      m.reply({
        content: message,
      });
    }
  }

  async checkAndhandleRepliedMessage(m) {
    if (m.mentions.repliedUser) {
      const messageRef = await m.channel.messages.fetch(m.reference.messageId);

      this.previousMessage.shift();
      this.previousMessage.push(messageRef.content);
    }
  }

  handleMessage() {
    this.discord.on(Events.MessageCreate, async (m) => {
      if (!this.checkCommand(m)) return;

      this.checkMessage();
      await this.checkAndhandleRepliedMessage(m);
      this.sendAndUpdateMessage(m);
    });
  }
}
