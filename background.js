// Toolbar button: flips the "enabled" flag. Content scripts react via storage.onChanged.
async function getEnabled() {
  const { enabled } = await browser.storage.local.get({ enabled: true });
  return enabled;
}

async function updateBadge(enabled) {
  await browser.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
  await browser.action.setBadgeBackgroundColor({ color: enabled ? "#2e7d32" : "#777" });
  await browser.action.setTitle({
    title: `New Yorker Focus: ${enabled ? "ON" : "OFF"} (click to toggle)`
  });
}

browser.action.onClicked.addListener(async () => {
  const enabled = !(await getEnabled());
  await browser.storage.local.set({ enabled });
  await updateBadge(enabled);
});

browser.runtime.onStartup.addListener(async () => updateBadge(await getEnabled()));
browser.runtime.onInstalled.addListener(async () => updateBadge(await getEnabled()));
