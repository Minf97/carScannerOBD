

// 测试服务器地址
const ADDRESS_TESTSEVER = 'http://test.doiting.com';
// 生产服务器地址
const ADDRESS_ONLINESEVER = 'https://api-cn.doiting.com';
// 当前环境下的服务器地址（测试或生产）
export const ADDRESS_NOWENV = getAddressByEnv(ADDRESS_TESTSEVER, ADDRESS_ONLINESEVER);
// webSocket地址
export const ADDRESS_WEBSOCKET = 'wss://wss-cn.doiting.com/ws';

function getAddressByEnv(testAddress, productAddress) {
    const isTest = wx.getStorageSync('isTest');
    return isTest ? testAddress : productAddress
}