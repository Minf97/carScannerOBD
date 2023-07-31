
import Toast from "../miniprogram_npm/@vant/weapp/toast/toast"
import * as login from "./login"
import * as circle from "./circle"

interface AnyResult extends WechatMiniprogram.RequestSuccessCallbackResult {
    data: any
}
interface SpecResult<T> extends AnyResult {
    data: T
}

/**
 * 封装的 request 请求
 * 示例：泛型可以校验返回值，可直接链式取到传入的泛型
 * ```
 * request<{name: string, age: number}>(/xxx/xxx).then(res => console.log(res.data.name))
 * ```
 */
export function request<T>(url: string, data: object = {}, method: RequestMethod = "POST"): Promise<Weschool.Http.RequestResponse<T>> {
    return new Promise((resolve, reject) => {
        const schoolCode = wx.getStorageSync('userInfo')?.schoolCode || 'zcst';
        const header = wx.getStorageSync('userInfo') || '';

        const body = {
            schoolCode,
            bizContent: data
        }
        // 成功回调
        const success = (res: SpecResult<Weschool.Http.RequestResponse<T>>) => {
            if (res.statusCode === 200 && res.data.code === 200) {
                resolve(res.data)
            } else {
                Toast.fail(res.data.message)
                reject(res.data)
            }
        }
        // 失败回调
        const fail = (err) => {
            Toast.fail(err.errMsg)
            reject(err)
        }
        wx.request({
            url, data: body, method, header: {
                refresh_token: header?.refresh_token,
                token: header?.token,
                user_id: header?.user_id,
            }, timeout: 20000,
            success: success as unknown as WechatMiniprogram.RequestSuccessCallback,
            fail: fail
        })
    })
}


export const loginModel = login;
export const circleModel = circle;

