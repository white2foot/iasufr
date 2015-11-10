/**
 * Created by Anton on 27.02.14.
 */
if (!window.Frm) Frm = {};
if (!Frm.FormAdd) Frm.FormAdd = {};


Frm.FormAdd.Create = function(opt) {
    var t = iasufr.initForm(this, opt);
    t.tables = [{}];
    t.curTable = 0;
    t.id = opt.id;
    t.date = opt.date;
    var editMode = false;

    var l = new dhtmlXLayoutObject(t.owner, t.id ? "2U" : "1C");
    l.cells("a").setText("Оновна iнформацiя");
    l.cells("a").hideHeader();
    if (t.id) {
        editMode = true;
        l.cells("b").hideHeader();
        l.cells("b").setWidth(100);
        l.cells("b").fixSize(true, true);
    } else {
        if (t.owner.setDimension) t.owner.setDimension(510);
    }

    var toolbar = t.owner.attachToolbar();
    toolbar.setIconPath(iasufr.const.ICO_PATH);
    toolbar.setIconSize(16);
    toolbar.addButton("save", 1, "Зберегти", "16/tick.png", "");
    toolbar.addButton("cancel", 2, "Скасувати", "16/cross.png", "");
    toolbar.attachEvent("onClick", onToolbarClick);

    /*var tableTb = l.cells("b").attachToolbar();
    tableTb.setIconPath(iasufr.const.ICO_PATH);
    tableTb.setIconSize(16);
    tableTb.addSeparator("sep", 1);
    tableTb.addButton("add", 2, "Додати", "16/table_add.png");
    tableTb.addButton("del", 3, "Видалити", "16/table_delete.png");
    tableTb.addButtonTwoState("table1",0,"Таблиця 1");
    tableTb.attachEvent("onClick", onTableClick);
    tableTb.attachEvent("onStateChange", onTableChange);
    tableTb.setItemState("table1", true);
    //tableTb.hide

    var tabs = l.cells("b").attachTabbar();
    tabs.setImagePath(iasufr.const.IMG_PATH);
    tabs.addTab('t1','Параметри друку','');
    tabs.addTab('t2','Додатково','');
    tabs.setTabActive('t1');
*/
    //$("<div id='infoToolbar'><select id='tables' style='margin-left:2px;width:140px'><div>").insertBefore($(tabs._tabs["t1"]));
    //$("#tables").append($('<option></option>').val(1).html("Таблиця 1"));
    //$("#tables").append($('<option></option>').val(1).html("Таблиця 2"));

    var str = [
        { type:"settings" , labelWidth:80, inputWidth:250, position:"absolute"  },
        { type:"input" , name:"code", label:"Код форми", labelWidth:85, inputWidth:75, required:true, labelLeft:5, labelTop:5, inputLeft:5, inputTop:21  },
        { type:"calendar" , name:"from", label:"З", dateFormat:"%d.%m.%Y", labelWidth:75, inputWidth:75, serverDateFormat:"%Y%m%d", options:{

        }, labelLeft:100, labelTop:5, inputLeft:90, inputTop:21  },
        { type:"calendar" , name:"to", label:"По", dateFormat:"%d.%m.%Y", labelWidth:75, inputWidth:75, serverDateFormat:"%Y%m%d", options:{

        }, labelLeft:200, labelTop:5, inputLeft:180, inputTop:21  },
        { type:"input" , name:"dkud", label:"ДКУД", labelWidth:75, inputWidth:75, labelLeft:270, labelTop:5, inputLeft:270, inputTop:21  },
        { type:"select" , name:"pr", label:"Перiод", labelWidth:120, inputWidth:120, required:true, labelLeft:360, labelTop:5, inputLeft:360, inputTop:21 },
        { type:"input" , name:"name", label:"Повна назва", labelWidth:475, inputWidth:475, required:true, labelLeft:5, labelTop:50, inputLeft:5, inputTop:71  },
        { type:"input" , name:"dep", label:"Пiдроздiл", labelWidth:275, inputWidth:275, required:true, labelLeft:5, labelTop:100, inputLeft:5, inputTop:121  },
        { type:"input" , name:"nameShort", label:"Скорочена назва", labelWidth:175, inputWidth:175, labelLeft:300, labelTop:100, inputLeft:300, inputTop:121  },
        { type:"checkbox" , name:"istext", label:"Текстова форма", labelWidth:175, inputWidth:75, labelLeft:5, labelTop:145, inputLeft:104, inputTop:142  }
    ];
    var frmMain = l.cells("a").attachForm(str);
    frmMain.getSelect("pr").options.add(new Option("Мiсяць",1));
    frmMain.getSelect("pr").options.add(new Option("Квартал",2));
    frmMain.getSelect("pr").options.add(new Option("Рiк",3));
    frmMain.getSelect("pr").options.add(new Option("Мiсяць/Квартал",12));
    frmMain.getSelect("pr").options.add(new Option("Мiсяць/Рiк",13));
    frmMain.getSelect("pr").options.add(new Option("Квартал/Рiк",23));
    frmMain.getSelect("pr").options.add(new Option("Мiсяць/Квартал/Рiк",123));
    iasufr.attachSelector(frmMain.getInput("dep"), "OrgSelector", {onSelect: OrgSelect});
    if (editMode) {
        //frmMain.setReadonly("code", true);
        frmMain.setReadonly("from", true);
    }
    var selDep = {};

    var printFrmData = [
        { type:"settings" , labelWidth:80, inputWidth:250, position:"absolute"  },
        { type:"input" , name:"form_input_8", label:"Назва друку", labelWidth:500, labelAlign:"left", inputWidth:500, labelLeft:5, labelTop:5, inputLeft:5, inputTop:21  },
        { type:"input" , name:"form_input_9", label:"Колонтитул 1-ї сторiнки", rows:"3", labelWidth:500, labelAlign:"left", inputWidth:500, inputHeight:63, labelLeft:5, labelTop:50, inputLeft:5, inputTop:71  },
        { type:"input" , name:"form_input_10", label:"Колонтитул сторiнок", rows:"3", labelWidth:500, labelAlign:"left", inputWidth:500, inputHeight:63, labelLeft:5, labelTop:150, inputLeft:5, inputTop:171  },
        { type:"input" , name:"form_input_11", label:"Примiтка знизу сторiнки", labelWidth:500, inputWidth:500, labelLeft:5, labelTop:250, inputLeft:5, inputTop:271  },
        { type:"checkbox" , name:"form_checkbox_1", label:"Книжкова орієнтація", labelWidth:150, labelLeft:25, labelTop:300, inputLeft:5, inputTop:300  },
        { type:"checkbox" , name:"form_checkbox_2", label:"Друк з нової сторінки", labelWidth:150, labelLeft:200, labelTop:300, inputLeft:175, inputTop:300  },
        { type:"checkbox" , name:"form_checkbox_3", label:"Друкувати підписи", labelWidth:125, labelLeft:375, labelTop:300, inputLeft:350, inputTop:300  }
    ];

    if (t.id) {
        var tbTables = l.cells("b").attachToolbar();
        tbTables.setIconPath(iasufr.const.ICO_PATH);
        tbTables.setIconSize(16);
        tbTables.addButton("add", 1, "", "32/table_add.png");
        tbTables.addButton("del", 2, "", "32/table_delete.png");



        /*tbTables.addSeparator("sep", 3);
        tbTables.addButton("design", 4, "Дизайнер", "32/table_design.png");
        tbTables.addButton("print", 5, "Параметри друку", "32/font_red.png");
        tbTables.addButton("kazn", 6, "Згортання ДКСУ", "32/table_import.png");*/
        tbTables.attachEvent("onClick", onTableToolbarClick);

        var g = l.cells("b").attachGrid();
        g.setImagePath(iasufr.const.IMG_PATH);
        g.setHeader(",Таблицi форми");
        g.setNoHeader(true);
        g.setColAlign("left,left");
        g.setColTypes("ro,ed");
        g.setInitWidths("0,*");
        g.init();

        LoadData();
    }




    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    function LoadData() {
        l.progressOn();
        iasufr.ajax({url: "frm.Form.cls", data: {func: "Get", id: t.id, date: t.date}, success: FillData, error: function() {l.progressOff()}});
    }

    function FillData(d) {
        l.progressOff();
        var data = JSON.parse(d);

        frmMain.clear();
        if (data.json.form) {
            if (data.json.form.from) data.json.form.from = iasufr.dateFromStr(data.json.form.from);
            if (data.json.form.to) data.json.form.to = iasufr.dateFromStr(data.json.form.to);
            frmMain.setFormData(data.json.form);
            selDep = {id: data.json.form.depId};
        }
        g.clearAll();
        if (data.json.tables) {
            for (var i= 0; i < data.json.tables.length; i++) g.addRow(data.json.tables[i].id, [data.json.tables[i].id,data.json.tables[i].name], g.getRowsNum());
            g.setSelectedRow(g.getRowId(0));
        }
    }

    function onTableToolbarClick(name) {
        switch (name) {
            case "print": ShowPrintSettings(); break;
            case "add": {
                var newId = (new Date()).valueOf();
                g.addRow(newId, ["", "Таблиця " + (g.getRowsNum() + 1).toString()]);
                break;
            }
            case "del": {
                if (g.getRowsNum() <= 1) {
                    dhtmlx.alert("Неможливо видалити останню таблицю");
                    return;
                }
                dhtmlx.confirm({text: iasufr.lang.msg.delete, callback: function(r) { if (r) g.deleteRow(g.getSelectedId()); g.setSelectedRow(g.getRowId(0))}});
                break;
            }
        }
    }

    function ShowPrintSettings() {
        var w = iasufr.wins.createWindow("prn" + new Date().getTime().toString(), 0, 0, 530, 400);
        w.setText("Параметри друку. Форма: " + frmMain.getItemValue("code"));
        w.setModal(true);
        w.centerOnScreen();
        var frm = w.attachForm(printFrmData);

        var tb = w.attachToolbar();
        tb.setIconPath(iasufr.const.ICO_PATH);
        tb.setIconSize(16);
        tb.addButton("save", 1, "Зберегти", "16/tick.png", "");
        tb.addButton("cancel", 2, "Скасувати", "16/cross.png", "");
        tb.attachEvent("onClick", function (name) {
            if (name="cancel") w.close();
            if (name="save") {
                if (!frm.validate()) return;
            }
        });
    }



    function OrgSelect(o, $txt){
        selDep = o;
        $txt.val("(" + o.code + ") " + o.name);
    }

    function onToolbarClick(name) {
        switch (name) {
            case "save": SaveData(); break;
            case "cancel": iasufr.close(t); break;
        }
    }

    function SaveData() {
        if (!frmMain.validate()) return;
        var obj = $.extend({}, frmMain.getFormData(true), {
            depId: selDep.id,
            id: t.id,
            date: t.date
        });
        if (editMode) {
            obj.tables = [];
            for (var i= 0; i < g.getRowsNum(); i++) {
                obj.tables.push({id: g.cells2(i, 0).getValue(), name: g.cells2(i, 1).getValue() });
            }
        }
        iasufr.removeEmptyFields(obj);


        //console.log(JSON.stringify(obj));

        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: editMode ? "Edit" : "Add", json: JSON.stringify(obj)},
            success: onSuccess,
            error: function(){if (t.owner.progressOn) t.owner.progressOff()}
        });
    }

    function onSuccess(data){
        if (t.owner.progressOn) t.owner.progressOff();
        var id;
        try {
            var d = JSON.parse(data);
            id = d.Id;
        } catch (e) {return}
        if (t.onSave) t.onSave(id);
        iasufr.close(t);
    }

    return this;
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/form/formAdd.js