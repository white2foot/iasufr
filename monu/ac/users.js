if (!window.Usr) Usr = {};
if (!Usr.Form) Usr.Form = {};

Usr.Form.Create = function(opt) {
    var t = iasufr.initForm(this, opt);
    var dhxLayout;
    var frmFilter;
    var gUsers;
    var gGroups;
    var firstRun=true;
    var dhxLayout;
    // Test
    if (iasufr.pFunc("grpView") && !(opt.selectUser || opt.selectMulti))
        dhxLayout = new dhtmlXLayoutObject(t.owner, "3L");
    else
        dhxLayout = new dhtmlXLayoutObject(t.owner, "2U");
    this.l = dhxLayout;
    dhxLayout.cells("a").setWidth(140);

    dhxLayout.cells("a").setText(iasufr.lang.ui.filter);
    dhxLayout.cells("b").setText(iasufr.lang.ui.users);
    if (dhxLayout.cells("c")) {
        dhxLayout.cells("c").setHeight(300);
        dhxLayout.cells("c").setText(iasufr.lang.ui.groups);
    }

    var formData = [
        {
            type: "settings",
            position: "label-top",
            labelWidth: 116,
            inputWidth: 120,
            offsetLeft: 8
        },
        {
            type: "input",
            label: "Логiн",
            name: "Login",
            value: ""
        },
        {
            type: "input",
            label: "ПIБ",
            name: "FIO",
            value: ""
        },
        {
            type: "input",
            label: "Посада",
            name: "Post",
            value: ""
        },
        {
            type: "input",
            label: "Код орг.",
            name: "OrgCode",
            value: ""
        },
        {
            type: "input",
            label: "Код деп.",
            name: "DepCode",
            value: ""
        },
        {
            type: "input",
            label: "Коментар",
            name: "Comment",
            value: ""
        },
        {
            type: "checkbox",
            labelWidth: 80,
            position: "label-right",
            label: "У системi",
            name: "IsOnline"
        },
        {
            type: "checkbox",
            labelWidth: 80,
            position: "label-right",
            label: "Заблокованi",
            name: "IsBlocked"
        },
        {
            type: "button",
            value: iasufr.lang.ui.accept,
            name: "btnApplyFilter",
            width: 116
        },
        {
            type: "button",
            value: iasufr.lang.ui.cancel,
            name: "btnCancelFilter",
            width: 116
        },
        {
            type: "label",
            label: "*Фiльтр активен",
            name: "fltActive",
            hidden: true
        }
    ];
    frmFilter = dhxLayout.cells("a").attachForm(formData);
    frmFilter.attachEvent("onButtonClick", Filter);
    frmFilter.attachEvent("onEnter",function(){Filter("btnApplyFilter");});

    var toolbar = dhxLayout.cells("b").attachToolbar();
    toolbar.setIconPath(iasufr.const.ICO_PATH);
    toolbar.setIconSize(32);
    if (t.opt.selectUser || t.opt.selectUserMulti) toolbar.addButton("select", 0, iasufr.lang.ui.select, "32/tick.png", "");
    if (iasufr.pFunc("usrAdd")) toolbar.addButton("add", 1, iasufr.lang.ui.add, "32/add_user.png", "");
    if (iasufr.pFunc("usrEdit")) toolbar.addButton("edit", 2, iasufr.lang.ui.edit, "32/edit_user.png", "");
    if (iasufr.pFunc("usrDel")) toolbar.addButton("del", 3, iasufr.lang.ui.delete, "32/del_user.png", "");
    toolbar.addButton("reload", 4, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
    toolbar.addSeparator("sep1", 5);


    var actionsList = [];
    if (iasufr.pFunc("usrHis")) actionsList.push(['his', 'obj', iasufr.lang.ui.history, '32/manage_sources.png']);
    actionsList.push(['print', 'obj', iasufr.lang.ui.print, '32/printer_empty.png']);
    if (iasufr.pGrp(1)) {
        actionsList.push(['sep']);
        actionsList.push(['block', 'obj', iasufr.lang.ui.block, '32/disable_enable_demo_mode.png'])
        actionsList.push(['resetp', 'obj', iasufr.lang.ui.resetPassword, '32/textfield_delete.png']);
    }
    toolbar.addButtonSelect("actions", 6, "Дії", actionsList, "32/lightning.png", "", "disabled", true);
    toolbar.attachEvent("onClick", onUserToolbarClick);

    gUsers = dhxLayout.cells("b").attachGrid();
    gUsers.colDef =["sel", "ico","login","orgCode","depCode","fio","post","isSign","comment"];
    gUsers.setHeader(",," + iasufr.lang.headers.login + "," + iasufr.lang.headers.orgCode + "," + iasufr.lang.headers.depCode + "," + iasufr.lang.headers.fio + "," + iasufr.lang.headers.post + "," + iasufr.lang.headers.isSign + "," + iasufr.lang.headers.comment);
    var selW = "0";
    if (t.opt.selectUserMulti) selW = 24;
    gUsers.setInitWidths(selW + ",24,72,120,64,260,260,64,*");
    gUsers.setColAlign("center,center,left,left,center,left,left,center,left");
    gUsers.setColTypes("ch,ro,ro,ro,ro,ro,ro,ch,ro");
    gUsers.setColSorting('str,str,str,str,str,str,str,str,str');
    gUsers.setImagePath(iasufr.const.IMG_PATH);
    gUsers.init();
    gUsers.enableHeaderMenu("false,false,true,true,true,true,true,true,true");
    gUsers.enableAutoHiddenColumnsSaving("gUsers");
    gUsers.loadHiddenColumnsFromCookie("gUsers");
    iasufr.enableRowselectMode(gUsers);
    gUsers.attachEvent("onRowSelect", function(id,ind){ UpdateUserGroups(); UpdateUserFuncs();});

    if (!iasufr.pFunc("usrEdit")) gUsers.setColumnHidden(2, true);

    //window.tmp = gUsers;

    ///////////////////////////////////////////// GROUPS ///////////////////////////////////////////////////////
    if (dhxLayout.cells("c")) {
        this.l2 = new dhtmlXLayoutObject(dhxLayout.cells("c"), "2U");
        this.l2.cells("a").setText("Групи користувача");
        this.l2.cells("b").setText("Перегляд доступних функцiй: 0");

        gGroups = this.l2.cells("a").attachGrid();
        gGroups.setHeader(",Код,Назва");
        gGroups.setInitWidths("24,72,*");
        gGroups.setColAlign("center,right,left");
        gGroups.setColTypes("ch,ro,ro");
        gGroups.setColSorting('str,str,str');
        gGroups.setImagePath(iasufr.const.IMG_PATH);
        gGroups.init();
        iasufr.enableRowselectMode(gGroups);
        //gGroups.attachEvent("onXLE", onAfterGroupsLoad);

        var toolG = this.l2.cells("a").attachToolbar();
        toolG.setIconPath(iasufr.const.ICO_PATH);
        toolG.setIconSize(32);
        if (iasufr.pFunc("grpSet")) {
            toolG.addButton("save", 3, iasufr.lang.ui.save, "32/database_save.png", "");
            toolG.addSeparator("sep1", 2);
        }
        if (iasufr.pFunc("grpAdd")) toolG.addButton("add", 3, iasufr.lang.ui.add, "32/add_group.png", "");
        if (iasufr.pFunc("grpEdit")) toolG.addButton("edit", 4, iasufr.lang.ui.edit, "32/edit_group.png", "");
        if (iasufr.pFunc("grpDel")) toolG.addButton("del", 5, iasufr.lang.ui.delete, "32/del_group.png", "");
        toolG.addButton("reload", 6, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolG.addSeparator("sep2", 7);
        if (iasufr.pFunc("usrHis")) toolG.addButton("his", 8, iasufr.lang.ui.history, "32/manage_sources.png", "");
        toolG.addButton("print", 9, iasufr.lang.ui.print, "32/printer_empty.png", "");
        toolG.attachEvent("onClick", onGroupToolbarClick);

        var gFuncs = this.l2.cells("b").attachGrid();
        gFuncs.setHeader("Назва,Опис");
        gFuncs.setInitWidths("160,*");
        gFuncs.setColAlign("left,left");
        gFuncs.setColTypes("ro,ro");
        gFuncs.setColSorting('str,str');
        gFuncs.setImagePath(iasufr.const.IMG_PATH);
        gFuncs.init();
        iasufr.enableRowselectMode(gFuncs);

    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function getUsrCell(i, column) { return gUsers.cells(i, gUsers.colDef.indexOf(column)).getValue() };
    function getUsrCell2(i, column) { return gUsers.cells2(i, gUsers.colDef.indexOf(column)).getValue() };
    function setUsrCell(i, column, v) { return gUsers.cells(i, gUsers.colDef.indexOf(column)).setValue(v) };
    function setUsrCell2(i, column, v) { return gUsers.cells2(i, gUsers.colDef.indexOf(column)).setValue(v) };

    function Filter(name) {
        switch (name) {
            case "btnApplyFilter": {
                if (frmFilter.getItemValue("IsOnline")) gUsers.filterBy(gUsers.colDef.indexOf("ico"), function (d) {
                    return d.indexOf("bullet_green.png") != -1;
                });
                if (frmFilter.getItemValue("IsBlocked")) gUsers.filterBy(gUsers.colDef.indexOf("ico"), function (d) {
                    return d.indexOf("bullet_delete.png") != -1;
                });
                gUsers.filterBy(gUsers.colDef.indexOf("login"), frmFilter.getItemValue("Login"), frmFilter.getItemValue("IsOnline") || frmFilter.getItemValue("IsBlocked"));
                gUsers.filterBy(gUsers.colDef.indexOf("orgCode"), frmFilter.getItemValue("OrgCode"), true);
                gUsers.filterBy(gUsers.colDef.indexOf("depCode"), frmFilter.getItemValue("DepCode"), true);
                gUsers.filterBy(gUsers.colDef.indexOf("fio"), frmFilter.getItemValue("FIO"), true);
                gUsers.filterBy(gUsers.colDef.indexOf("post"), frmFilter.getItemValue("Post"), true);
                gUsers.filterBy(gUsers.colDef.indexOf("comment"), frmFilter.getItemValue("Comment"), true);
                frmFilter.showItem("fltActive");
                break;
            }
            case "btnCancelFilter": {
                for (var i = 0; i < 8; i++) gUsers.filterBy(i, "");
                frmFilter.hideItem("fltActive");
                break;
            }
        }
    }

    function onUserToolbarClick(name) {
        var id = GetUserId();
        switch (name) {
            case "add": iasufr.loadForm("UserAdd", {modal:true, onSave: ReloadUsers}); break;
            case "edit": if (id) iasufr.loadForm("UserAdd", {Id: id, onSave: ReloadUsers, modal:true}); break;
            case "reload": ReloadUsers(); break;
            case "del": DeleteUser(); break;
            case "his": ShowUserHistory(); break;
            case "print": gUsers.printView(); break;
            case "select": SelectUser(); break;
            case "block": if (id) iasufr.loadForm("UserBlock", {id: id, onRefresh: ReloadUsers}); break;
            case "resetp": {
                if (!id) return;
                dhtmlx.confirm({ text: iasufr.lang.msg.resetPassword + ": " +  $(getUsrCell(id, "fio")).text() + "?", callback: function(r) {
                    if (r) ResetPassword(id);
                }});
                break;
            }
        }
    }

    function ResetPassword(id) {
        iasufr.ajax({url: "ac.Usr.cls", data: {func: "ResetPassword", id: id}});
    }

    function SelectUser() {
        if (t.opt.selectUser) {
            var id = GetUserId();
            if (!id) return;
            if (t.onSelect) t.onSelect({id: id, fio: getUsrCell(id, "fio"), post: getUsrCell(id, "post"), orgName: getUsrCell(id, "orgCode")});
            iasufr.close(t);
        }
        if (t.opt.selectUserMulti) {
            var ids = [];
            var cnt = gUsers.getRowsNum();
            for (var i = 0; i < cnt; i++) if (getUsrCell2(i, "sel")) ids.push(gUsers.getRowId(i));
            if (ids.length == 0) return;
            if (t.onSelect) t.onSelect({Ids: ids});
            iasufr.close(t);
        }
    }

    function onAfterUsersLoad(txt, o) {
        gUsers.clearAll();
        gUsers.parse(o,'json');
       /* for (var i = 0; i < gUsers.getRowsNum(); i++) if (gUsers.cells2(i,0).getValue() == 0) {
            $(gUsers.cells2(i,7).cell).children().hide();
        }*/
        UpdateUserStateIcons();
        gUsers.sortRows(gUsers.colDef.indexOf("login"),"str","asc");
        gUsers.setSortImgState(true,gUsers.colDef.indexOf("login"));
        iasufr.gridRowFocusApply(gUsers);
        if (firstRun) {
            firstRun = false;
            ReloadGroups();
        }

        UpdateUserFuncs();
        //gUsers.groupBy(3);
    }

    function ReloadUsers(id) {
        iasufr.gridRowFocus(gUsers, id);
        frmFilter.hideItem("fltActive");
        iasufr.ajax({url: "ac.Usr.cls", data:{func:"Select", showAll: t.opt.showAll},success: onAfterUsersLoad});
    }

    function GetUserId() {
        return gUsers.getRowId(gUsers.getRowIndex(gUsers.getSelectedId()));
    }

    function DeleteUser() {
        var id = GetUserId();
        if (!id) return;
        if (getUsrCell(gUsers.getSelectedId(), "login") == iasufr.user.login) {
            dhtmlx.alert("Неможливо видалити самого себе.");
            return;
        }
        dhtmlx.confirm({
            text: iasufr.lang.msg.delete,
            callback: function(result) {
                if (result) {
                    iasufr.ajax({
                        url: "ac.Usr.cls",
                        data: {func: "Delete", json: JSON.stringify({Id: id})},
                        success: function() { ReloadUsers()}
                    });
                }
            }
        });
    }

    function UpdateUserStateIcons() {
        var cnt = gUsers.getRowsNum();
        var onlineCnt = 0;
        if (cnt != 0) {
            for (var i = 0; i < cnt; i++) {
                //var login = getUsrCell2(i, "login");
                var txt =  getUsrCell2(i, "login");
                if (iasufr.pFunc("usrEdit")) setUsrCell2(i, "fio", '<a href="#'+txt+'" onclick="iasufr.loadForm(\'UserAdd\',{Login:\''+txt+'\', modal: true})">'+getUsrCell2(i, "fio")+'</a>');
                var ico = getUsrCell2(i, "ico");
                switch (ico) {
                    case "1":{
                        setUsrCell2(i, "ico", '<img title="У системi" src="/images/icons/16/bullet_green.png" style="vertical-align: middle; float: left">');
                        gUsers.cells2(i, gUsers.colDef.indexOf("ico")).setAttribute("title", "У системi");
                        onlineCnt++;
                        break;
                    }
                    case "2": {
                        setUsrCell2(i, "ico", '<img src="/images/icons/16/bullet_delete.png" style="vertical-align: middle; float: left">');
                        gUsers.cells2(i, gUsers.colDef.indexOf("ico")).setAttribute("title", "Заблокован");
                        gUsers.cells2(i, gUsers.colDef.indexOf("login")).setTextColor("#F00");
                        //gUsers.cells2(i, gUsers.colDef.indexOf("OrgCode")).setTextColor("#F00");

                        break;
                    }
                    default: setUsrCell2(i, "ico", "");
                }
            }
        }
        dhxLayout.cells("b").setText(iasufr.lang.ui.users + ": " + gUsers.getRowsNum() + ", " + iasufr.lang.ui.online + ": " + onlineCnt);
    }

    function ShowUserHistory() {
        var id = GetUserId();
        if (!id) return;
        iasufr.loadForm("History", {global: "^Usr", id: id, title: "Iсторiя користувача: (" + getUsrCell(id, "login") + ") " + getUsrCell(id, "fio"), modal: true});
    }

   ///////////////////////////////////// GROUPS ////////////////////////////////////////////////////////////////////

    function onGroupToolbarClick(name) {
        switch (name) {
            case "save": SaveUserGroups(); break;
            case "add": iasufr.loadForm("GroupAdd", {modal:true, onSave: ReloadGroups}); break;
            case "edit": var id = GetGroupId(); if (id) iasufr.loadForm("GroupAdd", {Id: id, onSave: ReloadGroups,modal:true}); break;
            case "reload": ReloadGroups(); break;
            case "del": DeleteGroup(); break;
            case "his": ShowGroupHistory(); break;
            case "print": gGroups.printView(); break;
        }
    }

    function DeleteGroup() {
        var id = oupId();
        if (!id) return;
        dhtmlx.confirm({
            text: iasufr.lang.msg.delete,
            callback: function(result) {
                if (result) {
                    iasufr.ajax({
                        url: "ac.Grp.cls",
                        data: {func: "Delete", json: JSON.stringify({Code: id})},
                        success: function() { ReloadGroups()}
                    });
                }
            }
        });
    }

    function ShowGroupHistory() {
        var id = GetGroupId();
        if (!id) return;
        iasufr.loadForm("History", {global: "^Grp", id: id, title: "Iсторiя групи: " + gGroups.cells(id, 2).getValue(), modal: true });
    }

    function GetGroupId() {
        return gGroups.getRowId(gGroups.getRowIndex(gGroups.getSelectedId()));
    }

   function ReloadGroups(id) {
       if (!gGroups) return;
       iasufr.gridRowFocus(gGroups, id);
       iasufr.ajax({url: "ac.Grp.cls", data: {func: "Select"}, success: onAfterGroupsLoad});
   }

    function onAfterGroupsLoad(d) {
        gGroups.clearAll();
        gGroups.parse(JSON.parse(d),'json');
        gGroups.sortRows(1,"str","asc");
        gGroups.setSortImgState(true,1);
        dhxLayout.cells("c").setText(iasufr.lang.ui.groups + ": " + gGroups.getRowsNum());
        iasufr.gridRowFocusApply(gGroups);
        UpdateUserGroups();
    }

    function SaveUserGroups() {
        var id = GetUserId();
        if (!id) return;
        var ids = [];
        for (var i = 0; i < gGroups.getRowsNum(); i++) {
            if (gGroups.cells2(i, 0).getValue() != 0) ids.push(gGroups.cells2(i, 1).getValue());
        }
        iasufr.ajax({
            url: "ac.Grp.cls",
            data: {func: "SaveUserGroups", json: JSON.stringify({Id: id, Groups: ids})},
            success: function(data) {
                dhtmlx.alert("Налаштування груп для користувача сбережено");
            }
        });
    }

    function UpdateUserGroups() {
        if (!gGroups) return;
        var id = GetUserId();
        if (!id) return;
        iasufr.ajax({
            url: "ac.Grp.cls",
            data: {func: "GetUserGroups", json: JSON.stringify({Id: id})},
            success: function(data) {
                for (var i = 0; i < gGroups.getRowsNum(); i++) gGroups.cells2(i, 0).setValue(0);
                try {
                    var d = JSON.parse(data);
                    if (d.json) if (d.json.length) for (var i = 0; i < d.json.length; i++) {
                        gGroups.cells(d.json[i], 0).setValue(1);
                    }
                }catch(e){}
            }
        });
    }

    function UpdateUserFuncs() {
        if (!gFuncs) return;
        var id = GetUserId();
        if (!id) return;
        iasufr.ajax({
            url: "ac.Usr.cls",
            data: {func: "GetUserFuncs", json: JSON.stringify({Id: id})},
            success: function(data) {
                gFuncs.clearAll();
                var jso = JSON.parse(data);
                gFuncs.parse(jso, 'json');
                t.l2.cells("b").setText("Перегляд доступних функцiй: " + jso.rows.length);
                /*for (var i = 0; i < g.getRowsNum(); i++) gGroups.cells2(i, 0).setValue(0);
                try {
                    var d = JSON.parse(data);
                    if (d.json) if (d.json.length) for (var i = 0; i < d.json.length; i++) {
                        gGroups.cells(d.json[i], 0).setValue(1);
                    }
                }catch(e){}*/
            }
        });
    }

    ReloadUsers();
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/ac/users.js