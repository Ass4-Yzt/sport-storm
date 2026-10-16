<template>
  <div>
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-label">总交易额</div>
        <div class="stat-value">¥{{ stat.totalSales }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">订单量</div>
        <div class="stat-value">{{ stat.totalOrders }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">用户数</div>
        <div class="stat-value">{{ stat.totalUsers }}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">热门商品 TOP5</div>
      <el-table :data="stat.hotProducts" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="scope">¥{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="120" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import request from '../../api'

const stat = reactive({
  totalSales: 0,
  totalOrders: 0,
  totalUsers: 0,
  hotProducts: []
})

const loadStat = async () => {
  try {
    const res = await request.get('/api/admin/stat/overview')
    Object.assign(stat, res.data)
  } catch (e) {}
}

onMounted(loadStat)
</script>

<style scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 25px;
  text-align: center;
}
.stat-label {
  color: #999;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #e4393c;
}
.section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}
.section-title {
  font-weight: bold;
  margin-bottom: 15px;
}
</style>