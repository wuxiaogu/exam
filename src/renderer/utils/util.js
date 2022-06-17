exports.dateFilter = value => {
  if (value) {
    const d = new Date(parseInt(value));
    const date = {
      Y: d.getFullYear(),
      M: d.getMonth() > 8 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1),
      D: d.getDate() > 9 ? d.getDate() : '0' + d.getDate(),
      h: d.getHours() > 9 ? d.getHours() : '0' + d.getHours(),
      m: d.getMinutes() > 9 ? d.getMinutes() : '0' + d.getMinutes(),
      s: d.getSeconds() > 9 ? d.getSeconds() : '0' + d.getSeconds(),
    };
    const t = date.Y + '-' + date.M + '-' + date.D + ' ' + date.h + ':' + date.m + ':' + date.s;
    return t;
  }
  return '';
};

exports.getRegexp = type => {
  switch (type) {
    case 'money':
      return /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
    default:
      return null;
  }
};

exports.getDatePickerOpt = () => {
  return {
    disabledDate: date => {
      return date.valueOf() > Date.now();
    },
  };
};


exports.randomString = (len) => {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}


exports.strReplace = (string,f,e) => {//吧f替换成e
    var reg=new RegExp(f, "g"); //创建正则RegExp对象   
    return string.replace(reg, e); 
}

exports.compare = (property) => {
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}


exports.in_array = (search,array) => {
    for(var i in array){
        if(array[i]==search){
            return true;
        }
    }
    return false;
}

/**
 * 将list装换成tree
 * @param {Object} myId  数据主键id
 * @param {Object} pId     数据关联的父级id
 * @param {Object} list list集合
 */
exports.listToTree = (myId,pId,list) => {
  
    function exists(list, parentId){
        for(var i=0; i<list.length; i++){
            if (list[i][myId] == parentId) return true;
        }
        return false;
    }
    
    var nodes = [];
    // get the top level nodes
    for(var i=0; i<list.length; i++){
        var row = list[i];
        if (!exists(list, row[pId])){
            nodes.push(row);
        }
    }
    
    var toDo = [];
    for(var i=0; i<nodes.length; i++){
        toDo.push(nodes[i]);
    }
    while(toDo.length){
        var node = toDo.shift();    // the parent node
        // get the children nodes
        for(var i=0; i<list.length; i++){
            var row = list[i];
            if (row[pId] == node[myId]){
                //var child = {id:row.id,text:row.name};
                if (node.children){
                    node.children.push(row);
                } else {
                    node.children = [row];
                }
                toDo.push(row);
            }
        }
    }
    return nodes;
}