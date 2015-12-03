if (!window.Fin) Fin = {};
if (!Fin.HomeAskEdit) Fin.HomeAskEdit = {};

Fin.HomeAskEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idRow=t.opt.idRow;
    var idOrg=t.opt.idOrg;
    var addZ=t.opt.addZ;  // заявка
	if (idOrg=="") idOrg=iasufr.user.orgId;
    var home=t.opt.home;
    t.owner.setModal(true);
    t.owner.button("park").disable();

    var toolbar;
    var form;
    var edit;
    var selUser={};

    t.owner.progressOn();

    toolbar = t.owner.attachToolbar();
    InitToolBar();

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        var pp="Вiдправити"; if (iasufr.pGrp(1)) pp=iasufr.lang.ui.save;
            toolbar.addButton("save", 1, pp , "32/database_save.png", "32/database_save.png");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {

            if (id == 'save')  {  Save() }
            if (id == 'close') {iasufr.close(t);   }
        }); // onClick
    }

    LoadData();

   function LoadData() { 
         iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeAskEdit", json: JSON.stringify( {idRow:idRow, idOrg:idOrg, home:home, addZ:addZ} ) } ,
             success: function (data) { 
             var jso = JSON.parse(data);
             var frm  = jso.form;
             edit = jso.Edit;
             form = t.owner.attachForm(frm);
             if ( iasufr.pGrp(1) ) $(form.getInput("TextV")).focus();
             else $(form.getInput("Text")).focus();

             //if (iasufr.user.login==cesna)  if ( iasufr.pGrp(1) )
             iasufr.attachSelector(form.getInput("Komu"), "Users",  { width:1100,height:600, ignoreReadonly:true, selectUser:true, onSelect: UserSelect});
             t.owner.progressOff();
             if (edit==0)  toolbar.disableItem("save");
             //var obj=form.getItemsList()[2];
             //$(obj).attr('title','Вiдмiтити, щоб введений текст мав статус заявки на реєстрацiю користувача у системi');
             //console.log(obj+'-'+ $(obj).attr('title') );
          }
         });
    }

    function UserSelect(o, $txt)  { selUser = o;
        if ( o ) { $txt.val(o.fio+' /'+ o.post+' /' + o.orgName);
            //iasufr.enableAskBeforClose(t);
        }

    }

    function Save() {
            if ( (addZ==1) && (form.getItemValue("zFIO")=="") ) { iasufr.message("Перевiрте строки !"); return; }
            if ( addZ!=1) { if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }  }
            t.owner.progressOn();
            var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
            var dateV=""; var textV="";
            if (form.getCalendar("DateV")) { dateV = iasufr.formatDateStr(form.getCalendar("DateV").getDate(true));
                                             textV = form.getItemValue("TextV")
            }
            var pRead=0; if (form.isItemChecked('Read')) pRead=1;
            var komu="";   if (selUser) { komu=selUser.id; }
            var json = {idOrg: idOrg, idRow:idRow, DateN:dateN, DateV:dateV,  Text:form.getItemValue("Text"),  TextV:textV,home:home,Read:pRead,zFIO:form.getItemValue("zFIO"),zPos:form.getItemValue("zPos"),zTel:form.getItemValue("zTel"),Komu:komu};
            console.log(JSON.stringify(json));
            iasufr.ajax({
                url: "fin.Home.cls",
                data: {func: "HomeAskSave", json: JSON.stringify(json)},
                success: onSuccess,
                error: function() {if (t.owner.progressOn) t.owner.progressOff(); }
            });
    }

        function onSuccess(data) { var jso = JSON.parse(data);
                                   var count  = jso.count;
								   //console.log(count);
                                   t.owner.progressOff();
                                   iasufr.messageSuccess("Збережено !");
								   if (count==0) deactivateHelper();
                                   if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список в таблице
                                   iasufr.close(t);                                    
        }


    return t;
};
