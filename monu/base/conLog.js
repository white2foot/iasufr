/**
 * Created by Anton on 19.02.14.
 */
if (!window.ConLog) window.ConLog = {}
if (!ConLog.Form) ConLog.Form = {};

ConLog.Form.Create = function(opt) {
    var t = iasufr.initForm(this, opt);
    var l = new dhtmlXLayoutObject(t.owner, "2E");

    l.cells("b").setHeight(300);
    l.cells("a").hideHeader();
    l.cells("b").setText("Входили в систему за останніх 7 днів");
    var tb = l.cells("a").attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(32);
    tb.addButton("reload", 1, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
    tb.addText("txtD", 3, "Дата");
    var dt = iasufr.formatDate(new Date());
    var fltId = "";
    tb.addInput("date", 4, dt, 72);
    tb.addSeparator("sep", 5);
    tb.addButton("close", 6, iasufr.lang.ui.close, "32/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);

    var cal = new dhtmlXCalendarObject({input: tb.getInput("date")});
    cal.attachEvent("onClick", RefreshGrid);
    cal.hideTime();
    cal.setDateFormat("%d.%m.%Y");

    $(tb.getInput("date")).keydown(function(e){if (e.keyCode == 13) RefreshGrid()});

    var g = l.cells("a").attachGrid();
    g.setImagePath(iasufr.const.IMG_PATH);
    g.setHeader("Дата,Час входу,Час виходу,Користувач,Адреса");
    g.attachHeader("#rspan,#text_filter,#text_filter,#text_filter,#text_filter");
    g.setInitWidths("64,72,72,*,*");
    g.setColAlign("center,center,center,left,left");
    g.setColTypes("ro,ro,ro,ro,ro");
    g.setColSorting('str,str,str,str');
    g.init();
    iasufr.enableRowselectMode(g);
    var chartConf = {
        view: "bar",
        gradient: "rising",
        radius: 0,
        xAxis: {
            template: "#date#"
        },
        yAxis: {
            start: 0,
            end: 100,
            step: 10
        },
        legend: {
            values: [{
                text: "Унікальних користувачiв",
                color: "#a7ee70"
            }, {
                text: "Вхiдiв усього",
                color: "#36abee"
            }],
            valign: "top",
            align: "right",
            layout: "x"
        }
    }
    var barChart = l.cells("b").attachChart(chartConf);

    barChart.addSeries({
        value: "#unique#",
        color: "#a7ee70",
        label: "#unique#",
        tooltip: {
            template: "Унікальних користувачiв: #unique#"
        }
    });
    barChart.addSeries({
        value: "#total#",
        color: "#36abee",
        label: "#total#",
        tooltip: {
            template: "Вхiдiв усього: #total#"
        }
    });

    RefreshGrid();

    function RefreshGrid() {
        iasufr.gridRowFocus(g);
        var d = tb.getValue("date").split(".");
        iasufr.ajax({url: "ac.Usr.cls", data: {func: "SelectConLog", date: d[2]+d[1]+d[0] }, success: onAfterLoad});
    }

    function onAfterLoad(d) {
        g.clearAll();
        var data = JSON.parse(d);
        g.parse(data.json.grid,'json');
        barChart.clearAll();
        barChart.parse(data.json.graphData, "json");
        $(tb.getInput("date")).blur();
        g.sortRows(1,"str","desc");
        g.setSortImgState(true,1,"desc");
        iasufr.gridRowFocusApply(g);
        UpdateLinks();
    }

    function UpdateLinks() {
        var cnt = g.getRowsNum();
        for (var i = 0; i < cnt; i++) {
            var txt = g.cells2(i, 3).getValue();
            g.cells2(i, 3).setValue('<a href="#'+txt+'" onclick="iasufr.loadForm(\'UserAdd\',{Login:\''+txt+'\', view: true, modal: true})">'+txt+'</a>');
        }
    }


    function onToolbarClick(name){
        if (name == "reload") RefreshGrid();
        if (name == "close") iasufr.close(t);
    }

    return this;
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/base/conLog.js