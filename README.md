# ⚡ Bolt Token Saver

## 🤖 Nhờ AI tự cài đặt cho bạn (Claude Code / Codex)

**Chỉ cần gửi [link này](https://github.com/0xmarkhydra/bolt-token-saver/blob/main/AI_SETUP.md) cho AI đang chạy trên máy của bạn**, kèm yêu cầu:

```text
Đọc https://github.com/0xmarkhydra/bolt-token-saver/blob/main/AI_SETUP.md
và tự setup các công cụ tối ưu token cho Claude Code/Codex tôi đang dùng.
Hãy kiểm tra hệ điều hành và cấu hình có sẵn, đề xuất RTK + Ponytail.
Cho tôi xem kế hoạch và xin xác nhận trước khi cài hoặc sửa cấu hình.
Sau khi thực hiện, kiểm tra kết quả và chỉ báo những gì đã xác minh.
Không hiển thị API key hay URL endpoint riêng tư.
```

AI có quyền dùng terminal (Claude Code/Codex CLI/CodeLocal) có thể thực hiện sau khi được bạn đồng ý. AI chỉ có quyền đọc web thì **không thể tự cài**. [Quy trình đầy đủ cho AI →](AI_SETUP.md)


**Một công cụ Terminal UI dễ sử dụng để thiết lập tối ưu token cho Claude Code và Codex.**

Không cần biết lập trình: mở lên, xem máy có gì, chọn công cụ, xác nhận — Bolt Token Saver sẽ tự làm theo các bước đã hiển thị.

**Hỗ trợ:** Windows · macOS · Linux | **Phiên bản:** 0.5.4

## 🧩 Ponytail: 6 skill cho Claude Code và Codex

**Một lần cài plugin cho mỗi agent**, tự đi kèm cả 6 skill: `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`. Không cần cài từng skill và không tự động chép skill sang agent khác.

- Vào **Cài đặt tối ưu token**, chọn Claude Code, Codex hoặc cả hai; bật Ponytail. Xem trước lệnh và **xác nhận** trước khi chương trình cài.
- Vào **Ponytail Skills · Claude / Codex** (mục 3) để xem từng skill và lệnh dùng đúng trên mỗi agent.
- Chạy `node src/cli.mjs --ponytail` hoặc `npm run ponytail` để kiểm tra trạng thái chỉ đọc, không gọi AI và không cài plugin.
- Sau khi cài, **khởi động lại** Claude/Codex; với Codex mở `/hooks` xem và chỉ tin cậy hook đã kiểm tra.

| Skill | Claude Code | Codex |
|---|---|---|
| Tối giản code | `/ponytail` | `$ponytail:ponytail` |
| Review diff | `/ponytail-review` | `$ponytail:ponytail-review` |
| Audit repo | `/ponytail-audit` | `$ponytail:ponytail-audit` |
| Theo dõi nợ kỹ thuật | `/ponytail-debt` | `$ponytail:ponytail-debt` |
| Thống kê benchmark | `/ponytail-gain` | `$ponytail:ponytail-gain` |
| Hướng dẫn | `/ponytail-help` | `$ponytail:ponytail-help` |

**Lưu ý trạng thái:** `6/6` có nghĩa đã tìm thấy đủ sáu file `SKILL.md` trong các vị trí cài đặt được hỗ trợ, **không phải** bằng chứng hook đã kích hoạt hoặc AI đang làm theo skill. Nếu chỉ có plugin registry nhưng thiếu tệp, TUI sẽ không hiển thị đã xác minh đủ. Kết quả của `ponytail-gain` là benchmark do tác giả công bố, không phải % tiết kiệm trên thiết bị của bạn.

Cách cài thủ công chính thức:
```bash
# Claude Code (hai lệnh riêng)
claude plugin marketplace add DietrichGebert/ponytail
claude plugin install ponytail@ponytail

# OpenAI Codex
codex plugin marketplace add DietrichGebert/ponytail
codex plugin add ponytail@ponytail
```

Nguồn: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) · [Tài liệu cài đặt](https://github.com/DietrichGebert/ponytail/blob/main/INSTALL.md).

## 🔎 Khắc phục trường hợp Headroom / Caveman vẫn màu vàng (v0.5.3)

Mục **Công cụ tối ưu** là trạng thái nhận diện, không phải xác nhận tool đang hoạt động.

- **Headroom**: chương trình tìm lệnh `headroom` trong PATH **và** kiểm tra
  `uv tool list` (chỉ đọc). Nếu đã cài qua uv nhưng VS Code chưa nhận PATH,
  Dashboard có thể hiện **✓ Đã nhận diện cài đặt**, đồng thời nhắc chạy
  `uv tool update-shell` rồi mở lại terminal/VS Code. Headroom vẫn cần
  chạy qua `BOLT-CLAUDE.cmd` / `BOLT-CODEX.cmd` để proxy được sử dụng.
- **Caveman**: tìm trong `installed_plugins.json`, đường dẫn SKILL.md
  của Claude/Codex và trạng thái `enabledPlugins` của Claude.
  Nếu chỉ thấy cờ bật nhưng chưa thấy plugin thực sự, màu vàng sẽ ghi
  **◐ Đã bật theo config · Chưa xác minh cài** (không đánh dấu xanh giả).

Để tự kiểm tra trên Windows PowerShell, sau khi đóng TUI:

```powershell
claude plugin list
uv tool list
Get-Command headroom -ErrorAction SilentlyContinue
```

Nếu `uv` không tồn tại, lệnh tương ứng sẽ báo không tìm thấy; khi đó **chưa đủ bằng chứng** rằng Headroom đã được cài.
Đừng cài lại khi chưa kiểm tra danh sách plugin/uv. Không đưa API key hoặc endpoint riêng tư vào ảnh chụp màn hình.

## 🪟 Windows: RTK không cần WinGet (v0.5.1)

Nếu chương trình báo **`Missing: winget`** khi cài RTK, hãy dùng phiên bản mới rồi chọn lại RTK.
Trên Windows x64, Bolt Token Saver có đường cài dự phòng không cần WinGet: tải
`rtk-x86_64-pc-windows-msvc.zip` từ **GitHub Releases chính thức** của
`rtk-ai/rtk`, xác minh **SHA-256** theo GitHub Release API, giải nén
`rtk.exe` vào `%USERPROFILE%\.local\bin`, và thêm thư mục này vào **User PATH**
(không cần quyền Administrator). Đóng/mở lại terminal sau cài.

Nếu máy sử dụng **Windows ARM64**, đường cài dự phòng x64 không chạy; hãy
kiểm tra tùy chọn chính thức từ [RTK Releases](https://github.com/rtk-ai/rtk/releases).
Nếu Windows PowerShell hoặc cập nhật User PATH bị chặn bởi chính sách công ty,
chương trình sẽ báo lỗi; không tự thay đổi chính sách bảo mật.

## 🚀 Chạy bằng một lệnh

Yêu cầu **Node.js 20+ và Git**. Trong Terminal trên Windows, macOS hoặc Linux, chạy:

```bash
npx -y github:0xmarkhydra/bolt-token-saver
```

- Nếu PowerShell chặn `npx.ps1`: dùng `npx.cmd -y github:0xmarkhydra/bolt-token-saver`.
- Với npm 12+ khi gặp lỗi `EALLOWGIT`: `npx --allow-git=root -y github:0xmarkhydra/bolt-token-saver`.
- Không muốn dùng Git CLI: tải ZIP repo, giải nén, chạy `RUN-WINDOWS.cmd` (Windows) hoặc `bash run-macos-linux.sh` (macOS/Linux). Trên Windows, file CMD có thể đề nghị cài Node LTS qua WinGet.
- **Chưa xuất bản lên npm registry**: hiện chưa thể dùng `npx bolt-token-saver` trực tiếp.

## ✨ Giao diện v0.5.4

```text
╭───────────────────────────────────────────────────╮
│ ⚡ BOLT TOKEN SAVER · v0.5.4                     │
╰───────────────────────────────────────────────────╯
 BẢNG ĐIỀU KHIỂN — Windows / macOS / Linux

 TRỢ LÝ LẬP TRÌNH
   Claude Code     ✓ Đã nhận diện
   OpenAI Codex    ✓ Đã nhận diện

 CÔNG CỤ TỐI ƯU
   RTK             ○ Chưa xác nhận cài đặt
   Headroom        ○ Chưa xác nhận cài đặt
   Caveman         ○ Chưa xác nhận cài đặt
   Ponytail        ○ Chưa xác nhận cài đặt

 PONYTAIL · 6 SKILLS (tệp được tìm thấy)
   Claude 0/6  ·  Codex 0/6

 BẠN MUỐN LÀM GÌ?
 ❯ 1. Cài đặt tối ưu token
   2. Khám phá & cài thêm AI Skills
   3. Ponytail Skills · Claude / Codex
   4. Xem trạng thái & cấu hình
   5. Hướng dẫn sử dụng
   6. Thoát

 ↑ ↓ Di chuyển     Enter Chọn     Q Thoát
```

### 1. Cài đặt tối ưu token

1. Chọn **Claude Code**, **Codex** hoặc cả hai (tự nhận diện agent có sẵn).
2. Chọn công cụ. Mặc định gợi ý **RTK + Ponytail**; Caveman và Headroom là lựa chọn bổ sung.
3. Xem bản tóm tắt trước khi cài. Nhấn **D** để xem lệnh kỹ thuật nếu muốn.
4. Di chuyển đến **ĐỒNG Ý** để bắt đầu. Cấu hình cũ được sao lưu trước khi thay đổi.
5. Xem kết quả từng bước, sau đó quay về Dashboard.

**Không tự cài khi chỉ mở TUI hoặc khi đang xem cấu hình.**

### Trạng thái cài đặt AI Skills — v0.5.2

Sau khi cài AI Skill, Dashboard sẽ tự đọc lại danh sách plugin Claude Code
(`~/.claude/plugins/installed_plugins.json`, `enabledPlugins` trong settings)
và một số đường dẫn `SKILL.md` thông dụng của Claude/Codex.
Nếu tìm thấy, Dashboard và danh mục AI Skills hiển thị **✓ Đã cài**
hoặc **✓ Đã bật (Claude)**. Nếu chưa có dữ liệu xác minh, hiển thị
**○ Chưa xác minh** — không tự suy ra cài đặt thất bại.

**Ví dụ UI UX Pro Max:** nếu Claude báo "plugin ... already installed",
Bolt sẽ nhận diện bằng registry plugin khi quay về Dashboard.
Các dấu hiệu này **không** chứng minh hook/skill đang hoạt động trong mọi phiên.
Nếu chưa thấy tích xanh, thử khởi động lại Claude/terminal, kiểm tra đúng
profile Claude đang dùng, rồi thử lại. Không cần cài lại plugin ngay.

### 4. Xem trạng thái & cấu hình

Màn hình chỉ đọc, gồm:

- Phát hiện Claude/Codex đã cài hay chưa.
- Tệp cấu hình có tồn tại không.
- Model đang thiết lập (khi nhận diện được tên model an toàn).
- Có sử dụng endpoint tùy chỉnh hay không (**không hiện URL**).
- Có dấu hiệu cấu hình khóa truy cập hay không (**không hiện API key/token**).
- RTK hook và Caveman/Ponytail plugin/skill có dấu hiệu xuất hiện trong config hay không.

Đây là **phát hiện bằng CLI và tệp cấu hình**, không phải kiểm tra live rằng hook hoạt động hay lượng token đã giảm. Headroom chỉ chạy khi bạn dùng launcher riêng.

### 5. Hướng dẫn sử dụng

Phím tắt: **↑/↓** di chuyển, **Space** tích/bỏ chọn, **Enter** tiếp tục, **Esc** quay lại, **Q** thoát.

### 2. Khám phá & cài thêm AI Skills

Gồm **10 dự án trong bảng xếp hạng**, hiển thị thành hai trang (mỗi trang 5 dự án).
Chọn một mục để xem tác dụng, Claude/Codex có hỗ trợ không, nguồn GitHub và cảnh báo trước khi chọn cài.

- **Ponytail, Caveman**: đã ở mục tối ưu token, không cài lại từ catalog.
- **Awesome Claude Skills**: chỉ là danh sách tổng hợp, không tự cài cả thư viện.
- **Superpowers và Understand Anything trên Codex**: hướng dẫn cài thủ công từ phương thức chính thức; không tự chạy shell script từ mạng.
- Những skill còn lại: có kế hoạch cài riêng theo agent được chọn, luôn xác nhận trước khi chạy.

Các skill mở rộng **không được chọn mặc định**; thêm skill không đồng nghĩa giảm token.

[**Xem bảng 10 repo, khả năng tương thích và các giới hạn →**](docs/SKILL-CATALOG.md)

## Công cụ

| Tool | Chức năng | Ghi chú |
|---|---|---|
| [RTK](https://github.com/rtk-ai/rtk) | Nén output lệnh terminal | Cần hook cho agent |
| [Ponytail](https://github.com/DietrichGebert/ponytail) | Giảm overengineering, viết code gọn | Đề xuất mặc định |
| [Caveman](https://github.com/JuliusBrussee/caveman) | Giảm verbosity | Tùy chọn |
| [Headroom](https://github.com/chopratejas/headroom) | Context/proxy optimization | Tùy chọn nâng cao, cần launcher |

## Chạy agent qua Headroom

Sau khi cài Headroom thành công:

- **Windows:** `BOLT-CLAUDE.cmd` hoặc `BOLT-CODEX.cmd`.
- **macOS / Linux:** `bash bolt-claude.sh` hoặc `bash bolt-codex.sh`.

Cần kiểm tra upstream URL/key nếu dùng model gateway cá nhân. Không mở proxy local ra Internet.

## Developer / Kiểm tra nhanh

```bash
npm run doctor   # Chỉ in tình trạng phát hiện, không cài
npm run plan     # Xem các lệnh mặc định, không cài
npm run check    # Syntax + unit tests
```

Node.js 20+; không cần tải thêm npm dependency để chạy TUI. Có GitHub Actions test Windows/macOS/Linux (trạng thái chạy phụ thuộc quyền và tình trạng billing của repo).

## 🤖 Dành cho AI coding agents (Codex / Claude Code)

Bạn có thể giao repository này cho AI để **đọc hiểu dự án, sửa code, bổ sung tính năng hoặc review** mà không phải copy toàn bộ tài liệu vào chat:

- [**AGENTS.md**](AGENTS.md) — quy tắc chung cho AI, đặc biệt Codex: mục tiêu, file quan trọng, lệnh kiểm thử, giới hạn bảo mật.
- [**CLAUDE.md**](CLAUDE.md) — điểm vào cho Claude Code; dùng chung quy tắc trong `AGENTS.md`, tránh viết lại.
- [**docs/AI-HANDOFF.md**](docs/AI-HANDOFF.md) — cách giao việc và prompt mẫu để AI triển khai từ yêu cầu đến test.
- [**docs/PRODUCT.md**](docs/PRODUCT.md) — trải nghiệm người dùng và chức năng đang có.
- [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md) — kiến trúc và vị trí sửa từng thành phần.
- [**docs/CONFIGURATION.md**](docs/CONFIGURATION.md) — cách đọc config Claude/Codex và giới hạn bảo mật.
- [**docs/DEVELOPMENT.md**](docs/DEVELOPMENT.md) — chạy, kiểm thử và debug.
- [**docs/SKILL-CATALOG.md**](docs/SKILL-CATALOG.md) — 10 skill trong ảnh, cách cài theo agent và giới hạn.
- [**docs/FEATURE-SPEC-TEMPLATE.md**](docs/FEATURE-SPEC-TEMPLATE.md) — mẫu tài liệu tính năng để yêu cầu AI làm đúng phạm vi.

**Cách nhanh nhất:** mở repo trong Codex hoặc Claude Code rồi gửi:

```text
Hãy đọc AGENTS.md / CLAUDE.md và docs/AI-HANDOFF.md.
Tóm tắt dự án, xác định file liên quan đến yêu cầu của tôi, rồi
triển khai thay đổi nhỏ nhất có đủ test. Không chạy bộ cài bên thứ
ba hoặc thay đổi cấu hình người dùng khi chưa được xác nhận.
Chạy npm run check và báo rõ kết quả.
```

Các tài liệu mô tả **hành vi hiện tại** và các giới hạn chưa hỗ trợ; hướng dẫn AI không đồng nghĩa hệ thống được tự cấp quyền truy cập máy hay tự push.

## Bảo mật

- Xem cấu hình: chỉ hiển thị trường whitelist, không xuất giá trị API key hoặc endpoint.
- Cài đặt: yêu cầu người dùng xác nhận trước khi thực thi lệnh tải/cài bên thứ ba.
- Sao lưu cấu hình vào `~/.bolt-token-saver/backups/` nếu có tệp cần bảo vệ.
- Các công cụ upstream có thể thay đổi phương thức cài. Kiểm tra nguồn và quyền cài đặt trước khi đồng ý.
- Không cộng dồn các tuyên bố % tiết kiệm token; cần đo thực tế trong từng hệ thống.

**MIT License** · Independent community installer; không trực thuộc OpenAI, Anthropic hay các dự án upstream.