import { Component } from '@angular/core';
import { WasmService } from 'src/app/services/wasm.service';

@Component({
  selector: 'app-lesson2',
  templateUrl: './lesson2.component.html',
  styleUrls: ['./lesson2.component.scss']
})
export class Lesson2Component {
  a = 0;
  b = 0;
  result: number | null = null;

  constructor(private wasm: WasmService) {}

  async calculate() {
    this.result = await this.wasm.sumRange(this.a, this.b);
  }
}
