<template>
  <div class="home">
    <nav class="lists bg-white shadow py-2 text-sm">
      <div class="clamp flex justify-between">
        <div>
          <button
            v-for="[key, list] in Object.entries(lists)"
            :key="key"
            @click="() => handleListSelect(key)"
            :class="{ selected: selectedList === key }"
            class="py-2 px-3 rounded cursor-pointer"
          >
            {{ list.title }}
          </button>
        </div>
        <div>
          <button
            @click="() => handleSearchSelect()"
            :class="{ selected: searchSelected === true }"
            class="py-2 px-3 rounded cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>
    </nav>
    <div v-if="searchSelected" class="search clamp mt-4 mb-4">
      <label class="hidden" for="movie-search">Search for Movies</label>
      <input
        id="movie-search"
        type="text"
        v-model="query"
        placeholder="Search movie titles..."
        autocomplete="off"
        @input="handleSearch"
        class="border border-grey-100 shadow rounded-full px-3 py-2 w-full"
      />
    </div>

    <div class="movies clamp grid gap-4 my-4" v-if="filteredMovies.length">
      <div
        v-for="movie in filteredMovies"
        :key="movie.id"
        class="movie"
        :class="{ 'no-poster': !movie.poster_path }"
      >
        <img
          v-if="movie.poster_path"
          :src="getPosterUrl(movie.poster_path)"
          :alt="movie.title"
          class="rounded-xl"
        />
        <div v-else class="poster-placeholder bg-gray-700 rounded-xl"></div>
        <div class="movie-info bg-gray-950/90 px-3 py-4 rounded-t-xl">
          <h3 class="font-bold leading-tight mb-2 text-lg">
            {{ trimmedTitle(movie.title) }}
          </h3>
          <p class="text-xs">
            {{ movie.release_date ? movie.release_date.split("-")[0] : "N/A" }}
          </p>
        </div>
        <div
          v-if="!showLists"
          class="movie-controls bg-gray-950/90 px-2 py-2 rounded-b-xl flex flex-wrap gap-1.5"
        >
          <button
            v-for="list in defaultLists"
            :key="list.id"
            @click="
              () => {
                !list.movieIds.includes(movie.id)
                  ? handleAddMovie(list.id, movie)
                  : handleRemoveMovie(list.id, movie);
              }
            "
            :class="{ selected: list.movieIds.includes(movie.id) }"
          >
            {{ list.title }}
          </button>
          <button
            @click="
              () => {
                handleMore();
              }
            "
          >
            More...
          </button>
        </div>
        <div
          v-else
          class="movie-controls bg-gray-950/90 px-2 py-2 rounded-b-xl flex flex-wrap gap-1.5"
        >
          <button @click="handleCancelMore">&lt;</button>
          <button
            v-for="list in lists"
            :key="list.id"
            @click="
              () => {
                !list.movieIds.includes(movie.id)
                  ? handleAddMovie(list.id, movie)
                  : handleRemoveMovie(list.id, movie);
              }
            "
            :class="{ selected: list.movieIds.includes(movie.id) }"
          >
            {{ list.title }}
          </button>
        </div>
      </div>
    </div>

    <div v-else>
      <p v-if="query" class="text-center">
        No results found. Try searching for another title.
      </p>
    </div>
  </div>
</template>

<script>
import tmdb from "../tmdb"; // Import the TMDB API configuration
import debounce from "lodash.debounce";

export default {
  data() {
    return {
      query: "",
      movies: [],
      adding: null,
      showLists: false,
      selectedList: null,
      searchSelected: true,
      defaultLists: {
        i: {
          id: "i",
          title: "Interested",
          movies: [],
          movieIds: [],
        },
        l: {
          id: "l",
          title: "Liked",
          movies: [],
          movieIds: [],
        },
      },
      lists: {
        1: {
          id: 1,
          title: "Ocean",
          movies: [],
          movieIds: [],
        },
        2: {
          id: 2,
          title: "Filmcast",
          movies: [],
          movieIds: [],
        },
        3: {
          id: 3,
          title: "Faves",
          movies: [],
          movieIds: [],
        },
      },
    };
  },
  created() {
    // Create a debounced version of the search function
    this.debouncedSearch = debounce(this.executeSearch, 300); // 1-second debounce delay
    console.log(this.lists);
  },
  computed: {
    filteredMovies() {
      // Filter out movies without a release year
      return this.movies.filter((movie) => movie.release_date);
    },
  },
  methods: {
    handleSearch() {
      if (this.query.length < 1) {
        return;
      } else if (this.query.length === 1) {
        // If query length is 1, search instantly
        this.executeSearch();
      } else {
        // Debounce the search function for longer queries
        this.debouncedSearch();
      }
    },
    executeSearch() {
      if (this.query.trim() === "") {
        this.movies = [];
        return;
      }

      // Your search logic here
      tmdb
        .get("/search/movie", {
          params: {
            query: this.query,
            include_adult: false, // Exclude adult content
          },
        })
        .then((response) => {
          this.movies = response.data.results.sort(
            (a, b) => b.popularity - a.popularity
          );
        })
        .catch((error) => {
          console.error("Error fetching movies:", error);
        });
    },
    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w342${path}`;
    },
    trimmedTitle(title) {
      const maxLength = 30; // Set your maximum length here
      return title.length > maxLength
        ? title.substring(0, maxLength) + "..."
        : title;
    },
    handleMore() {
      this.showLists = true;
    },
    handleCancelMore() {
      this.showLists = false;
    },
    handleListSelect(listId) {
      this.selectedList = listId;
      this.searchSelected = false;
    },
    handleSearchSelect() {
      this.selectedList = null;
      this.searchSelected = true;
    },
    handleAddMovie(listKey, movie) {
      let lists =
        listKey == "i" || listKey == "l" ? this.defaultLists : this.lists;
      // Check if the movie already exists in the list using the movie's unique identifier (e.g., id)
      const movieExists = lists[listKey].movies.some(
        (existingMovie) => existingMovie.id === movie.id
      );

      // If the movie doesn't exist, add it to the list
      if (!movieExists) {
        lists[listKey].movies.push(movie);
        lists[listKey].movieIds.push(movie.id);
      }
      console.log(lists[listKey]);
    },
    handleRemoveMovie(listKey, movie) {
      let lists =
        listKey == "i" || listKey == "l" ? this.defaultLists : this.lists;
      // Filter out the movie with the matching id
      lists[listKey].movies = lists[listKey].movies.filter(
        (existingMovie) => existingMovie.id !== movie.id
      );
      lists[listKey].movieIds = lists[listKey].movieIds.filter(
        (existingMovieId) => existingMovieId !== movie.id
      );
    },
  },
};
</script>

<style scoped>
.container {
  justify-content: center;
}

nav .selected {
  @apply bg-gray-950 text-white;
}

.movie-controls .selected {
  @apply bg-white text-black;
}

.movies {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  flex-wrap: wrap;
  justify-items: center;
}

.movie {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  color: white;
  max-width: 240px;
}

.movie img {
  width: 100%;
  height: 100%;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
}

.movie:hover .movie-info,
.movie:hover .movie-controls {
  visibility: visible;
}

.movie-info {
  visibility: hidden;
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
}

.movie-controls {
  visibility: hidden;
  position: absolute !important;
  bottom: 0;
  left: 0;
  right: 0;
}

.movie-controls button {
  @apply border border-white px-2 py-1 rounded-sm text-xs flex-grow;
}

.no-poster .movie-info {
  visibility: visible;
  @apply bg-gray-700;
}
</style>
