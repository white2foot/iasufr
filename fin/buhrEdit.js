// корректировка субсчетов для организации ^Buhr("D",date,"R",idR,"SR",idOrg,idRS)
//
if (!window.Fin) Fin = {};
if (!Fin.BuhrEdit) Fin.BuhrEdit = {};

Fin.BuhrEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idBuhr=t.opt.idBuhr;
    var idOrg=t.opt.idOrg;
    var Date=t.opt.Date;
    //t.owner.setText(opt.NameP);

    var toolbar;
    var form;
    var gD;
    var tb;
    var FlagCh=0;

    var selGrup = null;
    t.owner.progressOn();

    toolbar = t.owner.attachToolbar();    InitToolBar();

    LoadData();

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        if (t.opt.SubItem == "") toolbar.addButton("del", 4,  iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");
        toolbar.attachEvent("onClick", function (id) {
            if (id == 'save')  {  Save() }
            if (id == 'del')   {  iasufr.confirm(iasufr.lang.msg.delete, Del);   }
            if (id == 'close') {
                if ( FlagCh ) {
                    dhtmlx.confirm("Записати змiни ?", function(result) {
                        if (result) Save();
                        else iasufr.close(t);
                    } );

                }
                if (!FlagCh)  iasufr.close(t);
            }
        }); // onClick
    }

    function LoadData() {

        iasufr.ajax({url:'fin.Buhr.cls', data: {func: "BuhrEdit", json: JSON.stringify( {idBuhr:idBuhr, idOrg:idOrg, Date:Date, Level:t.opt.Level, Edit:t.opt.Edit} ) } ,
            success: function (data) {
                var jso = JSON.parse(data);
                form = t.owner.attachForm(jso);
                t.owner.setText(form.getItemValue("Title"));
                form.attachEvent("onChange", function (id, value){ FlagCh=1; });
                FlagCh=0;
                $(form.getInput("Num")).focus();
                $(form.getInput("Name")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Kom")).focus()  });
                $(form.getInput("Num")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Name")).focus()  });
                $(form.getInput("Kom")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Num")).focus()  });
                t.owner.progressOff();
            }
        });
    }

    function Del() {
        iasufr.ajax({
            url: "fin.Buhr.cls",
            data: {func: "BuhrDel", json: JSON.stringify({idBuhr: idBuhr, idOrg:idOrg, Date: Date, Level: t.opt.Level }) },
            success: function() { t.owner.progressOff(); if (opt.onSave) opt.onSave();
                iasufr.messageSuccess("Видалено !"); iasufr.close(t); }
        });
    }

     function Save() {
        if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
        t.owner.progressOn();
        var json = { idOrg:idOrg, idBuhr:idBuhr, Date: Date, Name:form.getItemValue("Name"), Level: t.opt.Level, Parent:form.getItemValue("Parent"), Edit:t.opt.Edit, Num:form.getItemValue("Num"), Kom:form.getItemValue("Kom") };
        // alert(JSON.stringify(json)); return
        iasufr.ajax({
            url: "fin.Buhr.cls",
            data: {func: "BuhrSave", json: JSON.stringify(json)},
            success: onSuccess,
            error: function() {if (t.owner.progressOn) t.owner.progressOff(); }
        });
     }

     function onSuccess(data) {
        t.owner.progressOff();
        iasufr.messageSuccess("Збережено !");
        if (opt.onSave) opt.onSave();
        iasufr.close(t);
     }


    return t;
};
//@ sourceURL=BuhrEdit.js