import { config } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
config();

export default class AnthropicAPI {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async getChatCompletion(previousPrompt, previousResponse, currentPrompt) {
    try {
      let messages = [
        { role: "user", content: previousPrompt },
        { role: "assistant", content: previousResponse },
        { role: "user", content: currentPrompt },
      ];

      if (!previousPrompt && !previousResponse)
        messages = [{ role: "user", content: currentPrompt }];

      const completion = await this.anthropic.messages.create({
        model: "claude-opus-4-20250514",
        max_tokens: 8192,
        messages,
        stream: false,
      });

      return completion.content[0].text;
    } catch (error) {
      throw Error(error.message);
    }
  }
}
