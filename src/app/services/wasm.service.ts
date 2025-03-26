import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WasmService {
  private instance: WebAssembly.Instance | null = null; // 儲存已載入的 WASM 模組實例
  private loadPromise: Promise<void> | null = null; // 避免重複載入 .wasm，確保只有一次載入

  async loadWasm(forceReload = false): Promise<void> {
    if (this.loadPromise && !forceReload) return this.loadPromise;

    this.loadPromise = (async () => {
      let memory: WebAssembly.Memory;

      const imports = {
        env: {
          abort: () => {
            console.error('[WASM] abort called');
          },
          log: (ptr: number) => {
            const buffer = new Uint8Array(memory.buffer);
            const bytes: number[] = [];
            let i = ptr;
            while (buffer[i] !== 0) bytes.push(buffer[i++]);
            const msg = new TextDecoder().decode(new Uint8Array(bytes));
            console.log('[WASM]', msg);
          }
        }
      };

      const response = await fetch('assets/add.wasm');
      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.instantiate(buffer, imports);
      this.instance = module.instance;
      memory = this.instance.exports['memory'] as WebAssembly.Memory;

      console.log('[WASM] 模組載入完成');
    })();

    return this.loadPromise;
  }

  async add(a: number, b: number): Promise<number> {
    if (!this.instance) await this.loadWasm();
    const fn = this.instance!.exports['add'] as CallableFunction;
    return fn(a, b);
  }

  async sumRange(a: number, b: number): Promise<number> {
    if (!this.instance) await this.loadWasm();
    const fn = this.instance!.exports['sumRange'] as CallableFunction;
    return fn(a, b);
  }
}
