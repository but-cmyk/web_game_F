# DEEPER — Kế hoạch triển khai chi tiết

Phiên bản 1.1 · 04/11/2026 (thêm prompt 02B và 4 skill chất lượng) · Đặt file này tại `docs/IMPLEMENTATION_PLAN.md` trong repo.

> **Vai trò của tài liệu:** đây là nguồn sự thật duy nhất về phạm vi, số liệu và nghiệm thu. Agent đọc đúng phần liên quan ở đầu mỗi milestone. Skill chỉ mô tả *cách làm*, còn *con số* nằm ở §4 và trong `src/data/*.json`.
>
> **Quy ước:** `[LOCKED]` = không đổi nếu chưa hỏi người dùng và ghi vào `docs/DECISIONS.md`. `[TUNABLE]` = giá trị khởi điểm, chỉnh bằng dữ liệu và mô phỏng cân bằng.
>
> **Ngôn ngữ:** tài liệu bằng tiếng Việt, định danh kỹ thuật bằng tiếng Anh. Agent trả lời người dùng bằng tiếng Việt; code, comment, tên commit, tên file bằng tiếng Anh. Chuỗi hiển thị trong game nằm ở `src/i18n/vi.json` (mặc định) và `en.json`.

---

## 0. Bộ tài liệu và thứ tự dùng

| File | Dùng khi nào |
|---|---|
| `01_IMPLEMENTATION_PLAN.md` (file này) | Chép vào `docs/IMPLEMENTATION_PLAN.md` trước khi làm gì khác |
| `02_PROMPT_CREATE_SKILLS.md` | Chạy **một lần**, trước khi viết code game: agent tạo `AGENTS.md`, rules, 7 skill, bộ tài liệu theo dõi |
| `02B_PROMPT_CREATE_QUALITY_SKILLS.md` | Chạy **một lần**, sau prompt 02 và trước M0: agent tạo thêm 4 skill chất lượng (UI/UX, viết code ổn định, debug, review code), 2 script kiểm tra, cập nhật `AGENTS.md` |
| `03_PROMPT_IMPLEMENT.md` | Chạy **mỗi milestone một hội thoại mới**, từ M0 đến M11 |

---

## 1. Mục tiêu và phạm vi

**Sản phẩm:** DEEPER (Sâu Thêm Chút Nữa), web game pixel roguelike theo lượt, push-your-luck. Người chơi xuống hầm lấy vàng; vàng chưa gửi sẽ mất nếu chết; mỗi tầng sâu hơn vừa giàu hơn vừa đáng sợ hơn. Sau mỗi run, màn **Tấm gương** cho thấy quyết định của người chơi nghiêng về sợ hay tham.

**Ba trụ cột thiết kế [LOCKED]:**
1. *Quyết định dưới áp lực:* mỗi vài chục giây phải có một lựa chọn thật (đi tiếp, dừng, mở rương, nhận giao kèo).
2. *Rủi ro minh bạch:* mọi xác suất, giá trị, cái giá đều xem được trong game trước khi người chơi chọn.
3. *Phản chiếu, không thao túng:* game dùng sợ và tham làm cơ chế, rồi trả lại sự thấu hiểu; không ép quay lại, không gây tội lỗi.

**Ngoài phạm vi bản 1.0 [LOCKED]:** tiền thật gắn với may rủi, loot box, đăng nhập/tài khoản, multiplayer thời gian thực, app native, đồ hoạ 3D, quảng cáo.

---

## 2. Quyết định kỹ thuật đã khoá [LOCKED]

| Hạng mục | Quyết định |
|---|---|
| Engine | Phaser **3.x** (giữ major 3; agent kiểm tra bằng `npm view phaser versions`, nếu bản mới nhất là major khác thì cài `phaser@^3`) |
| Ngôn ngữ, build | TypeScript `strict: true`, Vite |
| Test | Vitest cho logic; kiểm tra khói bằng trình duyệt (browser subagent của Antigravity hoặc Playwright) |
| Lint, format | ESLint + Prettier |
| Canvas | Nội bộ 320×180, tile 16×16, `pixelArt: true`, `roundPixels: true`, scale theo số nguyên, căn giữa |
| Điều khiển | Theo lưới, theo lượt: phím mũi tên/WASD; chạm: vuốt hoặc nút ảo. Có nút chuyển kiểu di chuyển |
| Lưu trữ | `SaveStore` interface; mặc định `localStorage` có version và migration, fallback bộ nhớ |
| Backend | Không bắt buộc. Chỉ qua interface `RemoteStore`; mặc định `LocalStore`; Supabase là adapter tuỳ chọn ở M10, tắt nếu thiếu khoá |
| Phân tích | Qua interface `Analytics`; mặc định no-op; chỉ bật khi người chơi đồng ý |
| i18n | Khoá chuỗi; `vi` mặc định, `en` đủ bộ |
| Mã ngẫu nhiên | Toàn bộ qua `Rng` từ seed; cấm `Math.random` trong `src/core` |
| Tài sản | Chỉ tài sản tự sinh bằng code hoặc có giấy phép ghi trong `CREDITS.md`; không sao chép IP có bản quyền |
| Ngân sách hiệu năng | Gói dựng ≤ 5 MB; tải lần đầu < 3 giây trên 4G tầm trung; 60 FPS |

