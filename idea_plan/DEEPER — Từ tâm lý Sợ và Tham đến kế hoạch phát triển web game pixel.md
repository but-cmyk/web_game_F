# DEEPER — Từ tâm lý Sợ và Tham đến kế hoạch phát triển web game pixel

Phân tích · Đánh giá · Ý tưởng sản phẩm · Kế hoạch triển khai chi tiết. Phiên bản 1.0, ngày 04/11/2026.

## 0. Tóm tắt điều hành

- **Luận điểm:** Sợ và tham không mới. Cái mới là môi trường khuếch đại chúng: tin tức 24/7, so sánh xã hội liên tục, tài chính nằm trong điện thoại, thuật toán tối ưu sự chú ý. Hai thứ này là hai mặt của một đồng xu: tham là nỗi sợ thiếu thốn, sợ là lòng tham muốn giữ lại.
- **Insight sản phẩm:** Người hiện đại không thiếu nỗi sợ hay lòng tham ngoài đời. Họ thiếu một nơi để **trải nghiệm trọn vòng sợ–tham với chi phí bằng không, rồi hiểu mình qua đó**. Đây là nhu cầu chưa được phục vụ đúng cách.
- **Sản phẩm đề xuất:** **DEEPER (Sâu Thêm Chút Nữa)**, web game pixel roguelike push-your-luck, mỗi run 5–10 phút. Người chơi xuống hầm lấy vàng; mỗi tầng sâu thêm vừa giàu hơn vừa đáng sợ hơn; vàng chưa gửi sẽ mất sạch nếu chết.
- **Điểm khác biệt:** màn hình **Tấm gương** sau mỗi run cho người chơi thấy quyết định của mình do sợ hay do tham chi phối, kèm thẻ chia sẻ ẩn danh. Không có tiền thật trong cơ chế may rủi, xác suất công khai, không streak phạt.
- **Kế hoạch:** 1 tuần kiểm chứng (Giai đoạn 0) rồi 12 tuần phát triển, phát hành trên itch.io và web riêng, kèm KPI, ngân sách, rủi ro và lộ trình sau phát hành.
- **Lưu ý về bằng chứng:** các cơ chế tâm lý bên dưới dựa trên nghiên cứu đã công bố. Đánh giá cường độ, điểm số ý tưởng, KPI mục tiêu và ngân sách là **giả thuyết và ước tính của mình**, cần kiểm chứng ở Giai đoạn 0 trước khi đầu tư lớn.

## 1. Phân tích chuyên sâu: Sợ và Tham trong bối cảnh hiện đại

### 1.1 Hai lực, một vòng lặp

Nỗi sợ ngày xưa có “con thú” cụ thể: đánh hoặc chạy. Nỗi sợ ngày nay là **lo âu lan toả, mạn tính, không có kẻ thù rõ ràng**. Vì không đánh bại được, con người tìm cảm giác kiểm soát bằng tiền, thông tin hoặc những môi trường sợ hãi an toàn (phim kinh dị, game sinh tồn). Lòng tham cũng đổi dạng: được hợp thức hoá thành “tham vọng”, “tối ưu”, “tự do tài chính”, nên người ta ít nhận ra mình đang bị nó dẫn dắt.

### 1.2 Năm nhóm nỗi sợ

| Nỗi sợ | Cơ chế chính | Hành vi điển hình | Nhu cầu ngầm |
| --- | --- | --- | --- |
| Sợ bỏ lỡ (FOMO) | So sánh xã hội liên tục (Festinger); thang đo FOMO của Przybylski và cộng sự (2013) gắn nó với việc kiểm tra mạng xã hội cưỡng ép | Hành động vội, theo đám đông | Được “kịp” mà không phải gồng |
| Sợ mất mát, bất ổn kinh tế | Ác cảm mất mát (Kahneman–Tversky): mất đau hơn được. Hệ số hay được nêu là khoảng 2 nhưng thay đổi theo bối cảnh | Giữ chặt, né rủi ro, hoảng loạn khi giá giảm | Tập ra quyết định rủi ro mà không mất thật |
| Sợ không đủ tốt | Xã hội so sánh, hội chứng kẻ giả mạo | Cầu toàn, trì hoãn, tự phê | Được nhìn mình qua dữ liệu, không bị phán xét |
| Sợ bất định kéo dài | Thiên kiến tiêu cực; doomscrolling nuôi lại chính nó | Lướt tin xấu để “nắm tình hình” | Môi trường bất định nhưng luật chơi rõ ràng |
| Sợ bị cô lập | Nhu cầu thuộc về | Đăng bài tìm xác nhận | Gắn kết nhẹ, không áp lực |

