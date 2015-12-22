/**
 * Created by Anton on 27.02.14.
 */
if (!window.Frm) Frm = {};
if (!Frm.Form) Frm.Form = {};


Frm.Form.Create = function(opt) {
    var t = iasufr.initForm(this, opt);

    var tb = t.owner.attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(32);
    if (!opt.select) {
        tb.addButton("add", 1, "", "32/table_add.png", "");
        tb.addButton("edit", 2, "", "32/table_edit.png", "");
        tb.addButton("del", 3, "", "32/table_delete.png", "");
        tb.addSeparator("sep", 4);
        tb.addButton("design", 5, "", "32/table_design.png");
        tb.addButton("printsettings", 6, "", "32/font_red.png");
        tb.addButton("datecaptions", 6, "", "32/date_edit.png");
        //tb.addButton("kazn", 7, "", "32/table_import.png");
        tb.addButton("print", 8, "", "32/printer_empty.png");
        tb.addSeparator("sep", 9);
        tb.addText("txtD", 10, "Дата");

        tb.setItemToolTip("add", iasufr.lang.ui.add);
        tb.setItemToolTip("edit", iasufr.lang.ui.edit);
        tb.setItemToolTip("del", iasufr.lang.ui.delete);
        tb.setItemToolTip("design", "Дизайнер форм");
        tb.setItemToolTip("printsettings", "Параметри друку");
        tb.setItemToolTip("print", "Друку форми");
        tb.setItemToolTip("datecaptions", "Текстовi частини дат");
    }
    tb.addInput("date", 11, iasufr.formatDate(new Date()), 72);
    tb.addButton("reload", 12, "", "32/arrow_rotate_anticlockwise.png", "");
    tb.addSeparator("sep", 13);
    tb.addButton("close", 14, "", "32/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);

    //tb.setItemToolTip("kazn", "Згортання ДКСУ");
    tb.setItemToolTip("reload", iasufr.lang.ui.reload);
    tb.setItemToolTip("close", iasufr.lang.ui.close);

    /*var tbActions = t.owner.attachToolbar();
    tbActions.setIconPath(iasufr.const.ICO_PATH);
    tbActions.setIconSize(16);
    tbActions.addButton("design", 4, "Дизайнер", "32/table_design.png");
    tbActions.addButton("print", 5, "Параметри друку", "32/font_red.png");
    tbActions.addButton("kazn", 6, "Згортання ДКСУ", "32/table_import.png");*/


    var cal = new dhtmlXCalendarObject({input: tb.getInput("date")});
    cal.attachEvent("onClick", RefreshGrid);
    cal.hideTime();
    cal.setDateFormat("%d.%m.%Y");
    $(tb.getInput("date")).keydown(function(e){if (e.keyCode == 13) RefreshGrid()});

    var g = t.owner.attachGrid();
    g.setImagePath(iasufr.const.IMG_PATH);
    g.setHeader("Id,Код,Пер.,Пiдроздiл,Назва,З,По,Таблицi,Текстова,Експорт");
    g.setColumnIds("id,code,pr,dep,name,from,to,tables,istext,isExp");
    g.attachHeader("#rspan,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#rspan,#rspan,#text_filter");
    g.setInitWidths("0,40,40,100,*,64,64,0,0,64");
    g.setColAlign("center,center,center,left,left,center,center,center,center,center");
    g.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    g.setColSorting('str,str,str,str,str,str,str,str,str,str,str');
    g.init();
    g.enableHeaderMenu("true,true,true,true,true,true,true,true,true,true");

    if (opt.select) {
        g.enableRowsHover(true, "grid-row-hover");
        g.attachEvent("onRowSelect", onRowSelect);
        g.entBox.style.cursor = "pointer"
    }
    iasufr.enableRowselectMode(g);

    RefreshGrid();

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function onRowSelect() {
        if (!opt.select) return;
        var row = g.getSelectedId();
        if (!row) return;
        var id = g.cells(row, g.getColIndexById("id")).getValue();
        var code = g.cells(row, g.getColIndexById("code")).getValue();
        var name = g.cells(row, g.getColIndexById("name")).getValue();
        if (opt.onSelect) opt.onSelect({id: id, code: code, name: name});
        iasufr.close(t);
    }

    function onToolbarClick(name) {
        var row = g.getSelectedId();
        if (name == "add") iasufr.loadForm("FormAdd", {onSave: RefreshGrid});
        if (name == "del") DeleteFrom();
        if (name == "edit") {
            if (!row) return;
            var id = g.cells(row, g.getColIndexById("id")).getValue();
            var date = iasufr.formatDateStr(g.cells(row, g.getColIndexById("from")).getValue());
            iasufr.loadForm("FormAdd", {id: id, date: date, onSave: RefreshGrid});
        }
        if (name == "reload") RefreshGrid();
        if (name == "close") iasufr.close(t);
        if (name == "design") {
            if (!row) return;
            var isText = parseInt(g.cells(row, g.getColIndexById("istext")).getValue());
            if (isText) {
                var id = g.cells(row, g.getColIndexById("id")).getValue();
                var date = g.cells(row, g.getColIndexById("from")).getValue();
                iasufr.loadForm("DesignerTxt", {id: id, date: date });
            } else ChoseTable(function (id) {iasufr.loadForm("Designer", {id: id, maximized: false, width: g.entBox.offsetWidth, height: g.entBox.offsetHeight})});
        }
        if (name == "print") ShowPrintPreview();// ChoseTable(ShowPrintPreview);
        if (name == "printsettings") ChoseTable(ShowTableSettings);
        if (name == "datecaptions") ChoseTable(ShowDateCaptions);
           /* if (!row) return;
            var tables =  g.cells(row, g.getColIndexById("tables")).getValue();
            try {
                var tbl = JSON.parse(tables);
                if ($.isArray(tbl)) {
                    if (tbl.length == 1) {
                        var id = tbl[0].id;
                        if (id != undefined) iasufr.loadForm("Designer", {id: id});
                    } else {
                        CreateTableSelector(tbl, function (id) {iasufr.loadForm("Designer", {id: id})});
                    }
                }
            }catch(e) {
                iasufr.logError(e, "Помилка пошуку таблиць форми");
                return;
            }
        }*/
    }

    function ShowTableSettings(id, name) {
        if (!id) return;
        var row = g.getSelectedId();
        iasufr.loadForm("TableSettings", {path: "T,"+id+",H", title: "Параметри форми: (" + g.cells(row, g.getColIndexById("code")).getValue() + ") " + g.cells(row, g.getColIndexById("name")).getValue() + " - " + name});
    }

    function ShowDateCaptions(id, name) {
        if (!id) return;
        var row = g.getSelectedId();
        iasufr.loadForm("DateCaptions", {path: "T,"+id+",H", title: "Текстовi частини дат форми: (" + g.cells(row, g.getColIndexById("code")).getValue() + ") " + g.cells(row, g.getColIndexById("name")).getValue() + " - " + name});
    }

    function ChoseTable(onSelect) {
        var row = g.getSelectedId();
        if (!row) return;
        var tables = g.cells(row, g.getColIndexById("tables")).getValue();
        try {
            var tbl = JSON.parse(tables);
            if ($.isArray(tbl)) {
                if (tbl.length == 1) {
                    var id = tbl[0].id;
                    if (id != undefined) if (onSelect) onSelect(id, tbl[0].name);
                } else {
                    CreateTableSelector(tbl, onSelect);
                }
            }
        } catch(e) {
            iasufr.logError(e, "Помилка пошуку таблиць форми");
            return;
        }
    }

    function CreateTableSelector(tbl, onSelect) {
        var wnd = iasufr.wins.createWindow("ts" + new Date().valueOf(), 0, 0, 320, 180);
        wnd.denyPark();
        wnd.denyResize();
        wnd.setText("Оберить таблицю");
        wnd.setModal(true);
        wnd.centerOnScreen();

        var gr = wnd.attachGrid();
        gr.setImagePath(iasufr.const.IMG_PATH);
        gr.setHeader("Назва");
        gr.setColTypes("ro");
        $(gr.entBox).css("cursor", "pointer");
        gr.enableRowsHover(true, "grid-row-hover");
        gr.attachEvent("onRowSelect", onTableRowSelect);
        gr.init();

        for (var i = 0; i < tbl.length; i++) gr.addRow(tbl[i].id, tbl[i].name);

        function onTableRowSelect(r, c) {
            var id = gr.getSelectedId();
            if (id != undefined) if (onSelect) onSelect(id, gr.cells(r, 0).getValue());
            wnd.close();
        }
    }



    function RefreshGrid(id) {
        iasufr.gridRowFocus(g, id);
        var d = iasufr.formatDateStr(tb.getValue("date"));
        iasufr.ajax({url: "frm.Form.cls", data:{func:"Select", date: d },success: onAfterLoad});
    }

    function onAfterLoad(d) {
        g.clearAll();
        g.parse(JSON.parse(d),'json');
        g.sortRows(g.getColIndexById("code"),"str","asc");
        g.setSortImgState(true, g.getColIndexById("code"));
        iasufr.gridRowFocusApply(g);
        if (tb.getValue("date") == "") g.groupBy(g.getColIndexById("code"));
    }

    function DeleteFrom() {
        var row = g.getSelectedId();
        if (!row) return;
        var id = g.cells(row, g.getColIndexById("id")).getValue();
        var date = iasufr.formatDateStr(g.cells(row, g.getColIndexById("from")).getValue());
        dhtmlx.confirm({
            text: iasufr.lang.msg.delete,
            callback: function(r) { if (r) iasufr.ajax({url: "frm.Form.cls", data:{func:"Delete", id: id, date: date }, success: RefreshGrid}); }
        });
    }

    function ShowPrintPreview(id) {
        var row = g.getSelectedId();
        if (!row) return;
        var id = g.cells(row, g.getColIndexById("id")).getValue();
        var date = iasufr.formatDateStr(g.cells(row, g.getColIndexById("from")).getValue());


        var wnd = iasufr.wins.createWindow("fp" + new Date().valueOf(), 0, 0, 800, 600)
        wnd.maximize();
        wnd.setText("Попереднiй перегляд друку форми: (" +  g.cells(row, g.getColIndexById("code")).getValue() + ") " + g.cells(row, g.getColIndexById("name")).getValue());
        var l = new dhtmlXLayoutObject(wnd, "1C");
        l.cells("a").hideHeader();
        l.progressOn();
        //l.cells("a").attachURL("/base.Page.cls?iasu=1&class=frm.Table&func=PreviewPdf&pdfdownload=1&id=" + id);
        l.cells("a").attachURL("/base.Page.cls?iasu=1&class=frm.Form&func=PrintPreview&pdfdownload=1&id=" + id + "&date=" + date);
        $(l.cells("a").getFrame()).load(function() {l.progressOff();});
    }


    return this;
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/form/forms.js