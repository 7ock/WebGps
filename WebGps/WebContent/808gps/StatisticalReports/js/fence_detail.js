$(document).ready(function(){
	setTimeout(loadAlarmDetailPage, 50);
});

var searchOpt = new searchOption(false, true);

function loadAlarmDetailPage() {
	//等待父窗口加载完成后，再加载资源信息
	if (typeof parent.lang == "undefined" || !parent.isLoadMarkerSuc) {
		setTimeout(loadAlarmDetailPage, 50);
	} else {
		buttonQueryOrExport();
		$('#select-armType').flexPanel({
			ComBoboxModel :{
				button :
				[
					[{
						display: parent.lang.all, name : 'type', pid : 'type', pclass : 'buttom',bgcolor : 'gray',bgicon : 'true', hide : false,hidden: true
					}]
				],
				combox: {name : 'type', option : arrayToStr(getArmTypes())}
			}	
		});
		$('#select-handled').flexPanel({
			ComBoboxModel :{
				button :
				[
					[{
						display: parent.lang.all, name : 'handleStatus', pid : 'handleStatus', pclass : 'buttom',bgcolor : 'gray',bgicon : 'true', hide : false,hidden: true
					}]
				],
			//	input : {display: '选择状态',width:'60px',value:'',name : 'useType', pid : 'useType', pclass : 'buttom',bgicon : 'true', hide : false},
				combox: {name : 'handleStatus', option : '2&'+parent.lang.all+'|0&'+parent.lang.report_unhandled+'|1&'+parent.lang.report_handled}
			}	
		});
		$('#selectName').flexPanel({
			InputModel : {display: parent.lang.selectVehicleTip,value:'',name : 'vehiIdnos', pid : 'vehiIdnos', pclass : 'buttom',bgicon : '',hidden:true, hide : false} 
		});
		
		$('#selecttime').flexPanel({
			ComBoboxModel :{
				input : {name : 'selecttime',pclass : 'buttom',bgicon : 'true',hidden: true,readonly: true},
				combox: 
					{name : 'selecttime', option : arrayToStr(getSelectTime(1))}
			}	
		});
		
		$('#select-selecttime li').each(function() {
			var index= $(this).attr('data-index');
			$(this).on('click',function() {
				selectTime(index, 1);
			});
			if(index == 0) {
				$(this).click();
			}
		});
		
		//加载语言
		loadAlarmDetailLang();
		//加载搜索选项
		searchOpt.initSearchOption();
		$('#hidden-type').val('fence');
		$('#combox-vehiIdnos').on('click keyup',selVehicle);
		$(".btnQuery").click(queryAlarmDetail);
		$(".btnExport").click(exportAlarmDetail);
		$(".btnExportCSV").click(exportAlarmDetailCSV);
		$(".btnExportPDF").click(exportAlarmDetailPDF);
		var width = 0;
		if(Math.round(6 * parent.screenWidth/7) - 25 >= 2020) {
			width = 'auto';
		}else {
			width = 2020;
			$('#sysuserLogDate').css('width','2060px');
		}
		$("#alarmDetailTable").flexigrid({
			url: "StandardReportAlarmAction_detail.action",
			dataType: 'json',
			colModel : [
				{display: parent.lang.index, name : 'index', width : 40, sortable : false, align: 'center'},
				{display: parent.lang.plate_number, name : 'vehiIdno', width : 120, sortable : false, align: 'center'},
				{display: parent.lang.report_plate_color, name : 'plateType', width : 60, sortable : false, align: 'center'},
				{display: parent.lang.vehicle_alarmaction_alarmType, name : 'armTypeStr', width : 80, sortable : false, align: 'center'},
				{display: parent.lang.vehicle_alarmSource, name : 'alarmSource', width : 60, sortable : false, align: 'center'},
				{display: parent.lang.rule_areaName, name : 'param2', width : 120, sortable : false, align: 'center'},
				{display: parent.lang.report_beginTime, name : 'armTimeStart', width : 120, sortable : false, align: 'center'},
				{display: parent.lang.report_endTime, name : 'armTimeEnd', width : 120, sortable : false, align: 'center'},
				{display: parent.lang.report_alarmTimeLength, name : 'timeLength', width : 80, sortable : false, align: 'center'},
				{display: parent.lang.report_startSpeed + gpsGetLabelSpeedUnit(), name : 'startSpeed', width : 150, sortable : false, align: 'center'},
				{display: parent.lang.report_endSpeed + gpsGetLabelSpeedUnit(), name : 'endSpeed', width : 150, sortable : false, align: 'center'},
				{display: parent.lang.report_normal_beginPosition, name : 'startPosition', width : 150, sortable : false, align: 'center'},
				{display: parent.lang.report_normal_endPosition, name : 'endPosition', width : 150, sortable : false, align: 'center'},
				{display: parent.lang.monitor_alarmInfo, name : 'armInfoDesc', width : 150, sortable : false, align: 'center'},
				{display: parent.lang.vehicle_handleCondition, name : 'handleStatus', width : 60, sortable : false, align: 'center'},
				{display: parent.lang.report_handling_user, name : 'handleuser', width : 70, sortable : false, align: 'center'},
				{display: parent.lang.report_handle_content, name : 'handleContent', width : 80, sortable : false, align: 'center'},
				{display: parent.lang.report_handle_time, name : 'handleTime', width : 120, sortable : false, align: 'center'}
				],
			pernumber: parent.lang.pernumber,
			pagestat: parent.lang.pagestatInfo,
			pagefrom: parent.lang.pagefrom,
			pagetext: parent.lang.page,
			pagetotal: parent.lang.pagetotal,
			findtext: parent.lang.find,
			procmsg: parent.lang.procmsg,
			nomsg : parent.lang.nomsg,
			usepager: true,
			autoload: false,
			useRp: true,
			rp: 15,
			showTableToggleBtn: true,
			width: width,
			onSubmit: false,
			height: 'auto'
		});
		loadReportTableWidth(fixHeight);
	}
}

