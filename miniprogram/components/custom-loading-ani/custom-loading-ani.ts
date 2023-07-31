// components/custom-loading-ani/custom-loading-ani.ts
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        // 是否展示动效
        showAnimation: {
            type: Boolean,
            value: false
        }
    },

    methods: {
        showAnimation() {
            this.setData({
                showAnimation: true
            })
        },
        hideAnimation() {
            this.setData({
                showAnimation: false
            })
        }
    }
})
