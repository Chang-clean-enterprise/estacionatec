<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getParkings } from '../api/client';
import { useAsyncData } from '../composables/useAsyncData';

const props = defineProps<{ campusId: string }>();

const { data: parkings, loading, error, load } = useAsyncData(() => getParkings(props.campusId));
onMounted(load);
</script>

<template>
  <section aria-labelledby="parkings-title">
    <RouterLink to="/">&larr; Campus</RouterLink>
    <h1 id="parkings-title">Estacionamientos</h1>
    <p v-if="loading" class="muted" role="status">Cargando estacionamientos…</p>
    <p v-else-if="error" class="error" role="alert">
      No se pudieron cargar los estacionamientos: {{ error }}
    </p>
    <p v-else-if="parkings?.length === 0" class="muted">Este campus no tiene estacionamientos.</p>
    <ul v-else class="card-list">
      <li v-for="parking in parkings" :key="parking.parkingId">
        <RouterLink
          class="card"
          :to="{ name: 'slots', params: { campusId, parkingId: parking.parkingId } }"
        >
          <strong>{{ parking.name }}</strong>
          <div class="muted">{{ parking.totalSlots }} cajones</div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
