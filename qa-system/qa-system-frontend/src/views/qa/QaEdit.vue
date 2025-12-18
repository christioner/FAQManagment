<template>
  <div class="qa-edit">
    <el-card>
      <div class="card-header">
        <h3>{{ isEdit ? '编辑问答' : '新增问答' }}</h3>
        <el-button @click="handleBack">返回</el-button>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 1000px; margin-top: 20px"
      >
        <el-form-item label="问题" prop="question">
          <el-input
            v-model="form.question"
            placeholder="请输入问题"
            :rows="3"
            type="textarea"
          />
        </el-form-item>

        <el-form-item label="答案" prop="answer">
          <div class="markdown-editor-wrapper">
            <el-tabs v-model="editorTab" class="editor-tabs">
              <el-tab-pane label="编辑" name="edit">
                <el-input
                  v-model="form.answer"
                  placeholder="请输入答案(支持Markdown)&#10;&#10;支持的格式:&#10;**粗体** *斜体*&#10;# 标题&#10;- 列表&#10;```代码块```&#10;[链接](url)"
                  :rows="15"
                  type="textarea"
                  class="markdown-input"
                />
              </el-tab-pane>
              <el-tab-pane label="预览" name="preview">
                <div class="markdown-preview" v-html="renderedAnswer"></div>
              </el-tab-pane>
              <el-tab-pane label="分屏" name="split">
                <div class="split-view">
                  <div class="split-editor">
                    <el-input
                      v-model="form.answer"
                      placeholder="Markdown编辑..."
                      :rows="15"
                      type="textarea"
                      class="markdown-input"
                    />
                  </div>
                  <div class="split-preview">
                    <div class="markdown-preview" v-html="renderedAnswer"></div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
            
            <div class="editor-toolbar">
              <el-button-group size="small">
                <el-button @click="insertMarkdown('**', '**')" title="粗体">
                  <strong>B</strong>
                </el-button>
                <el-button @click="insertMarkdown('*', '*')" title="斜体">
                  <em>I</em>
                </el-button>
                <el-button @click="insertMarkdown('`', '`')" title="代码">
                  Code
                </el-button>
                <el-button @click="insertMarkdown('# ')" title="标题">
                  H
                </el-button>
                <el-button @click="insertMarkdown('- ')" title="列表">
                  List
                </el-button>
                <el-button @click="insertMarkdown('[', '](url)')" title="链接">
                  Link
                </el-button>
                <el-button @click="insertMarkdown('```\n', '\n```')" title="代码块">
                  Block
                </el-button>
              </el-button-group>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getQaDetail, createQa, updateQa } from '@/api/qa'
import { getCategoryList } from '@/api/category'
import { markdownToHtml } from '@/utils/markdown'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const formRef = ref()
const categories = ref([])
const editorTab = ref('edit')

const form = reactive({
  question: '',
  answer: '',
  categoryId: null
})

const rules = {
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入答案', trigger: 'blur' }]
}

const renderedAnswer = computed(() => {
  if (!form.answer) return '<p class="empty-hint">在左侧输入内容,这里将显示预览</p>'
  return markdownToHtml(form.answer)
})

const insertMarkdown = (before, after = '') => {
  const textarea = document.querySelector('.markdown-input textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = form.answer.substring(start, end) || '文本'
  
  const newText = form.answer.substring(0, start) + before + selectedText + after + form.answer.substring(end)
  form.answer = newText
  
  // Set cursor position
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
  }, 10)
}

const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res.data || []
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

const loadQaDetail = async () => {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const res = await getQaDetail(route.params.id)
    Object.assign(form, res.data)
  } catch (error) {
    ElMessage.error('加载失败')
    handleBack()
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      if (isEdit.value) {
        await updateQa(route.params.id, form)
        ElMessage.success('保存成功')
      } else {
        await createQa(form)
        ElMessage.success('创建成功')
      }
      handleBack()
    } catch (error) {
      ElMessage.error(isEdit.value ? '保存失败' : '创建失败')
    } finally {
      loading.value = false
    }
  })
}

const handleBack = () => {
  router.push('/qa')
}

onMounted(() => {
  loadCategories()
  loadQaDetail()
})
</script>

<style scoped>
.qa-edit {
  max-width: 1200px;
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

.markdown-editor-wrapper {
  position: relative;
}

.editor-tabs {
  margin-bottom: 10px;
}

.markdown-input {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.markdown-input :deep(textarea) {
  font-size: 14px;
  line-height: 1.6;
}

.markdown-preview {
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  min-height: 400px;
  line-height: 1.8;
  overflow-y: auto;
  max-height: 600px;
}

.markdown-preview .empty-hint {
  color: #999;
  text-align: center;
  padding: 100px 0;
}

.markdown-preview :deep(h1) {
  font-size: 24px;
  margin: 20px 0 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.markdown-preview :deep(h2) {
  font-size: 20px;
  margin: 18px 0 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.markdown-preview :deep(h3) {
  font-size: 18px;
  margin: 16px 0 6px;
}

.markdown-preview :deep(p) {
  margin: 10px 0;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin: 10px 0;
  padding-left: 30px;
}

.markdown-preview :deep(li) {
  margin: 5px 0;
}

.markdown-preview :deep(code) {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #c7254e;
}

.markdown-preview :deep(pre) {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 15px 0;
}

.markdown-preview :deep(pre code) {
  background: transparent;
  color: #f8f8f2;
  padding: 0;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #667eea;
  padding-left: 15px;
  margin: 15px 0;
  color: #666;
  font-style: italic;
}

.markdown-preview :deep(a) {
  color: #667eea;
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}

.markdown-preview :deep(strong) {
  font-weight: 600;
  color: #333;
}

.markdown-preview :deep(em) {
  font-style: italic;
  color: #555;
}

.split-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.split-editor,
.split-preview {
  min-height: 400px;
}

.editor-toolbar {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
}
</style>
