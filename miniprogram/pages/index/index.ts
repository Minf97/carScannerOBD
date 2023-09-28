import Dialog from "../../miniprogram_npm/@vant/weapp/dialog/dialog";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast"
import { Bluetooth, BluetoothModel } from "../../packages/Bluetooth"
import { decrypt0902 } from "../../utils/decrypt";

const app = getApp();
const list = [
	{
		id: 'panel',
		img: '/static/images/index/panel.png',
		activeImg: '/static/images/index/panel_active.png',
		txt: '仪表盘',
		isC: false,
		event: 'naviTo'
	},
	{
		id: 'amdata',
		img: '/static/images/index/amdata.png',
		activeImg: '/static/images/index/amdata_active.png',
		txt: '实时数据',
		isC: false,
		event: 'naviTo'
	},
	{
		id: 'sensor',
		img: '/static/images/index/sensor.png',
		activeImg: '/static/images/index/sensor_active.png',
		txt: '所有传感器',
		isC: false,
		event: 'naviTo'
	},
	{
		id: 'diagnosis',
		img: '/static/images/index/diagnosis.png',
		activeImg: '/static/images/index/diagnosis_active.png',
		txt: '诊断故障代码',
		isC: false,
		event: 'naviTo'
	},
	{
		id: 'setting',
		img: '/static/images/index/setting.png',
		activeImg: '/static/images/index/setting_active.png',
		txt: '设置',
		isC: false,
		event: 'naviTo'
	},
	{
		id: '',
		img: '',
		txt: '',
		isC: false,
		event: 'naviTo'
	},
	// {
	//   id: 'save',
	//   img: '/static/images/index/save.png',
	//   txt: '定格',
	//   isC: false,
	//   event: 'naviTo'
	// },
	// {
	//     id: 'constant',
	//     img: '/static/images/index/constant.png',
	//     txt: '非连续监视器',
	//     isC: false,
	//     event: 'naviTo'
	// }
	// {
	//     id: 'setting',
	//     img: '/static/images/index/setting.png',
	//     txt: '设置',
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
		VIN: "",
		txtExit: "断开",

		ddd: "",


		returnVal: "",
	},
	obd: null,

	onLoad() {

	},

	naviTo({ currentTarget: { dataset: { id } } }) {
		const { state } = this.data
		if (!state) {
			Toast.fail('请先连接OBD');
			return;
		}
		// 仪表盘
		if (id === 'panel') wx.navigateTo({ url: "/pages/panel/panel" })
		// 实时数据
		if (id === 'amdata') wx.navigateTo({ url: "/pages/amdata/amdata" })
		// 所有传感器
		if (id === 'sensor') wx.navigateTo({ url: "/pages/sensor/sensor" })
		// 诊断故障代码
		if (id === 'diagnosis') wx.navigateTo({ url: "/pages/diagnosis/diagnosis" })
		// 设置
		if (id === 'setting') wx.navigateTo({ url: "/pages/setting/setting" })
	},

	TCPcallback(message) {
		console.log(message);
		if (message != decrypt0902(message)) {
			this.setData({ VIN: decrypt0902(message) });
			// 接收到0902才算完成初始化
			Toast.success('蓝牙连接成功');
			clearTimeout(this.timer);
		}
		const { returnVal } = this.data;
		this.setData({ returnVal: returnVal + '\n' + message })
	},
	timer: null,
	// 连接OBD
	connectOBD() {
		// 进行提示
		Toast.loading({ duration: 0, message: "正在搜索" });
		// 10秒钟没搜到就
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
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
			Toast.loading({ duration: 0, message: '等待初始化' });
			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				Toast.clear();
				Dialog.alert({
					title: "提示",
					message: "初始化失败！请重启设备或联系客服"
				})
			}, 10000);
			// Toast.loading('蓝牙连接 ELM 成功');
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
			});
			app.obd = app.testOBD;
			Toast.clear()
		}, 500);
	},

	disconnect() {
		const { txtExit, state } = this.data;
		// 离开样本模式
		if (state && txtExit == '离开样本模式') {
			this.setData({
				state: false,
				ELM: "已断开",
				ECU: "已断开",
				VIN: ""
			});
			app.isTest = false;
		}
		// 断开连接
		if (state && txtExit == '断开') {
			this.obd.closeBLEConnection().then(res => {
				console.log(res);
				this.setData({
					state: false,
					ELM: "已断开",
					ECU: "已断开",
					VIN: ""
				});
				Toast.success('已断开连接')
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