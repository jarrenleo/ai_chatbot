import { config } from "dotenv";
import OpenAI from "openai";
config();

export default class OpenAISDK {
  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }

  async getChatCompletion(previousPrompt, previousResponse, currentPrompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "deepseek-chat",
        max_completion_tokens: 8000,
        temperature: 1.3,
        messages: [
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
      return completion.choices[0].message.content;
    } catch (error) {
      console.log(error.message);
      throw Error("Something went wrong. Please try again later.");
    }
  }
}
