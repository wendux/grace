if (!global._graceBus) {
  global._graceBus = {}
}
export default {
  $emit(eventName, ...arg) {
    var cbs = global._graceBus[eventName];
    for (var cb of cbs) {
      cb.apply(null, arg);
    }
  },
  $on(eventName, cb) {
    global._graceBus[eventName] = global._graceBus[eventName] || [];
    global._graceBus[eventName].push(cb);
  },
  $off(eventName, cb){
    var cbs = global._graceBus[eventName] || [];
    if (cb) {
      for (var index = 0; index < cbs.length; ++index) {
        if (cb == o) {
          cbs.splice(index, 1);
          break
        }
      }
    } else {
      global._graceBus[eventName] = [];
    }
  }
}