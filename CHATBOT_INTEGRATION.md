# Chatbot Integration Guide

## Tổng quan

Dự án này bao gồm hai services chính:
1. **AI Trip System** (Next.js) - Main web application
2. **Chatbot** (Node.js + Express) - AI chatbot microservice

## Kiến trúc

```
┌─────────────────────┐    API Proxy    ┌─────────────────────┐
│   AI Trip System    │ ──────────────► │   Chatbot Service   │
│   (Next.js)         │                 │   (Node.js)         │
│   Port: 3000        │                 │   Port: 5000        │
└─────────────────────┘                 └─────────────────────┘
```

## Cài đặt và chạy

### 1. Chatbot Service

```bash
# Di chuyển vào thư mục Chatbot
cd Chatbot

# Cài đặt dependencies
npm install

# Tạo file .env với các API keys
cp .env.example .env

# Chỉnh sửa .env với API keys thực:
# GEMINI_API_KEY=your_gemini_api_key
# TAVILY_API_KEY=your_tavily_api_key

# Chạy chatbot service
npm run dev
```

Chatbot service sẽ chạy trên http://localhost:3001

### 2. AI Trip System

```bash
# Di chuyển vào thư mục ai_trip_system
cd ai_trip_system

# Cài đặt dependencies
npm install

# Đảm bảo file .env.local đã có cấu hình chatbot
# CHATBOT_SERVICE_URL=http://localhost:3001

# Chạy main application
npm run dev
```

Main application sẽ chạy trên http://localhost:3000

## Tính năng Chatbot

### 1. Truy cập Chatbot
- **Trong Home Page**: Chatbot interface hiển thị trực tiếp ở giữa trang home
- **Direct URL**: `/chatbot` (fullscreen mode - optional)
- **Auto-available**: Khi login vào sẽ thấy chatbot ngay trong home

### 2. Tính năng
- ✅ Chat real-time với AI travel assistant
- ✅ **Conversation history tracking** (nhớ 2-3 câu hỏi trước)
- ✅ Tìm kiếm thông tin du lịch
- ✅ Lên kế hoạch chuyến đi
- ✅ Gợi ý địa điểm
- ✅ Health check và status monitoring
- ✅ Responsive design

### 3. API Endpoints

#### Chatbot Service (Port 3001)
- `POST /api/chat` - Gửi tin nhắn đến chatbot
- `GET /api/health` - Kiểm tra trạng thái service

#### AI Trip System (Port 3000)
- `POST /api/chatbot` - Proxy đến chatbot service
- `GET /api/chatbot` - Health check proxy

## Cấu hình

### Environment Variables

#### Chatbot Service (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
PORT=3001
```

#### AI Trip System (.env.local)
```env
CHATBOT_SERVICE_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Troubleshooting

### 1. Chatbot không kết nối được
- Đảm bảo Chatbot service đang chạy trên port 3001
- Kiểm tra API keys trong file .env của Chatbot
- Xem logs trong terminal của Chatbot service

### 2. CORS Issues
- Sử dụng API proxy thay vì gọi trực tiếp
- Đảm bảo CHATBOT_SERVICE_URL đúng trong .env.local

### 3. Health Check Failed
- Restart Chatbot service
- Kiểm tra network connectivity
- Xem ChatbotStatus component trong dashboard

## Development

### Thêm tính năng mới cho Chatbot
1. Chỉnh sửa trong thư mục `Chatbot/src/`
2. Restart Chatbot service
3. Test qua UI hoặc API

### Cập nhật UI
1. Chỉnh sửa `ai_trip_system/src/app/chatbot/page.tsx`
2. Hoặc `ai_trip_system/src/components/ChatbotStatus.tsx`
3. Hot reload tự động

## Production Deployment

### Chatbot Service
- Deploy trên cloud service (Heroku, Railway, etc.)
- Cập nhật CHATBOT_SERVICE_URL trong AI Trip System

### AI Trip System
- Deploy trên Vercel/Netlify
- Cập nhật environment variables

## API Documentation

### POST /api/chatbot
```json
{
  "message": "Tôi muốn đi du lịch Đà Lạt",
  "history": [
    {
      "id": "1",
      "text": "Hello",
      "isUser": true,
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "2",
      "text": "Xin chào! Tôi có thể giúp gì cho bạn?",
      "isUser": false,
      "timestamp": "2024-01-01T00:00:01.000Z"
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "response": "Đà Lạt là một điểm đến tuyệt vời...",
  "metadata": {
    "sources": [...],
    "confidence": 0.95
  }
}
```

### GET /api/chatbot
Response:
```json
{
  "status": "ok",
  "initialized": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing Improved Prompts

### ✅ Test cases nên tạo lịch trình ngay:
1. "lộ trình du lịch ở Đồng Nai cho 2 người 2 đêm với mức giá rẻ"
2. "kế hoạch 3 ngày ở Đà Lạt"
3. "tôi muốn đi Phú Quốc 4 ngày"
4. "tạo lịch trình Sapa 2 ngày 1 đêm tiết kiệm chi phí"
5. "du lịch Hội An 3 ngày 2 đêm cho gia đình"

### ❌ Test cases nên yêu cầu thêm thông tin:
1. "tôi muốn đi du lịch" (thiếu điểm đến)
2. "Đà Nẵng có gì hay?" (không phải yêu cầu lịch trình)
3. "tôi muốn đi Phú Quốc" (thiếu thời gian)

### 🧪 Cách test prompts:
```bash
cd Chatbot
node test-prompts.js
```

### 📊 Kết quả mong đợi:
- **Category**: "itinerary" cho các câu hỏi lịch trình
- **Intent**: "create_itinerary"
- **Response**: Tạo lịch trình chi tiết ngay lập tức
- **No extra questions**: Không hỏi thêm thông tin nếu có đủ điểm đến + thời gian
