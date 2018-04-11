
$(function(){
	//debugger
	$.ajax({
		type : 'post',
		url : "testSelect/showEquipMentName",
		data : {id:''},
		success : function(res){
			if(res){
				
				var equips = [];
				for(var i=0; i<res.length; i++){
					
					if(res[i].equipment_type != null){
						equips.push(res[i].equipment_type);
					}
				}
				
				//显示设备名称
				var strhtml3 = "";
				jQuery.each( equips, function( i, val ) {
					strhtml3 += "<li onclick='javascript:getSelectDataByName(\""+val+"\")'><span>" + val + "</span></li>"
				});
				$("#contentSelectEqu").append(strhtml3);
				
				//展示实验室归属地
				/*var strhtml2 = "";
				jQuery.each( current_labs, function( i, val ) {
					strhtml2 += "<li><span onclick='javascript:getAssetDataByName2(\""+val+"\")'>" + val + "</span></li>"
				});
				$("#contentLib").append(strhtml2);*/
				
			}
		}
	});
	
	initTable();

	$("#testActivityModal").on('hidden.bs.modal',function(){
		document.getElementById("addParamForm").reset();
		$("#testParamDiv").empty();

	});
});


function initTable(){
	$("#testSelectTable").bootstrapTable({
		method: "get",  //使用get请求到服务器获取数据
		//queryParams: queryParams,   
		url : 'testSelect/getMateSelectDataList',
        striped: true,  //表格显示条纹
        pagination: true, //启动分页
        pageSize: 10,  //每页显示的记录数
        pageNumber:1, //当前第几页
        pageList: [5, 10, 15, 20, 25],  //记录数可选列表
        smartDisplay:false,
        search: false,  //是否启用查询
       // showColumns: true,  //显示下拉框勾选要显示的列
        //showRefresh: true,  //显示刷新按钮
        sidePagination: "server", //表示服务端请求
        //设置为undefined可以获取pageNumber，pageSize，searchText，sortName，sortOrder
        //设置为limit可以获取limit, offset, search, sort, order
        queryParamsType : "", 
        
		columns :[{checkbox:true,visible:true},
					
					{field : 'id',title : '编号',align : 'center'},
					
					{field : 'bom',title : 'BOM码',align : 'center'},

					{field : 'material_desc',title : '物料描述',align : 'center'},
					
					{field : 'test_environment',title : '试用环境',align : 'center'},
					
					{field : 'equipment_type',title : '设备类型',align : 'center'},
					
					//{field : 'asset_code',title : '资产编码',align : 'center'},
					
					{field : 'register',title : '登记人',align : 'center'},					
					
					{field : 'remarks',title : '备注',align : 'center'}
					
					]
			
	})
}


function saveTestActivity(){
	var optState = $("#forObj").val();
	var action = '';
	if(optState == '1'){
		action = 'addTestActivity';
	}else if(optState =='-1'){
		action = 'updateTestActivity';
	}
	var formData = new FormData(document.getElementById("addParamForm"));
	var paramList = [];
	$("#testParamDiv form").each(function(i,form){
		var paramObj = {};
		var data = new FormData(form);
		paramObj.paramName = data.get("paramName");
		paramObj.paramKey = data.get("paramKey");
		paramObj.paramValue = data.get("paramValue");
		paramList.push(paramObj);
	});
	formData.append("paramJson",JSON.stringify(paramList));
	$.ajax({
		type : 'post',
		url : "testActivity/" + action,
		processData:false,
        contentType:false,
		data : formData,
		success : function(res){
			if(res == 0){
				$('#testActivityModal').modal('hide');
				toastr.success("操作成功！");
				$("#testActivityTable").bootstrapTable('refresh',{
					silent: true,
					url : 'testActivity/getTestActivityList'
				});
			}else if(res == 1){
				toastr.error("该用例已经存在，请重新添加");
			}else{
				toastr.error("error！");
			}
		}
	});
}

function addTestActivityPage(){
	$("#forObj").val('1');
	$('#testActivityModal').modal('show');
}