### 1.3 Năm nhóm lòng tham

| Lòng tham | Cơ chế chính | Hành vi điển hình | Nhu cầu ngầm |
| --- | --- | --- | --- |
| Làm giàu nhanh | Phần thưởng ngẫu nhiên; thiên kiến người sống sót (chỉ thấy người thắng) | Coin, cá cược, đa cấp | Cảm giác “trúng lớn” không rủi ro thật |
| Chú ý và địa vị | Like, follower là “tiền tệ xã hội” | Câu view, khoe thành tích | Thành tích đáng khoe, không cần diễn |
| “Thêm một chút nữa” | Vòng quay thích nghi hưởng thụ (Brickman và Campbell, 1971) | Không có điểm dừng | Học cách dừng đúng lúc |
| Sưu tập, hoàn thành | Hiệu ứng hoàn thành, gacha | Cày 100% | Sưu tập có điểm kết thúc rõ ràng |
| Tốc độ, hiệu suất | Văn hoá tối ưu hoá | Muốn kết quả ngay | Vòng thưởng ngắn, rõ |

### 1.4 Cơ chế tâm lý nền tảng (và độ tin cậy)

- **Wanting khác liking** (Berridge): dopamine gắn với sự mong đợi nhiều hơn với niềm vui khi nhận. Vì thế “sắp được” cuốn hơn “được rồi”. Bằng chứng mạnh.
- **Lịch thưởng tỷ lệ biến thiên** (Skinner): phần thưởng ngẫu nhiên tạo hành vi bám dai nhất. Bằng chứng mạnh, và chính vì vậy cần minh bạch xác suất.
- **Hiệu ứng suýt trúng** (near-miss): gần thắng kích hoạt vùng thưởng gần như thắng thật trong nghiên cứu cờ bạc (Clark và cộng sự, 2009). Bằng chứng khá mạnh.
- **Chi phí chìm** (Arkes và Blumer, 1985): đã đổ nhiều nên khó dừng.
- **Ác cảm mất mát:** vẫn là khung hữu ích, nhưng một số nghiên cứu lặp lại cho thấy độ lớn thay đổi, nên không dùng như hằng số cứng khi thiết kế.
- **Benign masochism** (Rozin): con người thích trải nghiệm cảm xúc tiêu cực khi biết mình an toàn (phim kinh dị, đồ cay). Một số nghiên cứu trong đại dịch gợi ý người xem kinh dị có khả năng đối phó tốt hơn, nhưng đó là bằng chứng tương quan, chưa kết luận nhân quả.

### 1.5 Vòng lặp Sợ ↔ Tham ngoài đời thực

> FOMO → dồn tiền hoặc thời gian vì tham → giá hoặc thành tích sụt → sợ mất → bán tháo hoặc “gỡ gạc” → hối tiếc → FOMO lần sau

Game có thể mô phỏng đúng vòng này trong 5–10 phút, nơi “mất” chỉ là mất điểm.

## 2. Đánh giá: khoảng trống tâm lý nào chưa được phục vụ

### 2.1 Bảng đánh giá (chủ quan, cần kiểm chứng)

| Yếu tố | Cường độ hiện nay | Dễ biến thành cơ chế game | Rủi ro đạo đức nếu khai thác sai |
| --- | --- | --- | --- |
| Sợ mất mát | Rất cao | Rất dễ: permadeath, mất đồ chưa gửi | Trung bình |
| Sợ bỏ lỡ | Cao | Dễ: sự kiện giới hạn, “bóng ma” người chơi khác | Cao (dễ thành FOMO giả tạo) |
| Sợ bất định | Cao, mạn tính | Dễ: sương mù, âm thanh mơ hồ | Thấp |
| Tham làm giàu nhanh | Cao | Rất dễ: nhân giá trị theo độ sâu | Cao (gần cờ bạc nếu có tiền thật) |
| Tham “thêm chút nữa” | Rất cao | Rất dễ: quyết định đi tiếp hay thoát lặp lại | Cao (cơ chế gây khó dừng) |

