# Conversation System Setup Guide

## Overview
Hệ thống lưu trữ conversations như GPT với PostgreSQL + Redis cache.

## Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   PostgreSQL    │
│                 │    │                 │    │   + Redis       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Database Setup

### 1. Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_trip_system;

# Create user (optional)
CREATE USER ai_trip_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_trip_system TO ai_trip_user;

# Exit
\q
```

### 3. Run Schema
```bash
# Navigate to project directory
cd ai_trip_system

# Run the schema file
psql -U postgres -d ai_trip_system -f database/conversations.sql
```

## Redis Setup

### 1. Install Redis
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server

# Windows
# Download from https://github.com/microsoftarchive/redis/releases
```

### 2. Test Redis
```bash
redis-cli ping
# Should return: PONG
```

## Environment Configuration

### Update .env.local
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_trip_system
REDIS_URL=redis://localhost:6379

# For production with connection pooling
# DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

## Install Dependencies

```bash
cd ai_trip_system
npm install pg redis @types/pg
```

## API Endpoints

### Conversations
- `GET /api/conversations?userId=xxx` - Get user conversations
- `POST /api/conversations` - Create new conversation
- `DELETE /api/conversations?id=xxx&userId=xxx` - Archive conversation

### Messages
- `GET /api/conversations/[id]/messages?userId=xxx` - Get conversation messages
- `POST /api/conversations/[id]/messages` - Add message to conversation

### Enhanced Chatbot
- `POST /api/chatbot` - Chat with auto-save to database

## UI Components

### ConversationSidebar
- **Location**: `src/components/ConversationSidebar.tsx`
- **Features**:
  - List conversations grouped by date (Today, Yesterday, etc.)
  - New conversation button
  - Rename conversations (click pencil icon)
  - Delete conversations (click trash icon)
  - Collapsible sidebar
  - Real-time conversation switching

### HomeChatbot (Enhanced)
- **Location**: `src/components/HomeChatbot.tsx`
- **Features**:
  - Load existing conversation messages
  - Auto-create conversation on first message
  - Auto-save messages to database
  - Conversation context awareness

### useConversations Hook
- **Location**: `src/hooks/useConversations.ts`
- **Features**:
  - Centralized conversation state management
  - CRUD operations for conversations
  - Message loading and saving
  - Error handling and loading states

## Frontend Integration

### New Conversation Flow
```typescript
// 1. Create new conversation
const response = await fetch('/api/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    firstMessage: 'Hello'
  })
});

const { id: conversationId } = await response.json();

// 2. Chat with auto-save
const chatResponse = await fetch('/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Tôi muốn đi Đà Lạt',
    conversationId,
    userId: 'user123',
    history: []
  })
});
```

### Load Existing Conversation
```typescript
// 1. Get conversations list
const conversations = await fetch('/api/conversations?userId=user123');

// 2. Load specific conversation messages
const messages = await fetch('/api/conversations/conv-id/messages?userId=user123');
```

## Features

### ✅ Implemented
- PostgreSQL schema with conversations & messages tables
- Redis caching for performance
- Auto-generated conversation titles
- Conversation archiving (soft delete)
- Message persistence with metadata
- Cache invalidation on updates

### ✅ Completed Features
- ✅ Create conversation sidebar component (ConversationSidebar)
- ✅ Update HomeChatbot to use persistent conversations
- ✅ Add conversation management UI (create, delete, rename)
- ✅ Implement conversation loading and switching
- ✅ Auto-save conversations to database
- ✅ GPT-like conversation grouping by date
- ✅ Conversation title auto-generation
- ✅ useConversations hook for state management

### 🔄 Next Steps
- Implement conversation search
- Add conversation export/import
- Add conversation sharing
- Implement conversation templates

## Database Schema

### Conversations Table
```sql
- id (UUID, Primary Key)
- user_id (VARCHAR, Foreign Key)
- title (VARCHAR, Auto-generated from first message)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP, Auto-updated)
- is_archived (BOOLEAN, Soft delete)
- metadata (JSONB, Extensible data)
```

### Messages Table
```sql
- id (UUID, Primary Key)
- conversation_id (UUID, Foreign Key)
- content (TEXT, Message content)
- role (VARCHAR, 'user' or 'assistant')
- created_at (TIMESTAMP)
- metadata (JSONB, AI response metadata)
- token_count (INTEGER, For usage tracking)
```

## Performance Optimizations

### Caching Strategy
- **Conversations list**: 5 minutes cache
- **Messages**: 10 minutes cache
- **Auto-invalidation**: On new messages/conversations

### Database Indexes
- `conversations(user_id, updated_at DESC)` - Fast user conversation listing
- `messages(conversation_id, created_at)` - Fast message retrieval
- `conversations(user_id)` - User ownership verification

## Testing

### Test Database Operations
```bash
# Test conversation creation
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","title":"Test Conversation"}'

# Test message retrieval
curl "http://localhost:3000/api/conversations/CONV_ID/messages?userId=test123"
```

### Test Redis Cache
```bash
redis-cli
> KEYS conversations:*
> GET "conversations:test123:20:0"
```

## Troubleshooting

### Common Issues
1. **Database connection failed**: Check DATABASE_URL and PostgreSQL service
2. **Redis connection failed**: Check REDIS_URL and Redis service
3. **Permission denied**: Ensure database user has proper permissions
4. **Cache not working**: Verify Redis connection and key patterns

### Logs to Check
- Next.js console for API errors
- PostgreSQL logs for database issues
- Redis logs for cache problems
