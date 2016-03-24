if (!window.Fin) Fin = {};
if (!Fin.PersTRedit) Fin.PersTRedit = {};

Fin.PersTRedit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    t.owner.button("park").disable();

    var idPers=t.opt.idPers;
    var idRow=t.opt.idRow;
    var jsonOpt = {idPers:idPers, idRow:idRow} ;
    var user=iasufr.user;
    var idOrgUser=user.orgId;
    var admin=iasufr.pGrp(1);

    var toolbar;
    var form;
    var idObj;
    var REF=null; REF=[];

    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells("a").hideHeader();
    main.progressOn();
    toolbar = main.attachToolbar();
    InitToolBar();
    LoadData();

    function LoadData() {
        iasufr.ajax({url:'fin.Pers.cls', data: {func: "AnketaTRedit", json: JSON.stringify(jsonOpt) } ,
            success: function (data) {
                var jso = JSON.parse(data);
                form = main.cells("a").attachForm(jso.form);
                main.progressOff();
                form.attachEvent("onChange", function (id, value){  iasufr.enableAskBeforClose(t);} );
                if (!admin) form.setReadonly("rek2", true);
                var dl=jso.Ref.length; var i,ref,refz,rek;
                for ( i = 0; i < dl; i++)  {  ref=jso.Ref[i][0]; refz=jso.Ref[i][1]; rek=jso.Ref[i][2]; var podch=jso.Ref[i][3];
                                              REF.push([ref, refz, rek, podch]);
                }

                //form.forEachItem(function(id){
                    var org=""; var tip=""; var orgName;
                    for( i=0; i<REF.length;  i++){  var js=REF[i][0]; var rek=REF[i][2]; var podch=REF[i][3];
                                                    org=""; tip=""; orgName="";                                                                                      // dep=15 - факультеты - тип организации
                                                    if ( (podch=='department') || (js=='DogPrice') ) { org=form.getItemValue("rek2H"); orgName=form.getItemValue("rek2"); tip=15;  if ((org==0)||(org=="")) org=idOrgUser; }
                                                    if ( (podch=='podch') && (!admin) ) { org=idOrgUser; }
                                                     iasufr.attachSelector(form.getInput(rek), js,  {  ignoreReadonly:true, onSelect: Select, idOrg:org, Tip:tip,  orgName:orgName });
                    }
                //});

                iasufr.disableAskBeforClose(t);
            }
        });
    }

    function Select(o,$txt)  {
        var id=$txt.context._idd; //alert(id+'---'+JSON.stringify(o));
        var idHid=id+"H";
        if ((id!="rek2")&&(id!="rek3")&&(id!="rek12")&&(id!="rek13")&&(id!="rek18")) {  if ( o ) { $txt.val(o[2]); form.setItemValue(id,o[2]); form.setItemValue(idHid,o[0]);}  }
        else { var zn="(" + o.code + ") " + o.name;
               if (id=="rek18") zn = o.name;   // прейскурант
               if (id=="rek12") zn = o.name + "(" + o.inn + ")"; //Фізична особа для договору
               if ( o ) { $txt.val(zn);  form.setItemValue(id, zn);  form.setItemValue(idHid, o.id);   }
        }
        if (id=="rek2") {
            iasufr.updateSelectorParam(form.getInput("rek3"), { idOrg:form.getItemValue("rek2H") } );
            iasufr.updateSelectorParam(form.getInput("rek18"), { idOrg:form.getItemValue("rek2H") , orgName:form.getItemValue("rek2")});
        }
        iasufr.enableAskBeforClose(t);
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
		//toolbar.addButton("print", 2,iasufr.lang.ui.print , "32/printer_empty.png", "");
		toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            if (id == 'save')  { Save()   }
			if (id == 'del')   { iasufr.confirm("Пiдтвердiть видалення", Del);   }
			if (id == 'close') iasufr.close(t);
        });
    }


    function Del() {
        iasufr.ajax({
            url: "fin.Pers.cls",
            data: {func: "AnketaTRdel", json: JSON.stringify(jsonOpt) },
            success: function() { main.progressOff();  if (opt.onSave) opt.onSave();
                iasufr.disableAskBeforClose(t);
                iasufr.messageSuccess("Видалено !"); iasufr.close(t); }
        });
    }
    function GetDate(dt) { dt=iasufr.formatDateStr(iasufr.replaceAll(dt,"/","."));  return dt }
    function Save() {
        if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
        main.progressOn();
        var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
        var rek14=""; if (form.getItemValue("rek14")!="") rek14=iasufr.formatDateStr(form.getCalendar("rek14").getDate(true));
        var rek15=""; if (form.getItemValue("rek15")!="") rek15=iasufr.formatDateStr(form.getCalendar("rek15").getDate(true));
        var json = $.extend(form. getFormData(), {idPers:idPers, idRow:idRow});
        var json = $.extend( json, {DateN:dateN, rek14:rek14, rek15:rek15} );
        //alert(JSON.stringify(json));
        iasufr.ajax({
            url: "fin.Pers.cls",
            data: {func: "AnketaTRsave", json: JSON.stringify(json) },
            success: onSuccess,
            error: function() { if (main.progressOn) main.progressOff(); }
        });
    }

    function onSuccess(data) {
        var json=JSON.parse(data);
        iasufr.disableAskBeforClose(t);
        main.progressOff();
        iasufr.messageSuccess("Збережено !");
        //Reload();
        if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список в таблице
        iasufr.close(t);
    }

    function Reload() { return
        form.unload(); form=null;
        LoadData();
        main.progressOff();
    }

    return t;
};
//dogTxtEdit.js