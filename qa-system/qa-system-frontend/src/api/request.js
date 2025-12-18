import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: '/api',
    timeout: 30000
})

// Request interceptor
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// Response interceptor
request.interceptors.response.use(
    response => {
        const res = response.data
        if (res.code !== 200) {
            ElMessage.error(res.message || 'Request failed')
            return Promise.reject(new Error(res.message || 'Error'))
        }
        return res
    },
    error => {
        ElMessage.error(error.message || 'Network error')
        return Promise.reject(error)
    }
)

export default request
