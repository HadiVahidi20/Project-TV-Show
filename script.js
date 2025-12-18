//Creates 2 continers = 1 container for Search bar and 2 container to the Cards
function setup() {
   const allEpisodes = getAllEpisodes();
   const rootElem = document.getElementById("root");

   // container Search Bar Selector
   const navContainer = document.createElement("div");
   navContainer.id = "nav-container";
   rootElem.appendChild(navContainer);

   //container Episodes
   const episodesContainer = document.createElement("div");
   episodesContainer.id = "episodes-container";
   rootElem.appendChild(episodesContainer);

   //Search Input
   const searchInput = document.createElement("input");
   searchInput.type = "text";
   searchInput.id = "search-input";
   searchInput.placeholder = "Search episodes...";
   searchInput.addEventListener("input", searchEpisodes);
   navContainer.appendChild(searchInput);

   //Select Dropdown 
   const episodeSelector = document.createElement("select");
   episodeSelector.id = "episode-selector";
   navContainer.appendChild(episodeSelector);

   //Episode
   const searchCountLabel = document.createElement("span");
   searchCountLabel.id = "search-count-label";
   searchCountLabel.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;
   navContainer.appendChild(searchCountLabel);

   //dropdown
   populateEpisodeSelector(allEpisodes);

   makePageForEpisodes(allEpisodes);
}

function searchEpisodes(event) {
   const searchTerm = event.target.value.toLowerCase();
   const allEpisodes = getAllEpisodes();

   const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);
      const summaryMatch = episode.summary.toLowerCase().includes(searchTerm);
      return nameMatch || summaryMatch;
   });

   const countLabel = document.getElementById("search-count-label");
   countLabel.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes`;

   makePageForEpisodes(filteredEpisodes);
}

// populate dropdown
function populateEpisodeSelector(allEpisodes) {
   const selector = document.getElementById("episode-selector");

   //Show All
   const defaultOption = document.createElement("option");
   defaultOption.value = "all";
   defaultOption.textContent = "Show All Episodes";
   selector.appendChild(defaultOption);

   //loop through episodes
   for (const episode of allEpisodes) {
      const option = document.createElement("option");
      option.value = episode.id;
      const code = makeEpisodeCode(episode.season, episode.number);
      option.textContent = `${code} - ${episode.name}`;
      selector.appendChild(option);
   }

   //listen for changes
   selector.addEventListener("change", selectEpisode);
}

//selection
function selectEpisode(event) {
   const selectedValue = event.target.value;
   const allEpisodes = getAllEpisodes();

   if (selectedValue === "all") {
      makePageForEpisodes(allEpisodes);
   } else {
      //find the episode by ID
      const selectedEpisode = allEpisodes.find(
         (episode) => episode.id == selectedValue
      );
      //show only episode
      makePageForEpisodes([selectedEpisode]);
   }
}

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
   const episodesContainer = document.getElementById("episodes-container");
   episodesContainer.innerHTML = "";

   const credit = document.createElement("p");
   credit.innerHTML =
      'Data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
   episodesContainer.appendChild(credit);

   for (let i = 0; i < episodeList.length; i++) {
      const episode = episodeList[i];
      const card = document.createElement("section");

      const title = document.createElement("h2");
      title.textContent =
         episode.name + " - " + makeEpisodeCode(episode.season, episode.number);
      card.appendChild(title);

      const info = document.createElement("p");
      info.textContent =
         "Season " + episode.season + " Episode " + episode.number;
      card.appendChild(info);

      if (episode.image && episode.image.medium) {
         const image = document.createElement("img");
         image.src = episode.image.medium;
         image.alt = episode.name;
         card.appendChild(image);
      }

      const summaryBox = document.createElement("div");
      if (episode.summary) {
         summaryBox.innerHTML = episode.summary;
      } else {
         summaryBox.textContent = "No summary for this episode.";
      }
      card.appendChild(summaryBox);

      episodesContainer.appendChild(card);
   }
}

window.onload = setup;
