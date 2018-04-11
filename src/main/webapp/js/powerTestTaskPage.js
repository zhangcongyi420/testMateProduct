$(function(){
	$.get('powerCommon/userinfo',function(data){
		$('#lab_uid').text(data.uid)
	})
	getProductVersions();//左侧菜单
	getPowerTestTaskInfo();//查询测试任务执行信息
	getProductCount();//根据产品名称统计版本总数、用例总数、测试时长、通过率
	getProductVerPower();//查询一个产品下最新10个版本的功耗
	
	openSocket();
	var obj = {};
	obj.manufacturerInfo = "";
	obj.productName = "NEO-AL00";
	obj.caseCostTime = 2;
	obj.moduleName = "Camera";
	obj.caseCode = "BB_PWR_Module_Camera002";
	obj.preset3 = "";
	obj.taskStartDate = "2018-04-04 18:28:56";
	obj.excuteCase = 5;
	obj.caseStartDate = "2018-04-04 18:29:33";
	obj.caseEndDate = "2018-04-04 18:32:11";
	obj.taskCostTime = 2;
	obj.productSN = "KXL0118109000023";
	obj.caseName = "测试任务";
	obj.taskEndDate = "2018-04-04 18:32:11";
	obj.caseResult = "0.7880990920708334";
	obj.totalCase = 5;
	obj.preset1 = "";
	obj.taskId = "test233";
	obj.preset2 = "";
	obj.passCase = 1;
	obj.failCase = 0;
	obj.softwareVersion = "NEO-AL00 8.1.0.107(C786)"
//	$.ajax({
//		type:"post",
//		url:"powerDeviceTask/uploadPowerDeviceTask",
//		processData:false,
//        contentType:false,
//		data:JSON.stringify(obj),
//		
//		success:function(res){
//			
//		}
//	})
	
	$("#powerTask span").on("click",function(){
		if(!$(this).hasClass("btn_span_active")){
			$("#powerTask span").removeClass("btn_span_active");
			$(this).toggleClass("btn_span_active");
		}
		var taskType = $(this).attr("taskType");
		if(taskType == "1"){
			getProductVersions();//左侧菜单
			getPowerTestTaskInfo();//查询测试任务执行信息
			getProductCount();//根据产品名称统计版本总数、用例总数、测试时长、通过率
			getProductVerPower();//查询一个产品下最新10个版本的功耗
		}else if(taskType == "2"){
			getProductVersions();//左侧菜单
			getPowerTestTaskInfo();//查询测试任务执行信息
			getProductCount();//根据产品名称统计版本总数、用例总数、测试时长、通过率
			getScenePower();//查询一个产品下最新10个版本的功耗
		}else if(taskType == "3"){
			getDeviceProductVersions();
			getPowerDeviceTask();
			getDeviceProductCount();
		}
	});
});

//左侧菜单
function getProductVersions(pPCIPs){
	var taskType = $("#powerTask span.btn_span_active").attr("taskType") == "1" ? "Dynamic" : "applications";
	$.ajax({
		async : false,
		type : 'post',
		url : "powerTestTask/getProductVersions",
		data : {ips: pPCIPs,pAresPowerTpye:taskType},
		success : function(res){
			if(res){
				var productMap = {};
				$.each(res, function(i,n){
					if (!n.pProductName) return true
					var arr = productMap[n.pProductName];
					if(!arr){
						arr = productMap[n.pProductName] = [];
					}
					arr.push(n.pProductVersion);
				});
				var products = [];
				$.each(productMap,function(k,v){
					sortByVersion(v);
					products.push({name:k,versions:v});
				});
				products.sort(function(a,b){
					return a.name.localeCompare(b.name);
				});
				renderPageFunc("productVersions",products);
				initLeftMenu();//左侧导航
			}
		}
	});
}

//查询测试任务执行信息
function getPowerTestTaskInfo(){
	debugger;
	var taskType = $("#powerTask span.btn_span_active").attr("taskType") == "1" ? "Dynamic" : "applications";
	var pProductName = $(".aresui-left-menu.aresui-active dt a").text();
	var pProductVersion = $(".aresui-left-menu.aresui-active .aresui-current").text();
	$.ajax({
		type : 'post',
		url : "powerTestTask/getPowerTestTaskInfo",
//		processData:false,
//        contentType:false,
		data : {
			pProductName : pProductName,
			pProductVersion : pProductVersion,pAresPowerTpye:taskType
		},
		success : function(res){
			debugger;
			var unfinishedTask = [];
			var finishedTask = [];
			if(res){
				for (var i = 0; i < res.length; i++) {
					var obj = res[i];
					if(obj.pTotalApps === obj.pExcuteApps){
						finishedTask.push(obj);
					}else{
						var taskProgress = ((obj.pExcuteApps/obj.pTotalApps)*100).toFixed(0);
						obj.taskProgress = taskProgress;
						unfinishedTask.push(obj);
					}
					renderPageFunc("unfinishedTask",unfinishedTask);
					renderPageFunc("finishTask",finishedTask);
					process();//查看进度条
				}
			}
		}
	});
}

