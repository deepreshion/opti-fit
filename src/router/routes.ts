import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('src/pages/HomePage.vue'),
      },
      {
        path: 'statistics',
        name: 'statistics',
        component: () => import('src/pages/StatisticsPage.vue'),
      },
      {
        path: 'workouts/new',
        name: 'workout-create',
        component: () => import('src/pages/WorkoutEditorPage.vue'),
      },
      {
        path: 'workouts/:id/edit',
        name: 'workout-edit',
        component: () => import('src/pages/WorkoutEditorPage.vue'),
        props: true,
      },
    ],
  },
];

export default routes;
