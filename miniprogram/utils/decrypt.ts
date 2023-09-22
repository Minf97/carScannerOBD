
import * as util from "../utils/util"


export function decrypt03_07(message: string) {
	const result = [];
	// 多帧
	if (message.includes(":")) {
		const list = message.split(":");
		list.shift();
		let arr = [];
		console.log(list);
		
		list.map(code => {
			// 此时前4个是头，后8个是code
			// em: 4303 2029 0082
			if (code.length == 12 || code.length == 13) {
				let newItem = [code.slice(4, 8), code.slice(8, 12)]
				arr.push(...newItem);
				console.log(arr);
				
			}
			// 此时都是code，最后两位0没用
			// em: C021 8090 0000 00
			if (code.length == 14 || code.length == 15) {
				let newItem = [code.slice(0, 4), code.slice(4, 8), code.slice(8, 12)];
				arr.push(...newItem);
			}
		})
		// console.log(arr);
		
		arr.map(item => {
			if (item == "0000") return;
			result.push({
				code: turnCode(item),
			})
		})
	}
	

	// 不是多帧，即最多两个故障码，430x 0000 0000
	// 此时长度为定值：4 | 8 | 12
	else {
		let [header, code] = util.splitByPos(message, 4);
		// 没有故障
		if (code.length == 0) { }
		// 一个故障
		if (code.length == 4) {
			result.push({
				code: turnCode(code)
			})
		}
		// 两个故障
		if (code.length == 8) {
			let arr = util.splitByPos(code, 4);
			arr.map(item => {
				result.push({
					code: turnCode(item),
				})
			})
		}


		// return [
		// 	{
		// 		code: "P0082",
		// 		system: "引擎控制单元",
		// 		state: "暂时",
		// 		desc: "123123123"
		// 	}
		// ]
	}

	return result;


	function turnCode(str) {
		const key = String(str.slice(0, 1));
		const temp = str.slice(1, str.length)
		switch (key) {
			case "0": return "P0" + temp
			case "1": return "P1" + temp
			case "2": return "P2" + temp
			case "3": return "P3" + temp
			case "4": return "C0" + temp
			case "5": return "C1" + temp
			case "6": return "C2" + temp
			case "7": return "C3" + temp
			case "8": return "B0" + temp
			case "9": return "B1" + temp
			case "A": return "B2" + temp
			case "B": return "B3" + temp
			case "C": return "U0" + temp
			case "D": return "U1" + temp
			case "E": return "U2" + temp
			case "F": return "U3" + temp
		}
	}
}

export function decrypt0902(message: string) {
	let result = message;
	// 多帧
	if (message.includes(":")) {
		const arr = message.split(":");
		// 去除第一项 0140 014代表字节数
		arr.shift();
		console.log(arr);

		// 对前面两项做处理，冒号前面一个数字是帧数，要去除掉
		if (!arr[0] || !arr[1]) return result;
		// 也就是说 去除最后一个数字
		arr[0] = arr[0].slice(0, arr[0].length - 1);
		arr[1] = arr[1].slice(0, arr[1].length - 1);
		// 拼接
		const a = arr.join("");
		const vinTxt = a.slice(6, a.length);
		// 组出VIN码
		let VINList = util.splitStringByStep(vinTxt, 2)
		VINList = VINList.map(item => {
			const int16 = parseInt(item, 16);
			return String.fromCharCode(int16)
		});
		result = VINList.join("");
	}

	return result
}