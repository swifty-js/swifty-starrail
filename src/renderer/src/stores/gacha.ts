import { ref } from "vue";
import { defineStore } from "pinia";
import { useTextMapStore } from "./text-map";

type AvatarConfig = Record<string, Record<string, unknown>>;
type EquipmentConfig = Record<string, Record<string, unknown>>;
type GachaRecord = Record<string, Record<string, string>>;

let itemStarCache: Record<string, number> = {};
let itemNameHashCache: Record<string, string> = {};

export const useGachaStore = defineStore("gacha", () => {
  const avatarConfig = ref<AvatarConfig | null>(null);
  const lightConeConfig = ref<EquipmentConfig | null>(null);
  const gachaPoolInfo = ref<unknown>(null);
  const gachaBasicInfo = ref<unknown>(null);
  const uids = ref<Record<string, string> | null>(null);
  const currentUid = ref<string | null>(null);
  const currentData = ref<GachaRecord | null>(null);
  const viewMode = ref<"pool" | "type">("pool");

  async function init() {
    const [avatar, avatarLD, lightCone, poolInfo, basicInfo] =
      await Promise.all([
        window.api.invoke("static:loadJson", "AvatarConfig"),
        window.api.invoke("static:loadJson", "AvatarConfigLD"),
        window.api.invoke("static:loadJson", "EquipmentConfig"),
        window.api.invoke("static:loadJson", "GachaPoolInfo"),
        window.api.invoke("static:loadJson", "GachaBasicInfo"),
      ]);
    const mergedAvatarConfig = {
      ...(avatar as AvatarConfig),
      ...(avatarLD as AvatarConfig),
    };

    const uidsResult = await window.api.invoke("gacha:getUids");
    const uidsData =
      uidsResult.msg === "OK" && "data" in uidsResult ? uidsResult.data : null;
    const settings = await window.api.invoke("setting:getAppSettings");
    const uid = settings.LastGachaUid;
    const dataResult = await window.api.invoke("gacha:getData", uid);
    const data =
      dataResult.msg === "OK" && "data" in dataResult ? dataResult.data : null;

    itemStarCache = {};
    itemNameHashCache = {};
    avatarConfig.value = mergedAvatarConfig;
    lightConeConfig.value = lightCone as EquipmentConfig;
    gachaPoolInfo.value = poolInfo;
    gachaBasicInfo.value = basicInfo;
    uids.value = uidsData;
    currentUid.value = uid;
    currentData.value = data as GachaRecord;
  }

  async function setCurrentUid(uid: string) {
    if (uid === currentUid.value) return;
    const result = await window.api.invoke("gacha:getData", uid, true);
    if (result.msg === "OK" && "data" in result) {
      currentUid.value = uid;
      currentData.value = result.data as GachaRecord;
    }
  }

  async function newUser(
    uid: string,
    nickname: string,
  ): Promise<{ msg: string }> {
    const result = await window.api.invoke("gacha:newData", uid, nickname);
    if (result.msg === "OK") {
      uids.value = { ...uids.value, [uid]: nickname };
      const dataResult = await window.api.invoke("gacha:getData", uid, true);
      const data =
        dataResult.msg === "OK" && "data" in dataResult ? dataResult.data : {};
      currentUid.value = uid;
      currentData.value = data as GachaRecord;
    }
    return result;
  }

  async function deleteUser(uid: string): Promise<{ msg: string }> {
    const result = await window.api.invoke("gacha:delData", uid);
    if (result.msg === "OK") {
      const nextUids = { ...uids.value };
      delete nextUids[uid];
      const nextUid = Object.keys(nextUids)[0];
      const dataResult = await window.api.invoke(
        "gacha:getData",
        nextUid,
        true,
      );
      const data =
        dataResult.msg === "OK" && "data" in dataResult ? dataResult.data : {};
      uids.value = nextUids;
      currentUid.value = nextUid;
      currentData.value = data as GachaRecord;
    }
    return result;
  }

  async function refreshData(
    type: string,
    data?: unknown,
  ): Promise<{ msg: string }> {
    const result = await window.api.invoke(
      "gacha:importData",
      type,
      data as object,
    );
    if (result.msg === "OK" && "data" in result) {
      const uidsResult = await window.api.invoke("gacha:getUids");
      uids.value =
        uidsResult.msg === "OK" && "data" in uidsResult
          ? uidsResult.data
          : uids.value;
      const uid = result.data.uid;
      const dataResult = await window.api.invoke("gacha:getData", uid);
      const gachaData =
        dataResult.msg === "OK" && "data" in dataResult ? dataResult.data : {};
      currentUid.value = uid;
      currentData.value = gachaData as GachaRecord;
    }
    return result;
  }

  async function importData(type: string): Promise<{ msg: string }> {
    const result = await window.api.invoke("gacha:importData", type);
    if (result.msg === "OK" && "data" in result) {
      const uidsResult = await window.api.invoke("gacha:getUids");
      uids.value =
        uidsResult.msg === "OK" && "data" in uidsResult
          ? uidsResult.data
          : uids.value;
      const uid = result.data.uid;
      const dataResult = await window.api.invoke("gacha:getData", uid);
      const gachaData =
        dataResult.msg === "OK" && "data" in dataResult ? dataResult.data : {};
      currentUid.value = uid;
      currentData.value = gachaData as GachaRecord;
    }
    return result;
  }

  async function exportData(type: string, uids?: string[]) {
    return await window.api.invoke(
      "gacha:exportData",
      uids ?? currentUid.value ?? "",
      type,
    );
  }

  async function getGachaURL(server: "cn" | "global" = "cn") {
    const result = await window.api.invoke("gacha:getURL", server);
    return result as { msg: string; data?: { url: string } };
  }

  function getItemStar(itemId: string | number) {
    const key = `${itemId}`;
    if (itemStarCache[key]) return itemStarCache[key];
    if (key.length === 4) {
      const rarity = avatarConfig.value?.[key]?.["Rarity"] as
        string | undefined;
      itemStarCache[key] = rarity ? +rarity.at(-1)! : 4;
    } else {
      const rarity = lightConeConfig.value?.[key]?.["Rarity"] as
        string | undefined;
      itemStarCache[key] = rarity ? +rarity.at(-1)! : 4;
    }
    return itemStarCache[key];
  }

  function getItemName(itemId: string | number) {
    const key = `${itemId}`;
    if (itemNameHashCache[key]) {
      return useTextMapStore().getText(itemNameHashCache[key]);
    }
    let hash: string | undefined;
    if (key.length === 4) {
      hash = (
        avatarConfig.value?.[key]?.["AvatarName"] as Record<string, string>
      )?.["Hash"];
    } else {
      hash = (
        lightConeConfig.value?.[key]?.["EquipmentName"] as Record<
          string,
          string
        >
      )?.["Hash"];
    }
    if (hash) {
      itemNameHashCache[key] = hash;
      return useTextMapStore().getText(hash);
    }
    return key;
  }

  function setViewMode(mode: "pool" | "type") {
    viewMode.value = mode;
  }

  return {
    avatarConfig,
    lightConeConfig,
    gachaPoolInfo,
    gachaBasicInfo,
    uids,
    currentUid,
    currentData,
    viewMode,
    init,
    setCurrentUid,
    newUser,
    deleteUser,
    refreshData,
    importData,
    exportData,
    getGachaURL,
    getItemStar,
    getItemName,
    setViewMode,
  };
});
