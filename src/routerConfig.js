
let routes =  [{
  path: '/',
  name: 'home',
  label: '首页',
  component: ()=> import ('./views/Index.vue')
}]

export default {routes}