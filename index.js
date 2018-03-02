import bindData from './bind.js'
import Http from "./http.js"

//拦截context.setData，同步代理数据
function hook(context) {
  var realFun = context.setData;
  function hookFun(ob, x, y, z) {
    if (x || y || z) {
      return realFun.call(context, ob, x, y);
    } else {
      context.$data = ob;
    }
  }
  //防止多次hook
  if (origin.toString() !== hookFun.toString()) {
    context.setData = hookFun
  }
}

export default function (ob) {
  var onload = ob.onLoad;
  ob.onLoad = function () {
    this.$http = new Http;
    this.$creatHttpClient = function () {
      return new Http;
    }
    hook(this)
    bindData(this)
    if (onload) {
      onload.call(this)
    }
  }
  Page(ob);
}
