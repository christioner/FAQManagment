
# 用户问题收集与管理系统设计方案

## 1. 系统架构设计

### 1.1 技术架构
```
┌─────────────────────────────────────────────────────────────┐
│                     前端 (Vue3 + ElementPlus)                │
├─────────────────────────────────────────────────────────────┤
│                       API Gateway                            │
├─────────────────────────────────────────────────────────────┤
│                    后端服务 (Spring Boot)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │  用户管理   │ │  问答管理   │ │  文档管理   │ │ AI集成  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                       数据存储层                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   MySQL    │ │   Redis     │ │  MinIO/OSS  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 功能模块
- 用户管理模块
- 问答管理模块（手动录入、编辑、删除）
- 文档管理模块（上传、解析）
- AI集成模块（文档分析、问答生成）
- 权限管理模块

## 2. 数据库设计建议

### 2.1 数据库选型
- **主数据库**: MySQL 8.0（关系型数据存储）
- **缓存**: Redis（会话、热点数据）
- **文件存储**: MinIO（图片、文档存储）

### 2.2 数据表设计

```sql
-- 用户表
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100),
  `role` varchar(20) DEFAULT 'USER',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
);

-- 分类表
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255),
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 问答表
CREATE TABLE `qa` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answer` longtext NOT NULL,
  `category_id` bigint,
  `source` varchar(50) DEFAULT 'MANUAL', -- MANUAL:手动录入, AI:AI生成
  `source_doc_id` bigint,
  `view_count` int DEFAULT 0,
  `like_count` int DEFAULT 0,
  `create_user_id` bigint,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_create_user` (`create_user_id`)
);

-- 文档表
CREATE TABLE `document` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint,
  `file_type` varchar(50),
  `status` varchar(20) DEFAULT 'UPLOADED', -- UPLOADED:已上传, PROCESSING:处理中, COMPLETED:已完成
  `process_result` longtext,
  `create_user_id` bigint,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 图片表
CREATE TABLE `attachment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_name` varchar(200) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint,
  `file_type` varchar(50),
  `related_id` bigint, -- 关联的QA ID或其他实体ID
  `related_type` varchar(50), -- QA类型
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

## 3. API设计

### 3.1 用户相关API
```
POST   /api/auth/login          # 用户登录
POST   /api/auth/logout         # 用户登出
GET    /api/user/profile        # 获取用户信息
PUT    /api/user/profile        # 更新用户信息
```

### 3.2 问答管理API
```
GET    /api/qa                  # 分页查询问答列表
GET    /api/qa/{id}             # 获取问答详情
POST   /api/qa                  # 创建问答
PUT    /api/qa/{id}             # 更新问答
DELETE /api/qa/{id}             # 删除问答
POST   /api/qa/{id}/like        # 点赞
POST   /api/qa/upload-image     # 上传图片
```

### 3.3 文档管理API
```
GET    /api/documents           # 分页查询文档列表
POST   /api/documents           # 上传文档
POST   /api/documents/{id}/process # 处理文档（AI分析）
GET    /api/documents/{id}/qa   # 获取文档生成的问答
DELETE /api/documents/{id}      # 删除文档
```

### 3.4 分类管理API
```
GET    /api/categories          # 获取分类列表
POST   /api/categories          # 创建分类
PUT    /api/categories/{id}     # 更新分类
DELETE /api/categories/{id}     # 删除分类
```

## 4. 项目结构设计

### 4.1 后端项目结构
```
qa-system-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── qa/
│   │   │           └── system/
│   │   │               ├── QaSystemApplication.java
│   │   │               ├── config/          # 配置类
│   │   │               ├── controller/      # 控制器
│   │   │               ├── service/         # 服务层
│   │   │               ├── repository/      # 数据访问层
│   │   │               ├── entity/          # 实体类
│   │   │               ├── dto/             # 数据传输对象
│   │   │               ├── common/          # 公共类
│   │   │               └── ai/              # AI相关
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/               # Flyway数据库迁移脚本
│   └── test/
├── Dockerfile
├── pom.xml
└── README.md
```

