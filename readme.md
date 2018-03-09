# Grace

> 一个精巧、易用的微信小程序开发辅助库

## 特点

1. 轻量、小巧、上手简单
2. 支持和Vue一样优雅的数据响应式
3. 支持数据自动更新、更改缓存、批量更新
4. 强大的网络功能
5. 支持全局事件总线
6. 支持跨页面传值
7. 支持mixins


## Demo

示例工程在 “quickstart-grace-demo”, 用微信小程序开发工具打开即可。


## 使用

1. 将 https://github.com/wendux/grace  工程中src目录中所有文件拷贝到小程序根目录下的grace目录
2. 创建页面时用`grace.page` 替换 `Page` 即可。

```javascript
import grace from "../../grace/index.js"
grace.page({
  data: {
    userInfo: {},
    canIUse: true
  },
  onLoad() {
    //直接通过$data赋值更新数据
    this.$data.canIUse = false
    //通过$http发起网络请求
    this.$http.post("http://www.dtworkroom.com/doris/1/2.0.0/test", {xx: 7}).then((d) => {
      console.log(d)
    }).catch(err => {
      console.log(err.status, err.message)
    })
    //全局事件总线-监听事件
    this.$bus.$on("enventName", (data) => {
      console.log(data)
    })
    //返回上一页，并传递数据
    this.$goBack({retValue: "8"})
  },
  //跨页面传值  
  $onBackData(data) {
    //接收页面返回的数据，
  }
  ...
})
```



如果是注册组件（component）的话, 只需用 `grace.component` 替换 `Component` 构造器即可：

```javascript
// grace.component 替换 Component
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
}
```

**注意：Grace 注入到实例中的所有方法和属性命名都以“$”开始。**



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
grace.page({
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
this.$data.$set(this.$data, 'b', 2)
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
   $http.get(url, [data], [options])
   $http.post(url, data, [options])
   $http.put(url, data, [options])
   $http.delete(url,[data],[options])
   $http.patch(url,[data],[options])
   ```

2. 多个并发请求

   ```javascript
   var getUserRecords=()=>{
     return this.$http.get('/user/133/records');
   }

   var getUserProjects=()=>{
     return this.$http.get('/user/133/projects');
   }

   this.$http.all([getUserRecords(), getUserProjects()])
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

Grace使用的http请求库是 [FLY](https://github.com/wendux/fly) , `$http`是 [FLY](https://github.com/wendux/fly)的一个实例，详情可以参照其官网，如果您想创建新的  [FLY](https://github.com/wendux/fly) 实例：

```javascript
var newHttp=grace.createHttpClient();
```

注意：grace创建页面时，所有页面的`$http`都是同一个[FLY](https://github.com/wendux/fly) 实例，所以对`this.$http`的配置，会在全局生效，所以如果你想要配置全局的拦截器、请求基地址、超时时间等可以创建一个帮助文件，然后页面引入这个文件即可：

```javascript
import grace from "../grace/index.js"
grace.http.config.baseURL = 'http://www.dtworkroom.com/doris/1/2.0.0/'
grace.http.config.timeout = 5000;
grace.http.interceptors.request.use((config, promise) => {
    //拦截器逻辑
    //console.log(config.body);
});
export default grace;
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

grace.page({
  data:{}
  $onBackData(data){
   //接收页面返回的数据，
  }  
  ...         
})
```

上面的页面我们记为A, 假设你打开了一个新页面B, 你需要在B中选择一些信息后回传给A，那么你在B中应该：

```javascript
grace.page({
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



## mixin

混入 (mixins) 是一种分发页面（Page）可复用功能的非常灵活的方式。简而言之，他可以在小程序创建页面时，混合页面选项，可以实现给所有页面添加一些钩子的功能，如果还不理解，不要紧，下面来看一个例子：

实现：在任何页面调用`onLoad`、`onShow` 时打印日志，并输出当前页面id.

1. 创建一个help.js文件

   ```javascript
   import grace from "../grace/index.js"
   var page=grace.page;
   grace.page=function(ob){
     mixin(ob,{
       onLoad(){
        //页面调用onShow时打印出当前页面id 
        console.log("onLoad, pageID:"+this.$id)
       },
       onShow(){
        //页面调用onShow时打印出当前页面id 
        console.log("onShow, pageID:"+this.$id)
     	}
     })
     //创建页面
     page.call(grace,ob)
   }
   export default grace;
   ```

2. 在创建Page时引入help.js

   ```javascript
   import grace from "../../utils/help.js"
   grace.page({
     data:{}
   })

   //控制台输出
   > onLoad, pageID:1
   > onShow, pageID:1
   ```

这样一来，相当于给所有的Page添加了`onLoad`、`onShow` 预处理。

可以看到，mixin通过混入页面创建参数给页面添加统一的预处理功能，相当于添加了页面钩子。

### 选项合并

当页面构建对象和混入对象含有同名选项时，这些选项将以恰当的方式混合。

1. 数据对象在内部会进行浅合并 (一层属性深度)，在和页面构建数对象发生冲突时以页面构建数对象数据优先。

2. 同名钩子函数将混合为一个数组，因此都将被调用。另外，混入对象的钩子将在页面自身钩子**之前**调用。

   ```javascript
    
   grace.mixin(ob,{
       onShow(){
        console.log("mixin onShow")
       }
    });

   ...

   grace.page({
      onShow(){
        console.log("page onShow")
      }
   })

   //页面显示时会输出： 
   > mixin onShow
   > page onShow
   ```

   ​

## 和wepy比较

请参考：https://juejin.im/post/5aa0e45af265da23a404635a