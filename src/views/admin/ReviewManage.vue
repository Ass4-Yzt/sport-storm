<template>
  <div class="section">
    <div class="section-title">评价管理</div>

    <el-table :data="reviewList" stripe>
      <el-table-column prop="productName" label="商品名" min-width="140" />
      <el-table-column prop="nickname" label="评价人" width="100" />
      <el-table-column label="评分" width="150">
        <template #default="scope">
          <el-rate :model-value="scope.row.rating" disabled />
        </template>
      </el-table-column>
      <el-table-column label="评价内容" min-width="200">
        <template #default="scope">{{ scope.row.content || '（未填写）' }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="评价时间" width="165" />
      <el-table-column label="状态" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '显示' : '已隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="toggle(scope.row)"
          >
            {{ scope.row.status === 1 ? '隐藏' : '显示' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!reviewList.length" description="暂无评价" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../api'

const reviewList = ref([])

const loadReviews = async () => {
  try {
    const res = await request.get('/api/admin/review/list')
    reviewList.value = res.data || []
  } catch (e) {
    reviewList.value = []
  }
}

const toggle = async (row) => {
  const next = row.status === 1 ? 0 : 1
  try {
    await request.post(`/api/admin/review/status/${row.id}?status=${next}`)
    ElMessage.success(next === 1 ? '已显示' : '已隐藏')
    loadReviews()
  } catch (e) {}
}

onMounted(loadReviews)
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