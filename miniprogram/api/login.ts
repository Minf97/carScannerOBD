

import { request } from "./index"
import * as api from "../constants/config"

/**
 * 登录注册
 * @param schoolCode 学校code
 * @param code 通过 wx.login 获得的code
 */
export function wxLanding(schoolCode, code) {
    return request<Weschool.Http.WxLanding>(api.WX_LANDING, { schoolCode, code })
}

/**
 * 保存教务系统账号
 * @param username 学号
 * @param password 密码
 */
export function schoolLanding(username, password) {
    return request(api.SCHOOL_LANDING, {
        eduLoginVo: { username, password }
    })
}

