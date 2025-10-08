import { config } from "dotenv";
import OpenAI from "openai";
config();

export default class OpenAISDK {
  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async getResponse(model, previousPrompt, previousResponse, currentPrompt) {
    try {
      const messages = [];

      if (previousPrompt)
        messages.push({
          role: "user",
          content: previousPrompt,
        });
      if (previousResponse)
        messages.push({
          role: "assistant",
          content: previousResponse,
        });

      messages.push({
        role: "user",
        content: currentPrompt,
      });

      const response = await this.openai.chat.completions.create({
        model,
        messages,
      });

      return response.choices[0].message.content;
    } catch (error) {
      throw Error(error.message);
    }
  }
}
