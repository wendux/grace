//功能：数据绑定，实现赋值更新
export default function (context) {
  var cache = false;
  //使用ES5 getter/setter，捕获数据变动，注意由于getter/setter不能捕获创建新属性的行为，
  //所有需要追踪的数据都应该在 Page.data中显式声明。ES6版本的实现则不受此限制，可以动态添加属性。
  function proxy(ob, attr, value) {
    Object.defineProperty(ob, attr, {
      set(v) {
        if (typeof v == "object") {
          //代理新对象
          proxy(ob, attr, deepProxy(v))
        } else {
          value = v;
        }
        if (!cache) {
          //触发数据更新
          context.setData(context.$data, null, null, true)
        }
      },
      get() {
        return value;
      },
      enumerable: true,
      configurable: true,
    })
  }
  //递归代理所有子属性，注意代理顺序应该是从子到父逐层向上
  function deepProxy(data) {
    var t = {}
    for (let attr in data) {
      let d = data[attr];
      if (typeof data[attr] === 'object') {
        d = deepProxy(data[attr]);
      }
      proxy(t, attr, d)
    }
    return t;
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



