# Quick Setup Guide

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

### 3. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env file and add your keys
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key-here
TAVILY_API_KEY=your-tavily-key-here

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
# Run test
npm run test

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



