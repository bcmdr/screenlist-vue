<template>
  <nav class="top-nav bg-gray-950">
    <div class="clamp flex justify-between items-center gap-2 px-4 py-3">
      <div class="logo">
        <a href="/">ScreenList</a>
      </div>
      <div class="action-menu min-h-3 flex gap-2">
        <!-- <button
          class="text-sm cursor-pointer"
          v-if="!user && !loading"
          @click="signInWithGoogle"
        >
          Sign In
        </button>
        <div v-if="menuOpen" class="dropdown-menu rounded">
          <button class="cursor-pointer" @click="signOut">Logout</button>
        </div>
        <div
          v-if="user && !loading"
          class="user-dropdown flex items-center gap-2"
        >
          <div @click="toggleMenu" class="cursor-pointer">
            <img
              v-if="user?.photoURL"
              :src="user.photoURL"
              alt="Profile"
              class="w-8 h-8 rounded-md object-cover"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold"
            >
              {{ user?.displayName?.[0] || "U" }}
            </div>
          </div>
        </div> -->
        <button
          @click="handleSearchClick"
          :class="[
            'text-sm rounded px-3 py-1 border',
            focusSearch
              ? 'bg-white text-black border-white'
              : 'text-white border-white bg-transparent',
          ]"
        >
          Search
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, toRefs } from "vue";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import emitter from "../eventBus";

export default {
  emits: ["toggle-search", "focus-search"],
  props: {
    focusSearch: {
      type: Boolean,
      default: false,
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const { showSearch } = toRefs(props);
    const user = ref(null);
    const menuOpen = ref(false);
    const loading = ref(true);

    // Watch for auth state changes
    onMounted(() => {
      auth.onAuthStateChanged((authUser) => {
        user.value = authUser;
        loading.value = false;
      });
    });

    const signInWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error signing in with Google:", error);
      }
    };

    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value;
      console.log(user);
    };

    const signOut = async () => {
      try {
        await firebaseSignOut(auth);
        user.value = null;
        menuOpen.value = false;
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };

    const handleSearchClick = () => {
      emit("toggle-search");
      emit("focus-search");
    };

    return {
      user,
      menuOpen,
      signInWithGoogle,
      toggleMenu,
      signOut,
      loading,
      handleSearchClick,
      showSearch,
    };
  },
};
</script>

<style scoped>
.top-nav {
  color: white;
}

.container {
  display: flex;
  justify-content: space-between;
}

.logo a {
  margin: 0;
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.action-menu {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 35px;
  right: 80px;
  background-color: white;
  color: black;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
</style>