function updateTestActivity(id){
	$("#forObj").val('-1');
	$.ajax({
		type : 'post',
		url : "testActivity/getParamConfigById",
//		processData:false,
//        contentType:false,
		data : {id:id},
		success : function(res){
			$('#testActivityModal').modal('show');
			if(res){
				$.each(res,function(name,val){
					$('#addParamForm').find("input[name='"+name+"']").val(val);
				});
				$.each(res.paramList,function(index,obj){
					var strHtml = '<form name="addParamForm" class="form-inline" role="form">' +
					'<div class="form-group">' +
					'<label for="input" class="control-label">参数名称：</label>' +
					'<input type="text" class="form-control" name="paramName" value="'+obj.paramName+'">' +
					'</div>' +
					'<div class="form-group">' +
					'<label for="input" class="control-label">参数键名：</label>' +
					'<input type="text" class="form-control" name="paramKey" value="'+obj.paramKey+'">' +
					'</div>' +
					'<div class="form-group">' +
					'<label for="input" class="control-label">参数值：</label>' +
					'<input type="text" class="form-control" name="paramValue" value="'+obj.paramValue+'">' +
					'</div>' + '</form>'
					$("#testParamDiv").append(strHtml);
				});
			}
		}
	});
	$('#testActivityTable').on('click-row.bs.table', function (e, row, element){
	});
}

//顶部删除功能    --------  
/*function deleteSelectMateBatch(){
	
	var selectData = $("#testSelectTable").bootstrapTable('getSelections');
	if(selectData.length == 0){
		toastr.warning("请先勾选要删除的数据。");
		return;
	}
	doAction(selectData,"deleteSelectMate");
}*/

function deleteSelectMate(id){
	var arr = [],obj = {};
	obj.id = id;
	arr.push(obj);
	doAction(arr,"deleteSelectMate");
}

function executeTask(){
	var selectData = $("#testSelectTable").bootstrapTable('getSelections');
	if(selectData.length == 0){
		toastr.warning("请先勾选要执行的任务。");
		return;
	}
	doAction(selectData,"executeTestActivity");
}

function doAction(data,action){
	$.ajax({
		type : 'post',
		url : "testSelect/" + action,
		processData:false,
        contentType:'application/json',
		data : JSON.stringify(data),
		success : function(res){
			if(res == 0){
				$('#testActivityModal').modal('hide');
				toastr.success("操作成功！");
				$("#testSelectTable").bootstrapTable('refresh');
			}else{
				toastr.error("error！");
			}
		}
	});
}
//---------------------------------删除功能结束

//executeDownLoadFile  导出EXCEL文件的模板   ===================
function executeDownLoadSelectFile(){
	alert('开始执行');
	window.location.href = 'testFile/executeDownLoadSelectFile'; 
}


//新增功能    addNewSelectPage

function addNewSelectPage(){
	$("#forObj2").val('1');
	$('#testActivityModal2').modal('show');
}

//新增功能提交
function checkSelectData(){
	
	//必填字段的校验   bom 编码
	//var bom = $('#bom_select').val().toUpperCase();
	var bom = $('#bom_select').val().toUpperCase();
	console.log(bom);
	
	if(bom == null || bom == ""){
		toastr.error("bom 编码必填！");
		$("#bom_select").focus();
		return false;
	}
	
	//必填字段的校验   material_desc
	var material_desc = $('#material_desc_select').val();
	if(material_desc == null || material_desc ==""){
		toastr.error("物料描述必填！");
		$("#material_desc_select").focus();
		return false;
	}
	
	//其他字段
	var dataParam = [];
	var test_environment = $("#test_environment_select").val();
	var equipment_type = $("#equipment_type_select").val();
	var register = $("#register_select").val();
	var remarks = $("#remarks_select").val();

	$.ajax({
		type : 'post',
		url : "testSelect/addNewSelect",
		data : {
				bom:bom,
				material_desc:material_desc,
				test_environment:test_environment,
				equipment_type:equipment_type,
				register:register,
				remarks:remarks,
				pageNumber:null
				},
		success : function(res){
			//alert(res);
			if(res == 0){
				$('#testActivityModal2').modal('hide');
				toastr.success("操作成功！");
				$("#testSelectTable").bootstrapTable('refresh',{
					silent: true,
					url : 'testSelect/getMateSelectDataList'
				});
			}else if(res == -2){
				toastr.error("当前添加的bom已存在，请重新添加");
				$("#bom_select").focus();
			}
		}
	});
	
	//return false;
	
}


