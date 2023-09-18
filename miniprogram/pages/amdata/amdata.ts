import * as echarts from "../../components/ec-canvas/echarts.js"
const app: IAppOption = getApp();
var chart1, chart2;
var option1, option2;

function initChart(canvas, width, height, dpr) {
    chart1 = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
    });
    canvas.setChart(chart1);

    option1 = {
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
    };

    chart1.setOption(option1);
    return chart1;
}

Page({
    data: {
        width: `100% - ${app.globalData.systemInfo.width}rpx`,
        state: true,
        ec: {
            onInit: initChart
        }
    },
    // 轮询定时器
    engineTimer: null,
    n: 0,
    onShow() {
        this.initTimerSend();
    },

    initTimerSend() {
        clearInterval(this.engineTimer);
        this.engineTimer = setInterval(() => {
            // 发动机转速
            app.obd.sendOBD('0142');
            this.n++;
        }, 500)
    },

    TCPcallback(message) {
        console.log(message, 233);
        // 样本模式
        if (message.includes('TEST')) {
            // OBD电压
            if (message.includes('0142')) {
                let x = this.n * 1000;
                let y = Math.floor(Math.random() * 12);
                let chartData = option1.series[0].data;
                chartData.push([x, y]);
                chart1.setOption(option1)
            }
            return;
        }

        // 正式模式
        // OBD电压
        if (message.includes('4142')) {
            const [, value] = message.split('4142');
            // TODO转换十六进制
            const x = this.n * 1000;
            const y = parseInt(value, 16);
            const chartData = option1.series[0].data;
            if (chartData.length > 20) {
                option1.series[0].data = chartData.splice(10)
            }
            chartData.push([x, y]);
            chart1.setOption(option1)
        }
    },

    // 点击事件：控制是否轮询
    onCtrlSend() {
        const { state } = this.data;
        if (state) clearInterval(this.engineTimer);
        if (!state) this.initTimerSend();
        this.setData({ state: !state });
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
