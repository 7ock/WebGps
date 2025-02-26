$(document).ready(function(){
	setTimeout(loadParkSummaryPage, 50);
});

var searchOpt = new searchOption(false, true);

function loadParkSummaryPage() {
	//等待父窗口加载完成后，再加载资源信息
	if (typeof parent.lang == "undefined") {
		setTimeout(loadParkSummaryPage, 50);
	} else {
		buttonQueryOrExport();
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
		loadParkSummaryLang();
		//加载搜索选项
		searchOpt.initSearchOption();
		$('#combox-vehiIdnos').on('click keyup',selVehicle);
		$(".btnQuery").click(queryParkSummary);
		$(".btnExport").click(exportParkSummary);
		$(".btnExportCSV").click(exportParkSummaryCSV);
		$(".btnExportPDF").click(exportParkSummaryPDF);
		var width = 0;
		if(parent.screenWidth >= 1360) {
			width = 'auto';
		}else {
			width = 1060;
			$('#sysuserLogDate').css('width','1100px');
		}
		$("#parkSummaryTable").flexigrid({
			url: "StandardReportParkAction_summary.action",
			dataType: 'json',
			colModel : [
					{display: parent.lang.index, name : 'index', width : 40, sortable : false, align: 'center'},
					{display: parent.lang.plate_number, name : 'vehiIdno', width : 150, sortable : false, align: 'center'},
					{display: parent.lang.report_plate_color, name : 'plateType', width : 60, sortable : false, align: 'center'},
					{display: parent.lang.report_beginTime, name : 'beginTime', width : 120, sortable : false, align: 'center', hide: false},
					{display: parent.lang.report_endTime, name : 'endTime', width : 120, sortable : false, align: 'center'},
					{display: parent.lang.report_park_count, name : 'count0', width : 100, sortable : false, align: 'center'},
					{display: parent.lang.report_park_totalTime, name : 'count1', width : 120, sortable : false, align: 'center'},
					{display: parent.lang.report_idle_count, name : 'countStr0', width : 100, sortable : false, align: 'center'},
					{display: parent.lang.report_idle_totalTime, name : 'countStr1', width : 120, sortable : false, align: 'center'}
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

function fixHeight() {
	$('#parkSummaryTable').flexFixHeight();
}

function loadParkSummaryLang(){
	searchOpt.loadLang();
	$("#reportTitle").text(parent.lang.report_park_summary);
}

//function disableForm(disable) {
//	searchOpt.disableForm(disable);
//}

function queryParkSummary() {
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
	$('#parkSummaryTable').flexOptions(
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
	}else if(name == 'beginTime'){
			pos = dateTime2TimeString(row[name]);
	}else if( name == 'endTime'){
		if(dateTime2TimeString(row[name]) == '1970-01-01 08:00:00'){
			pos = "";
		}else{
			pos = dateTime2TimeString(row[name]);
		}
	}else if(name == 'count'+index) {
		if(index.toString().indexOf('Str') >= 0) {
			var counts = row['countStrs'];
			var i = Number(index.replace('Str',''));
			if(counts && counts.length > i) {
				pos = counts[i];
			}
		}else {
			var counts = row['counts'];
			if(counts && counts.length > Number(index)) {
				pos = counts[index];
			}
		}
		if(index == '1' || index == 'Str1') {
			pos = getTimeDifference(pos);
		}
		if(!pos) {
			pos = 0;
		}
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
	document.reportForm.action = "StandardReportParkAction_summaryExcel.action?exportType="+exportType+"&begintime="+$('#begintime').val()+"&endtime="+$('#endtime').val();
	document.reportForm.submit();  
}
//导出至excel，导出至csv，导出至pdf
function exportParkSummary() {
	exportReport(1);
}

function exportParkSummaryCSV() {
	exportReport(2);
}

function exportParkSummaryPDF() {
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