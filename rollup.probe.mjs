// Builds probe/engine-probe.ts for injection into a live HA page by
// probe/run.mjs. Never shipped: the output lands in the gitignored .probe/.
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "probe/engine-probe.ts",
  output: { file: ".probe/engine-probe.js", format: "iife", inlineDynamicImports: true },
  plugins: [
    nodeResolve({ browser: true }),
    typescript({ tsconfig: "./tsconfig.probe.json", noEmitOnError: true }),
  ],
};
