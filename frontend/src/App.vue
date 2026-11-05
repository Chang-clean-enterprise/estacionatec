<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="brand">EstacionaTec</RouterLink>
    <span class="tagline">Lugares de estacionamiento disponibles en tu campus</span>
  </header>
  <main class="app-main">
    <RouterView />
  </main>
</template>

<style>
:root {
  --color-primary: #0039a6;
  --color-available: #1b7f3b;
  --color-occupied: #b3261e;
  --color-text: #1c1c1c;
  --color-muted: #555;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--color-text);
}

body {
  margin: 0;
  background: #f5f6f8;
}

.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  color: #fff;
}

.brand {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
}

.tagline {
  font-size: 0.95rem;
}

.app-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  padding: 0;
  list-style: none;
}

.card {
  display: block;
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 1px 3px rgb(0 0 0 / 15%);
}

.card:hover,
.card:focus-visible {
  outline: 2px solid var(--color-primary);
}

.muted {
  color: var(--color-muted);
}

.error {
  color: var(--color-occupied);
}
</style>
