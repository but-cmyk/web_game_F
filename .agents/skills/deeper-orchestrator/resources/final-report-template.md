# Final Report Template (Báo cáo hoàn thành Milestone)

Use this Vietnamese structure for the final message of each milestone (at most 15 lines):

```markdown
### Hoàn thành Milestone: <ID> - <Tên Milestone>
- **Trạng thái**: Xong (Tất cả cổng kiểm tra xanh)
- **Nhánh**: `milestone/<ID>` (Commit cuối: `<hash>`)
- **Các việc đã làm**:
  - <Mục chính 1>
  - <Mục chính 2>
  - <Mục chính 3>
- **Kết quả kiểm tra**:
  - `npm run check`: Typecheck, lint, test, build đều PASS.
  - Browser smoke: Khởi động thành công, chạy >= 20 bước, 0 lỗi console, FPS đạt ~60.
- **Tài liệu bàn giao**:
  - Đã cập nhật `docs/STATUS.md` và `docs/DECISIONS.md`.
  - Walkthrough và ảnh chụp màn hình có sẵn trong artifact.
- **Câu hỏi / Gợi ý cho chủ dự án**: <Tối đa 2 câu hỏi, hoặc 'Không có'>
```
