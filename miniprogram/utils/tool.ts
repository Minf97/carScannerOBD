let loadingState = false;

export function showLoading(title = '正在加载中...', mask = false) {
    wx.showLoading({
        title,
        mask
    })
    loadingState = true;
}

export function hideLoading() {
    loadingState && wx.hideLoading();
}