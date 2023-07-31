

import { request } from "./index"
import * as api from "../constants/config"


/**
 * 点赞评论
 * @param id 评论id
 */
export function starComment(id: number) {
    return request(api.START_COMMENT, { id })
}


/**
 * 点赞帖子
 * @param id 帖子id
 */
export function starCircle(id: number) {
    return request<Weschool.Http.StarCircle>(api.STAR_CIRCLE, { id })
}

/**
 * 新增一条校园圈
 * @param param 
 */
export function addCircle(param: {
    /** 标签 */
    label: string
    /** 学校code */
    school: string
    /** 内容 */
    text: string
    /** 标题 */
    title: string
    /** 图片地址 */
    iconUrl: string
    /** 用户名 */
    nickName: string
    /** 匿名 */
    isAnonymous: 0 | 1
    /** 卡片类型 */
    cardType: number
    /** 所有图片 */
    allPhotos: string[]
}) {
    return request<Weschool.Http.AddCircle>(api.ADD_CIRCLE, param)
}

/**
 * 增添评论
 * @param param 
 */
export function addComment(param: {
    parentId: number
    /** 评论内容 */
    inputComment: string
    iconUser: string
    /** 用户名 */
    nickName: string
    /** 帖子id */
    circleId: number
}) {
    return request<Weschool.Http.AddComment>(api.ADD_COMMENT, param)
}


/**
 * 分页获取校园圈
 * @param param 
 */
export function getPageCircle(param: { pageNum: number, pageSize: number, }) {
    return request(api.GET_PAGE_CIRCLE, param)
}