const STORAGE_KEY = "animepulse-data";

const animeData = [
  {
    id: 1,
    title: "Dandadan",
    kind: "TV",
    year: 2026,
    status: "Sortie prévue",
    score: 8.9,
    genres: ["Action", "Comédie", "Fantastique"],
    accent: "D",
    releaseDate: "12 Jan",
    season: "Printemps 2026",
    description: "Un mélange explosif d'action absurde et de super-pouvoirs." 
  },
  {
    id: 2,
    title: "Frieren: Beyond Journey's End",
    kind: "TV",
    year: 2025,
    status: "En cours",
    score: 9.5,
    genres: ["Fantasy", "Drame", "Aventure"],
    accent: "F",
    releaseDate: "28 Dec",
    season: "Hiver 2025",
    description: "Une odyssée contemplative sur le passage du temps et la mémoire." 
  },
  {
    id: 3,
    title: "Solo Leveling",
    kind: "TV",
    year: 2024,
    status: "Terminé",
    score: 9.1,
    genres: ["Action", "Fantasy", "Aventure"],
    accent: "S",
    releaseDate: "18 Nov",
    season: "Automne 2024",
    description: "Un chasseur talentueux se lance dans une montée en puissance phénoménale." 
  },
  {
    id: 4,
    title: "Kaiju No. 8",
    kind: "TV",
    year: 2025,
    status: "À suivre",
    score: 8.6,
    genres: ["Action", "Science-fiction"],
    accent: "K",
    releaseDate: "08 Fev",
    season: "Printemps 2025",
    description: "Un jeune homme devient un héros malgré sa vie de tous les jours." 
  },
  {
    id: 5,
    title: "Spy x Family",
    kind: "TV",
    year: 2026,
    status: "Nouvelle saison",
    score: 8.8,
    genres: ["Action", "Comédie", "Familial"],
    accent: "Sx",
    releaseDate: "21 Mar",
    season: "Printemps 2026",
    description: "Une équipe de faux agents pour une mission ultra-complexe." 
  },
  {
    id: 6,
    title: "Blue Lock",
    kind: "TV",
    year: 2025,
    status: "À suivre",
    score: 8.7,
    genres: ["Sport", "Action"],
    accent: "BL",
    releaseDate: "16 Jan",
    season: "Hiver 2025",
    description: "Le football comme jamais vu, au cœur d'un entraînement brutal." 
  }
];

const defaultState = {
  favorites: [1, 2],
  ratings: {
    1: 9,
    2: 10,
    3: 8,
  },
};

const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || defaultState;
const state = {
  favorites: new Set(saved.favorites || []),
  ratings: saved.ratings || {},
  query: "",
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

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      favorites: [...state.favorites],
      ratings: state.ratings,
    })
  );
}

function getFilteredAnime() {
  const query = state.query.trim().toLowerCase();

  if (!query) {
    return animeData;
  }

  return animeData.filter((anime) => {
    const haystack = [anime.title, anime.kind, anime.year, ...anime.genres]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function renderStats() {
  const favoritesCount = state.favorites.size;
  const ratedValues = Object.values(state.ratings).map(Number);
  const average = ratedValues.length
    ? (ratedValues.reduce((sum, value) => sum + value, 0) / ratedValues.length).toFixed(1)
    : "0.0";

  totalAnime.textContent = animeData.length;
  totalFavoris.textContent = favoritesCount;
  moyenneNote.textContent = average;
}

function renderFeatured() {
  const featured = animeData[0];
  featuredTitle.textContent = featured.title;
  featuredMeta.textContent = `${featured.genres.join(" • ")} • ${featured.season}`;
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }
  persistState();
  renderAll();
}

function updateRating(id, value) {
  state.ratings[id] = Number(value);
  persistState();
  renderAll();
}

function buildAnimeCard(anime) {
  const card = document.createElement("article");
  card.className = "anime-card";

  const isFavorite = state.favorites.has(anime.id);
  const userRating = state.ratings[anime.id] ?? "";

  card.innerHTML = `
    <div class="anime-visual" data-accent="${anime.accent}" style="background: linear-gradient(135deg, rgba(124, 156, 255, 0.35), rgba(17, 34, 51, 0.8)), var(--card);">
      <span class="floating-badge">${anime.status}</span>
    </div>
    <div class="anime-content">
      <div class="anime-head">
        <div>
          <h3 class="anime-title">${anime.title}</h3>
          <p class="anime-meta">${anime.kind} • ${anime.year} • ${anime.season}</p>
        </div>
      </div>

      <div class="genre-row">
        ${anime.genres.map((genre) => `<span class="genre-tag">${genre}</span>`).join("")}
      </div>

      <div class="anime-footer">
        <div class="score-box"><span class="star"></span> ${anime.score.toFixed(1)}</div>
        <div class="card-actions">
          <button class="favorite-btn ${isFavorite ? "active" : ""}" data-action="favorite" data-id="${anime.id}">
            ${isFavorite ? "♥" : "♡"}
          </button>
          <button class="watch-btn" data-action="watch" data-id="${anime.id}">+ Liste</button>
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
  const filtered = getFilteredAnime();

  if (!filtered.length) {
    animeGrid.innerHTML = '<div class="empty-state">Aucun anime ne correspond à votre recherche.</div>';
    return;
  }

  animeGrid.innerHTML = "";
  filtered.forEach((anime) => animeGrid.appendChild(buildAnimeCard(anime)));
}

function renderUpcoming() {
  const upcoming = [...animeData]
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
    .slice(0, 5);

  upcomingList.innerHTML = upcoming
    .map(
      (anime) => `
      <div class="upcoming-item">
        <div class="release-date"><strong>${anime.releaseDate.split(" ")[0]}</strong>${anime.releaseDate.split(" ")[1]}</div>
        <div class="upcoming-text">
          <h4>${anime.title}</h4>
          <p>${anime.season} • ${anime.genres.slice(0, 2).join(" • ")}</p>
        </div>
        <span class="meta-tag">${anime.status}</span>
      </div>
      `
    )
    .join("");
}

function renderWatchlist() {
  const favorites = animeData.filter((anime) => state.favorites.has(anime.id));

  if (!favorites.length) {
    watchlistItems.innerHTML = '<div class="empty-state">Votre watchlist est vide pour l’instant.</div>';
    return;
  }

  watchlistItems.innerHTML = favorites
    .map(
      (anime) => `
      <div class="watchlist-item">
        <div>
          <h4>${anime.title}</h4>
          <div class="watchlist-meta">
            <span>${anime.kind}</span>
            <span>${anime.season}</span>
            <span>Note ${state.ratings[anime.id] || "-"}/10</span>
          </div>
        </div>
        <button class="favorite-btn active" data-action="favorite" data-id="${anime.id}">♥</button>
      </div>
      `
    )
    .join("");
}

function renderAll() {
  renderStats();
  renderFeatured();
  renderAnimeGrid();
  renderUpcoming();
  renderWatchlist();
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderAnimeGrid();
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

renderAll();
