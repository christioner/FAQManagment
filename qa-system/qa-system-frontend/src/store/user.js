import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('token') || '')
    const username = ref(localStorage.getItem('username') || '')
    const role = ref(localStorage.getItem('role') || '')

    function setToken(newToken) {
        token.value = newToken
        localStorage.setItem('token', newToken)
    }

    function setUserInfo(user) {
        username.value = user.username
        role.value = user.role
        localStorage.setItem('username', user.username)
        localStorage.setItem('role', user.role)
    }

    function logout() {
        token.value = ''
        username.value = ''
        role.value = ''
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
    }

    return {
        token,
        username,
        role,
        setToken,
        setUserInfo,
        logout
    }
})
