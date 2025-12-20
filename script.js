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
      initializePage(sortedShows);
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

// This runs when the page is ready
function setup() {
  const rootElem = document.getElementById("root");
  showLoadingMessage(rootElem);

  // Fetch data only once when the page loads
  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function (allEpisodes) {
      initializePage(allEpisodes);
    })
    .catch(function () {
      showErrorMessage(rootElem);
    });
}

function showLoadingMessage(rootElem) {
  rootElem.textContent = "Loading episodes...";
}

function showErrorMessage(rootElem) {
  rootElem.textContent = "Failed to load episodes. Please try again later.";
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

function initializePage(shows) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const controls = document.createElement("section");

  const showLabel = document.createElement("label");
  showLabel.textContent = "Select a show:";
  showLabel.setAttribute("for", "show-select");

  const showSelect = document.createElement("select");
  showSelect.id = "show-select";

  const searchLabel = document.createElement("label");
  searchLabel.textContent = "Search episodes:";
  searchLabel.setAttribute("for", "episode-search");

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "episode-search";
  searchInput.placeholder = "Search by name or summary";

  const selectLabel = document.createElement("label");
  selectLabel.textContent = "Jump to episode:";
  selectLabel.setAttribute("for", "episode-select");

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  const episodeCount = document.createElement("p");

  controls.appendChild(showLabel);
  controls.appendChild(showSelect);
  controls.appendChild(searchLabel);
  controls.appendChild(searchInput);
  controls.appendChild(selectLabel);
  controls.appendChild(episodeSelect);
  controls.appendChild(episodeCount);
  rootElem.appendChild(controls);

  const statusMessage = document.createElement("p");
  rootElem.appendChild(statusMessage);

  const episodesContainer = document.createElement("div");
  rootElem.appendChild(episodesContainer);

  const credit = document.createElement("p");
  credit.innerHTML =
    'Data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
  rootElem.appendChild(credit);

  populateShowSelect(showSelect, shows);

  let currentEpisodes = [];
  let currentSearchTerm = "";

  function applySearch() {
    const filteredEpisodes = filterEpisodes(currentEpisodes, currentSearchTerm);
    renderEpisodes(episodesContainer, filteredEpisodes, currentEpisodes.length, episodeCount);
  }

  function loadEpisodesForShow(showId) {
    statusMessage.textContent = "Loading episodes...";
    episodesContainer.innerHTML = "";
    episodeCount.textContent = "";
    episodeSelect.innerHTML = "";
    currentEpisodes = [];

    fetchJsonOnce(EPISODES_URL_PREFIX + showId + "/episodes")
      .then(function (episodes) {
        currentEpisodes = episodes;
        populateEpisodeSelect(episodeSelect, currentEpisodes);
        currentSearchTerm = "";
        searchInput.value = "";
        statusMessage.textContent = "";
        applySearch();
      })
      .catch(function () {
        statusMessage.textContent = "Failed to load episodes. Please try again later.";
      });
  }

  showSelect.addEventListener("change", function () {
    const selectedShowId = showSelect.value;
    if (selectedShowId) {
      loadEpisodesForShow(selectedShowId);
    }
  });

  searchInput.addEventListener("input", function () {
    currentSearchTerm = searchInput.value.trim();
    applySearch();
  });

  episodeSelect.addEventListener("change", function () {
    const selectedId = episodeSelect.value;
    if (selectedId === "") {
      applySearch();
      return;
    }

    currentSearchTerm = "";
    searchInput.value = "";
    renderEpisodes(episodesContainer, currentEpisodes, currentEpisodes.length, episodeCount);

    const target = document.getElementById("episode-" + selectedId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  if (shows.length > 0) {
    showSelect.value = shows[0].id;
    loadEpisodesForShow(shows[0].id);
  } else {
    statusMessage.textContent = "No shows available.";
  }
}

function initializePage(allEpisodes) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const controls = document.createElement("section");

  const searchLabel = document.createElement("label");
  searchLabel.textContent = "Search episodes:";
  searchLabel.setAttribute("for", "episode-search");

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "episode-search";
  searchInput.placeholder = "Search by name or summary";

  const selectLabel = document.createElement("label");
  selectLabel.textContent = "Jump to episode:";
  selectLabel.setAttribute("for", "episode-select");

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  const episodeCount = document.createElement("p");

  controls.appendChild(searchLabel);
  controls.appendChild(searchInput);
  controls.appendChild(selectLabel);
  controls.appendChild(episodeSelect);
  controls.appendChild(episodeCount);
  rootElem.appendChild(controls);

  const episodesContainer = document.createElement("div");
  rootElem.appendChild(episodesContainer);

  const credit = document.createElement("p");
  credit.innerHTML =
    'Data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
  rootElem.appendChild(credit);

  populateEpisodeSelect(episodeSelect, allEpisodes);
  renderEpisodes(episodesContainer, allEpisodes, allEpisodes.length, episodeCount);

  let currentSearchTerm = "";

  searchInput.addEventListener("input", function () {
    currentSearchTerm = searchInput.value.trim();
    const filteredEpisodes = filterEpisodes(allEpisodes, currentSearchTerm);
    renderEpisodes(episodesContainer, filteredEpisodes, allEpisodes.length, episodeCount);
  });

  episodeSelect.addEventListener("change", function () {
    const selectedId = episodeSelect.value;
    if (selectedId === "") {
      const filteredEpisodes = filterEpisodes(allEpisodes, currentSearchTerm);
      renderEpisodes(episodesContainer, filteredEpisodes, allEpisodes.length, episodeCount);
      return;
    }

    currentSearchTerm = "";
    searchInput.value = "";
    renderEpisodes(episodesContainer, allEpisodes, allEpisodes.length, episodeCount);

    const target = document.getElementById("episode-" + selectedId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

function populateShowSelect(selectElem, shows) {
  selectElem.innerHTML = "";

  for (let i = 0; i < shows.length; i++) {
    const show = shows[i];
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selectElem.appendChild(option);
  }
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

  for (let i = 0; i < episodeList.length; i++) {
    const episode = episodeList[i];
    const card = document.createElement("section");
    card.id = "episode-" + episode.id;

    const title = document.createElement("h2");
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
    // Some summaries are already HTML text from TVMaze
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
