import { config } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
config();

export default class AnthropicAPI {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async getChatCompletion(previousMessage, currentMessage) {
    try {
      const completion = await this.anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: [
          { role: "user", content: currentMessage },
          { role: "assistant", content: previousMessage },
        ],
      });

      return completion.content[0].text;
    } catch {
      throw Error("There seems to be a problem. Please try again later.");
    }
  }
}
