import { resolve } from "path";
import { cpSync } from "fs";
import { defineConfig } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { sentryPlugin7 } from "@swifty.js/sentry/vite";
function copyStatic() {
  return {
    name: "copy-static",
    closeBundle() {
      cpSync(resolve("src/static"), resolve("out/static"), { recursive: true });
    },
  };
}

export default defineConfig({
  main: {
    // knex (CJS) contains lazy dynamic requires for database drivers; it
    // must stay external so client-less query building keeps working.
    plugins: [copyStatic()],
    build: {
      externalizeDeps: true,
    },
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        "@main": resolve(import.meta.dirname, "src/main"),
        "@preload": resolve(import.meta.dirname, "src/preload"),
        "@renderer": resolve(import.meta.dirname, "src/renderer/src"),
      },
    },
    plugins: [vue(), tailwindcss(), sentryPlugin7({ dsn: "/dev/sentry" })],
    build: {
      cssMinify: "lightningcss",
    },
  },
});
