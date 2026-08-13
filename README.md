# 冒險者工坊

一個模擬將武器與防具精煉至 +15 最高等級、以及裝備附魔的小遊戲。

## 🎮 上傳 GitHub 後直接遊玩（GitHub Pages）

這個資料夾已經內建 GitHub Actions 設定（`.github/workflows/deploy.yml`），
只要照下面步驟做，**每次 push 都會自動 build 並部署**，不需要手動打包。

1. 在 GitHub 建立一個新的 repository（public 或 private 皆可）。
2. 把這個資料夾的內容全部推上去（記得包含隱藏的 `.github` 資料夾）：
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/<repo名稱>.git
   git push -u origin main
   ```
3. 到 repo 的 **Settings → Pages**，在「Build and deployment」的
   **Source** 選擇 **GitHub Actions**（只需要設定一次）。
4. 回到 **Actions** 分頁，等待 workflow 跑完（第一次約 1–2 分鐘）。
5. 完成後，網址會顯示在 **Settings → Pages** 頁面上方，格式通常是：
   ```
   https://<你的帳號>.github.io/<repo名稱>/
   ```
   打開就能直接遊玩。

之後每次你修改程式碼並 push 到 `main` 分支，網站就會自動重新部署。

## 💻 本機開發

**前置需求：** Node.js（建議 18 以上）

```bash
npm install
npm run dev
```

打開瀏覽器造訪 `http://localhost:3000` 即可遊玩。

## 📦 手動打包（非必要）

如果不想用 GitHub Actions，也可以自己 build 後上傳 `dist/` 資料夾內容：

```bash
npm run build
npm run preview   # 本機預覽打包結果
```
