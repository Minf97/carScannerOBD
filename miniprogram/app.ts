// @ts-nocheck

import { Bluetooth } from "./packages/Bluetooth";
import { pidList } from "./utils/pid"

// 
App<IAppOption>({
	globalData: {
		systemInfo: null,
	},
	pidList: pidList,
	// ATZ: [41, 54, '5A', '0D'],
	// ATE0: [41, 54, 45, 30, '0D'],
	// ATE1: [41, 54, 45, 31, '0D'],
	obd: null,
	isTest: false,
	testOBD: {
		sendOBD: function (param) {
			const p = getCurrentPages();
			const firstPage = p[0];
			const lastPage = p[p.length - 1];
			// 将消息传入页面的TCPcallback中
			typeof (lastPage.TCPcallback) === 'function'
				? lastPage.TCPcallback(`TEST${param}`)
				: firstPage.TCPcallback(`TEST${param}`)
		}
	},
	onLaunch() {
		// 自定义头部所需的系统信息
		const systemInfo = wx.getSystemInfoSync();
		const menuInfo = wx.getMenuButtonBoundingClientRect();

		this.globalData.systemInfo = Object.assign({}, systemInfo, menuInfo);

		Bluetooth.openBluetoothAdapter().then(() => {
			console.log("初始化蓝牙");
			// 组包 - 收到 '>' 就把数据组成一起发给TCPcallback
			let messageList = [];
			Bluetooth.onBLECharacteristicValueChange((message, deviceId) => {
				const p = getCurrentPages();
				const firstPage = p[0];
				const lastPage = p[p.length - 1];
				message = message.replace(/\s/g, '');

				if (message.includes('>')) {
					this.obd.receiveFlag = true;
					// 将消息传入页面的TCPcallback中
					typeof (lastPage.TCPcallback) === 'function'
						? lastPage.TCPcallback(messageList.join(""))
						: firstPage.TCPcallback(messageList.join(""))
					// 清空
					messageList = [];
				}
				else {
					messageList.push(message);
				}
			})
		})
	},

})