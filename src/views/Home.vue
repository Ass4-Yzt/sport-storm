<template>
  <div>
    <NavBar />
    <div class="container">
      <!-- 推荐专区 -->
      <div class="section-title">🔥 为你推荐</div>
      <div v-if="recommendList.length" class="product-grid">
        <div v-for="p in recommendList" :key="p.id" class="product-card" @click="goDetail(p.id)">
          <img :src="p.image" alt="" class="product-img" />
          <div class="product-name">{{ p.name }}</div>
          <div class="product-price">¥{{ p.price }}</div>
          <div class="product-sales">销量 {{ p.sales }}</div>
        </div>
      </div>
      <el-empty v-else description="暂无推荐" />

      <!-- 全部商品 -->
      <div class="section-title">🛒 全部商品</div>
      <div v-if="productList.length" class="product-grid">
        <div v-for="p in productList" :key="p.id" class="product-card" @click="goDetail(p.id)">
          <img :src="p.image" alt="" class="product-img" />
          <div class="product-name">{{ p.name }}</div>
          <div class="product-price">¥{{ p.price }}</div>
          <div class="product-sales">销量 {{ p.sales }}</div>
        </div>
      </div>
      <el-empty v-else description="暂无商品" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import request from '../api'

const router = useRouter()
const recommendList = ref([])
const productList = ref([])

const goDetail = (id) => router.push(`/product/${id}`)

const loadData = async () => {
  try {
    // 推荐（需要登录，未登录会 401 被拦截跳登录页——这里特殊处理）
    const isLogin = !!localStorage.getItem('token')
    if (isLogin) {
      const rec = await request.get('/api/recommend/list?limit=8')
      recommendList.value = rec.data || []
    }
    const prods = await request.get('/api/product/page?current=1&size=12')
    productList.value = prods.data.records || []
  } catch (e) {}
}

onMounted(loadData)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 20px 0 15px;
  color: #333;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.product-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
.product-img {
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  object-fit: cover;
  border-radius: 6px;
}
.product-name {
  margin-top: 10px;
  font-size: 15px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-price {
  color: #e4393c;
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}
.product-sales {
  color: #999;
  font-size: 12px;
  margin-top: 3px;
}
</style>