---

## 3. Kiến trúc

```
deeper/
  AGENTS.md                  luật luôn bật (do prompt 02 tạo)
  .agents/rules/*.md         luật theo ngữ cảnh
  .agents/skills/*/SKILL.md  11 skill (7 từ prompt 02, 4 từ prompt 02B)
  docs/                      IMPLEMENTATION_PLAN, STATUS, DECISIONS, BALANCE_LOG, SKILLS_AUDIT
  scripts/                   validate-agent-kit.mjs, check-skill-yaml.mjs, balance-sim.ts, package.mjs
  src/
    core/        logic thuần TypeScript, KHÔNG import Phaser: rng, grid, mapgen, turn, dread, oil,
                 noise, monsters, loot, events, meta, mirror
    scenes/      Boot, Menu, Tutorial, Run, Extract, Mirror, Codex, Meta, Settings
    views/       lớp hiển thị Phaser: light mask, post-FX, HUD, touch controls
    audio/       AudioDirector, sfx tổng hợp bằng WebAudio
    data/        items.json, events.json, enemies.json, biomes.json, curses.json,
                 bargains.json, upgrades.json, mirror.json, banned-mirror-words.json
    i18n/        vi.json, en.json
    services/    SaveStore, RemoteStore, Analytics (interface + adapter)
    utils/
  tests/         unit + fixtures
```

**Luồng một lượt (turn pipeline):** `TurnResolver.step(action)` nhận hành động của người chơi, trả về danh sách sự kiện theo thứ tự: di chuyển → tiêu dầu → phát tiếng ồn → cập nhật Dread → quái hành động → nhặt đồ/tương tác → kiểm tra thua/thoát. `src/core` không biết gì về đồ hoạ; scene chỉ phát lại sự kiện.

**Sự kiện nội bộ (event bus có kiểu):** `StepTaken`, `NoiseEmitted`, `DreadChanged`, `MonsterStateChanged`, `GoldPicked`, `ChestOpened`, `BargainOffered`, `BargainResolved`, `ExtractStarted`, `RunEnded`. Mọi quyết định cần cho Tấm gương được ghi từ các sự kiện này.

**Seed:** `runSeed` → `Rng.fork('floor:N')`, `fork('loot')`, `fork('ai')`, `fork('event')`. Daily seed = băm của ngày UTC `YYYY-MM-DD`.

---

## 4. Đặc tả gameplay (số liệu)

### 4.1 Bản đồ và tầng
| Tham số | Giá trị |
|---|---|
| Kích thước một tầng | 40×30 tile `[TUNABLE]` |
| Khung nhìn | 20×10 tile (320×160) + thanh HUD 20 px |
| Sinh map | BSP (phòng + hành lang), có seed; kiểm thử 100 seed đều liên thông |
| Cầu thang xuống | Khoảng cách đường đi ≥ 60% đường kính map tính từ điểm vào |
| Số tầng | 12 `[LOCKED]` |
| Biome | Tầng 1–4 hầm đá (ấm); 5–8 hang nấm (xanh phát quang); 9–12 vực sâu (lạnh) |

### 4.2 Dầu và ánh sáng
- Dầu khởi đầu 100; mỗi cấp nâng cấp đèn +10 (tối đa 5 cấp). Bình dầu nhặt được: +15, 2–3 bình mỗi tầng `[TUNABLE]`.
- Chi phí mỗi bước: `oilCostPerStep(depth) = 1 + 0.15 * depth`, nhân hệ số theo kiểu di chuyển (§4.3).
- Bán kính sáng: `lightRadius = 2 + round(4 * oil / oilMax)` (2 đến 6 tile). Dread từ 40 trở lên trừ thêm 1 (tối thiểu 2).
- Hết dầu: bán kính sáng cố định 1; Dread tăng +4 mỗi bước thay vì +2.

### 4.3 Kiểu di chuyển và tiếng ồn
| Kiểu | Bán kính ồn (tile) | Hệ số dầu | Số ô mỗi lượt |
|---|---|---|---|
| Rón rén (sneak) | 2 | ×1.5 | 1 |
| Đi bộ (walk) | 4 | ×1.0 | 1 |
| Chạy (run) | 7 | ×0.7 mỗi ô | 2 |

