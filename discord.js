import { config } from "dotenv";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { OpenAI } from "./openai.js";
config();

export class Discord extends OpenAI {
  previousMessage = [];

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

  checkMessage(m) {
    if (this.previousMessage.length > 1) this.previousMessage.shift();

    return m.content.startsWith("!q");
  }

  trimMessage(m) {
    return m.content.trimStart().slice(2).trimStart();
  }

  async getGPTCompletion(m) {
    return await this.getChatCompletion(
      this.previousMessage[0],
      this.trimMessage(m)
    );
  }

  async sendAndUpdateMessage(m) {
    const response = await this.getGPTCompletion(m);
    m.reply({
      content: response,
    });
    this.previousMessage.push(response);
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
      if (!this.checkMessage(m)) return;

      await this.checkAndhandleRepliedMessage(m);
      this.sendAndUpdateMessage(m);
    });
  }
}
