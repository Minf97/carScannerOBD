import Dialog from "../../miniprogram_npm/@vant/weapp/dialog/dialog";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast"
import { Bluetooth, BluetoothModel } from "../../packages/Bluetooth"
const app = getApp();
const list = [
    {
        id: 'panel',
        img: '/static/images/index/panel.png',
        txt: '仪表盘',
        isC: false,
        event: 'naviTo'
    },
    {
        id: 'amdata',
        img: '/static/images/index/amdata.png',
        txt: '实时数据',
        isC: false,
        event: 'naviTo'
    },
    {
        id: 'sensor',
        img: '/static/images/index/sensor.png',
        txt: '所有传感器',
        isC: false,
        event: 'naviTo'
    },
    {
        id: 'diagnosis',
        img: '/static/images/index/diagnosis.png',
        txt: '诊断故障代码',
        isC: false,
        event: 'naviTo'
    },
    {
        id: 'save',
        img: '/static/images/index/save.png',
        txt: '定格',
        isC: false,
        event: 'naviTo'
    },
    // {
    //     id: 'constant',
    //     img: '/static/images/index/constant.png',
    //     txt: '非连续监视器',
    //     isC: false,
    //     event: 'naviTo'
    // }
]

Page({
    data: {
        show: false,
        list,
        state: false,
        ELM: "已断开",
        ECU: "已断开",
        txtExit: "断开",

        ddd: ""
    },
    obd: null,

    onLoad() {

    },

    naviTo({ currentTarget: { dataset: { id } } }) {
        const { state } = this.data
        // if (!state) {
        //     Toast.fail('请先连接OBD');
        //     return;
        // }
        // 仪表盘
        if (id === 'panel') wx.navigateTo({ url: "/pages/panel/panel" })
        // 实时数据
        if (id === 'amdata') wx.navigateTo({ url: "/pages/amdata/amdata" })
        // 所有传感器
        if (id === 'sensor') wx.navigateTo({ url: "/pages/sensor/sensor" })
        // 诊断故障代码
        if (id === 'diagnosis') wx.navigateTo({ url: "/pages/diagnosis/diagnosis" })
    },

    TCPcallback(message) {
        console.log(message);

    },

    // 连接OBD
    connectOBD() {
        // 进行提示
        Toast.loading({
            message: "正在搜索",
            duration: 0
        });
        // 10秒钟没搜到就
        const timer = setTimeout(() => {
            Toast.clear();
            Dialog.alert({
                title: "提示",
                message: "没有搜索到！请检查设备是否开启"
            })
        }, 10000);
        // 开始搜索
        Bluetooth.startBluetoothDevicesDiscovery()
            .then(() => { console.log("开始搜索"); })
            .catch(err => Toast.fail(err.errMsg))
        // 监听搜索到的蓝牙
        Bluetooth.onBluetoothDeviceFound((res) => {
            this.obd = new BluetoothModel(res[0].deviceId);
            app.obd = this.obd;
            this.setData({
                state: true,
                ELM: "已连接",
                ECU: "已连接"
            })
            Bluetooth.stopBluetoothDevicesDiscovery();
            // 清除定时器
            clearTimeout(timer);
            Toast.success('蓝牙连接 ELM 成功');
        })
    },

    // 设置样本模式
    setExample() {
        Toast.loading('正在进入样本模式');
        setTimeout(() => {
            this.setData({
                state: true,
                ELM: "已连接",
                ECU: "已连接",
                txtExit: "离开样本模式"
            })
            Toast.clear()
        }, 1000);
    },

    disconnect() {
        const { txtExit, state } = this.data;
        if (state && txtExit == '离开样本模式') {
            this.setData({
                state: false,
                ELM: "已断开",
                ECU: "已断开",
            })
        }
        // if(state && txtExit == '离开样本模式')
    },

    demo({ detail: { value } }) {
        this.setData({ ddd: value })
    },

    submit() {
        this.obd.sendOBD(this.data.ddd)
    },

    onShareAppMessage(opts): WechatMiniprogram.Page.ICustomShareContent {
        console.log(opts.target)
        return {}
    }
})