

/**
 * 校验UUID是否符合规则
 * @param uuid 设备uuid
 */
export function uuidCheck(uuid) {
    let reg = /0000([0-9a-f][0-9a-f][0-9a-f][0-9a-f])-0000-1000-8000-00805f9b34fb/
    return uuid.length > 0 && reg.test(uuid.toLocaleLowerCase())
}

/**decryptWSMessage
 * byte数组转字符
 * @param arr byte数组
 */
export function Uint8ToStr(arr) {
    for (var i = 0, str = ''; i < arr.length; i++)
        str += String.fromCharCode(arr[i]);
    return str;
}

/**
 * 将二进制转为十六进制 mac地址
 * @param macArr 二进制数组
 */
export function macHex(macArr) {
    var hexArr = new Array();
    for (var i = 0; i < macArr.length; i++) {
        var str = macArr[i];
        if (str < 16) {
            str = "0" + str.toString(16)
        } else {
            str = str.toString(16)
        }
        hexArr.push(str.toUpperCase())
    }

    return hexArr.join(':');
}

/**
 * 根据PID从数据模型中获取数据对象信息
 * @param pid 设备的pid
 */
export function getDeviceByPid(pid) {
    let list = wx.getStorageSync('deviceModel');
    if (list.length < 1 || pid.length < 1) return

    for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < list[i].m.length; j++) {
            if (list[i].m[j].pid == pid) {
                return list[i].m[j]
            }
        }
    }
}

































/**
 * 解析websocket收到的消息 http://doc.doit/project-5/doc-1/
 * @param deviceResponse 设备的应答信息
 */
export function decryptWSMessage(deviceResponse) {
    const response = deviceResponse
        .split("&")
        .map((item) =>
            item.split("=")
                .map((item) => {
                    if (item.includes("{")) return item;
                    return `"${item}"`;
                })
                .join(":")
        )
        .join()
        .replace(/\ +/g, '')
        .replace(/[\r\n]/g, '');

    // @ts-ignore
    const { cmd:serverCmd, device_id, topic, message , num } = JSON.parse(`{${response}}`);
    const dpid = message?.msg?.data || message?.msg?.uid;
    const res = message?.res
    const deviceCmd = message?.cmd
    return {
        serverCmd,
        deviceCmd,
        device_id,
        dpid,
        res,
        num
    }
}


/**
 * 将扫描包中有用的数据解密出来，并重新合并进去 http://doc.doit/project-5/doc-11/ gap广播格式
 * @param {*} device 查找到的新设备
 * @returns {device} 解密后的设备
 */
export function decryptBluetooth(device) {
    // console.log(device);
    
    let { serviceData, advertisServiceUUIDs, advertisData } = device;
    serviceData = new Uint8Array(serviceData[advertisServiceUUIDs[0]]);
    advertisData = new Uint8Array(advertisData);

    if (uuidCheck(advertisServiceUUIDs[0]) && serviceData[1] != 0) {
        // 将有用的数据解密出来，并合并进去, 后续会用到
        const pid = serviceData.slice(2, 8);
        // console.log(Array.from(advertisData), "advertisData");
        // console.log(Array.from(serviceData), "serviceData");
        // console.log(Array.from(serviceData.slice(8, 14)), "这个是mac");
        
        const mac = getApp().globalData.systemInfo.platform == 'ios' ? serviceData.slice(8, 14) : serviceData.slice(8, 14).reverse();
        const info = getDeviceByPid(Uint8ToStr(pid));

        Object.assign(device, {
            pid: Uint8ToStr(pid),
            mac: macHex(mac),
            network: serviceData[1],
            isBinded: advertisData[0],
            icon: info?.i,
            device_model_name: info?.n,
            ext: info?.ext,
        });
    }
    return device
}


/**
 * 解密蓝牙数据
 * @param message 蓝牙组包
 */
// @ts-ignore
export function decryptBluetoothMessage(message: Number[]) {
    const cmd = message[0]
    switch (cmd) {
        case 0:
            return {
                cmd: message[0],
                len: message[1],
                dev_id: message.slice(3, 13).map(item => (item < 16 ? `0${item.toString(16)}` : item.toString(16))).join(""),
                dev_type: message[13],
                software_ver: message.slice(14, 18).join('.'),
                hardware_ver: message.slice(18, 22).join('.'),
                dev_mac: message.slice(22, 28),
                // @ts-ignore
                pid: message.slice(28, 34).map(item => String.fromCharCode(item)).join(''),
            }
        case 1:
            return {
                cmd: message[0],
                len: message[1],
                res: message[2],
            }
        // cmd4：恢复出厂设置
        case 4:
            return {
                cmd: message[0],
                len: message[1],
                res: message[2],
            }
        // cmd12：配网状态
        case 12:
            return {
                cmd: message[0],
                len: message[1],
                status: message[2],
                data: message.slice(3, 7).map(item => item.toString(16)).reverse().join("")
            }
    }
}


