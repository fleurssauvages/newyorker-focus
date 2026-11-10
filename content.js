// New Yorker Focus — hide videos and cartoons inserted into articles that are not part of them.
(() => {
  const LEAD = '[data-testid="ContentHeaderLeadAsset"]'; // the article's own top image/video: never hidden
  const path = location.pathname;
  const onCartoonPage = path.startsWith("/cartoons");   // there the cartoon IS the content
  const onVideoPage = path.startsWith("/video");        // there the video IS the content

  // Promo videos (Condé Nast "interlude" player, inline video embeds, floating sticky player).
  const VIDEO_RULES = [
    '[class*="cne-interlude"]',
    '[class*="CNEInterlude"]',
    '[class*="Interlude"]',
    '[data-testid*="Interlude"]',
    '[class*="CNEVideoEmbed"]',
    '[class*="CneVideoEmbed"]',
    '[class*="cne-video-embed"]',
    '[data-testid*="VideoEmbed"]',
    '[class*="sticky-video"]',
    '[class*="stickyVideo"]',
    'figure:has(iframe[src*="cnevids.com"])',
    'iframe[src*="cnevids.com"]',
    'figure:has(video)',
    "video"
  ];

  // Cartoons dropped between paragraphs.
  const CARTOON_RULES = [
    "figure:has(.responsive-cartoon)",
    ".responsive-cartoon",
    '[class*="ResponsiveCartoon"]'
  ];

  const rules = [
    ...(onVideoPage ? [] : VIDEO_RULES),
    ...(onCartoonPage ? [] : CARTOON_RULES)
  ];
  if (!rules.length) return;

  const HIDE = rules.map((r) => `${r}:not(${LEAD} *)`).join(",\n");

  const style = document.createElement("style");
  style.textContent = rules
    .map((r) => `html.nyf-on ${r}:not(${LEAD} *)`)
    .join(",\n") + " { display: none !important; }";
  (document.head || document.documentElement).appendChild(style);

  let enabled = true;

  // Hidden videos can keep playing sound: pause them.
  function pauseHidden() {
    if (!enabled) return;
    for (const el of document.querySelectorAll(HIDE)) {
      const vids = el.tagName === "VIDEO" ? [el] : el.querySelectorAll("video");
      for (const v of vids) {
        if (!v.paused) { try { v.pause(); } catch (_) {} }
        v.muted = true;
      }
    }
  }

  function apply(state) {
    enabled = state;
    document.documentElement.classList.toggle("nyf-on", enabled);
    pauseHidden();
  }

  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; pauseHidden(); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("play", pauseHidden, true);

  browser.storage.local.get({ enabled: true }).then(({ enabled }) => apply(enabled));
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled) apply(changes.enabled.newValue);
  });
})();
