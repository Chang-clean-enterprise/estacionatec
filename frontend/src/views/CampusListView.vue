<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getCampuses } from '../api/client';
import { useAsyncData } from '../composables/useAsyncData';

const { data: campuses, loading, error, load } = useAsyncData(getCampuses);
onMounted(load);
</script>

<template>
  <section aria-labelledby="campuses-title">
    <h1 id="campuses-title">Campus</h1>
    <p v-if="loading" class="muted" role="status">Cargando campus…</p>
    <p v-else-if="error" class="error" role="alert">No se pudieron cargar los campus: {{ error }}</p>
    <ul v-else class="card-list">
      <li v-for="campus in campuses" :key="campus.campusId">
        <RouterLink class="card" :to="{ name: 'parkings', params: { campusId: campus.campusId } }">
          <strong>{{ campus.name }}</strong>
          <div class="muted">{{ campus.city }}</div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
