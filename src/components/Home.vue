<template>
  <div class="home">
    <nav class="lists bg-white shadow py-2 text-sm">
      <div class="clamp flex justify-between overflow-x-auto">
        <div class="flex">
          <button
            v-for="[key, list] in Object.entries(featuredLists)"
            :key="key"
            @click="() => handleListSelect(list.id)"
            :class="{ selected: selectedList === key }"
            class=""
          >
            {{ list.title }}
          </button>
          <button
            v-for="[key, list] in Object.entries(defaultLists)"
            :key="key"
            @click="() => handleListSelect(list.id)"
            :class="{ selected: selectedList === key }"
            class=""
          >
            {{ list.title }}
          </button>
        </div>
      </div>
    </nav>
    <div v-if="showSearch" class="search clamp mt-4 mb-4">
      <label class="hidden" for="movie-search">Search for Movies</label>
      <input
        ref="searchInput"
        id="movie-search"
        type="text"
        v-model="query"
        placeholder="Search movie titles..."
        autocomplete="off"
        @input="handleSearch"
        @blur="handleBlurSearch"
        @focus="handleFocusSearch"
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
        <div v-else class="poster-placeholder bg-gray-300 rounded-xl"></div>
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
      <div
        v-if="selectedList === 'f' && movies.length"
        class="movie load-more flex items-center justify-center cursor-pointer bg-gray-300 rounded-xl"
        @click="loadMoreFeatured"
      >
        <span class="text-black font-bold text-center">Load More</span>
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
import emitter from "../eventBus";

export default {
  emits: ["unfocus-search", "focus-search"],
  props: {
    showSearch: Boolean,
  },
  data() {
    return {
      query: "",
      movies: [],
      adding: null,
      showLists: false,
      selectedList: "f",
      page: 1,
      loadingMore: false,
      totalPages: null,
      featuredLists: {
        f: {
          id: "f",
          title: "Featured",
          movies: [],
          movieIds: [],
        },
      },
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
          title: "Friends",
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
  watch: {
    showSearch(val) {
      if (val) {
        this.handleSearchSelect();
      }
    },
  },
  mounted() {
    emitter.on("focus-search", this.focusSearchField);
    window.addEventListener("scroll", this.handleScroll);
    if (this.selectedList === "f") {
      this.fetchFeaturedMovies();
    }
  },
  beforeUnmount() {
    emitter.off("focus-search", this.focusSearchField);
    window.removeEventListener("scroll", this.handleScroll);
  },
  created() {
    // Create a debounced version of the search function
    this.debouncedSearch = debounce(this.executeSearch, 300); // 1-second debounce delay
    console.log(this.lists);
  },
  computed: {
    filteredMovies() {
      return (this.movies || []).filter((movie) => this.isAcceptable(movie));
    },
  },
  methods: {
    isAcceptable(movie) {
      return !movie.adult && movie?.release_dates?.certification !== null;
    },
    handleScroll() {
      const scrollThreshold = 300;
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - scrollThreshold;
      if (
        nearBottom &&
        this.selectedList === "f" &&
        !this.loadingMore &&
        (!this.totalPages || this.page < this.totalPages)
      ) {
        this.page++;
        this.fetchFeaturedMovies();
      }
    },
    handleSearch() {
      this.selectedList = null;
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
    handleBlurSearch() {
      emitter.emit("unfocus-search");
    },
    handleFocusSearch() {
      emitter.emit("focus-search");
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
            region: "US",
          },
        })
        .then((response) => {
          const filtered = response.data.results.filter(
            (movie) => !movie.adult
          );
          this.movies = filtered.sort((a, b) => b.popularity - a.popularity);
          this.searchMovies = this.movies;
        })
        .catch((error) => {
          console.error("Error fetching movies:", error);
        });
    },
    fetchFeaturedMovies() {
      if (this.loadingMore) return;
      this.loadingMore = true;
      tmdb
        .get("/movie/popular", { params: { page: this.page } })
        .then((response) => {
          // Capture total pages from the API response
          this.totalPages = response.data.total_pages;
          // Filter out adult movies
          const results = response.data.results.filter((movie) => !movie.adult);
          if (this.page === 1) {
            this.featuredLists.f.movies = results;
          } else {
            this.featuredLists.f.movies.push(...results);
          }
          this.featuredLists.f.movieIds = this.featuredLists.f.movies.map(
            (m) => m.id
          );
          this.movies = this.featuredLists.f.movies;
        })
        .catch((error) => {
          console.error("Error fetching featured movies:", error);
        })
        .finally(() => {
          this.loadingMore = false;
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
    handleListSelect(listKey) {
      let lists =
        listKey == "i" || listKey == "l" ? this.defaultLists : this.lists;
      this.selectedList = listKey;
      if (listKey === "f") {
        this.fetchFeaturedMovies();
      } else {
        this.movies = lists[listKey]?.movies;
      }
    },
    handleSearchSelect() {
      this.movies = this.searchMovies;
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
    focusSearchField() {
      this.$nextTick(() => {
        this.$refs.searchInput?.focus();
      });
    },
    loadMoreFeatured() {
      if (
        this.selectedList === "f" &&
        (!this.totalPages || this.page < this.totalPages)
      ) {
        this.page++;
        this.fetchFeaturedMovies();
      }
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

nav.lists button {
  @apply py-2 px-3 rounded cursor-pointer;
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
  max-width: 200px;
  z-index: 1;
}

.movie img {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
}

.movie:hover .movie-info {
  display: block;
}
.movie:hover .movie-controls {
  display: flex;
}

.movie-info {
  display: none;
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.movie-controls {
  display: none;
  position: absolute !important;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.movie-controls button {
  @apply border border-white px-2 py-1 rounded-sm text-xs flex-grow;
}

.no-poster .movie-info {
  display: block;
  @apply bg-gray-500;
}
</style>
