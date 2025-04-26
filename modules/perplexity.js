import { config } from "dotenv";
config();

export default class PerplexityAPI {
  async getChatCompletion(previousPrompt, previousResponse, currentPrompt) {
    try {
      let messages = [
        { role: "user", content: previousPrompt },
        { role: "assistant", content: previousResponse },
        { role: "user", content: currentPrompt },
      ];

      if (!previousPrompt && !previousResponse)
        messages = [{ role: "user", content: currentPrompt }];

      const requestBody = {
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "Be precise and concise.",
          },
          ...messages,
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
      throw Error(error.message);
    }
  }
}