### 2.2 Sáu nhu cầu ngầm mà người dùng đang tìm kiếm

1. **Rủi ro có kiểm soát, không mất thật.** Muốn cảm giác đặt cược mà không có hậu quả tài chính.
2. **Sợ có chủ đích.** Muốn căng thẳng khi biết mình an toàn (benign masochism).
3. **Cảm giác tự chủ trong bất định.** Thế giới ngoài đời mơ hồ; thế giới game thì luật rõ ràng và lỗi là do mình.
4. **Hiểu bản thân.** Muốn biết “mình là người thế nào khi áp lực”, dạng nội dung dễ chia sẻ (kiểu bài trắc nghiệm tính cách, kiểu bản tổng kết cuối năm).
5. **Giải lao ngắn, thoả mãn nhanh.** 5–10 phút, mở trình duyệt là chơi, không cài đặt.
6. **So sánh xã hội không độc hại.** Được so sánh quyết định, không phải so sánh sự giàu có.

### 2.3 Thị trường đã chứng minh gì, và còn thiếu gì

Thể loại đã có người chơi: roguelike, extraction (đem đồ ra an toàn hoặc mất hết), push-your-luck và game kinh dị tiết chế đều có các tựa thành công (ví dụ Lethal Company kết hợp áp lực chỉ tiêu và sợ hãi; Balatro khai thác tham và rủi ro; các game extraction như Escape from Tarkov hay Dark and Darker). Điều mình **chưa thấy** (cần xác minh bằng khảo sát thị trường ở Giai đoạn 0): một game ngắn, chạy trên web, **đặt gương phản chiếu hành vi sợ/tham lên chính người chơi** và biến nó thành nội dung chia sẻ được. Đó là khoảng trống mà DEEPER nhắm tới.

## 3. Persona và công việc cần hoàn thành (Jobs-to-be-done)

| Persona | Bối cảnh | “Công việc” họ thuê game làm | Điều khiến họ quay lại |
| --- | --- | --- | --- |
| **Minh, 26, nhân viên văn phòng** | Áp lực tiền nhà, có chút đầu tư lướt sóng | “Cho tôi mạo hiểm mà không mất thật, rồi cho tôi biết mình hay vội hay hay sợ” | Chỉ số Tham/Sợ thay đổi theo từng run |
| **Linh, 21, fan roguelike** | Xem streamer, thích thử thách | “Cho tôi một run căng, quyết định có ý nghĩa” | Daily seed, build khác nhau, thành tích “thoát sát nút” |
| **Hùng, 34, giải lao giờ trưa** | Điện thoại, 10 phút rảnh | “Một ván gọn, không cần học nhiều” | Run ngắn, lưu tức thì, không ép streak |

**Câu định vị:** “Game duy nhất cho bạn thấy bạn dừng lại vì sợ hay đi tiếp vì tham.”

## 4. Ý tưởng sản phẩm: năm phương án và chấm điểm

| Ý tưởng | Mô tả | Chạm vào | Hấp dẫn (1–5) | Khả thi 12 tuần (1–5) | Khác biệt (1–5) | Rủi ro đạo đức | Tổng |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **A. DEEPER** | Hầm mỏ push-your-luck, thoát hay đi tiếp | Cả sợ và tham | 5 | 4 | 4 | Thấp (nếu giữ nguyên tắc) | **13** |
| B. Pixel Market | Mô phỏng thị trường mini, tin tức gây hoảng | Sợ mất, tham nhanh | 4 | 4 | 3 | Trung bình (gần giao dịch thật) | 11 |
| C. Doomscroll | Trình giả lập bảng tin kinh dị, có chọn lướt tiếp hay không | Sợ bất định | 3 | 5 | 4 | Thấp | 12 |
| D. Chợ Quỷ | Deck-builder đổi chác với quỷ, kiểu Balatro | Tham | 5 | 3 | 2 (thị trường đông) | Trung bình | 10 |
| E. Vườn Like | Mô phỏng địa vị mạng xã hội, hài hước | Tham chú ý, sợ bị loại | 3 | 4 | 4 | Thấp | 11 |

