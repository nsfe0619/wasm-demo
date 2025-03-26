import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
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
   * 自動載入 + 計算加法
   */
  async add(a: number, b: number): Promise<number> { // 因為要執行loadWasm所以改成async
    if (!this.instance) {
      await this.loadWasm(); // 若尚未載入則先載入
    }
    const fn = this.instance!.exports['add'] as CallableFunction;
    return fn(a, b);
  }
}
