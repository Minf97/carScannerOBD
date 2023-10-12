export const pidList = [
    {
        name: "发动机负载",
        value: "12",
        danwei: "%",
        command: "0104",
        handle: (value) => {
            return value / 2.55
        }
    },
    {
        name: "发动机冷媒温度",
        value: "60",
        danwei: "°C",
        command: "0105",
        handle: (value) => {
            return (value / 1.28) - 100
        }
    },
    {
        name: "燃油压力",
        value: "300",
        danwei: "kPa",
        command: "010A",
        handle: (value) => {
            return 3 * value;
        }
    },
    {
        name: "进气歧管绝对压力",
        value: "109.59",
        danwei: "kPa",
        command: "010B",
        handle: (value) => {
            return value;
        }
    },
    {
        name: "发动机速度",
        value: "3000",
        danwei: "rpm",
        command: "010C",
        handle: (value) => {
            return value / 4;
        }
    },
    {
        name: "车辆速度",
        value: "60",
        danwei: "km/h",
        command: "010D",
        handle: (value) => {
            return value;
        }
    },
    {
        name: "进气温度",
        value: "1.7",
        danwei: "°C",
        command: "010F",
        handle: (value) => {
            return value - 40;
        }
    },
    {
        name: "空气流率",
        value: "235",
        danwei: "grams/sec",
        command: "0110",
        handle: (value) => {
            return value / 100;
        }
    },
    {
        name: "油门位置",
        value: "12",
        danwei: "%",
        command: "0111",
        handle: (value) => {
            return value / 2.55
        }
    },
    {
        name: "发动机启动后的运行时间",
        value: "603",
        danwei: "s",
        command: "011F",
        handle: (value) => {
            return value
        }
    },
    {
        name: "故障指示灯（MIL）亮时行驶的距离",
        value: "1",
        danwei: "km",
        command: "0121",
        handle: (value) => {
            return value
        }
    },
    {
        name: "高压共轨压力（相对进气歧管真空） ",
        value: "1.7",
        danwei: "kPa",
        command: "0122"
    },
    // {
    //     name: "蒸发系统蒸气压力 ",
    //     value: "1.7",
    //     danwei: "Pa"
    // },
];