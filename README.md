# 🌟 Travel Chatbot with Persistent Memory

Trợ lý du lịch AI thông minh với khả năng nhớ ngữ cảnh hội thoại, sử dụng LangChain/LangGraph và Upstash Redis.

## ✨ Tính năng

- 🤖 **AI Travel Assistant**: Trả lời câu hỏi về du lịch bằng tiếng Việt
- 🧠 **Persistent Memory**: Nhớ ngữ cảnh hội thoại qua các phiên làm việc
- 🔍 **Real-time Search**: Tìm kiếm thông tin thời gian thực với Tavily
- 🌐 **Web Interface**: Giao diện web đẹp và dễ sử dụng
- 📱 **Session Management**: Quản lý nhiều cuộc hội thoại độc lập
- ☁️ **Serverless Ready**: Deploy dễ dàng lên Render với Upstash Redis

## 🚀 Quick Start

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

### 4. Get API Keys

**Gemini API (FREE):**
1. Vào [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Tạo API key miễn phí
3. Copy vào `GEMINI_API_KEY`

**Tavily Search:**
1. Vào [Tavily.com](https://tavily.com)
2. Đăng ký và lấy API key
3. Copy vào `TAVILY_API_KEY`

**Upstash Redis:**
1. Vào [console.upstash.com](https://console.upstash.com)
2. Create Database → Global
3. Copy REST URL và Token

### 5. Test Chatbot
```bash
npm run test
# hoặc
node test-chatbot.js
```

### 6. Start Web Server
```bash
npm start
# hoặc
npm run server
```

Mở http://localhost:3001 để sử dụng!

## 🧪 Testing

### Interactive Chat Test
```bash
npm run test
```

Tính năng test:
- 💬 **Chat qua lại** với bot
- 🧠 **Test memory**: Bot nhớ ngữ cảnh
- 📚 **Xem lịch sử**: `history`
- 📊 **Thống kê**: `summary`
- 🗑️ **Xóa lịch sử**: `clear`
- 🚪 **Thoát**: `exit`

### Example Conversation
```
💬 Bạn: Tôi muốn đi du lịch Đà Nẵng
🤖 Bot: Đà Nẵng là một thành phố tuyệt vời...

💬 Bạn: Có gì hay ở đó không?
🤖 Bot: Ở Đà Nẵng có nhiều điểm tham quan... (nhớ ngữ cảnh!)

💬 Bạn: Còn ăn gì ngon?
🤖 Bot: Đà Nẵng nổi tiếng với... (vẫn nhớ về Đà Nẵng!)
```

## 🏗️ Architecture

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

## 📁 Project Structure

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

## 🌐 API Endpoints

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

## 🚀 Deployment

### Deploy to Render

1. **Connect Repository** to Render
2. **Set Environment Variables**:
   ```
   GEMINI_API_KEY=your_key
   TAVILY_API_KEY=your_key
   UPSTASH_REDIS_REST_URL=your_url
   UPSTASH_REDIS_REST_TOKEN=your_token
   ```
3. **Deploy** - Render sẽ tự động build và deploy

### Environment Variables for Production
```env
# Required
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Optional
SESSION_TTL=3600
MAX_MESSAGES_PER_SESSION=20
CONTEXT_WINDOW_SIZE=10
LANGCHAIN_TRACING_V2=false
```

## 🔧 Configuration

### Memory Settings
- `SESSION_TTL`: Session timeout (default: 1 hour)
- `MAX_MESSAGES_PER_SESSION`: Max messages per session (default: 20)
- `CONTEXT_WINDOW_SIZE`: Messages sent to LLM (default: 10)

### LLM Settings
- `TEMPERATURE`: Response creativity (default: 0.7)
- `GEMINI_MODEL`: Gemini model (default: gemini-1.5-flash)

## 🐛 Troubleshooting

### Common Issues

**"Upstash Redis credentials not found"**
- Kiểm tra `UPSTASH_REDIS_REST_URL` và `UPSTASH_REDIS_REST_TOKEN`

**"Failed to connect to Upstash Redis"**
- Kiểm tra internet connection
- Verify Upstash credentials

**"Gemini API error"**
- Kiểm tra `GEMINI_API_KEY`
- Verify API key chưa expire

**"Tavily search failed"**
- Kiểm tra `TAVILY_API_KEY`
- Check API quota

### Debug Mode
Set environment variable:
```env
NODE_ENV=development
```

## 📚 Documentation

- [Redis Memory Implementation](./REDIS_MEMORY.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **LangChain/LangGraph** - AI workflow framework
- **Google Gemini** - Free LLM API
- **Tavily** - Real-time search API
- **Upstash Redis** - Serverless Redis
- **Render** - Easy deployment platform

---

**Happy Traveling! 🌍✈️**
