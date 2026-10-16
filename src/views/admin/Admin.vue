<template>
  <div class="admin-page">
    <!-- 顶部栏 -->
    <div class="admin-topbar">
      <div class="admin-logo" @click="goHome">运动风暴 · 后台管理</div>
      <div class="admin-right">
        <template v-if="adminToken">
          <span class="admin-user">管理员</span>
          <el-button size="small" type="danger" text @click="logout">退出登录</el-button>
        </template>
        <el-button size="small" text @click="goHome">返回前台</el-button>
      </div>
    </div>

    <!-- 未登录 -->
    <div v-if="!adminToken" class="admin-login">
      <h3>管理员登录</h3>
      <el-input
          v-model="adminForm.username"
          placeholder="管理员账号"
          style="width: 250px; margin-bottom: 10px"
      />
      <el-input
          v-model="adminForm.password"
          type="password"
          placeholder="管理员密码"
          show-password
          style="width: 250px; margin-bottom: 15px"
      />
      <div>
        <el-button type="primary" @click="adminLogin">登录</el-button>
      </div>
    </div>

    <!-- 已登录：左侧菜单 + 右侧内容 -->
    <div v-else class="admin-body">
      <div class="admin-side">
        <el-menu :default-active="activeMenu" router class="admin-menu">
          <el-menu-item index="/admin/dashboard">数据看板</el-menu-item>
          <el-menu-item index="/admin/product">商品管理</el-menu-item>
          <el-menu-item index="/admin/order">订单管理</el-menu-item>
          <el-menu-item index="/admin/shipping">物流管理</el-menu-item>
          <el-menu-item index="/admin/review">评价管理</el-menu-item>
        </el-menu>
      </div>
      <div class="admin-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../../api'

const router = useRouter()
const route = useRoute()
const adminToken = ref(localStorage.getItem('adminToken') || '')
const adminForm = reactive({ username: '', password: '' })

const activeMenu = computed(() => route.path)

const goHome = () => router.push('/')

const adminLogin = async () => {
  try {
    const res = await request.post('/api/admin/login', adminForm)
    localStorage.setItem('adminToken', res.data.token)
    adminToken.value = res.data.token
    ElMessage.success('管理员登录成功')
    if (route.path === '/admin') {
      router.replace('/admin/dashboard')
    }
  } catch (e) {}
}

const logout = () => {
  localStorage.removeItem('adminToken')
  adminToken.value = ''
  ElMessage.success('已退出登录')
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f0f2f5;
}
.admin-topbar {
  background: #1a1a2e;
  color: #fff;
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}
.admin-logo {
  font-size: 18px;
  font-weight: bold;
  color: #ffc107;
  cursor: pointer;
}
.admin-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
.admin-user {
  color: #fff;
}
.admin-login {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  margin: 60px auto;
}
.admin-login h3 {
  margin-bottom: 20px;
}
.admin-body {
  display: flex;
  align-items: stretch;
}
.admin-side {
  width: 180px;
  background: #fff;
  min-height: calc(100vh - 56px);
}
.admin-menu {
  border-right: none;
}
.admin-main {
  flex: 1;
  padding: 20px;
  max-width: 1100px;
}
</style>