Tiếng ồn lan theo **khoảng cách đường đi (BFS), tường chặn**, không theo đường chim bay. Dread ở mức 100 nhân đôi bán kính ồn. Lời nguyền "ồn hơn" cộng +50%.

### 4.4 Dread (0–100)
| Sự kiện | Thay đổi |
|---|---|
| Mỗi bước trên ô không được chiếu sáng | +2 |
| Mỗi bước trong vùng sáng của đuốc hoặc trạm thoát | −3 |
| Lần đầu thấy một con quái (tối đa 1 lần/10 lượt/con) | +10 |
| Nghe một sự kiện ồn của quái | +5 |
| Giao kèo, lời nguyền | theo dữ liệu |

| Ngưỡng | Hiệu ứng |
|---|---|
| ≥ 40 | Bán kính sáng −1; tim đập nhanh dần |
| ≥ 70 | Ảo giác: cứ 5 bước, 15% xuất hiện quái giả hoặc tiếng giả. Quái giả **không gây sát thương**, biến mất khi cách ≤ 2 ô và cộng +5 Dread |
| = 100 | Mọi tiếng ồn của người chơi nhân đôi bán kính |

### 4.5 Quái
| Loại | Hành vi |
|---|---|
| Crawler | Tuần tra; nghe tiếng trong bán kính ồn (theo đường đi); trạng thái PATROL → SUSPICIOUS (đến nguồn ồn) → CHASE (thấy người chơi) → SEARCH (mất dấu, tìm 8 lượt) → PATROL |
| Listener | Đứng yên; nếu nghe ồn trong 5 tile thì **hú**, đưa mọi quái trong 10 tile sang SUSPICIOUS tại điểm ồn |
| Stalker | Xuất hiện từ tầng 8 hoặc do lời nguyền; bám theo dấu vết (N vị trí gần nhất của người chơi); di chuyển mỗi 2 lượt một ô |

- Số quái mỗi tầng: `2 + floor(depth / 2)` `[TUNABLE]`.
- Va chạm: người chơi −1 HP, quái choáng 3 lượt, người chơi bất khả xâm phạm 2 lượt. HP khởi đầu 2; hết HP là chết.
- **Im lặng trước khi quái xuất hiện:** khi một quái chuyển sang CHASE, âm nền tắt trong 1 lượt rồi mới phát tiếng. Không có jumpscare.
- "Biến cố" (disturbance): mỗi bước có xác suất `dangerP(depth, dread) = min(0.6, 0.05 + 0.04*depth + 0.002*dread)` khiến một quái ngẫu nhiên chuyển SUSPICIOUS tại một điểm gần người chơi, kèm tín hiệu âm thanh và hình ảnh. `[TUNABLE]`

### 4.6 Vàng, rương nguyền, giao kèo
- `lootValue(depth) = round(10 * 1.3^(depth - 1))` (tầng 1 = 10, tầng 6 = 37, tầng 12 = 179).
- Mỗi tầng: 4–6 đống vàng giá trị `lootValue`; 1 kho báu hiếm ×4; 0–1 rương thường (3× `lootValue`).
- **Rương nguyền** (xuất hiện từ tầng 2, 50% mỗi tầng): giá trị ×1.5 so với rương thường, kèm **một trong 4 lời nguyền, xác suất đều 25%, danh sách xem được trong Sổ tay trước khi mở**:

| Lời nguyền | Hiệu ứng |
|---|---|
| Kẻ bám đuôi | Sinh một Stalker ở lối vào tầng |
| Mù loà | Bán kính sáng −1 đến hết run |
| Bước chân nặng | Tiếng ồn +50% đến hết run |
| Bóng tối đặt thuế | +20 Dread mỗi khi sang tầng mới |

- **Giao kèo với quỷ** (phòng sự kiện ở tầng chẵn 2, 4, 6, 8, 10): hiện 2 trong 8 giao kèo, **số liệu rõ ràng trước khi chọn**, được từ chối:

| # | Bạn trả | Bạn nhận |
|---|---|---|
| B1 | 30% dầu hiện có | 4× `lootValue` vàng |
| B2 | 1 HP (không xuống dưới 1) | +40 dầu |
| B3 | Bán kính sáng −1 đến hết run | 6× `lootValue` vàng |
| B4 | Tiếng ồn +30% đến hết run | 5× `lootValue` vàng |
| B5 | +25 Dread ngay | +30 dầu |
| B6 | 25% vàng đang mang | Dread −40 và lộ cầu thang tầng này |
| B7 | 20% vàng đang mang | +1 dây thừng |
| B8 | Một Stalker xuất hiện ở lối vào sau 20 lượt | 8× `lootValue` vàng |

