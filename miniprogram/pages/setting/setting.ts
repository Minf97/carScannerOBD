
const app = getApp();
Page({

	data: {
		ddd: "",

		returnVal: "",
		// 展示数组
		list: [],
	},
	onLoad() {

	},

	TCPcallback(message) {
		console.log(message);
		const { list } = this.data;
		let last = list[list.length - 1]["returnVal"];
		list[list.length - 1]["returnVal"] = (last ? last : '') + '\n' + message
		this.setData({ list })
	},

	demo({ detail: { value } }) {
		this.setData({ ddd: value })
	},

	submit() {
		const { list, ddd } = this.data;
		list.push({ sendVal: ddd })
		app.obd.sendOBD(ddd)
	},

	onShareAppMessage() {

	}
})