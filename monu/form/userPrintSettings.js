if (!window.Frm) Frm = {};
if (!Frm.UserPrintSettings) Frm.UserPrintSettings = {};

Frm.UserPrintSettings.Create = function(opt) {
    var t = iasufr.initForm(this, opt);

    if (opt.idZvit == undefined) {
        iasufr.close(t);
        iasufr.alert("Не вказан idZvit");
        return;
    }
    t.idZvit = opt.idZvit;
    t.tableData = {};

    var l = new dhtmlXLayoutObject(t.owner, "2E");

    var tb =  l.cells("a").attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(16);
    tb.addButton("save", 1, iasufr.lang.ui.save, "16/database_save.png", "");
    tb.addButton("close", 6, iasufr.lang.ui.close, "16/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);

    l.cells("a").setHeight(64);
    l.cells("a").fixSize(true, true);
    l.cells("a").hideHeader();
    l.cells("a").attachHTMLString("Введіть ширину стовпчиків у %. Незаповненi стовбчики будут використовувати ширину яка залишиться.<br>Приклад: 10, 50, &nbsp;&nbsp;,20");

    var tabs;
    LoadData();


    function onToolbarClick(name) {
        if (name == "save") Save();
        if (name == "close") iasufr.close(t);
    }

    function Save() {
        var data = [];
        for (var k = 0; k < t.tableData.tables.length; k++) {
            var g = t.tableData.tables[k].grid;
            var str = "";
            for (var c = 0; c < g.getColumnsNum(); c++) {
                var idRow = g.getRowId(0);
                var value = g.cells(idRow, c).getValue();
                iasufr.replaceAll(value, "%", "");
                iasufr.replaceAll(value, ",", "");
                iasufr.replaceAll(value, ".", "");
                if (isNaN(parseInt(value))) value = "";
                str += value + "•";
            }
            str = str.substr(0, str.length - 1);
            data.push({ idTable: t.tableData.tables[k].id, widths: str });
        }
        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: "SaveUserPrintSettings", data: JSON.stringify(data) },
            success: onSuccess,
            error: function(){t.owner.progressOff()}
        });
    }

    function onSuccess() {
        t.owner.progressOff();
        iasufr.messageSuccess("Данi збережено");
        iasufr.disableAskBeforClose(t);
    }

    function LoadData() {
        if (t.idZvit == undefined) {
            iasufr.showError("Не вказан idZvit");
        }
        t.owner.progressOn();
        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: "LoadUserPrintSettings", id: t.idZvit },
            success: FillData,
            error: function(){t.owner.progressOff()}
        });
    }

    function FillData(txt, o) {
        t.owner.progressOff();
        if (t.owner.isWindow) t.owner.setText("Налаштування друку. Форма (" + o.json.inputData.formCode + ") " + o.json.inputData.formName);
        t.tableData = o.json.inputData;

        if (t.tableData.tables) if (t.tableData.tables.length > 0) {
            tabs = l.cells("b").attachTabbar();
            tabs.setImagePath(iasufr.const.IMG_PATH);

            for (var i = 0; i < t.tableData.tables.length; i++) {
                tabs.addTab(t.tableData.tables[i].id, t.tableData.tables[i].name, 200);

                var g =  tabs.cells(t.tableData.tables[i].id).attachGrid();
                g.setImagePath(iasufr.const.IMG_PATH);
                g.setHeader("");
                g.setInitWidths("*");
                g.setColAlign("left");
                g.setColTypes("ed");
                g.enableColumnMove(true);
                g.enableMultiline(true);
                g.init();
                //g.attachEvent("onEditCell", onEditCell);
                //g.attachEvent("onRowDblClicked", onGridClick);

                t.tableData.tables[i].grid = g;

                try {
                    var fd = new FormUtils(t.tableData.tables[i]);
                    fd.buildGrid(g, true, true);
                    g.detachEvent(fd.evt1);
                    g.addRow(0, "");
                    g.tableData = fd;
                    if (o.json.widths[t.tableData.tables[i].id.toString()]) {
                        var parts = o.json.widths[t.tableData.tables[i].id.toString()].split(",");
                        for (var p = 0; p < parts.length; p++) g.cells(0, p).setValue(parts[p]);
                    }
                    //for (var k = 0; k < g.getRowsNum() - 1; k++) g.deleteRow(g.getRowId(0));
                    /*if (t.tableData.tables[i].inputData.length != 0) {
                        for (var k = 0; k < t.tableData.tables[i].inputData.length; k++) {
                            var cell = t.tableData.tables[i].inputData[k];
                            if (!IsDataFixed(cell.idRow, cell.idCol, i)) g.cells(cell.idRow, g.getColIndexById(cell.idCol)).setValue(fd.formatValue(cell.value, fd.getCellData(cell.idRow, cell.idCol).type));
                        }
                    }
                    if (!t.isKazn) fd.recalcFormulas();*/
                    delete fd;
                } catch (e) {
                    console.log("Error: " + e.toString());
                }


            }

            tabs.setTabActive(t.tableData.tables[0].id);
        }
    }
};
//@ sourceURL=/monu/form/userPrintSettings.js