### 4.2 前端项目结构
```
qa-system-frontend/
├── public/
├── src/
│   ├── api/                     # API接口
│   ├── assets/                  # 静态资源
│   ├── components/              # 公共组件
│   ├── views/                   # 页面组件
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   ├── qa/                  # 问答管理
│   │   ├── document/            # 文档管理
│   │   └── category/            # 分类管理
│   ├── router/                  # 路由配置
│   ├── store/                   # 状态管理
│   ├── utils/                   # 工具函数
│   ├── App.vue
│   └── main.js
├── package.json
├── Dockerfile
└── README.md
```

## 5. Docker配置

### 5.1 docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: qa-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123456
      MYSQL_DATABASE: qa_system
      MYSQL_USER: qa_user
      MYSQL_PASSWORD: qa_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - qa-network

  redis:
    image: redis:7-alpine
    container_name: qa-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - qa-network

  minio:
    image: minio/minio:latest
    container_name: qa-minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - qa-network

  backend:
    build:
      context: ./qa-system-backend
      dockerfile: Dockerfile
    container_name: qa-backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/qa_system
      SPRING_DATASOURCE_USERNAME: qa_user
      SPRING_DATASOURCE_PASSWORD: qa_password
      SPRING_REDIS_HOST: redis
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin123
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - redis
      - minio
    networks:
      - qa-network

  frontend:
    build:
      context: ./qa-system-frontend
      dockerfile: Dockerfile
    container_name: qa-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - qa-network

volumes:
  mysql_data:
  redis_data:
  minio_data:

networks:
  qa-network:
    driver: bridge
```

## 6. AI Agent执行脚本

### 6.1 项目初始化脚本
```bash
#!/bin/bash

# project_init.sh
echo "初始化问答管理系统项目..."

# 创建项目根目录
mkdir -p qa-system
cd qa-system

# 创建后端项目
echo "创建后端项目..."
mkdir -p qa-system-backend/src/main/java/com/qa/system/{config,controller,service,repository,entity,dto,common,ai}
mkdir -p qa-system-backend/src/main/resources/db/migration
mkdir -p qa-system-backend/src/test

# 创建前端项目
echo "创建前端项目..."
mkdir -p qa-system-frontend/{public,src/{api,assets,components,views/{qa,document,category},router,store,utils}}

echo "项目结构创建完成！"
```

### 6.2 后端开发脚本
```bash
#!/bin/bash

# backend_development.sh
echo "开始后端开发..."

# 进入后端目录
cd qa-system-backend

# 创建pom.xml
cat > pom.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.5</version>
        <relativePath/>
    </parent>
    
    <groupId>com.qa</groupId>
    <artifactId>qa-system-backend</artifactId>
    <version>1.0.0</version>
    <name>qa-system-backend</name>
    <description>问答管理系统后端</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Database -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
        </dependency>
        
        <!-- MinIO -->
        <dependency>
            <groupId>io.minio</groupId>
            <artifactId>minio</artifactId>
            <version>8.5.4</version>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
        </dependency>
        
        <!-- OpenAI -->
        <dependency>
            <groupId>com.theokanning.openai-gpt3-java</groupId>
            <artifactId>service</artifactId>
            <version>0.18.2</version>
        </dependency>
        
        <!-- Apache POI for document parsing -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi</artifactId>
            <version>5.2.4</version>
        </dependency>
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>5.2.4</version>
        </dependency>
        
        <!-- Common -->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson2</artifactId>
            <version>2.0.40</version>
        </dependency>
        
        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
EOF

# 创建application.yml
cat > src/main/resources/application.yml << 'EOF'
server:
  port: 8080

spring:
  application:
    name: qa-system-backend
  
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/qa_system?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai}
    username: ${SPRING_DATASOURCE_USERNAME:root}
    password: ${SPRING_DATASOURCE_PASSWORD:root123456}
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
  
  redis:
    host: ${SPRING_REDIS_HOST:localhost}
    port: 6379
    password: 
    database: 0
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 8
        max-wait: -1ms
        max-idle: 8
        min-idle: 0
  
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB

