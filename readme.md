# Grace

> 微信小程序开发者必备神器



## 使用

1. 下载：https://github.com/wendux/grace
2. 创建页面时用Grace 替换 `Page` 即可。

```javascript
import createPage from "grace"
createPage({
  data:{
    userInfo:{},
    canIUse:true
  }
  onLoad: function () {
   //直接通过$data赋值更新数据
   this.$data.canIUse=false
   //通过$http发起网络请求
   this.$http.post("http://www.dtworkroom.com/doris/1/2.0.0/test",{xx:7}).then((d)=>{
      	console.log(d)
	}).catch(err=>{
  		console.log(err.status,err.message)
	})
  }
  ...         
})
```



## 数据响应式

微信小程序中数据发生变化后都要通过setData显式更新如：

```javascript
//更新单个字段
this.setData({
    userInfo: res.userInfo
 })
//更新多个字段
this.setData({
    userInfo: res.userInfo
    canIUse: false
})
```



这很明显是受了React的影响，好的不学🤦‍，如果你用过Vue, 你应该会觉得这看起来很不优雅，尤其是代码中零零散散要更新的值多的时候，代码看起来会很冗余，还有，有时为了改变一个变量，也得调一次`setData`.

现在，有了Grace， 它会让你的代码变的优雅，你可以像使用Vue一样更新数据：

```javascript
this.$data.userInfo=res.userInfo;
//更新多个字段，并非重新赋值
this.$data={
    userInfo: res.userInfo
    canIUse: false
}
```

现在，你可以直接通过赋值就能更新界面了。当然，您依旧



## Http

Grace通过Promise封装了wx.request， 并支持拦截器、请求配置等：

1. Restful API

   ```javascript
   fly.get(url, [data], [options])
   fly.post(url, data, [options])
   fly.put(url, data, [options])
   fly.delete(url,[data],[options])
   fly.patch(url,[data],[options])
   ```

2. 多个并发请求

   ```javascript
   var getUserRecords=()=>{
     return this.$http.get('/user/133/records');
   }

   var getUserProjects=()=>{
     return this.$http.get('/user/133/projects');
   }

   fly.all([getUserRecords(), getUserProjects()])
     .then(this.$http.spread(function (records, projects) {
       // Both requests are now complete
     }))
     .catch(function(error){
       console.log(error)
     })
   ```

3. 拦截器

   ```javascript
   // Add a request interceptor
   this.$http.interceptors.request.use((config,promise)=>{
       // Do something before request is sent
       config.headers["X-Tag"]="grace";
       // Complete the request with custom data
       // promise.resolve("fake data")
       return config;
   })

   // Add a response interceptor
   this.$http.interceptors.response.use(
       (response,promise) => {
           // Do something with response data .
           // Just return the data field of response
           return response.data
       },
       (err,promise) => {
         // Do something with response error
           //promise.resolve("ssss")
       }
   )
   ```

Grace使用的http请求库是 [FLY](https://github.com/wendux/fly) , `$http`是 [FLY](https://github.com/wendux/fly)的一个实例，详情可以参照其官网，如果您想创建新的  [FLY](https://github.com/wendux/fly) 示例：

```javascript
var newHttp=this.$creatHttpClient();
```

