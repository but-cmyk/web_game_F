# Vietnamese Pixel Typography Guidelines

Read this when integrating fonts or reviewing Vietnamese text rendering.

## Font Requirements
- Must provide full precomposed Vietnamese coverage (UTF-8 Latin Extended Additional).
- Legible at small pixel sizes (8 px base bitmap font).
- Must accommodate stacked tone marks without vertical clipping.
- Generous line height: Minimum 10 px for 8 px glyphs (1.25x line spacing).

## Test Strings (12 Stress Cases)
Render and visually verify these 12 strings on the 320x180 canvas:
1. `Sâu Thêm Chút Nữa — Khám phá bóng tối hầm mỏ`
2. `Bạn đã nhặt được 150 vàng và 2 bình dầu dự phòng.`
3. `Cảnh báo: Tiếng hú của quái thú vang vọng khắp tầng!`
4. `Nguyên mẫu: Người Đi Trong Run Rẩy (Sợ cao, Tham cao)`
5. `Lựa chọn: Đổi 30% dầu hiện có lấy rương kho báu gấp đôi.`
6. `Từ chối giao kèo quỷ dữ và tiếp tục bước đi rón rén.`
7. `Lời nguyền: Kẻ bám đuôi xuất hiện ở cầu thang tầng này.`
8. `Nhắc nhở: Bạn đã chơi liên tục 45 phút. Hãy nghỉ ngơi một chút.`
9. `Khả năng nhìn trong bóng tối giảm sút nghiêm trọng.`
10. `Tấm gương phản chiếu hành vi, không phải đánh giá tâm lý.`
11. `Tất cả dữ liệu được lưu cục bộ và có thể xoá bất kỳ lúc nào.`
12. `Sẵn sàng bước xuống vực sâu thăm thẳm chưa?`

## Typography Verification
If a candidate bitmap font clips any accents (`ẩ`, `ễ`, `ặ`, `ố`, `ữ`), escalate immediately and test fallback alternatives. Record the approved font and its license in `CREDITS.md`.

