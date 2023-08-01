import * as echarts from "../../components/ec-canvas/echarts.js"
const app = getApp();
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
            data: [[0, 1], [1, 2]]
        }]
    };

    chart1.setOption(option1);
    return chart1;
}

Page({
    onShareAppMessage: function (res) {
        return {
            title: 'ECharts 可以在微信小程序中使用啦！',
            path: '/pages/index/index',
            success: function () { },
            fail: function () { }
        }
    },
    engineTimer: null,
    data: {
        ec: {
            onInit: initChart
        }
    },
    n: 0,
    onShow() {
        this.engineTimer = setInterval(() => {
            // 发动机转速
            app.obd.sendOBD('0142');
            this.n++;
        }, 1000)
    },

    TCPcallback(message) {
        console.log(message, 233);
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
    onHide() {
        clearInterval(this.engineTimer)
    },
    onUnload() {
        clearInterval(this.engineTimer)
    },
});
