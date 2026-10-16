<template>
  <div class="section">
    <div class="section-title">订单管理</div>

    <el-table :data="orderList" stripe>
      <el-table-column prop="orderNo" label="订单号" width="190" />
      <el-table-column prop="receiver" label="收货人" width="100" />
      <el-table-column prop="payAmount" label="实付" width="100">
        <template #default="scope">¥{{ scope.row.payAmount }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="statusTag(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="170" />
      <el-table-column label="操作" fixed="right">
        <template #default="scope">
          <el-button
              v-if="scope.row.status === 1"
              size="small"
              type="primary"
              @click="openShip(scope.row)"
          >发货</el-button>
          <span v-else class="none">—</span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="shipVisible" title="发货" width="420px">
      <el-form label-width="80px">
        <el-form-item label="订单号">
          <span>{{ shipForm.orderNo }}</span>
        </el-form-item>
        <el-form-item label="快递公司">
          <el-input v-model="shipForm.expressCompany" placeholder="如：顺丰" />
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="shipForm.expressNo" placeholder="快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" @click="doShip">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../api'

const orderList = ref([])
const shipVisible = ref(false)
const shipForm = reactive({ orderId: null, orderNo: '', expressCompany: '', expressNo: '' })

const statusText = (s) => {
  const map = { 0: '待付款', 1: '待发货', 2: '运输中', 3: '已完成', 4: '已取消', 5: '已取消' }
  return map[s] || '未知'
}

const statusTag = (s) => {
  const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'info', 4: 'danger', 5: 'danger' }
  return map[s] || 'info'
}

const loadOrders = async () => {
  try {
    const res = await request.get('/api/admin/order/list')
    orderList.value = res.data.records || []
  } catch (e) {
    orderList.value = []
  }
}

const openShip = (row) => {
  shipForm.orderId = row.id
  shipForm.orderNo = row.orderNo
  shipForm.expressCompany = ''
  shipForm.expressNo = ''
  shipVisible.value = true
}

const doShip = async () => {
  if (!shipForm.expressCompany || !shipForm.expressNo) {
    ElMessage.warning('请填写快递信息')
    return
  }
  try {
    await request.post(
        `/api/admin/order/ship/${shipForm.orderId}?expressCompany=${encodeURIComponent(shipForm.expressCompany)}&expressNo=${shipForm.expressNo}`
    )
    ElMessage.success('发货成功')
    shipVisible.value = false
    loadOrders()
  } catch (e) {}
}

onMounted(loadOrders)
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
.none {
  color: #ccc;
}
</style>