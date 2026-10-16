<template>
  <div>
    <NavBar />
    <div class="container">
      <h2 class="page-title">个人中心</h2>

      <div class="profile-box">
        <!-- 左侧：会员信息 -->
        <div class="profile-left">
          <div class="avatar">{{ username.charAt(0).toUpperCase() }}</div>
          <div class="username">{{ username }}</div>
          <div class="member-info">
            <div class="member-row">
              <span>会员等级</span>
              <span>{{ memberLevelName }}</span>
            </div>
            <div class="member-row">
              <span>积分</span>
              <span>{{ points }}</span>
            </div>
            <div class="member-row">
              <span>累计消费</span>
              <span>¥{{ totalExpend }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧：运动偏好 + 地址管理 -->
        <div class="profile-right">
          <!-- 运动偏好 -->
          <div class="section-header">
            <span class="section-title">我常做的运动</span>
            <el-button type="primary" size="small" :loading="savingPref" @click="savePreference">
              保存
            </el-button>
          </div>
          <div class="pref-box">
            <el-checkbox-group v-model="selectedTags">
              <el-checkbox
                  v-for="t in allTags"
                  :key="t.id"
                  :value="t.id"
              >{{ t.tagName }}</el-checkbox>
            </el-checkbox-group>
            <div class="pref-tip">选择并保存后，首页"为你推荐"会优先展示相关装备</div>
          </div>

          <!-- 收货地址 -->
          <div class="section-header">
            <span class="section-title">收货地址</span>
            <el-button type="primary" size="small" @click="showAddDialog">添加地址</el-button>
          </div>

          <div v-if="addresses.length" class="address-list">
            <div v-for="addr in addresses" :key="addr.id" class="address-item">
              <div class="addr-main">
                <div class="addr-name">
                  {{ addr.receiver }} {{ addr.phone }}
                  <el-tag v-if="addr.isDefault === 1" size="small" type="danger">默认</el-tag>
                </div>
                <div class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</div>
              </div>
              <div class="addr-actions">
                <el-button size="small" text @click="setDefault(addr)">设为默认</el-button>
                <el-button size="small" text type="danger" @click="deleteAddr(addr)">删除</el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无收货地址" />
        </div>
      </div>

      <!-- 添加地址弹窗 -->
      <el-dialog v-model="dialogVisible" title="添加地址" width="500px">
        <el-form :model="addrForm" label-width="80px">
          <el-form-item label="收货人">
            <el-input v-model="addrForm.receiver" placeholder="收货人姓名" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="addrForm.phone" placeholder="手机号" />
          </el-form-item>
          <el-form-item label="省市区">
            <el-input v-model="addrForm.province" placeholder="省" style="width: 30%" />
            <el-input v-model="addrForm.city" placeholder="市" style="width: 30%" />
            <el-input v-model="addrForm.district" placeholder="区县" style="width: 30%" />
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="addrForm.detail" placeholder="街道门牌号" />
          </el-form-item>
          <el-form-item label="设为默认">
            <el-switch v-model="addrForm.isDefault" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAddress">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import NavBar from '../components/NavBar.vue'
import request from '../api'

const username = ref(localStorage.getItem('username') || '用户')
const memberLevelName = ref('普通会员')
const points = ref(0)
const totalExpend = ref('0.00')
const addresses = ref([])
const dialogVisible = ref(false)
const addrForm = reactive({
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: 0
})

// 运动偏好相关
const allTags = ref([])
const selectedTags = ref([])
const savingPref = ref(false)

const loadData = async () => {
  try {
    const addrRes = await request.get('/api/address/list')
    addresses.value = addrRes.data || []
  } catch (e) {}

  try {
    const infoRes = await request.get('/api/member/info')
    if (infoRes.data) {
      username.value = infoRes.data.username
      memberLevelName.value = infoRes.data.memberLevelName
      points.value = infoRes.data.points
      totalExpend.value = infoRes.data.totalExpend
    }
  } catch (e) {}
}

// 加载全部运动标签 + 我已选的偏好
const loadTags = async () => {
  try {
    const res = await request.get('/api/member/tags')
    allTags.value = res.data || []
  } catch (e) {}
  try {
    const mine = await request.get('/api/member/preference')
    selectedTags.value = mine.data || []
  } catch (e) {}
}

// 保存运动偏好
const savePreference = async () => {
  savingPref.value = true
  try {
    await request.post('/api/member/preference', selectedTags.value)
    ElMessage.success('已保存，首页推荐已更新')
  } catch (e) {
  } finally {
    savingPref.value = false
  }
}

const showAddDialog = () => {
  Object.assign(addrForm, { receiver: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: 0 })
  dialogVisible.value = true
}

const saveAddress = async () => {
  if (!addrForm.receiver || !addrForm.phone || !addrForm.detail) {
    ElMessage.warning('请填写完整地址信息')
    return
  }
  try {
    await request.post('/api/address/add', addrForm)
    ElMessage.success('地址已保存')
    dialogVisible.value = false
    loadData()
  } catch (e) {}
}

const setDefault = async (addr) => {
  try {
    await request.put(`/api/address/default/${addr.id}`)
    ElMessage.success('已设为默认')
    loadData()
  } catch (e) {}
}

const deleteAddr = async (addr) => {
  try {
    await request.delete(`/api/address/${addr.id}`)
    ElMessage.success('已删除')
    loadData()
  } catch (e) {}
}

onMounted(() => {
  loadData()
  loadTags()
})
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}
.page-title {
  margin-bottom: 20px;
}
.profile-box {
  display: flex;
  gap: 20px;
}
.profile-left {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e4393c;
  color: #fff;
  font-size: 36px;
  line-height: 80px;
  margin: 0 auto 15px;
}
.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}
.member-info {
  text-align: left;
  background: #fafafa;
  border-radius: 6px;
  padding: 15px;
}
.member-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #666;
  border-bottom: 1px dashed #eee;
}
.member-row:last-child {
  border-bottom: none;
}
.profile-right {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.section-title {
  font-weight: bold;
}
.pref-box {
  padding: 0 0 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}
.pref-tip {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}
.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 12px 15px;
  margin-bottom: 10px;
}
.addr-name {
  font-weight: bold;
  margin-bottom: 5px;
}
.addr-detail {
  color: #666;
  font-size: 13px;
}
</style>