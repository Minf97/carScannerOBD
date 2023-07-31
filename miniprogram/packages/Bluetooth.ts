import Dialog from "../miniprogram_npm/@vant/weapp/dialog/dialog"
import Toast from "../miniprogram_npm/@vant/weapp/toast/toast"
import * as decrypt from "../utils/decrypt"
import * as util from "../utils/util"

type PID = 
// ------------- 仪表盘
// 复位
'ATZ' | 
// 环境温度
'0146' |
// 空气流量
'0110' | 
// 水温
'0105' |
// 进气压力
'010B' |
// 计算机负载
'0104' |
// 车速
'010D' |
// 节气门位置
'0111' |
// 进气速度
'010F' |
// 转速
'010C' |
//  ------------ 实时数据
// OBD电压 ---- 控制模块电压
'0142'




const CHECKSUM_TABLE = [
    0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b,
    0x12, 0x15, 0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a,
    0x2d, 0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65,
    0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d, 0xe0,
    0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf,
    0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd, 0x90, 0x97, 0x9e,
    0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf, 0xa6, 0xa1,
    0xb4, 0xb3, 0xba, 0xbd, 0xc7, 0xc0, 0xc9, 0xce, 0xdb,
    0xdc, 0xd5, 0xd2, 0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4,
    0xed, 0xea, 0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5,
    0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a,
    0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f,
    0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a, 0x57, 0x50,
    0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 0x6f, 0x68, 0x61,
    0x66, 0x73, 0x74, 0x7d, 0x7a, 0x89, 0x8e, 0x87, 0x80,
    0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad,
    0xaa, 0xa3, 0xa4, 0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2,
    0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3,
    0xd4, 0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c,
    0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44, 0x19,
    0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26,
    0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34, 0x4e, 0x49, 0x40,
    0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78, 0x7f,
    0x6a, 0x6d, 0x64, 0x63, 0x3e, 0x39, 0x30, 0x37, 0x22,
    0x25, 0x2c, 0x2b, 0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d,
    0x14, 0x13, 0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc,
    0xbb, 0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83,
    0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6,
    0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3
];


/**
 * crc8校验
 * @param buffer 
 */
function crc8(buffer) {
    let crc = 0;
    for (let i = 0; i < buffer.length; i++) {
        crc = CHECKSUM_TABLE[(crc ^ (buffer[i] & 0xFF)) & 0xFF];
    }
    return (crc & 0xff);
}

/**
 * //获取当前时间戳的16进制数
 */
function timestampToHexIntArray() {
    // @ts-ignore
    let b = parseInt(new Date().getTime() / 1000).toString(16)
    let c = [1, 1, 1, 1]
    c[3] = parseInt(b.substring(0, 2), 16)
    c[2] = parseInt(b.substring(2, 4), 16)
    c[1] = parseInt(b.substring(4, 6), 16)
    c[0] = parseInt(b.substring(6, 8), 16)
    return c;
}

















/**
 * 根据官方蓝牙封装的基础api，用于初始化、搜索设备
 */
class BluetoothApi {

    /**
     * 蓝牙初始化，在进入小程序时即进行初始化
     */
    openBluetoothAdapter() {
        return wx.openBluetoothAdapter()
    }

