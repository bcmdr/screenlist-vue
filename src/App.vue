<template>
  <div class="page">
    <main class="page-body">
      <router-view :show-search="showSearch" />
    </main>
    <Footer class="page-bottom" />
  </div>
</template>

<script>
import TopNav from "./components/TopNav.vue";
import Footer from "./components/Footer.vue";

import emitter from "./eventBus";

export default {
  name: "App",
  components: {
    TopNav,
    Footer,
  },
  data() {
    return {
      showSearch: true,
      focusSearch: false,
    };
  },
  mounted() {
    emitter.on("focus-search", () => {
      this.focusSearch = true;
    });
    emitter.on("unfocus-search", () => {
      this.focusSearch = false;
    });
  },
  beforeUnmount() {
    emitter.off("focus-search");
    emitter.off("unfocus-search");
  },
  methods: {
    activateSearchView() {
      if (!this.showSearch) {
        this.showSearch = true;
      }
      emitter.emit("focus-search");
    },
  },
};
</script>

<style>
body {
  @apply bg-gray-50;
}
.page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.page-top,
.page-bottom {
  flex-shrink: 0;
}
.page-body {
  flex-grow: 1;
}
</style>
