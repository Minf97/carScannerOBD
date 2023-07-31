

// class UDPSocket extends demo {}
export class UDPSocket {
    public udp: WechatMiniprogram.UDPSocket;
    public address: string;
    public port: number;
    public pre = 0;

    constructor(option: WechatMiniprogram.UDPSocketConnectOption) {
        this.udp = wx.createUDPSocket();
        this.address = option.address;
        this.port = option.port;
    }

    bind() {
        return this.udp.bind();
    }

    send(message: string | ArrayBufferLike) {
        this.udp.send({
            address: this.address,
            port: this.port,
            message: message
        })
        const now = Date.now();
        // console.log("send", this.address, this.port, "send23333", now - this.pre);
        this.pre = now;
    }

    close() {
        this.udp.close();
    }

    onMessage(fn: Function) {
        this.udp.onMessage(res => {
            // console.log(res, 2333);
            const { message } = res;
            fn(message);
        })
    }

    offMessage() {
        this.udp.offMessage();
    }
}

/**
 * 局域网发送信息协议
 * @param cmd 命令
 */
function agreement_send(cmd) {
    return JSON.stringify(cmd) + '\r' + '\n';
}

/**
 * 全局唯一的局域网通信类
 */
class LANCommunication extends UDPSocket {

    constructor() {
        super({
            address: '255.255.255.255',
            port: 6095
        })
        this.bind();
    }

    /**
     * 发送广播帧发现设备: 当局域网内的设备收到后会回复包
     *  http://doc.doit/project-5/doc-2/
     */
    searchDevice() {
        const cmd0 = {
            cmd: 0,
            pv: 0,
            sn: "" + new Date().getTime(),
            msg: {}
        }
        const msg = agreement_send(cmd0);
        // console.log("发送消息了", msg);
        this.send(msg);
    }


    /**
     * 监听回复
     */
    onMessage(fn) {
        //udp返回字节流转字符数组解析完成后返回给页面
        const updMsgFix = (arrayBuffer) => {
            let unit8Arr = new Uint8Array(arrayBuffer);
            let encodedString = String.fromCharCode.apply(null, unit8Arr),
                decodedString = decodeURIComponent(escape((encodedString))); //没有这一步中文会乱码
            decodedString = JSON.parse(decodedString);
            return decodedString;
        }

        this.udp.onMessage(res => {
            const { message } = res;
            fn(updMsgFix(message));
        })
    }

}

export const LAN_UDP = new LANCommunication()