function getMarkerName(id) {
	var ret = "";
	if (parent.markerList !== null) {
		for(var i = 0; i < parent.markerList.length; i += 1) {
			if (parent.markerList[i].id == id) {
				ret = parent.markerList[i].name;
				break;
			}
		}
	}
	return ret;
} 

function fixHeight() {
	$('#alarmDetailTable').flexFixHeight();
}

function getSelectTime() {
	var distances = [];
	distances.push({id:0,name:parent.lang.customTime});
	distances.push({id:1,name:parent.lang.today});
	distances.push({id:2,name:parent.lang.yesterday});
	distances.push({id:3,name:parent.lang.last2Days});
	distances.push({id:4,name:parent.lang.last7Days});
	distances.push({id:5,name:parent.lang.month});
	return distances;
}

function loadAlarmDetailLang(){
	searchOpt.loadLang();
	$("#reportTitle").text(parent.lang.report_fence_detail);
	$("#labelarmType").text(parent.lang.label_alarmType);
	$("#labelhandled").text(parent.lang.label_handleCondition);
}

//function disableForm(disable) {
//	searchOpt.disableForm(disable);
//}

function queryAlarmDetail() {
	var query = searchOpt.getQueryDataNew(false);
	if (query === null) {
		return ;
	}
	if($('#hidden-vehiIdnos').val() == null || $('#hidden-vehiIdnos').val() == '') {
		alert(parent.lang.report_selectVehiNullErr);
		return;
	}
	searchOpt.requireParam.vehiIdnos = $('#hidden-vehiIdnos').val();
	var params = [];
	params.push({
		name: 'json',
		value: encodeURIComponent(JSON.stringify(searchOpt.requireParam))
	});
	params.push({
		name: 'begintime',
		value: query.begindate
	});
	params.push({
		name: 'endtime',
		value: query.enddate
	});
	params.push({
		name: 'handleStatus',
		value: $('#hidden-handleStatus').val()
	});
	params.push({
		name: 'type',
		value: $('#hidden-type').val()
	});
	var toMap = 2;  //百度地图
	if(!parent.langIsChinese()) {
		toMap = 1; //谷歌地图
	}
	params.push({
		name: 'toMap',
		value: toMap
	});
	$('#alarmDetailTable').flexOptions(
			{newp: 1,sortname: '', sortorder: '', query: '', qtype: '', params: params}).flexReload();
}

