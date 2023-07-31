

// https://vant-contrib.gitee.io/vant-weapp/#/tabbar
// 参考官方文档，可自行扩展徽标
Component({
    data: {
        active: 0,
        list: [
            {
                icon: 'home-o',
                text: '首页',
                url: '/pages/index/index'
            },
            {
                icon: 'user-o',
                text: '我的',
                url: '/pages/login/login'
            }
        ]
    },
    methods: {
        onChange(event) {
            // event.detail 的值为当前选中项的索引
            wx.switchTab({
                url: this.data.list[event.detail].url
            })
        },
        init() {
            const page = getCurrentPages().pop();
            this.setData({
                active: this.data.list.findIndex(item => item.url === `/${page.route}`)
            });
        }
    }
});