export default function (context) {
  var cache = false;
  function proxy(ob) {
    //使用ES6 Proxy，Proxy可以捕获创建新属性的行为
    return new Proxy(ob, {
      get: function (target, key) {
        return target[key];
      },
      set: function (target, key, value) {
        if (typeof value == "object") {
          target[key] = deepProxy(value)
        } else {
          target[key] = value;
        }
        //
        context.setData(context.$data, null, null, true)
        return true;
      }
    });
  }
  //递归代理所有子属性，注意代理顺序应该是从子到父逐层向上
  function deepProxy(data) {
    var root = {}
    for (var ob in data) {
      if (typeof data[ob] === "object") {
        root[ob] = deepProxy(data[ob])
      } else {
        root[ob] = data[ob];
      }
    }
    return proxy(root);
  }
  var root = deepProxy(context.data);
  //监听context.$data赋值操作
  Object.defineProperty(context, "$data", {
    set(v) {
      for (var key in v) {
        context.$data[key] = v[key];
      }
    },
    get() {
      return root;
    },
    enumerable: true,
    configurable: true
  })

  //开始缓存数据变化
  root.$cache = function () {
    cache = true;
  }
  //提交所有缓存的数据变化
  root.$commit = function () {
    cache = false;
    context.setData(root, null, null, true)
  }
}

