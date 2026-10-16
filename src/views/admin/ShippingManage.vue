<template>
  <div class="section">
    <div class="section-title">物流管理</div>

    <el-table :data="shippingList" stripe>
      <el-table-column prop="orderId" label="订单ID" width="90" />
      <el-table-column prop="expressCompany" label="承运公司" width="140" />
      <el-table-column prop="expressNo" label="物流单号" width="200" />
      <el-table-column label="状态" width="110">
        <template #default="scope">
          <el-tag :type="statusTag(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="发货时间" />
    </el-table>

    <el-empty v-if="!shippingList.length" description="暂无物流单" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../../api'

const shippingList = ref([])

const statusText = (s) => {
  return { 0: '待发货', 1: '已发货', 2: '派送中', 3: '已签收' }[s] || '未知'
}

const statusTag = (s) => {
  return { 0: 'info', 1: 'warning', 2: 'warning', 3: 'success' }[s] || 'info'
}

const loadShipping = async () => {
  try {
    const res = await request.get('/api/admin/shipping/list')
    shippingList.value = res.data || []
  } catch (e) {
    shippingList.value = []
  }
}

onMounted(loadShipping)
</script>

<style scoped>
.section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.section-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 15px;
}
</style>