import * as echarts from '../../components/ec-canvas/echarts';

const app = getApp();
var option, chart

function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  option = {
    backgroundColor: "#ffffff",
    series: [{
      name: '业务指标',
      type: 'gauge',
      detail: {
        formatter: '{value}%'
      },
      axisLine: {
        show: true
      },
      data: [{
        value: 40,
        name: '完成率',
      }]

    }]
  };

  chart.setOption(option, true);

  return chart;
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
  data: {
    ec: {
      onInit: initChart
    }
  },


  onReady() {
    this.setData({
      ec: {
        onInit: initChart
      }
    })
    console.log(1)
  }
});
