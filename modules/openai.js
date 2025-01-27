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
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: previousPrompt }],
          },
          {
            role: "assistant",
            content: [{ type: "text", text: previousResponse }],
          },
          {
            role: "user",
            content: [{ type: "text", text: currentPrompt }],
          },
        ],
      });
      return completion.choices[0].message.content;
    } catch {
      throw Error("There seems to be a problem. Please try again later.");
    }
  }
}
