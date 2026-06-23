const games = Array.isArray(window.STEAM_SAMPLE_GAMES) ? window.STEAM_SAMPLE_GAMES : [];

const state = {
  query: "",
  tag: "all",
  price: "all",
  rating: "all",
};

const gameGrid = document.querySelector("#gameGrid");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const tagFilter = document.querySelector("#tagFilter");
const priceFilter = document.querySelector("#priceFilter");
const ratingFilter = document.querySelector("#ratingFilter");

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

function allTags() {
  return [...new Set(games.flatMap((game) => game.tags || []))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function updateStats() {
  document.querySelector("#totalCount").textContent = games.length;
  document.querySelector("#freeCount").textContent = games.filter((game) => game.price?.is_free).length;
  document.querySelector("#reviewCount").textContent = games.reduce((sum, game) => sum + (game.reviews?.length || 0), 0);
  document.querySelector("#tagCount").textContent = allTags().length;
}

function fillTagFilter() {
  const options = allTags().map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`);
  tagFilter.insertAdjacentHTML("beforeend", options.join(""));
}

function matchesQuery(game) {
  const query = state.query.toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    game.name,
    game.short_description,
    ...(game.tags || []),
    ...(game.developers || []),
    ...(game.publishers || []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesTag(game) {
  return state.tag === "all" || (game.tags || []).includes(state.tag);
}

function matchesPrice(game) {
  if (state.price === "free") {
    return Boolean(game.price?.is_free);
  }
  if (state.price === "paid") {
    return !game.price?.is_free;
  }
  if (state.price === "discount") {
    return Number(game.price?.discount_percent || 0) > 0;
  }
  return true;
}

function matchesRating(game) {
  if (state.rating === "all") {
    return true;
  }
  const percent = Number(game.rating?.positive_percent || 0);
  return percent >= Number(state.rating);
}

function filteredGames() {
  return games.filter((game) => matchesQuery(game) && matchesTag(game) && matchesPrice(game) && matchesRating(game));
}

function tagHtml(tags) {
  return (tags || []).slice(0, 8).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
}

function renderGameCard(game) {
  const source = window.STEAM_DETAIL_SOURCE || "sample";
  const detailUrl = `steam_game_detail.html?appid=${encodeURIComponent(game.appid)}&source=${encodeURIComponent(source)}`;
  return `
    <article class="game-card">
      <a class="cover-link" href="${detailUrl}" aria-label="查看 ${escapeHtml(game.name)} 详情">
        <img src="${escapeHtml(game.cover_path)}" alt="${escapeHtml(game.name)} 封面">
      </a>
      <div class="card-body">
        <h3><a href="${detailUrl}">${escapeHtml(game.name)}</a></h3>
        <p class="description">${escapeHtml(game.short_description)}</p>
        <div class="fact-grid">
          <span>简体中文评测:</span>
          <strong>${escapeHtml(ratingLabel(game))}</strong>
          <span>发行日期:</span>
          <strong>${escapeHtml(game.release_date || "未知")}</strong>
          <span>开发者:</span>
          <a href="${escapeHtml(game.steam_url)}" target="_blank" rel="noreferrer">${escapeHtml((game.developers || []).join(", ") || "未知")}</a>
          <span>发行商:</span>
          <a href="${escapeHtml(game.steam_url)}" target="_blank" rel="noreferrer">${escapeHtml((game.publishers || []).join(", ") || "未知")}</a>
        </div>
        <div class="tag-list">${tagHtml(game.tags)}</div>
        <div class="card-actions">
          <span class="price-pill">${escapeHtml(formatPrice(game))}</span>
          <a class="detail-btn" href="${detailUrl}">进入详情页面</a>
        </div>
      </div>
    </article>
  `;
}

function renderGames() {
  const visible = filteredGames();
  gameGrid.innerHTML = visible.map(renderGameCard).join("");
  emptyState.hidden = visible.length > 0;
}

function applyFilters() {
  state.query = searchInput.value.trim();
  state.tag = tagFilter.value;
  state.price = priceFilter.value;
  state.rating = ratingFilter.value;
  renderGames();
}

function bindEvents() {
  [searchInput, tagFilter, priceFilter, ratingFilter].forEach((control) => {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });

}

updateStats();
fillTagFilter();
bindEvents();
renderGames();
