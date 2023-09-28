// @ts-nocheck

import * as echarts from "../../components/ec-canvas/echarts.js"
import Dialog from "../../miniprogram_npm/@vant/weapp/dialog/dialog.js";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast.js";
const app: IAppOption = getApp();
var chart1 = {}, chart2 = {};
var option1 = {}, option2 = {};
const optionList = [option1, option2];
const chartList = [chart1, chart2];

function initChart1(canvas, width, height, dpr) {
    chartList[0] = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
    })
    canvas.setChart(chartList[0]);

    Object.assign(option1, {
        title: {
            text: 'OBD 电压',
            left: 'center'
        },
        tooltip: {
            show: false,
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            // data: [0],
            axisLabel: {
                interval: 4,
                formatter: function (value, index) {
                    const s = parseInt(value / 1000);
                    const m = parseInt(s / 60);
                    const formatNumber = n => n.toString().length < 2 ? `0${n}` : `${n}`
                    return `${m}:${formatNumber(s - m * 60)}`
                },
            }
            // data: [0.5,1,1.5],
            // show: false
        },
        yAxis: {
            x: 'center',
            type: 'value',
            axisLabel: {
                formatter: function (value, index) {
                    return value / 1000
                },
            },

            // 次坐标轴
            minorTick: {
                show: true,
                splitNumber: 2,
            },
            // 次坐标轴线
            minorSplitLine: {
                show: true,
            },
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                },
            }
        },
        series: [{
            name: 'A',
            type: 'line',
            // 平滑展示
            smooth: false,
            symbolSize: 0,
            data: []
        }]
    });

    chartList[0].setOption(option1);
    return chartList[0];
}

function initChart2(canvas, width, height, dpr) {
    chartList[1] = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
    })
    canvas.setChart(chartList[1]);

    Object.assign(option2, {
        title: {
            text: '',
            left: 'center'
        },
        tooltip: {
            show: false,
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            // data: [0],
            axisLabel: {
                interval: 4,
                formatter: function (value, index) {
                    const s = parseInt(value / 1000);
                    const m = parseInt(s / 60);
                    const formatNumber = n => n.toString().length < 2 ? `0${n}` : `${n}`
                    return `${m}:${formatNumber(s - m * 60)}`
                },
            }
            // data: [0.5,1,1.5],
            // show: false
        },
        yAxis: {
            x: 'center',
            type: 'value',
            axisLabel: {
                formatter: function (value, index) {
                    return value / 1000
                },
            },

            // 次坐标轴
            minorTick: {
                show: true,
                splitNumber: 2,
            },
            // 次坐标轴线
            minorSplitLine: {
                show: true,
            },
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                },
            }
        },
        series: [{
            name: 'A',
            type: 'line',
            // 平滑展示
            smooth: false,
            symbolSize: 0,
            data: []
        }]
    });

    chartList[1].setOption(option2);
    return chartList[1];
}

Page({
    data: {
        pidList: app.pidList,
        amDataList: [],
        flagShowList: false,
        width: `100% - ${app.globalData.systemInfo.width}rpx`,
        state: true,

        ecList: [
            {
                key: "ec1",
                value: {
                    onInit: initChart1
                },
            },
            {
                key: "ec2",
                value: {
                    onInit: initChart2
                },
            }
        ]

    },
    // 轮询定时器
    engineTimer: null,
    n: 0,
    onLoad() {
        // 这里没处理好
        const { pidList } = this.data;
        const amDataList = wx.getStorageSync('amDataList') || [pidList[0]];
        this.setData({ amDataList });
        this.initTimerSend();
    },

    initTimerSend() {
        clearInterval(this.engineTimer);
        this.engineTimer = setInterval(() => {
            const { amDataList } = this.data;
            amDataList.map(item => app.obd.sendOBD(item.command))
            this.n++;
        }, 500)
    },

    onLongPress({ currentTarget: { dataset: { index } } }) {
        console.log("longpress", index);
        Dialog.confirm({ title: "提示", message: "确定删除吗？" }).then(res => {
            const { amDataList } = this.data;
            if (index === "ec1") {
                amDataList.shift();
                wx.setStorageSync('amDataList', amDataList);
                this.setData({ [`ecList[0].value`]: null, amDataList })
            }
            if (index === "ec2") {
                amDataList.pop();
                wx.setStorageSync('amDataList', amDataList);
                this.setData({ [`ecList[1].value`]: null, amDataList })
            }
        })
    },

    TCPcallback(message) {
        const { amDataList } = this.data;
        console.log(message, 233);
        // 样本模式
        if (message.includes('TEST')) {
            let x = this.n * 1000;
            let y = Math.floor(Math.random() * 12);
            // 根据 amDataList 的命令去控制
            amDataList.map((item, index) => {
                if (message.includes(item.command)) {
                    optionList[index].title.text = item.name;
                    let chartData = optionList[index].series[0].data;
                    if (chartData.length > 20) {
                        optionList[index].series[0].data = chartData.splice(10);
                    }
                    chartData.push([x, y]);
                    chartList[index].setOption(optionList[index]);
                }
            })
            return;
        }

        // 正式模式
        amDataList.map((item, index) => {
            const command = `4${item.command.slice(1)}`;
            if (message.includes(command)) {
                const [, value] = message.split(command);
                const x = this.n * 1000;
                const y = parseInt(value, 16);
                // title修改
                optionList[index].title.text = item.name;
                let chartData = optionList[index].series[0].data;
                // 数据过长时截断
                if (chartData.length > 20) {
                    optionList[index].series[0].data = chartData.splice(10);
                }
                chartData.push([x, y]);
                chartList[index].setOption(optionList[index]);
            }
        })
    },

    onAdd() {
        const { amDataList, flagShowList } = this.data;
        if (amDataList.length === 2) {
            Toast('最多展示两个图表噢')
            return;
        }
        this.setData({ flagShowList: !flagShowList })
    },

    // 点击事件：控制是否轮询
    onCtrlSend() {
        const { state } = this.data;
        if (state) clearInterval(this.engineTimer);
        if (!state) this.initTimerSend();
        this.setData({ state: !state });
    },
    // 点击事件：设置 amdata
    onSetAmData({ currentTarget: { dataset: { index } } }) {
        const { ecList } = this.data;
        const amDataList = wx.getStorageSync('amDataList') || [];
        amDataList.push(index);
        wx.setStorageSync('amDataList', amDataList);
        ecList.forEach((item, index) => {
            if (item.value === null) {
                item.value = {
                    onInit: index ? initChart2 : initChart1
                }
            }
        })
        this.initTimerSend();
        this.setData({ amDataList, flagShowList: false, ecList })
    },
    onHide() {
        clearInterval(this.engineTimer)
    },
    onUnload() {
        clearInterval(this.engineTimer)
    },
    onShareAppMessage(opts): WechatMiniprogram.Page.ICustomShareContent {
        console.log(opts.target)
        return {}
    }
});
