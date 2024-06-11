<template>
  <div>
    <h2>Użytkownicy</h2>
    <ul>
      <li v-for="user in users" :key="user._id">
        {{ user.name }} {{ user.lastname }} - {{ user.email }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: []
    };
    },
    mounted() {
      this.fetchUsers();
    },
    methods: {
      async fetchUsers() {
        try {
          const response = await axios.get('http://localhost:5500/coursedb/users');
          this.users = response.data;
        } catch (error) {
          console.error('Błąd pobierania użytkowników:', error);
        }
      }
    }
  };
</script>
