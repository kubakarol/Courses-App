<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h2 class="text-center mb-4">Zarejestruj się</h2>
        <form @submit.prevent="register">
          <div class="mb-3">
            <label for="name" class="form-label">Imię</label>
            <input type="text" class="form-control" id="name" v-model="name" required />
          </div>
          <div class="mb-3">
            <label for="lastname" class="form-label">Nazwisko</label>
            <input type="text" class="form-control" id="lastname" v-model="lastname" required />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="email" required />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Hasło</label>
            <input type="password" class="form-control" id="password" v-model="password" required />
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Potwierdź hasło</label>
            <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" required />
          </div>
          <button type="submit" class="btn btn-primary">Zarejestruj się</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      name: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      type: 0, // Domyślnie zwykły użytkownik
      error: "",
    };
  },
  methods: {
    async register() {
      if (this.password !== this.confirmPassword) {
        this.error = "Hasła nie są takie same.";
        return;
      }

      try {
        const response = await axios.post('http://localhost:5500/coursedb/users', {
          name: this.name,
          lastname: this.lastname,
          email: this.email,
          password: this.password,
          type: this.type, // Ustaw typ zgodnie z wyborem użytkownika
        });
        
        this.$router.push({ name: "HomePage" });
      } catch (error) {
        console.error("Registration error:", error);
        this.error = "Wystąpił błąd podczas rejestracji.";
      }
    },
  },
}
</script>
