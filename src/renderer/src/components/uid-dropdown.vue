<script setup lang="ts">
import { computed, ref } from "vue";
import Dropdown from "./dropdown.vue";
import { Plus, Trash2 } from "@lucide/vue";
import { alert } from "../stores/alert";

const props = defineProps<{
  uids: Record<string, string>;
  currentUid: string;
  onSelect: (uid: string) => void;
  onAdd: (uid: string, nickname: string) => Promise<{ msg: string }>;
  onDelete: (uid: string) => Promise<{ msg: string }>;
}>();

const adding = ref(false);
const newUid = ref("");
const newNickname = ref("");

const options = computed(() =>
  Object.entries(props.uids).map(([uid, name]) => ({
    label: `${name} (${uid})`,
    value: uid,
  })),
);

async function handleAdd() {
  if (!newUid.value || !newNickname.value) return;
  await props.onAdd(newUid.value, newNickname.value);
  adding.value = false;
  newUid.value = "";
  newNickname.value = "";
}

async function handleDelete() {
  const confirmed = await alert.confirm({
    title: "Confirm deletion",
    content: `Are you sure you want to delete data for UID ${props.currentUid}?`,
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  if (confirmed) await props.onDelete(props.currentUid);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Dropdown :options="options" :value="currentUid" @change="onSelect" />
    <button
      class="flex h-8 w-8 items-center justify-center rounded border border-gray-300 hover:border-purple-400"
      title="Add UID"
      @click="adding = true"
    >
      <Plus :size="14" />
    </button>
    <button
      class="flex h-8 w-8 items-center justify-center rounded border border-gray-300 hover:border-red-400"
      title="Delete current UID"
      @click="handleDelete"
    >
      <Trash2 :size="14" />
    </button>

    <div
      v-if="adding"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <div class="w-72 rounded-lg bg-white p-5 shadow-lg">
        <h3 class="mb-3 text-sm font-medium">Add UID</h3>
        <input
          v-model="newUid"
          class="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          placeholder="UID (9 digits)"
        />
        <input
          v-model="newNickname"
          class="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          placeholder="Nickname"
        />
        <div class="flex justify-end gap-2">
          <button
            class="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            @click="adding = false"
          >
            Cancel
          </button>
          <button
            class="rounded bg-purple-500 px-3 py-1.5 text-sm text-white hover:bg-purple-600"
            @click="handleAdd"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
