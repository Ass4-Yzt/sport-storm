<template>
  <div>
    <NavBar />
    <div class="container">
      <h2 class="page-title">我的订单</h2>

      <!-- 状态筛选 -->
      <el-tabs v-model="activeStatus" @tab-change="loadData">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待付款" name="0"></el-tab-pane>
        <el-tab-pane label="待发货" name="1"></el-tab-pane>
        <el-tab-pane label="运输中" name="2"></el-tab-pane>
        <el-tab-pane label="已完成" name="3"></el-tab-pane>
        <el-tab-pane label="已取消" name="4"></el-tab-pane>
      </el-tabs>

      <div v-if="orders.length" class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-status" :class="'status-' + order.status">{{ statusText(order.status) }}</span>
          </div>
          <div class="order-body">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <img :src="item.productImage" alt="" class="item-img" />
              <div class="item-name">{{ item.productName }}</div>
              <div class="item-qty">x{{ item.quantity }}</div>
              <div class="item-price">¥{{ item.totalPrice }}</div>
            </div>
          </div>
          <div class="order-footer">
            <div class="order-amount">
              共 {{ order.items.length }} 件，实付 <span class="pay-amount">¥{{ order.payAmount }}</span>
            </div>
            <div class="order-actions">
              <el-button v-if="order.status === 0" type="danger" size="small" @click="pay(order)">去支付</el-button>
              <el-button v-if="order.status === 0 || order.status === 1" size="small" @click="cancel(order)">取消订单</el-button>
              <el-button v-if="order.status === 2" type="success" size="small" @click="confirm(order)">确认收货</el-button>
              <el-button v-if="order.status === 3" type="primary" size="small" @click="openReview(order)">评价</el-button>
              <el-button size="small" @click="showTrace(order)">查看物流</el-button>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无订单" />

      <!-- 物流弹窗 -->
      <el-dialog v-model="traceVisible" title="物流信息" width="500px">
        <div v-if="currentTrace">
          <div class="trace-company">
            {{ currentTrace.expressCompany }} 单号：{{ currentTrace.expressNo }}
          </div>
          <el-timeline>
            <el-timeline-item
                v-for="t in currentTrace.traces"
                :key="t.id"
                :timestamp="t.traceTime"
            >
              {{ t.traceInfo }}
            </el-timeline-item>
          </el-timeline>
        </div>
        <div v-else class="no-trace">暂无物流信息</div>
      </el-dialog>

      <!-- 评价弹窗 -->
      <el-dialog v-model="reviewVisible" title="商品评价" width="560px">
        <div v-for="item in reviewItems" :key="item.id" class="review-row">
          <div class="review-name">{{ item.productName }}</div>

          <!-- 已评价：只读展示 -->
          <div v-if="reviewMap[item.id]" class="review-done">
            <el-rate :model-value="reviewMap[item.id].rating" disabled />
            <span class="review-done-text">
              {{ reviewMap[item.id].content || '（未填写评价内容）' }}
            </span>
          </div>

          <!-- 未评价：可填可提交 -->
          <div v-else-if="reviewForm[item.id]">
            <el-rate v-model="reviewForm[item.id].rating" />
            <el-input
                v-model="reviewForm[item.id].content"
                type="textarea"
                :rows="2"
                maxlength="500"
                show-word-limit
                placeholder="说说这件装备用起来怎么样（选填）"
            />
            <div class="review-submit">
              <el-button type="primary" size="small" @click="submitReview(item)">提交评价</el-button>
            </div>
          </div>
        </div>
        <el-empty v-if="!reviewItems.length" description="该订单没有可评价的商品" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import NavBar from '../components/NavBar.vue'
import request from '../api'

const activeStatus = ref('all')
const orders = ref([])
const traceVisible = ref(false)
const currentTrace = ref(null)

// 评价相关
const reviewVisible = ref(false)
const reviewItems = ref([])
const reviewMap = ref({})
const reviewForm = reactive({})

