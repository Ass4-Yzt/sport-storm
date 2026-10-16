<template>
  <div>
    <NavBar />
    <div class="container">
      <h2 class="page-title">购物车</h2>

      <div v-if="cartList.length" class="cart-box">
        <div v-for="item in cartList" :key="item.id" class="cart-item">
          <el-checkbox v-model="item.selected" @change="updateSelected(item)" />
          <img :src="item.productImage" alt="" class="item-img" />
          <div class="item-info">
            <div class="item-name">{{ item.productName }}</div>
            <div class="item-price">¥{{ item.productPrice }}</div>
          </div>
          <el-input-number
            v-model="item.quantity"
            :min="1"
            :max="item.productStock"
            @change="updateQuantity(item)"
          />
          <div class="item-total">¥{{ (item.productPrice * item.quantity).toFixed(2) }}</div>
          <el-button type="danger" text @click="removeItem(item)">删除</el-button>
        </div>

        <!-- 底部结算 -->
        <div class="cart-footer">
          <div class="footer-left">
            已选 <span class="highlight">{{ selectedCount }}</span> 件，合计：
            <span class="highlight total">¥{{ selectedTotal }}</span>
          </div>
          <el-button type="danger" size="large" @click="checkout">去结算</el-button>
        </div>
      </div>
      <el-empty v-else description="购物车是空的">
        <el-button type="primary" @click="$router.push('/products')">去逛逛</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import NavBar from '../components/NavBar.vue'
import request from '../api'

const router = useRouter()
const cartList = ref([])

const selectedItems = computed(() => cartList.value.filter(i => i.selected === 1 || i.selected === true))
const selectedCount = computed(() => selectedItems.value.reduce((sum, i) => sum + i.quantity, 0))
const selectedTotal = computed(() =>
  selectedItems.value.reduce((sum, i) => sum + i.productPrice * i.quantity, 0).toFixed(2)
)

const loadCart = async () => {
  try {
    const res = await request.get('/api/cart/list')
    cartList.value = res.data || []
  } catch (e) {}
}

const updateQuantity = async (item) => {
  try {
    await request.put(`/api/cart/quantity?cartItemId=${item.id}&quantity=${item.quantity}`)
  } catch (e) {}
}

const updateSelected = async (item) => {
  const val = item.selected === true ? 1 : 0
  try {
    await request.put(`/api/cart/selected?cartItemId=${item.id}&selected=${val}`)
  } catch (e) {}
}

const removeItem = async (item) => {
  try {
    await request.delete(`/api/cart/${item.id}`)
    ElMessage.success('已删除')
    loadCart()
  } catch (e) {}
}

const checkout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先勾选商品')
    return
  }
  router.push('/checkout')
}

onMounted(loadCart)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
.page-title {
  margin-bottom: 20px;
  color: #333;
}
.cart-box {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}
.item-img {
  width: 80px;
  height: 80px;
  background: #f0f0f0;
  border-radius: 6px;
  object-fit: cover;
}
.item-info {
  flex: 1;
}
.item-name {
  font-size: 15px;
  color: #333;
  margin-bottom: 5px;
}
.item-price {
  color: #e4393c;
  font-size: 16px;
}
.item-total {
  font-size: 16px;
  color: #333;
  min-width: 100px;
  text-align: right;
}
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
}
.highlight {
  color: #e4393c;
  font-weight: bold;
}
.total {
  font-size: 24px;
}
</style>