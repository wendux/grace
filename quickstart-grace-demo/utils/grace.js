import  grace from "../grace/index.js"
console.log(grace)
grace.http.config.baseURL = 'http://www.dtworkroom.com/doris/1/2.0.0/'
grace.http.config.timeout = 5000;
grace.http.interceptors.request.use((request) => {
  console.log("interceptors.request",request);
});
var page = grace.page;
grace.page = function (ob) {
  grace.mixin(ob, {
    onLoad() {
      //页面调用onShow时打印出当前页面id 
      console.log("onLoad, pageID:" + this.$id)
    },
    onShow() {
      //页面调用onShow时打印出当前页面id 
      console.log("onShow, pageID:" + this.$id)
    }
  })
  //创建页面
  page.call(grace, ob)
}
export default grace;