import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  css: {
    modules: {
      scopeBehaviour: "global",
    },
  },
  build: {
    // https://vitejs.bootcss.com/config/#build-lib
    lib: {
      entry: path.resolve(dirname, "lib/index.jsx"),
      name: "react-markdown-navbar",
      fileName: "index",
    },

    // https://vitejs.bootcss.com/config/#build-minify
    minify: false,

    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
});
