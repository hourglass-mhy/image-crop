var express = require('express');
var app = express();
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var gm = require('gm')

app.set('view engine','ejs');
app.use(express.static('./public'));
app.use(express.static('./avatar'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//配置session中间件
app.use(session({
  secret: 'foo',
  resave: false,
  saveUninitialized: true
}));

// 获取文件上传
app.get('/',function (req,res,next) {
	res.render('index')
})

// 处理文件上传
app.post('/doUpload',function (req,res,next) {
	var form = new formidable.IncomingForm();
 	
 	form.uploadDir = "./avatar"; 
 	form.keepExtensions = false;

    form.parse(req, function(err, fields, files) {
      	if (err) {
	      	throw err;
	      	return
      	}
      	// 临时保存图片的路径
      	var filePath = '';
      	var sourceFileName = '';
      	if (files.bigAvatar) {
      		filePath = files.bigAvatar.path;
      		sourceFileName = files.bigAvatar.name;
      	}

      	var fileExtName = path.extname(files.bigAvatar.name); //获取文件后缀名

      	//文件上传的限制
        var maxSize = 1*1024*1024;
        if (files.bigAvatar.size > maxSize) { // 文件大小限制
        	// 删除文件
            fs.unlink(filePath,function (err) { 
                if (err) {
                    throw err
                    return;
                }
            })
            res.json({
                code: 400,
                message: '该图片大小超过1M，上传失败'
            })
        } else if ( ('.jpg.jpeg.png.gif').indexOf(fileExtName.toLowerCase()) === -1 ) { // 判断文件类型是否允许上传
            fs.unlink(filePath,function (err) {
                if (err) {
                    throw err
                    return;
                }
            })
            res.json({
                code: 500,
                message: '不支持该类型的文件'
            })
        }  else { // 上传成功

            //目标目录存在  临时文件更名 保存到目标文件目录对应的相册中
            var fileName = sourceFileName; //以当前时间戳对上传文件进行重命名
        	
            var targetPath =  './avatar/' + fileName; // 最终存放的完整路径
        	
        	fs.rename(filePath, targetPath,function (err) {
                if (err) {
                    throw err;
                    return
                }
                // 将更名后的文件路径保存在session中
                req.session.avatar = fileName;

	        	res.json({
	                code: 200,
	                message: '上传成功'
	            })
            })
        }
    });
})

// 获取图像剪裁页面
app.get('/crop',function(req,res,next) {
	res.render('crop',{
		avatar: req.session.avatar
	})
})

// 处理图片裁剪
app.post('/doCrop',function (req,res,next) {
	// sourceW，sourceH 大图的尺寸
	// 在前端设置了大图的宽和高，裁剪也是基于这个尺寸进行的
	// 后端进行真正的裁剪的时候需要基于这个尺寸进行缩放，之后才能进行裁剪，而不是在上传的图片上进行裁剪
	
	let {x,y,w,h,sourceW,sourceH} = req.body;
	gm('./avatar/' + req.session.avatar)
	.resize(sourceW,sourceH,'!')
	.crop(w,h,x,y)
	.resize(100,100,'!')
	.write('./avatar/' + req.session.avatar, function (err) {
	  	if (err) {
	  		res.json({
	  			code: 400,
	  			message: '头像裁剪失败'
	  		})
	  	} else {
	  		// 实际过程中需要将裁剪之后的图片入库
	  		res.json({
	  			code: 200,
	  			message: '头像裁剪成功'
	  		})
	  	}
	})

})

app.listen(3000);