/**
 * Created by Anton on 19.02.14.
 */
if (!window.History) window.History = {}
if (!History.Form) History.Form = {};

History.Form.Create = function(opt) {
    var t = iasufr.initForm(this, opt);

    var conf = "2U";
    var cell = "a";
    if (opt.global) conf = "1C";
    var l = new dhtmlXLayoutObject(t.owner, conf);
    l.cells("a").hideHeader();
    if (!opt.global) {
        cell = "b";
        l.cells("a").setWidth(100);
        l.cells("b").hideHeader();
    }

    var tb = l.attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(32);
    tb.addButton("reload", 1, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
    tb.addInput("global", 2, opt.global ? opt.global : "", 100);
    tb.addText("txtD", 3, "Дата");
    var dt = iasufr.formatDate(new Date());
    var fltId = "";
    if (opt.id) {
        dt = "";
        tb.hideItem("global");
        fltId = opt.id;
    }
    tb.addInput("date", 4, dt, 72);
    tb.addSeparator("sep", 5);
    tb.addButton("close", 6, iasufr.lang.ui.close, "32/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);

    var cal = new dhtmlXCalendarObject({input: tb.getInput("date")});
    cal.attachEvent("onClick", RefreshGrid);
    cal.hideTime();
    cal.setDateFormat("%d.%m.%Y");

    $(tb.getInput("date")).keydown(function(e){if (e.keyCode == 13) RefreshGrid()});
    $(tb.getInput("global")).keydown(function(e){if (e.keyCode == 13) RefreshGrid()});

    var g = l.cells(cell).attachGrid();

    g.setImagePath(iasufr.const.IMG_PATH);
    g.setHeader(",,Глобаль,Дата,Час,Користувач,Id,Старi данi");
    g.attachHeader("#rspan,#rspan,#rspan,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
    g.setInitWidths("0,24,100,64,64,120,32,*");
    g.setColAlign("center,center,center,center,center,left,center,left");
    g.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
    g.setColSorting('str,str,str,str,str,str,str,str,str');
    g.init();
    iasufr.enableRowselectMode(g);

    if (!opt.global) {
        var gl = l.cells("a").attachGrid();
        gl.setImagePath(iasufr.const.IMG_PATH);
        gl.setHeader("Глобали");
        gl.setColAlign("Left");
        gl.setColTypes("ro");
        gl.setColSorting("str");
        gl.init();
        gl.attachEvent("onRowSelect", function(){ UpdateFilter()});
        iasufr.ajax({ url: "base.History.cls", data: {func: "SelectGlobals"}, success: function(d) { ParseGlobals(d)}});
    } else RefreshGrid();

    function ParseGlobals(d) {
        try {
            var lst = JSON.parse(d);
            if (lst.json.length) for (var i = 0; i < lst.json.length; i++) gl.addRow(i + 1, [lst.json[i]], i);
        } catch(e){}
        gl.setSelectedRow(gl.getRowId(0));
        UpdateFilter();
    }

    function UpdateFilter() {
        var i = gl.getSelectedId();
        var txt = gl.cells(i, 0).getValue();
        tb.setValue("global", txt);
        RefreshGrid();
    }

    function RefreshGrid() {
        iasufr.gridRowFocus(g);
        var d = tb.getValue("date").split(".");
        iasufr.ajax({url: "base.History.cls", data: {func: "Select", date: d[2]+d[1]+d[0], global: tb.getValue("global"), id: fltId}, success: onAfterLoad});
    }

    function onAfterLoad(d) {
        g.clearAll();
        g.parse(JSON.parse(d),'json');
        $(tb.getInput("global")).blur();
        $(tb.getInput("date")).blur();
        g.sortRows(0,"str","desc");
        g.setSortImgState(true,0,"desc");
        iasufr.gridRowFocusApply(g);
        UpdateLinks();
    }

    function UpdateLinks() {
        var cnt = g.getRowsNum();
        for (var i = 0; i < cnt; i++) {
            var txt = g.cells2(i, 5).getValue();
            g.cells2(i, 5).setValue('<a href="#'+txt+'" onclick="iasufr.loadForm(\'UserAdd\',{Login:\''+txt+'\', view: true, modal: true})">'+txt+'</a>');
            var oper = g.cells2(i, 1).getValue();
            switch (oper.substr(oper.length - 1, 1)) {
                case "0": g.cells2(i, 1).setValue('<img title="У системi" src="/images/icons/16/plus.png" style="vertical-align: middle; float: left">'); break;
                case "1": g.cells2(i, 1).setValue('<img title="У системi" src="/images/icons/16/pencil.png" style="vertical-align: middle; float: left">'); break;
                case "2": g.cells2(i, 1).setValue('<img title="У системi" src="/images/icons/16/cross.png" style="vertical-align: middle; float: left">'); break;
                case "3": g.cells2(i, 1).setValue('<img title="У системi" src="/images/icons/16/bullet_delete.png" style="vertical-align: middle; float: left">'); break;
                case "4": g.cells2(i, 1).setValue('<img title="У системi" src="/images/icons/16/tick.png" style="vertical-align: middle; float: left">'); break;
                case "5": g.cells2(i, 1).setValue('<img title="У системi" src="/images/icons/16/textfield_delete.png" style="vertical-align: middle; float: left">'); break;
                case "6": g.cells2(i, 1).setValue('<img title="У системi" src="/images/icons/16/group_edit.png" style="vertical-align: middle; float: left">'); break;
            }
        }
        //g.setcol("ro,img,ro,ro,ro,ro,ro,ro");
    }

    function onToolbarClick(name){
        if (name == "reload") RefreshGrid();
        if (name == "close") iasufr.close(t);
    }

    return this;
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/base/hsiroty.js