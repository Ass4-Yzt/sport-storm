<template>
  <div>
    <NavBar />
    <div class="container">
      <h2 class="page-title">确认订单</h2>

      <!-- 收货地址 -->
      <div class="section">
        <div class="section-title">收货地址</div>
        <div v-if="addresses.length" class="address-list">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            class="address-item"
            :class="{ active: selectedAddressId === addr.id }"
            @click="selectedAddressId = addr.id"
          >
            <div class="addr-name">{{ addr.receiver }} {{ addr.phone }}</div>
            <div class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</div>
          </div>
        </div>
        <el-empty v-else description="暂无收货地址">
          <el-button type="primary" @click="$router.push('/profile')">去添加地址</el-button>
        </el-empty>
      </div>

      <!-- 商品清单 -->
      <div class="section">
        <div class="section-title">商品清单</div>
        <div v-for="item in selectedItems" :key="item.id" class="order-item">
          <img :src="item.productImage" alt="" class="item-img" />
          <div class="item-name">{{ item.productName }}</div>
          <div class="item-qty">x{{ item.quantity }}</div>
          <div class="item-price">¥{{ (item.productPrice * item.quantity).toFixed(2) }}</div>
        </div>
      </div>

      <!-- 金额汇总 -->
      <div class="section amount-box">
        <div class="amount-row">
          <span>商品金额</span>
          <span>¥{{ totalAmount }}</span>
        </div>
        <div class="amount-row">
          <span>运费</span>
          <span>¥0.00</span>
        </div>
        <div class="amount-row total-row">
          <span>应付金额</span>
          <span class="pay-amount">¥{{ totalAmount }}</span>
        </div>
      </div>

      <div class="submit-bar">
        <el-button type="danger" size="large" :loading="submitting" @click="submitOrder">
          提交订单
        </el-button>
      </div>
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
const addresses = ref([])
const selectedAddressId = ref(null)
const cartList = ref([])
const submitting = ref(false)

const selectedItems = computed(() =>
  cartList.value.filter(i => i.selected === 1 || i.selected === true)
)
const totalAmount = computed(() =>
  selectedItems.value.reduce((sum, i) => sum + i.productPrice * i.quantity, 0).toFixed(2)
)

const loadData = async () => {
  try {
    const addrRes = await request.get('/api/address/list')
    addresses.value = addrRes.data || []
    const defaultAddr = addresses.value.find(a => a.isDefault === 1)
    if (defaultAddr) selectedAddressId.value = defaultAddr.id
    else if (addresses.value.length) selectedAddressId.value = addresses.value[0].id

    const cartRes = await request.get('/api/cart/list')
    cartList.value = cartRes.data || []
  } catch (e) {}
}

const submitOrder = async () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择商品')
    return
  }
  submitting.value = true
  try {
    const ids = selectedItems.value.map(i => i.id).join(',')
    const res = await request.post(`/api/order/create?addressId=${selectedAddressId.value}&cartItemIds=${ids}`)
    ElMessage.success('下单成功')
    // 跳到订单列表
    router.push('/orders')
  } catch (e) {
  } finally {
    submitting.value = false
  }
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
  margin-bottom: 20px;
}
.section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
}
.section-title {
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}
.address-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}
.address-item {
  border: 2px solid #eee;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
}
.address-item.active {
  border-color: #e4393c;
}
.addr-name {
  font-weight: bold;
  margin-bottom: 5px;
}
.addr-detail {
  color: #666;
  font-size: 13px;
}
.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.item-img {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 4px;
}
.item-name {
  flex: 1;
}
.item-price {
  color: #e4393c;
}
.amount-box .amount-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #666;
}
.amount-box .total-row {
  border-top: 1px dashed #eee;
  margin-top: 5px;
  padding-top: 15px;
  font-weight: bold;
  color: #333;
}
.pay-amount {
  color: #e4393c;
  font-size: 24px;
}
.submit-bar {
  text-align: right;
  margin: 20px 0;
}
</style>