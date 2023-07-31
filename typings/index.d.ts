/// <reference path="./types/index.d.ts" />

type DeviceInfo = {
    bind_timestamp: Date,
    device_id: string
    device_key: string 
    device_model_icon: string   // 设备图片地址
    device_model_name: string   // 设备名称,
    device_product_id: string   // pid
    firmware_chip: string 
    firmware_version: string
    ip: string
    is_online: 0 | 1,
    is_online_update_time: Date
    mpaas_url: string
    network: "00" | "01" | "02"
    port: number
    room_id: number
    room_name: string
    tcp_server_id: number
}


interface IAppOption {
  globalData: {
    // 系统信息 + 胶囊信息
    systemInfo?: WechatMiniprogram.SystemInfo & WechatMiniprogram.ClientRect,
    // 当前进入面板的设备信息
    openDeviceInfo?: DeviceInfo,
    // 绑定的所有设备
    device_bind?: DeviceInfo[],
    // 可以使用内网的设备
    LANdeviceMap?: MapConstructor,
    // 内网搜索的定时器
    LANSearchInteval?: any,
  }
  obd: import("../miniprogram/packages/Bluetooth").BluetoothModel | null,
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}