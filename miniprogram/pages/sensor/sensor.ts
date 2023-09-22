
const app = getApp()
Page({
	data: {
		sensorList: app.pidList,
		show: false,
	},
	timer: null,

	onLoad() {

	},

	TCPcallback(message) {
		message = message.replace(/\s/g, '');
		const { sensorList } = this.data;
		sensorList.map((item, index) => {
			const command = "4" + item.command.slice(1, item.command.length);
			if (message.includes(command)) {
				const [, value] = message.split(command);
				this.setData({ [`sensorList[${index}].value`]: parseInt(value, 16) })
			}
		})
	},

	onShow() {
		const { sensorList } = this.data;
		sensorList.map(item => {
			getApp().obd.sendOBD(item.command)
		})
		clearInterval(this.timer)
		this.timer = setInterval(() => {
			sensorList.map(item => {
				getApp().obd.sendOBD(item.command)
			})
		}, 5000)
	},

	showPop() {
		this.setData({ show: true })
	},

	onClickHide() {
		this.setData({ show: false })
	},

	onHide() {
		clearInterval(this.timer)
	},

	onUnload() {
		clearInterval(this.timer)
	},
})