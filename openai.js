import { config } from "dotenv";
import { Configuration, OpenAIApi } from "openai";
config();

export class OpenAI {
  constructor() {
    this.openai = this.initOpenAIApi();
  }

  initOpenAIApi() {
    return new OpenAIApi(
      new Configuration({
        organization: process.env.OPENAI_ORGANISATION_ID,
        apiKey: process.env.OPENAI_API_KEY,
      })
    );
  }

  async getChatCompletion(previousContent = "", currentContent) {
    try {
      const completion = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
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
