<template>
  <div class="section">
    <div class="section-head">
      <div class="section-title">商品管理</div>
      <el-button type="primary" size="small" @click="openDialog">新增商品</el-button>
    </div>

    <el-table :data="productList" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="商品名" min-width="160" />
      <el-table-column label="价格" width="100">
        <template #default="scope">¥{{ scope.row.price }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column prop="sales" label="销量" width="80" />
      <el-table-column prop="brand" label="品牌" width="100" />
      <el-table-column label="状态" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="scope">
          <el-button
              size="small"
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '下架' : '上架' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="visible" title="新增商品" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" placeholder="商品名称" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="form.price" placeholder="如 299.00" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input v-model="form.stock" placeholder="如 100" />
        </el-form-item>
        <el-form-item label="图片">
          <el-input v-model="form.image" placeholder="如 /img/p15.jpg" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="运动标签">
          <el-checkbox-group v-model="form.tagIds">
            <el-checkbox v-for="t in tagOptions" :key="t.id" :value="t.id" :label="t.id">
              {{ t.tagName || t.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="上架状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1" :label="1">上架</el-radio>
            <el-radio :value="0" :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../api'

const productList = ref([])
const tagOptions = ref([])
const visible = ref(false)
const form = reactive({
  name: '',
  price: '',
  stock: '',
  image: '',
  description: '',
  tagIds: [],
  status: 1
})

const loadProducts = async () => {
  try {
    const res = await request.get('/api/admin/product/list')
    productList.value = res.data && res.data.records ? res.data.records : (res.data || [])
  } catch (e) {
    productList.value = []
  }
}

const loadTags = async () => {
  try {
    const res = await request.get('/api/admin/product/tags')
    tagOptions.value = res.data || []
  } catch (e) {
    tagOptions.value = []
  }
}

const openDialog = () => {
  form.name = ''
  form.price = ''
  form.stock = ''
  form.image = ''
  form.description = ''
  form.tagIds = []
  form.status = 1
  visible.value = true
}

const submit = async () => {
  if (!form.name || !form.price || !form.stock) {
    ElMessage.warning('请填写商品名称、价格和库存')
    return
  }
  try {
    await request.post('/api/admin/product/add', {
      name: form.name,
      price: form.price,
      stock: form.stock,
      image: form.image,
      description: form.description,
      tagIds: form.tagIds,
      status: form.status
    })
    ElMessage.success('新增成功')
    visible.value = false
    loadProducts()
  } catch (e) {}
}

const toggleStatus = async (row) => {
  try {
    await request.post(`/api/admin/product/status/${row.id}`)
    ElMessage.success('操作成功')
    loadProducts()
  } catch (e) {}
}

onMounted(() => {
  loadProducts()
  loadTags()
})
</script>

<style scoped>
.section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.section-title {
  font-weight: bold;
  font-size: 16px;
}
</style>