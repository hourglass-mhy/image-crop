var fs = require('fs')
var gm = require('gm')

// you have two options:
// use the '!' flag to ignore aspect ratio
// gm('./public/images/big2.jpg')
// .resize(240, 240,'!')
// .write('./public/images/small2.jpg', function (err) {
//   if (!err) console.log('done');
// });

// creating an image
// gm(200, 400, "#ddff99f3")
// .drawText(10, 50, "from scratch")
// .write("./public/images/create.jpg", function (err) {
//   // ...
// });
// 

// 图片旋转
// gm('./public/images/small2.jpg')
// .rotate('green',180)
// .write('./public/images/small3.jpg',function(err) {
// 	if (!err) {
// 		console.log('rotate')
// 	}
// })

gm('./public/images/big1.jpg')
.crop(182, 275, 127, 127)
.write('./public/images/crop3.jpg', function (err) {
  if (!err) console.log('crazytown has arrived');
})