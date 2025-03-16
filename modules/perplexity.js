import { config } from "dotenv";
config();

export default class PerplexityAPI {
  async getChatCompletion(currentPrompt) {
    try {
      const requestBody = {
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "Be precise and concise.",
          },
          {
            role: "user",
            content: currentPrompt,
          },
        ],
        max_tokens: 8000,
        temperature: 0.2,
        top_p: 0.9,
        search_domain_filter: null,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "week",
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1,
        response_format: null,
      };

      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      };

      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        options
      );
      const data = await response.json();

      return data.choices[0].message.content;
    } catch (error) {
      console.log(error.message);
      throw Error("Something went wrong. Please try again later.");
    }
  }
}
