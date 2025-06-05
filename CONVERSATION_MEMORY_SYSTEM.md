# Conversation Memory System - Hệ thống nhớ đàm thoại

## 🎯 Mục tiêu

Implement **conversation tracing** để chatbot nhớ 3-4 câu hỏi/trả lời trước đó, tạo conversation flow tự nhiên như nói chuyện với người thật.

## 🧠 Memory Architecture

### **Core Components:**

1. **ConversationMemory Class** - In-memory storage engine
2. **Session Management** - Unique session per user/conversation
3. **Context Analysis** - Smart follow-up detection
4. **Auto-cleanup** - Memory management & garbage collection

### **Memory Structure:**
```javascript
Session {
  sessionId: "user_123_timestamp",
  messages: [
    { id, text, isUser, timestamp, metadata },
    ...
  ],
  lastActivity: timestamp,
  sessionStart: timestamp
}
```

## 🔧 Implementation Details

### **1. Memory Storage (`conversation-memory.js`)**
```javascript
class ConversationMemory {
  // Store max 8 messages (4 Q&A pairs) per session
  // Auto-cleanup after 30 minutes of inactivity
  // Smart context extraction and follow-up detection
}
```

**Features:**
- ✅ **Session isolation** - Mỗi user có memory riêng
- ✅ **Auto-cleanup** - Tự động xóa sessions cũ
- ✅ **Context extraction** - Nhận diện location, topic continuity
- ✅ **Follow-up detection** - Phát hiện câu hỏi liên quan

### **2. Enhanced Workflow (`travel-workflow.js`)**
```javascript
async chat(userMessage, externalHistory, sessionId) {
  // Get recent context from memory
  const recentContext = conversationMemory.getRecentContext(sessionId, 6);
  
  // Analyze follow-up patterns
  const followUpAnalysis = conversationMemory.analyzeFollowUp(sessionId, userMessage);
  
  // Process with context
  // Store response with metadata
}
```

### **3. Server Integration (`server.js`)**
```javascript
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  
  // Auto-generate sessionId if not provided
  const clientSessionId = sessionId || generateSessionId();
  
  // Use memory-based conversation
  const result = await chatbotApp.processMessage(message, [], clientSessionId);
})
```

## 🔄 Conversation Flow Examples

### **Example 1: Location Continuity**
```
User: "địa điểm du lịch gần trường UIT"
Bot: "UIT ở TP.HCM, Thủ Đức. Gần đó có Khu Công nghệ cao..."
[Memory: UIT, TP.HCM, Thủ Đức, attractions]

User: "quán ăn ngon gần đó"
Bot: [Context: UIT, Thủ Đức] "Gần UIT ở Thủ Đức có các quán ăn..."
[Memory: food, UIT area]

User: "giá cả thế nào?"
Bot: [Context: food near UIT] "Các quán ăn gần UIT có mức giá..."
```

### **Example 2: Topic Continuation**
```
User: "lịch trình du lịch Đà Lạt 3 ngày"
Bot: "Đây là lịch trình 3 ngày ở Đà Lạt..."
[Memory: Đà Lạt, itinerary, 3 days]

User: "thời tiết ở đó thế nào?"
Bot: [Context: Đà Lạt] "Thời tiết Đà Lạt hiện tại..."
[Memory: weather, Đà Lạt]

User: "còn chỗ ở nào tốt?"
Bot: [Context: Đà Lạt] "Các khách sạn tốt ở Đà Lạt..."
```

### **Example 3: Company Location Flow**
```
User: "nhà hàng gần FPT Software"
Bot: "Có nhiều FPT, bạn muốn hỏi về FPT ở đâu?"
[Memory: FPT, restaurants, clarification needed]

User: "FPT ở TP.HCM"
Bot: [Context: FPT] "FPT TP.HCM ở Quận 7. Gần đó có..."
[Memory: FPT HCMC, District 7, restaurants]

User: "khách sạn gần đó"
Bot: [Context: FPT HCMC, District 7] "Khách sạn gần FPT Q7..."
```

## 🎛️ Configuration Options

### **Memory Settings:**
```javascript
new ConversationMemory({
  maxMessages: 8,              // 4 Q&A pairs
  sessionTimeout: 30 * 60 * 1000,  // 30 minutes
  cleanupInterval: 5 * 60 * 1000   // 5 minutes cleanup
})
```

### **Follow-up Detection:**
```javascript
followUpIndicators = [
  'gần đó', 'ở đó', 'khu vực đó',    // Location references
  'thế nào', 'như thế nào',          // How questions
  'còn gì', 'gì khác',               // What else
  'giá cả', 'chi phí',               // Cost follow-ups
  'cách đi', 'di chuyển'             // Transportation
]
```

## 📊 Memory Management

### **Auto-cleanup Strategy:**
- **Session timeout:** 30 minutes of inactivity
- **Message limit:** Max 8 messages per session
- **Cleanup interval:** Every 5 minutes
- **Memory monitoring:** Track total sessions/messages

### **Context Extraction:**
- **Locations:** Extract mentioned places
- **Categories:** Track conversation topics
- **Follow-ups:** Detect reference patterns
- **Metadata:** Store search results, categories

## 🚀 Testing & Validation

### **Test Command:**
```bash
cd Chatbot
node test-conversation-memory.js
```

### **Test Scenarios:**
1. **Location Follow-up Flow** - UIT → food → prices → directions
2. **Topic Continuation Flow** - Da Lat itinerary → weather → accommodation
3. **Company Location Flow** - FPT → clarification → hotels
4. **Mixed Context Flow** - Bitexco → UIT route → timing

### **Success Metrics:**
- **Context Usage:** >80% follow-up questions use previous context
- **Follow-up Detection:** >85% accuracy in detecting references
- **Memory Efficiency:** <100MB for 50 active sessions
- **Response Quality:** Natural conversation flow

## 💡 Benefits

### **For Users:**
- ✅ **Natural conversations** - "gần đó", "ở đó", "thế nào?"
- ✅ **No repetition** - Không cần giải thích lại địa điểm
- ✅ **Context awareness** - Bot hiểu câu hỏi liên quan
- ✅ **Smooth flow** - Conversation như nói chuyện thật

### **For System:**
- ✅ **Separate from website DB** - Không ảnh hưởng database chính
- ✅ **Memory efficient** - In-memory, auto-cleanup
- ✅ **Session isolation** - Mỗi user có context riêng
- ✅ **Scalable** - Easy to extend or migrate to Redis later

## 🔮 Future Enhancements

### **Phase 2: Advanced Memory**
- **Persistent storage** - Optional database backup
- **Cross-session memory** - Remember user preferences
- **Semantic similarity** - Better context matching
- **Memory compression** - Summarize old conversations

### **Phase 3: AI Memory**
- **Learning patterns** - Adapt to user behavior
- **Predictive context** - Anticipate follow-up questions
- **Personalization** - Remember user's favorite places
- **Multi-modal** - Voice conversation memory

## 🎯 Success Criteria

**Memory system thành công khi:**

1. **Context Continuity:** 
   - User: "UIT" → Bot: "TP.HCM, Thủ Đức"
   - User: "quán ăn gần đó" → Bot: "Gần UIT ở Thủ Đức..."

2. **Follow-up Detection:**
   - "thế nào?", "giá cả?", "cách đi?" được xử lý đúng context

3. **Natural Flow:**
   - Conversation feels like talking to a local friend
   - No need to repeat location/context information

4. **Performance:**
   - <2 seconds response time with memory lookup
   - Stable memory usage under normal load

**Chatbot giờ đây có "trí nhớ" như con người! 🧠✨**
