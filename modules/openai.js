import { config } from "dotenv";
import OpenAI from "openai";
config();

export default class OpenAIAPI {
  constructor() {
    this.openai = new OpenAI();
  }

  async getChatCompletion(_, previousResponse, currentPrompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "assistant",
            content: previousResponse,
          },
          {
            role: "user",
            content: currentPrompt,
          },
        ],
      });

      return completion.choices[0].message.content;
    } catch {
      throw Error("There seems to be a problem. Please try again later.");
    }
  }
}
