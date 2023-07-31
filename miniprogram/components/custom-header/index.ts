
// @ts-nocheck
Component({
    properties: {
        bgColor: {
            type: String,
            value: '#fff'
        },
        back: {
            type: Boolean,
            value: false
        },
        
    },
    data: {
        // 状态栏高度
        statusBarHeight: getApp().globalData.systemInfo?.statusBarHeight,
        // 头部高度
        customBar: (getApp().globalData?.systemInfo?.top as number - getApp().globalData?.systemInfo?.statusBarHeight as number) * 2 + getApp().globalData?.systemInfo?.height as number
    },
    methods: {
        backPage() {
            wx.navigateBack({
                delta: 1
            });
        },
    }
})