### 4.7 Trạm thoát, dây thừng, chết
- Trạm thoát ở tầng 3, 6, 9: tương tác = **kết thúc run, gửi toàn bộ vàng đang mang**. Tầng 12 có lối ra cuối: gửi vàng ×1.25.
- Dây thừng (vật phẩm dùng một lần, từ tầng 2 trở đi): đứng yên 3 lượt rồi thoát tại chỗ; bị đánh trúng thì huỷ. Tiếng ồn khi đứng yên: 0.
- Chết: **mất vàng đang mang**, vàng đã gửi giữ nguyên. Không có cơ chế "an ủi" ẩn.

### 4.8 Nâng cấp lâu dài (meta) `[TUNABLE]`
| Nâng cấp | Hiệu ứng | Giá (từng cấp) |
|---|---|---|
| Dung tích đèn | +10 dầu tối đa, tối đa 5 cấp | 50, 100, 200, 400, 800 |
| Giày êm | Tiếng ồn −10%, tối đa 3 cấp | 80, 200, 500 |
| Dây thừng khởi đầu | Bắt đầu run với 1 dây | 150 |
| Thêm một trái tim | +1 HP khởi đầu | 300 |
| Bùa dò cầu thang | Lộ vị trí cầu thang khi vào tầng, 1 lần mỗi run | 250 |
| Bình dầu dự phòng | +1 bình dầu xuất hiện mỗi tầng chẵn | 350 |

### 4.9 Tấm gương
**Nhật ký quyết định** (ghi mỗi sự kiện): `depth`, `oilFrac`, `dread`, `hp`, `carriedGold`, `action`, `context`.

**Chỉ số thô mỗi run:**
- `pushedOnHighDread`: số lần xuống tầng khi Dread ≥ 70.
- `bypassedExit`: số lần đi qua trạm thoát mà không dùng, khi dầu còn ≥ 30%.
- `earlyExit`: số lần thoát khi dầu ≥ 50% và Dread < 40.
- `cursedAccepted`, `bargainsAccepted`, `bargainsDeclined`, `chestsSkipped`.
- `sneakRatio`: tỉ lệ bước rón rén.

```
greedRaw = 3*bypassedExit + 2*cursedAccepted + 1*bargainsAccepted + 2*pushedOnHighDread
fearRaw  = 3*earlyExit + 1*bargainsDeclined + 1*chestsSkipped + round(10*sneakRatio)
```

Hiển thị: hai thanh Tham/Sợ **so với trung bình 10 run gần nhất của chính người chơi**. Ba run đầu hiển thị "Đang hình thành đường cơ sở". Một câu nhận xét trung tính về hành vi, ví dụ "Lần này bạn dừng sớm hơn 2 tầng so với mức trung bình của bạn."

**Nguyên mẫu** (từ trung bình các run so với ngưỡng trong `mirror.json`, hiệu chỉnh bằng bot ở M7): Kẻ Đào Vàng (Tham cao, Sợ thấp), Người Giữ Lửa (Tham thấp, Sợ cao), Người Đi Trong Run Rẩy (cả hai cao), Kẻ Tính Toán (cả hai thấp). Luôn kèm dòng "Chỉ để giải trí, không phải đánh giá tâm lý."

**Luật lời văn:** mô tả hành vi trong run này, không gán nhãn con người ("Lần này bạn…" thay vì "Bạn là người tham"). Danh sách từ cấm (từ lâm sàng, từ phán xét) ở `banned-mirror-words.json`, có test chặn.

### 4.10 Xã hội
- **Xác người chơi khác:** mặc định chỉ là các lần chết trước đó **của chính bạn** trên cùng seed (LocalStore). Bản từ xa (M10) là tuỳ chọn.
- **Daily seed:** chung một hầm mỗi ngày (ngày UTC), bỏ lỡ không bị phạt.
- **Bảng xếp hạng người sống sót** (thoát thành công), không xếp theo vàng.

### 4.11 Hợp đồng đạo đức và tiếp cận `[LOCKED]`
1. Không tiền thật trong cơ chế may rủi; không loot box.
2. Mọi bảng ngẫu nhiên nằm trong JSON có trọng số rõ ràng; Sổ tay tự sinh từ chính JSON đó (có test).
3. Không gian lận cảm xúc: không "suýt trúng" giả, không phần thưởng ẩn, không đồng hồ ép, không streak phạt, không thông báo gây tội lỗi.
4. Hiệu ứng nháy, rung đều gắn với cài đặt "giảm nháy", "giảm rung"; không quá 3 lần nháy/giây (WCAG 2.3.1); không jumpscare.
5. Mọi tín hiệu âm thanh quan trọng có tín hiệu hình ảnh tương đương; không phân biệt vật phẩm bằng màu đơn thuần.
6. Nhắc nghỉ sau khoảng 45 phút chơi liên tục, tối đa mỗi giờ một lần, tắt được.
7. Telemetry chỉ khi người chơi đồng ý, ẩn danh, có nút xoá.

