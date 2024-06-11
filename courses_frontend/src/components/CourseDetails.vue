<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" icon="pi pi-check" to="/">EduMaster</router-link>
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
  </div>

  <div class="container">
    <Button @click="goHome" class="btn btn-return mb-3" label="Wróć" />
    <div v-if="course">
      <div class="card mb-3">
        <div class="card-body row">
          <div class="col-md-8">
            <h3 class="card-title">Kurs {{ course.title }}</h3>
            <h4 class="card-subtitle mb-2 text-muted">O kursie</h4>
            <p class="card-text">{{ course.description }}</p>
            <h4 class="card-subtitle mb-2 text-muted">Czego się nauczysz?</h4>
            <p class="card-text">{{ course.props.join(', ') }}</p>
            <h4 class="card-subtitle mb-2 text-muted">Kategoria</h4>
            <p class="card-text">{{course.category}}</p>
          </div>
          <div class="col-md-4">
            <div class="d-flex flex-column justify-content-start h-100">
              <h4>Zapisz się na kurs</h4>
              <button @click="makeEnrollment" class="btn btn-blue w-100">Wyślij zapis</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';
import Textarea from 'primevue/textarea';

export default {
  name: 'CourseDetails',
  data() {
    return {
      course: null,
      userId: '',
      userName: '',
      userLastname: '',
      userType: 0, 
      userVersion: 0, 
    };
  },
  components: {
    Button,
    FloatLabel,
    Textarea,
  },
  async mounted() {
    await this.fetchCourseDetails();
    await this.fetchLoggedInUser(); 
  },
  methods: {
    async fetchCourseDetails() {
      try {
        const courseId = this.$route.query.courseId;
        const response = await axios.get(`http://localhost:5500/coursedb/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        this.course = response.data;
      } catch (error) {
        console.error('Błąd pobierania kursu:', error);
      }
    },
    async fetchLoggedInUser() {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error("Brak dostępnego tokenu autoryzacyjnego.");
        return;
      }
      const response = await axios.get('http://localhost:5500/coursedb/currentUser', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      this.userId = response.data._id;
      this.userName = response.data.name;
      this.userLastname = response.data.lastname;
      this.userType = response.data.type; 
      this.userVersion = response.data.__v;
    },
    async makeEnrollment() {
      try {
        const enrollmentData = {
          userId: this.userId,
          userName: this.userName,
          userLastname: this.userLastname,
          courseTitle: this.course.title,
        };
        const authToken = localStorage.getItem('authToken');
        const response = await axios.post('http://localhost:5500/coursedb/enrollments', enrollmentData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Zapis udany:', response.data);

        if (this.userType === 1 || this.userVersion === 1) {
          this.$router.push({ name: 'AdminView' });
        } else {
          this.$router.push({ name: 'HomePage' });
        }
      } catch (error) {
        console.error('Błąd podczas zapisu:', error);
      }
    },
    goHome() {
      this.$router.push({ name: 'HomePage' });
    },
  }
};
</script>

<style scoped>
.container {
  padding-left: 15px;
  padding-right: 15px;
}

.btn-return {
  background-color: rgb(0, 110, 255);
  color: white;
  margin-top: 15px;
  margin-bottom: 15px;
}

.btn-blue {
  background-color: rgb(0, 110, 255);
  color: white;
}

.mt-3 {
  margin-top: 15px;
}

.card-title {
  margin-bottom: 45px;
}

.card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-subtitle {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
</style>
