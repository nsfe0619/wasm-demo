# WebAssembly教學
## 認識WebAssembly
### WebAssembly (WASM) 的基本概念

WebAssembly (WASM) 是一種 低階二進制格式，可在 瀏覽器與非瀏覽器環境 執行，主要特點如下：

* 高效能：比 JavaScript 快，適合計算密集型應用（如圖像處理、遊戲、機器學習）。
* 跨平台：可在不同裝置與作業系統上運行。
* 與 JavaScript 共存：WASM 可由 JavaScript 調用，並與前端框架（如 Angular）整合。

# 程式支援度
| 語言 | 支援度 | 效能 | 優點 | 缺點 | 適合應用 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| Rust | ⭐⭐⭐⭐⭐ | 🚀🚀🚀🚀🚀 | 高效能、無 GC、工具完整| 需要學 Rust| 最佳選擇（推薦）| 
| C/C++| ⭐⭐⭐⭐ | 🚀🚀🚀🚀🚀 | 現有 C++ 庫可用 | JS 互通較難| 解析 .msg、遊戲| 
| AssemblyScript| ⭐⭐⭐ | 🚀🚀 | TypeScript 語法 | 最佳化較弱| 	前端開發者較易上手| 
| Go| ⭐⭐⭐| 🚀🚀 | 內建 WASM 支援 | 檔案大、效能差	Go| 開發者使用| 
| Python (Pyodide)| ⭐⭐ | 🚀 |可用 NumPy/Pandas | 速度慢、檔案超大| 數據分析| 

# 環境準備
🔹 目標：安裝 AssemblyScript 並設置 Angular 
建立 Angular 專案並整合 WebAssembly：
```
ng new wasm-demo --routing --style=scss
cd wasm-demo
```
安裝 WebAssembly 依賴：
```
npm install --save-dev assemblyscript
```
初始化 AssemblyScript ：
```
npx asinit .
```

初始化完以後package.json多了這幾行
```
  "scripts": {
    ...
    "asbuild:debug": "asc assembly/index.ts --target debug",
    "asbuild:release": "asc assembly/index.ts --target release",
    "asbuild": "npm run asbuild:debug && npm run asbuild:release"
  },
```
這代表我們用下列指令可以打包wasm檔案
```
npm run asbuild
```
初始化後的設定打包完會長這樣
```
angular-wasm-demo/
├── assembly/               ← 放 AssemblyScript 原始碼
│   ├── index.ts
│   ├── tsconfig.json       ← 編譯設定
├── src/                    ← Angular相關程式
└── build/                  ← 編譯輸出目標
    ├── debug.wasm
    └── release.wasm
 ``` 
 需手動把build內的wasm移至src下
 
 調整設定
 理想架構
 ```
angular-wasm-demo/
├── assembly/           ← 放 AssemblyScript 原始碼
│   ├── index.ts
│   └── asconfig.json       ← 編譯設定
├── src/
│   └── assets/
│       ├── add.debug.wasm  ← 編譯輸出目標
│       └── add.wasm        ← 編譯輸出目標
 ```
 調整內容
 wasm/asconfig.json
 ```
{
  "entry": "assembly/index.ts",
  "targets": {
    "release": {
      "outFile": "../src/assets/add.wasm",
      "optimizeLevel": 3,
      "shrinkLevel": 1
    },
    "debug": {
      "outFile": "../src/assets/add.debug.wasm",
      "debug": true
    }
  }
}
 ```
調整package.json
```
    "asbuild:debug": "asc assembly/index.ts --config assembly/asconfig.json --target debug",
    "asbuild:release": "asc assembly/index.ts --config assembly/asconfig.json --target release",
    "asbuild": "npm run asbuild:debug && npm run asbuild:release"
```

### 在angular內應用wasm

預設index.ts會給個簡單的加總
```
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```
新增wasm.service.ts用來管理wasm的function
```
export class WasmService {
  private instance: WebAssembly.Instance | null = null; // 儲存已載入的 WASM 模組實例
  private loadPromise: Promise<void> | null = null; // 避免重複載入 .wasm，確保只有一次載入

  /**
   * 第一次載入 .wasm 檔案
   */
  async loadWasm(): Promise<void> {
    // 如果已經有正在進行的載入行為，就直接等待它完成
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const response = await fetch('assets/add.wasm');
      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.instantiate(buffer);
      this.instance = module.instance;
      console.log('[WASM] 模組已載入完成');
    })();

    return this.loadPromise;
  }

  /**
   * 計算加法
   */
  add(a: number, b: number): Promise<number> {
    const fn = this.instance!.exports['add'] as CallableFunction;
    return fn(a, b);
  }
}
```
在component內就可以使用wasmService的function
```
  constructor(private wasm: WasmService) {}

  async ngOnInit() {
    await this.wasm.loadWasm();
  }

  calculate() {
    this.result = this.wasm.add(this.a, this.b);
  }
```
不想每次都執行 this.wasm.loadWasm()

