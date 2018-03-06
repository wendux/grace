# Grace

> 微信小程序开发必备神器，让你的小程序达到Vue一样的开发体验

## 特点

1. 支持和Vue一样优雅的数据响应式
2. 支持数据自动更新、更改缓存、批量更新
3. 强大的网络功能
4. 支持全局事件总线
5. 支持跨页面传值



## 使用

1. 下载：https://github.com/wendux/grace 到本地 grace目录
2. 创建页面时用Grace 替换 `Page` 即可。

```javascript
import createPage from "grace/index.js"
createPage({
  data:{
    userInfo:{},
    canIUse:true
  }
  onLoad(){
   //直接通过$data赋值更新数据
   this.$data.canIUse=false
   //通过$http发起网络请求
   this.$http.post("http://www.dtworkroom.com/doris/1/2.0.0/test",{xx:7}).then((d)=>{
      	console.log(d)
	}).catch(err=>{
  		console.log(err.status,err.message)
	})
    //全局事件总线-监听事件
	this.$bus.$on("enventName",(data)=>{
  	  console.log(data)
	})
    //返回上一页，并传递数据
    this.$goBack({retValue:"8"})
   }, 
   //跨页面传值  
   $onBackData(data){
     //接收页面返回的数据，
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

现在，你可以直接通过赋值就能更新界面了。当然，您依旧可以使用`this.setData`来更新数据，grace会自动同步 `this.$data`.



### 数组更新检测

grace的数据响应式原理和Vue是一样的，（如果你熟悉Vue，可以跳过）对于数组：

#### 变异方法

grace包含一组观察数组的变异方法，所以它们也将会触发视图更新。这些方法如下：

- `push()`
- `pop()`
- `shift()`
- `unshift()`
- `splice()`
- `sort()`
- `reverse()`

#### 替换数组

变异方法 (mutation method)，顾名思义，会改变被这些方法调用的原始数组。相比之下，也有非变异 (non-mutating method) 方法，例如：`filter()`, `concat()` 和 `slice()` 。这些不会改变原始数组，但**总是返回一个新数组**。当使用非变异方法时，可以用新数组替换旧数组：

```javascript
this.$data.items = this.$data.items.filter(function (item) {
  return item.message.match(/Foo/)
})
```

#### 注意事项

由于 JavaScript 的限制，grace不能检测以下变动的数组：

1. 当你利用索引直接设置一个项时，例如：`this.$data.items[indexOfItem] = newValue`
2. 当你修改数组的长度时，例如：`this.$data.items.length = newLength`

为了解决第一类问题，以下两种方式都可以实现和 `this.$data.items[indexOfItem] = newValue` 相同的效果，同时也将触发状态更新：

```javascript

this.$data.$set(example1.items, indexOfItem, newValue)

```

```javascript
// Array.prototype.splice
this.$data.items.splice(indexOfItem, 1, newValue)
```

为了解决第二类问题，你可以使用 `splice`：

```javascript
this.$data.items.splice(newLength)
```



### 对象属性的添加

还是由于 JavaScript 的限制，**grace 不能检测对象属性的添加或删除**：

```javascript
createPage({
  data: {
    a: 1
  }
  onLoad(){
   //a现在是响应式的
   this.$data.a=2;
   //b不是响应式的
   this.$data.b = 2
  }
})


```

对于已经创建的实例，grace 不能动态添加根级别的响应式属性。但是，可以使用 `$data.$set(object, key, value)` 方法向嵌套对象添加响应式属性。例如：

```javascript
this.$data.$set($data, 'b', 2)
```



### 数据变更缓存

根据微信[小程序官方优化建议](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/performance/tips.html)，grace可以避免如下问题：

1. **频繁的去 setData**

   为了解决这个问题，grace引入了数据变更缓存机制，下面看一个例子：

   ```javascript
   //开始缓存数据变更
   this.$data.$cache();

   //接下来是n次密集的数据更新
   this.$data.name="doris"
   this.$data.userCard.no="610xxx889"
   this.$data.balance=66666
   ....
   //统一提交变更
   this.$data.$commit();
   ```

   在调用`$cache()`之后，所有数据的变化将会缓存起来（不会触发`setData`）, 知道调用 `$commit`后，才会统一刷新，这样即避免了频繁调用`setData`带来的性能消耗。

2. **后台态页面进行 setData**

   当页面进入后台态（用户不可见），不应该继续去进行`setData`，后台态页面的渲染用户是无法感受的，另外后台态页面去`setData`也会抢占前台页面的执行。当页面进入后台时，grace会自动停止数据更新，当页面再次转到前台时会自动开启渲染。

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



## 事件总线

全局事件总线可以在全局（跨页面）触发、监听事件。

**$on(eventName,handler)**

监听事件

```javascript
this.$bus.$on("enventName",(arg1,arg2)=>{
      //事件处理器参数为$emit触发事件时传递的参数
  	  console.log(arg1)
})
```

**$emit(eventName,[…arguments])**

触发事件

```javascript
this.$bus.$emit("enventName", 1,2) 
```

**$off(eventName,[handler])**

取消监听

```javascript
this.$bus.$off("eventName",cb)
```

当提供hanlder时，只将该hanlder移出监听者队列，如果没有传handler,则清空该事件的监听者队列。



## 跨页面传值

在小程序中打开新页面时可以通过url的query向新页面传值，这很容易，如：

```javascript
wx.navigateTo({
  //传递id,在新页面onLoad中获取
  url: 'test?id=1'
})
```

但是，新页面关闭时如何向前一个页面返回数据？  小程序中没有提供直接的方法，grace给所有页面添加了一个回调，用于接收页面回传的数据，如下：

```javascript

createPage({
  data:{}
  $onBackData(data){
   //接收页面返回的数据，
  }  
  ...         
})
```

上面的页面我们记为A, 假设你打开了一个新页面B, 你需要在B中选择一些信息后回传给A，那么你在B中应该：

```javascript
createPage({
  data: {},
  bindViewTap(){
    //返回上一个页面，并回传一些数据
    this.$goBack({xxx:5});
  }
  ...
}
```



**$goBack([data],[delta])**

关闭当前页面，返回上一页面或多级页面，如果存在`data`, 则会调用返回到的页面的`$onBackData`回调，若`data`不存在，则不会回调`$onBackData`.

`delta`  意义同 `wx.navigateBack`参数的delta, 表示回退的页面数，默认为1（上一页），如果如果 delta 大于现有页面数，则返回到首页。