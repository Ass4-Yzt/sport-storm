<template>
  <div>
    <NavBar />
    <div class="container" v-if="product">
      <div class="detail-box">
        <!-- 左：图片 -->
        <div class="detail-img">
          <img :src="product.image" alt="" />
        </div>
        <!-- 右：信息 -->
        <div class="detail-info">
          <h1 class="name">{{ product.name }}</h1>
          <div class="subtitle">{{ product.subtitle }}</div>
          <div class="price-box">
            <span class="price">¥{{ product.price }}</span>
            <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
          </div>
          <div class="info-row">
            <span>品牌：{{ product.brand }}</span>
          </div>
          <div class="info-row">
            <span>库存：{{ product.stock }}</span>
            <span class="sales">销量：{{ product.sales }}</span>
          </div>
          <div class="qty-row">
            <span>数量：</span>
            <el-input-number v-model="quantity" :min="1" :max="product.stock" />
          </div>
          <div class="btn-row">
            <el-button type="warning" size="large" @click="addToCart">加入购物车</el-button>
            <el-button type="danger" size="large" @click="buyNow">立即购买</el-button>
          </div>
        </div>
      </div>
      <!-- 详情描述 -->
      <div class="detail-desc">
        <h3>商品详情</h3>
        <p>{{ product.detail }}</p>
      </div>

      <!-- 商品评价 -->
      <div class="review-section">
        <div class="review-head">
          <h3 class="review-title">商品评价（{{ reviewTotal }}）</h3>
          <div v-if="reviewTotal" class="review-avg">
            <el-rate
                :model-value="avgRating"
                disabled
                show-score
                score-template="{value} 分"
            />
          </div>
        </div>
        <div v-if="reviews.length">
          <div v-for="r in reviews" :key="r.id" class="review-item">
            <div class="review-item-head">
              <span class="review-nick">{{ r.nickname }}</span>
              <el-rate :model-value="r.rating" disabled />
              <span class="review-time">{{ r.createTime }}</span>
            </div>
            <div class="review-content">{{ r.content || '该用户没有填写评价内容' }}</div>
          </div>
        </div>
        <el-empty v-else description="暂无评价" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import NavBar from '../components/NavBar.vue'
import request from '../api'

const route = useRoute()
const router = useRouter()
const product = ref(null)
const quantity = ref(1)

// 评价
const reviews = ref([])
const reviewTotal = ref(0)
const avgRating = ref(0)

const loadReviews = async (productId) => {
  try {
    const res = await request.get(`/api/review/product/${productId}`)
    reviews.value = (res.data && res.data.reviews) || []
    reviewTotal.value = (res.data && res.data.total) || 0
    avgRating.value = (res.data && res.data.avgRating) || 0
  } catch (e) {
    reviews.value = []
    reviewTotal.value = 0
    avgRating.value = 0
  }
}

const loadDetail = async () => {
  try {
    const res = await request.get(`/api/product/${route.params.id}`)
    product.value = res.data
    // 记录浏览行为（未登录不记录）
    if (localStorage.getItem('token')) {
      request.post(`/api/behavior/record?productId=${route.params.id}&type=1`).catch(() => {})
    }
    // 加载评价（游客也可查看）
    loadReviews(route.params.id)
  } catch (e) {}
}

const addToCart = async () => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    await request.post(`/api/cart/add?productId=${product.value.id}&quantity=${quantity.value}`)
    ElMessage.success('已加入购物车')
  } catch (e) {}
}

const buyNow = async () => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  await addToCart()
  router.push('/cart')
}

onMounted(loadDetail)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
.detail-box {
  display: flex;
  gap: 40px;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
}
.detail-img {
  width: 400px;
  height: 400px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
.detail-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-info {
  flex: 1;
}
.name {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}
.subtitle {
  color: #999;
  margin-bottom: 20px;
}
.price-box {
  background: #fff7f7;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}
.price {
  color: #e4393c;
  font-size: 28px;
  font-weight: bold;
}
.original-price {
  color: #999;
  text-decoration: line-through;
  margin-left: 10px;
  font-size: 16px;
}
.info-row {
  color: #666;
  margin-bottom: 10px;
}
.sales {
  margin-left: 30px;
}
.qty-row {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
}
.btn-row {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}
.btn-row .el-button {
  min-width: 150px;
}
.detail-desc {
  background: #fff;
  margin-top: 20px;
  padding: 20px 30px;
  border-radius: 8px;
}
.detail-desc h3 {
  margin-bottom: 15px;
  border-left: 4px solid #e4393c;
  padding-left: 10px;
}
.review-section {
  background: #fff;
  margin-top: 20px;
  padding: 20px 30px;
  border-radius: 8px;
}
.review-title {
  border-left: 4px solid #e4393c;
  padding-left: 10px;
  margin-bottom: 0;
}
.review-head {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}
.review-avg {
  display: flex;
  align-items: center;
}
.review-item {
  border-top: 1px solid #f0f0f0;
  padding: 12px 0;
}
.review-item-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.review-nick {
  font-size: 14px;
  color: #333;
}
.review-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}
.review-content {
  color: #666;
  font-size: 14px;
}
</style>