Điểm do mình chấm chủ quan, để so sánh tương đối. **Chọn A.** Các ý tưởng còn lại không bỏ đi mà được “nhúng” vào A: bản tin gây hoảng của C trở thành **sự kiện Bản tin** trong hầm; cơ chế đổi chác của D trở thành **Giao kèo với quỷ**; B có thể là chế độ phụ sau phát hành.

## 5. Sản phẩm chọn: DEEPER

### 5.1 Vòng lặp cốt lõi

> Xuống tầng → nhặt vàng (chưa an toàn) → bóng tối và nỗi sợ tăng → **QUYẾT ĐỊNH: thoát ra gửi vàng, hay đi tiếp?** → thoát = giữ vàng / chết = mất vàng chưa gửi → nâng cấp → run mới

Thể loại: pixel roguelike theo lượt trên lưới, 12 tầng, ba biome (hầm đá, hang nấm, vực sâu). Cốt truyện tối giản: người thợ mỏ xuống hầm cổ, đèn dầu cạn dần và có thứ trong bóng tối đang nghe thấy bạn.

### 5.2 Hệ thống Nỗi sợ

| Cơ chế | Mô tả | Cảm giác |
| --- | --- | --- |
| Đèn dầu | Dầu hao theo bước, hao nhanh hơn khi xuống sâu; bán kính sáng giảm theo lượng dầu | Sợ cạn kiệt |
| Tầm nhìn tròn | Chỉ thấy quanh nhân vật, phần còn lại là sương mù | Sợ bất định |
| Thanh Dread (0–100) | Tăng ở vùng tối, khi thấy quái, khi nghe tiếng. Từ 40: tầm nhìn co. Từ 70: ảo giác (quái giả, tiếng giả). Ở 100: mọi tiếng ồn của bạn tăng gấp đôi | Sợ mất kiểm soát |
| Quái theo âm thanh | Quái không thấy bạn nhưng nghe bước chân | Đánh đổi tốc độ và an toàn |
| Ba kiểu di chuyển | **Rón rén:** ồn bán kính 2, tốn dầu x1.5. **Đi bộ:** ồn 4, x1. **Chạy:** ồn 7, đi 2 ô mỗi lượt, x0.7 dầu mỗi ô | Chọn giữa nhanh và im lặng |
| Âm thanh và hình ảnh | Tiếng tim đập theo Dread, im lặng trước khi quái xuất hiện, vignette, nhiễu, rung nhẹ. Không dùng jumpscare | Căng thẳng bền vững |

Quái có ba loại. **Crawler** tuần tra và nghe tiếng. **Listener** đứng yên, nếu bị đánh thức sẽ hú báo cho quái khác. **Stalker** xuất hiện sau lời nguyền hoặc từ tầng 8, đuổi theo, mỗi hai lượt đi một bước. Trạng thái AI: tuần tra, nghi ngờ, truy đuổi, tìm kiếm.

### 5.3 Hệ thống Lòng tham

| Cơ chế | Mô tả | Cảm giác |
| --- | --- | --- |
| Giá trị theo độ sâu | Vàng tầng sâu có giá trị cao hơn nhiều | “Chỉ thêm một tầng nữa” |
| Rương nguyền | +50% giá trị kèm một trong bốn lời nguyền, danh sách và xác suất xem được trong Sổ tay | Tham có cái giá |
| Giao kèo với quỷ | Đề nghị minh bạch bằng số, ví dụ “đổi 30% dầu lấy rương gấp đôi”. Tám giao kèo | Tham có ý thức |
| Trạm thoát | Chỉ ở tầng 3, 6, 9; hoặc dùng dây thừng (tốn 3 lượt đứng yên) | Điểm dừng hiếm nên khó dừng |
| Âm nhặt vàng | Chime tăng cao dần khi nhặt liên tiếp | Phản hồi dopamine |
| Meta-progression | Vàng đã gửi mua nâng cấp: dung tích đèn, giày êm, dây thừng, máu khởi đầu, bùa dò cầu thang | Tham dài hạn |

### 5.4 Công thức cân bằng (điểm khởi đầu, tinh chỉnh bằng mô phỏng và playtest)

