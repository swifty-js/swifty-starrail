import { createRouter, createWebHashHistory } from "vue-router";
import RootLayout from "../pages/root-layout.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: RootLayout,
      children: [
        { path: "", redirect: "/achievement" },
        {
          path: "achievement",
          component: () => import("../pages/achievement/achievement-page.vue"),
        },
        {
          path: "gacha",
          component: () => import("../pages/gacha/gacha-page.vue"),
        },
        {
          path: "setting",
          component: () => import("../pages/setting/setting-page.vue"),
        },
      ],
    },
  ],
});
