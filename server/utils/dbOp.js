
module.exports = {
   save:  (obj)=>{ // mongodb 数据库存储
     obj.save((err, res)=>{
          if (err) {
                console.log("保存失败：" + err);
            }
            else {
                console.log("保存成功：" + res);
            }
     })
   }
}