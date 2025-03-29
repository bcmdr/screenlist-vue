<template>
  <div class="home">
    <nav class="lists bg-white shadow py-2 text-sm sticky top-0 z-20">
      <div class="clamp flex px-4 justify-between overflow-x-auto items-center">
        <div
          v-if="showSearch"
          class="search flex-1 flex gap-4 mr-4 items-center"
        >
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
            class="border border-grey-200 m-1 rounded-full px-3 py-2 w-full flex-1 text-base"
          />
          <button @click="showSearch = false">Back</button>
        </div>
        <div
          v-else
          class="flex gap-4 overflow-x-auto items-center justify-between pr-2"
        >
          <button
            v-for="[key, list] in [
              ...Object.entries(featuredLists),
              ...Object.entries(defaultLists),
              ...Object.entries(lists),
            ]"
            :key="key"
            @click="() => handleListSelect(list.id)"
            :class="{ 'font-bold': selectedList === list.id }"
            class="list-button"
          >
            {{ list.title }}
          </button>
        </div>
        <div class="flex-none">
          <button
            @click="toggleSearch"
            :class="{ selected: showSearch }"
            class="search-button px-3 rounded-lg border border-gray-200 shadow"
          >
            Search
          </button>
        </div>
      </div>
    </nav>

    <div
      v-if="preview"
      class="movie-preview sticky top-0 z-40 shadow-md border-b border-gray-800 bg-gray-950"
      :style="{
        backgroundImage: preview.backdrop_path
          ? `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.4) 100%), url(https://image.tmdb.org/t/p/w1280${preview.backdrop_path})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
      }"
    >
      <div class="clamp max-h-[100vh] overflow-y-auto p-10">
        <button
          class="text-sm text-white border border-white px-2 py-1 mb-4 float-right shadowed rounded"
          @click="preview = null"
        >
          Close
        </button>
        <h2 class="text-2xl font-bold mb-1">{{ preview.title }}</h2>
        <p class="text-sm text-yellow-300 mb-2">
          {{ getReleaseContext(preview.release_date, previewWatchProviders) }}
        </p>
        <p class="text-sm text-gray-300 mb-4">
          {{
            preview.release_date ? formatFullDate(preview.release_date) : "N/A"
          }}
        </p>
        <p class="mb-4">
          {{ preview.overview || "No description available." }}
        </p>
        <div class="text-sm space-y-2">
          <p><strong>Director:</strong> {{ previewDirector }}</p>
          <p><strong>Cast:</strong> {{ previewCast.join(", ") }}</p>
          <p>
            <strong>Streaming in Canada:</strong>
            <span
              v-if="previewWatchProviders.length"
              class="flex flex-wrap gap-2 mt-1"
            >
              <a
                v-for="provider in previewWatchProviders"
                :key="provider.provider_id"
                :href="`https://www.themoviedb.org/movie/${preview.id}/watch`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-block"
              >
                <img
                  :src="`https://image.tmdb.org/t/p/w45${provider.logo_path}`"
                  :alt="provider.provider_name"
                  class="h-6 w-auto"
                />
              </a>
            </span>
            <span v-else> Not available </span>
          </p>
          <p><strong>Save to list:</strong></p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="[key, list] in [...Object.entries(defaultLists)]"
              :key="key"
              @click="
                !list.movieIds.includes(preview.id)
                  ? handleAddMovie(list.id, preview)
                  : handleRemoveMovie(list.id, preview)
              "
              :class="{
                'bg-white text-black': list.movieIds.includes(preview.id),
                'text-white': !list.movieIds.includes(preview.id),
              }"
              class="px-3 py-1 rounded text-xs border border-white"
            >
              {{ list.title }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="movies clamp grid justify-center gap-4 mt-4 mb-4 px-4"
      v-if="filteredMovies.length"
    >
      <div
        v-for="movie in filteredMovies"
        :key="movie.id"
        class="movie"
        :class="{ 'no-poster': !movie.poster_path }"
        @click="handlePosterClick($event, movie)"
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
        </div>
      </div>
      <div
        v-if="selectedList === 'f' && movies.length"
        class="movie load-more flex items-center justify-center cursor-pointer bg-gray-300 rounded-xl"
        @click="loadMoreFeatured"
      >
        <span class="text-gray-700 font-bold text-center">Load More</span>
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
  data() {
    return {
      query: "",
      movies: [],
      preview: null,
      adding: null,
      selectedList: "f",
      page: 1,
      loadingMore: false,
      totalPages: null,
      showSearch: false,
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
        s: {
          id: "s",
          title: "Seen",
          movies: [],
          movieIds: [],
        },
      },
      lists: {},
      previewCast: [],
      previewDirector: "",
      previewWatchProviders: [],
    };
  },
  // watch: {
  //   showSearch(val) {
  //     if (val) {
  //       this.handleSearchSelect();
  //     }
  //   },
  // },
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
    const stored = localStorage.getItem("defaultLists");
    if (stored) {
      const parsed = JSON.parse(stored);
      for (const key in parsed) {
        if (this.defaultLists[key]) {
          this.defaultLists[key].movies = parsed[key].movies || [];
          this.defaultLists[key].movieIds = parsed[key].movieIds || [];
        }
      }
    }
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
    toggleSearch() {
      this.showSearch = !this.showSearch;
      if (this.showSearch) {
        this.$nextTick(() => {
          this.$refs.searchInput?.focus();
        });
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
            region: "CA",
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
    handleListSelect(listKey) {
      // Close the preview
      this.preview = null;

      if (listKey === "f") {
        this.selectedList = listKey;
        this.fetchFeaturedMovies();
      } else {
        const sourceLists = this.defaultLists;
        this.selectedList = listKey;
        this.movies = sourceLists[listKey]?.movies || [];
      }

      // Scroll to top after loading
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    handleSearchSelect() {
      // this.movies = this.searchMovies;
    },
    handleAddMovie(listKey, movie) {
      const id = movie.id;
      const lists = this.defaultLists;

      if (listKey === "i") {
        if (!lists.i.movieIds.includes(id)) {
          lists.i.movies.push(movie);
          lists.i.movieIds.push(id);
        }
      }

      if (listKey === "s") {
        if (!lists.s.movieIds.includes(id)) {
          lists.s.movies.push(movie);
          lists.s.movieIds.push(id);
        }
        // Remove from Interested
        this.handleRemoveMovie("i", movie);
      }

      if (listKey === "l") {
        // Ensure it's Seen first
        if (!lists.s.movieIds.includes(id)) {
          this.handleAddMovie("s", movie);
        }
        if (!lists.l.movieIds.includes(id)) {
          lists.l.movies.push(movie);
          lists.l.movieIds.push(id);
        }
        // Remove from Interested
        this.handleRemoveMovie("i", movie);
      }

      this.saveListsToStorage();
    },
    handleRemoveMovie(listKey, movie) {
      const id = movie.id;
      const lists = this.defaultLists;

      lists[listKey].movies = lists[listKey].movies.filter((m) => m.id !== id);
      lists[listKey].movieIds = lists[listKey].movieIds.filter(
        (mid) => mid !== id
      );

      // If removing from Seen, also remove from Liked
      if (listKey === "s" && lists.l.movieIds.includes(id)) {
        this.handleRemoveMovie("l", movie);
      }

      this.saveListsToStorage();
    },
    saveListsToStorage() {
      localStorage.setItem("defaultLists", JSON.stringify(this.defaultLists));
    },
    handlePosterClick(event, movie) {
      if (event.target.tagName.toLowerCase() !== "button") {
        if (this.preview?.id === movie.id) return;
        this.preview = movie;
        this.fetchPreviewDetails(movie);
      }
    },
    fetchPreviewDetails(movie) {
      const id = movie.id;
      this.previewCast = [];
      this.previewDirector = "";
      this.previewWatchProviders = [];

      tmdb.get(`/movie/${id}/credits`).then((res) => {
        const cast = res.data.cast.map((m) => m.name).slice(0, 5);
        const director = res.data.crew.find((c) => c.job === "Director");
        this.previewCast = cast;
        this.previewDirector = director?.name || "Unknown";
      });

      tmdb.get(`/movie/${id}/watch/providers`).then((res) => {
        const ca = res.data.results?.CA;
        if (ca && ca.flatrate) {
          this.previewWatchProviders = ca.flatrate;
        }
      });
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
    getReleaseStatus(dateStr) {
      const today = new Date();
      const releaseDate = new Date(dateStr);
      const diffDays = (releaseDate - today) / (1000 * 60 * 60 * 24);

      if (diffDays < -30) {
        return `Released on ${releaseDate.toDateString()}`;
      } else if (diffDays < 0) {
        return "Now Playing";
      } else {
        return `Releases on ${releaseDate.toDateString()}`;
      }
    },
    formatFullDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getFullYear()}, ${date.toLocaleDateString(undefined, {
        month: "long",
        day: "2-digit",
      })}`;
    },
    getReleaseContext(dateStr, providers) {
      const today = new Date();
      const releaseDate = new Date(dateStr);
      const diffDays = (releaseDate - today) / (1000 * 60 * 60 * 24);

      if (diffDays > 0) {
        return "Coming Soon";
      } else if (providers.length > 0) {
        return "Streaming";
      } else if (diffDays < 0 && diffDays > -45) {
        return "Now in Theatres";
      } else {
        return "";
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
  @apply py-2 cursor-pointer text-black;
}
nav.lists .search-button.selected {
  @apply bg-gray-950 text-white;
}
.movie-controls .selected {
  @apply bg-white text-black;
}

.movies {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.movie {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  color: white;
  max-width: 200px;
  z-index: 1;
  height: 100%;
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

.shadow-bottom {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
