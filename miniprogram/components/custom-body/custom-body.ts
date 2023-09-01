
// @ts-nocheck
import { calcDateNum } from "../../miniprogram_npm/@vant/weapp/calendar/utils";
import Dialog from "../../miniprogram_npm/@vant/weapp/dialog/dialog";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
import * as util from "../../utils/util"

Component({

    properties: {
        // 作为该body的id
        idx: {
            type: String,
            value: ""
        },
        // 计算该body的高度,已默认减去tabbar高度和头部高度
        height: {
            type: String,
            value: "100vh"
        }
    },

    data: {
        // 状态栏高度
        statusBarHeight: getApp().globalData.systemInfo?.statusBarHeight,
        // 头部高度
        customBar: (getApp().globalData?.systemInfo?.top as number - getApp().globalData?.systemInfo?.statusBarHeight as number) * 2 + getApp().globalData?.systemInfo?.height as number,
        // 下拉刷新标志位
        triggered: false,
        // tababr栏高度
        // tabbarHeight: "var(--tabbar-height, 50px)",
        tabbarHeight: "20px",

        // tabbar的安全距离
        safeAreaInsetBottom: "env(safe-area-inset-bottom)"
    },
    pageLifetimes: {
        show() {
            // try是否减去tabbar高度
            try {
                this.getTabBar().init();
                console.log("是tabbar");
            } catch (err) {
                console.log("不是tabbar");
                this.setData({ tabbarHeight: 0 })
            }
        },
    },

    methods: {
        // 进入下拉刷新
        onPullDownRefresh() {
            this.selectComponent('#loadingAni').showAnimation();
            setTimeout(() => {
                this.setData({ triggered: true });
                this.stopPullDownRefresh();
                Toast('更新数据成功');
                this.triggerEvent('onPullDownRefresh');
            }, 1000);
        },

        // 监听上拉加载
        onReachBottom: util.debounce(function () {
            this.triggerEvent('onReachBottom', this.data.idx)
        }, 100),

        // 停止下拉刷新
        stopPullDownRefresh() {
            this.setData({ triggered: false });
            this.selectComponent('#loadingAni').hideAnimation();
        },
    }
})
