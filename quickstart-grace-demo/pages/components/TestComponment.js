// pages/componments/TestComponment.js
import grace from "../../utils/grace.js"
grace.component({
  properties: {
  },
  data: {
     text:"我是自定义组件",
     times:1
  },
  methods: {
    onTap(){
      //赋值更新
      this.$data.text="自定义组件点击 +"+this.$data.times++
    }
  }
})
