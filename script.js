//You can edit ALL of the code here

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
      makePageForEpisodes(allEpisodes);
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

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  // rootElem.textContent = `Got ${episodeList.length} episode(s)`;
  rootElem.innerHTML = "";

  const credit = document.createElement("p");
  credit.innerHTML =
    'Data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
  rootElem.appendChild(credit);

  for (let i = 0; i < episodeList.length; i++) {
    const episode = episodeList[i];
    const card = document.createElement("section");

    const title = document.createElement("h2");
    title.textContent = episode.name + " - " + makeEpisodeCode(episode.season, episode.number);
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

    rootElem.appendChild(card);
  }
}

window.onload = setup;
