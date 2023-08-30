

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


/**
 * 通过位置截断字符串并返回数组
 * @param str 字符串
 * @param pos 位置
 */
export function splitByPos(str, pos) {
	// 使用substring方法截断字符串
	var part1 = str.substring(0, pos);
	var part2 = str.substring(pos);

	// 创建一个数组，将截断后的部分存储在数组中
	return [part1, part2];
}