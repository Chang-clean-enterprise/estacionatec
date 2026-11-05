<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getSlots } from '../api/client';
import SlotGrid from '../components/SlotGrid.vue';
import { useAsyncData } from '../composables/useAsyncData';

const props = defineProps<{ campusId: string; parkingId: string }>();

const REFRESH_MS = 15_000;

const { data, loading, error, load } = useAsyncData(() =>
  getSlots(props.campusId, props.parkingId),
);

let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  load();
  timer = setInterval(load, REFRESH_MS);
});
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <section aria-labelledby="slots-title">
    <RouterLink :to="{ name: 'parkings', params: { campusId } }">&larr; Estacionamientos</RouterLink>
    <h1 id="slots-title">Cajones</h1>
    <p v-if="error" class="error" role="alert">No se pudieron cargar los cajones: {{ error }}</p>
    <p v-else-if="loading && !data" class="muted" role="status">Cargando cajones…</p>
    <template v-if="data">
      <p class="summary" aria-live="polite">
        <strong>{{ data.summary.available }}</strong> de {{ data.summary.total }} cajones disponibles
      </p>
      <SlotGrid :slots="data.slots" />
    </template>
  </section>
</template>

<style scoped>
.summary {
  font-size: 1.15rem;
}
</style>
