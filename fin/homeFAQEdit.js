if (!window.Fin) Fin = {};
if (!Fin.HomeFAQEdit) Fin.HomeFAQEdit = {};

Fin.HomeFAQEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idRow=t.opt.idRow;
    var idOrg=t.opt.idOrg;
	if (idOrg=="") idOrg=iasufr.user.orgId;
    var home=t.opt.home;
   t.owner.setModal(true);
   t.owner.button("park").disable();

    var toolbar;
    var form;
    var edit;

    t.owner.progressOn();

    toolbar = t.owner.attachToolbar();
    if (iasufr.pGrp(1)) InitToolBar();

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            if (id == 'save')  {  Save() }
            if (id == 'close') {iasufr.close(t);   }
        }); // onClick
    }

    LoadData();

   function LoadData() { 
         iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeFAQEdit", json: JSON.stringify( {idRow:idRow, idOrg:idOrg, home:home} ) } ,
             success: function (data) { 
                 var jso = JSON.parse(data);
                 var frm  = jso.form;
                 edit = jso.Edit;
                 form = t.owner.attachForm(frm);
                 $(form.getInput("Text1")).focus();
                 t.owner.progressOff();
                 //if (edit==0)  toolbar.disableItem("save");
             }
         });
   }

    function Save() {
            t.owner.progressOn();
            if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
            var text1 = form.getItemValue("Text1")

            var json = {Text1:form.getItemValue("Text1"), Text2:form.getItemValue("Text2"), idRow:idRow};
            iasufr.ajax({
                url: "fin.Home.cls",
                data: {func: "HomeFAQSave", json: JSON.stringify(json)},
                success: onSuccess,
                error: function() {if (t.owner.progressOn) t.owner.progressOff(); }
            });
    }

        function onSuccess(data) { var jso = JSON.parse(data);
                                   t.owner.progressOff();
                                   iasufr.messageSuccess("Збережено !");
								   if (opt.onSave) opt.onSave();
                                   iasufr.close(t);                                    
        }


    return t;
};
