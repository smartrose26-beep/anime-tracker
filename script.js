const STORAGE_KEY = "animepulse-live-data";

const state = {
  favorites: new Set(),
  ratings: {},
  query: "",
  animeList: [],
  upcoming: [],
  loading: false,
};

const animeGrid = document.querySelector("#anime-grid");
const searchInput = document.querySelector("#search-input");
const upcomingList = document.querySelector("#upcoming-list");
const watchlistItems = document.querySelector("#watchlist-items");
const totalAnime = document.querySelector("#total-anime");
const totalFavoris = document.querySelector("#total-favoris");
const moyenneNote = document.querySelector("#moyenne-note");
const featuredTitle = document.querySelector("#featured-title");
const featuredMeta = document.querySelector("#featured-meta");
const featuredStatus = document.querySelector("#featured-status");
const statusLine = document.querySelector("#status-line");

function loadLocalState() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (!saved) return;

  state.favorites = new Set(saved.favorites || []);
  state.ratings = saved.ratings || {};
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      favorites: [...state.favorites],
      ratings: state.ratings,
    })
  );
}

function formatDateForCard(date) {
  if (!date) return "Date inconnue";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
}

function fetchJson(url) {
  return fetch(url, { headers: { Accept: "application/json" } }).then((response) => {
    if (!response.ok) {
      throw new Error(`Erreur API ${response.status}`);
    }
    return response.json();
  });
}

function makeTrailerUrl(anime) {
  if (!anime) return "";
  if (anime.trailer?.embed_url) return anime.trailer.embed_url;
  if (anime.trailer?.youtube_id) return `https://www.youtube.com/watch?v=${anime.trailer.youtube_id}`;
  return "";
}

