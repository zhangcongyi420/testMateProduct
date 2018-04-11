$(function(){
	
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
			}
		}
	});
	
	initTable();
	$("#testActivityModal2").on('hidden.bs.modal',function(){
		document.getElementById("Form").reset();
		$("#Form").data('bootstrapValidator').destroy();
		$('#Form').data('bootstrapValidator', null);
		assetFormValidator();//表单校验
	});
	
	$("#importAssetModal").on('hidden.bs.modal',function(){
		$("#importFile").next("div").find("input").val("");
	});
	formValidator();//表单校验
});


function initTable(){
	$("#testSelectTable").bootstrapTable({
		method: "get",  
		//toolbar: "#toolbarDiv",
		url : 'testSelect/getMateSelectDataList',
        striped: true,  
        pagination: true, 
        pageSize: 10, 
        pageNumber:1, 
        pageList: [5, 10, 15, 20, 25], 
        smartDisplay:false,
        search: false,  
        sidePagination: "server",
		queryParamsType : "", 
		
		columns :[{checkbox:true,visible:true},
			{field : 'id',title : '编号',align : 'center'},
			{field : 'bom',title : 'BOM码',align : 'center'},
			{field : 'material_desc',title : '物料描述',align : 'center'},
			{field : 'test_environment',title : '试用环境',align : 'center'},
			{field : 'equipment_type',title : '设备类型',align : 'center'},
			{field : 'register',title : '登记人',align : 'center'},					
			{field : 'remarks',title : '备注',align : 'center'}]
	})
}

//进入导入文件页面
function executeSelectFileIn(){
	$("#importAssetModal").modal('show');
	$("#importFile").filestyle({
		text : '选择文件',
		btnClass : 'btn-primary'
	});
}

/*function importExcel(){
	alert('sdsdsd')
	var formData = new FormData();
	var file = document.getElementById("importFile").files[0];
	if(file != undefined){
		var filename = file.name;
		var typeName = filename.substring(filename.lastIndexOf("."),filename.length);
		if(file == "" || (typeName != ".xlsx" && typeName != ".xls")){
			return toastr.warning('请选择excel类型文件。');
		}
	}
	formData.append("file", file);
	var xhr = new XMLHttpRequest();
    xhr.open("post", "testFile/toExecuteSelectFileIn", true);
    xhr.onload = function () {
    	if (xhr.status == 200 && xhr.response == "1") {
    		toastr.success("操作成功！");
   	    } else {
   	    	toastr.error("error！");
   	    }
    }
    xhr.send(form);
}*/


function formValidator(){
	$('#addParamForm').bootstrapValidator({
		message: 'This value is not valid',
		feedbackIcons:{
			valid: 'glyphicon glyphicon-ok',
			invalid: 'glyphicon glyphicon-remove',
			validating: 'glyphicon glyphicon-refresh'
		},
		fields:{
			testActivity:{
				message:'',
				validators:{
					notEmpty:{
						message: '名称不能为空！'
					}
				}
			},
			aresIP:{
				message:'',
				validators:{
					notEmpty:{
						message: '执行机IP不能为空！'
					}
				}
			},
			projectMode:{
				message:'',
				validators:{
					notEmpty:{
						message: '工程地址不能为空！'
					}
				}
			},
			projectConfig:{
				message:'',
				validators:{
					notEmpty:{
						message: '工程配置不能为空！'
					}
				}
			}
		}
	});
}

//删除功能  --------------------
function deleteSelectMateBatch(){
	
	var selectData = $("#testSelectTable").bootstrapTable('getSelections');
	if(selectData.length == 0){
		toastr.warning("请先勾选要删除的数据。");
		return;
	}
	doAction(selectData,"deleteSelectMate");
}

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

//新增功能
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

//修改功能   ===========================================

//修改,进入修改页面
function updateTestSelectPage(){
	var selectData = $("#testSelectTable").bootstrapTable('getSelections');
	if(selectData.length == 0){
		toastr.warning("请先勾选要修改的数据。");
		return;
	}else if(selectData.length > 1){
		toastr.warning("只能选择一项进行修改");
		return;
	}
	else{
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
	var bom = $('#bom_select_ed').val().toUpperCase();
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
			//alert(res);
			if(res == 0){
				//$('#testActivityModal').modal('hide');
				$('#testActivityModal3').modal('hide');
				toastr.success("修改成功！");
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

//修改功能   ===========================================     

//executeDownLoadFile  导出EXCEL文件的模板   ===================
function executeDownLoadSelectFile(){
	//alert('开始执行');
	window.location.href = 'testFile/executeDownLoadSelectFile'; 
}

//文件导出功能
function executeSelectFileOut(){
	
	var selectData = $("#testSelectTable").bootstrapTable('getSelections');
	
	if(selectData.length == 0){
		window.location.href = 'testFile/executeSelectFileOut?id='+""; 
	}else{
		var ids=[];
		for (var i=0;i<selectData.length;i++){
			ids.push(selectData[i].id);
		}
		window.location.href = 'testFile/executeSelectFileOut?id='+ids; 
	}
	
}

//关键字查询
function searchSelectDataByName(){
	
	var querySelectName = $("#querySelectName").val();
	//alert(querySelectName);
	$('#testSelectTable').bootstrapTable('refresh',{
		type : 'post',
		silent: true,
		url:'testSelect/getMateSelectDataList',
		query : {querySelectName:querySelectName,pageSize:10,pageNumber:1}
	});
	
}




