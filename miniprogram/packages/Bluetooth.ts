import Dialog from "../miniprogram_npm/@vant/weapp/dialog/dialog"
import Toast from "../miniprogram_npm/@vant/weapp/toast/toast"
import * as decrypt from "../utils/decrypt"
import * as util from "../utils/util"

type PID = 
// ------------- 仪表盘
// 复位
'ATZ' | 
'ATE0' |
'ATM0' |
'ATL0' |
'ATS0' |
'AT@1' |
'ATI' |
'ATH0' |
'ATAT1' |
'ATSP6' |
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
'0142' | 
//  ------------ 诊断错误代码
// // 显示已储存的诊断错误码（DTC）
// '0103' |
// // 	显示未处理的诊断错误码（在目前或上一次驾驶周期侦测到的诊断错误码）
// '0107' | 
'03' | 
'07' |
'0902' 













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
	public receiveFlag = true    //接收到> 标志位

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
						this.sendOBD('ATZ');
                        this.sendOBD('ATE0');
                        this.sendOBD('ATM0');
                        this.sendOBD('ATL0');
                        this.sendOBD('ATS0');
                        this.sendOBD('AT@1');
                        this.sendOBD('ATI');
                        this.sendOBD('ATH0');
                        this.sendOBD('ATAT1');
                        this.sendOBD('ATSP6');
                        this.sendOBD('0902');
                    })
            })
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
			// 阻止并行：等待上一个发送成功再发送下一个,
			// 等待收到回复再发送下一条
			!this.isSending && 
			this.receiveFlag && 
			this.sendMsg(this.bleDatasSendArr.shift());
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
	
	closeBLEConnection() {
		return wx.closeBLEConnection({deviceId: this.writeInfo.deviceId})
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
		this.receiveFlag = false;
        const vv = hexToAscii(order.join(''));
        const hex = str2abc(vv);
        // console.log("发送：", vv);


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