const statusText = (s) => {
  const map = { 0: '待付款', 1: '待发货', 2: '运输中', 3: '已完成', 4: '已取消', 5: '已取消' }
  return map[s] || '未知'
}

const loadData = async () => {
  try {
    let url = '/api/order/list?current=1&size=10'
    if (activeStatus.value !== 'all') {
      url += `&status=${activeStatus.value}`
    }
    const res = await request.get(url)
    orders.value = (res.data.records || []).map(o => ({ ...o, items: o.items || [] }))
  } catch (e) {}
}

const pay = async (order) => {
  try {
    await request.post(`/api/order/pay/${order.id}`)
    ElMessage.success('支付成功')
    loadData()
  } catch (e) {}
}

const cancel = async (order) => {
  try {
    await request.post(`/api/order/cancel/${order.id}`)
    ElMessage.success('已取消')
    loadData()
  } catch (e) {}
}

const confirm = async (order) => {
  try {
    await request.post(`/api/order/confirm/${order.id}`)
    ElMessage.success('确认收货成功')
    loadData()
  } catch (e) {}
}

const showTrace = async (order) => {
  try {
    const res = await request.get(`/api/order/${order.id}`)
    currentTrace.value = res.data.shipping || null
    traceVisible.value = true
  } catch (e) {}
}

const openReview = async (order) => {
  reviewItems.value = order.items || []
  reviewMap.value = {}
  Object.keys(reviewForm).forEach(k => delete reviewForm[k])
  try {
    const res = await request.get(`/api/review/order/${order.id}`)
    const list = res.data || []
    list.forEach(r => { reviewMap.value[r.orderItemId] = r })
    reviewItems.value.forEach(it => {
      if (!reviewMap.value[it.id]) {
        reviewForm[it.id] = { rating: 5, content: '' }
      }
    })
    reviewVisible.value = true
  } catch (e) {}
}

const submitReview = async (item) => {
  const form = reviewForm[item.id]
  if (!form || !form.rating) {
    ElMessage.warning('请先选择评分')
    return
  }
  try {
    await request.post(
        `/api/review/submit/${item.id}?rating=${form.rating}&content=${encodeURIComponent(form.content || '')}`
    )
    ElMessage.success('评价成功')
    reviewMap.value[item.id] = { orderItemId: item.id, rating: form.rating, content: form.content }
  } catch (e) {}
}

onMounted(loadData)
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}
.page-title {
  margin-bottom: 15px;
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px 20px;
}
.order-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.order-no {
  color: #666;
  font-size: 13px;
}
.order-status {
  font-weight: bold;
}
.status-0 { color: #e6a23c; }
.status-1 { color: #409eff; }
.status-2 { color: #67c23a; }
.status-3 { color: #909399; }
.status-4 { color: #f56c6c; }
.status-5 { color: #f56c6c; }
.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px 0;
}
.item-img {
  width: 50px;
  height: 50px;
  background: #f0f0f0;
  border-radius: 4px;
}
.item-name {
  flex: 1;
  font-size: 14px;
}
.item-qty {
  color: #999;
}
.item-price {
  color: #333;
  min-width: 80px;
  text-align: right;
}
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  margin-top: 5px;
}
.order-amount {
  color: #666;
  font-size: 13px;
}
.pay-amount {
  color: #e4393c;
  font-weight: bold;
  font-size: 16px;
}
.trace-company {
  margin-bottom: 15px;
  color: #333;
  font-weight: bold;
}
.no-trace {
  color: #999;
  text-align: center;
  padding: 20px 0;
}
.review-row {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
  margin-bottom: 15px;
}
.review-name {
  font-weight: bold;
  margin-bottom: 8px;
}
.review-done {
  display: flex;
  align-items: center;
  gap: 12px;
}
.review-done-text {
  color: #666;
  font-size: 13px;
}
.review-submit {
  margin-top: 8px;
  text-align: right;
}
</style>