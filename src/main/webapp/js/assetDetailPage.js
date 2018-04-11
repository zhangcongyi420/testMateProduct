$(function(){
	
	getEquipmentType();//获取所有设备类型
	
	getLaboratory();//获取所有实验室
	
	initAssetDetailTable();//资产详情列表
	
	$("#addAssetModal").on('hidden.bs.modal',function(){
		document.getElementById("addAssetForm").reset();
		$("#addAssetForm").data('bootstrapValidator').destroy();
		$('#addAssetForm').data('bootstrapValidator', null);
		assetFormValidator();//表单校验
	});
	
	$("#updateAssetModal").on('hidden.bs.modal',function(){
		document.getElementById("updateAssetForm").reset();
		$("#updateAssetForm").data('bootstrapValidator').destroy();
		$('#updateAssetForm').data('bootstrapValidator', null);
		assetFormValidator();//表单校验
	});
	
	$("#importAssetModal").on('hidden.bs.modal',function(){
		$("#importFile").next("div").find("input").val("");
	});
	
	assetFormValidator();//表单校验
	
});

//资产详情列表
function initAssetDetailTable(){
	$("#assetDetailTable").bootstrapTable({
		method : 'post',
		striped : true,
		cache : false,
		toolbar: "#toolbarDiv",
		pagination : true,
		contentType : "application/x-www-form-urlencoded",
		pageNumber : 1,
		pageSize : 20,
		pageList : [20,30,50],
		smartDisplay:false,
		url : 'assetManage/getAssetInfoList',
		queryParamsType : '',
		sidePagination : 'server',
		columns : [
			{checkbox:true,visible:true},
			{field : 'asset_code',title : '资产编码',align : 'center'},
			{field : 'equipment_type',title : '设备类型',align : 'center'},
			{field : 'material_code',title : '物料条码',align : 'center'},
			{field : 'bom_code',title : 'BOM编码',align : 'center'},
			{field : 'material_desc',title : '物料描述',align : 'center'},
			{field : 'asset_rfid',title : 'RFID码',align : 'center'},
			{field : 'current_lab',title : '当前实验室',align : 'center'},
			{field : 'current_place',title : '当前位置',align : 'center'},
			{field : 'account_holder',title : '挂账人',align : 'center'},
			{field : 'asset_producer',title : '厂商',align : 'center'},
			{field : 'belong_lab',title : '归属实验室',align : 'center'},
			{field : 'use_state',title : '是否在用',align : 'center'},
			{field : 'remarks',title : '备注',align : 'center'},
			{field : 'borrower',title : '借用人',align : 'center'}
		]
	})
}

//获取所有设备类型
function getEquipmentType(){
	$.ajax({
		type : 'get',
		url : 'assetManage/getEquipmentType',
		success : function(res){
			if(res){
				var equipment_type = "<dd><div class='active'><a>全部</a></div></dd>";
				for (var i = 0; i < res.length; i++) {
					equipment_type += "<dd><div><a>"+res[i]+"</a></div></dd>"
				}
				$("#equipment_type_dl").append(equipment_type);
				$("#equipment_type_dl div").on('click',function(){
					var val = $(this).find("a").text();
					if(val == '全部'){
						$("#equipment_type_dl div").removeClass("active");
						$(this).toggleClass("active");
					}else{
						$("#equipment_type_dl div:eq(0)").removeClass("active");
						$(this).toggleClass("active");
					}
					getAssetByCondition();
				});
			}
		}
	})
}

//根据查询条件查询资产信息
function getAssetByCondition(){
	var equipmentTypes = [],laboratorys = [];
	$("#equipment_type_dl div.active").each(function(){
		var equipmentType = $(this).find("a").text();
		if(equipmentType != '全部'){
			equipmentTypes.push(equipmentType);
		}
	});
	
	$("#laboratory_dl div.active").each(function(){
		var laboratory = $(this).find("a").text();
		if(laboratory != '全部'){
			laboratorys.push(laboratory);
		}
	});
	$('#assetDetailTable').bootstrapTable('refresh',{
		type : 'post',
		silent: true,
		url:'assetManage/getAssetInfoList',
		query : {equipmentTypeStr:equipmentTypes.join(","),laboratoryStr:laboratorys.join(","),pageSize:20,pageNumber:1}
	});
}

