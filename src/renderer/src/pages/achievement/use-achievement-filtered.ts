import { computed, ref, watch, type Ref } from "vue";
import { storeToRefs } from "pinia";
import { useAchievementStore } from "../../stores";
import type { AchievementItem, SeriesItem, FilterSetting } from "./types";

export function useAchievementFiltered(
  achievementItems: Ref<AchievementItem[]>,
  seriesItems: Ref<SeriesItem[]>,
  meAchievementMap: Ref<Record<string, string[]>>,
  achievementDataMap: Ref<Record<string, Record<string, unknown>>>,
  filter: Ref<FilterSetting>,
) {
  const store = useAchievementStore();
  const { currentData, selectedSeries, searchString } = storeToRefs(store);

  const sortKey = ref(0);
  // Plain (non-reactive) tracking of the latest displayed order so reordering
  // can be applied without re-triggering this computed.
  let orderIds: string[] = [];

  const processedItems = computed<AchievementItem[]>(() => {
    if (!achievementItems.value.length || !currentData.value)
      return achievementItems.value;
    const items = achievementItems.value.map((item) => ({ ...item }));
    for (const item of items) {
      const userData = currentData.value?.[item.achievementId] as
        Record<string, unknown> | undefined;
      if (!userData || userData["status"] === 1) {
        if (meAchievementMap.value[item.achievementId]) {
          let effected = false;
          for (const meId of meAchievementMap.value[item.achievementId]) {
            const meData = currentData.value?.[meId] as
              Record<string, unknown> | undefined;
            if (meData && meData["status"] === 2) {
              effected = true;
              break;
            }
          }
          if (effected) continue;
        }
        item.achievementStatus = 1;
        item.achievementIsDisabled = false;
        item.achievementFinishDate = "";
        item.achievementFinishTime = "";
      } else if (userData && userData["status"] === 2) {
        const relatedIds = meAchievementMap.value[item.achievementId] ?? [
          item.achievementId,
        ];
        const timeStr = new Date(
          (userData["timestamp"] as number) * 1000,
        ).toLocaleString();
        for (const relItem of items) {
          if (relatedIds.includes(relItem.achievementId)) {
            relItem.achievementIsDisabled = true;
            relItem.achievementFinishDate = timeStr.split(" ")[0];
            relItem.achievementFinishTime = timeStr.split(" ")[1];
          }
        }
        item.achievementStatus = 2;
        item.achievementIsDisabled = false;
      }
    }
    return items;
  });

  const seriesWithProgress = computed<SeriesItem[]>(() => {
    if (!seriesItems.value.length || !currentData.value)
      return seriesItems.value;
    const items = seriesItems.value.map((s) => ({ ...s, countFinished: 0 }));
    const seriesMap: Record<number, SeriesItem> = {};
    for (const s of items) seriesMap[s.seriesId] = s;
    const counted = new Set<string>();
    for (const id of Object.keys(currentData.value ?? {})) {
      if (counted.has(id)) continue;
      if (meAchievementMap.value[id]) {
        for (const meId of meAchievementMap.value[id]) counted.add(meId);
      }
      counted.add(id);
      const sid = achievementDataMap.value[id]?.["SeriesID"] as
        number | undefined;
      if (sid !== undefined && seriesMap[sid]) {
        seriesMap[sid].countFinished++;
        seriesMap[0].countFinished++;
      }
    }
    return items;
  });

  watch(
    seriesWithProgress,
    (series) => {
      if (series.length > 0) {
        const all = series[0];
        const info = `${all.countFinished}/${all.countTotal} - ${((all.countFinished / all.countTotal) * 100).toFixed(2)}%`;
        store.setHeadInfo(info);
      }
    },
    { immediate: true },
  );

  const filteredItemsUnsorted = computed<AchievementItem[]>(() => {
    let items = processedItems.value;
    if (searchString.value) {
      items = items.filter(
        (item) =>
          searchString.value === item.achievementId ||
          `${item.achievementTitle}\n${item.achievementDescUpper}\n${item.achievementDescLower}`.includes(
            searchString.value,
          ),
      );
    } else {
      items = items.filter(
        (item) =>
          selectedSeries.value === 0 || item.seriesId === selectedSeries.value,
      );
    }
    if (filter.value.Version.length > 0) {
      items = items.filter((item) =>
        filter.value.Version.includes(item.achievementVersion),
      );
    }
    if (filter.value.ShowComp || filter.value.ShowInComp) {
      if (!filter.value.ShowInComp)
        items = items.filter(
          (item) => item.achievementIsDisabled || item.achievementStatus === 2,
        );
      if (!filter.value.ShowComp)
        items = items.filter(
          (item) => !item.achievementIsDisabled && item.achievementStatus === 1,
        );
    }
    if (filter.value.ShowHidden || filter.value.ShowVisible) {
      if (!filter.value.ShowVisible)
        items = items.filter((item) => item.achievementShowType === "Hidden");
      if (!filter.value.ShowHidden)
        items = items.filter((item) => item.achievementShowType === "");
    }
    if (filter.value.ShowMeOnly) {
      items = items.filter(
        (item) => meAchievementMap.value[item.achievementId] !== undefined,
      );
    }
    return items;
  });

  const filteredItems = computed<AchievementItem[]>(() => {
    // Read so triggerResort's sortKey bump invalidates this computed
    void sortKey.value;
    const items = [...filteredItemsUnsorted.value];
    const byPriority = (a: AchievementItem, b: AchievementItem) => {
      const pa =
        a.seriesPriority * 10000 +
        a.achievementPriority +
        (!a.achievementIsDisabled &&
        a.achievementStatus === 1 &&
        filter.value.InCompFirst
          ? 100000
          : 0);
      const pb =
        b.seriesPriority * 10000 +
        b.achievementPriority +
        (!b.achievementIsDisabled &&
        b.achievementStatus === 1 &&
        filter.value.InCompFirst
          ? 100000
          : 0);
      return pb - pa;
    };
    // After a status toggle the previous display order is kept so the toggled
    // item does not jump (e.g. to the bottom when it loses its InCompFirst
    // bonus). A fresh priority sort only happens once orderIds is cleared by
    // triggerResort (series switch / search).
    const orderIndex = new Map(orderIds.map((id, idx) => [id, idx] as const));
    if (orderIndex.size === 0) {
      items.sort(byPriority);
    } else {
      items.sort((a, b) => {
        const ia = orderIndex.get(a.achievementId);
        const ib = orderIndex.get(b.achievementId);
        if (ia !== undefined && ib !== undefined) return ia - ib;
        if (ia !== undefined) return -1;
        if (ib !== undefined) return 1;
        return byPriority(a, b);
      });
    }
    return items;
  });

  watch(filteredItems, (items) => {
    orderIds = items.map((i) => i.achievementId);
  });

  function triggerResort() {
    orderIds = [];
    sortKey.value++;
  }

  function handleSelectSeries(id: number) {
    store.setSelectedSeries(id);
    store.setSearchString("");
    triggerResort();
  }

  function handleSearch(str: string) {
    store.setSearchString(str);
    store.setSelectedSeries(0);
    triggerResort();
  }

  return {
    filteredItems,
    seriesWithProgress,
    selectedSeries,
    handleSelectSeries,
    handleSearch,
  };
}