//修改,进入修改页面
function updateTestSelectPage(){
	var selectData = $("#testSelectTable").bootstrapTable('getSelections');
	if(selectData.length == 0){
		toastr.warning("请先勾选要修改的数据。");
		return;
	}else{
		
		//console.log(selectData[0].id);
		var id = selectData[0].id ;
		$.ajax({
			type : 'post',
			url : "testSelect/getSelectEntityById",
//			processData:false,
//	        contentType:false,
			data : {id:id,pageNumber:null},
			success : function(res){
				$('#testActivityModal3').modal('show');
				if(res){
					console.log(res)
					$("#id_ed_select").val(res.id);
					$("#bom_select_ed").val(res.bom);
					$("#material_desc_select_ed").val(res.material_desc);
					$("#test_environment_select_ed").val(res.test_environment);
					$("#equipment_type_select_ed").val(res.equipment_type);
					$("#register_select_ed").val(res.register);
					$("#remarks_select_ed").val(res.remarks);
					
					/*$.each(res,function(name,val){
						$('#FormeSelectEdit').find("input[name='"+name+"']").val(val);
					});*/
					
				}
			}
		});
		
		$("#forObj3").val('1');
		$('#testActivityModal3').modal('show');
	}
}


//修改提交,根据ID修改
function checkSelectEditData(){
	
	//必填字段的校验   bom
	var bom = $('#bom_select_ed').val();
	if(bom == null || bom == ""){
		alert('bom码 不能为空');
		$("#bom_select_ed").focus();
		return false;
	}
	
	//必填字段的校验        物料miaos  account_holder
	var material_desc = $('#material_desc_select_ed').val();
	if(material_desc == null || material_desc ==""){
		toastr.error("物料描述必填！");
		$("#material_desc_select_ed").focus();
		return false;
	}
	
	//console.log($('#id_ed').val());
	var id = $('#id_ed_select').val();
	
	//其他字段的加入
	var dataParam = [];
	
	var test_environment = $("#test_environment_select_ed").val();
	var equipment_type = $("#equipment_type_select_ed").val();
	var register = $("#register_select_ed").val();
	var remarks = $("#remarks_select_ed").val();
	var equipment_type = $("#equipment_type_select_ed").val();
	
	$.ajax({
		type : 'post',
		url : "testSelect/updateSelectEntity",
		//data :  {material_code:material_code,bom:bom,id:id,pageNumber:null},
		data : {id:id,
				bom:bom,
				material_desc:material_desc,
				test_environment:test_environment,
				equipment_type:equipment_type,
				register:register,
				equipment_type:equipment_type,
				remarks:remarks,
				pageNumber:null
			},
		success : function(res){
			alert(res);
			if(res == 0){
				//$('#testActivityModal').modal('hide');
				$('#testActivityModal3').modal('hide');
				toastr.success("操作成功！");
				$("#testSelectTable").bootstrapTable('refresh',{
					silent: true,
					url : 'testSelect/getMateSelectDataList'
				});
			}else if(res == -2){
				toastr.error("当前您输入bom已存在，请重新输入");
				$("#bom_select_ed").focus();
			}else if(res == -1){
				toastr.error("修改异常，请联系管理员");
			}
		}
	});
}

//文件导出功能
function executeSelectFileOut(){
	
	//alert("开始导出-----");
	var selectData = $("#testSelectTable").bootstrapTable('getSelections');
	
	if(selectData.length == 0){
		window.location.href = 'testFile/executeSelectFileOut?id='+""; 
	}else{
		var ids=[];
		for (var i=0;i<selectData.length;i++){
			ids.push(selectData[i].id);
		}
		window.location.href = 'testFile/executeSelectFileOut?id='+ids; 
		//console.log(ids);
	}
	
}

//文件导入功能
//进入文件导入页面
function executeSelectFileIn(){
	alert("join");
	$('#testActivityModal12').modal('show');
}

//excel文件导入
function executeFileIn1(){
	alert("开始导入-----");
	/*$.ajax({
		type : 'post',
		url : "testFile/toExecuteFileIn",
		data : '',
		success : function(res){
			if(res == 0){
				toastr.success("操作成功！");
				//然后刷新页面，同时去请求查询数据的接口
				$("#testActivityTable").bootstrapTable('refresh',{
					silent: true,
					url : 'testActivity/getAssetManageList'
				});
			}else{
				toastr.error("error！");
			}
		}
	});*/
}

//关键字查询
function searchSelectDataByName(){
	//debugger;
	var querySelectName = $("#querySelectName").val();
	
	$('#testSelectTable').bootstrapTable('refresh',{
		type : 'post',
		silent: true,
		url:'testSelect/getMateSelectDataList',
		query : {querySelectName:querySelectName,pageSize:10,pageNumber:1}
	});
	
}

//根据设备名称查找
function getSelectDataByName(val){
	console.log(val)
	var equipment_type = val;
	$('#testSelectTable').bootstrapTable('refresh',{
		type : 'post',
		silent: true,
		url:'testSelect/getSelectDataByEquipName',
		query : {equipment_type:equipment_type,pageSize:10,pageNumber:1}
	});
}

