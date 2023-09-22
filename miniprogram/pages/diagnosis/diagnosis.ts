
import Dialog from "../../miniprogram_npm/@vant/weapp/dialog/dialog"

Page({
	data: {

	},

	onLoad() {
		Dialog
	},
	naviTo({ currentTarget: { dataset: { index } } }) {
		// wx.navigateTo({ url: `./reading/reading?index=${index}` })
		if (index == 'clear') {
			Dialog.confirm({
				title: "警告！",
				message: "部分汽车在发动机运转时不允许清除代码。请尝试在 IGNITION 为 ON 但ENGINE 为 OFF 时清除 DTC 代码。"
			})
				.then(() => {
					wx.navigateTo({ url: `./readData/readData?index=${index}` })
				})
		}
		else {
			wx.navigateTo({ url: `./readData/readData?index=${index}` })
		}
	},

	onShareAppMessage() {

	}
})