function fillCellInfo(p, row, idx, index) {
	var pos = "";
	var name = p.colModel[idx].name;
	if(name == 'plateType') {
		switch (parseIntDecimal(row[name])) {
		case 1:
			pos = parent.lang.blue_label;
			break;
		case 2:
			pos = parent.lang.yellow_label;
			break;
		case 3:
			pos = parent.lang.black_label;
			break;
		case 4:
			pos = parent.lang.white_label;
			break;
		case 0:
			pos = parent.lang.other;
			break;
		default:
			break;
		}
	}else if(name == 'param2') {
		pos = getMarkerName(row[name]);
	}else if(name == 'armTimeStart'){
			pos = dateTime2TimeString(row[name]);
	}else if( name == 'armTimeEnd'){
		if(dateTime2TimeString(row[name]) == '1970-01-01 08:00:00'){
			pos = "";
		}else{
			pos = dateTime2TimeString(row[name]);
		}
	}else if(name == 'handleStatus') {
		switch (parseIntDecimal(row[name])) {
		case 0:
			pos = parent.lang.report_unhandled;
			break;
		case 1:
			pos = parent.lang.report_handled;
			break;
		default:
			break;
		}
	}else if(name == 'startSpeed' || name == 'endSpeed') {
		pos = gpsGetSpeed(row[name], 1);
	}else if(name == 'startPosition') {
		pos = "<a class=\"blue\" href=\"javascript:showMapPosition('" + row['vehiIdno'] + "', '" + row['startJingDu'] + "', '" + row['startWeiDu'] + "');\">" + changeNull(row[name]) + "</a>";
	}else if (name == 'endPosition') {
		pos = "<a class=\"blue\" href=\"javascript:showMapPosition('" + row['vehiIdno'] + "', '" + row['endJingDu'] + "', '" + row['endWeiDu'] + "');\">" + changeNull(row[name]) + "</a>";
	}else {
		pos = changeNull(row[name]);
	}
	return pos;
}

function exportReport(exportType) {
	var query = searchOpt.getQueryDataNew(false);
	if (query === null) {
		return ;
	}
	if($('#hidden-vehiIdnos').val() == null || $('#hidden-vehiIdnos').val() == '') {
		alert(parent.lang.report_selectVehiNullErr);
		return;
	}
	var toMap = 2;  //百度地图
	if(!parent.langIsChinese()) {
		toMap = 1; //谷歌地图
	}
	document.reportForm.action = "StandardReportAlarmAction_detailExcel.action?exportType="+exportType+"&toMap="+toMap+"&begintime="+$('#begintime').val()+"&endtime="+$('#endtime').val()+"&maintype=fence";
	document.reportForm.submit();
}
//导出至excel，导出至csv，导出至pdf
function exportAlarmDetail() {
	exportReport(1);
}

function exportAlarmDetailCSV() {
	exportReport(2);
}

function exportAlarmDetailPDF() {
	exportReport(3);
}

var selIds;
//选择车辆
function selVehicle() {
	$.dialog({id:'info', title:parent.lang.selectVehicleTitle,content: 'url:StatisticalReports/selectInfo.html?type=selVehicle&singleSelect=false&selectAll=true&isOil=false',
		width:'800px',height:'530px', min:false, max:false, lock:true});
}

function doSelectVehicle(ids,vehicleList) {
	if(ids != null && ids == '0') {
		$('#combox-vehiIdnos').val(parent.lang.all_vehicles);
		$('#hidden-vehiIdnos').val(getNewArrayByArray(parent.vehicleList,'name').toString());
	}else {
		selIds = ids;
		if(ids != null && ids.split(',').length > 0) {
			if(ids.split(',').length > 1) {
				$('#combox-vehiIdnos').val(parent.lang.isSelected + ids.split(',').length);
			}else {
				$('#combox-vehiIdnos').val(vehicleList);
			}
		}
		$('#hidden-vehiIdnos').val(vehicleList);
	}
	$.dialog({id:'info'}).close();
}

function doExit() {
	$.dialog({id:'info'}).close();
}

function getArmTypes() {
	var armType = [];
	armType.push({id:'fence',name:parent.lang.all});
	armType.push({id:'bounds',name:parent.lang.alarm_type_beyond_bounds});
	armType.push({id:'rsegionalSpeeding',name:parent.lang.alarm_type_regionalSpeedingAlarm});
	armType.push({id:'outOfRegional',name:parent.lang.alarm_type_outOfRegional});
	armType.push({id:'outOfLine',name:parent.lang.alarm_type_outOfLine});
	armType.push({id:'roadTravelTime',name:parent.lang.alarm_type_InadequateOrTooLongRoadTravelTime});
	armType.push({id:'routeDeviation',name:parent.lang.alarm_type_routeDeviation});
	armType.push({id:'cmsAreaOverSpeed',name:parent.lang.alarm_type_areaOverSpeed_platform});
	armType.push({id:'cmsAreaLowSpeed',name:parent.lang.alarm_type_areaLowSpeed_platform});
	armType.push({id:'cmsAreaInOut',name:parent.lang.alarm_type_areaInOut_platform});
	armType.push({id:'cmsLineInOut',name:parent.lang.alarm_type_lineInOut_platform});
	armType.push({id:'cmsAreaPoint',name:parent.lang.alarm_type_areaPoint_platform});
	armType.push({id:'cmsLineOverSpeed',name:parent.lang.alarm_type_lineOverSpeed_platform});
	armType.push({id:'cmsLineLowSpeed',name:parent.lang.alarm_type_lineLowSpeed_platform});
	return armType;
}