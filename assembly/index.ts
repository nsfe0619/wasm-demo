@external("env", "log")
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
    const ptr = changetype<usize>(buf); // ✅ 安全轉換成指標
    log(ptr); // log 每一步
  }
  return sum;
}

export function grayscale(ptr: usize, length: i32): void {
  for (let i = 0; i < length; i += 4) {
    let r = load<u8>(ptr + i);
    let g = load<u8>(ptr + i + 1);
    let b = load<u8>(ptr + i + 2);

    let gray = <u8>(r * 0.299 + g * 0.587 + b * 0.114);

    store<u8>(ptr + i, gray);
    store<u8>(ptr + i + 1, gray);
    store<u8>(ptr + i + 2, gray);
  }
}

export function invert(ptr: usize, length: i32): void {
  for (let i = 0; i < length; i += 4) {
    let r = load<u8>(ptr + i);
    let g = load<u8>(ptr + i + 1);
    let b = load<u8>(ptr + i + 2);

    store<u8>(ptr + i, 255 - r);
    store<u8>(ptr + i + 1, 255 - g);
    store<u8>(ptr + i + 2, 255 - b);
  }
}

export function brightness(ptr: usize, length: i32, delta: i32): void {
  for (let i = 0; i < length; i += 4) {
    let r = load<u8>(ptr + i);
    let g = load<u8>(ptr + i + 1);
    let b = load<u8>(ptr + i + 2);

    r = <u8>min(255, max(0, r + delta));
    g = <u8>min(255, max(0, g + delta));
    b = <u8>min(255, max(0, b + delta));

    store<u8>(ptr + i, r);
    store<u8>(ptr + i + 1, g);
    store<u8>(ptr + i + 2, b);
  }
}
