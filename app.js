import { config } from "dotenv";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { Configuration, OpenAIApi } from "openai";

config();

const telegram = new Telegraf(process.env.TELEGRAM_TOKEN);
telegram.launch();

const openai = new OpenAIApi(
  new Configuration({
    organization: process.env.OPENAI_ORGANISATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
  })
);

let previousMessage = [];

telegram.on(message("text"), async (context) => {
  if (previousMessage.length > 6) previousMessage.slice(-6);

  const content = context.update.message.text.slice(1);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Previous Conversation for Context: ${previousMessage.join(
          "\n"
        )}\nCurrent Prompt: ${content}`,
      },
    ],
  });
  const response = completion.data.choices[0].message.content;

  context.reply(response);

  previousMessage.push(`User: ${content}`);
  previousMessage.push(`Me: ${response}`);
});
