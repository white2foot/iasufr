if (!window.Fin) Fin = {};
if (!Fin.HomeCont) Fin.HomeCont = {};

Fin.HomeCont.Create = function (opt) {
    var t=iasufr.initForm(this, opt);

    var user=iasufr.user;
    var toolbar;
    var gD;
    t.owner.progressOn();

    var expand=1;
    var FlagName=0;
    var FlagDrop=0;
    var CountRow=1000;


    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells('a').hideHeader();

    if (!opt.select )  { toolbar = main.attachToolbar();   InitToolBar(); }

    var tbOrg =main.cells('a').attachToolbar();
    tbOrg.setIconsPath(iasufr.const.ICO_PATH);
    tbOrg.addText("OrgT", 1, "Органiзацiя ");
    tbOrg.addInput("Org", 2, "",350);


    //----------------------------------------
    var selOrg = {}; selOrg.id=user.orgId;
    var orgName=user.orgName;
    var code=user.orgCode;
    if (code) orgName="("+code+")" + orgName;
    $(tbOrg.getInput("Org")).val(orgName);
    //-------------------------------------------------------------
    var nameGrp = null; nameGrp = [];

    var id="";  if (!iasufr.pGrp(1)) { id=selOrg.id;   }
    if (iasufr.pGrp(1)) iasufr.attachSelector(tbOrg.getInput("Org"), "OrgSelector",  {idOrg: id, onSelect: OrgSelect});
    function OrgSelect(o, $txt)   { selOrg = o; 
        if (o) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
        if (selOrg==null) { selOrg={}; selOrg.id=0; }
        Reload(); }

    function OrgSelectC(o, $txt)   { selOrg = o;
        if (o) {   if (o.name!=undefined)  { var name="(" + o.code + ") " + o.name;  $(tbOrg.getInput("Org")).val(name); } }
        if (selOrg==null) { selOrg={}; selOrg.id=0; }
    Reload();
    }


    gD = main.cells('a').attachGrid();
    fin.initGridCont(gD,1);

    gD.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
        if  ( (stage==2) || (cInd==3) )   {
            var idRow =  gD.cells(rId,0).getValue();
            nameGrp.push( {idRow: idRow, cont: gD.cells(rId, 1).getValue(), txt: gD.cells(rId, 2).getValue(), kom: gD.cells(rId, 3).getValue(), grup: gD.cells(rId, 4).getValue(), url: gD.cells(rId, 5).getValue() } );
            iasufr.enableAskBeforClose(t);
        }
        return true
    });


    /*
    if (opt.select) { gD.attachEvent("onRowSelect", function (id) {
        var name = gD.cells(gD.getSelectedId(), 0).getValue();
        opt.onSelect({id:id, name:name, idOrg:selOrg.id});
        iasufr.close(t)
    });
    }
    */
    LoadSpr();
    // заполнить  справочником ^Home(idOrg,"GK" - группы контактов
    function LoadSpr() {
        iasufr.ajax({
            url:'fin.Org.cls',
            data:{func:'OrgGetForm', Sel:"cont", Sel1:"grup", idOrg:selOrg.id},
            success: function (data) {
                var jso=JSON.parse(data);
                var combo = gD.getCombo(1);
                var combo1 = gD.getCombo(4); 
				combo1.clear();
				gD.clearAll();
				if (jso.cont) { for (var i = 0; i < jso.cont.length; i++) { combo.put(jso.cont[i][0],jso.cont[i][1]); }}
                
				if (jso.grup) { for (var i = 0; i < jso.grup.length; i++) { combo1.put(jso.grup[i][0],jso.grup[i][1]); }}
                LoadData(1);

            }
        });
    }

    function LoadData(edit) { gD.clearAll();
         iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeContGet", json: JSON.stringify( {idOrg:selOrg.id, edit:edit}) }, success: function (data) {
         var jso = JSON.parse(data);
         gD.parse(jso, 'json');
         t.owner.progressOff();
         //fin.ContGrid(555);
         }
         });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);  //
        toolbar.addButton("print", 2,iasufr.lang.ui.print , "32/printer_empty.png", "");
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", ""); 
        toolbar.addButton("add", 3,iasufr.lang.ui.add, "32/toolbar_add.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        if (iasufr.pGrp(1))  toolbar.addButton("sel", 5, "Oрганiзацii з контактами", "32/application_view_detail.png", "");

        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idStan=GetId();
            //iasufr.gridRowFocus(gD, idStan);
            if (id == 'save')  {   Save();  }
            if (id == 'add') {
                CountRow = CountRow +1;  var idn = CountRow; 
                var prnt=0; var ind=0;
                gD.addRow(idn, ["",1,"","",""], ind);
                gD.setRowTextStyle(idn, "color: red;"); 
                nameGrp.push( {idRow: idn, cont: 1} );
                iasufr.enableAskBeforClose(t);
            }

           if (id == 'del') { if  (!idStan) { iasufr.message('Вкажiть строку !'); return; }
                              //if ( iasufr.enableAskBeforClose(t) ) { iasufr.message('Спочатку збережiть змiни або виконайте "Оновити" !'); return; }

                              iasufr.confirm(iasufr.lang.msg.delete, DelStan);
           }
            if (id == "sel")  {   iasufr.loadForm("OrgSelector", {width:1000, height:800,  HomeCont:1, onSelect: OrgSelectC } );  }
            if (id == 'print')  {gD.printView();  }
            if (id == 'reload') {  Reload(); }
            if (id == 'close')  { iasufr.close(t);   }
        }); // onClick
    }

    function cke() {
        var htm="<span style='font-weight:bold; font-size:18px;'>Протокол заседания правления,<br>ревиз.комиссии</span>";
        alert(htm);
        // frm.getInput(frm.getItemsList()[i])
        window.CKEDITOR.replace($(tbOrg.getInput("Org")), {
            toolbar : 'Basic',
            uiColor : '#b4cff4',
            language: 'uk',
            resize_enabled: false,
            width: "800px",
            height: "500px",
            enterMode : window.CKEDITOR.ENTER_BR,
            toolbar:[
                { name: 'actions', items: ['Undo', 'Redo'] },
                { name: 'basicstyles', items : [ 'FontSize', 'TextColor','BGColor', '-', 'Bold','Underline','Italic','-','RemoveFormat' ] },
                { name: 'paragraph',   items : [ 'JustifyLeft','JustifyCenter','JustifyRight','-', 'NumberedList','BulletedList'] },
                { name: 'add', items: ['Table','HorizontalRule','PageBreak']},
                { name: 'add2', items: ['ShowBlocks','Maximize']},
                { name: 'src', items: ['Source']}]
        });
    }
    function GetId() {  if (gD.getSelectedId()==null) return 0;
                        var ind=gD.getRowId(gD.getRowIndex(gD.getSelectedId()));
                        return gD.cells(ind,0).getValue();

        //return gD.getRowId(gD.getRowIndex(gD.getSelectedId()));
    }

    function Reload() { t.owner.progressOn(); //gD.clearAll();
	            		LoadSpr();
                        iasufr.disableAskBeforClose(t);
                        nameGrp = null; nameGrp = [];
                        if ($(tbOrg.getInput("Org")).val()=="") $(tbOrg.getInput("Org")).val(orgName);
                        //LoadData(1);
    }

    function DelStan() { var idStan=GetId();
                iasufr.ajax( {url:'fin.Home.cls',
                data:{ func: "HomeContDel", json: JSON.stringify( {idOrg: selOrg.id, idStan:idStan } )},
                success: function(d) { iasufr.messageSuccess("Видалено !");  iasufr.disableAskBeforClose(t);  Reload();  },
                error: function() { if (main.progressOn) main.progressOff() }
                            });
    }

    function Save() {
        var json={idOrg: selOrg.id, Name: nameGrp };
        iasufr.ajax({
            url: "fin.Home.cls",
            data: {func: "HomeContSave", json: JSON.stringify(json)},
            success: function() { t.owner.progressOff();  iasufr.messageSuccess("Збережено !");
                                  nameGrp = null; nameGrp = [];
                                  iasufr.disableAskBeforClose(t);
                                  Reload(); },
            error: function(){if (t.owner.progressOn) t.owner.progressOff()}
        });
    }

    return t;
};