    /**
     * 搜索附近蓝牙设备，该操作消耗资源较多，即用即关
     */
    startBluetoothDevicesDiscovery() {
        return wx.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: true,
            interval: 1000,
            powerLevel: 'high'
        })
    }

    /**
     * 监听设备发现,在这里会进行第一次过滤，名字过滤
     * @param fn 
     */
    onBluetoothDeviceFound(fn: Function) {
        wx.onBluetoothDeviceFound(res => {
            const deviceFilterArr = filterDevices(res.devices);
            (deviceFilterArr.length > 0) && fn(deviceFilterArr);
        })

        // 将符合条件的设备过滤出来
        function filterDevices(devicesArr) {
            const newDevicesArr = [];
            // 去重
            const uniqueDevicesArr = devicesArr.reduce((prev, cur) => prev.find(item => item.deviceId === cur.deviceId) ? prev : [...prev, cur], []);

            uniqueDevicesArr.forEach(device => {
                if (
                    !device.name ||
                    !device.localName ||
                    device.localName.toLowerCase().indexOf("obdii") == -1 ||
                    device.advertisData?.length == 0 ||
                    !device.advertisServiceUUIDs
                    // !device.serviceData
                ) { }
                else {
                    // 对设备信息进行解密
                    // const decryptedDevice = decrypt.decryptBluetooth(device);
                    // if (decryptedDevice.device_model_name == "幻彩灯串") {
                    //     console.log(decryptedDevice, 23333333);
                    // }
                    // // 过滤：如果设备未绑定
                    // if (!decryptedDevice.isBinded) {
                    //     // Object.assign(decryptedDevice, { bluetoothModel: new BluetoothModel(decryptedDevice.deviceId) });
                    //     newDevicesArr.push(decrypt.decryptBluetooth(device));
                    // }
                    // // 如果设备被绑定了，就判断下是否是我的设备，是则连接
                    // else {
                    //     if (getApp().$store.getDeviceFromRoomList(decryptedDevice.dev_id)) {
                    //         Object.assign(decryptedDevice, { bluetoothModel: new BluetoothModel(decryptedDevice.deviceId) });
                    //     }
                    // }

                    newDevicesArr.push(device);
                }
            })
            return newDevicesArr
        }
    }

    /**
     * 停止搜索附近的蓝牙设备
     */
    stopBluetoothDevicesDiscovery() {
        return wx.stopBluetoothDevicesDiscovery();
    }

    /**
     * 监听所有蓝牙的特征变化
     * @param fn 
     */
    onBLECharacteristicValueChange(fn: (message, deviceId: string) => void) {
        wx.onBLECharacteristicValueChange(({ deviceId, value }) => {
            // @ts-ignore
            let datas = Array.prototype.map.call(new Uint8Array(value), x => ('00' + x.toString(16)).slice(-2)).join('');

            hexCharCodeToStr(datas)
            fn(hexCharCodeToStr(datas), deviceId)
        });
    }

    /**
     * 关闭蓝牙模块，断开所有已建立的连接并释放系统资源
     */
    closeBluetoothAdapter() {
        wx.closeBluetoothAdapter();
    }
}




















// http://doc.doit/project-5/doc-11/
/**
 * 每个蓝牙设备都有一个蓝牙实例
 */
export class BluetoothModel {
    private connectInfo = {
        deviceId: "",
        serviceId: "00001910-0000-1000-8000-00805F9B34FB",   // 示例值
        CharacteristicsId: "00002B10-0000-1000-8000-00805F9B34FB",  // 示例值
    }
    private writeInfo = {
        deviceId: "",
        serviceId: "00001910-0000-1000-8000-00805F9B34FB",  // 示例值
        CharacteristicsId: "00002B10-0000-1000-8000-00805F9B34FB",  // 示例值
    }
    private bleDatasSendArr = []        // 发送的蓝牙数据组包
    private timer = null           // 发送蓝牙数据的定时器
    private bleDatasBackArr = []    // 接收的蓝牙数据组包
    private isSending = false;       // 发送标志位

    public connectionState = false;

    constructor(deviceId) {
        this.createBLEConnection(deviceId)
            .catch((err) => {
                Dialog.confirm({
                    title: "温馨提示",
                    message: "蓝牙连接失败，请重启小程序尝试"
                }).then(() => {
                    // 强制重启小程序
                    const UpdateManager = wx.getUpdateManager();
                    UpdateManager.applyUpdate()
                })
                // Toast.fail('连接失败，请重启小程序再尝试')
            })
            .finally(() => {
                this.getBLEDeviceServices()
                    .then((res) => {
                        console.log(res);
                        return this.getBLEDeviceCharacteristics()
                    })
                    .then((res) => {
                        console.log(res);
                        return this.BLE_notifyAndlisten()
                    })
                    .finally(() => {
                        this.connectionState = true;
                        console.log("连接成功");
                    })
            })
    }

    atz() {
        const cmd = [41, 54, '5A', '0D'];
        const cmdPkg = this.getSubpackage(cmd);
        this.sendSubpackageArr(cmdPkg);
    }

    fdj() {
        // const cmd = [30, 31, 30, 43, '0D'];
        const cmd = [30, 31, 30, 30, '0D'];

        const cmdPkg = this.getSubpackage(cmd);
        this.sendSubpackageArr(cmdPkg);
    }

    sendOBD(str: PID) {
        const cmd = [];
        for (let i = 0; i < str.length; i++) {
            const hex = str[i].charCodeAt().toString(16);
            cmd.push(hex);
        }
        // \r
        cmd.push('0D');

        const cmdPkg = this.getSubpackage(cmd);
        this.sendSubpackageArr(cmdPkg);
    }


    /**
     * 分包 http://doc.doit/project-5/doc-11/ 请求包协议
     */
    private getSubpackage(grouppackage): Number[][] {
        // 本次命令的所有分包
        let subpackageArr = [];

        for (let i = 0; i < grouppackage.length; i += 19) {
            // 分包数据
            let subpackage = [...grouppackage.slice(i, i + 19)];

            // 分包成功，放入总分包数组
            subpackageArr.push(subpackage);
        }
        return subpackageArr;
    }

