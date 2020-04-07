let routes = [
  {
    path: '/',
    name: 'home',
    label: '首页',
    component: () => import('./views/Index.vue'),
  },
  {
    path: '/chat',
    name: 'chat',
    label: '聊天室',
    component: () => import('./views/Chat.vue'),
  },
]

export default { routes }
