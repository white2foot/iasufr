if (!window.Fin) Fin = {};
if (!Fin.HomeCommentEdit) Fin.HomeCommentEdit = {};

Fin.HomeCommentEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idRow=t.opt.idRow;
    var idOrg=t.opt.idOrg;
    t.owner.setModal(true);
    t.owner.button("park").disable();

    var toolbar;
    var form;

    t.owner.progressOn();

    toolbar = t.owner.attachToolbar();
    InitToolBar();

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);

        toolbar.addButton("save", 1, "Вiдправити", "32/database_save.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {

            if (id == 'save')  {  Save() }
            if (id == 'close') {iasufr.close(t);   }
        }); // onClick
    }

    LoadData();

   function LoadData() { 
         iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeCommentEdit", json: JSON.stringify( {idRow:idRow, idOrg:idOrg} ) } ,
             success: function (data) { 
             var jso = JSON.parse(data);
             var frm=jso.form;
             form = t.owner.attachForm(frm);
             $(form.getInput("Text")).focus();
             t.owner.progressOff();
         }
         });
    }

    function Save() {
            if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
            var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));

            t.owner.progressOn();
            var json = {idOrg: idOrg, idRow:idRow, DateN:dateN,  Text:form.getItemValue("Text")};
            iasufr.ajax({
                url: "fin.Home.cls",
                data: {func: "HomeCommentSave", json: JSON.stringify(json)},
                success: onSuccess,
                error: function() {if (t.owner.progressOn) t.owner.progressOff(); }
            });
    }

        function onSuccess(data) {
                                   t.owner.progressOff();
                                   iasufr.messageSuccess("Збережено !");
                                   if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список в таблице
                                   iasufr.close(t);                                    
        }


    return t;
};
