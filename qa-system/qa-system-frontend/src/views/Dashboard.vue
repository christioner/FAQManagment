<template>
  <el-container class="dashboard-container">
    <el-aside width="250px" class="sidebar">
      <div class="logo">
        <h2>FAQ System</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
      >
        <el-menu-item index="/qa">
          <el-icon><Document /></el-icon>
          <span>问答管理</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Folder /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/documents">
          <el-icon><Files /></el-icon>
          <span>文档管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.username }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Folder, Files, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const titles = {
    '/qa': '问答管理',
    '/categories': '分类管理',
    '/documents': '文档管理'
  }
  return titles[route.path] || '问答管理'
})

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
    })
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

:deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f7fa;
}

.main-content {
  background: #f5f7fa;
  padding: 24px;
}
</style>