---

## 5. Lộ trình milestone M0–M11

Mỗi milestone chạy trong **một hội thoại riêng** (M2, M5, M7 có thể tách 2 hội thoại). Mã milestone dùng ở prompt 03.

### M0 — Khởi tạo (tuần 1)
- **Việc:** khởi tạo Vite + TypeScript + Phaser 3; script `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `check` (= typecheck + lint + test + build); khung thư mục §3; `Boot` vẽ chữ DEEPER ở 320×180 scale số nguyên; `palette.ts` 24 màu "DEEPER-24"; `docs/STATUS.md`; workflow CI chạy `npm run check`; `.gitignore` **không** chứa `.agents`.
- **Nghiệm thu:** `npm run check` xanh; canvas sắc nét, căn giữa, đúng tỉ lệ khi đổi cỡ cửa sổ; không có lỗi console.
- **Bạn kiểm tra:** duyệt bảng màu.

### M1 — Nền tảng engine (tuần 1–2)
- **Việc:** `Rng` (có `fork`), tiện ích lưới (hàng xóm, đường thẳng, BFS, khoảng cách), event bus có kiểu, tải i18n, `SaveStore` (version + migration + fallback), bộ nạp dữ liệu có kiểm tra cấu trúc cho `src/data/*.json`.
- **Nghiệm thu:** ≥ 15 test; cùng seed cho cùng dãy số; lưu rồi nạp lại đúng; dữ liệu sai cấu trúc báo lỗi rõ.

### M2 — Hầm và di chuyển (tuần 2–3)
- **Việc:** sinh map BSP có seed; tileset tạm sinh bằng code; di chuyển theo lưới (phím + vuốt); camera bám theo; `TurnResolver` khung; ánh sáng hình tròn có đường nhìn, bộ nhớ sương mù.
- **Nghiệm thu:** test 100 seed đều liên thông và cầu thang tới được; 60 FPS; đi vào tường không tốn lượt; cùng seed cho cùng map.

### M3 — Vòng lặp một run (tuần 3)
- **Việc:** đống vàng, vàng đang mang, xuống tầng (seed fork theo tầng), trạm thoát tầng 3/6/9, lối ra tầng 12, luật chết, scene tóm tắt run (tạm), gửi vàng vào kho, luồng Menu → Run → Tóm tắt, HUD tạm.
- **Nghiệm thu:** hoàn thành một run tới chết và một run tới thoát; vàng đã gửi còn sau khi tải lại trang.
- **Bạn kiểm tra:** chơi thử và cho biết cảm giác dừng/đi tiếp đã có chưa.

### M4 — Nỗi sợ I: dầu, Dread, âm thanh (tuần 4)
- **Việc:** dầu và bán kính sáng, ba kiểu di chuyển và phát tiếng ồn, thanh Dread với các ngưỡng, hậu kỳ (vignette, nhiễu, rung) có cài đặt, `AudioDirector` tổng hợp bằng WebAudio (tim đập, ambient, chime vàng), cài đặt giảm nháy/giảm rung/âm lượng, mở khoá audio sau thao tác đầu tiên.
- **Nghiệm thu:** test công thức dầu và Dread khớp §4; nhịp tim ánh xạ theo Dread; bật "giảm rung" thì không rung; có tín hiệu hình ảnh cho mỗi âm thanh cảnh báo.

### M5 — Nỗi sợ II: quái và ảo giác (tuần 5)
- **Việc:** Crawler, Listener, Stalker với máy trạng thái; lan truyền ồn theo đường đi; hú; ảo giác; HP và va chạm; bảng sinh quái theo độ sâu; "im lặng trước khi xuất hiện".
- **Nghiệm thu:** test chuyển trạng thái đầy đủ; test ồn bị tường chặn; quái giả không gây sát thương; kết quả xác định theo seed.
- **Bạn kiểm tra:** mời 5 người chơi thử (playtest vòng 1). Câu hỏi: "Khoảnh khắc nào bạn do dự nhất?", "Có chỗ nào thấy bất công không?"

### M6 — Lòng tham I: giá trị, rương nguyền, giao kèo (tuần 6)
- **Việc:** đường cong `lootValue`, đặt vật phẩm, rương nguyền với bảng lời nguyền, 8 giao kèo có hộp thoại hiển thị số, Sổ tay (Codex) tự sinh từ JSON, biến cố nguy hiểm.
- **Nghiệm thu:** test Sổ tay sinh đúng từ dữ liệu; 10.000 lần quay lời nguyền nằm trong ±2% của 25% mỗi loại; mọi giao kèo hiển thị đủ số trước khi chọn.

### M7 — Lòng tham II, meta và cân bằng (tuần 7)
- **Việc:** cửa hàng và 6 nâng cấp, dây thừng, sổ vàng, `scripts/balance-sim.ts` với 3 chính sách bot (thận trọng, tham lam, hỗn hợp), hiệu chỉnh, ghi `docs/BALANCE_LOG.md`.
- **Nghiệm thu (mục tiêu cân bằng, chỉnh qua JSON):** chính sách hỗn hợp có 55–65% run đầu kết thúc bằng chết; bot tham lam chết ≥ 80%; bot thận trọng thoát ≥ 70% nhưng vàng kỳ vọng thấp hơn; **không chính sách nào cho vàng kỳ vọng > 1.5× chính sách hỗn hợp** (không có chiến lược thống trị); run thứ 5 khác run thứ 1 nhờ nâng cấp.

### M8 — Tấm gương và hướng dẫn (tuần 8)
- **Việc:** ghi nhật ký quyết định, tính chỉ số, scene Tấm gương (hai thanh so với trung bình cá nhân, câu nhận xét, nguyên mẫu), xuất ảnh chia sẻ bằng canvas (không gửi mạng), hướng dẫn 3 phút trên một tầng viết sẵn (bỏ qua được).
- **Nghiệm thu:** test chỉ số với nhật ký mẫu; test từ cấm; ba run đầu hiển thị trạng thái "đang hình thành"; hướng dẫn bỏ qua được và hoàn thành được.

### M9 — Nội dung, nghệ thuật, cảm giác chơi, cảm ứng (tuần 9–10)
- **Việc:** 3 biome theo dữ liệu với đổi palette; ≥ 10 sự kiện phụ (có sự kiện "Bản tin vọng lại" gây Dread nhẹ); hitstop, rung (theo cài đặt), hạt vàng có giới hạn; điều khiển cảm ứng (vuốt + nút ảo + nút kiểu di chuyển); scene Cài đặt (âm lượng, giảm nháy, giảm rung, tương phản cao, ngôn ngữ); thay tài sản tạm bằng tài sản thật nếu bạn cung cấp (cùng khoá, cùng kích thước).
- **Nghiệm thu:** chơi được ở khung 360×640; không phụ thuộc màu đơn thuần để phân biệt vàng và nguy hiểm; tải < 3 giây trong giả lập 4G; đủ chuỗi `vi` và `en` (test).
- **Bạn kiểm tra:** đưa sprite/tile thật (nếu có) vào thư mục tài sản theo manifest.

### M10 — Xã hội và đồng ý dữ liệu (tuần 11)
- **Việc:** `RemoteStore` + `LocalStore`; xác (các lần chết cũ của bạn); daily seed UTC; bảng xếp hạng người sống sót (cục bộ, từ xa tuỳ chọn); nhắc nghỉ; màn đồng ý telemetry và nút xoá dữ liệu; adapter Supabase tuỳ chọn đọc khoá từ biến môi trường, tắt tự động nếu thiếu khoá.
- **Nghiệm thu:** ngắt mạng vẫn chơi được toàn bộ; adapter có test với bản giả; tài liệu cấu trúc dữ liệu gửi đi (ẩn danh) trong `docs/`.
- **Bạn kiểm tra:** tạo dự án Supabase và đặt khoá vào `.env` (không commit); xem lại câu chữ màn đồng ý.

### M11 — QA và phát hành (tuần 12)
- **Việc:** chạy mô phỏng cân bằng lần cuối; kiểm tra khói tự động; tối ưu (phân tích gói, 4× throttle CPU vẫn ~60 FPS); kiểm tra tiếp cận và i18n; `README` (vi/en), `CREDITS.md`, `LICENSE`; lệnh `npm run package` tạo zip HTML5 cho itch.io; danh sách kiểm tra phát hành.
- **Nghiệm thu:** mọi cổng §7 đạt; zip < 5 MB; walkthrough kèm ảnh chụp.
- **Bạn kiểm tra:** playtest vòng 2 (8–10 người), tải lên itch.io.

---

## 6. Quy trình làm việc với Antigravity

**Chuẩn bị (một lần):**
1. Tạo repo rỗng, đặt `01_IMPLEMENTATION_PLAN.md` thành `docs/IMPLEMENTATION_PLAN.md`, commit.
2. Mở thư mục trong Antigravity, chọn model **Gemini 3.8 Flash**.
3. Đặt chính sách chạy lệnh terminal ở mức cần bạn duyệt (nếu IDE cho cấu hình), ít nhất trong các milestone đầu.
4. Chạy `02_PROMPT_CREATE_SKILLS.md`. Đọc `docs/SKILLS_AUDIT.md` rồi duyệt.
5. Chạy `02B_PROMPT_CREATE_QUALITY_SKILLS.md` trong hội thoại mới (effort high). Đọc phần mới của `docs/SKILLS_AUDIT.md`, chạy `node scripts/check-skill-yaml.mjs`, rồi duyệt.
6. **Không** thêm `.agents/` vào `.gitignore` (Antigravity sẽ không đánh chỉ mục).

**Mỗi milestone:**
1. Mở **hội thoại mới**. Dán prompt master từ `03_PROMPT_IMPLEMENT.md` với mã milestone.
2. Agent viết kế hoạch (artifact) giới hạn trong milestone, rồi **dừng**. Bạn đọc, góp ý, gõ `APPROVED`.
3. Agent code, test, chạy kiểm tra, mở trình duyệt chụp màn hình, tự review bằng `/deeper-code-review`, cập nhật `docs/STATUS.md`, tạo walkthrough, rồi **dừng**.
4. Bạn chơi thử, duyệt walkthrough, merge nhánh `milestone/Mx`. Chỉ khi đó mở milestone tiếp.

**Về Gemini 3.8 Flash:** theo mô tả của Google, model này "làm việc chăm hơn": thêm bước suy luận, gọi công cụ lặp lại, tốn nhiều token hơn 3.7 Flash, và có mức effort chỉnh được (low, medium, high). Vì vậy prompt có ba hàng rào: phạm vi chặt, điểm dừng bắt buộc, quy tắc "đừng suy nghĩ quá mức cho việc nhỏ". Nếu IDE cho chọn effort:

| Milestone | Gợi ý effort |
|---|---|
| M0, M1, M3, M9 | medium |
| M2, M5, M7, M11 | high |
| M4, M6, M8, M10 | medium, nâng lên high khi agent bắt đầu sai |

**Vệ sinh ngữ cảnh:** giữ mỗi hội thoại ngắn để ít bị nén. Mọi thứ cần sống qua hội thoại phải nằm trong repo (`docs/STATUS.md`, `DECISIONS.md`, walkthrough), không nằm trong trí nhớ hội thoại. Khi gần đầy ngữ cảnh, agent báo bạn mở hội thoại mới và ghi sẵn ghi chú bàn giao.

**Git:** một nhánh mỗi milestone, commit theo từng bước nhỏ, tên commit kiểu `feat(core): ...`, `test(fear): ...`, `docs(status): ...`.

**Lưu ý đã kiểm tra (tháng 10–11/2026, nguồn thứ ba):** skill nằm ở `.agents/skills/<tên>/SKILL.md`; luật luôn bật ở `AGENTS.md`; luật theo ngữ cảnh ở `.agents/rules/*.md` cần `trigger` hợp lệ (`always_on`, `model_decision`, `glob`, `manual`), sai tên sẽ bị bỏ qua im lặng; workflow cũ trong `.agents/workflows/` đã ngừng hoạt động từ 19/10/2026. Giao diện sản phẩm có thể đã đổi; nếu tài liệu chính thức của Antigravity khác, làm theo tài liệu chính thức và ghi vào `DECISIONS.md`.

---

## 7. Định nghĩa hoàn thành (DoD) và kiểm chứng

Một milestone chỉ "xong" khi **tất cả** đúng:
1. `npm run check` xanh (typecheck, lint, test, build).
2. Có test cho mọi công thức và mọi bảng ngẫu nhiên mới; logic trong `src/core` không import Phaser.
3. **Kiểm tra khói bằng trình duyệt:** khởi động dev server, mở trang, bắt đầu run, đi ≥ 20 bước, chụp màn hình, không có lỗi console.
4. Với milestone từ M4 trở đi: chạy lại `balance-sim` và ghi kết quả vào `docs/BALANCE_LOG.md`.
5. `docs/STATUS.md` cập nhật (đã làm, lỗi biết trước, việc tiếp theo); mọi sai khác so với kế hoạch ghi ở `docs/DECISIONS.md`.
6. Không có mục `[LOCKED]` bị đổi khi chưa hỏi; tuân thủ hợp đồng §4.11.
7. Có walkthrough (artifact) tóm tắt thay đổi, cách kiểm thử, ảnh chụp.
8. Đã tự review bằng `/deeper-code-review` (chế độ tự rà soát): quét cơ học không còn ERROR chưa giải thích, không còn BLOCKER hay MAJOR; phán quyết và các mục còn lại nằm trong walkthrough.

**Cổng phát hành (M11):** gói ≤ 5 MB; tải < 3 giây ở 4G giả lập; ~60 FPS khi CPU bị làm chậm 4×; chơi được ở 360×640; `vi` và `en` đủ chuỗi; mọi hiệu ứng nháy/rung tắt được; ngắt mạng vẫn chơi được; `CREDITS.md` đủ nguồn.

---

## 8. Mẫu tài liệu theo dõi (agent tạo ở prompt 02)

**`docs/STATUS.md`**
```
# DEEPER — Status
Last updated: YYYY-MM-DD · Current milestone: Mx

| Milestone | State (todo/doing/review/done) | Branch | Notes |
|---|---|---|---|
| M0 | todo | milestone/M0 | |
...
## Known issues
## Open questions for the owner (max 5)
## Handoff notes for the next conversation
```

**`docs/DECISIONS.md`:** mỗi mục: ngày, milestone, quyết định, lý do, phương án đã loại, ai duyệt.

**`docs/BALANCE_LOG.md`:** mỗi mục: ngày, milestone, thay đổi số liệu (file, trường, cũ → mới), kết quả mô phỏng (tỉ lệ chết, độ sâu trung bình, vàng kỳ vọng theo chính sách), nhận xét.

---

## 9. Rủi ro khi giao cho agent Flash và cách giảm

| Rủi ro | Giảm thiểu |
|---|---|
| Làm lan ra ngoài phạm vi, refactor không ai nhờ | "Scope fence" trong prompt; kế hoạch artifact phải liệt kê file sẽ đụng; đề xuất ngoài phạm vi chỉ được ghi vào STATUS |
| Bịa API Phaser | Bắt buộc đọc kiểu trong `node_modules/phaser/types` khi không chắc; không dùng API không tìm thấy |
| Suy luận quá nhiều cho việc nhỏ, tốn token | Luật "quyết nhanh, chọn phương án đơn giản hơn khi ngang nhau, ghi DECISIONS" |
| Tự ý đổi số liệu hoặc luật đạo đức | `[LOCKED]`; test Sổ tay sinh từ JSON; rule `ethics-guardrails` luôn bật |
| Logic dính vào Phaser, khó test | `src/core` không import Phaser; có lint chặn |
| Ngữ cảnh phình, quên quyết định cũ | Một milestone một hội thoại; trạng thái ghi trong repo |
| Cân bằng bằng cảm tính | Bot mô phỏng + mục tiêu số ở M7; mọi chỉnh số ghi BALANCE_LOG |
| Tài sản vi phạm bản quyền | Chỉ tự sinh hoặc có giấy phép ghi `CREDITS.md` |
| Lỗi chỉ lộ ở trình duyệt thật | Kiểm tra khói bắt buộc ở mọi milestone, có ảnh chụp |
| Code ẩu: API bịa, báo "xong" khi chưa chạy lệnh, sửa test cho qua | Skill `deeper-reliable-coding`, `deeper-debug`, `deeper-code-review`; quét cơ học `mechanical-review.mjs`; chỉ báo kết quả từ lệnh đã chạy |
| UI đọc không nổi (320×180, 360×640), mất dấu tiếng Việt, nút chạm nhỏ | Skill `deeper-ui-ux-design`, checklist UI, chụp màn hình ở 3 khung |

---

## 10. Lịch tuần ↔ milestone

| Tuần | Milestone | Việc của bạn |
|---|---|---|
| 0 (trước tuần 1) | Giai đoạn kiểm chứng: prototype giấy, landing page, khảo sát | Chạy kiểm chứng theo tài liệu phân tích; chỉ tiếp tục nếu đạt tiêu chí |
| 1 | Chạy prompt 02 và 02B, M0, bắt đầu M1 | Duyệt SKILLS_AUDIT, duyệt bảng màu |
| 2–3 | M1 xong, M2, M3 | Chơi thử bản đầu |
| 4–5 | M4, M5 | Playtest vòng 1 (5 người) |
| 6–7 | M6, M7 | Xem BALANCE_LOG, chốt độ khó |
| 8 | M8 | Duyệt câu chữ Tấm gương |
| 9–10 | M9 | Đưa tài sản đồ hoạ/âm thanh thật (nếu có) |
| 11 | M10 | Tạo Supabase, duyệt màn đồng ý dữ liệu |
| 12 | M11 | Playtest vòng 2, phát hành |
