//logs.js
const util = require('../../utils/util.js')
import grace from "../../utils/grace.js"
grace.page({
  data: {
    logs: []
  },
  onBack(){
    //返回数据
    this.$goBack({ result: 5 });
  },
  onEmit(){
    //触发"pass-data-test"事件，请在控制台查看日志
    this.$bus.$emit("pass-data-test",1,2,3)
  },
  onLoad: function () {
    //grace 写法
    this.$data.logs = (wx.getStorageSync('logs') || []).map(log => {
      return util.formatTime(new Date(log))
    })
  }
})
