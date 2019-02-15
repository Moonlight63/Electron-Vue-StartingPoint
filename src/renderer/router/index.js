import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

function loadView (view) {
  return () => import(/* webpackChunkName: "view-[request]" */ `@/${view}.vue`)
}

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: loadView('components/LandingPage')
    },
    {
      path: '/logger',
      name: 'logger',
      component: loadView('components/Logger')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
