import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _7efe8b3a = () => interopDefault(import('../pages/profile.vue' /* webpackChunkName: "pages/profile" */))
const _524efe64 = () => interopDefault(import('../pages/signup.vue' /* webpackChunkName: "pages/signup" */))
const _7dff3b74 = () => interopDefault(import('../pages/hashtag/_id/index.vue' /* webpackChunkName: "pages/hashtag/_id/index" */))
const _fa32af78 = () => interopDefault(import('../pages/post/_id/index.vue' /* webpackChunkName: "pages/post/_id/index" */))
const _da92d7a2 = () => interopDefault(import('../pages/user/_id/index.vue' /* webpackChunkName: "pages/user/_id/index" */))
const _2209dd8c = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/profile",
    component: _7efe8b3a,
    name: "profile"
  }, {
    path: "/signup",
    component: _524efe64,
    name: "signup"
  }, {
    path: "/hashtag/:id",
    component: _7dff3b74,
    name: "hashtag-id"
  }, {
    path: "/post/:id",
    component: _fa32af78,
    name: "post-id"
  }, {
    path: "/user/:id",
    component: _da92d7a2,
    name: "user-id"
  }, {
    path: "/",
    component: _2209dd8c,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
