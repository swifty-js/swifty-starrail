import { ref } from "vue";
import { defineStore } from "pinia";

export const useAchievementStore = defineStore("achievement", () => {
  const uids = ref<Record<string, string> | null>(null);
  const currentUid = ref<string | null>(null);
  const currentData = ref<Record<string, unknown> | null>(null);
  const headInfo = ref("Loading");
  const selectedSeries = ref(0);
  const searchString = ref("");

  async function init() {
    const uidsResult = await window.api.invoke("achievement:getUids");
    if (uidsResult.msg !== "OK") return;
    const uidsData = "data" in uidsResult ? uidsResult.data : null;
    const settings = await window.api.invoke("setting:getAppSettings");
    const uid = settings.LastAchievementUid;
    const dataResult = await window.api.invoke("achievement:getData", uid);
    const data =
      dataResult.msg === "OK" && "data" in dataResult ? dataResult.data : null;
    uids.value = uidsData;
    currentUid.value = uid;
    currentData.value = data as Record<string, unknown>;
  }

  async function setCurrentUid(uid: string) {
    if (uid === currentUid.value) return;
    const result = await window.api.invoke("achievement:getData", uid, true);
    if (result.msg === "OK" && "data" in result) {
      currentUid.value = uid;
      currentData.value = result.data as Record<string, unknown>;
    }
  }

  async function setStatus(ids: string[], status: number) {
    if (!currentUid.value) return;
    const result = await window.api.invoke(
      "achievement:setStatus",
      currentUid.value,
      ids,
      status,
    );
    if (result.msg === "OK") {
      const dataResult = await window.api.invoke(
        "achievement:getData",
        currentUid.value,
      );
      if (dataResult.msg === "OK" && "data" in dataResult) {
        currentData.value = dataResult.data as Record<string, unknown>;
      }
    }
  }

  async function newUser(
    uid: string,
    nickname: string,
  ): Promise<{ msg: string }> {
    const result = await window.api.invoke(
      "achievement:newData",
      uid,
      nickname,
    );
    if (result.msg === "OK") {
      uids.value = { ...uids.value, [uid]: nickname };
      const dataResult = await window.api.invoke(
        "achievement:getData",
        uid,
        true,
      );
      const data =
        dataResult.msg === "OK" && "data" in dataResult ? dataResult.data : {};
      currentUid.value = uid;
      currentData.value = data as Record<string, unknown>;
    }
    return result;
  }

  async function deleteUser(uid: string): Promise<{ msg: string }> {
    const result = await window.api.invoke("achievement:delData", uid);
    if (result.msg === "OK") {
      const nextUids = { ...uids.value };
      delete nextUids[uid];
      const nextUid = Object.keys(nextUids)[0];
      const dataResult = await window.api.invoke(
        "achievement:getData",
        nextUid,
        true,
      );
      const data =
        dataResult.msg === "OK" && "data" in dataResult ? dataResult.data : {};
      uids.value = nextUids;
      currentUid.value = nextUid;
      currentData.value = data as Record<string, unknown>;
    }
    return result;
  }

  async function importData(type: string): Promise<{ msg: string }> {
    if (!currentUid.value) return { msg: "No UID" };
    const result = await window.api.invoke(
      "achievement:importData",
      currentUid.value,
      type,
    );
    if (result.msg === "OK") {
      const dataResult = await window.api.invoke(
        "achievement:getData",
        currentUid.value,
      );
      if (dataResult.msg === "OK" && "data" in dataResult) {
        currentData.value = dataResult.data as Record<string, unknown>;
      }
    }
    return result;
  }

  async function exportData(type: string): Promise<{ msg: string }> {
    if (!currentUid.value) return { msg: "No UID" };
    return await window.api.invoke(
      "achievement:exportData",
      currentUid.value,
      type,
    );
  }

  function setHeadInfo(info: string) {
    headInfo.value = info;
  }
  function setSelectedSeries(id: number) {
    selectedSeries.value = id;
  }
  function setSearchString(s: string) {
    searchString.value = s;
  }

  return {
    uids,
    currentUid,
    currentData,
    headInfo,
    selectedSeries,
    searchString,
    init,
    setCurrentUid,
    setStatus,
    newUser,
    deleteUser,
    importData,
    exportData,
    setHeadInfo,
    setSelectedSeries,
    setSearchString,
  };
});
