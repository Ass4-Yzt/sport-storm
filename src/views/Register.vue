<template>
  <div class="register-page">
    <NavBar />
    <div class="register-box">
      <h2>注册</h2>
      <el-form :model="form" label-width="60px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="confirmPwd" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
      </el-form>
      <el-button type="primary" class="register-btn" @click="handleRegister">注册</el-button>
      <div class="login-link">
        已有账号？<router-link to="/login">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import NavBar from '../components/NavBar.vue'
import request from '../api'

const router = useRouter()
const confirmPwd = ref('')
const form = reactive({
  username: '',
  password: '',
  nickname: ''
})

const handleRegister = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  if (form.password !== confirmPwd.value) {
    ElMessage.warning('两次密码不一致')
    return
  }
  try {
    await request.post('/api/user/register', form)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (e) {}
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.register-box {
  max-width: 400px;
  margin: 60px auto;
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
.register-box h2 {
  text-align: center;
  margin-bottom: 30px;
}
.register-btn {
  width: 100%;
  margin-top: 10px;
}
.login-link {
  text-align: center;
  margin-top: 15px;
  color: #666;
}
</style>