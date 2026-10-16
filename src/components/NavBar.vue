<template>
  <div class="navbar">
    <div class="nav-inner">
      <div class="logo" @click="goHome">运动风暴</div>
      <div class="menu">
        <router-link to="/" class="menu-item">首页</router-link>
        <router-link to="/products" class="menu-item">全部商品</router-link>
      </div>
      <div class="right">
        <template v-if="isLogin">
          <el-dropdown>
            <span class="user-info">{{ username }}</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="go('/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="go('/orders')">我的订单</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="menu-item">登录</router-link>
          <router-link to="/register" class="menu-item">注册</router-link>
        </template>
        <el-badge :value="cartCount" :hidden="cartCount === 0">
          <el-icon @click="go('/cart')" class="cart-icon"><ShoppingCart /></el-icon>
        </el-badge>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import request from '../api'

const router = useRouter()
const isLogin = computed(() => !!localStorage.getItem('token'))
const username = ref(localStorage.getItem('username') || '')
const cartCount = ref(0)

const goHome = () => router.push('/')
const go = (path) => router.push(path)

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}

const loadCartCount = async () => {
  if (!isLogin.value) return
  try {
    const res = await request.get('/api/cart/list')
    cartCount.value = res.data.length
  } catch (e) {}
}

onMounted(loadCartCount)
</script>

<style scoped>
.navbar {
  background: #1a1a2e;
  color: #fff;
  height: 60px;
  line-height: 60px;
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.logo {
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  color: #ffc107;
}
.menu {
  display: flex;
  gap: 30px;
}
.menu-item {
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}
.menu-item:hover {
  color: #ffc107;
}
.right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.user-info {
  cursor: pointer;
  color: #fff;
}
.cart-icon {
  cursor: pointer;
  font-size: 24px;
  color: #fff;
}
</style>