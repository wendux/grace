import bindData from './bind.js'
import Http from "./http.js"
import mixin from "./mixin.js"
import $bus from "./event-bus.js"

//拦截context.setData，同步代理数据
function hook(context) {
    var realFun = context.setData;
    //y,z为预留参数
    function hookFun(ob, x, y, z) {
        if (x || y || z) {
            return realFun.call(context, ob, x, y);
        } else {
            context.$data = ob;
        }
    }
    //防止多次hook
    if (realFun.toString() !== hookFun.toString()) {
        Object.defineProperty(context, "setData", {
            get() {
                return hookFun;
            }
        })
    }
}
var $http=new Http
function component(ob) {
    mixin(ob,{
        ready(option){
            hook(this)
            bindData(this)
            this.$http = $http;
            this.$bus = $bus;
        }
    })
    Component(ob);
}

function page(ob) {
    var backEvent = "_back-data";
    mixin(ob, {
        onLoad(option) {
            global.id = global.id || 1
            this.$id = global.id++
            hook(this)
            bindData(this)
            this.$http = $http;
            this.$bus = $bus;
            $bus.$on(backEvent, (id, data) => {
                if (id == this.$id) {
                    if (this.$onBackData) {
                        this.$hide = false
                        this.$onBackData.call(this, data)
                    }
                }
            })
        },
        onHide() {
            //页面在后台时缓存数据变化
            var d = this.$data;
            d.$hide = true;
            d.$cache();
        },
        onShow() {
            //页面转到前台时，提交数据变化
            var d = this.$data;
            d.$hide = false
            d.$commit();
        },
        $goBack(data, delta) {
            delta = delta > 0 ? delta : 1;
            if (data !== undefined) {
                var stack = getCurrentPages();
                var len = stack.length - delta - 1;
                if (len < -1) len = 0;
                if (len >= 0) {
                    //当只有一个页面时,len==-1,不触发
                    $bus.$emit(backEvent, stack[len].$id, data)
                }
            }
            wx.navigateBack({
                delta: delta
            })
        }
    })
    Page(ob);
}

export default {
    page,
    component,
    mixin,
    bus:$bus,
    http:$http,
    createHttpClient() {
        return new Http;
    }
}
