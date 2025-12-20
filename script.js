//You can edit ALL of the code here

const SHOWS_URL = "https://api.tvmaze.com/shows";
const EPISODES_URL_PREFIX = "https://api.tvmaze.com/shows/";
const fetchCache = {};

function fetchJsonOnce(url) {
  if (!fetchCache[url]) {
    fetchCache[url] = fetch(url).then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    });
  }

  return fetchCache[url];
}

// This runs when the page is ready
function setup() {
  const rootElem = document.getElementById("root");
  showLoadingMessage(rootElem, "Loading shows...");

  fetchJsonOnce(SHOWS_URL)
    .then(function (shows) {
      const sortedShows = sortShows(shows);
      initializeApp(sortedShows);
    })
    .catch(function () {
      showErrorMessage(rootElem, "Failed to load shows. Please try again later.");
    });
}

function showLoadingMessage(rootElem, message) {
  rootElem.textContent = message || "Loading...";
}

function showErrorMessage(rootElem, message) {
  rootElem.textContent = message || "Something went wrong.";
}

// Adds a zero to numbers under 10, example: 3 -> "03"
function padToTwoDigits(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number.toString();
}

function makeEpisodeCode(season, episodeNumber) {
  return "S" + padToTwoDigits(season) + "E" + padToTwoDigits(episodeNumber);
}

