import { Component } from '@angular/core';
import { WasmService } from 'src/app/services/wasm.service';

@Component({
  selector: 'app-lesson3',
  templateUrl: './lesson3.component.html',
  styleUrls: ['./lesson3.component.scss'],
})
export class Lesson3Component {
  originalSrc: string | null = null;
  processedSrc: string | null = null;

  originalImageData: ImageData | null = null;
  imageData: ImageData | null = null;

  brightnessValue = 50;

  constructor(private wasm: WasmService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.originalSrc = e.target?.result as string;
      const img = new Image();
      img.src = this.originalSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        this.originalImageData = data;
        this.imageData = this.cloneImageData(data);
        this.updateImage(this.imageData);
      };
    };
    reader.readAsDataURL(input.files[0]);
  }

  async processImage() {
    if (!this.originalImageData) return;
    const base = this.cloneImageData(this.originalImageData);
    const result = await this.wasm.grayscale(base);
    this.updateImage(result);
  }

  async processInvert() {
    if (!this.originalImageData) return;
    const base = this.cloneImageData(this.originalImageData);
    const result = await this.wasm.invert(base);
    this.updateImage(result);
  }

  async onBrightnessChange() {
    if (!this.originalImageData) return;
    const base = this.cloneImageData(this.originalImageData);
    const delta = this.brightnessValue - 50;
    const result = await this.wasm.brightness(base, delta);
    this.updateImage(result);
  }

  restoreOriginal() {
    if (!this.originalImageData) return;
    this.imageData = this.cloneImageData(this.originalImageData);
    this.updateImage(this.imageData);
    this.brightnessValue = 50; // 重設亮度
  }

  updateImage(data: ImageData) {
    this.imageData = data;
    const canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    canvas.getContext('2d')!.putImageData(data, 0, 0);
    this.processedSrc = canvas.toDataURL();
  }

  cloneImageData(data: ImageData): ImageData {
    return new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
  }

  processImageInJS() {
    if (!this.originalImageData) return;

    console.time('[JS] Grayscale');

    const src = this.cloneImageData(this.originalImageData);
    const data = src.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);

      data[i] = data[i + 1] = data[i + 2] = gray;
    }

    console.timeEnd('[JS] Grayscale');
    this.updateImage(src);
  }
}
