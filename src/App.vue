<!-- src/App.vue -->
<template>
  <div class="page">
    <TopNav class="page-top" />
    <main class="clamp page-body">
      <router-view />
    </main>
    <Footer class="page-bottom" />
  </div>
</template>

<script>
import TopNav from "./components/TopNav.vue";
import Footer from "./components/Footer.vue";

export default {
  name: "App",
  components: {
    TopNav,
    Footer,
  },
};
</script>

<style>
body {
  @apply bg-gray-50;
}
.page {
  min-height: 100vh;
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
.clamp {
  max-width: var(--max-width);
  width: 100%;
  /* background: red; */
  margin: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>
