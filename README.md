# AI Chatbot - Multi-Model Discord Bot

Discord bot that provides access to multiple state-of-the-art AI models through a unified interface powered by OpenRouter.

## 🤖 Supported Models

- **GPT-5** (`!o`) - OpenAI's most advanced language model
- **Claude Sonnet 4.5** (`!c`) - Anthropic's flagship model
- **Sonar Reasoning Pro** (`!p`) - Perplexity's reasoning-focused model

## 💬 Usage

### Basic Commands

- `!o <your question>` - Ask GPT-5
- `!c <your question>` - Ask Claude Sonnet 4.5
- `!p <your question>` - Ask Perplexity Sonar Reasoning Pro

### Examples

```
!o What is quantum computing?
!c Write me a poem about coding
!p Explain the latest developments in AI
```

### Maintaining Conversation Context

Reply to the bot's previous message to continue the conversation with history:

1. Send initial message: `!o What is TypeScript?`
2. Bot responds with an answer
3. Reply to that message: `!o Can you give me an example?`
4. Bot will remember the context from step 2

### Using Text File Attachments

Attach a `.txt` file along with your command to include additional context:

```
!c Summarize this document
[attach: document.txt]
```

### Character Limit Handling

The bot automatically splits responses longer than 2000 characters into multiple messages, intelligently breaking at word boundaries to maintain readability.
