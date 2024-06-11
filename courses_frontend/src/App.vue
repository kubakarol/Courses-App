<script lang="ts">
import HomePage from "./components/HomePage.vue";
import SideBar from "./components/SideBar.vue";
import LoginLayout from "./views/LoginLayout.vue";
import DataServices from "./components/DataServices.vue"

export default {
  components: {
    HomePage,
    SideBar,
    LoginLayout,
    DataServices
  },
};
</script>

<template>
  <div id="app">
   <router-view />
   
    <main>
    </main>
  </div>
</template>

<style scoped></style>
