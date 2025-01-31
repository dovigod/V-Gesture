use wasm_bindgen::prelude::*;

#[wasm_bindgen] //attributes
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    unsafe { alert(&format!("Hello, {}!", name)) };
}