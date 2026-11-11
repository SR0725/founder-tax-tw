# Founder Tax TW

幫「台灣創辦人開的美國公司」處理美國稅務合規。c0mpiled-18 黑客松（2026-11-11，台北）現場專案。

完整脈絡在 `docs/CONTEXT.md`，動手前先讀。稅務規則草稿在 `docs/tax-rules.md`。

## 今晚的死線

- 22:00 停止加功能，開始錄影片
- 22:45 交件：90 秒 demo 影片＋GitHub 連結（交件前 repo 要改公開）

## 只做一條流程

上傳資料 → 判斷該報哪些表、期限、罰則 → 產出申報草稿並標出不確定欄位 → 審核清單。

不在這條流程上的功能一律不做。

## 規則

- 產品介面中英雙語：繁體中文（台灣用語）給用戶，英文給評審，依瀏覽器語言預設，右上角可切換。新增任何畫面文字都要兩種語言一起寫（`src/lib/i18n.ts`）。README 和影片用英文。隊內溝通用繁體中文。
- 真實財務資料不准進 repo，只用 `sample-data/` 的假資料。這個 repo 會公開。
- 稅務規則寫死在程式裡的規則表，不要讓模型自己編期限和罰則。模型只負責讀資料、填草稿、解釋。
- 每條稅務規則都要有官方來源連結；沒查證過的標 `verified: false`。
- 畫面上固定顯示「Not tax advice」。
- 四個人同時在改：小步 commit、先 `git pull --rebase` 再 push，不要 force push。

## 技術

Next.js（App Router、TypeScript、Tailwind），`src/` 目錄。

模型走本機的 `claude` CLI（`src/app/api/draft/route.ts`），不用 API 金鑰。沒裝 CLI 會自動退回關鍵字規則並在畫面上說明。
