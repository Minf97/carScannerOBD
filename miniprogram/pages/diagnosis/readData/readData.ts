import Dialog from "../../../miniprogram_npm/@vant/weapp/dialog/dialog";
import Toast from "../../../miniprogram_npm/@vant/weapp/toast/toast";
import { decrypt03_07 } from "../../../utils/decrypt"

const app = getApp();
const testList = [
	{
		code: "P0082",
		system: "引擎控制单元",
		state: "暂时",
		desc: "故障码描述演示示例"
	},
	{
		code: "P0082",
		system: "引擎控制单元",
		state: "暂时"
	},
	{
		code: "P0082",
		system: "引擎控制单元",
		state: "暂时"
	},
]
Page({
	data: {
		list: [],
		clear: false,
	},

	TCPcallback(message) {
		console.log(message, 888);

		const { list } = this.data;
		// 测试模式
		if (message.includes('TEST')) {
			if (message.includes('03')) {
				this.setData({ list: testList });
			}
			if (message.includes('04')) {
				this.setData({ list: [], clear: true });
            }
            setTimeout(() => {
                Toast.clear();
            }, 1000);
			
			return;
		}
		// 正式模式
		// 简单过滤一下
		if (message.length > 3) {
			const decryptMsg = decrypt03_07(message);
			this.setData({ list: list.concat(decryptMsg) });
			Toast.clear();
		}
	},

	onLoad(options) {
		const { index } = options;
		if (index == 'reading') {
			app.obd.sendOBD('03');
			app.obd.sendOBD('07');
			Toast.loading("正在诊断...");
		}
		if (index == 'clear') {
			app.obd.sendOBD('04');
			app.obd.sendOBD('14');
			app.obd.sendOBD('14');

			Toast.loading({ duration: 0, message: "正在清除..." });
		}
	},

	onShow() {

	},

	del({ currentTarget: { dataset: { index } } }) {
		Dialog.confirm({ title: "警告", message: "仅在 ECU 引擎控制单元 中清除 DTC？ 有些汽车在发动机运转时不允许清除 DTC 代码。如果清除失败，请尝试在点火开启但发动机关闭的情况下进行。" })
			.then(() => {
				// const { list } = this.data;
				// list.splice(index, 1);
				// this.setData({ list });
				app.obd.sendOBD('04');
				app.obd.sendOBD('14');
				app.obd.sendOBD('14');
				
				Toast.loading({ duration: 0, message: "正在清除..." });
				setTimeout(() => {
					this.setData({ list: [], clear: true });
					Toast.clear();
				}, 400);
			})
	},

	onShareAppMessage() {

	}
})