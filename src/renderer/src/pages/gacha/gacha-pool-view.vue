<script setup lang="ts">
import { computed } from "vue";
import { useGachaStore } from "../../stores";

type GachaRecord = Record<string, Record<string, string>>;

interface PoolGroup {
  gachaType: string;
  label: string;
  items: Record<string, string>[];
}

const props = defineProps<{ data: GachaRecord }>();

const GACHA_TYPE_LABELS: Record<string, string> = {
  "1": "群星跃迁",
  "2": "始发跃迁",
  "11": "角色活动跃迁",
  "12": "光锥活动跃迁",
};

const gachaStore = useGachaStore();

const pools = computed<PoolGroup[]>(() => {
  const groups: Record<string, Record<string, string>[]> = {};
  for (const item of Object.values(props.data)) {
    const type = item.gacha_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
  }
  const result: PoolGroup[] = [];
  for (const [type, items] of Object.entries(groups)) {
    items.sort((a, b) => b.id.localeCompare(a.id));
    result.push({
      gachaType: type,
      label: GACHA_TYPE_LABELS[type] ?? `类型 ${type}`,
      items,
    });
  }
  result.sort((a, b) => {
    const order = ["11", "12", "1", "2"];
    return order.indexOf(a.gachaType) - order.indexOf(b.gachaType);
  });
  return result;
});

function visibleItems(pool: PoolGroup) {
  return pool.items.filter((item) => gachaStore.getItemStar(item.item_id) >= 4);
}
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto p-3">
    <div v-for="pool in pools" :key="pool.gachaType" class="mb-4">
      <h3 class="mb-2 text-sm font-medium">
        {{ pool.label }}
        <span class="ml-2 text-xs text-gray-400">
          {{ pool.items.length }} 抽数 in total
        </span>
      </h3>
      <div class="flex flex-wrap gap-1">
        <div
          v-for="item in visibleItems(pool)"
          :key="item.id"
          class="rounded px-2 py-0.5 text-xs"
          :class="
            gachaStore.getItemStar(item.item_id) === 5
              ? 'bg-amber-100 text-amber-700'
              : 'bg-purple-50 text-purple-600'
          "
          :title="item.time"
        >
          {{ gachaStore.getItemName(item.item_id) }}
        </div>
      </div>
    </div>
    <div
      v-if="pools.length === 0"
      class="flex flex-1 items-center justify-center text-sm text-gray-400"
    >
      No 跃迁记录
    </div>
  </div>
</template>
