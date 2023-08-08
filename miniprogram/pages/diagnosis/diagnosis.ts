// pages/diagnosis/diagnosis.ts
Page({
    data: {

    },

    onLoad() {

    },
    naviTo({ currentTarget: { dataset: { index } } }) {
        wx.navigateTo({ url: `./reading/reading?index=${index}` })
    },

    onShareAppMessage() {

    }
})