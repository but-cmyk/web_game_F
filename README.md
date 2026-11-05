# DEEPER (LÒNG ĐẤT SÂU)

[![Build & Test Status](https://img.shields.io/badge/checks-passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Bundle Size](https://img.shields.io/badge/bundle-<400KB-blue.svg)]()

> *Càng đào sâu, kho báu càng rực rỡ — nhưng ánh đèn dần lụi tàn và bóng tối bắt đầu lắng nghe.*

**DEEPER** là tựa game roguelike nền web đồ họa pixel-art 2D (xây dựng bằng Phaser 3, TypeScript và Vite). Trò chơi khai thác căng thẳng tâm lý giữa **Nỗi Sợ (Fear)** và **Lòng Tham (Greed)** qua cơ chế "thử vận may" (push-your-luck) trong hầm ngục tăm tối.

---

## 🎮 Cách Chơi & Điều Khiển (How to Play & Controls)

### Bàn Phím (Keyboard)
| Phím (Key) | Hành Động (Action) |
|---|---|
| `W / A / S / D` hoặc `Mũi Tên` | Di chuyển 4 hướng (Move North / South / East / West) |
| `Z` | Chế độ **Rón Rén (Sneak)**: Giảm 60% tiếng ồn, tiêu hao 1.5× dầu đèn |
| `X` | Chế độ **Đi Bộ (Walk)**: Tốc độ và tiếng ồn tiêu chuẩn |
| `C` | Chế độ **Chạy (Run)**: Phát ra tiếng ồn lớn, thu hút quái vật từ xa |
| `Space / Enter` | Đi xuống tầng tiếp theo (tại cầu thang) hoặc Rút lui & Gửi vàng (tại trạm khai thác) |
| `R` | Kích hoạt Dây thừng thoát hiểm (Escape Rope) |
| `D` | Bắt đầu **Hầm Hằng Ngày (Daily Delve)** với seed cố định theo ngày UTC |
| `L` | Mở **Bảng Danh Dự Sống Sót (Survivor Leaderboard)** |
| `M` | Mở **Tấm Gương Tâm Lý (The Mirror)** xem phân tích phong cách chơi |
| `C` (ở Menu) | Mở **Điển Tịch Tỷ Lệ (Codex of Odds)** xem tỉ lệ minh bạch 100% |
| `S` (ở Menu) | Mở **Cửa Hàng Nâng Cấp (Shop)** sử dụng vàng đã gửi an toàn |
| `O` (ở Menu) | Mở **Cài Đặt (Settings)** âm lượng, tiếp cận, và an toàn hình ảnh |
| `ESC` | Đóng bảng hội thoại / Trở về màn hình trước |

### Cảm Ứng & Di Động (Virtual Touch Controls)
- Cụm điều hướng ảo (Virtual D-pad) 4 nút ở góc dưới bên trái màn hình.
- Các nút chuyển chế độ di chuyển (Rón rén, Đi bộ, Chạy) và nút dùng Dây thừng ở góc dưới bên phải.
- Hoạt động mượt mà trên màn hình di động độ phân giải $360 \times 640$.

---

## 🕯️ Các Cơ Chế Cốt Lõi (Core Mechanics)

1. **Đèn Dầu & Tầm Nhìn (Oil Lamp & Fog of War)**:
   - Dầu đèn cạn dần theo từng bước đi. Khi dầu giảm, bán kính ánh sáng thu hẹp lại.
   - Khi đèn tắt hoàn toàn: Chỉ số **Kinh hoàng (Dread)** tăng vọt, ảo ảnh bóng ma xuất hiện dày đặc.
2. **Kinh Hoàng & Ảo Giác (Dread & Hallucinations)**:
   - Khi Kinh hoàng vượt qua các ngưỡng 40, 70, 90: nhịp tim đập dồn dập, màn hình rung lắc, bóng ma chập chờn bám đuổi.
3. **Tiếng Ồn & Quái Vật (Noise Waves & Monster AI)**:
   - Mỗi bước chân lan truyền sóng âm thanh qua thuật toán BFS.
   - **Bò Sát (Crawler)**: Lần theo tiếng động dọc hành lang.
   - **Kẻ Lắng Nghe (Listener)**: Đứng yên như tượng đá, hú vang dội kích động toàn bộ quái vật khi nghe thấy tiếng ồn.
   - **Kẻ Bám Đuôi (Stalker)**: Ma quái xuyên tường, kiên trì săn lùng kẻ thèm khát kho báu.
4. **Kho Báu & Rủi Ro (Loot & Curses)**:
   - Càng xuống tầng sâu, vàng càng nhiều.
   - **Rương Nguyền Rủa (Cursed Chests)**: Cho lượng vàng khổng lồ nhưng mang lại lời nguyền vĩnh viễn (giảm tầm nhìn, bước chân vang dội).
   - **Bàn Thờ Quỷ Dữ (Devil's Bargains)**: Đánh đổi máu, tầm nhìn hoặc dầu lấy các bội số vàng cực lớn ($4.0\times - 8.0\times$).
5. **Rút Lui An Toàn hay Liều Mạng? (Push-Your-Luck Extraction)**:
   - Trạm Khai Thác xuất hiện ở các tầng chẵn (Tầng 2, 4, 6...). Người chơi có thể rút lui để gửi toàn bộ số vàng tích lũy vào Kho Báu.
   - Nếu chết trong hầm ngục: **Mất toàn bộ số vàng đang mang trên người**.
6. **Thu Hồi Thi Thể (Social Corpse Retrieval)**:
   - Khi chết, vị trí ngã xuống sẽ để lại thi thể chứa 50% số vàng bị rơi. Người chơi có thể quay lại tầng đó ở lượt chơi sau để nhặt lại!
7. **Tấm Gương Tâm Lý (The Psychological Mirror)**:
   - Sau mỗi chuyến đi, hệ thống phân tích quyết định của bạn để phân loại bản thiết kế tâm lý: *Người Nhặt Vụn Cẩn Trọng, Kẻ Liều Mạng Vô Cảm, Bóng Ma Tự Tin...*
   - Xuất thẻ chia sẻ đồ họa pixel độc đáo lưu trực tiếp về máy.

---

## 🛡️ Cam Kết Đạo Đức & Quyền Riêng Tư (Ethical Contract)

- **100% Không Tiền Thật / Loot Box**: Không có giao dịch vi mô, không có vật phẩm tiền tệ ảo trả phí.
- **Tỷ Lệ Rơi Minh Bạch**: Mọi bảng xác suất đều lưu công khai trong `src/data/*.json` và xem được trực tiếp trong Điển Tịch (Codex).
- **Không Giữ Chân Thao Túng (No Dark Patterns)**: Không có chuỗi ngày (streak), không phạt mất chuỗi, không thông báo thúc ép.
- **An Toàn Thị Giác (WCAG 2.3.1)**: Mọi hiệu ứng chớp nháy và rung lắc đều có thể tắt độc lập trong Cài Đặt. Không có jumpscare.
- **Nhắc Nghỉ 45 Phút**: Hệ thống tự động nhắc nhở người chơi thư giãn mắt và tinh thần sau 45 phút chơi liên tục.
- **Bảo Mật & Xóa Dữ Liệu**: Thu thập phân tích ẩn danh hoàn toàn là Opt-In, không lưu bất kỳ thông tin cá nhân (PII), có nút **[XÓA TOÀN BỘ DỮ LIỆU]** xóa sạch trong 1 click.

---

## 🛠️ Cài Đặt & Phát Triển (Development & Build)

### Yêu Cầu (Requirements)
- Node.js $\ge$ 18.0.0
- npm $\ge$ 9.0.0

### Các Lệnh Chính (Scripts)
```bash
# Cài đặt thư viện
npm install

# Khởi động server phát triển tại http://localhost:3000
npm run dev

# Kiểm tra toàn diện (Typecheck + Lint + Tests + Build)
npm run check

# Chạy toàn bộ unit & integration tests (Vitest)
npm run test

# Chạy mô phỏng cân bằng kinh tế Monte Carlo (1,000 lượt)
npm run sim -- --runs 1000 --policy all

# Đóng gói bản phát hành HTML5 cho itch.io (File zip <= 5 MB)
npm run package
```

---

## 🏛️ Kiến Trúc Hệ Thống (Architecture)

```
src/
├── core/        # Pure TypeScript game logic (Rng, grid, mapgen, turn, monsters, loot, mirror)
│                # ZERO Phaser imports, ZERO Math.random, determinism 100%
├── scenes/      # Phaser 3 Scene Layer (Boot, Menu, Run, Summary, Codex, Shop, Mirror, Tutorial, Settings, Leaderboard)
├── views/       # Presentation Layer (DungeonRenderer, PostFX lighting, TouchControls)
├── services/    # Storage abstraction (SaveStore, LocalRemoteStore, SupabaseRemoteStore)
├── audio/       # WebAudio AudioDirector (procedural SFX & heartbeat synthesis)
├── data/        # Balancing JSON data (loot, monsters, bargains, curses, upgrades, events)
└── i18n/        # Bilingual localization (vi.json, en.json)
```

---

## 📜 Bản Quyền & Giấy Phép (License & Credits)

- Phát hành theo giấy phép [MIT License](./LICENSE).
- Tham khảo chi tiết ghi công tại [CREDITS.md](./CREDITS.md).
