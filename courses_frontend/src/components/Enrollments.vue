<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">EduMaster</router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link class="nav-link" to="/enrollments">Moje Kursy</router-link>
            </li>
            <li class="nav-item" v-if="isAdmin">
              <router-link class="nav-link" to="/courses">Dodaj Kurs</router-link>
            </li>
          </ul>
          <span class="navbar-text ms-auto me-3">Witaj, {{ userName || 'Gościu' }}</span>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search" style="color:blue"></InputIcon>
            <InputText v-model="searchQuery" @input="filterCourses" placeholder="Wyszukaj kursy" />
          </IconField>
        </div>
        <div class="ps-3">
          <Button @click="logout" class="btn btn-danger" label="Wyloguj" />
        </div>
      </div>
    </nav>

    <div class="container" style="margin-top: 15px;">
      <h2 class="mb-4 text-center">Twoje kursy</h2>
      <ul class="list-group">
        <li v-for="enrollment in enrollments" :key="enrollment._id" class="list-group-item mb-3">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Kurs: {{ enrollment.courseTitle }}</h3>
              <p class="card-text">Kategoria: {{ enrollment.category }}</p>
              <button class="btn btn-danger mt-3" @click="cancelEnrollment(enrollment._id)">Anuluj</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import 'primeicons/primeicons.css';

export default {
  name: "Enrollments",
  data() {
    return {
      enrollments: [],
      searchQuery: '',
      userName: '',
      isAdmin: false
    };
  },
  methods: {
    async fetchEnrollments() {
      try {
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`http://localhost:5500/coursedb/enrollments/${userId}`);
        this.enrollments = response.data;
      } catch (error) {
        console.error('Błąd pobierania kursów:', error);
      }
    },
    logout() {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      this.$router.push({ name: "LoginLayout" });
    },
    async cancelEnrollment(enrollmentId){
      try{
        const response = await axios.delete(`http://localhost:5500/coursedb/cancelEnrollment/${enrollmentId}`);
        if(response.status === 200){
          this.enrollments = this.enrollments.filter(enrollment => enrollment._id !== enrollmentId);
          this.fetchEnrollments();
        }
      }
      catch(error){
        console.error('Błąd anulowania zapisu:', error);
      }
    },
    async fetchLoggedInUser() {
      try {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        };
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          this.userName = user.name;
          this.isAdmin = user.type === 1 || user.__v === 1;
        } else {
          console.log('Brak zalogowanego użytkownika.');
          this.userName = 'Gość';
        }
      } catch (error) {
        console.error('Błąd pobierania danych użytkownika:', error);
        this.userName = 'Gość';
      }
    },
    filterCourses() {
      const query = this.searchQuery.toLowerCase();
      this.enrollments = this.enrollments.filter(enrollment =>
        enrollment.courseTitle.toLowerCase().includes(query)
      );
    }
  },
  mounted() {
    this.fetchEnrollments();
    this.fetchLoggedInUser();
  }
};
</script>

<style scoped>
.container {
  padding-left: 15px;
  padding-right: 15px;
}
</style>
