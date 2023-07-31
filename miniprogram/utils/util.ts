

export const formatTime = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return (
        [year, month, day].map(formatNumber).join('/') +
        ' ' +
        [hour, minute, second].map(formatNumber).join(':')
    )
}

const formatNumber = (n: number) => {
    const s = n.toString()
    return s[1] ? s : '0' + s
}


/**
 * 格式化时间戳
 * @param dateTimeStamp 是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
 * @param format 可选：'Y年M月D日'
 */
export function timeago(dateTimeStamp, format) {	//这里融合了上面的自定义时间格式，“format”就是干这个用的
    var minute = 1000 * 60;      //把分，时，天，周，半个月，一个月用毫秒表示
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var month = day * 30;

    var now = new Date().getTime();   //获取当前时间毫秒
    var diffValue = now - dateTimeStamp;//时间差

    if (diffValue < 0) { return; }

    var minC = diffValue / minute;  //计算时间差的分，时，天，周，月
    var hourC = diffValue / hour;
    var dayC = diffValue / day;
    var weekC = diffValue / week;
    var monthC = diffValue / month;
    var result = '';

    if (monthC >= 1) {
        result = "" + parseInt(monthC) + "月前";
    } else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前";
    } else if (dayC >= 1 && dayC < 7) {
        result = "" + parseInt(dayC) + "天前";
    } else if (hourC >= 1 && hourC <= 24) {
        result = "" + parseInt(hourC) + "小时前";
    } else if (minC >= 1 && minC <= 60) {
        result = "" + parseInt(minC) + "分钟前";
    } else if (minC < 1) {
        result = "刚刚";
    } else {
        result = formatTime2(new Date(dateTimeStamp) / 1000, format)		//否则输出“format”(自定义格式)的时间
    }
    return result;
}

function formatTime2(number, format) {
    var formateArr = ['Y', 'M', 'D'];
    var returnArr = [];
    var date = new Date(number * 1000);
    returnArr.push(date.getFullYear());
    returnArr.push(formatNumber(date.getMonth() + 1));
    returnArr.push(formatNumber(date.getDate()));

    for (var i in returnArr) {
        try {
            format = format.replace(formateArr[i], returnArr[i]);
        } catch (e) {
            console.log(e, "我也不知道这个replace为什么报错")
        }
    }
    return format;
}

/**
 * 防抖
 * @param func 要执行的函数
 * @param delay 延迟时间
 */
export function debounce(func, delay) {
    var timer = null;
    return function () {
        // @ts-ignore
        var that = this;
        var args = arguments
        //每次触发事件 都把定时器清掉重新计时
        clearTimeout(timer)
        timer = setTimeout(function () {
            //执行事件处理程序
            func.call(that, args)
        }, delay)
    }
}