$(document).ready(function(){
	setTimeout(loadLiChengSummaryPage, 50);
});

var searchOpt = new searchOption(false, true);

$(function() {
	$('.editable-select').editableSelect(
	{
		bg_iframe: true,
		onSelect: function(list_item) {
				
			},
		items_then_scroll: 10
		}
	);	
	searchOpt.initDeviceQuery();
}); 

function loadLiChengSummaryPage() {
	//等待父窗口加载完成后，再加载资源信息
	if (typeof parent.lang == "undefined") {
		setTimeout(loadLiChengSummaryPage, 50);
	} else {
		//加载语言
		loadLiChengSummaryLang();
		//加载搜索选项
		searchOpt.initSearchOption();
		$("#btnQuery").click(queryLiChengSummary);
		$("#btnExport").click(exportLichengSummary);
		$("#btnExportCsv").click(exportLichengSummaryCsv);
		$("#btnExportPdf").click(exportLichengSummaryPdf);
		
		$("#lichengSummaryTable").flexigrid({
			url: "ReportNormalAction_summary.action",
			dataType: 'json',
			colModel : [
				{display: parent.lang.index, name : 'index', width : 40, sortable : false, align: 'center'},
				{display: parent.lang.vehiName, name : 'devIdno', width : 150, sortable : false, align: 'center'},
				{display: parent.lang.report_normal_lichengTotal + gpsGetLabelLiChengUnit(), name : 'liCheng', width : 100, sortable : false, align: 'center'},
				{display: parent.lang.begintime, name : 'startTimeStr', width : 120, sortable : false, align: 'center', hide: false},
				{display: parent.lang.report_normal_beginLicheng + gpsGetLabelLiChengUnit(), name : 'startLiCheng', width : 100, sortable : false, align: 'center'},
				{display: parent.lang.report_normal_beginPosition, name : 'startPosition', width : 250, sortable : false, align: 'center'},
				{display: parent.lang.endtime, name : 'endTimeStr', width : 120, sortable : false, align: 'center'},
				{display: parent.lang.report_normal_endLicheng + gpsGetLabelLiChengUnit(), name : 'endLiCheng', width : 100, sortable : false, align: 'center'},
				{display: parent.lang.report_normal_endPosition, name : 'endPosition', width : 250, sortable : false, align: 'center'}
				],
//			sortname: "devIdno",
//			sortorder: "asc",
			pernumber: parent.lang.pernumber,
			pagestat: parent.lang.pagestatInfo,
			pagefrom: parent.lang.pagefrom,
			pagetext: parent.lang.page,
			pagetotal: parent.lang.pagetotal,
//					checkbox: true,
			findtext: parent.lang.find,
			procmsg: parent.lang.procmsg,
			nomsg : parent.lang.nomsg,
			usepager: true,
			autoload: false,
			title: parent.lang.report_navNormalLiChengSummary,
			useRp: true,
			rp: 15,
			showTableToggleBtn: true,
			width: 1200,
			onSubmit: false,//addFormData,
			height: 400
		});
	}
}

function loadLiChengSummaryLang(){
	searchOpt.loadLang();
	$("#reportTitle").text(parent.lang.report_navNormalLiChengSummary);
}

function disableForm(disable) {
	searchOpt.disableForm(disable);
}

function queryLiChengSummary() {
	var query = searchOpt.getQueryData(false);
	if (query === null) {
		return ;
	}
	searchOpt.requireParam.devIdnos = query.deviceList.toString();
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
	var toMap = 2;  //百度地图
	if(!parent.langIsChinese()) {
		toMap = 1; //谷歌地图
	}
	params.push({
		name: 'toMap',
		value: toMap
	});
	$('#lichengSummaryTable').flexOptions(
			{newp: 1,sortname: '', sortorder: '', query: '', qtype: '', params: params}).flexReload();
}

function fillCellInfo(p, row, idx, index) {
	var pos = "";
	var name = p.colModel[idx].name;
	if(name == 'devIdno') {
		pos = gpsGetVehicleName(row[name]);
	}else if((name == 'startTime') || (name == 'endTime')){
		pos = dateTime2TimeString(row[name]);
	}else if(name == 'startPosition') {
		if(parent.showLocation == "true"){
			pos = "<a class=\"blue\" href=\"javascript:showMapPosition('" + gpsGetVehicleName(row['devIdno']) + "', '" + row['startJingDu'] + "', '" + row['startWeiDu'] + "');\">" + changeNull(row[name]) + "</a>";
		} else {
			if(row['startJingDu'] == 0 || row['startWeiDu'] == 0){
				pos = "";
			}else{
				pos = "<a class=\"blue\" href=\"javascript:showMapPosition('" + gpsGetVehicleName(row['devIdno']) + "', '" + row['startJingDu'] + "', '" + row['startWeiDu'] + "');\">" + gpsGetPosition(row['startJingDu'], row['startWeiDu'], 1) + "</a>";
			}
		}
	}else if (name == 'endPosition') {
		if(parent.showLocation == "true"){
			pos = "<a class=\"blue\" href=\"javascript:showMapPosition('" + gpsGetVehicleName(row['devIdno']) + "', '" + row['endJingDu'] + "', '" + row['endWeiDu'] + "');\">" + changeNull(row[name]) + "</a>";
		} else {
			if(row['endJingDu'] == 0 || row['endWeiDu'] == 0){
				pos = "";
			}else{
				pos = "<a class=\"blue\" href=\"javascript:showMapPosition('" + gpsGetVehicleName(row['devIdno']) + "', '" + row['endJingDu'] + "', '" + row['endWeiDu'] + "');\">" + gpsGetPosition(row['endJingDu'], row['endWeiDu'], 1) + "</a>";
			}
		}
	}else if((name == 'liCheng') || (name == 'startLiCheng') || (name == 'endLiCheng')){
		pos = gpsGetLiCheng(row[name]);
	}else {
		pos = changeNull(row[name]);
	}
	return pos;
}

function exportReport(exportType) {
	var query = searchOpt.getQueryData(false);
	if (query === null) {
		return ;
	}
	$("#devIdnos").val(query.deviceList.toString());
	var toMap = 2;  //百度地图
	if(!parent.langIsChinese()) {
		toMap = 1; //谷歌地图
	}
	setTimeout(function () {
		document.forms[0].action = "ReportNormalAction_summaryExcel.action?toMap="+toMap+"&exportType="+exportType;
		document.forms[0].submit();
	}, 0);
}

function exportLichengSummary() {
	exportReport(1);
}

function exportLichengSummaryCsv() {
	exportReport(2);
}

function exportLichengSummaryPdf() {
	exportReport(3);
}