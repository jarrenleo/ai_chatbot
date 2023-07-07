import { config } from "dotenv";
import { Configuration, OpenAIApi } from "openai";
config();

export class OpenAI {
  constructor() {
    this.openai = this.initOpenAI();
  }

  initOpenAI() {
    return new OpenAIApi(
      new Configuration({
        organization: process.env.OPENAI_ORGANISATION_ID,
        apiKey: process.env.OPENAI_API_KEY,
      })
    );
  }

  async getChatCompletion(previousContent = "", currentContent, model) {
    try {
      const completion = await this.openai.createChatCompletion({
        model: model,
        messages: [
          {
            role: "assistant",
            content: previousContent,
          },
          {
            role: "user",
            content: currentContent,
          },
        ],
      });

      return completion.data.choices[0].message.content;
    } catch {
      return "There seems to be a problem. Please try again later.";
    }
  }
}
