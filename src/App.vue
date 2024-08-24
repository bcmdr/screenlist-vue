<!-- src/App.vue -->
<template>
  <TopNav />
  <div class="container">
    <router-view />
  </div>
</template>

<script>
import TopNav from "./components/TopNav.vue";

export default {
  name: "App",
  components: {
    TopNav,
  },
};
</script>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  --max-width: 1260px;
}

body {
  margin: 0;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.5em 1em;
  font-size: 0.9em;
  font-weight: 500;
  font-family: inherit;
  background-color: white;
  cursor: pointer;
}

.container {
  max-width: var(--max-width);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: red; */
  margin: auto;
}
</style>
