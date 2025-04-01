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
      console.log('[WASM]instance', this.instance);
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
  async grayscale(imageData: ImageData): Promise<ImageData> {
    if (!this.instance) await this.loadWasm();
    const grayscaleWasm = this.instance!.exports['grayscale'] as CallableFunction;
    const memory = this.instance!.exports['memory'] as WebAssembly.Memory;

    const byteArray = new Uint8Array(imageData.data);
    const len = byteArray.length;

    // 分配空間
    const ptr = (this.instance!.exports['__new'] as CallableFunction)(len, 0); // id 0 = ArrayBuffer
    const wasmBytes = new Uint8Array(memory.buffer, ptr, len);
    wasmBytes.set(byteArray); // 複製進去

    console.time('[WASM] Grayscale');
    grayscaleWasm(ptr, len);
    console.timeEnd('[WASM] Grayscale');

    // 拿回結果
    const result = new Uint8ClampedArray(memory.buffer, ptr, len);
    const output = new ImageData(new Uint8ClampedArray(result), imageData.width, imageData.height);

    return output;
  }

  async invert(imageData: ImageData): Promise<ImageData> {
    if (!this.instance) await this.loadWasm();
    const invertWasm = this.instance!.exports['invert'] as CallableFunction;
    const memory = this.instance!.exports['memory'] as WebAssembly.Memory;

    const byteArray = new Uint8Array(imageData.data);
    const len = byteArray.length;

    const ptr = (this.instance!.exports['__new'] as CallableFunction)(len, 0);
    const wasmBytes = new Uint8Array(memory.buffer, ptr, len);
    wasmBytes.set(byteArray);

    invertWasm(ptr, len);

    const result = new Uint8ClampedArray(memory.buffer, ptr, len);
    return new ImageData(new Uint8ClampedArray(result), imageData.width, imageData.height);
  }

  async brightness(imageData: ImageData, delta: number): Promise<ImageData> {
    if (!this.instance) await this.loadWasm();
    const fn = this.instance!.exports['brightness'] as CallableFunction;
    const memory = this.instance!.exports['memory'] as WebAssembly.Memory;

    const byteArray = new Uint8Array(imageData.data);
    const len = byteArray.length;

    const ptr = (this.instance!.exports['__new'] as CallableFunction)(len, 0);
    const wasmBytes = new Uint8Array(memory.buffer, ptr, len);
    wasmBytes.set(byteArray);

    fn(ptr, len, delta);

    const result = new Uint8ClampedArray(memory.buffer, ptr, len);
    return new ImageData(new Uint8ClampedArray(result), imageData.width, imageData.height);
  }

  allocate(buffer: Uint8Array): number {
    const ptr = (this.instance!.exports['__new'] as CallableFunction)(buffer.length, 0);
    const memory = this.instance!.exports['memory'] as WebAssembly.Memory;
    const wasmBytes = new Uint8Array(memory.buffer, ptr, buffer.length);
    wasmBytes.set(buffer);
    return ptr;
  }

  pin(ptr: number): void {
    (this.instance!.exports['__pin'] as CallableFunction)(ptr);
  }

  unpin(ptr: number): void {
    (this.instance!.exports['__unpin'] as CallableFunction)(ptr);
  }

  collect(): void {
    (this.instance!.exports['__collect'] as CallableFunction)();
  }

  getMemory(): WebAssembly.Memory {
    return this.instance!.exports['memory'] as WebAssembly.Memory;
  }
}