所以做一下調整
在執行this.wasm.add的時候判斷instance是否已經載入
未載入再執行loadWasm
```
// wasm.service.ts
  async add(a: number, b: number): Promise<number> { // 因為要執行loadWasm所以改成async
    if (!this.instance) {
      await this.loadWasm(); // 若尚未載入則先載入
    }
    const fn = this.instance!.exports['add'] as CallableFunction;
    return fn(a, b);
  }
  
// lesson1.component.ts
  ngOnInit() {
  }
  
  async calculate() {
    this.result = await this.wasm.add(this.a, this.b);
  }
```

### WASM的資料型態

WASM 本身只支援這 4 種 低階數字型別：
| WASM  型態	|說明	| 對應 JS/TS 型態|
|--------|------|------|
|i32 |	32 位元整數	|number（整數）|
| i64	|64 位元整數	|❌ JS 不支援直接傳入，需拆成兩個 i32|
| f32	| 32 位元浮點數	|number（小數）|
|f64	| 64 位元浮點數	| number（小數） |

AssemblyScript 是 TypeScript-like
數字類型會轉成上述的四個型別，非數字類型的會轉換成usize記憶體位置

|TypeScript 類型	|轉換成 WASM 怎麼看？	|說明|
|--------|------|------|
| i32, i16, i8	|→ i32	|會自動提升成 32 位整數|
| f32, f64	|→ f32 或 f64	|對應浮點數|
| bool	|→ i32（0/1）	|被當成整數處理|
| string	|→ usize	|指向字串的記憶體位址|
| T[]（陣列）	|→ usize	|陣列指標，需要手動解碼|
| ArrayBuffer	|→ usize	|一塊 raw memory 區塊|
| usize	|→ i32 或 i64（依平台）	|記憶體指標（address）|

### WASM 的線性記憶體 (memory) 機制

WebAssembly 透過 線性記憶體 (Linear Memory) 管理數據：

1. 線性記憶體是一塊連續的 ArrayBuffer
* WebAssembly 無 GC (垃圾回收)，所有記憶體都需要 手動管理。
* 透過 指標 (pointer) 存取數據。

2. 記憶體初始大小 & 擴充
* WASM 預設記憶體是 64KB (1 Page)，可動態擴展。
* 使用 memory.grow(n) 來擴充 n 個 64KB。

3. 與 JavaScript 交換數據
* WASM 無法直接操作 JS 物件，必須透過 ArrayBuffer 讀寫數據，例如：
    * 數字：直接存取
    * 字串：需使用 TextEncoder / TextDecoder
    * 圖片：透過 Uint8Array 操作 RGBA 資料



### 擷取wasm訊息
如果wasm給的結果不如預期
想要擷取wasm內某個階段的訊息
有辦法像console.log一樣印出來嗎

先參考lesson1寫個範例
加總兩個數字內的所有數字

```
// index.ts
export function sumRange(a: i32, b: i32): i32 {
  let sum = 0;
  for (let i = min(a, b); i <= max(a, b); i++) {
    sum += i;
  }
  return sum;
}
// lesson2.component.ts

  async calculate() {
    this.result = await this.wasm.sumRange(this.a, this.b);
  }
```

我們現在想要把wasm內過程中的資訊印出來
所以我們傳一個包含console.log的callback function進去
由於Assembly內部的string跟angular慣用的string的概念不太一樣，是用ArrayBuffer的概念去處理
所以這邊分成兩塊

index.ts(打包成wasm的部分)
產生訊息(字串)=>轉換為ArrayBuffer=>轉換成usize=>傳到外部傳入的callback function內

wasm.service.ts(使用wasm時傳入cb function)
取得傳入的usize=>取得對應ArrayBuffer=>轉換回文字

於是程式調整為下列
```
// wasm.service.ts 
  async loadWasm(forceReload = false): Promise<void> {
    if (this.loadPromise && !forceReload) return this.loadPromise;

    this.loadPromise = (async () => {
      let memory: WebAssembly.Memory;

      const imports = {
        env: {
          abort: () => { // 除錯用 需要有預設值
            console.error('[WASM] abort called');
          },
          log: (ptr: number) => { // 處理訊息用 ptr為記憶體位置
            const buffer = new Uint8Array(memory.buffer); 
            const bytes: number[] = [];
            let i = ptr;
            while (buffer[i] !== 0) bytes.push(buffer[i++]); // 取得連續記憶體位置

            const msg = new TextDecoder().decode(new Uint8Array(bytes)); // 轉換回文字
            console.log('[WASM]', msg);
          }
        }
      };

      const response = await fetch('assets/add.wasm');
      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.instantiate(buffer, imports); // 額外傳入imports給wasm使用
      this.instance = module.instance;
      memory = this.instance.exports['memory'] as WebAssembly.Memory;

      console.log('[WASM] 模組載入完成');
    })();

    return this.loadPromise;
  }
```

```
//index.ts
@external("env", "log") // 承接外部傳入物件
declare function log(ptr: usize): void;


export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function sumRange(a: i32, b: i32): i32 {
  let sum = 0;
  for (let i = min(a, b); i <= max(a, b); i++) {
    sum += i;
    const msg = `i=${i}, sum=${sum}`;
    const buf = String.UTF8.encode(msg, true); // returns ArrayBuffer
    const ptr = changetype<usize>(buf); //  安全轉換成指標
    log(ptr); // log 每一步
  }
  return sum;
}

```