function sortShows(shows) {
  return shows.slice().sort(function (a, b) {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
}

function stripHtml(html) {
  if (!html) {
    return "";
  }
  return html.replace(/<[^>]*>/g, " ");
}

function filterShows(shows, searchTerm) {
  if (!searchTerm) {
    return shows;
  }

  const lowerTerm = searchTerm.toLowerCase();
  return shows.filter(function (show) {
    const nameMatch = show.name.toLowerCase().includes(lowerTerm);
    const genreMatch = show.genres.join(" ").toLowerCase().includes(lowerTerm);
    const summaryMatch = stripHtml(show.summary).toLowerCase().includes(lowerTerm);
    return nameMatch || genreMatch || summaryMatch;
  });
}

function filterEpisodes(episodes, searchTerm) {
  if (!searchTerm) {
    return episodes;
  }

  const lowerTerm = searchTerm.toLowerCase();
  return episodes.filter(function (episode) {
    const nameMatch = episode.name.toLowerCase().includes(lowerTerm);
    const summaryMatch = (episode.summary || "").toLowerCase().includes(lowerTerm);
    return nameMatch || summaryMatch;
  });
}

function initializeApp(shows) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const header = document.createElement("header");
  header.className = "site-header";

  const title = document.createElement("h1");
  title.textContent = "TV Show Explorer";
  header.appendChild(title);

  const nav = document.createElement("nav");
  nav.className = "site-nav";

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "nav-link is-hidden";
  backButton.textContent = "Back to shows";
  nav.appendChild(backButton);

  header.appendChild(nav);
  rootElem.appendChild(header);

  const main = document.createElement("main");
  main.className = "site-main";
  rootElem.appendChild(main);

  const showsSection = document.createElement("section");
  showsSection.className = "shows-view";
  main.appendChild(showsSection);

  const showsControls = document.createElement("div");
  showsControls.className = "shows-controls";

  const showSearchLabel = document.createElement("label");
  showSearchLabel.textContent = "Search shows:";
  showSearchLabel.setAttribute("for", "show-search");

  const showSearchInput = document.createElement("input");
  showSearchInput.type = "text";
  showSearchInput.id = "show-search";
  showSearchInput.placeholder = "Search by name, genre, or summary";

  const showCount = document.createElement("p");
  showCount.className = "results-count";

  showsControls.appendChild(showSearchLabel);
  showsControls.appendChild(showSearchInput);
  showsControls.appendChild(showCount);
  showsSection.appendChild(showsControls);

  const showsGrid = document.createElement("div");
  showsGrid.className = "shows-grid";
  showsSection.appendChild(showsGrid);

  const episodesSection = document.createElement("section");
  episodesSection.className = "episodes-view is-hidden";
  main.appendChild(episodesSection);

  const episodesHeader = document.createElement("div");
  episodesHeader.className = "episodes-header";

  const showTitle = document.createElement("h2");
  showTitle.textContent = "Episodes";
  episodesHeader.appendChild(showTitle);

  episodesSection.appendChild(episodesHeader);

  const episodesControls = document.createElement("div");
  episodesControls.className = "episodes-controls";

  const episodeSearchLabel = document.createElement("label");
  episodeSearchLabel.textContent = "Search episodes:";
  episodeSearchLabel.setAttribute("for", "episode-search");

  const episodeSearchInput = document.createElement("input");
  episodeSearchInput.type = "text";
  episodeSearchInput.id = "episode-search";
  episodeSearchInput.placeholder = "Search by name or summary";

  const episodeSelectLabel = document.createElement("label");
  episodeSelectLabel.textContent = "Jump to episode:";
  episodeSelectLabel.setAttribute("for", "episode-select");

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  const episodeCount = document.createElement("p");
  episodeCount.className = "results-count";

  episodesControls.appendChild(episodeSearchLabel);
  episodesControls.appendChild(episodeSearchInput);
  episodesControls.appendChild(episodeSelectLabel);
  episodesControls.appendChild(episodeSelect);
  episodesControls.appendChild(episodeCount);
  episodesSection.appendChild(episodesControls);

  const episodeStatus = document.createElement("p");
  episodeStatus.className = "status-message";
  episodesSection.appendChild(episodeStatus);

  const episodesContainer = document.createElement("div");
  episodesContainer.className = "episodes-list";
  episodesSection.appendChild(episodesContainer);

  const credit = document.createElement("p");
  credit.className = "credit";
  credit.innerHTML =
    'Data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
  rootElem.appendChild(credit);

  let currentEpisodes = [];
  let currentEpisodeSearch = "";
  let showSearchTerm = "";

  function updateShowsList(list) {
    showsGrid.innerHTML = "";
    showCount.textContent =
      "Showing " + list.length + " / " + shows.length + " shows";

    if (list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No shows match your search.";
      showsGrid.appendChild(empty);
      return;
    }

    for (let i = 0; i < list.length; i++) {
      const show = list[i];
      const card = document.createElement("article");
      card.className = "show-card";

      const imageWrap = document.createElement("div");
      imageWrap.className = "show-image";

      if (show.image && show.image.medium) {
        const image = document.createElement("img");
        image.src = show.image.medium;
        image.alt = show.name;
        imageWrap.appendChild(image);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "image-placeholder";
        placeholder.textContent = "No image";
        imageWrap.appendChild(placeholder);
      }

      card.appendChild(imageWrap);

      const body = document.createElement("div");
      body.className = "show-body";

      const nameButton = document.createElement("button");
      nameButton.type = "button";
      nameButton.className = "show-title";
      nameButton.textContent = show.name;
      nameButton.addEventListener("click", function () {
        openShow(show);
      });

      const metaList = document.createElement("ul");
      metaList.className = "show-meta";

      const genresText = show.genres.length ? show.genres.join(", ") : "None";
      const statusText = show.status || "Unknown";
      const ratingText =
        show.rating && show.rating.average !== null ? show.rating.average : "N/A";
      const runtimeText = show.runtime ? show.runtime + " min" : "N/A";

      const genreItem = document.createElement("li");
      genreItem.textContent = "Genres: " + genresText;
      const statusItem = document.createElement("li");
      statusItem.textContent = "Status: " + statusText;
      const ratingItem = document.createElement("li");
      ratingItem.textContent = "Rating: " + ratingText;
      const runtimeItem = document.createElement("li");
      runtimeItem.textContent = "Runtime: " + runtimeText;

      metaList.appendChild(genreItem);
      metaList.appendChild(statusItem);
      metaList.appendChild(ratingItem);
      metaList.appendChild(runtimeItem);

      const summary = document.createElement("div");
      summary.className = "show-summary";
      if (show.summary) {
        summary.innerHTML = show.summary;
      } else {
        summary.textContent = "No summary available.";
      }

      body.appendChild(nameButton);
      body.appendChild(metaList);
      body.appendChild(summary);

      card.appendChild(body);
      showsGrid.appendChild(card);
    }
  }

  function applyEpisodeSearch() {
    const filtered = filterEpisodes(currentEpisodes, currentEpisodeSearch);
    renderEpisodes(episodesContainer, filtered, currentEpisodes.length, episodeCount);
  }

  function openShow(show) {
    showsSection.classList.add("is-hidden");
    episodesSection.classList.remove("is-hidden");
    backButton.classList.remove("is-hidden");

    showTitle.textContent = show.name;
    episodeStatus.textContent = "Loading episodes...";
    episodesContainer.innerHTML = "";
    episodeCount.textContent = "";
    episodeSelect.innerHTML = "";
    currentEpisodes = [];
    currentEpisodeSearch = "";
    episodeSearchInput.value = "";

    fetchJsonOnce(EPISODES_URL_PREFIX + show.id + "/episodes")
      .then(function (episodes) {
        currentEpisodes = episodes;
        populateEpisodeSelect(episodeSelect, currentEpisodes);
        episodeStatus.textContent = "";
        applyEpisodeSearch();
      })
      .catch(function () {
        episodeStatus.textContent = "Failed to load episodes. Please try again later.";
      });
  }

  backButton.addEventListener("click", function () {
    showsSection.classList.remove("is-hidden");
    episodesSection.classList.add("is-hidden");
    backButton.classList.add("is-hidden");
  });

  showSearchInput.addEventListener("input", function () {
    showSearchTerm = showSearchInput.value.trim();
    const filteredShows = filterShows(shows, showSearchTerm);
    updateShowsList(filteredShows);
  });

  episodeSearchInput.addEventListener("input", function () {
    currentEpisodeSearch = episodeSearchInput.value.trim();
    applyEpisodeSearch();
  });

  episodeSelect.addEventListener("change", function () {
    const selectedId = episodeSelect.value;
    if (selectedId === "") {
      applyEpisodeSearch();
      return;
    }

    currentEpisodeSearch = "";
    episodeSearchInput.value = "";
    renderEpisodes(episodesContainer, currentEpisodes, currentEpisodes.length, episodeCount);

    const target = document.getElementById("episode-" + selectedId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  updateShowsList(shows);
}

function populateEpisodeSelect(selectElem, episodes) {
  selectElem.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All episodes";
  selectElem.appendChild(allOption);

  for (let i = 0; i < episodes.length; i++) {
    const episode = episodes[i];
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent =
      makeEpisodeCode(episode.season, episode.number) + " - " + episode.name;
    selectElem.appendChild(option);
  }
}

function renderEpisodes(container, episodeList, totalCount, countElem) {
  container.innerHTML = "";
  countElem.textContent =
    "Displaying " + episodeList.length + " / " + totalCount + " episodes";

  if (episodeList.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No episodes match your search.";
    container.appendChild(empty);
    return;
  }

  for (let i = 0; i < episodeList.length; i++) {
    const episode = episodeList[i];
    const card = document.createElement("section");
    card.className = "episode-card";
    card.id = "episode-" + episode.id;

    const title = document.createElement("h3");
    title.textContent =
      episode.name + " - " + makeEpisodeCode(episode.season, episode.number);
    card.appendChild(title);

    const info = document.createElement("p");
    info.textContent = "Season " + episode.season + " Episode " + episode.number;
    card.appendChild(info);

    if (episode.image && episode.image.medium) {
      const image = document.createElement("img");
      image.src = episode.image.medium;
      image.alt = episode.name;
      card.appendChild(image);
    }

    const summaryBox = document.createElement("div");
    summaryBox.className = "episode-summary";
    if (episode.summary) {
      summaryBox.innerHTML = episode.summary;
    } else {
      summaryBox.textContent = "No summary for this episode.";
    }
    card.appendChild(summaryBox);

    container.appendChild(card);
  }
}

window.onload = setup;
