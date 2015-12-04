// Исправлена работа с функциями. Ошибка при отсутствии прав
if (!window.Frm) window.Frm = {}
if (!Frm.WorkWithForms) Frm.WorkWithForms = {};

Frm.WorkWithForms.Create = function(opt) {

    var t = iasufr.initForm(this, opt);
    var dhxLayout;
    var ID_ORG = iasufr.user.orgId;
    var ORG_NAME = "(" + iasufr.user.orgCode+") " + iasufr.user.orgName;
    var storedIdOrg = iasufr.storeGet("wwfIdOrg");
    var storedOrgName = iasufr.storeGet("wwfOrgName", ORG_NAME);
    if (storedIdOrg && storedOrgName) {
        ID_ORG = storedIdOrg;
        ORG_NAME = storedOrgName;
    }

    dhxLayout = new dhtmlXLayoutObject(t.owner,"2E");
    this.l = dhxLayout;
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").hideHeader();

    dhxLayout.cells("a").setHeight(32);

    var tb1 = dhxLayout.cells("a").attachToolbar();
    tb1.setIconSize(32);
    tb1.setIconPath(iasufr.const.ICO_PATH);
    tb1.addInput("org",null, ORG_NAME, 500);
    iasufr.attachSelector(tb1.getInput("org"), "OrgSelector", {onSelect: OrgSelect, idOrg: iasufr.user.orgId});
    tb1.addSeparator("sep1", null);
    tb1.addButton("reload",null, /*iasufr.lang.ui.reload*/"", "32/arrow_rotate_anticlockwise.png","")
    tb1.addButton("add", null, /*iasufr.lang.ui.edit*/"", "32/page_white_add.png", "");
    tb1.addButton("edit", null, /*iasufr.lang.ui.edit*/"", "32/edit_button.png", "");
    tb1.addButton("print", null, "", "32/printer_empty.png", "");
    tb1.addSeparator("sep1", null);
    if (iasufr.pFunc("zvCanEditKazn")) tb1.addButton("editKazn", null, /*iasufr.lang.ui.edit*/"", "32/edit_kazn.png", "");
    tb1.addButton("printKazn", null, "", "32/printer_book.png", "");
    //tb1.addButton("print",null, /*iasufr.lang.ui.print*/"", "32/printer_empty.png","")

    tb1.setItemToolTip("add", "Ввести новий звiт");
    tb1.setItemToolTip("edit", iasufr.lang.ui.edit);
    if (iasufr.pFunc("zvCanEditKazn")) tb1.setItemToolTip("editKazn", iasufr.lang.ui.edit + " казначейську форму");
    tb1.setItemToolTip("reload", iasufr.lang.ui.reload);
    tb1.setItemToolTip("print", iasufr.lang.ui.print);
    tb1.setItemToolTip("printKazn", iasufr.lang.ui.print + " казначейськой форми");
    //tb1.setItemToolTip("print", iasufr.lang.ui.print);
    //tb1.setItemToolTip("delete", iasufr.lang.ui.delete);

    tb1.attachEvent("onClick", onUserToolbarClick);

    var toolbar = dhxLayout.cells("b").attachToolbar();

    toolbar.setIconPath(iasufr.const.ICO_PATH);
    //toolbar.setIconSize(32);
    //iasufr.attachButton(temp,'');
    toolbar.addText("date_label",null,"Станом на 01");
    var actionsList = [];
    actionsList.push(['1',  'obj', "Січня"]);
    actionsList.push(['2',  'obj', "Лютого"]);
    actionsList.push(['3',  'obj', "Березеня"]);
    actionsList.push(['4',  'obj', "Квітня"]);
    actionsList.push(['5',  'obj', "Травня"]);
    actionsList.push(['6',  'obj', "Червня"]);
    actionsList.push(['7',  'obj', "Липня"]);
    actionsList.push(['8',  'obj', "Серпня"]);
    actionsList.push(['9',  'obj', "Вересня"]);
    actionsList.push(['10', 'obj', "Жовтня"]);
    actionsList.push(['11', 'obj', "Листопада"]);
    actionsList.push(['12', 'obj', "Грудня"]);
    toolbar.addButtonSelect("month", 1, "", actionsList, "", "", true, true, 13, "select");
    toolbar.setListOptionSelected("month", iasufr.storeGet("wwfMonth") || new Date().getMonth() + 1);
    //toolbar.setListOptionSelected("month", 6);
    toolbar.addInput("year", null, iasufr.storeGet("wwfYear") || new Date().getFullYear(), 50);
    $(toolbar.getInput("year")).on("keypress", function(e) {
        if (e.charCode == 13) {
            $(e.target).blur();
            iasufr.storeSet("wwfYear", toolbar.getValue("year"));
            RefreshGrid();
        }
    });
    toolbar.addSeparator("sep1", null);
    if (iasufr.pFunc("zvCanViewDel")) toolbar.addButtonTwoState("showDeleted", null, "Видаленi");
    if (iasufr.pFunc("zvCanViewZved")) toolbar.addButtonTwoState("showZved", null, "Зведенi");
    toolbar.addSeparator("sep1", null);

    /*var menu = dhxLayout.cells("c").attachMenu();
     menu.addNewSibling(null, "obj", "Додатковi дії", false,"/images/icons/16/lightning.png");

     menu.addNewChild("obj", 0, "delete", iasufr.lang.ui.delete, false);
     if (iasufr.pFunc("zvCanRestore")) menu.addNewChild("obj", 1, "undelete", "Востановити", false);
     menu.addNewSeparator("undelete",2);
     if (iasufr.pFunc("zvCanCommit"))   menu.addNewChild("obj", 3, "commit", "Пiдтвердити", false);
     if (iasufr.pFunc("zvCanUncommit")) menu.addNewChild("obj", 4, "uncommit", "Зняти підтвердження", false);
     if (iasufr.pFunc("zvCanSend"))     menu.addNewChild("obj", 5, "send", "Вiдправити", false);
     if (iasufr.pFunc("zvCanReturn"))   menu.addNewChild("obj", 6, "unsend", "Повернути до НЗ", false);
     if (iasufr.pFunc("zvCanAccept"))   menu.addNewChild("obj", 7, "accept", "Прийняти", false);
     if (iasufr.pFunc("zvCanUnaccept")) menu.addNewChild("obj", 8, "unaccept", "Не приймати", false);
     menu.addNewSeparator("unaccept",9);
     menu.addNewChild("obj", 10, "check", "Перевiрити", false);
     menu.addNewChild("check", 11, "check_3", "Пiдтвердженi", false);
     menu.addNewChild("check", 15, "check_2", "Вiдправленi", false);
     menu.addNewChild("check", 19, "check_4", "Прийнятi", false);
     menu.addNewChild("check", 23, "check_0", "Усi звiти", false);

     menu.addNewChild("obj", 30, "recalc", "Перерахувати", false);
     menu.addNewChild("obj", 31, "printsettings", "Параметри друку", false);

     menu.attachEvent("onStateChange", onToolbarStateChange);
     menu.attachEvent("onClick", onUserToolbarClick);
     */
    actionsList = [];

    actionsList.push(['check_3', 'obj', 'Пiдтвердженi', '']);
    actionsList.push(['check_2', 'obj', 'Вiдправленi', '']);
    actionsList.push(['check_4', 'obj', 'Прийнятi', '']);
    actionsList.push(['check_0', 'obj', 'Усi звiти', '']);
    toolbar.addButtonSelect("actions0", null, "Перевiрити", actionsList, "", "", "", true);
    toolbar.addSeparator("sep2", null);

    actionsList = [];
    actionsList.push(['exp__0', 'obj', 'Файл BtGot - для всiх звiтiв', '']);
    actionsList.push(['exp_4_0', 'obj', 'Файл BtGot - прийнятi', '']);
    actionsList.push(['exp_2_0', 'obj', 'Файл BtGot - вiдправленi', '']);
    actionsList.push(['exp_3_0', 'obj', 'Файл BtGot - пiдтвердженi', '']);
    actionsList.push(['seporator']);
    actionsList.push(['exp__1', 'obj', 'Файл BtGot загальний - для всiх звiтiв', '']);
    actionsList.push(['exp_4_1', 'obj', 'Файл BtGot загальний - прийнятi', '']);
    actionsList.push(['exp_2_1', 'obj', 'Файл BtGot загальний - вiдправленi', '']);
    actionsList.push(['exp_3_1', 'obj', 'Файл BtGot загальний - пiдтвердженi', '']);
    toolbar.addButtonSelect("actions2", null, "Ехпорт", actionsList, "", "", "", true);
    toolbar.addSeparator("sep3", null);
    toolbar.addButton("import", 54, "Iмпорт");
    toolbar.addSeparator("sep4", null);
    actionsList = [];
    actionsList.push(['delete', 'obj', iasufr.lang.ui.delete, '']);
    if (iasufr.pFunc("zvCanRestore")) actionsList.push(['undelete', 'obj', "Востановити", '']);
    if (iasufr.pFunc("zvCanEdit"))    actionsList.push(['editTitle', 'obj', "Змiнити реквизити", '']);

    if (iasufr.pFunc("zvCanViewLog")) actionsList.push(['viewLog', 'obj', "Перегляд iсторії", '']);
    actionsList.push(['seporator']);
    if (iasufr.pFunc("zvCanCommit")) actionsList.push(['commit', 'obj', "Пiдтвердити", '']);
    if (iasufr.pFunc("zvCanUncommit")) actionsList.push(['uncommit', 'obj', "Зняти підтвердження", '']);
    if (iasufr.pFunc("zvCanSend")) actionsList.push(['send', 'obj', "Вiдправити", '']);
    if (iasufr.pFunc("zvCanReturn")) actionsList.push(['unsend', 'obj', "Повернути до НЗ", '']);
    if (iasufr.pFunc("zvCanAccept")) actionsList.push(['accept', 'obj', "Прийняти", '']);
    if (iasufr.pFunc("zvCanUnaccept")) actionsList.push(['unaccept', 'obj', "Не приймати", '']);
    actionsList.push(['seporator']);

    actionsList.push(['recalc', 'obj', "Перерахувати", '']);
    actionsList.push(['printsettings', 'obj', "Параметри друку", '']);
    var t=iasufr.pFunc("zvCanDod23")

    if (iasufr.pFunc("zvCanDod23")){
        actionsList.push(['seporator2']);
        actionsList.push(['d23', 'obj', "Зробити додаток д23 (прийнятi)", '']);

    }
    toolbar.addButtonSelect("actions", null, "Дії", actionsList, "16/lightning.png", "", "disabled", true);

    toolbar.addButton("settings", null, "Опції", "16/wrench.png", "");

    toolbar.attachEvent("onStateChange", onToolbarStateChange);
    toolbar.attachEvent("onClick", onUserToolbarClick);


    //var toolbar2 = dhxLayout.cells("a").attachToolbar();
    //toolbar2.addButton("edit2", null, iasufr.lang.ui.edit, "32/page_white_edit.png", "");
    /* toolbar2.setIconPath(iasufr.const.ICO_PATH);
     toolbar2.setIconSize(32);
     toolbar2.addInput("orgView",null,"("+iasufr.user.orgCode+")"+iasufr.user.orgName,200);*/

    var grid = dhxLayout.cells("b").attachGrid();
    grid.setColumnIds("sel,idZvit,status,prog,code,fond,type,form,isDel,isZved,lastchange");
    grid.setHeader("#master_checkbox,idZvit,Статус,Программа,Код,Фонд,Вид,Форма,Видалений,Зведений,Остання змiна");
    grid.setInitWidths("20,0,70,70,48,70,70,*,0,0,230");
    grid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    grid.setColAlign("center,right,center,center,center,center,center,left,center,center,left");
    grid.setColSorting('str,str,str,str,str,str,str,str,str,str,str,str,str');
    iasufr.enableRowselectMode(grid);
    grid.init();
    grid.enableHeaderMenu("false,true,true,true,true,true,true,true,false,false,true");
    //grid.enableAutoHiddenColumnsSaving("gWorkWithForms");
    //grid.loadHiddenColumnsFromCookie("gWorkWithForms");
    grid.attachEvent("onRowSelect", onRowSelect);


    // process passed parameters
    var passedIdOrg = iasufr.getParam("idOrg") || opt.idOrg;
    if (passedIdOrg) {
        ID_ORG = passedIdOrg;
        ORG_NAME = decodeURI(iasufr.getParam("orgName")) ||  opt.orgName;
        tb1.setValue("org", ORG_NAME);
    }

    var passedDate = iasufr.getParam("dateInput") || opt.dateInput;
    if (passedDate) {
        var parts = passedDate.split(".");
        toolbar.setListOptionSelected("month", +parts[1]);
        toolbar.setValue("year", parts[2]);
    }
    var passedIdZvid = iasufr.getParam("idZvit");

    RefreshGrid();




    /* var myContextMenu1 = new dhtmlXMenuObject({
     parent: "contextZone_A",
     icons_path: "../common/imgs/",
     context: true
     });
     myContextMenu1.addNewChild(myContextMenu1.topId, 0, "open", "Open", false, "open.gif");
     myContextMenu1.addNewChild(myContextMenu1.topId, 1, "save", "Save", false, "save.gif");
     myContextMenu1.addNewChild(myContextMenu1.topId, 3, "close", "Close", false, "close.gif");
     */
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////Function////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    function ViewLog() {
        var selRow = grid.getSelectedRowId();
        if (selRow == undefined || selRow == null) {
            iasufr.alert("Спочатку оберить звiти");
            return;
        }
        iasufr.loadForm("ZvitLog", {customData: { func: "SelectLog", idZvit: selRow }})
    }

    function onRowSelect() {
        var cidx =  grid.getColIndexById("sel")
        for (var i = 0; i < grid.getRowsNum(); i++) {
            var rid = grid.getRowId(i);
            grid.cells(rid, cidx).setValue(0);
        }
        grid.cells(grid.getSelectedRowId(), cidx).setValue(1);
    }

    function RefreshGrid() {
        var m = toolbar.getListOptionSelected("month");
        var showDeleted = 0;
        var showZved = 0;
        if (toolbar.getType("showDeleted") != null) showDeleted = toolbar.getItemState("showDeleted") ? 1 : 0;
        if (toolbar.getType("showZved") != null) showZved = toolbar.getItemState("showZved") ? 1 : 0;
        iasufr.ajax({url: "frm.Work.cls", data: {func: "Select", month: m, year: toolbar.getValue("year"), idOrg: ID_ORG, showDeleted: showDeleted, showZved: showZved }, success: onAfterLoad});
    }

    function onAfterLoad(d) {
        iasufr.gridRowFocus(grid);
        grid.clearAll();
        grid.parse(JSON.parse(d),'json');

        grid.sortRows(grid.getColIndexById("code"), "str","asc");
        grid.setSortImgState(true, grid.getColIndexById("code"));
        for (var i = 0; i < grid.getRowsNum(); i++) {
            var rid = grid.getRowId(i);

            var isZved = grid.cells(rid, grid.getColIndexById("isZved")).getValue();
            if (isZved == 1) grid.setRowTextStyle(rid, "color: green");

            var isDel = grid.cells(rid, grid.getColIndexById("isDel")).getValue();
            if (isDel == 1) grid.setRowTextStyle(rid, "color: red");

            var status = grid.cells(rid, grid.getColIndexById("status")).getValue();
            if (status == "Вiдправлено")  grid.setCellTextStyle(rid, grid.getColIndexById("status"), "font-weight:bold;color: green");
            if (status == "Пiдтверджено")  grid.setCellTextStyle(rid, grid.getColIndexById("status"), "color: green");
            if (status == "Прийнято")  grid.setCellTextStyle(rid, grid.getColIndexById("status"), "background-color: rgb(134, 236, 134)");
            if (status == "Не прийнято")  grid.setCellTextStyle(rid, grid.getColIndexById("status"), "background-color: rgb(236, 134, 134)");


        }
        if (passedIdZvid) {
            grid.setSelectedRow(passedIdZvid);
            passedIdZvid = null;
        } else iasufr.gridRowFocusApply(grid);
        //if (tb.getValue("date") == "") g.groupBy(g.getColIndexById("code"));
    }

    function OrgSelect(o) {
        if (o) {
            if (!o.isMessage) {
                ID_ORG = parseInt(o.id);
                ORG_NAME = "(" + o.code + ") " + o.name;
                tb1.setValue("org", ORG_NAME);

                iasufr.storeSet("wwfIdOrg", ID_ORG);
                iasufr.storeSet("wwfOrgName", ORG_NAME);
                RefreshGrid();
            } else {
                tb1.setValue("org", ORG_NAME);
            }
        }
    }

    function Delete() {
        var rows = grid.getCheckedRows(grid.getColIndexById("sel"));
        if (!rows) {
            var selRow = grid.getSelectedRowId();
            if (selRow == undefined || selRow == null) {
                iasufr.alert("Спочатку оберить звiти");
                return;
            }
            rows = [selRow];
        } else rows = rows.split(",");

        if ($.isArray(rows)) {
            iasufr.confirm("Видалити звiти?", function() {
                iasufr.ajax({ url: "frm.Work.cls", data: {func: "Delete", ids: JSON.stringify(rows) }, success: RefreshGrid })
            });
        } else iasufr.alert("Спочатку оберить звiти");
    }

    function UnDelete() {
        var rows = grid.getCheckedRows(grid.getColIndexById("sel"));
        if (!rows) {
            var selRow = grid.getSelectedRowId();
            if (selRow == undefined || selRow == null) {
                iasufr.alert("Спочатку оберить звiти");
                return;
            }
            rows = [selRow];
        } else rows = rows.split(",");

        if ($.isArray(rows)) {
            iasufr.confirm("Востановити звiти?", function() {
                iasufr.ajax({ url: "frm.Work.cls", data: {func: "UnDelete", ids: JSON.stringify(rows) }, success: RefreshGrid })
            });
        } else iasufr.alert("Спочатку оберить звiти");
    }

    function Recalc() {
        var rows = grid.getCheckedRows(grid.getColIndexById("sel"));
        if (!rows) {
            var selRow = grid.getSelectedRowId();
            if (selRow == undefined || selRow == null) {
                iasufr.alert("Спочатку оберить звiти");
                return;
            }
            rows = [selRow];
        } else rows = rows.split(",");

        if ($.isArray(rows)) {
            iasufr.confirm("Перерахувати звiти?", function() {
                iasufr.ajax({ url: "frm.Work.cls", data: {func: "Recalc", ids: JSON.stringify(rows) }, success: RefreshGrid })
            });
        } else iasufr.alert("Спочатку оберить звiти");
    }

    function SetState(status, action) {
        var rows = grid.getCheckedRows(grid.getColIndexById("sel"));
        if (!rows) {
            var selRow = grid.getSelectedRowId();
            if (selRow == undefined || selRow == null) {
                iasufr.alert("Спочатку оберить звiти");
                return;
            }
            rows = [selRow];
        } else rows = rows.split(",");

        if ($.isArray(rows)) {
            //iasufr.confirm("Востановити звiти?", function() {
            iasufr.ajax({ url: "frm.Work.cls", data: {func: "SetState", status: status, action: action, ids: JSON.stringify(rows) }, success: RefreshGrid })
            //});
        } else iasufr.alert("Спочатку оберить звiти");
    }

    function onToolbarStateChange(name) {
        RefreshGrid();
    }

    function PrintReports(isKazn) {
        var rows = grid.getCheckedRows(grid.getColIndexById("sel"));
        if (!rows) {
            var selRow = grid.getSelectedRowId();
            if (selRow == undefined || selRow == null) {
                iasufr.alert("Спочатку оберить звiти");
                return;
            }
            rows = [selRow];
        } else rows = rows.split(",");

        if (!$.isArray(rows)) rows = [rows];
        var code = grid.cells(rows[0], grid.getColIndexById("code")).getValue();

        iasufr.loadForm("PrintForm", {ids: rows, isKazn: isKazn ? 1: 0, code: code });
    }
    //проверка отчетов
    function check(paramCheck){
        //1)параметры
        if (!paramCheck) return

        var selRow = grid.getCheckedRows(grid.getColIndexById("sel"));
        if (!selRow) {selRow = selRow=""}

        var m = toolbar.getListOptionSelected("month"); if (m.length==1)m="0"+m;
        var y=toolbar.getValue("year");
        var date1Zvit=y+m+"01";

        //2)выполнить проверку (з помилками=2)
        var strStatus=" (за статусом - усi)";
        if (paramCheck.param.idStatus==4) strStatus=" (за статусом - прийнятi)"
        else if (paramCheck.param.idStatus==2) strStatus=" (за статусом - вiдправленi)"
        else if (paramCheck.param.idStatus==3) strStatus=" (за статусом - пiдтвердженi)"

        if (paramCheck.param.typeCheck==undefined){
            var paramFiltrs=[["idOrg","idZvit","date1Zvit","idStatus","typeCheck"],[ID_ORG,selRow,date1Zvit,paramCheck.param.idStatus,1]];
            iasufr.ajax({
                url: "base.Simple.cls",
                data: {func: "init",idDoc:"CheckOrgReports",idLayout:"T1",param:JSON.stringify(paramFiltrs)},
                success: function (data) {

                    var json = JSON.parse(data);
                    var countError=json.retMess;
                    if (countError==-1){
                        iasufr.alert("Вибачте, але обрані звіти не беруть участь в жодній перевірці"+strStatus);
                    }
                    else {

                        var mess=[{type: "settings", position: "label-right"},{type: "label", label:"Переглянути результати?"}];
                        var messErr="Виконання перевiрок завершилось без помилок"+strStatus;
                        if (countError>0){
                            messErr="Виконання перевiрок завершилось з помилками : "+countError+" звiтiв"+strStatus;
                            mess.push({type: "radio", name:"typeCheck",value:2, label: "З помилками"});
                        }
                        mess.push({type: "radio", name:"typeCheck",value:3, label: "Без помилок"});
                        //mess.push({type: "radio", name:"typeCheck",value:1, label: "Усi"});
                        iasufr.loadForm("Confirm", {title: messErr,mess:mess,onSelect:check,param:{idStatus:paramCheck.param.idStatus},modal:true,width:560,height:150});
                    }

                }
            })
        }
        //3)открыть проверку
        else {
            iasufr.loadForm("CheckOrgReports",{ param:[["idOrg","idZvit","date1Zvit","idStatus","typeCheck"],[ID_ORG,selRow,date1Zvit,paramCheck.param.idStatus,paramCheck.param.typeCheck]]});
        }
    }
    //сформировать дод23
    function d23(){
        var m = toolbar.getListOptionSelected("month"); if (m.length==1)m="0"+m;
        var y=toolbar.getValue("year");
        var date1Zvit=y+m+"01";
        iasufr.ajax({
            url: "frm.TitleZvitForm.cls",
            data: {func: "setD23",idOrg:ID_ORG,date1Zvit:date1Zvit},
            success: function (data) {
                var json = JSON.parse(data);
                iasufr.messageSuccess("Додаток 23 зроблено");
                RefreshGrid();
                iasufr.loadForm("PrintForm", {ids: [json.idZvit]});
                iasufr.gridRowFocus(grid, json.idZvit); //не успевает
            }
        })

    }

    function exportDbf(idStatus,isChildOrg){
        var m = toolbar.getListOptionSelected("month"); if (m.length==1)m="0"+m;
        var y=toolbar.getValue("year");
        var date1Zvit=y+m+"01";
        iasufr.ajax({
            url: "frm.TitleZvitForm.cls",
            data: {func: "export",idOrg:ID_ORG,date1Zvit:date1Zvit,idStatus:idStatus,isChildOrg:isChildOrg},
            success: function (data) {
                var json = JSON.parse(data);
                iasufr.downloadDbf(json.nameFile, json.data);
            }
        })

    }
    function importDbf(){
        var wnd = iasufr.wins.createWindow("up" + new Date().valueOf(), 0, 0, 320, 120);
        wnd.setModal(true);
        wnd.centerOnScreen();
        wnd.denyPark();
        wnd.denyResize();
        wnd.setText("Завантажити файл");
        var idUploaderBlock = "frm-uploader-block" + new Date().valueOf().toString();
        var idUploader      = "uploader" + new Date().valueOf().toString();

        $(document.body).append('<div id="'+idUploaderBlock+'"><input id="'+idUploader+'" class="fm-uploader" type="file" /></div>');
        wnd.attachObject(idUploaderBlock);
        document.getElementById(idUploader).addEventListener('change', readSingleFile, false);
        document.getElementById(idUploader).addEventListener('dragover', function(){$("#"+idUploader).addClass("fm-uploader-over")}, false);
        document.getElementById(idUploader).addEventListener('dragleave', function(){$("#"+idUploader).removeClass("fm-uploader-over")}, false);

        function readSingleFile(evt) {
            var f = evt.target.files[0];
            var countCell=27;
            var jsoDATA = [];
            jsoDATA.push([]);
            if (f) {
                var r = new FileReader();
                r.onload = function(e) {
                    var contents = e.target.result;
                    var dv = new DataView(contents)
                    //-----0)кол-во записей
                    var masLen=[dv.getUint8(4), dv.getUint8(5), dv.getUint8(6 ), dv.getUint8(7)];
                    var countRow = masLen[0] + (masLen[1]<<8) + (masLen[2]<<16) + (masLen[3]<<24);
                    var byteLen=dv.byteLength-31;
                    //-----1)заголовок
                    var fields = []; var k = 31;
                    for (var i = 0; i < countCell; i++) {
                        var str = "";
                        for (var j = k; j < k + 10; j++) {
                            str += String.fromCharCode(dv.getUint8(j));
                        }
                        jsoDATA[0].push(str.replace(/\u0000/g,""))
                        k += 32;
                    }
                    k=k+2
                    //-----2)данные
                    jsoDATA.push([]);
                    var widthCell=new Array((5+1),3,4,3,4,2,3,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15);
                    var countRow=0
                    var t=dv.byteLength;
                    for (var r = 0; r < 1000; r++) {
                        countRow=countRow+1;
                        jsoDATA.push([]);
                        for (var i = 0; i < countCell; i++) {
                            var str = "";
                            for (var j = k; j < k + widthCell[i]; j++) {
                                str += String.fromCharCode(dv.getUint8(j));
                            }
                            jsoDATA[countRow].push(str.replace(/\u0000/g,""))
                            k += widthCell[i];
                            if (k>=byteLen) break;
                        }
                        if (k>=byteLen) break;
                    }
                    var t=jsoDATA;

                    var m = toolbar.getListOptionSelected("month"); if (m.length==1)m="0"+m;
                    var y=toolbar.getValue("year");
                    var date1Zvit=y+m+"01";
                    iasufr.ajax({
                        url: "frm.TitleZvitForm.cls",
                        data: {func: "import",date1Zvit:date1Zvit,param:JSON.stringify(jsoDATA)},
                        success: function (data) {
                            var json = JSON.parse(data);
                            $("#"+idUploaderBlock).remove();
                            wnd.close();
                            toolbar.setListOptionSelected("month", json.month);
                            toolbar.setValue("year", json.year);
                            ID_ORG = json.idOrg;
                            ORG_NAME = json.nameOrg;
                            tb1.setValue("org", json.nameOrg);
                            RefreshGrid();
                            if (json.errorMess!=""){
                                dhtmlx.message({title: 'Помилка', text: json.errorMess, type: 'alert-error'});
                                //iasufr.showError(json.errorMess);
                            }
                        }
                    })

                    //$("#"+idUploaderBlock).remove();
                    //wnd.close();
                }
                r.readAsArrayBuffer(f);
            } else {
                iasufr.alert("Помилка завантаження файла")
            }
        }
        function readString(dv,start, count) {
            var s = "";
            for (var i = start; i < start + count; i++) {
                var n = dv.getUint8(i);
                if (n !== 0) s += String.fromCharCode( n );
            }
            return s;
        }
    }


    function onUserToolbarClick(name) {
        var nameList=name;
        if (name.lastIndexOf("_")>-1) {nameList=nameList.split("_");name=nameList[0];}
        switch (name) {

            /*case "test": {
             myContextMenu1.showContextMenu(100,100);
             break;
             }*/
            case "settings": {
                var selRow = grid.getSelectedRowId();
                if (selRow == undefined || selRow == null) {
                    iasufr.alert("Спочатку оберить звiт");
                    return;
                }
                iasufr.loadForm("WorkWithFormsSettings", {code: grid.cells(selRow, grid.getColIndexById("code")).getValue()});
                break;
            }
            case "printsettings": {
                var selRow = grid.getSelectedRowId();
                if (selRow == undefined || selRow == null) {
                    iasufr.alert("Спочатку оберить звiт");
                    return;
                }
                iasufr.loadForm("UserPrintSettings", {idZvit: selRow});
                break;
            }
            case "print": {
                PrintReports(false);
                break;
            }
            case "printKazn": {
                PrintReports(true);
                break;
            }
            case "send": {
                SetState(2, 1);
                break;
            }
            case "unsend": {
                SetState(3, 0);
                break;
            }
            case "commit": {
                SetState(3, 1);
                break;
            }
            case "uncommit": {
                SetState(0, 0);
                break;
            }
            case "accept": {
                SetState(4, 1);
                break;
            }
            case "unaccept": {
                SetState(5, 1);
                break;
            }
            case "showDeleted": {
                RefreshGrid();
                break;
            }
            case "reload": {
                RefreshGrid();
                break;
            }
            case "delete":
            {
                Delete();
                break;
            }
            case "undelete":
            {
                UnDelete();
                break;
            }
            case "editTitle":
            {
                var selRow = grid.getSelectedRowId();
                if (selRow == undefined || selRow == null) {
                    iasufr.alert("Спочатку оберить звiт");
                    return;
                }
                iasufr.loadForm("TitleZvitFormEdit", {modal: true, width: 800, height: 600,param:[["idZvit"],[selRow]]});
                break;
            }
            case "viewLog":
            {
                ViewLog();
                break;
            }
            case "add":
            {
                iasufr.loadForm("TitleZvitForm", {modal: false, width: 800, height: 600});
                break;
            }
            case "edit":
            {
                var selRow = grid.getSelectedRowId();
                if (selRow == undefined || selRow == null) {
                    iasufr.alert("Спочатку оберить звiт");
                    return;
                }
                iasufr.loadForm("FormInput", {idZvit: selRow, status: grid.cells(selRow,  grid.getColIndexById("status")).getValue() });
                break;
            }
            case "editKazn":
            {
                var selRow = grid.getSelectedRowId();
                if (selRow == undefined || selRow == null) {
                    iasufr.alert("Спочатку оберить звiт");
                    return;
                }
                iasufr.loadForm("FormInput", {idZvit: selRow, isKazn: 1, status: grid.cells(selRow,  grid.getColIndexById("status")).getValue() });
                break;
            }
            case "recalc":
            {
                Recalc();
                break;
            }
            case "import":
            {
                importDbf();
                break;
            }
            case "check":
            {
                check({param:{idStatus:nameList[1]}});
                break;
            }
            case "d23":
            {   d23();
                break;
            }
            case "exp":
            {
                exportDbf(nameList[1],nameList[2]);
                break;
            }
            case "1":case "2":case "3":case "4":case "5":case "6":
            case "7":case "8":case "9":case "10":case "11":case "12":{
            iasufr.storeSet("wwfMonth", name);
            RefreshGrid();
            break;
        }
            default:
            {
                //iasufr.alert(name);
                break;
            }
        }
    }

    return t;
}


//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/form/work/workWithForms.js