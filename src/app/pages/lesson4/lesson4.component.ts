import { Component } from '@angular/core';
import { WasmService } from 'src/app/services/wasm.service';

@Component({
  selector: 'app-lesson4',
  templateUrl: './lesson4.component.html',
  styleUrls: ['./lesson4.component.scss']
})
export class Lesson4Component {
  currentValue = 0;
  secondValue = 0;
  memoryPtr: number | null = null;
  newOnlyPtr: number | null = null;
  log: string[] = [];
  intervalId: any = null;

  constructor(private wasm: WasmService) {}

  async ngOnInit() {
    await this.wasm.loadWasm();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }


  storeToMemory(): void {
    if (this.memoryPtr !== null) {
      this.wasm.unpin(this.memoryPtr);
      this.log.unshift(`🧹 Cleared previous memory at ptr ${this.memoryPtr}`);
    }
    const buffer = new Float64Array([this.currentValue]);
    const bytes = new Uint8Array(buffer.buffer);
    this.memoryPtr = this.wasm.allocate(bytes);
    this.wasm.pin(this.memoryPtr);
    this.log.unshift(`💾 Stored value ${this.currentValue} at ptr ${this.memoryPtr}`);
  }

  readFromMemory(): void {
    if (this.memoryPtr !== null) {
      const view = new DataView(this.wasm.getMemory().buffer);
      this.currentValue = view.getFloat64(this.memoryPtr, true);
      this.log.unshift(`📥 Read value ${this.currentValue} from ptr ${this.memoryPtr}`);
    } else {
      this.log.unshift(`⚠️ No value stored in memory.`);
    }
  }

  clearMemory(): void {
    if (this.memoryPtr !== null) {
      this.wasm.unpin(this.memoryPtr);
      this.log.unshift(`🧹 Released memory at ptr ${this.memoryPtr}`);
      this.memoryPtr = null;
    } else {
      this.log.unshift(`⚠️ No memory to clear.`);
    }
  }

  storeWithNewOnly(): void {
    const buffer = new Float64Array([this.currentValue]);
    const bytes = new Uint8Array(buffer.buffer);
    this.newOnlyPtr = this.wasm.allocate(bytes);
    this.log.unshift(`🆕 Stored (without pin) value ${this.currentValue} at ptr ${this.newOnlyPtr}`);
  }

  readWithNewOnly(): void {
    if (this.newOnlyPtr !== null) {
      const view = new DataView(this.wasm.getMemory().buffer);
      const val = view.getFloat64(this.newOnlyPtr, true);
      this.log.unshift(`👀 Read (unprotected) value ${val} from ptr ${this.newOnlyPtr}`);
    } else {
      this.log.unshift(`⚠️ No new-only memory to read.`);
    }
  }

  sumValues(): void {
    const result = this.currentValue + this.secondValue;
    this.log.unshift(`➕ Summed ${this.currentValue} + ${this.secondValue} = ${result}`);
    this.currentValue = result;
    this.secondValue = 0;
  }

  clearInputs(): void {
    this.currentValue = 0;
    this.secondValue = 0;
    this.log.unshift(`🧽 Cleared input fields.`);
  }

  collectGC(): void {
    this.wasm.collect();
    this.log.unshift(`⚙️ GC triggered manually.`);
  }

  reset(): void {
    this.clearMemory();
    this.clearInputs();
    this.newOnlyPtr = null;
    this.log = [];
    this.log.unshift(`🔄 Reset.`);
  }
}
