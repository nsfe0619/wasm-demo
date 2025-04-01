# 🧠 AssemblyScript 前端入門教學：Lesson 1 ~ 4

本教學面向具備 Angular 基礎的前端工程師，循序漸進學會 WebAssembly 與 AssemblyScript 的實作與應用。

---

## 📘 Lesson 1：建立第一個 WASM 模組

### 🎯 目標

- 安裝 AssemblyScript 開發環境
- 編譯 `.ts` 為 `.wasm`
- 在 Angular 中載入並使用

### 🧩 實作重點

- 建立 `add(a, b)` 函式
- 使用 `WasmService` 動態載入 `.wasm`
- 匯出函數並透過 `instance.exports.add(...)` 呼叫

---

## 📘 Lesson 2：WASM 內部日誌與字串處理

### 🎯 目標

- 學會從 AssemblyScript 向 JS 回傳字串訊息
- 操作 for-loop 並動態記錄運算過程

### 🧩 實作重點

- 使用 `__allocString()` 建立字串記憶體
- 建立外部函式 `@external("env", "log")`
- JS 端建立 `log(ptr)` 來解碼 UTF8 並印出 console

---

## 📘 Lesson 3：圖片處理基礎（灰階、反相、亮度）

### 🎯 目標

- 傳入 `ImageData` 到 WASM 處理像素資料
- 操作 RGBA 陣列處理畫素
- 將處理後圖像重新輸出顯示

### 🧩 實作重點

- 使用 `__new()` 分配記憶體儲存圖片位元組
- 操作 `Uint8Array` 的色彩值
- 實作：
  - `grayscale(ptr, length)`
  - `invert(ptr, length)`
  - `brightness(ptr, length, delta)`
- 實作 `Canvas` + `ImageData` 作為 UI 顯示結果

---

## 📘 Lesson 4：記憶體操作模擬器（Memory Arena）

### 🎯 目標

- 學會記憶體分配與釋放流程
- 理解 GC、pin/unpin、WASM 記憶體可視化應用
- 建立類似計算機的記憶功能（M+ / MR / MC）

### 🧩 實作重點

| 按鈕 | 功能 |
|------|------|
| `pin` | 使用 `__new` + `pin` 記錄數值 |
| `read pin` | 從記憶體中讀取並顯示 |
| `unpin` | 釋放這塊記憶體 |
| `new only` | 使用 `__new` 記錄但不保護 |
| `read new only` | 嘗試從 `new-only` 指標讀取 |
| `GC` | 強制執行 AssemblyScript 的垃圾回收 |
| `Reset` | 清空記憶體與畫面狀態 |

---

## 🔍 建議學習順序與重點

1. 熟悉 AssemblyScript 的環境與編譯方式（Lesson1）
2. 瞭解與 JS 的互動：字串、console 輸出（Lesson2）
3. 實作真實應用：圖片處理與資料轉換（Lesson3）
4. 掌握底層記憶體模型：`__new`、`__pin`、`__unpin`、GC（Lesson4）

---

## ✅ 下一步建議課程

| Lesson | 內容 | 重點延伸 |
|--------|------|-----------|
| Lesson 5 | 陣列與結構操作 | `__newArray`, `__getArray`, `f64[]` 操作 |
| Lesson 6 | JS vs WASM 效能比較 | `console.time()` 比較運算效率 |
| Lesson 7 | WebWorker + WASM | 非同步處理不阻塞主執行緒 |

---

> 本教學全程使用 Angular + AssemblyScript 編寫，搭配 TypeScript 型別強化學習體驗，如需完整版範例或自動測試套件，請參閱 [附錄 / GitHub Repo](#)。