//获取所有实验室
function getLaboratory(){
	$.ajax({
		type : 'get',
		url : 'assetManage/getLaboratory',
		success : function(res){
			if(res){
				var laboratory = "<dd><div class='active'><a>全部</a></div></dd>";
				for (var i = 0; i < res.length; i++) {
					laboratory += "<dd><div><a>"+res[i]+"</a></div></dd>"
				}
				$("#laboratory_dl").append(laboratory);
				$("#laboratory_dl div").on('click',function(){
					var val = $(this).find("a").text();
					if(val == '全部'){
						$("#laboratory_dl div").removeClass("active");
						$(this).toggleClass("active");
					}else{
						$("#laboratory_dl div:eq(0)").removeClass("active");
						$(this).toggleClass("active");
					}
					getAssetByCondition();
				});
			}
		}
	})
}

//根据关键字进行搜索
function searchAssetDeatail(){
	var queryName = $("#queryName").val();
	$('#assetDetailTable').bootstrapTable('refresh',{
		type : 'post',
		silent: true,
		url:'assetManage/getAssetInfoList',
		query : {queryName:queryName,pageSize:10,pageNumber:1}
	});
}

function addAssetPage(){
	$('#addAssetModal').modal('show');
}

var updateBeforeData = "";
function updateAssetPage(){
	updateBeforeData = $("#assetDetailTable").bootstrapTable("getSelections");
	if(updateBeforeData.length != 1){
		toastr.warning("请勾选一条要修改的数据。");
		return;
	}
	$('#updateAssetModal').modal('show');
	$.each(updateBeforeData[0],function(name,val){
		$("#updateAssetForm").find("input[name='"+name+"']").val(val);
		if(name == 'equipment_type' || name == 'material_desc'){
			if(val){
				$("#updateAssetForm").find("input[name='"+name+"']").attr("readOnly","true");
			}
		}
	});
	getModifyRecords(updateBeforeData[0].id);//加载修改记录列表
}

//查询修改记录列表
function getModifyRecords(id){
	$("#assetUpdateRecTable").bootstrapTable({
		method : 'post',
		contentType : "application/x-www-form-urlencoded",
		striped : true,
		cache : false,
		pagination : true,
		pageNumber : 1,
		pageSize : 10,
		pageList : [10,20,30,50],
		smartDisplay:false,
		url : 'assetManage/getModifyRecords',
		queryParams : {asset_id:id,pageNumber : 1,pageSize : 10},
//		queryParamsType : '',
		sidePagination : 'server',
		columns : [
			{field : 'modifier',title : '修改人',align : 'center'},
			{field : 'modify_content',title : '修改内容',halign : 'center'},
			{field : 'modify_time',title : '修改时间',align : 'center'}]
	})
}

