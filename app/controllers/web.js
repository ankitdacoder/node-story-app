var path = require('path');

 exports.index= function(req, res, next) {
   return res.render(path.resolve('views/index'));
}

exports.about= function(req, res, next) {
   return res.render(path.resolve('views/about'));
}
exports.services= function(req, res, next) {
   return res.render(path.resolve('views/services'));
}
exports.portfolio= function(req, res, next) {
   return res.render(path.resolve('views/portfolio'));
}
exports.blog= function(req, res, next) {
   return res.render(path.resolve('views/blog'));
}
exports.contact= function(req, res, next) {
   return res.render(path.resolve('views/contact'));
}



exports.addportfolio=function(req, res, next) {


return res.render(path.resolve('views/admin/portfolio'));

}

exports.submit=function(req, res, next) {

console.log("OUT");

}