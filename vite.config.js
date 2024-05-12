import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

const config = defineConfig({
  plugins: [mkcert()],
});

export default config;
