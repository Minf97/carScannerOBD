import * as echarts from "../../components/ec-canvas/echarts"
import { Bluetooth, BluetoothModel } from "../../packages/Bluetooth"

const app = getApp();
var chart1, option1;
var chart3, option3;

function initChart1(canvas, width, height, dpr) {
    chart1 = echarts.init(canvas, null, {
        width: 500,
        height: 500,
        devicePixelRatio: dpr
    });
    canvas.setChart(chart1);

    option1 = {
        series: [
            {
                name: 'Pressure',
                type: 'gauge',
                progress: {
                    show: false
                },
                max: 7000,
                // 仪表盘半径
                radius: '90%',
                // 仪表盘刻度分割段数
                splitNumber: 7,
                // 分隔线
                splitLine: {
                    show: true,
                    length: 15,
                    lineStyle: {
                        color: '#fff',
                        width: 4,
                    }
                },
                // 仪表盘轴线相关
                axisLine: {
                    // 是否显示
                    show: true,
                    // 仪表盘轴线样式
                    lineStyle: {
                        color: [[0.86, '#ffffff'], [0.86, '#fd2d17'], [1, '#fd2d17']],
                        width: 10
                    }
                },
                // 刻度样式
                axisTick: {
                    show: true,
                    splitNumber: 2,
                    length: 10,
                    lineStyle: {
                        color: '#fff',
                        width: 2,
                    }
                },
                // 刻度标签
                axisLabel: {
                    color: '#fff',
                    fontSize: 25,
                    distance: 25
                },
                // 仪表盘指针
                pointer: {
                    length: '75%',
                    width: 9,
                    itemStyle: {
                        color: '#d92318'
                    }
                },
                detail: {
                    color: '#fff',
                    valueAnimation: true,
                    formatter: '{value}'
                },
                title: {
                    color: '#fff',
                    offsetCenter: [0, '70%'],
                    fontSize: 18,
                },
                // 展示的数据，可以有多段数据，即多个object
                data: [
                    {
                        value: 3500,
                        name: '发动机转速'
                    },
                ]
            }
        ]
    };
    chart1.setOption(option1);
    return chart1;
}

function initChart3(canvas, width, height, dpr) {
    chart3 = echarts.init(canvas, null, {
        width: 500,
        height: 500,
        devicePixelRatio: dpr
    });
    canvas.setChart(chart3);

    option3 = {
        series: [
            {
                name: 'Pressure',
                type: 'gauge',
                progress: {
                    show: false
                },
                min: -20,
                max: 120,
                // 仪表盘半径
                radius: '90%',
                // 仪表盘刻度分割段数
                splitNumber: 7,
                // 分隔线
                splitLine: {
                    show: true,
                    length: 15,
                    lineStyle: {
                        color: '#fff',
                        width: 4,
                    }
                },
                // 仪表盘轴线相关
                axisLine: {
                    // 是否显示
                    show: true,
                    // 仪表盘轴线样式
                    lineStyle: {
                        color: [[0.86, '#ffffff'], [0.86, '#fd2d17'], [1, '#fd2d17']],
                        width: 10
                    }
                },
                // 刻度样式
                axisTick: {
                    show: true,
                    splitNumber: 2,
                    length: 10,
                    lineStyle: {
                        color: '#fff',
                        width: 2,
                    }
                },
                // 刻度标签
                axisLabel: {
                    color: '#fff',
                    fontSize: 25,
                    distance: 25
                },
                // 仪表盘指针
                pointer: {
                    length: '75%',
                    width: 9,
                    itemStyle: {
                        color: '#d92318'
                    }
                },
                detail: {
                    color: '#fff',
                    valueAnimation: true,
                    formatter: '{value}'
                },
                title: {
                    color: '#fff',
                    offsetCenter: [0, '70%'],
                    fontSize: 18,
                },
                // 展示的数据，可以有多段数据，即多个object
                data: [
                    {
                        value: 0,
                        name: '冷却液温度'
                    },
                ]
            }
        ]
    };
    chart3.setOption(option3);
    return chart3;
}


Page({

    data: {
        show: false,
        // 状态栏高度
        statusBarHeight: 0,
        // 头部高度
        customBar: 0,
        // tababr栏高度
        tabbarHeight: "var(--tabbar-height, 50px)",
        // tabbar的安全距离
        safeAreaInsetBottom: "env(safe-area-inset-bottom)",
        ec1: { onInit: initChart1 },
        speed: 0,
    },
    engineTimer: null,
    tmpTimer: null,

    onLoad() {
        this.setData({
            ec1: { onInit: initChart1 },
            ec3: { onInit: initChart3 },
            statusBarHeight: getApp().globalData.systemInfo?.statusBarHeight,
            customBar: (getApp().globalData?.systemInfo?.top as number - getApp().globalData?.systemInfo?.statusBarHeight as number) * 2 + getApp().globalData?.systemInfo?.height as number,
        });
        setTimeout(() => {
            option1.series[0].data[0].value = 4000;
            chart1.setOption(option1)
        }, 1000);
    },

    onShow() {
        clearInterval(this.engineTimer);
        this.engineTimer = setInterval(() => {
            // 发动机转速
            app.obd.sendOBD('010C');
            // 冷却液温度 ---- 水温 ----- 发动机冷媒温度 
            app.obd.sendOBD('0105');
            // 车速
            app.obd.sendOBD('010D');
        }, 200)
    },

    TCPcallback(message) {
        message = message.replace(/\s/g, '');
        console.log("原始数据：", message);
        // 转速
        if (message.includes('410C')) {
            const [, value] = message.split('410C');
            option1.series[0].data[0].value = parseInt(value, 16);
            chart1.setOption(option1)
        }
        // 车速
        if (message.includes('410D')) {
            const [, value] = message.split('410D');
            this.setData({ speed: parseInt(value, 16) })
        }
        // 水温
        if (message.includes('4105')) {
            const [, value] = message.split('4105');
            option3.series[0].data[0].value = parseInt(value, 16);
            chart3.setOption(option3)
        }
    },

    showPop() {
        this.setData({ show: true })
    },
    onClickHide() {
        this.setData({ show: false })
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
})