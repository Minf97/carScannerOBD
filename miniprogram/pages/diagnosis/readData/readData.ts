import Toast from "../../../miniprogram_npm/@vant/weapp/toast/toast";
import { decrypt03 } from "../../../utils/decrypt"

const app = getApp();
Page({
    data: {
        list: [
            {
                code: "P0082",
                system: "引擎控制单元",
                state: "暂时",
                desc: "123123123"
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
        ],
    },

    TCPcallback(message) {
        // 简单过滤一下
        if (message.length > 3) {
            const { list } = this.data;
            const decryptMsg = decrypt03(message);
            this.setData({ list: list.concat(decryptMsg) });
            Toast.clear();
        }
    },

    onLoad() {

    },

    onShow() {
        app.obd.sendOBD('03');
        Toast.loading("正在诊断...");
    },

    del({ currentTarget: { dataset: { index } } }) {
        const { list } = this.data;
        list.splice(index, 1);
        this.setData({ list })
    },

    onShareAppMessage() {

    }
})