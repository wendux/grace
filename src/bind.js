import {type} from "./util.js"
//重写更易性方法
//功能：数据绑定，实现赋值更新
export default function (context) {
    var cache = false;
    var changed = false;
    var $data; //代理数据
    //使用ES5 getter/setter，捕获数据变动，注意由于getter/setter不能捕获创建新属性的行为，
    //所有需要追踪的数据都应该在 Page.data中显式声明。ES6版本的实现则不受此限制，可以动态添加属性。
    function proxy(ob, attr, value) {
        Object.defineProperty(ob, attr, {
            set(v) {
                value = proxyElement(v)
                if (!cache) {
                    //触发数据更新
                    context.setData($data, null, null, true)
                } else {
                    changed = true;
                }
            },
            get() {
                return value;
            },
            enumerable: true,
            configurable: true,
        })
    }

    //代理某个元素
    function proxyElement(e) {
        if (type(e) === 'object') {
            e = deepProxy(e)
        } else if (type(e) === 'array') {
            e = proxyArray(e);
        }
        return e
    }

    //递归代理数组
    function proxyArray(a) {
        var n = [];
        for (var index = 0; index < a.length; ++index) {
            let d = a[index];
            d = proxyElement(d);
            n[index] = d;
        }
        //重写更易性方法
        ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(function (e) {
            var origin = n[e]
            // Object.defineProperty(n, e, {
            //   value:function(){
            //     var r=origin.apply(n,[].slice.call(arguments))
            //     changed = true;
            //     if(!cache){
            //       $data.$commit();
            //     }
            //     return r;
            //   }
            // });
            n[e] = function () {
                var r = origin.apply(this, [].slice.call(arguments))
                changed = true;
                if (!cache) {
                    $data.$commit();
                }
                return r;
            }
        })
        return n;
    }

    //递归代理对象所有子属性，注意代理顺序应该是从子到父逐层向上
    function deepProxy(data) {
        var t = {}
        for (let attr in data) {
            let d = data[attr];
            d = proxyElement(d);
            proxy(t, attr, d)
        }
        return t;
    }

    $data = deepProxy(context.data);

    //监听context.$data赋值操作
    Object.defineProperty(context, "$data", {
        set(v) {
            $data.$cache()
            for (var key in v) {
                $data[key] = v[key];
            }
            changed=true;
            $data.$commit()
        },
        get() {
            return $data;
        },
        enumerable: true,
        configurable: true
    })

    $data.$set = function (target, key, value) {
        if (type(target) == "array") {
            value = proxyElement(value);
            target[key] = value;
        } else if (type(target) == "object") {
            proxy(target, key, value);
        }
        changed = true;
        if (!cache) {
            $data.$commit();
        }
    }

    //开始缓存数据变化
    $data.$cache = function () {
        cache = true;
    }
    //提交所有缓存的数据变化
    $data.$commit = function () {
        cache = false;
        if (changed && !$data.$hide) {
            changed = false;
            context.setData($data, null, null, true)
        }
    }
}



