import {type}  from "./util.js"
export default function(origin,ob){
  for(let key in ob){
    let v = origin[key];
    if(v){
      var t = type(v);
      if(t =="function"){
         origin[key]=function(){
           var arg = [].slice.call(arguments)
           ob[key].apply(this,arg)
           return v.apply(this,arg)
         }
      }else if(t == "object" && type(ob[key])==t){
       for(var k1 in ob[key]){
         if (!v.hasOwnProperty(k1)){
           v[k1]=ob[key][k1];
         }
       }
      }
    }else{
      origin[key] = ob[key]
    }
  }
}