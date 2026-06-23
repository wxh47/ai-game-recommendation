const sampleGames = Array.isArray(window.STEAM_SAMPLE_GAMES) ? window.STEAM_SAMPLE_GAMES : [];
const thousandGames = Array.isArray(window.STEAM_1000_GAMES) ? window.STEAM_1000_GAMES : [];
const gamesById = new Map();
for (const game of [...sampleGames, ...thousandGames]) {
  gamesById.set(String(game.appid), game);
}
const games = [...gamesById.values()];
const params = new URLSearchParams(window.location.search);
const appid = params.get("appid");
const source = params.get("source") === "1000" ? "1000" : "sample";
const detailRoot = document.querySelector("#detailRoot");
const steamLink = document.querySelector("#steamLink");
const backLink = document.querySelector("#backLink");
const listUrl = source === "1000" ? "steam_1000_showcase.html" : "steam_sample_showcase.html";

backLink.href = listUrl;

function text(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(game) {
  if (game.price?.is_free) {
    return "免费";
  }
  return game.price?.final_formatted || "暂无价格";
}

function ratingLabel(game) {
  const percent = game.rating?.positive_percent;
  const summary = game.rating?.summary || "暂无评分";
  if (percent === null || percent === undefined) {
    return summary;
  }
  return `${summary} (${percent}%)`;
}

function tagHtml(tags) {
  return (tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
}

function reviewHtml(review, index) {
  const label = review.recommended === false ? "不推荐" : review.recommended === true ? "推荐" : "暂无态度";
  const className = review.recommended === false ? "review-card not-recommended" : "review-card";
  return `
    <article class="${className}">
      <span>评论 ${index + 1} · ${label} · ${escapeHtml(review.language || "unknown")} · 有用 ${Number(review.votes_up || 0)}</span>
      <p>${escapeHtml(review.text)}</p>
    </article>
  `;
}

function renderMissing() {
  detailRoot.innerHTML = `
    <section class="missing-detail">
      <p class="eyebrow">Not Found</p>
      <h1>没有找到这个游戏</h1>
      <p>请从列表页重新选择一个游戏卡片进入详情。</p>
      <a class="detail-btn" href="${listUrl}">返回列表</a>
    </section>
  `;
}

function renderDetail(game) {
  document.title = `${game.name} - Steam 游戏详情`;
  steamLink.href = game.steam_url;

  detailRoot.innerHTML = `
    <section class="detail-hero-card">
      <img class="dialog-cover" src="${escapeHtml(game.cover_path)}" alt="${escapeHtml(game.name)} 封面">
      <div class="detail-layout">
        <section>
          <p class="eyebrow">AppID ${game.appid}</p>
          <h1>${escapeHtml(game.name)}</h1>
          <p class="detail-description">${escapeHtml(game.detailed_description || game.short_description)}</p>
          <div class="fact-grid detail-facts">
            <span>价格:</span>
            <strong>${escapeHtml(formatPrice(game))}</strong>
            <span>简体中文评测:</span>
            <strong>${escapeHtml(ratingLabel(game))}</strong>
            <span>总评论数:</span>
            <strong>${Number(game.rating?.total_reviews || 0).toLocaleString("zh-CN")}</strong>
            <span>发行日期:</span>
            <strong>${escapeHtml(game.release_date || "未知")}</strong>
            <span>开发者:</span>
            <strong>${escapeHtml((game.developers || []).join(", ") || "未知")}</strong>
            <span>发行商:</span>
            <strong>${escapeHtml((game.publishers || []).join(", ") || "未知")}</strong>
          </div>
          <p class="eyebrow">热门标签</p>
          <div class="tag-list">${tagHtml(game.tags)}</div>
          <div class="detail-actions">
            <a class="detail-btn" href="${listUrl}">返回列表</a>
            <a class="steam-btn" href="${escapeHtml(game.steam_url)}" target="_blank" rel="noreferrer">打开 Steam 页面</a>
          </div>
        </section>
        <section>
          <p class="eyebrow">Reviews</p>
          <h2>10 条评论</h2>
          <div class="review-list">${(game.reviews || []).map(reviewHtml).join("")}</div>
        </section>
      </div>
    </section>
  `;
}

const game = games.find((item) => String(item.appid) === String(appid));
if (game) {
  renderDetail(game);
} else {
  renderMissing();
}
