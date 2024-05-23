import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import commonjs from "@rollup/plugin-commonjs";
import * as path from "path";
import * as fs from "fs";

export default [
  {
    input: {
      vgesture: "src/index.ts",
      // plugins: "src/plugins/index.ts",
    },
    output: {
      entryFileNames: "[name].js",
      dir: "build",
      format: "es",
    },
    plugins: [
      nodeResolve({
        // extensions,
        // preferBuiltins: false,
        browser: true,
        // // dedupe: ["fastdom/extensions/fastdom-promised"],
        // modulePaths: ["node_modules/.pnpm"],
      }),
      commonjs(),
      rollupMediapipeObfuscationPolyfill(),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
  },
  {
    input: {
      // vgesture: "src/index.ts",
      index: "src/plugins/index.ts",
    },
    output: {
      entryFileNames: "[name].js",
      dir: "build/plugins",
      format: "es",
    },
    plugins: [
      nodeResolve({
        // extensions,
        // preferBuiltins: false,
        browser: true,
        // // dedupe: ["fastdom/extensions/fastdom-promised"],
        // modulePaths: ["node_modules/.pnpm"],
      }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
  },
  {
    input: {
      vgesture: "src/index.ts",
    },
    output: {
      entryFileNames: "[name].d.ts",
      format: "es",
      dir: "build",
    },
    // external: (id) => !/^[./]/.test(id),
    plugins: [dts()],
  },
  {
    input: {
      index: "src/plugins/index.ts",
    },
    output: {
      entryFileNames: "[name].d.ts",
      format: "es",
      dir: "build/plugins",
    },
    // external: (id) => !/^[./]/.test(id),
    plugins: [dts()],
  },
];

function rollupMediapipeObfuscationPolyfill() {
  return {
    name: "mediapipe-obfuscation-polyfill",
    load(id) {
      if (path.basename(id) === "hands.js") {
        let code = fs.readFileSync(id, "utf-8");
        code += "exports.Hands = Hands;";
        return { code };
      } else {
        return null;
      }
    },
  };
}
