<template>
  <div class="data-services">
    <h2>Kursy</h2>
    <div class="row">
      <div v-for="course in courses" :key="course._id" class="col mb-4">
        <Card style="width: 25rem; overflow: hidden" class="mx-auto mb-3">
          <template #header>
            <img :src="getImageUrl(course.imagePath) || '/src/assets/course.jpg'" alt="course" class="course-image" />
          </template>
          <template #title>{{ course.title }}</template>
          <template #subtitle>{{ course.props.join(', ') }}
          </template>
          <template #content>
            
            <p>{{ course.description }}</p>
          </template>
          <template #footer>
            <RouterLink :to="{ name: 'CourseDetails', query: { courseId: course._id } }">
              <Button class="btn btn-blue" label="Szczegóły" />
            </RouterLink>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from 'primevue/card';
import Button from 'primevue/button';

export default {
  name: 'DataServices',
  props: {
    courses: {
      type: Array,
      required: true
    }
  },
  methods: {
    getImageUrl(imagePath) {
      if (imagePath) {
        return `http://localhost:5500${imagePath}`;
      }
      return null;
    }
  }
};
</script>

<style scoped>
.data-services {
  width: 100%;
  padding: 25px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-image {
  width: 100%;
  height: 200px; 
  object-fit: cover; 
}

.btn-blue {
  background-color: rgb(0, 110, 255);
  color: white;
}
</style>
