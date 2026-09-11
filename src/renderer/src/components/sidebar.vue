<script setup lang="ts">
import { computed } from "vue";
import { Menu, Trophy, Ticket, Settings } from "@lucide/vue";
import { useSettingsStore } from "../stores/settings";

const navItems = [
  { to: "/achievement", label: "成就管理", icon: Trophy },
  { to: "/gacha", label: "跃迁记录", icon: Ticket },
  { to: "/setting", label: "设置", icon: Settings },
];

const settingsStore = useSettingsStore();
const collapsed = computed(
  () => settingsStore.settings?.SidebarCollapsed ?? false,
);

function toggleCollapsed() {
  settingsStore.update("SidebarCollapsed", !collapsed.value);
}
</script>

<template>
  <div
    class="flex h-full flex-col overflow-hidden rounded-md bg-white/50 shadow-sm transition-all duration-300"
    :style="{ width: collapsed ? '60px' : '150px' }"
  >
    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto p-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :title="item.label"
        class="flex h-11.25 items-center gap-3 rounded-md px-3 transition-colors hover:bg-white/50"
        active-class="bg-purple-100 text-purple-700"
      >
        <component :is="item.icon" :size="20" class="shrink-0" />
        <span v-if="!collapsed" class="text-sm whitespace-nowrap text-black">
          {{ item.label }}
        </span>
      </RouterLink>
    </nav>
    <button
      class="flex h-11.25 items-center justify-center hover:bg-white/50"
      @click="toggleCollapsed"
    >
      <Menu :size="20" />
    </button>
  </div>
</template>
