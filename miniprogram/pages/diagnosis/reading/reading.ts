
const list = [
    {
        title: "0) 纯 OBDII",
        color: "green",
        content: "在此模式下仅使用标准SAE J1939指令它非常快，但有些汽车在这种模式下不显示/清除所有DTC"
    },
    {
        title: "1) 所有命令集/默认地址",
        color: "green",
        content: "此模式使用所有读取/清除命令集并使用默认功能寻址此模式是默认模式如果您不知道该选择什么- 选择此模式!"
    },
    {
        title: "2) 所有命令集/默认地址 + 扩展诊断命令",
        color: "orange",
        content: "在这种模式下，Car Scanner 在读取/清除命令之前发送“开始扩展诊断”命令发送到 ECU。此模式使用所有读取/清除命令集并启用默认功能寻址。VAG (大众、奥迪、保时捷、斯柯达、西雅特等)、雷诺/日产/达契亚、现代/起亚 2015+、道奇不建议使用此模式!"
    },
    {
        title: "3) 所有命令集 +常用非标准地址",
        color: "green",
        content: "此模式使用所有读取/清除命令集，并启用默认功能寻址和些常见的非标准地址从不同的 ECU 获取更多 DTC。VAG (大众、奥迪、保时捷、斯柯达、西雅特等)、雷诺/日产/达契亚、现代/起亚 2015+、道奇不建议使用此模式!"
    },
    {
        title: "4) 所有命令集 +常用非标准地址+扩展诊断命令",
        color: "orange",
        content: "此模式使用所有读取/清除命令集、启用默认功能寻址和一些常见的非标准地址从不同的 ECU 获取更多DTC，但在发送读取/清除命令之前发送“开始扩展诊断”命令。VAG (大众、奥迪、保时捷、斯柯达、西雅特等)、雷诺/日产/达契亚、现代/起亚 2015+、道奇不建议使用此模式!"
    },
]
const zidongTip = "请确认您为您的汽车选择了正确的连接配置文件。\n使用错误的连接配置文件读取或清除DTC代码可能会产生不可预知的结果。\n您应对在读取或清除DTC代码期间可能发生在您的汽车上的所有负面后果负责。"
const tip1 = "隐藏状态不明的诊断故障代码，与未完成的测试有关(此代码并不表示您的汽车存在故障)"
const tip2 = "隐藏标记为“存档”的故障诊断代码(未激活)"

Page({
    data: {
        list, zidongTip, tip1, tip2,
        tip1State: false,
        tip2State: false,
        radio: 'zidong',
        active: 1,
        tipFlag: true,
    },
    onLoad(opt) {
        this.setData({ tipFlag: opt.index == 'reading' ? true : false })
    },
    onRadio({ detail }) {
        this.setData({ radio: detail })
    },
    onSlider({ detail: { value } }) {
        this.setData({ active: value })
    },
    onSwitch1({ detail }) {
        this.setData({ tip1State: detail })
    },
    onSwitch2({ detail }) {
        this.setData({ tip2State: detail })
    },
    naviTo() {
        const { radio, tip1State, tip2State, active } = this.data;
        wx.navigateTo({ url: `../readData/readData?radio=${radio}&tip1State=${tip1State}&tip2State=${tip2State}&active=${active}` })
    },
    onShareAppMessage() {

    }
})