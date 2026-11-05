import { createRouter, createWebHistory } from 'vue-router';
import CampusListView from './views/CampusListView.vue';

// Routes mirror the data hierarchy: campus -> parking -> slots.
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'campuses', component: CampusListView },
    {
      path: '/campus/:campusId',
      name: 'parkings',
      component: () => import('./views/ParkingListView.vue'),
      props: true,
    },
    {
      path: '/campus/:campusId/parking/:parkingId',
      name: 'slots',
      component: () => import('./views/SlotsView.vue'),
      props: true,
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});
