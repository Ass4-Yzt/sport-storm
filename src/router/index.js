import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue') },
  { path: '/products', name: 'productList', component: () => import('../views/ProductList.vue') },
  { path: '/product/:id', name: 'productDetail', component: () => import('../views/ProductDetail.vue') },
  { path: '/cart', name: 'cart', component: () => import('../views/Cart.vue') },
  { path: '/checkout', name: 'checkout', component: () => import('../views/Checkout.vue') },
  { path: '/orders', name: 'orders', component: () => import('../views/Orders.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/Profile.vue') },
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/dashboard',
    component: () => import('../views/admin/Admin.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'adminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'product',
        name: 'adminProduct',
        component: () => import('../views/admin/ProductManage.vue')
      },
      {
        path: 'order',
        name: 'adminOrder',
        component: () => import('../views/admin/OrderManage.vue')
      },
      {
        path: 'shipping',
        name: 'adminShipping',
        component: () => import('../views/admin/ShippingManage.vue')
      },
      {
        path: 'review',
        name: 'adminReview',
        component: () => import('../views/admin/ReviewManage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router