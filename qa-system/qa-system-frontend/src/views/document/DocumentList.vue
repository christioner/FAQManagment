<template>
  <div class="document-list">
    <el-card>
      <div class="card-header">
        <h3>文档管理</h3>
        <el-button type="primary" @click="handleUpload">
          <el-icon><Upload /></el-icon>
          上传文档
        </el-button>
      </div>

      <el-table
        :data="documents"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="文档标题" min-width="200" />
        <el-table-column prop="fileType" label="文件类型" width="120" />
        <el-table-column prop="fileSize" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleProcess(row)"
              :disabled="row.status !== 'UPLOADED'"
            >
              AI处理
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Upload Dialog -->
    <el-dialog v-model="uploadVisible" title="上传文档" width="500px">
      <el-alert
        title="文档上传功能"
        type="info"
        description="文档上传和AI处理功能需要后端MinIO和AI服务支持,目前仅为界面展示"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-upload
        drag
        :auto-upload="false"
        :limit="1"
        accept=".pdf,.doc,.docx,.txt"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 PDF, Word, TXT 格式文件
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="uploadVisible = false">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, UploadFilled } from '@element-plus/icons-vue'

const loading = ref(false)
const uploadVisible = ref(false)
const documents = ref([])

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getStatusType = (status) => {
  const types = {
    'UPLOADED': 'info',
    'PROCESSING': 'warning',
    'COMPLETED': 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'UPLOADED': '已上传',
    'PROCESSING': '处理中',
    'COMPLETED': '已完成'
  }
  return texts[status] || status
}

const loadDocuments = () => {
  loading.value = true
  // Mock data for now
  setTimeout(() => {
    documents.value = [
      {
        id: 1,
        title: '示例文档.pdf',
        fileType: 'PDF',
        fileSize: 1024000,
        status: 'UPLOADED'
      }
    ]
    loading.value = false
  }, 500)
}

const handleUpload = () => {
  uploadVisible.value = true
}

const handleProcess = (row) => {
  ElMessage.info('AI处理功能需要后端支持')
}

const handleDelete = (row) => {
  ElMessage.success('删除成功')
  loadDocuments()
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.document-list {
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
</style>