```ts
const lootValue = (depth: number) => Math.round(10 * Math.pow(1.3, depth - 1));
const oilCostPerStep = (depth: number) => 1 + 0.15 * depth;
const dangerP = (depth: number, dread: number) =>
  Math.min(0.6, 0.05 + 0.04 * depth + 0.002 * dread);
```

**Mục tiêu:** khoảng 55–65% run đầu kết thúc bằng cái chết; đa số người chơi nói “lỗi của mình”, không phải “game bất công”. Dầu phải có nhặt được trên tầng (khoảng 15 mỗi bình) để run không bị bóp nghẹt.

### 5.5 Màn hình Tấm gương (điểm khác biệt cốt lõi)

Các chỉ số ghi từ nhật ký quyết định của mỗi run:

- **pushedOnHighDread:** số lần đi sâu hơn khi Dread từ 70.
- **bypassedExit:** số lần bỏ qua trạm thoát khi vẫn còn đủ dầu.
- **earlyExit:** số lần thoát khi dầu còn trên 50% và Dread dưới 40 (có thể là thận trọng hoặc sợ sớm).
- **cursedAccepted / bargainsAccepted / bargainsDeclined.**

Từ đó tính **Chỉ số Tham** và **Chỉ số Sợ** (thang 0–100), **luôn so với trung bình các run trước của chính người chơi** và hiển thị bằng giọng trung tính, ví dụ: “Lần này bạn dừng sớm hơn 2 tầng so với mức trung bình của bạn.” Dựa trên hai trục, game gợi ý một **nguyên mẫu** vui, không mang tính chẩn đoán:

| Tham cao | Sợ cao | Nguyên mẫu |
| --- | --- | --- |
| Cao | Thấp | Kẻ Đào Vàng |
| Thấp | Cao | Người Giữ Lửa |
| Cao | Cao | Người Đi Trong Run Rẩy |
| Thấp | Thấp | Kẻ Tính Toán |

Kèm dòng chú thích: “Chỉ để giải trí, không phải đánh giá tâm lý.” Thẻ nguyên mẫu có thể xuất ảnh để chia sẻ, mặc định ẩn danh.

### 5.6 Tính năng xã hội

- **Xác người chơi khác:** xác ẩn danh nằm trong hầm kèm số vàng họ mất. Nhặt được là lời, nhưng phải đi qua vùng nguy hiểm.
- **Daily seed:** mọi người chơi chung một hầm mỗi ngày, bỏ lỡ không bị phạt.
- **Bảng xếp hạng người sống sót** (thoát thành công), không phải bảng giàu nhất, để không thưởng riêng cho tham.

### 5.7 Hợp đồng đạo đức với người chơi

Sợ và tham là hai đòn bẩy rất mạnh, dễ bị dùng để thao túng. DEEPER dùng chúng làm cơ chế cốt lõi **rồi trả lại sự thấu hiểu**. Cam kết cố định:

1. Không có tiền thật gắn với cơ chế may rủi; không loot box.
2. Mọi xác suất và giá trị hiển thị trong game (Sổ tay).
3. Không đồng hồ ép quay lại, không streak phạt, không thông báo gây tội lỗi.
4. Tấm gương chỉ so với chính bạn, giọng trung tính, bật tắt được.
5. Nhắc nghỉ sau khoảng 45 phút chơi liên tục; chế độ giảm nhấp nháy và giảm rung.
6. Dữ liệu ẩn danh, tắt được, không bán cho bên thứ ba.

## 6. Kế hoạch phát triển chi tiết

### 6.1 Giai đoạn 0: kiểm chứng (5–7 ngày, trước khi code)

| Việc | Cách làm | Tiêu chí đi tiếp (giả thuyết) |
| --- | --- | --- |
| Prototype giấy | Bảng 12 tầng, xúc xắc, thẻ sự kiện; cho 10–15 người thử | Ít nhất 2/3 người tự đòi chơi “thêm một run”; có người nói câu kiểu “biết vậy dừng sớm rồi” |
| Landing page thử cầu | Một trang giới thiệu game kèm đăng ký email, đăng ở vài cộng đồng game và indie dev | Tỷ lệ đăng ký trên khách truy cập đạt mức bạn đặt trước (gợi ý khởi điểm 5–8%, hiệu chỉnh theo kênh) |
| Khảo sát nhanh | 5 câu hỏi về nỗi sợ, tham, thói quen chơi game ngắn | Có nhóm rõ rệt quan tâm “biết mình qua game” |
| Rà soát đối thủ | Liệt kê 10–15 game gần nhất, ghi điểm họ làm tốt và chỗ thiếu | Xác nhận khoảng trống ở mục 2.3 |

