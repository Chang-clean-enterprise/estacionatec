<script setup lang="ts">
import type { Slot } from '../types';

defineProps<{ slots: Slot[] }>();

const statusLabel = { available: 'Libre', occupied: 'Ocupado' } as const;
</script>

<template>
  <ul class="slot-grid" aria-label="Cajones de estacionamiento">
    <li
      v-for="slot in slots"
      :key="slot.slotId"
      class="slot"
      :class="`slot--${slot.status}`"
      :data-status="slot.status"
    >
      <span class="slot__label">{{ slot.label }}</span>
      <!-- Text label so status is not conveyed by color alone -->
      <span class="slot__status">{{ statusLabel[slot.status] }}</span>
    </li>
  </ul>
</template>

<style scoped>
.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.6rem 0.25rem;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
}

.slot--available {
  background: var(--color-available, #1b7f3b);
}

.slot--occupied {
  background: var(--color-occupied, #b3261e);
}

.slot__label {
  font-weight: 700;
}
</style>
