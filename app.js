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
  if (previousMessage.length > 10) previousMessage = previousMessage.slice(-10);

  const text = context.update.message.text;
  const name = context.update.message.from.username;
  const previousConversation = previousMessage.length
    ? `Context on Previous Conversation:\n${previousMessage.join("\n")}\n\n`
    : "";
  const content = `${previousConversation}Prompt: ${text}`;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: content,
        name: name,
      },
    ],
  });
  const response = completion.data.choices[0].message.content;

  context.reply(response);

  previousMessage.push(`User: ${text}`);
  previousMessage.push(`GPT: ${response}`);
});