async function loadAnimeList() {
  const query = state.query.trim();
  state.loading = true;
  statusLine.textContent = query ? `Recherche de “${query}”…` : "Chargement des titres populaires…";

  try {
    const url = query
      ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12&sfw`
      : "https://api.jikan.moe/v4/top/anime?limit=12";

    const payload = await fetchJson(url);
    const items = (payload.data || []).map((anime) => ({
      id: anime.mal_id,
      title: anime.title || anime.title_english || "Titre inconnu",
      kind: anime.type || "TV",
      year: anime.year || "—",
      score: anime.score || 0,
      genres: (anime.genres || []).slice(0, 3).map((g) => g.name),
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
      status: anime.status || "Inconnu",
      premiered: anime.premiered || null,
      episodes: anime.episodes || "?",
      description: anime.synopsis || "Aucune description disponible pour le moment.",
      trailerUrl: makeTrailerUrl(anime),
    }));

    state.animeList = items;
    statusLine.textContent = query
      ? `${items.length} résultat(s) trouvé(s) pour “${query}”` 
      : "Données mises à jour depuis l’API Jikan";
  } catch (error) {
    console.error(error);
    state.animeList = [];
    statusLine.textContent = "Impossible de charger les données en ce moment. Réessayez plus tard.";
  } finally {
    state.loading = false;
  }

  renderAnimeGrid();
  renderStats();
}

async function loadUpcoming() {
  try {
    const payload = await fetchJson("https://api.jikan.moe/v4/seasons/upcoming?limit=6");
    state.upcoming = (payload.data || []).map((anime) => ({
      id: anime.mal_id,
      title: anime.title || anime.title_english || "Titre inconnu",
      season: anime.season || "À annoncer",
      date: anime.airing_start || anime.aired?.from || null,
      genres: (anime.genres || []).slice(0, 2).map((g) => g.name),
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
      trailerUrl: makeTrailerUrl(anime),
    }));
  } catch (error) {
    console.error(error);
    state.upcoming = [];
  }

  renderUpcoming();
  renderFeatured();
}

function renderStats() {
  const favoritesCount = state.favorites.size;
  const ratedValues = Object.values(state.ratings).map(Number).filter((v) => Number.isFinite(v));
  const average = ratedValues.length
    ? (ratedValues.reduce((sum, value) => sum + value, 0) / ratedValues.length).toFixed(1)
    : "0.0";

  totalAnime.textContent = state.animeList.length || "0";
  totalFavoris.textContent = favoritesCount;
  moyenneNote.textContent = average;
}

function renderFeatured() {
  const feature = state.upcoming[0] || state.animeList[0];
  if (!feature) {
    featuredTitle.textContent = "Aucune donnée";
    featuredMeta.textContent = "Réessayez plus tard";
    featuredStatus.textContent = "API indisponible";
    return;
  }

  featuredTitle.textContent = feature.title;
  featuredMeta.textContent = feature.genres?.length
    ? `${feature.genres.join(" • ")}`
    : "Saison à venir";
  featuredStatus.textContent = feature.date
    ? `Sortie prévue le ${formatDateForCard(feature.date)}`
    : "Date à confirmer";
}

function buildAnimeCard(anime) {
  const card = document.createElement("article");
  card.className = "anime-card";

  const isFavorite = state.favorites.has(anime.id);
  const userRating = state.ratings[anime.id] ?? "";
  const trailerButton = anime.trailerUrl
    ? `<a class="trailer-btn" href="${anime.trailerUrl}" target="_blank" rel="noopener noreferrer">▶ Trailer</a>`
    : "";

  const visual = anime.image
    ? `background-image: url('${anime.image}');`
    : "background: linear-gradient(135deg, rgba(124,156,255,0.35), rgba(17,34,51,0.8));";

  card.innerHTML = `
    <div class="anime-visual" style="${visual}">
      <span class="floating-badge">${anime.status || anime.kind || "TV"}</span>
      <span class="score-badge">★ ${Number(anime.score || 0).toFixed(1)}</span>
    </div>
    <div class="anime-content">
      <h3 class="anime-title">${anime.title}</h3>
      <p class="anime-meta">${anime.kind || "TV"} • ${anime.year || "—"} • ${anime.episodes || "?"} épisodes</p>
      <div class="genre-row">
        ${(anime.genres || []).map((genre) => `<span class="genre-tag">${genre}</span>`).join("") || '<span class="genre-tag">Divers</span>'}
      </div>

      <div class="anime-footer">
        <div class="score-box"><span class="star"></span> ${Number(anime.score || 0).toFixed(1)}</div>
        <div class="card-actions">
          <button class="favorite-btn ${isFavorite ? "active" : ""}" data-action="favorite" data-id="${anime.id}">
            ${isFavorite ? "♥" : "♡"}
          </button>
          <button class="watch-btn" data-action="watch" data-id="${anime.id}">+ Liste</button>
          ${trailerButton}
        </div>
      </div>

      <label>
        <select class="rating-select" data-action="rating" data-id="${anime.id}">
          <option value="">Note</option>
          <option value="1" ${userRating === 1 ? "selected" : ""}>1/10</option>
          <option value="2" ${userRating === 2 ? "selected" : ""}>2/10</option>
          <option value="3" ${userRating === 3 ? "selected" : ""}>3/10</option>
          <option value="4" ${userRating === 4 ? "selected" : ""}>4/10</option>
          <option value="5" ${userRating === 5 ? "selected" : ""}>5/10</option>
          <option value="6" ${userRating === 6 ? "selected" : ""}>6/10</option>
          <option value="7" ${userRating === 7 ? "selected" : ""}>7/10</option>
          <option value="8" ${userRating === 8 ? "selected" : ""}>8/10</option>
          <option value="9" ${userRating === 9 ? "selected" : ""}>9/10</option>
          <option value="10" ${userRating === 10 ? "selected" : ""}>10/10</option>
        </select>
      </label>
    </div>
  `;

  return card;
}

function renderAnimeGrid() {
  if (state.loading) {
    animeGrid.innerHTML = '<div class="empty-state">Chargement des animes…</div>';
    return;
  }

  if (!state.animeList.length) {
    animeGrid.innerHTML = '<div class="empty-state">Aucun anime trouvé pour cette recherche.</div>';
    return;
  }

  animeGrid.innerHTML = "";
  state.animeList.forEach((anime) => animeGrid.appendChild(buildAnimeCard(anime)));
}

function renderUpcoming() {
  if (!state.upcoming.length) {
    upcomingList.innerHTML = '<div class="empty-state">Aucune sortie à venir actuellement.</div>';
    return;
  }

  upcomingList.innerHTML = state.upcoming
    .map((anime) => {
      const monthDay = anime.date ? formatDateForCard(anime.date).split(" ") : ["?", ""];
      const day = monthDay[1] || "?";
      const month = monthDay[0] || "?";
      return `
        <div class="upcoming-item">
          <div class="release-date"><strong>${day}</strong>${month}</div>
          <div class="upcoming-text">
            <h4>${anime.title}</h4>
            <p>${anime.season} • ${(anime.genres || []).slice(0, 2).join(" • ") || "Divers"}</p>
          </div>
          <span class="meta-tag">${anime.season}</span>
        </div>
      `;
    })
    .join("");
}

function renderWatchlist() {
  const favorites = state.animeList.filter((anime) => state.favorites.has(anime.id));

  if (!favorites.length) {
    watchlistItems.innerHTML = '<div class="empty-state">Votre watchlist est vide. Ajoutez un anime pour le suivre.</div>';
    return;
  }

  watchlistItems.innerHTML = favorites
    .map(
      (anime) => `
      <div class="watchlist-item">
        <div>
          <h4>${anime.title}</h4>
          <div class="watchlist-meta">
            <span>${anime.kind || "TV"}</span>
            <span>${anime.year || "—"}</span>
            <span>Note ${state.ratings[anime.id] || "-"}/10</span>
          </div>
        </div>
        <button class="favorite-btn active" data-action="favorite" data-id="${anime.id}">♥</button>
      </div>
      `
    )
    .join("");
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }
  persistState();
  renderAnimeGrid();
  renderWatchlist();
  renderStats();
}

function updateRating(id, value) {
  if (!value) {
    delete state.ratings[id];
  } else {
    state.ratings[id] = Number(value);
  }

  persistState();
  renderStats();
  renderWatchlist();
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  loadAnimeList();
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action, id } = target.dataset;
  if (action === "favorite") {
    toggleFavorite(Number(id));
  }

  if (action === "watch") {
    toggleFavorite(Number(id));
  }
});

document.addEventListener("change", (event) => {
  const target = event.target.closest("[data-action='rating']");
  if (!target) return;

  updateRating(Number(target.dataset.id), target.value);
});

loadLocalState();
loadAnimeList();
loadUpcoming();
renderWatchlist();
renderStats();

window.addEventListener("storage", () => {
  loadLocalState();
  renderStats();
  renderWatchlist();
  renderAnimeGrid();
});
