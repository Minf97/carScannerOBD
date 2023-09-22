
Page({

	data: {
		allData: new Array(200).fill(1).map((item, index) => ({ name: index })),
		// 每个任务的高度
		dataItemHeight: 200,
		// 一页展示多少个任务数量
		onePageViewAllDataCount: 5,
		viewDataObject: {
			startIndex: 0,
			endIndex: 5
		},
		// 一页展示的所有数据
		onePageViewAllData: [],


		// 可视区域高度
		screenHeight: "100%",
		// 列表每项高度
		itemSize: "48",
		// 列表数据
		listData: new Array(200).fill(1).map((item, index) => ({ name: index })),
		// 当前滚动位置
		scrollTop: 0,


		// 可显示的列表项数
		visibleCount: 0,
		// 数据的起始索引
		startIndex: 5,
		// 数据的结束索引
		endIndex: 0,
		// 列表显示的数据
		visibleData: [],
		// 偏移量
		startOffset: 0,
	},

	onLoad() {
		const { itemSize, listData } = this.data;
		const systemInfo = wx.getSystemInfoSync();
		const visibleCount = Math.ceil(systemInfo.windowHeight / itemSize);
		const visibleData = listData.slice(0, visibleCount);
		this.setData({ visibleCount, visibleData })
	},

	onScroll({ detail: { scrollTop } }) {
		const { itemSize, visibleCount, listData } = this.data;
		const startIndex = Math.floor(scrollTop / itemSize);
		const endIndex = startIndex + visibleCount;
		const startOffset = scrollTop - (scrollTop % itemSize)
		this.setData({
			scrollTop, startIndex, endIndex, startOffset,
			visibleData: listData.slice(startIndex, endIndex)
		})
	},

	onReady() {
		console.log(this.data.allData);
	}
});