Nếu không đạt hai trong bốn tiêu chí, quay lại điều chỉnh concept thay vì xây tiếp.

### 6.2 Công nghệ và kiến trúc

| Hạng mục | Lựa chọn | Lý do |
| --- | --- | --- |
| Engine | **Phaser 3 + TypeScript + Vite** | Nhẹ, chạy tốt trên web và mobile, cộng đồng lớn |
| Độ phân giải | Canvas nội bộ 320×180, scale số nguyên, bật pixelArt | Pixel sắc nét |
| Điều khiển | Lưới, theo lượt; phím mũi tên hoặc chạm/vuốt | Dễ cân bằng, hợp mobile |
| Sinh map | BSP hoặc cellular automata có seed | Daily seed, replay |
| Ánh sáng | Mặt nạ hình tròn kèm nhấp nháy | Rẻ hơn shader phức tạp |
| Test | Vitest cho logic (RNG, công thức, AI), kiểm thử khói bằng trình duyệt | Bắt lỗi cân bằng sớm |
| Pixel art | Aseprite hoặc LibreSprite/Piskel, tile 16×16, palette 16–32 màu từ Lospec | Phong cách thống nhất |
| Âm thanh | jsfxr/ChipTone cho SFX, BeepBox cho nhạc | Miễn phí, hợp 8-bit |
| Backend (tuỳ chọn) | Supabase hoặc Firebase, đặt sau một interface để chơi offline vẫn chạy | Xác, bảng xếp hạng, daily seed |
| Phân tích | PostHog hoặc Plausible, ẩn danh | Thân thiện quyền riêng tư |
| Phát hành | itch.io và web riêng (Vercel/Netlify) | Dễ tiếp cận cộng đồng indie |

Cấu trúc thư mục: `src/scenes` (Boot, Menu, Run, Extract, Mirror, Meta), `src/systems` (Light, Dread, Loot, Event, AudioDirector, Noise), `src/data` (items, events, enemies dạng JSON), `src/utils` (seededRandom, grid). Toàn bộ số liệu cân bằng nằm trong `src/data` để chỉnh không cần sửa code.

### 6.3 Lộ trình 12 tuần (giả định 1 lập trình viên và 1 hoạ sĩ bán thời gian)

| Tuần | Mục tiêu | Việc chính | Nghiệm thu |
| --- | --- | --- | --- |
| 1 | Nền tảng | Tài liệu thiết kế 1 trang, ba trụ cột (quyết định dưới áp lực, rủi ro minh bạch, phản chiếu không thao túng), palette, dựng project, CI chạy typecheck, lint, test, build | Màn “Hello pixel” 320×180 chạy, lệnh kiểm tra tổng hợp xanh |
| 2–3 | Vòng lặp lõi | Sinh map có seed, di chuyển theo lưới, tầm nhìn tròn, nhặt vàng, thang xuống, trạm thoát, mất vàng khi chết, đồ hoạ tạm | Chơi trọn một run từ đầu đến cuối |
| 4–5 | Hệ thống Sợ | Dầu, Dread, ba kiểu di chuyển, AI quái theo âm thanh, ảo giác, hậu kỳ hình ảnh, âm thanh nền | Người thử báo “căng thật” mà không báo “bất công” |
| 6–7 | Hệ thống Tham | Giá trị theo độ sâu, rương nguyền, giao kèo với quỷ, cửa hàng, nâng cấp, bộ mô phỏng cân bằng chạy hàng nghìn run bằng bot | Tối thiểu 8 vật phẩm, 10 sự kiện; tỷ lệ chết trong dải mục tiêu; run thứ 5 khác run thứ 1 |
| 8 | Tấm gương và hướng dẫn | Ghi nhật ký quyết định, màn phân tích, nguyên mẫu, hướng dẫn 3 phút | Người mới hiểu luật không cần đọc chữ |
| 9–10 | Nội dung và cảm giác chơi | 3 biome, đổi palette ấm sang lạnh, screenshake, hitstop, hạt vàng, điều khiển cảm ứng, cài đặt, chế độ giảm nhấp nháy, đa ngôn ngữ vi/en | Đủ “đã” để quay clip quảng bá |
| 11 | Xã hội | Xác người chơi, daily seed, bảng xếp hạng người sống sót, nhắc nghỉ | Backend ổn định, dữ liệu ẩn danh; tắt mạng vẫn chơi được |
| 12 | QA và phát hành | Playtest 15–20 người, chỉnh số liệu, tối ưu (tải dưới 3 giây, gói khoảng 5 MB trở xuống, 60 FPS trên máy tầm trung), phát hành | Bản 1.0 công khai trên itch.io và web riêng |

