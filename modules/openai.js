import { config } from "dotenv";
import OpenAI from "openai";
config();

export default class OpenAIAPI {
  constructor() {
    this.openai = new OpenAI();
  }

  async getChatCompletion(previousMessage = "", currentMessage, model) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "assistant",
            content: previousMessage,
          },
          {
            role: "user",
            content: currentMessage,
          },
        ],
      });

      return completion.choices[0].message.content;
    } catch {
      return "There seems to be a problem. Please try again later.";
    }
  }
}