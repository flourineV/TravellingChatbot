# Chatbot Prompt Improvements

## Vấn đề hiện tại
Khi user hỏi "lộ trình du lịch ở Đồng Nai cho 2 người 2 đêm với mức giá rẻ", chatbot vẫn yêu cầu thêm thông tin thay vì tạo lộ trình ngay.

## Cải thiện GENERATE_ITINERARY_TEMPLATE

### 1. Thêm phần xử lý thông tin mặc định

```javascript
<default-assumptions>
  Nếu user không cung cấp đầy đủ thông tin, hãy đưa ra giả định hợp lý:
  - Ngân sách: Nếu nói "giá rẻ" → ước tính 500.000-800.000 đ/người/ngày
  - Ngân sách: Nếu nói "cao cấp" → ước tính 1.500.000-3.000.000 đ/người/ngày  
  - Ngân sách: Nếu không nói → ước tính 800.000-1.200.000 đ/người/ngày
  - Sở thích: Nếu không nói → bao gồm cả tham quan, ẩm thực, nghỉ dưỡng
  - Phương tiện: Nếu không nói → ưu tiên xe máy/taxi cho di chuyển gần, xe khách cho xa
</default-assumptions>
```

### 2. Cải thiện phần instruction

Thay đổi từ:
```
Gently ask you to provide more details if the user doesn't specify the destination or duration.
```

Thành:
```
<missing-info-handling>
  - Nếu thiếu điểm đến: Yêu cầu bổ sung
  - Nếu thiếu thời gian: Yêu cầu bổ sung  
  - Nếu thiếu ngân sách: Đưa ra giả định dựa trên từ khóa ("giá rẻ", "cao cấp", etc.)
  - Nếu thiếu sở thích: Tạo lộ trình đa dạng (tham quan + ẩm thực + nghỉ dưỡng)
  
  ✅ LUÔN tạo lộ trình nếu có đủ điểm đến + thời gian, kể cả khi thiếu thông tin khác
</missing-info-handling>
```

### 3. Thêm ví dụ xử lý câu hỏi mơ hồ

```javascript
<ambiguous-query-examples>
  <example input="lộ trình du lịch ở Đồng Nai cho 2 người 2 đêm với mức giá rẻ">
    - Điểm đến: ✅ Đồng Nai
    - Thời gian: ✅ 2 đêm (3 ngày)
    - Số người: ✅ 2 người  
    - Ngân sách: ✅ Giá rẻ (ước tính 500.000-800.000đ/người/ngày)
    - Sở thích: ❌ Không có → Giả định: tham quan + ẩm thực + nghỉ dưỡng
    
    → TẠO LỊCH TRÌNH NGAY với giả định hợp lý
  </example>
</ambiguous-query-examples>
```

## Cải thiện CLASSIFY_INTENT_PROMPT

### Thêm ví dụ phân loại tốt hơn:

```javascript
<example input="lộ trình du lịch ở Đồng Nai cho 2 người 2 đêm với mức giá rẻ" output="<intent>generateItinerary</intent>" />
<example input="tôi muốn đi Phú Quốc 3 ngày, có gì hay không?" output="<intent>generateItinerary</intent>, <intent>activities</intent>" />
<example input="kế hoạch du lịch Sapa tiết kiệm chi phí" output="<intent>generateItinerary</intent>" />
```

## Cải thiện logic xử lý

### Trong file chatbot service, thêm:

```javascript
// Trước khi gọi generateItinerary, kiểm tra thông tin
function preprocessItineraryRequest(userMessage) {
  const hasDestination = extractDestination(userMessage);
  const hasDuration = extractDuration(userMessage);
  
  if (hasDestination && hasDuration) {
    // Đủ thông tin cơ bản → tạo lịch trình ngay
    return { shouldGenerate: true, missingInfo: [] };
  }
  
  const missing = [];
  if (!hasDestination) missing.push('điểm đến');
  if (!hasDuration) missing.push('thời gian');
  
  return { shouldGenerate: false, missingInfo: missing };
}
```

## Test cases cần kiểm tra

1. ✅ "lộ trình du lịch ở Đồng Nai cho 2 người 2 đêm với mức giá rẻ"
2. ✅ "kế hoạch 3 ngày ở Đà Lạt"  
3. ✅ "tôi muốn đi Phú Quốc 4 ngày"
4. ❌ "tôi muốn đi du lịch" (thiếu điểm đến)
5. ❌ "Đà Nẵng có gì hay?" (không phải yêu cầu lịch trình)

## Cách áp dụng

1. **Cập nhật prompts** trong `Chatbot/src/prompts/` 
2. **Test với các câu hỏi mẫu** để đảm bảo hoạt động đúng
3. **Monitor user feedback** để tiếp tục cải thiện

## Kết quả mong đợi

- User hỏi với thông tin cơ bản → Nhận lịch trình ngay lập tức
- Giảm số lần chatbot yêu cầu thêm thông tin
- Tăng user satisfaction và conversion rate
