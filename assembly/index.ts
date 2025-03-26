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
