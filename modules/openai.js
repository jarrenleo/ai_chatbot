import { config } from "dotenv";
import OpenAI from "openai";
config();

export default class OpenAISDK {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getChatCompletion(previousPrompt, previousResponse, currentPrompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4.1",
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
      throw Error(error.message);
    }
  }

  async getImageGeneration(prompt) {
    try {
      const image = await this.openai.images.generate({
        model: "gpt-image-1",
        prompt: prompt,
      });

      return Buffer.from(image.data[0].b64_json, "base64");
    } catch (error) {
      throw Error(error.message);
    }
  }
}
