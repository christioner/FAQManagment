import request from './request'

export const getQaList = (params) => {
    return request({
        url: '/qa',
        method: 'get',
        params
    })
}

export const getQaDetail = (id) => {
    return request({
        url: `/qa/${id}`,
        method: 'get'
    })
}

export const createQa = (data) => {
    return request({
        url: '/qa',
        method: 'post',
        data
    })
}

export const updateQa = (id, data) => {
    return request({
        url: `/qa/${id}`,
        method: 'put',
        data
    })
}

export const deleteQa = (id) => {
    return request({
        url: `/qa/${id}`,
        method: 'delete'
    })
}

export const likeQa = (id) => {
    return request({
        url: `/qa/${id}/like`,
        method: 'post'
    })
}