//保存资产信息
function saveAsset(optState){
	var modifyData = new FormData();
	var updateContent = [];
	var bootstrapValidator = null;
	var formData = new FormData();
	var action = '';
	if(optState == '1'){
		bootstrapValidator = $("#addAssetForm").data("bootstrapValidator");
		formData = new FormData(document.getElementById("addAssetForm"));
		action = 'addAssetInfo';
	}else if(optState =='0'){
		bootstrapValidator = $("#updateAssetForm").data("bootstrapValidator");
		action = 'updateAssetInfo';
		formData = new FormData(document.getElementById("updateAssetForm"));
		$.each(updateBeforeData[0],function(name,val){
			var afterVal = formData.get(name);
			if(name != "0" && name != "id" && val != afterVal){
				var str = $("#" + name).text() + "[修改前：" + val + ",修改后：" + afterVal +"]";
				updateContent.push(str);
			}
		});
		modifyData.append("asset_id",updateBeforeData[0].id);
		modifyData.append("modify_content",updateContent.join(";"));
	}
	bootstrapValidator.validate();
	var flag = bootstrapValidator.isValid();
	if(!flag){
		return;
	}
	var bom = formData.get("bom_code");
	var materialCode = formData.get("material_code");
	if(bom == null || bom == undefined || bom == ""){
		formData.append("bom_code",materialCode.substring(2,9));
	}
	formData.append("id",updateBeforeData[0].id);
	$.ajax({
		type : 'post',
		url : "assetManage/" + action,
		processData:false,
        contentType:false,
		data : formData,
		success : function(res){
			if(res == 1){
				if(optState == '1'){
					$('#addAssetModal').modal('hide');
				}else{
					$('#updateAssetModal').modal('hide');
				}
				toastr.success("操作成功！");
				refreshAssetTable();
				addModifyRecord(modifyData);
			}else{
				toastr.error("error！");
			}
		}
	});
}

function addModifyRecord(modifyData){
	$.ajax({
		type : 'post',
		url : "assetManage/addModifyRecord",
		processData:false,
        contentType:false,
		data : modifyData,
		success : function(res){
			if(res == 1){
				toastr.success("操作成功！");
				$("#assetUpdateRecTable").bootstrapTable('refresh',{
					silent: true,
					url : 'assetManage/getModifyRecords'
				});
			}else{
				toastr.error("error！");
			}
		}
	});
}

function refreshAssetTable(){
	$("#assetDetailTable").bootstrapTable('refresh',{
		silent: true,
		url : 'assetManage/getAssetInfoList'
	});
}

//删除资产信息
function deleteAsset(){
	var data = $("#assetDetailTable").bootstrapTable("getSelections");
	if(data.length < 1){
		toastr.warning("请勾选要删除的数据。")
		return;
	}
	$.ajax({
		type : 'post',
		url : 'assetManage/deleteAsset',
		processData:false,
        contentType:'application/json',
		data : JSON.stringify(data),
		success : function(res){
			if(res == 1){
				toastr.success("操作成功！");
				refreshAssetTable();
			}else{
				toastr.error("error！");
			}
		}
	})
}

//导出excel
function exportAsset(){
	var selectData = $("#assetDetailTable").bootstrapTable('getSelections');
	if(selectData.length == 0){
		window.location.href = 'testFile/testExecuteFileOut?id='+""; 
	}else{
		var ids=[];
		for (var i=0;i<selectData.length;i++){
			ids.push(selectData[i].id);
		}
		window.location.href = 'testFile/testExecuteFileOut?id='+ids; 
	}
}

//导入excel
function importAsset(){
	$("#importAssetModal").modal('show');
	$("#importFile").filestyle({
		text : '选择文件',
		btnClass : 'btn-primary'
	});
}

function importExcel(){
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
    xhr.open("post", "assetManage/importAssetInfo", true);
    xhr.onload = function () {
    	if (xhr.status == 200 && xhr.response == "1") {
    		toastr.success("操作成功！");
    		$("#importAssetModal").modal('hide');
    		refreshAssetTable();
   	    } else {
   	    	toastr.error("error！请检查excel必填项。");
   	    }
    }
    xhr.send(formData);
}

//下载excel模板
function downLoadTemplate(){
	window.location.href = 'assetManage/downLoadTemplate';
}

function assetFormValidator(){
	$('#addAssetForm,#updateAssetForm').bootstrapValidator({
		message: 'This value is not valid',
		feedbackIcons:{
			valid: 'glyphicon glyphicon-ok',
			invalid: 'glyphicon glyphicon-remove',
			validating: 'glyphicon glyphicon-refresh'
		},
		fields:{
			material_code:{
				message:'',
				validators:{
					notEmpty:{
						message: '物料条码不能为空！'
					}
				}
			},
			account_holder:{
				message:'',
				validators:{
					notEmpty:{
						message: '挂账人不能为空！'
					}
				}
			}
		}
	});
}