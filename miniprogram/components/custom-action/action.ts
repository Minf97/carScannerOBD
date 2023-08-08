// components/custom-action/action.ts
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        show: {
            type: Boolean,
            value: false
        },
        height: {
            type: String,
            value: '600'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        onClickHide() {
            this.triggerEvent('onClickHide')
        },
    }
})
