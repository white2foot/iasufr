/**
 * Created by Anton on 02.03.14.
 * Для работы с линейными справочниками
 */

if (!window.Linear) Linear = {};
if (!Linear.Form) Linear.Form = {};

/* Пример вызова
 *
 Обязательные параметры
    opt.global = "^Frm"; - глобаль из которых брать данные.
    opt.path = "C"; - путь к ветке из которой брать данные. После этой ветки должна быть векта с id. Так же путь может содержать idOrg, тогда туда подставится текущая организация
    opt.header = "Код,Повна назва,Скорочена назва"; - Заголовки таблицы
 Не обязательные:
    opt.order = "id,1,2"; - порядок в котором выводить столбцы. id-выводить идентификатор
    opt.colWidths = "64,120,*"; - ширина столбцов таблицы
    opt.colAlign = "left,left,left"; - выравнивание столбцов
    opt.sortCol = 0; - колонка по коотрой сортировать
    opt.sortDir = "asc"; - направление сортировки
    opt.required = "1,0,1" - список полей который обязательные для ввода
    opt.addWidth = 300; - ширина окошка добавления новой записи
    opt.select = true; - открыть справочник на выбор
    opt.idOrg = 103; - Использовать вместо текущей организации указанную. Работает, когда в path есть idOrg
    opt.nameOrg = "Назва"; - Название организации для отображения в виде "(00644) Донецкий национальный университет". Используется вместе с idOrg
 События:
    opt.customClass = "fin.Org.cls"; - Заменить класс из которого заберать данные(редко необхходимо подменить функцию выборки на свою из другого класса. По-умолчанию берется функция Select)
    opt.customData = { func: "MyFunc", myId: 32 }; - Доп параметры, которые будут отпарвлены в функцию Select. Имеет смысл только при использовании customClass.
 Так же в них можно переопределить функцию Select, используя func.

 opt.onSelect(obj) - выбор записи

 */

