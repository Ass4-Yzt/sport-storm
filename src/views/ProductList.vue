<template>
  <div>
    <NavBar />
    <div class="container">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索商品名称/品牌"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <!-- 分类 + 标签筛选 -->
      <div class="filter-bar">
        <span class="filter-label">分类：</span>
        <el-radio-group v-model="categoryId" @change="handleSearch">
          <el-radio-button :value="null">全部</el-radio-button>
          <el-radio-button v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 商品列表 -->
      <div v-if="products.length" class="product-grid">
        <div v-for="p in products" :key="p.id" class="product-card" @click="goDetail(p.id)">
          <img :src="p.image" alt="" class="product-img" />
          <div class="product-name">{{ p.name }}</div>
          <div class="product-subtitle">{{ p.subtitle }}</div>
          <div class="product-bottom">
            <span class="product-price">¥{{ p.price }}</span>
            <span class="product-sales">销量 {{ p.sales }}</span>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无商品" />

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="current"
          v-model:page-size="size"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import request from '../api'

const router = useRouter()
const products = ref([])
const categories = ref([])
const keyword = ref('')
const categoryId = ref(null)
const current = ref(1)
const size = ref(8)
const total = ref(0)

const goDetail = (id) => router.push(`/product/${id}`)

const handleSearch = () => {
  current.value = 1
  loadData()
}

const loadData = async () => {
  try {
    let url = `/api/product/page?current=${current.value}&size=${size.value}`
    if (categoryId.value) url += `&categoryId=${categoryId.value}`
    if (keyword.value) url += `&keyword=${encodeURIComponent(keyword.value)}`
    const res = await request.get(url)
    products.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {}
}

const loadCategories = async () => {
  try {
    const res = await request.get('/api/category/list')
    categories.value = res.data || []
  } catch (e) {}
}

onMounted(() => {
  loadData()
  loadCategories()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.search-input {
  width: 400px;
}
.filter-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-label {
  color: #666;
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
.product-subtitle {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.product-price {
  color: #e4393c;
  font-size: 18px;
  font-weight: bold;
}
.product-sales {
  color: #999;
  font-size: 12px;
}
.pagination {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}
</style>