**Định nghĩa hoàn thành (DoD) cho mọi tuần:** lệnh kiểm tra tổng hợp xanh; chạy thử trong trình duyệt và có ảnh chụp màn hình; cập nhật tài liệu trạng thái; không còn TODO chưa ghi nhận; commit rõ ràng.

### 6.4 Nhân sự và ngân sách ước tính

| Hạng mục | Ước tính | Ghi chú |
| --- | --- | --- |
| Lập trình (1 người) | 12 tuần toàn thời gian hoặc khoảng 24 tuần bán thời gian | Có thể dùng trợ lý AI cho phần khung, vẫn cần người xem xét |
| Hoạ sĩ pixel | Khoảng 30–40% thời gian trong tuần 2–10 | Có thể bắt đầu bằng sprite tạm do code sinh ra |
| Âm thanh | Tự làm bằng jsfxr và BeepBox, hoặc thuê gói nhạc ngắn | Ưu tiên SFX trước nhạc |
| Chi phí công cụ | Khoảng vài chục USD: bản quyền Aseprite (nếu mua), tên miền hằng năm; Supabase, Vercel, itch.io có gói miễn phí | Kiểm tra lại giá khi triển khai |

### 6.5 Quy trình nghệ thuật và âm thanh

- **Phong cách:** palette 16–32 màu, bóng tối chiếm phần lớn khung hình, vàng là điểm sáng duy nhất để mắt tự tìm tới.
- **Biome:** hầm đá (ấm, nâu cam), hang nấm (xanh lục phát quang), vực sâu (lạnh, tím xanh). Palette đổi theo độ sâu để người chơi cảm nhận mình đi sâu hơn.
- **Âm thanh:** nhịp tim đồng bộ với Dread, im lặng có chủ đích trước sự kiện, chime vàng tăng cao dần. SFX làm trước, nhạc nền tối giản làm sau.
- **Quy tắc tài sản:** chỉ dùng tài sản tự làm hoặc có giấy phép rõ ràng; ghi nguồn vào tệp CREDITS.

### 6.6 QA, playtest, phân tích và KPI

- **Bot cân bằng:** ba chính sách (thận trọng, tham lam, hỗn hợp) chạy hàng nghìn run để kiểm tra tỷ lệ chết, độ sâu trung bình, và xem có chiến lược thống trị nào không.
- **Playtest:** hai vòng (tuần 5 và tuần 11), mỗi vòng 8–10 người; hỏi “khoảnh khắc nào bạn do dự nhất?” và “bạn có thấy bị ép chơi không?”.
- **KPI mục tiêu (giả thuyết khởi điểm, không phải chuẩn ngành đã kiểm chứng):**

| Chỉ số | Mục tiêu khởi điểm |
| --- | --- |
| Độ dài mỗi run | 5–10 phút |
| Tỷ lệ chết ở các run đầu | 55–65% |
| Tỷ lệ chết do tham (chết ngay sau khi bỏ qua trạm thoát) | Theo dõi, dùng để chỉnh “bức tường tham” |
| Giữ chân ngày 1 và ngày 7 | Đặt mốc sau tuần đầu có dữ liệu thật |
| Tỷ lệ chia sẻ thẻ Tấm gương | Theo dõi, mục tiêu cải thiện qua từng bản cập nhật |
| Người chơi nói “thấy bị ép chơi” | Dưới 10% trong khảo sát |

### 6.7 Phát hành và tăng trưởng