Linear.Form.Create = function(opt) {
    var t = iasufr.initForm(this, opt);

    if (opt.selectMulti) opt.select = true;
    if (opt.colTypes) if (opt.colTypes.indexOf("cke") != -1) {
        CKEDITOR_BASEPATH = "/js/ckeditor/";
        iasufr.loadScripts(["/js/ckeditor/ckeditor.js", "/js/ckeditor/uk.js"]);
    }
    /* для тестаы
    opt.order = "id,1,2";
    opt.global = "^Frm";
    opt.path = "C";
    opt.header = "Код,Скорочена назва,Повна назва";
    opt.required = "1,1,1";
    opt.colWidths = "64,120,*";
    opt.colAlign = "left,left,left";
    opt.sortCol = 0;
    opt.sortDir = "asc";
    opt.canAddId = true;
    opt.addWidth = 400;
    //opt.select = false;
    */
//    opt.idOrgPos = 2;
    var isOrgMode = false;
    var idOrgToShow = opt.idOrg || iasufr.user.orgId;

    if (!opt.global) {
        iasufr.showError("Не вказана глобаль", Close);
        return;
    }
    if (!opt.path && !opt.customClass) {
        iasufr.showError("Не вказан путь", Close);
        return;
    }
    if (!opt.header) {
        iasufr.showError("Не вказан заголовок таблицi", Close);
        return;
    }
    if (opt.path) if (opt.path.indexOf("idOrg") !== -1) isOrgMode = true;

    var tb;
    if ((!opt.select || opt.dontHideButtons) && !opt.noToolbar) {
        tb = t.owner.attachToolbar();
        tb.setIconPath(iasufr.const.ICO_PATH);
        tb.setIconSize(32);
        if (isOrgMode) {
            if (opt.nameOrg)
                tb.addInput("org",null, opt.nameOrg, 300);
            else
                tb.addInput("org",null, "(" +  iasufr.user.orgCode + ") " + iasufr.user.orgName, 300);
            iasufr.attachSelector(tb.getInput("org"), "OrgSelector", {onSelect: OrgSelect, idOrg: idOrgToShow});
        }
        tb.addButton("add", 3, iasufr.lang.ui.add, "32/toolbar_add.png", "");
        tb.addButton("edit", 4, iasufr.lang.ui.edit, "32/toolbar_edit.png", "");
        tb.addButton("del", 5, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        tb.addButton("reload", 6, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        tb.addSeparator("sep2", 7);
        tb.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");
        tb.attachEvent("onClick", onToolbarClick);
    }
    if (opt.selectMulti) {
        tb = t.owner.attachToolbar();
        tb.setIconPath(iasufr.const.ICO_PATH);
        tb.setIconSize(32);
        tb.addButton("select", 3, iasufr.lang.ui.select, "32/tick.png", "");
        tb.addButton("reload", 6, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        tb.addSeparator("sep2", 7);
        tb.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");
        tb.attachEvent("onClick", onToolbarClick);
    }

    var str = "";
    var g = t.owner.attachGrid();
    var header = opt.header;
    if (opt.order) header = opt.header.split(",").slice(0, opt.order.split(",").length).join(",");
    g.setHeader(header);
    if (opt.colWidths) g.setInitWidths(opt.colWidths);
    if (opt.colAlign) g.setColAlign(opt.colAlign);
    str = "";
    if (opt.colType) str = opt.colTypes; else { for (var i = 0; i < opt.header.split(",").length; i++) str += "ro,"; str = str.substr(0, str.length - 1)}
    g.setColTypes(iasufr.replaceAll(str, "cke", "ro"));
    str = "";
    if (opt.colFilter) str = opt.colFilter; else { for (var i = 0; i < opt.header.split(",").length; i++) str += "#text_filter,"; str = str.substr(0, str.length - 1)}
    g.attachHeader(str);
    if (opt.colSorting) g.setColSorting(opt.colSorting);
    g.setImagePath(iasufr.const.IMG_PATH);
    g.enableMultiline(false);
    g.init();
    iasufr.enableRowselectMode(g);
    if (opt.select) {
        $(g.entBox).css("cursor", "pointer");
        g.enableRowsHover(true, "grid-row-hover");
        g.attachEvent("onRowSelect", onRowSelect);
    }

    this.grid = g;
    this.form = t;

    RefreshGrid();

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function OrgSelect(o) {
        if (o) {
            if (!o.isMessage) {
                idOrgToShow = parseInt(o.id);
                var ORG_NAME = "(" + o.code + ") " + o.name;
                tb.setValue("org", ORG_NAME);

                RefreshGrid();
            } /*else {
                tb.setValue("org", ORG_NAME);
            }*/
        }
    }

    function ShowAddForm(isEdit) {
        var selId = g.getSelectedId();
        var args = $.extend({}, opt);
        delete args.owner;
        if (opt.addWidth) args.width = opt.addWidth;
        if (opt.orderEd) args.order = opt.orderEd;
        if (isEdit) args.id = selId;
        args.onSave = RefreshGrid;
        args.sprav = opt.sprav;
        args.idOrg = idOrgToShow;
        iasufr.loadForm("LinearEdit", args);
    }

    function onRowSelect (){
        if (g.getSelectedCellIndex() == 0 && opt.selectMulti) {
            var v = g.cells(g.getSelectedId(), g.getSelectedCellIndex()).getValue();
            g.cells(g.getSelectedId(), g.getSelectedCellIndex()).setValue(v == 0 ? 1:0);
            return;
        }
        var res = GetRowData();
        if (!res) return;
        if (opt.onSelect) {
            if (opt.selectMulti)
                opt.onSelect([res]);
            else
                opt.onSelect(res);
        }
        Close();
    }

    function RefreshGrid(id) {
        iasufr.gridRowFocus(g, id);
        var data = {func: "Select", sprav: opt.sprav, idOrg: idOrgToShow };
        if (opt.customData) data = $.extend(data, opt.customData);
        iasufr.ajax({url: opt.customClass || "base.Linear.cls", data: data, success: onAfterLoad });
    }

    function onAfterLoad(data) {
        g.clearAll();
        if (data) g.parse(JSON.parse(data), 'json');
        if (opt.sortCol != undefined) {
            var sd = "asc";
            if (opt.sortDir) sd = opt.sortDir;
            var stype = "str";
            if (opt.colSorting) if (opt.colSorting.split(",")[opt.sortCol]) stype = opt.colSorting.split(",")[opt.sortCol];
            g.sortRows(opt.sortCol, stype, sd);
            g.setSortImgState(true, opt.sortCol, sd);
        }

        // Remove line breaks from cke fields
        var parts = opt.colTypes.split(",");
        parts.forEach(function(el, n) { if (el === "cke") {
            for (var i = 0; i < g.getRowsNum(); i++) {
                var cell = g.cells(g.getRowId(i), n);
                if (cell) {
                    var str = cell.getValue();
                    var tit = str;

                    var idx = str.indexOf("<br>");
                    if (idx !== -1) {
                        str = str.substr(0, idx);
                        cell.setValue(str);
                        cell.cell.innerHtml = str;
                        cell.setAttribute("title", tit);
                    }
                }
            }
        }});


        if (opt.selectMulti) {
            g.insertColumn(0, "", "ch", 24, "", "center");
        }
        if (!opt.select) iasufr.gridRowFocusApply(g);
    }

    function onToolbarClick(name) {
        switch (name) {
            case "reload": RefreshGrid(); break;
            case "add": ShowAddForm(false); break;
            case "edit": ShowAddForm(true); break;
            case "del": DeleteRecord(); break;
            case "close": iasufr.close(t); break;
            case "select": {
                var rows = g.getCheckedRows(0).split(",");
                var res = [];
                for (var r = 0; r < rows.length; r++) {
                    res.push([]);
                    for (var i = 1; i < g.getColumnsNum(); i++) {
                        res[res.length - 1].push(g.cells(rows[r], i).getValue());
                    }
                }
                if (opt.onSelect) opt.onSelect(res);
                Close();
            }
        }
    }

    function DeleteRecord() {
        var id = g.getSelectedRowId();
        if (!id) return;
        dhtmlx.confirm({
            text: iasufr.lang.msg.delete,
            callback: function(r) { if (r) iasufr.ajax({url: "base.Linear.cls", data:{func:"Delete", id: id, global: opt.global, path: opt.path, idOrg: idOrgToShow }, success: RefreshGrid}); }
        });
    }

    function GetRowData(){
        var id = g.getSelectedRowId();
        if (!id) return;
        var res = [];
        for (var i = opt.selectMulti ? 1:0; i < g.getColumnsNum(); i++) res.push(g.cells(id, i).getValue());
        return res;
    }

    function Close() {
        iasufr.close(t);
    }

    return this;
}
//@ sourceURL=/monu/base/linear.js