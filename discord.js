import { config } from "dotenv";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { OpenAI } from "./openai.js";
config();

export class Discord extends OpenAI {
  previousMessage = [];

  constructor() {
    super();
    this.discord = this.init();
    this.discord.login(process.env.DISCORD_TOKEN);
    this.handleMessage();
  }

  init() {
    return new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  handleMessage() {
    this.discord.on(Events.MessageCreate, async (m) => {
      if (!m.content.startsWith("!q")) return;
      if (this.previousMessage.length > 1) this.previousMessage.shift();

      const currentMessage = m.content.trimStart().slice(2).trimStart();
      const response = await this.getChatCompletion(
        this.previousMessage[0],
        currentMessage
      );

      m.reply({
        content: response,
      });
      this.previousMessage.push(response);
    });
  }
}
