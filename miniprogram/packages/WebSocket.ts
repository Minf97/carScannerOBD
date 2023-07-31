// 1.7.0 及以上版本，最多可以同时存在 5 个 WebSocket 连接。
// 1.7.0 以下版本，一个小程序同时只能有一个 WebSocket 连接，如果当前已存在一个 WebSocket 连接，会自动关闭该连接，并重新创建一个 WebSocket 连接。
import { ADDRESS_WEBSOCKET } from "../constants/api";
import { CONNECTION_WEBSOCKET_TIMEOUT } from "../constants/config";


// 封装的 websocket 官方api基类
class WebSocketApiBase {
    public url: string;
    public ws: WechatMiniprogram.SocketTask;
    public connectStatus = null;

    public heartbeatInterval = null; // 心跳定时器
    public dropReconnectInterval = null; // 掉线重连定时器
    public dropReconnectCount = 0;   // 重连次数

    public propsWebsocketMessage = null;


    constructor(url: string) {
        this.url = url;
    }

    /**
     * 连接到指定socket地址
     */
    connectSocket() {
        this.connectStatus = null;
        const websocket = wx.connectSocket({
            url: this.url, timeout: 20000, header: {}
        });
        websocket.onOpen(() => {
            this.connectStatus = "success";
            console.log("连接成功");
            // 保活心跳
            wx.hideLoading();
            this.keepConnect();
        });
        websocket.onClose(() => {
            if (this.connectStatus != "quit")
                this.connectStatus = "close";
        });
        websocket.onError(() => {
            if (this.connectStatus != "quit")
                this.connectStatus = "error";
        });
        // 接收消息事件
        websocket.onMessage((res) => {
            console.log(res);
            const response = decryptWSMessage(res.data);
            // console.log("websocket接收到消息：", response);
            if (response.dpid) this.propsWebsocketMessage(response);
        });

        this.ws = websocket;
        this.ws.onMessage = websocket.onMessage;

        // 掉线重连检测
        this.dropReconnect();
    }

    /**
     * 发送心跳包，保持websocket连接
     */
    keepConnect() {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            if (this.connectStatus == "quit")
                clearInterval(this.heartbeatInterval);
            else if (this.connectStatus == "success")
                this.ws_send(`cmd=ping`);
        }, CONNECTION_WEBSOCKET_TIMEOUT)
    }

    /**
     * websocket掉线重连
     */
    dropReconnect() {
        const dropReconnectInterval = this.dropReconnectInterval;
        if (dropReconnectInterval) clearInterval(dropReconnectInterval);

        this.dropReconnectInterval = setInterval(() => {
            const connectStatus = this.connectStatus;
            if (connectStatus == null || connectStatus == "success") return;

            // 掉线重连
            wx.showLoading({ title: '掉线重连中...' });
            clearInterval(this.dropReconnectInterval);
            this.dropReconnectCount++;
            if (this.dropReconnectCount == 10) {
                wx.showToast({ title: '连接失败，请重启小程序' });
                return;
            }
            this.connectSocket();
        }, 1000);
    }

    /**
     * 关闭websocket连接
     */
    close() {
        const websocket = this.ws,
            heartbeatInterval = this.heartbeatInterval,
            dropReconnectInterval = this.dropReconnectInterval;

        // 关闭全局定时器
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (dropReconnectInterval) clearInterval(dropReconnectInterval);
        // 关闭socket
        if (websocket) websocket.close({});

        this.ws = null;
        this.connectStatus = "quit";
        this.heartbeatInterval = null;
        this.dropReconnectInterval = null;
    }

    /**
     * 向绑定的socket地址里发送数据
     * @param data 数据
     */
    ws_send(data) {
        if (!this.ws || this.connectStatus != 'success') return false
        console.log("发送成功:", data);
        this.ws.send({ data: data });
        return true;
    }
}


// 在公网中，客户端与设备端的通信主要依赖Websocket，
class WebSocketModel extends WebSocketApiBase {
    constructor() {
        super(ADDRESS_WEBSOCKET)
    }

    /**
     * 订阅某个设备
     * @param device_id 设备id
     * @param device_key 设备key
     */
    async subcribe(device_id: string, device_key: string) {
        // 发送订阅信息
        this.ws_send(`cmd=subscribe&topic=device_${device_id}&from=control&device_id=${device_id}&device_key=${device_key}`)
    }

    /**
     * 向指定的设备发送消息
     * @param param 
     */
    assembleDataSend({ msg, cmd, device_id, device_key }) {
        msg = JSON.stringify(msg);
        const timestamp1 = Date.parse(new Date() as any);
        const message = `cmd=publish&topic=control_${device_id}&device_id=${device_id}&device_key=${device_key}&message={"cmd":${cmd},"pv":0,"sn":"${timestamp1}","msg":${msg}}`;

        this.ws_send(message)
    }

    /**
     * websocket的监听回调函数 - 注册回调函数
     * @param fn 外部使用箭头函数
     */
    onMessage(fn: Function) {
        this.propsWebsocketMessage = fn;
    }
}

export default new WebSocketModel()