1. **Trước phát hành (tuần 8–11):** nhật ký phát triển ngắn, clip 15–30 giây về khoảnh khắc do dự (tiếng tim đập, vàng sáng, trạm thoát xa), đăng ở cộng đồng game indie và dev. Thu email từ landing page.
2. **Phát hành (tuần 12):** itch.io (có bản chơi trực tiếp trên trình duyệt) và web riêng; gửi bản chơi thử cho vài người làm nội dung game.
3. **Vòng lặp lan truyền:** thẻ nguyên mẫu từ Tấm gương là nội dung người chơi tự chia sẻ. Giữ thẻ đẹp, ngắn, hài hước vừa phải, có đường dẫn quay về game.
4. **Cộng đồng Việt Nam:** bản tiếng Việt từ ngày đầu, nhóm game và dev trên mạng xã hội. Thích ứng nội dung theo bối cảnh văn hoá, không dùng hình ảnh đánh bạc.

### 6.8 Kiếm tiền có đạo đức

- Bán một lần với giá thấp, hoặc miễn phí kèm gói skin thuần thẩm mỹ.
- Không bán lợi thế chơi, không loot box tiền thật, không rút thưởng.
- Nút ủng hộ (tip jar) và bản mở rộng nội dung (biome, quái mới) sau phát hành.

### 6.9 Pháp lý và tuân thủ (cần xác minh với chuyên gia)

- **Cờ bạc:** giữ cơ chế may rủi thuần ảo, không đổi vàng trong game ra giá trị thật, để tránh bị coi là cờ bạc hoặc loot box.
- **Dữ liệu cá nhân:** thu tối thiểu, ẩn danh, có chấp thuận rõ ràng. Với người dùng ở Việt Nam, cần xem lại Luật Bảo vệ dữ liệu cá nhân (có hiệu lực từ đầu năm 2026) và các quy định về quản lý dịch vụ internet, game trực tuyến (ví dụ Nghị định 147/2024). Mình chưa kiểm tra chi tiết các văn bản này, nên bạn nên hỏi luật sư trước khi mở tính năng xã hội có dữ liệu người dùng.
- **Trẻ em:** nhắm đối tượng từ 16 tuổi trở lên, không dùng kỹ thuật kéo dài thời gian chơi.
- **Tính nhạy cảm:** nội dung tối nhưng không máu me; cảnh báo nhấp nháy và âm thanh mạnh.

### 6.10 Rủi ro và cách giảm

| Rủi ro | Mức | Giảm thiểu |
| --- | --- | --- |
| Game quá khó, gây bực thay vì căng thẳng | Cao | Bot cân bằng từ tuần 6, playtest từ tuần 3, núm chỉnh độ khó |
| Tấm gương bị coi là phán xét hoặc “chẩn đoán” | Trung bình | Giọng trung tính, so với chính người chơi, chú thích chỉ để giải trí |
| Gây khó dừng | Trung bình | Nhắc nghỉ, không streak, không đồng hồ ép |
| Quá tải phạm vi | Cao | Khoá phạm vi: 3 biome, khoảng 30 sự kiện, mở rộng sau phát hành |
| Hiệu năng kém trên mobile | Trung bình | Thử máy yếu từ tuần 3, giới hạn hạt |
| Concept không có cầu | Trung bình | Giai đoạn 0 với tiêu chí đi hoặc dừng |
| Phụ thuộc AI sinh code gây lỗi khó thấy | Trung bình | Test tự động cho logic cốt lõi, xem xét từng bản dựng |

### 6.11 Sau phát hành

Thêm biome, quái, sự kiện; chế độ “chỉ sợ” (không vàng) và “chỉ tham” (không quái) để người chơi tự so sánh bản thân; thử thách hằng tuần không phạt; công cụ chia sẻ Tấm gương; cân nhắc chế độ Pixel Market (ý tưởng B) nếu dữ liệu cho thấy người chơi muốn thêm thể loại quyết định tài chính ảo.

## 7. Bước tiếp theo

1. Chạy Giai đoạn 0 (prototype giấy và landing page) trong tuần này.
2. Chốt ba trụ cột thiết kế và hợp đồng đạo đức ở mục 5.7 làm ràng buộc cho mọi quyết định.
3. Nếu tiến hành, triển khai với trợ lý lập trình AI: viết bộ quy tắc, kỹ năng (skill) và lời nhắc theo từng mốc của lộ trình 12 tuần ở mục 6.3.