function renderPageFunc(id,data){
	var dom = $('#' + id + "_div");
	var fn = doT.template($('#' + id + "_tmpl").html());
	dom.empty()
	dom.append(fn(data));
}

//根据产品名称统计版本总数、用例总数、测试时长、通过率
function getProductCount(){
	var taskType = $("#powerTask span.btn_span_active").attr("taskType") == "1" ? "Dynamic" : "applications";
	var pProductName = $(".aresui-left-menu.aresui-active dt a").text();
	$.ajax({
		type : 'post',
		url : "powerTestTask/getProductCount",
		data : {pProductName : pProductName,pAresPowerTpye:taskType},
		success : function(res){
			if(res){
				$("#totalVersion").text(res.totalVersion);
				$("#totalApp").text(res.totalApp);
				$("#totalTime").text(res.totalTime);
				if(res.totalPassApp){
					var passRate = ((res.totalPassApp/res.totalApp)*100).toFixed(2);
					$("#totalPassRate").text(passRate + "%");
				}
			}
		}
	});
}

//查询一个产品下最新10个版本的功耗
function getProductVerPower(){
	var pProductName = $(".aresui-left-menu.aresui-active dt a").text();
	$.ajax({
		type : 'post',
		url : "powerTestTask/getProductVerPower",
		data : {pProductName : 'ALP-AL00'},
		success : function(res){
			var productVersions = [],avgPower = [];
			if(res){
				for (var i = 0; i < res.length; i++) {
					productVersions.push(res[i].projectProductVersion);
					avgPower.push(res[i].avgPower);
				}
				initChart(productVersions,avgPower);
			}
		}
	});
}

//查询一个产品下最新10个版本的功耗
function getScenePower(){
	var pProductName = $(".aresui-left-menu.aresui-active dt a").text();
	$.ajax({
		type : 'post',
		url : "powerTestTask/getScenePower",
		data : {productName : 'ALP-AL00'},
		success : function(res){
			var productVersions = [],avgPower = [];
			if(res){
				for (var i = 0; i < res.length; i++) {
					productVersions.push(res[i].productVersion);
					avgPower.push(res[i].avgPower);
				}
				initChart(productVersions,avgPower);
			}
		}
	});
}

/*=====================器件及组件START=======================*/
//左侧菜单
function getDeviceProductVersions(pPCIPs){
	$.ajax({
		async : false,
		type : 'post',
		url : "powerDeviceTask/getProductVersions",
		data : {ips: pPCIPs,pAresPowerTpye:"Dynamic"},
		success : function(res){
			if(res){
				var productMap = {};
				$.each(res, function(i,n){
					if (!n.productName) return true
					var arr = productMap[n.productName];
					if(!arr){
						arr = productMap[n.productName] = [];
					}
					arr.push(n.productVersion);
				});
				var products = [];
				$.each(productMap,function(k,v){
					sortByVersion(v);
					products.push({name:k,versions:v});
				});
				products.sort(function(a,b){
					return a.name.localeCompare(b.name);
				});
				renderPageFunc("productVersions",products);
				initLeftMenu();//左侧导航
			}
		}
	});
}
//查询测试任务执行信息
function getPowerDeviceTask(){
	var productName = $(".aresui-left-menu.aresui-active dt a").text();
	var productVersion = $(".aresui-left-menu.aresui-active .aresui-current").text();
	$.ajax({
		type : 'post',
		url : "powerDeviceTask/getPowerDeviceTask",
//		processData:false,
//        contentType:false,
		data : {
			productName : productName,
			productVersion : productVersion,pAresPowerTpye:"Dynamic"
		},
		success : function(res){
			var unfinishedTask = [];
			var finishedTask = [];
			if(res){
				for (var i = 0; i < res.length; i++) {
					var obj = res[i];
					if(obj.totalCase === obj.excuteCase){
						finishedTask.push(obj);
					}else{
						var taskProgress = ((obj.excuteCase/obj.totalCase)*100).toFixed(0);
						obj.taskProgress = taskProgress;
						unfinishedTask.push(obj);
					}
					renderPageFunc("unfinishedTask",unfinishedTask);
					renderPageFunc("finishTask",finishedTask);
					process();//查看进度条
				}
			}
		}
	});
}

//根据产品名称统计版本总数、用例总数、测试时长、通过率
function getDeviceProductCount(){
	var productName = $(".aresui-left-menu.aresui-active dt a").text();
	$.ajax({
		type : 'post',
		url : "powerDeviceTask/getProductCount",
		data : {productName : productName,pAresPowerTpye:"Dynamic"},
		success : function(res){
			if(res){
				$("#totalVersion").text(res.totalVersion);
				$("#totalApp").text(res.totalCase);
				$("#totalTime").text(res.totalTime);
				if(res.totalPassCase){
					var passRate = ((res.totalPassCase/res.totalCase)*100).toFixed(2);
					$("#totalPassRate").text(passRate + "%");
				}
			}
		}
	});
}
/*=====================器件及组件END=======================*/

