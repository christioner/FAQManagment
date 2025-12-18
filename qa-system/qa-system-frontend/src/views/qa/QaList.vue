<template>
  <div class="qa-list">
    <el-card class="search-card">
      <el-row :gutter="16">
        <el-col :span="18">
          <el-input
            v-model="searchText"
            placeholder="搜索问题或答案..."
            clearable
            @clear="loadQaList"
            @keyup.enter="loadQaList"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch" style="width: 100%">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="list-card">
      <div class="card-header">
        <h3>问答列表</h3>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增问答
        </el-button>
      </div>

      <el-table
        :data="qaList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="question" label="问题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="answer" label="答案" min-width="300" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="row.source === 'MANUAL' ? 'success' : 'info'" size="small">
              {{ row.source === 'MANUAL' ? '手动' : 'AI' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="统计" width="120">
          <template #default="{ row }">
            <div class="stats">
              <span><el-icon><View /></el-icon> {{ row.viewCount }}</span>
              <span><el-icon><Star /></el-icon> {{ row.likeCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
            <el-button
              type="success"
              size="small"
              link
              @click="handleLike(row)"
            >
              点赞
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadQaList"
        @current-change="loadQaList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, View, Star } from '@element-plus/icons-vue'
import { getQaList, deleteQa, likeQa } from '@/api/qa'

const router = useRouter()

const loading = ref(false)
const searchText = ref('')
const qaList = ref([])
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const loadQaList = async () => {
  loading.value = true
  try {
    const res = await getQaList({
      page: pagination.page - 1,
      size: pagination.size
    })
    qaList.value = res.data.content || []
    pagination.total = res.data.totalElements || 0
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadQaList()
}

const handleCreate = () => {
  router.push('/qa/create')
}

const handleEdit = (row) => {
  router.push(`/qa/edit/${row.id}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这个问答吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteQa(row.id)
      ElMessage.success('删除成功')
      loadQaList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleLike = async (row) => {
  try {
    await likeQa(row.id)
    ElMessage.success('点赞成功')
    loadQaList()
  } catch (error) {
    ElMessage.error('点赞失败')
  }
}

onMounted(() => {
  loadQaList()
})
</script>

<style scoped>
.qa-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  border-radius: 8px;
}

.list-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
