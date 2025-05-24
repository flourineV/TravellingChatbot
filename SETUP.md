# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- **Gemini API account** (FREE!) OR OpenAI API account
- Tavily Search API account

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get API Keys

#### 🆓 Gemini API Key (Recommended - FREE!)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key
6. **Free tier**: 15 requests/minute, 1M requests/day!

#### 💰 OpenAI API Key (Alternative - Paid)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/login
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

#### Tavily Search API Key
1. Go to [Tavily](https://tavily.com/)
2. Sign up for an account
3. Get your API key from dashboard
4. Copy the key

### 3. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env file and add your keys
# For Gemini (FREE - Recommended):
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key-here
TAVILY_API_KEY=your-tavily-key-here

# OR for OpenAI (Paid):
# LLM_PROVIDER=openai
# OPENAI_API_KEY=sk-your-openai-key-here
# TAVILY_API_KEY=your-tavily-key-here
```

### 4. Test the Setup
```bash
npm test
```

### 5. Start the Chatbot
```bash
npm start
```

## Quick Test Commands

```bash
# Run demo test
npm run demo

# Start interactive chatbot
npm start

# Development mode with auto-reload
npm run dev
```

## Example Usage

Once started, you can ask questions like:
- "Best restaurants in Tokyo"
- "Hotels near Times Square New York"
- "Things to do in Paris"
- "Weather in London today"
- "How to get from airport to downtown Bangkok"

## Troubleshooting

### Common Issues

**"Configuration errors: OPENAI_API_KEY is required"**
- Make sure you created `.env` file
- Check that your OpenAI API key is correct
- Ensure no extra spaces in the key

**"Search failed: Invalid API key"**
- Verify your Tavily API key is correct
- Make sure you have credits in your Tavily account

**"Module not found" errors**
- Run `npm install` to install dependencies
- Check that you're using Node.js 18+

### Getting Help

1. Check console output for detailed error messages
2. Verify your API keys are valid
3. Make sure you have internet connection for API calls
4. Try the demo test first: `npm test`

## Features

✅ Real-time travel information search
✅ Multi-category support (food, hotels, attractions, weather, transport)
✅ Conversation history
✅ Interactive CLI interface
✅ Error handling and recovery
✅ Configurable settings

## Next Steps

After setup, check out:
- `README.md` for detailed documentation
- Example questions in the CLI help
- Configuration options in `.env`

Happy traveling! 🧳✈️
