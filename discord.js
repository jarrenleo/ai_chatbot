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

  // Initialise the discord bot
  initDiscord() {
    // Set bot intends
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    // Login bot
    client.login(process.env.DISCORD_TOKEN);

    return client;
  }

  // For every message read by the bot, it checks if the text content contains the correct command
  // If it does, the command is extracted for model selection
  getCommand(m) {
    const command = m.content.trimStart().slice(0, 2);
    if (!command.startsWith("!q") && !command.startsWith("!4")) return false;

    return command;
  }

  // Update the previousMessage array to give context on the next prompt
  checkPreviousMessage() {
    if (this.previousMessage.length > 1) this.previousMessage.shift();
  }

  // Update the previousMessage array if the users mentions a discord message
  async isMentionedMessage(m) {
    if (!m.mentions.repliedUser) return;

    const messageRef = await m.channel.messages.fetch(m.reference.messageId);

    this.previousMessage.shift();
    this.previousMessage.push(messageRef.content);
  }

  // Remove space characters and "!q" from the text content
  trimMessage(m) {
    return m.content.trimStart().slice(2).trimStart();
  }

  // Select the appropriate model based on the command
  modelSelection(command) {
    const models = {
      "!q": "gpt-3.5-turbo",
      "!4": "gpt-4",
    };

    return models[command];
  }

  // Interaction with ChatGPT via OpenAI API
  async getGPTCompletion(prompt, model) {
    return await this.getChatCompletion(this.previousMessage[0], prompt, model);
  }

  // Check if ChatGPT response contains more than 2000 characters
  // If it does, split the response
  // Discord has a 2500 character limit
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

  // Update the previousMessage array and send ChatGPT response back to the user
  async sendMessage(m, messages) {
    this.previousMessage.push(response);

    for (const message of messages) {
      m.reply({
        content: message,
      });
    }
  }

  handleMessage() {
    this.discord.on(Events.MessageCreate, async (m) => {
      const command = this.getCommand(m);
      if (!command) return;

      this.checkPreviousMessage();
      await this.isMentionedMessage(m);

      const prompt = this.trimMessage(m);
      const model = this.modelSelection(command);
      const response = await this.getGPTCompletion(prompt, model);
      const messages = this.checkResponse(response);
      this.sendMessage(m, messages);
    });
  }
}