function initChart(productVersions,avgPower){
	var myChart = echarts.init(document.getElementById('main')); 
	option = {
    tooltip : {
        trigger: 'axis',
        formatter: function(data){
        	return data[0].value.toFixed(2) + "mah"
        }
    },
    calculable : true,
    xAxis : [{
        type : 'category',
        boundaryGap : false,
        data : productVersions
    }],
    yAxis : [{
        type : 'value'
    }],
    series : [{
        name:'产品版本',
        type:'line',
        data:avgPower
    }]
};
	myChart.setOption(option); 
}

/*进度条*/
/**
*调用方法
* eg：<canvas id='process'  data-color='#ff771e' data-data='80'></canvas>
* 使用canvas标签 给定ID为process 
* 给定自定义属性color 为十六进制颜色
* 给定自定义属性data  为十进制的进度条的长度 不可以给%
*/
function process (){
	var canvas = document.getElementsByTagName('canvas')
	console.log(canvas)
	for(let i=0;i<canvas.length;i++){
		if(canvas[i].id=='process'){
			drawCanvas(canvas[i],canvas[i].dataset.color,canvas[i].dataset.data)
//			getRound(canvas[i],canvas[i].dataset.color,canvas[i].dataset.data)
		}
	}
}

function drawCanvas(c,color,data) {
   /**
	*param c  当前元素  
	*param color 当前要渲染的颜色 比如#888
	*param data 当前的进度 比如80%
	*/
    var ctx = c.getContext("2d");
    var mW = c.width = 130;
	var mH = c.height = 130;
	var lineWidth = 5;
	var fontSize = 16; //字号大小
	var r = mW / 2; //中间位置
	var cR = r - 4 * lineWidth; //圆半径
	var startAngle = -(1 / 2 * Math.PI); //开始角度
	var endAngle =(startAngle + 2 * Math.PI)*(data*0.01); //结束角度
	 //画圈
	  ctx.beginPath();
	  ctx.lineWidth = lineWidth;
	  ctx.strokeStyle = color;
	  ctx.arc(r, r, cR, startAngle, endAngle);
	  ctx.stroke();
	  ctx.closePath();
	   //写字
	  ctx.fillStyle = color;
	  ctx.font= fontSize + 'px Microsoft Yahei';
	  ctx.textAlign='center';
	  ctx.fillText(data+'%',r, r + fontSize / 2);
}

function getRound (c,color,data){
	/**
	*param c  当前元素  
	*param color 当前要渲染的颜色 比如#888
	*param data 当前的进度 比如80%
	*/
	var ctx = c.getContext('2d');
	var mW = c.width = 130;
	var mH = c.height = 130;
	var lineWidth = 5;
	var r = mW / 2; //中间位置
	var cR = r - 4 * lineWidth; //圆半径
	var startAngle = -(1 / 2 * Math.PI); //开始角度
	var endAngle =(startAngle + 2 * Math.PI)*(data*0.01); //结束角度
	var xAngle = 1 * (Math.PI / 180); //偏移角度量
	var fontSize = 16; //字号大小
	var tmpAngle = startAngle; //临时角度变量

	//渲染函数
	var rander = function(){
	  if(tmpAngle >= endAngle){
		return;
	  }else if(tmpAngle + xAngle > endAngle){
		tmpAngle = endAngle;
	  }else{
		tmpAngle += xAngle;
	  }
	  ctx.clearRect(0, 0, mW, mH);

	  //画圈
	  ctx.beginPath();
	  ctx.lineWidth = lineWidth;
	  ctx.strokeStyle = color;
	  ctx.arc(r, r, cR, startAngle, tmpAngle);
	  ctx.stroke();
	  ctx.closePath();

	  //写字
	  ctx.fillStyle = color;
	  ctx.font= fontSize + 'px Microsoft Yahei';
	  ctx.textAlign='center';
	  ctx.fillText(data+'%',r, r + fontSize / 2);

	  requestAnimationFrame(rander);
	};
	rander();
}

function openSocket() {
	var stompClient = null;
    if(stompClient==null){
        var socket = new SockJS('websocket');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function(frame) {
            stompClient.subscribe('/topic/pullTask', function(event) {
                var content = event.body;
                if(content == "success"){
                	$("#powerTask span.btn_span_active").click();
//                	getProductVersions();//左侧菜单
//                	getPowerTestTaskInfo();//查询测试任务执行信息
//                	getProductCount();//根据产品名称统计版本总数、用例总数、测试时长、通过率
//                	getProductVerPower();//查询一个产品下最新10个版本的功耗
//                	process();//查看进度条
                }
            });
        });
    }
}
function closeSocket() {
    if (stompClient != null) {
        stompClient.disconnect();
        stompClient=null;
    }
}