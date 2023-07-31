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
            // data: [0.5,1,1.5],
            // show: false
        },
        yAxis: {
            x: 'center',
            type: 'value',
            
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
            data: [
                [1,2],
                [2,3]
            ]
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

    onShow() {
        this.engineTimer = setInterval(() => {
            // 发动机转速
            app.obd.sendOBD('0142');
        }, 1000)
    },

    TCPcallback(message) {
        console.log(message, 233);
        // OBD电压
        if (message.indexOf('4142')) {
            const [, value] = message.split('4142');
            // TODO转换十六进制
            // value
            option1.series[0].data.push(value)
            chart1.setOption(option1)
        }
    },
});