    /**
     * 发包
     */
    private sendSubpackageArr(subpackageArr: Number[][]) {
        // 将待发送的数据放入栈内
        this.bleDatasSendArr = [...this.bleDatasSendArr, ...subpackageArr];
        // 将栈内数据全部发送给蓝牙
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (!this.bleDatasSendArr.length) {
                clearInterval(this.timer);
                return;
            }
            // 阻止并行：等待上一个发送成功再发送下一个
            !this.isSending && this.sendMsg(this.bleDatasSendArr.shift());
        }, 100)
    }

    /**
     * 连接蓝牙设备
     * @param deviceId 设备id
     */
    private createBLEConnection(deviceId) {
        this.connectInfo.deviceId = deviceId;
        this.writeInfo.deviceId = deviceId;

        return wx.createBLEConnection({ deviceId: deviceId });
    }

    /**
     * 获取蓝牙设备的所有服务
     * @param deviceId 
     */
    private getBLEDeviceServices() {
        return new Promise((reslove, reject) => {
            wx.getBLEDeviceServices({
                deviceId: this.connectInfo.deviceId,
                success: (res) => {
                    for (let i = 0; i < res.services.length; i++) {
                        // 过滤得到主服务
                        if (res.services[i].isPrimary) {
                            this.connectInfo.serviceId = res.services[i].uuid;
                            console.log(res.services[i].uuid);

                            break;
                        }
                    }
                    reslove("[ok]5.获取蓝牙所有服务成功！")
                },
                fail: function (err) {
                    reject(err)
                }
            })
        })
    }

    /**
     * 获取该蓝牙设备某个服务的特征
     * @param deviceId 
     * @param serviceId 
     */
    private getBLEDeviceCharacteristics() {
        return new Promise((reslove, reject) => {
            wx.getBLEDeviceCharacteristics({
                deviceId: this.connectInfo.deviceId,
                serviceId: this.connectInfo.serviceId,
                success: (res) => {
                    for (let j = 0; j < res.characteristics.length; j++) {
                        let item = res.characteristics[j]

                        if (item.properties.write) {
                            this.writeInfo.CharacteristicsId = item.uuid;
                        }

                        if (item.properties.notify || item.properties.indicate) {
                            this.connectInfo.CharacteristicsId = item.uuid
                        }
                    }
                    console.log("%c拿到DeviceCharacteristic", res, "color:red");
                    console.log(this.writeInfo.CharacteristicsId, this.connectInfo.CharacteristicsId);

                    reslove("[ok]7.获取蓝牙下该服务的特征成功！")
                },
                fail(err) {
                    reject("[error]7.获取该服务的特征失败！")
                }
            })
        })
    }

    /**
     * 启用蓝牙特征值变化时的notify功能，订阅特征
     */
    private BLE_notifyAndlisten() {
        return new Promise((reslove, reject) => {
            wx.notifyBLECharacteristicValueChange({
                characteristicId: this.connectInfo.CharacteristicsId,
                deviceId: this.connectInfo.deviceId,
                serviceId: this.connectInfo.serviceId,
                state: true,
                success: (res) => {
                    reslove("[ok]8. notify 启动成功")
                },
                fail: function (err) {
                    reject(err)
                }
            })
        })
    }

    /**
     * 发送数据
     * @param {*} order 指令
     */
    sendMsg(order) {
        this.isSending = true;

        const vv = hexToAscii(order.join(''));
        const hex = str2abc(vv);
        console.log("发送：", vv);


        wx.writeBLECharacteristicValue({
            characteristicId: this.writeInfo.CharacteristicsId,
            deviceId: this.writeInfo.deviceId,
            serviceId: this.connectInfo.serviceId,
            value: hex,
            success: (res) => {
                this.isSending = false;
            },
            fail: (err) => {
                console.log("[2][error]3.sendMsg 发送指令失败:", err);
                this.isSending = false;
            }
        })
    }
}
//十进制   acsii
function str2abc(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
//十六进制
function hexToAscii(str1) {
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

function hexCharCodeToStr(hexCharCodeStr) {
    var trimedStr = hexCharCodeStr.trim();
    var rawStr =
        trimedStr.substr(0, 2).toLowerCase() === "0x"
            ?
            trimedStr.substr(2)
            :
            trimedStr;
    var len = rawStr.length;
    if (len % 2 !== 0) {
        // alert("Illegal Format ASCII Code!");
        return "";
    }
    var curCharCode;
    var resultStr = [];
    for (var i = 0; i < len; i = i + 2) {
        curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
        resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join("");
}

export const Bluetooth = new BluetoothApi();
