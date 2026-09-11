<script setup lang="ts">
import { computed } from "vue";
import { useGachaStore } from "../../stores";

type GachaRecord = Record<string, Record<string, string>>;

interface TypeStat {
  itemId: string;
  name: string;
  star: number;
  count: number;
}

const props = defineProps<{ data: GachaRecord }>();

const gachaStore = useGachaStore();

const stats = computed<TypeStat[]>(() => {
  const counts: Record<string, number> = {};
  for (const item of Object.values(props.data)) {
    counts[item.item_id] = (counts[item.item_id] ?? 0) + 1;
  }
  const result: TypeStat[] = Object.entries(counts).map(([itemId, count]) => ({
    itemId,
    name: gachaStore.getItemName(itemId),
    star: gachaStore.getItemStar(itemId),
    count,
  }));
  result.sort((a, b) => b.star - a.star || b.count - a.count);
  return result;
});

const starGroups = computed(() => {
  const star5 = stats.value.filter((s) => s.star === 5);
  const star4 = stats.value.filter((s) => s.star === 4);
  return [
    { star: 5, items: star5, title: "5-Star", gridClass: "grid-cols-3" },
    { star: 4, items: star4, title: "4-Star", gridClass: "grid-cols-4" },
  ];
});

const star3 = computed(() => stats.value.filter((s) => s.star === 3));
</script>

<template>
  <div class="flex h-full flex-col gap-4 overflow-y-auto p-3">
    <section
      v-for="group in starGroups"
      v-show="group.items.length > 0"
      :key="group.star"
    >
      <h3
        class="mb-2 text-sm font-medium"
        :class="group.star === 5 ? 'text-amber-600' : 'text-purple-600'"
      >
        {{ group.title }}
      </h3>
      <div class="grid gap-2" :class="group.gridClass">
        <div
          v-for="item in group.items"
          :key="item.itemId"
          class="flex items-center justify-between rounded-md px-3 py-2"
          :class="group.star === 5 ? 'bg-amber-50' : 'bg-purple-50'"
        >
          <span
            class="text-sm"
            :class="group.star === 5 ? 'text-amber-700' : 'text-purple-700'"
          >
            {{ item.name }}
          </span>
          <span
            class="text-xs"
            :class="group.star === 5 ? 'text-amber-500' : 'text-purple-500'"
          >
            x{{ item.count }}
          </span>
        </div>
      </div>
    </section>
    <section v-if="star3.length > 0">
      <h3 class="mb-2 text-sm font-medium text-blue-600">3-Star</h3>
      <div class="grid grid-cols-5 gap-1">
        <div
          v-for="item in star3"
          :key="item.itemId"
          class="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600"
        >
          {{ item.name }} x{{ item.count }}
        </div>
      </div>
    </section>
    <div
      v-if="stats.length === 0"
      class="flex flex-1 items-center justify-center text-sm text-gray-400"
    >
      No 跃迁记录
    </div>
  </div>
</template>
