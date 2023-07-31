
## Websocket - 公网
本项目中，客户端与服务端的通讯可以区分为公网和内网，公网情况下，通讯的核心逻辑为`websocket`，为了规范开发，特封装了`websocket库`以应对在项目中可以复用的逻辑

### 模型描述

在`app.js`里挂载`Websocket`服务，对当前**已配网的设备**进行监听和控制

思考以下场景：

- 在配网的设备中，有的设备连接了服务器a，有的设备连接了服务器b。此时如何在公网下监听两台设备的消息？如何控制两台设备？
  - 连接所有配网设备的服务器，用一个Map维护已连接的socket服务器
  - 接收消息会携带设备id，因此可以用唯一的监听函数接收两台服务器的消息。
- 如何监听所有的设备？
  - 在首页的`onShow`声明周期内，遍历订阅设备
- 如何控制所有的设备？
  - 在首页可以轻易拿到该设备的信息并控制，而对于控制面板内，是通过 **globalData.openDeviceInfo** 拿到设备信息，在进行控制
 
 如果需要区分不同服务器发送的消息，可进行扩展：在`onMessage`接收函数中进行数据清洗，再传入给`propsWebsocketMessage`，当下已经根据文档进行了一次数据清洗，便于查看并使用接收到的消息
### 使用方法
 - 订阅已配网的设备
 ```js
 import WebSocket from "/packages/WebSocket.ts"
 WebSocket.subcribe(设备id, 设备key)
 ```
 - 公网控制设备
 ```js
 import WebSocket from "/packages/WebSocket.ts"
 WebSocket.assembleDataSend({
    msg: 'http://doc.doit/project-5/doc-2/ 详见通讯约定',
    cmd: 'http://doc.doit/project-5/doc-2/ 详见设备通信',
    device_id: '设备id',
    device_key: '设备key'
 })
 ```
 - 公网接收设备信息
 ```js
 // 此处接收消息回调放在了全局app.js里,要先onMessage
 import WebSocket from "/packages/WebSocket.ts"
 WebSocket.onMessage((res) => {
    console.log(res, "接收成功");
 })
 WebSocket.connectSocket();
 ```

## 内网
内网直连：收发消息不需要经过服务端，直接走设备端

### 模型描述
内网判断：通过UDP发送广播，如果收到设备的回复信息，**并且该设备是我的设备**，就代表**该设备**可以进行内网直连

在客户端里采用**内网优先**策略，周期性进行内网判断，成功则走内网，失败则走公网（当前一定会走公网），具体做法如下
1. 封装内网判断函数`getLANdevice(已配网设备数组, 周期时间):在内网中的设备数组`，表示在周期时间内，对已配网的设备进行搜索，找到处于内网中的配网设备
2. 将函数返回值 根据ip进行连接并挂载到globalData，
3. 在控制设备时，先寻找内网设备数组有没有该设备，


[
    {
        ip: ,
        设备id,
        port 5555
    },
    {

    }
]

