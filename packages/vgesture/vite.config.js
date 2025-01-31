import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import topLevelAwait from "vite-plugin-top-level-await";
import fs from "node:fs";
import path from "path";
//https://stackoverflow.com/questions/78095780/web-assembly-wasm-errors-in-a-vite-vue-app-using-realm-web-sdk
// Custom middleware to serve wasm files with the correct MIME type
const wasmMiddleware = () => {
  return {
    name: "wasm-workaround-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        console.log(req.url);
        if (req.url.endsWith(".wasm")) {
          const wasmPath = path.join(
            __dirname,
            // "node_modules/v-gesture/build",
            "build",
            path.basename(req.url)
          );
          const wasmFile = fs.readFileSync(wasmPath);
          res.setHeader("Content-Type", "application/wasm");
          res.end(wasmFile);
          return;
        }
        next();
      });
    },
  };
};

const config = defineConfig({
  plugins: [wasmMiddleware(), topLevelAwait(), mkcert()],
  server: {
    headers: {},
  },
});

export default config;
