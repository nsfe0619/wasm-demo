import { Component, OnInit } from '@angular/core';
import { WasmService } from 'src/app/services/wasm.service';

@Component({
  selector: 'app-lesson1',
  templateUrl: './lesson1.component.html',
  styleUrls: ['./lesson1.component.scss']
})
export class Lesson1Component implements OnInit {
  a = 0;
  b = 0;
  result: number | null = null;

  constructor(private wasm: WasmService) {}

  async ngOnInit() {
    await this.wasm.loadWasm();
  }

  async calculate() {
    this.result = await this.wasm.add(this.a, this.b);
  }
}
