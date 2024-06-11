<template>
  <div>
    <!-- Navbar -->
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
            <li class="nav-item">
              <router-link class="nav-link" to="/admin">Dodaj Kurs</router-link>
            </li>
          </ul>
          <span class="navbar-text ms-auto me-3">Witaj, {{ userName || 'Gościu' }}</span>
          <!-- Pole wyszukiwania -->
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

    <!-- Sekcja Dodawania i Listy Kursów -->
    <div class="container mt-4">
      <h2>Dodaj Nowy Kurs</h2>
      <form @submit.prevent="addCourse">
        <div class="mb-3">
          <label for="title" class="form-label">Tytuł Kursu</label>
          <input type="text" class="form-control" v-model="newCourse.title" required />
        </div>
        <div class="mb-3">
          <label for="props" class="form-label">Atrybuty Kursu</label>
          <div class="card flex justify-content-center">
            <MultiSelect v-model="newCourse.props" :options="props" optionLabel="name" optionValue="code" placeholder="Wybierz atrybuty"
              class="w-full md:w-20rem" required/>
          </div>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Opis</label>
          <textarea class="form-control" v-model="newCourse.description" required></textarea>
        </div>
        <div class="mb-3">
          <label for="category" class="form-label">Kategoria</label>
          <input type="text" class="form-control" v-model="newCourse.category" required />
        </div>
        <div class="mb-3">
            <label for="image" class="form-label">Obraz</label>
            <input type="file" class="form-control" @change="handleFileUpload" />
        </div>
        <button type="submit" class="btn btn-primary">Dodaj Kurs</button>
      </form>
    </div>

    <!-- Lista Dostępnych Kursów -->
    <div class="container mt-4">
      <h2>Dostępne Kursy</h2>
      <DataTable :value="courses" class="mt-4">
        <Column field="title" header="Tytuł"></Column>
        <Column field="props" header="Atrybuty"></Column>
        <Column field="category" header="Kategoria"></Column>
        <Column header="Akcje">
          <template #body="slotProps">
            <button class="btn btn-danger ms-2" @click="deleteCourse(slotProps.data._id)">
              Usuń
            </button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import 'primeicons/primeicons.css';

export default {
  name: "AdminView",
  components: {
    DataTable,
    Column,
    MultiSelect,
    Button,
    InputText,
    IconField
  },
  data() {
    return {
      courses: [],
      newCourse: {
        title: '',
        props: [],  
        description: '',
        category: '',
        imageFile: null
      },
      props: [
        { name: 'Programowanie', code: 'Programowanie' },
        { name: 'Marketing', code: 'Marketing' },
        { name: 'Biznes', code: 'Biznes' },
        { name: 'Design', code: 'Design' },
        { name: 'Fotografia', code: 'Fotografia' },
        { name: 'Muzyka', code: 'Muzyka' },
        { name: 'Języki', code: 'Języki' },
        { name: 'Inne', code: 'Inne' },
      ],
      searchQuery: '',
      userName: '',
      isAdmin: false
    };
  },
  methods: {
    handleFileUpload(event) {
      this.newCourse.imageFile = event.target.files[0];
    },

    async fetchCourses() {
      try {
        const response = await axios.get('http://localhost:5500/coursedb/courses');
        this.courses = response.data;
        this.courses.forEach(course => {
          course.props = course.props.join(', ');
        });
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    },

    async addCourse() {
      const formData = new FormData();
      formData.append('title', this.newCourse.title);
      formData.append('props', JSON.stringify(this.newCourse.props));
      formData.append('description', this.newCourse.description);
      formData.append('category', this.newCourse.category);
      if (this.newCourse.imageFile) {
        formData.append('image', this.newCourse.imageFile);
      }

      try {
        const response = await axios.post('http://localhost:5500/coursedb/addCourses', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.courses.push(response.data);
        this.resetCourseForm();
      } catch (error) {
        console.error('Error adding course:', error);
      }
    },

    resetCourseForm() {
      this.newCourse = {
        title: '',
        props: [],
        description: '',
        category: '',
        imageFile: null
      };
    },

    async deleteCourse(courseId) {
      try {
        await axios.delete(`http://localhost:5500/coursedb/deleteCourses/${courseId}`);
        this.courses = this.courses.filter(course => course._id !== courseId);
      } catch (error) {
        console.error('Error deleting course:', error);
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

    logout() {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      this.$router.push({ name: "LoginLayout" });
    },

    filterCourses() {
      const query = this.searchQuery.toLowerCase();
      this.courses = this.courses.filter(course =>
        course.title.toLowerCase().includes(query)
      );
    }
  },
  mounted() {
    this.fetchCourses();
    this.fetchLoggedInUser();
  }
};
</script>

<style scoped>
.container {
  padding-left: 15px;
  padding-right: 15px;
}

.ms-2 {
  margin-left: 0.5rem;
}
</style>
