# Custome Rule
Trả lời bằng Tiếng Việt , dĩ nhiên là tiếng Việt có dấu
Tuân thủ nghiêm ngặc KISS, YAGNI, DRY
Tuân thủ Rails Convention Over Configuration
Khi user đưa URL localhost (ví dụ http://localhost:3000/...), hãy đọc route tương ứng trong Next.js để hiểu, không hỏi lại.
Mọi thay đổi code khi hoàn thành đều phải commit (nhưng không được push nha). 
Trước khi commit chỉ chạy bunx tsc --noEmit thôi (không chạy bun run lint hay gì khác tốn thời gian nha) khi có thay đổi code/TS; không chạy khi chỉ sửa docs/cấu hình không liên quan.

# Prompt Best Practices (để tăng độ chính xác)
* Nêu rõ yêu cầu + phạm vi; không mở rộng tính năng ngoài yêu cầu.
* Tách bạch: yêu cầu, ngữ cảnh, đầu vào, định dạng đầu ra.
* Ép ngắn gọn + cấu trúc rõ (ưu tiên bullet ngắn).
* Nếu mơ hồ: ưu tiên dùng SUB AGENT WEBSEARCH để tìm best practice; chỉ hỏi 1 câu làm rõ khi thật cần thiết.
* Khi cần dữ liệu cụ thể: ưu tiên dùng tool/WebSearch thay vì đoán.

# Problem-Solving Framework (DARE)
Khi gặp vấn đề phức tạp:
1. Decompose - vẽ problem graph, xác định ROOT CAUSE, cho phép merge/loop giữa thoughts.
2. Analyze - với mỗi sub-problem: Thought -> Action -> Observation, dùng tool/search khi cần.
3. Reflect - tự critique sau mỗi bước, nếu lỗi thì backtrack và thử hướng khác.
4. Execute - giải bottom-up từ ROOT CAUSE, validate mỗi bước, uncertain thì thử 2-3 hướng và vote.

Format output:
## Problem Graph
1. [Main] <- depends on 1.1, 1.2
   1.1 [Sub] <- depends on 1.1.1
      1.1.1 [ROOT CAUSE] <- Solve first
   1.2 [Sub]

## Execution (with reflection)
1. Solving 1.1.1...
   - Thought: ...
   - Action: ...
   - Reflection: ✓ Valid / ✗ Retry
2. ...

# Spec Mode Rules
Khi ở chế độ Spec (read-only planning):
* Bắt buộc dùng DARE framework: Decompose → Analyze → Reflect → Execute plan.
* Dùng AskUser để làm rõ mọi điểm mơ hồ TRƯỚC khi chốt spec; không đoán requirement.
* Plan phải chi tiết từng bước (step-by-step actionable), đủ để implement xong trong 1 lần — KHÔNG chia phase/giai đoạn.
* Mỗi bước ghi rõ: file nào, thay đổi gì, logic cụ thể; ai đọc plan cũng tự implement được.
* Ưu tiên full implement > incremental; nếu scope quá lớn thì AskUser để user quyết cắt scope, không tự ý chia phase.

# 7 Nguyên tắc DB Bandwidth Optimization:
* Filter ở DB, không ở JS - Không .collect()/.findAll() không filter; không fetch ALL rồi filter JS; không fetch ALL để count
* Không N+1 - Không gọi DB trong loop; batch load bằng Promise.all(); dùng Map thay .find() (O(1) vs O(n²))
* Luôn có Index - Mọi filter/sort cần index; compound index: equality trước, range/sort sau; ưu tiên selectivity cao
* Luôn có Limit + Pagination - Default 20, max 100-500; ưu tiên cursor-based; tránh offset lớn
* Chỉ lấy data cần thiết - Select fields cụ thể (không select *); dùng projection/covered index
* Load song song - Promise.all() cho independent queries; batch load relations cùng lúc
* Monitor trước deploy - Setup budget alerts (50/90/100%); estimate: Records × Size × Requests/day; track slow queries > 1s