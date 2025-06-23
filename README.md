# Travel Chatbot with Persistent Memory

Trợ lý du lịch AI thông minh với khả năng nhớ ngữ cảnh hội thoại, sử dụng LangChain/LangGraph và Upstash Redis.

## Tính năng

- **AI Travel Assistant**: Trả lời câu hỏi về du lịch bằng tiếng Việt
- **Persistent Memory**: Nhớ ngữ cảnh hội thoại qua các phiên làm việc
- **Real-time Search**: Tìm kiếm thông tin thời gian thực với Tavily

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd TravellingChatbot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` và điền thông tin:

```env
# Gemini API Key (FREE!)
GEMINI_API_KEY=your_gemini_api_key_here

# Tavily Search API Key
TAVILY_API_KEY=your_tavily_api_key_here

# Upstash Redis (for memory)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```
### Test Chatbot
```bash
npm run test
# hoặc
node test-chatbot.js
```
Tính năng test:
-  **Chat qua lại** với bot
-  **Test memory**: Bot nhớ ngữ cảnh
-  **Xem lịch sử**: `history`
-  **Thống kê**: `summary`
-  **Xóa lịch sử**: `clear`
-  **Thoát**: `exit`



## Architecture

```
User Input
    ↓
Web Interface / CLI
    ↓
Travel Chatbot API
    ↓
LangGraph Workflow
    ↓
┌─────────────────┬─────────────────┐
│   Gemini LLM    │  Tavily Search  │
└─────────────────┴─────────────────┘
    ↓
Upstash Redis (Memory)
    ↓
Formatted Response
```

##  Project Structure

```
TravellingChatbot/
├── src/
│   ├── agents/          # AI agents (Gemini)
│   ├── config/          # Configuration
│   ├── graph/           # LangGraph workflow
│   ├── memory/          # Redis memory manager
│   ├── prompts/         # AI prompts
│   ├── tools/           # Search tools
│   └── types/           # Type definitions
├── public/              # Web interface
├── test-chatbot.js      # Interactive test
├── server.js            # Web server
└── index.js             # CLI interface
```

## API Endpoints

### Chat
```
POST /api/chat
{
  "message": "Hà Nội có gì hay?",
  "sessionId": "optional_session_id"
}
```

### History
```
GET /api/history/{sessionId}
DELETE /api/history/{sessionId}
```

### Summary
```
GET /api/summary/{sessionId}
```

### Health
```
GET /api/health
```

## Configuration

### Memory Settings
- `SESSION_TTL`: Session timeout (default: 1 hour)
- `MAX_MESSAGES_PER_SESSION`: Max messages per session (default: 20)
- `CONTEXT_WINDOW_SIZE`: Messages sent to LLM (default: 10)

### LLM Settings
- `TEMPERATURE`: Response creativity (default: 0.7)
- `GEMINI_MODEL`: Gemini model (default: gemini-1.5-flash)

## Documentation

- [Redis Memory Implementation](./REDIS_MEMORY.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- **LangChain/LangGraph** - AI workflow framework
- **Google Gemini** - Free LLM API
- **Tavily** - Real-time search API
- **Upstash Redis** - Serverless Redis
