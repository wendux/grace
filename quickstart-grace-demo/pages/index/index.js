//获取应用实例
const app = getApp()
import grace from "../../utils/grace.js"
global.fly=grace.http
grace.page({
  data:{
    userInfo: {},
    data:{},
    btnType:"primary",
    btnText:"请求网络接口",
    hasUserInfo: false,
    arr:[5,2],
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  onTap: function () {
    if (this.$data.btnText=="请求网络接口"){
      //测试网络接口
      this.$http.post("test", { xx: 7 }).then((d) => {
        //更新一个字段
         this.$data.btnType="default"
         console.log(d)
        //更新多个字段
        this.$data={
          data:d.data,
          btnText: "打开启动日志"
        }
      }).catch(err => {
        console.log(err)
      })
    }else{
      wx.navigateTo({
       url: '../logs/logs'
      })
    }
  },
  $onBackData(data){
    //打印页面返回的数据
    console.log("backData",data);
  },
  onLoad:function () {

    //测试事件总线-监听 pass-data-test 事件
    this.$bus.$on("pass-data-test",(x,y,z)=>{
      console.log("on pass-data-test:",x,y,z);
    })
    if (app.globalData.userInfo) {
      this.$data={
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      }
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.$data={
          userInfo: res.userInfo,
          hasUserInfo: true
        }
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.$data={
            userInfo: res.userInfo,
            hasUserInfo: true
          }
        }
      })
    }
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.$data={
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    }
  }
})
