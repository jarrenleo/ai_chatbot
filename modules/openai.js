import { config } from "dotenv";
import OpenAI from "openai";
config();

export default class OpenAISDK {
  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://api.perplexity.ai",
      apiKey: process.env.PERPLEXITY_API_KEY,
    });
  }

  async getChatCompletion(previousPrompt, previousResponse, currentPrompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "Be precise and concise.",
          },
          {
            role: "user",
            content: previousPrompt,
          },
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
      console.log(completion);
      return completion.choices[0].message.content;
    } catch (error) {
      console.log(error.message);
      throw Error("Something went wrong. Please try again later.");
    }
  }
}