# MinIO配置
minio:
  endpoint: ${MINIO_ENDPOINT:http://localhost:9000}
  access-key: ${MINIO_ACCESS_KEY:minioadmin}
  secret-key: ${MINIO_SECRET_KEY:minioadmin123}
  bucket-name: qa-system

# JWT配置
jwt:
  secret: ${JWT_SECRET:mySecretKey123456789mySecretKey123456789}
  expiration: 86400000  # 24小时

# AI配置
ai:
  openai:
    api-key: ${OPENAI_API_KEY:your-openai-api-key}
    model: gpt-3.5-turbo
    max-tokens: 2000
    temperature: 0.7

# 日志配置
logging:
  level:
    com.qa.system: DEBUG
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
EOF

echo "后端配置文件创建完成！"
```

### 6.3 前端开发脚本
```bash
#!/bin/bash

# frontend_development.sh
echo "开始前端开发..."

# 进入前端目录
cd qa-system-frontend

# 创建package.json
cat > package.json << 'EOF'
{
  "name": "qa-system-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore"
  },
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.6",
    "element-plus": "^2.4.2",
    "@element-plus/icons-vue": "^2.1.0",
    "axios": "^1.5.1",
    "markdown-it": "^13.0.1",
    "highlight.js": "^11.9.0",
    "mavon-editor": "^2.10.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "vite": "^4.4.9",
    "sass": "^1.69.5",
    "unplugin-auto-import": "^0.16.6",
    "unplugin-vue-components": "^0.25.2",
    "eslint": "^8.51.0",
    "eslint-plugin-vue": "^9.17.0"
  }
}
EOF

# 创建vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
EOF

echo "前端配置文件创建完成！"
```

### 6.4 Docker构建脚本
```bash
#!/bin/bash

# docker_build.sh
echo "构建Docker镜像..."

# 构建后端Dockerfile
cat > qa-system-backend/Dockerfile << 'EOF'
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
EOF

# 构建前端Dockerfile
cat > qa-system-frontend/Dockerfile << 'EOF'
# 构建阶段
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# 创建nginx配置
cat > qa-system-frontend/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    server {
        listen       80;
        server_name  localhost;
        
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
        
        location /api/ {
            proxy_pass http://backend:8080/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
EOF

echo "Docker配置文件创建完成！"
```

### 6.5 启动脚本
```bash
#!/bin/bash

# deploy.sh
echo "部署问答管理系统..."

# 构建并启动所有服务
docker-compose up -d --build

echo "等待服务启动..."
sleep 30

echo "检查服务状态..."
docker-compose ps

echo "系统部署完成！"
echo "前端访问地址: http://localhost"
echo "后端API地址: http://localhost:8080"
echo "MinIO控制台: http://localhost:9001"
```

## 7. 开发计划

### 第一阶段：基础框架搭建（3天）
1. 项目初始化和骨架搭建
2. 数据库设计和建表
3. 基础认证和权限模块
4. 用户管理功能

### 第二阶段：核心功能开发（5天）
1. 问答管理CRUD功能
2. Markdown编辑器集成
3. 图片上传功能
4. 分类管理功能
5. 搜索功能

### 第三阶段：AI集成（4天）
1. 文档上传功能
2. 文档内容解析
3. AI接口集成
4. 自动生成问答功能

### 第四阶段：优化和部署（2天）
1. 性能优化
2. 单元测试
3. Docker部署配置
4. 文档编写

## 8. 关键技术说明

### AI集成方案
- 使用OpenAI GPT API进行文档分析
- 文档解析支持PDF、Word、TXT格式
- 通过Prompt工程优化问答生成质量
- 实现异步处理机制，避免长时间等待

### Markdown支持
- 使用mavon-editor组件
- 支持图片拖拽上传
- 实时预览功能
- Markdown渲染显示

### 安全考虑
- JWT token认证
- API接口权限控制
- 文件上传安全校验
- SQL注入防护

## 9. 下一步执行指令

请AI Agent按照以下顺序执行：

1. 执行 `project_init.sh` 初始化项目结构
2. 执行 `backend_development.sh` 搭建后端框架
3. 执行 `frontend_development.sh` 搭建前端框架
4. 执行 `docker_build.sh` 创建Docker配置
5. 根据数据库设计创建实体类和Repository层
6. 实现Controller层接口
7. 实现前端页面和组件
8. 集成AI功能
9. 测试并执行 `deploy.sh` 部署系统

这个设计方案提供了完整的技术路线图和可执行的脚本，确保AI Agent能够按照计划逐步实现整个系统。