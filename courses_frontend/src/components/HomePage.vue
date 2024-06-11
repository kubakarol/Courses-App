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
              <router-link class="nav-link" to="/admin">Dodaj Kurs</router-link>
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

    <div class="main-container">
      <div class="sidebar">
        <SideBar @applyFilters="applyFilters" />
      </div>
      <div class="courses">
        <DataServices :courses="filteredCourses" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import DataServices from './DataServices.vue';
import SideBar from './SideBar.vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import 'primeicons/primeicons.css';

export default {
  name: 'HomePage',
  components: {
    DataServices,
    SideBar
  },
  data() {
    return {
      courses: [],
      filteredCourses: [],
      searchQuery: '',
      userName: '',
      isAdmin: false,
    };
  },
  async mounted() {
    await this.fetchCourses();
    await this.fetchLoggedInUser();
  },
  methods: {
    async fetchCourses() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5500/coursedb/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.courses = response.data;
        this.filteredCourses = this.courses;
      } catch (error) {
        console.error('Błąd pobierania kursów:', error);
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
          this.isAdmin = user.__v || user.type === 1;
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
      this.filteredCourses = this.courses.filter(course =>
        course.title.toLowerCase().includes(query)
      );
    },
    applyFilters({ category, props }) {
      this.filteredCourses = this.courses.filter(course => {
        const matchesCategory = category ? course.category === category : true;
        const matchesProps = props.length ? props.every(prop => course.props.includes(prop)) : true;
        return matchesCategory && matchesProps;
      });
    },
    logout() {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      this.$router.push({ name: "LoginLayout" });
    }
  }
};
</script>

<style scoped>
.navbar-search {
  width: 200px;
}

.navbar-text {
  color: white;
}

.main-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 15px;
}

.sidebar {
  flex: 0 0 180px;
  background-color: #f8f9fa;
  padding: 15px;
  box-sizing: border-box;
}

.courses {
  flex: 1;
  padding: 5px;
  margin-left: 15px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
