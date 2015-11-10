if (!window.Usr) Usr = {};
if (!Usr.FormAdd) Usr.FormAdd = {};

Usr.FormAdd.Create = function(opt) {
    var t = iasufr.initForm(this, opt);
    var selOrg = null;
    var isEdit = t.opt.Id || t.opt.Login;

    var l = new dhtmlXLayoutObject(t.owner, "2E");
    l.cells("a").setText("Основна iнформацiя");
    l.cells("a").setHeight(340);
    l.cells("b").setText("Контакти");
    l.cells("a").hideHeader();
    l.cells("b").hideHeader();

    if (!t.opt.view){
        var toolbar = l.attachToolbar();
        toolbar.setIconPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(16);
        if (isEdit) {
            if (iasufr.pFunc("usrEdit") || (t.opt.Login == iasufr.user.login)) toolbar.addButton("save", 1, "Зберегти", "16/tick.png", "");
        } else {
            if (iasufr.pFunc("usrAdd")) toolbar.addButton("save", 1, "Зберегти", "16/tick.png", "");
        }
        toolbar.addButton("cancel", 2, "Скасувати", "16/cross.png", "");
        toolbar.attachEvent("onClick", onToolbarClick);
    }

    /*var tabs = t.owner.attachTabbar();
    tabs.setImagePath(iasufr.const.IMG_PATH);
    tabs.addTab("t1", "Основна", "100px");
    tabs.addTab("t2", "Додатково", "100px");
    tabs.addTab("t3", "Контакти", "100px");
    tabs.setTabActive("t1");*/

    if (!t.opt.view){
        var cTool = l.cells("b").attachToolbar();
        cTool.setIconPath(iasufr.const.ICO_PATH);
        cTool.setIconSize(16);
        cTool.addButton("add", 1, iasufr.lang.ui.add, "16/page_white_add.png", "");
        cTool.addButton("del", 2, iasufr.lang.ui.delete, "16/page_white_delete.png", "");
        cTool.attachEvent("onClick", onContactToolbarClick);
    }

    var gCont = l.cells("b").attachGrid();
    gCont.setImagePath(iasufr.const.IMG_PATH);
    gCont.setHeader("Тип,Контакт,Коментар");
    gCont.setInitWidths("70,120,*");
    gCont.setColAlign("right,left,left");
    gCont.setColTypes("co,ed,ed");
    var combo = gCont.getCombo(0);
    combo.put("1","тел.");
    combo.put("2","моб.");
    combo.put("3","e-mail");
    combo.put("4","skype");
    combo.put("5","адреса");
    combo.put("6","iнше");
    gCont.init();

    var formData = [
        { type:"settings" , labelWidth:80, inputWidth:250, position:"absolute"  },
        { type:"input" , name:"Login", label:"Логiн", labelWidth:150, labelAlign:"left", inputWidth:150, labelLeft:5, labelTop:5, inputLeft:5, inputTop:21, required: !isEdit  },
        { type:"input" , name:"DOB", label:"Дата народження", labelWidth:150, labelAlign:"left", inputWidth:150, labelLeft:120, labelTop:295, inputLeft:120, inputTop:315 },
        { type:"checkbox" , name:"cbChangePass", label:"Змiнити пароль", labelWidth:150, labelAlign:"left", inputWidth:150, labelLeft:290, labelTop:295, inputLeft:290, inputTop:315 },
        { type:"password" , name:"Password", label:"Пароль", labelWidth:125, labelAlign:"left", inputWidth:125, labelLeft:175, labelTop:5, inputLeft:175, inputTop:21, required: !isEdit, validate: CheckPass },
        { type:"password" , name:"Password2", label:"Пароль", labelWidth:125, labelAlign:"left", inputWidth:125, labelLeft:325, labelTop:5, inputLeft:325, inputTop:21, required: !isEdit },
        { type:"button" , name:"changePass", value:"Змiнити пароль", inputLeft:175, inputTop:19 },
        { type:"input" , name:"FIO", label:"ПIБ", labelWidth:450, labelAlign:"left", inputWidth:450, labelLeft:5, labelTop:50, inputLeft:5, inputTop:71, required: true  },
        { type:"input" , name:"Post", label:"Посада", labelWidth:450, labelAlign:"left", inputWidth:450, labelLeft:5, labelTop:100, inputLeft:5, inputTop:121  },
        { type:"input" , name:"Comment", label:"Коментар", rows:"3", labelWidth:450, labelAlign:"left", inputWidth:450, inputHeight:63, labelLeft:5, labelTop:150, inputLeft:5, inputTop:171  },
        { type:"input" , name:"OrgCode", label:"Органiзацiя", labelWidth:450, labelAlign:"left", inputWidth:450, labelLeft:5, labelTop:250, inputLeft:5, inputTop:271  },
        { type:"checkbox" , name:"IsSign", label:"Пiдпис звiтiв", labelWidth:200, labelAlign:"top", labelLeft:5, labelTop:295, inputLeft:5, inputTop:315  }
    ];
    if (!iasufr.pFunc("usrChangePass")) {
        var idx = formData.indexOf(formData.filter(function(el) { return el.name === "cbChangePass"; })[0]);
        formData.splice(idx, 1);
    }
    var form = l.cells("a").attachForm(formData);
    form.attachEvent("onButtonClick", onFormButtonClick);
    form.attachEvent("onChange", onFormchange);
    form.hideItem("changePass");
    if (isEdit) LoadData();
    $(form.getInput("Login")).focus();
    if (t.opt.view) {
        iasufr.setFromReadonly(form);
    } else {
        if (!(isEdit && !iasufr.pGrp(1))) iasufr.attachSelector(form.getInput("OrgCode"), "OrgSelector", {onSelect: OrgSelect});
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function onFormchange(item) {
        if (item !== "Login") return;
        form.setItemValue(item, iasufr.ru2en.translit(form.getItemValue(item)));
    }

    function onFormButtonClick(name) {
        if (name="changePass") iasufr.loadForm("ChangePass", {id: t.opt.Id, login: t.opt.Login});
    }

    function OrgSelect(o, $txt){
        selOrg = o;
        if (o) $txt.val("(" + o.code + ") " + o.name);
    }

    function onContactToolbarClick(name) {
        if (name == "add") {
            var newid = gCont.getRowsNum() + 1;
            gCont.addRow(newid, ["1","",""], newid - 1);
            gCont.setSelectedRow(newid);
        } else
        if (name == "del") gCont.deleteRow(gCont.getSelectedId());
    }

    function CheckPass(d) {
        if (isEdit) return true;
        var r = form.getItemValue("Password") == form.getItemValue("Password2");
        if (!r) dhtmlx.alert("Пароль повинен совпадати!");
        return r;
    }

    function onToolbarClick(name) {
        switch (name) {
            case "save": SaveData(); break;
            case "cancel": Close(); break;
        }
    }

    function Close() {
        if (t.owner.close != undefined) t.owner.close();
    }

    function LoadData() {
        l.progressOn();
        form.setReadonly("Login", true);
        form.hideItem("Password");
        form.hideItem("Password2");
        iasufr.ajax({
            url: "ac.Usr.cls",
            data: {func: "Get", json: JSON.stringify({Id: t.opt.Id, Login: t.opt.Login})},
            success: FillData,
            error: function() {l.progressOff()}
        });
    }

    function FillData(txt, d) {
        l.progressOff();
        try {
            var usr = d.json;
            //var usr = JSON.parse(d).json;
            //iasufr.decodeStrings(usr);
            selOrg = {};
            selOrg.id = usr.OrgCode;
            form.setItemValue("Login", usr.Login);
            form.setItemValue("FIO", usr.FIO);
            form.setItemValue("Post", usr.Post);
            form.setItemValue("Comment", usr.Comment);
            form.setItemValue("IsSign", usr.IsSign);
            form.setItemValue("OrgCode", usr.OrgName);
            form.setItemValue("DepCode", usr.DepName);
            form.setItemValue("DOB", usr.DOB);
            form.setItemValue("cbChangePass", usr.cbChangePass);
            iasufr.setTitle(t, "Користувач: " + usr.FIO);
            if (usr.CanChangePass==1) {
                form.showItem("changePass");
            }

            if (usr.Contacts) {
                gCont.clearAll();
                for (var i = 0; i < usr.Contacts.length; i++) {
                    gCont.addRow(i + 1, [usr.Contacts[i].Type, usr.Contacts[i].Num, usr.Contacts[i].Comment], i);
                }
            }
        } catch (e){}
    }

    function SaveData() {
        if (!form.validate()) return;
        if (t.owner.progressOn) t.owner.progressOn();
        var json = $.extend(form.getFormData(), {Id: t.opt.Id, Login: t.opt.Login});
        if (selOrg) {
            json.OrgCode = selOrg.id;
            //json.DepCode = selOrg.id;
        } else json.OrgCode = "";

        if (gCont.getRowsNum() != 0) {
            var contacts = [];
            for (var i = 0; i < gCont.getRowsNum(); i++) {
                if (gCont.cells2(i, 1).getValue() != "") contacts.push({Type: gCont.cells2(i, 0).getValue(), Num: gCont.cells2(i, 1).getValue(), Comment: gCont.cells2(i, 2).getValue()});
            }
            if (contacts.length != 0) json = $.extend(json, {Contacts: contacts});
        }
        iasufr.ajax({
            url: "ac.Usr.cls",
            data: {func: isEdit ? "Edit": "Add", json: JSON.stringify(json)},
            success: onSuccess,
            error: function(){if (t.owner.progressOn) t.owner.progressOff()}
        });
    }

    function onSuccess(data, textStatus, jqXHR) {
        if (t.owner.progressOn) t.owner.progressOff();
        var id;
        try {
            var d = JSON.parse(data);
            id = d.Id;
            if (d.error == 1) return;
        } catch (e) {
            return;
        }
        if (t.onSave) t.onSave(id);
        Close();
    }

    return this;
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/ac/userAdd.js