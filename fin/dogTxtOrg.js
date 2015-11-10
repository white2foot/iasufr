if (!window.Fin) Fin = {};
if (!Fin.DogTxtOrg) Fin.DogTxtOrg = {};

Fin.DogTxtOrg.Create = function (opt) {
    var t=iasufr.initForm(this, opt);
    var user=iasufr.user;
    var toolbar;
    var gD;
    t.owner.progressOn();

    var CountRow=1000;
    var pHeader=0;


    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells('a').hideHeader();

    if (!opt.select )  { toolbar = main.attachToolbar();   InitToolBar(); }

    var tbOrg =main.cells('a').attachToolbar();
    tbOrg.setIconsPath(iasufr.const.ICO_PATH);

    tbOrg.addText("OrgT", 10, "Органiзацiя ");
    tbOrg.addInput("Org", 11, "",350);
    tbOrg.addSeparator("sep", 8);

    //----------------------------------------
    var selOrg = {};
    if ( !opt.select ) {
        selOrg.id=user.orgId;
        var orgName=user.orgName;
        var code=user.orgCode;
        if (code) orgName="("+code+")" + orgName;
    }
    else {
        selOrg.id=t.opt.idOrg;
        var orgName=t.opt.idOrgName;
    }
    $(tbOrg.getInput("Org")).val(orgName);
    //-------------------------------------------------------------

    var id="";  if (!iasufr.pGrp(1)) { id=selOrg.id;   }  // ВЫБОР из справочника только самой организ. и подчиненных
    if (( !opt.select )&&( iasufr.pGrp(1) )) iasufr.attachSelector(tbOrg.getInput("Org"), "OrgSelector",  {idOrg: id, onSelect: OrgSelect});

    gD = main.cells('a').attachGrid();
    gD.setImagePath(iasufr.const.IMG_PATH);
    gD.setHeader('N,Код, Назва документу, Вид документу, Користувач,');
    gD.setInitWidths('20,50,600,130,180,*');
    gD.setColAlign('center,center,left,left,left,left');
    gD.setColTypes("ro,ro,ro,ro,ro,ro");
    gD.setColSorting('int,str,str,str,str,str');
    gD.init();
    iasufr.enableRowselectMode(gD);
    gD.setColumnHidden(0,true);

    LoadData(0);

    function LoadData(all) { gD.clearAll();
        var idOrg=0; if (selOrg) idOrg=selOrg.id;
        iasufr.ajax({url:'fin.DogOrg.cls', data: {func: "DogTxtOrgGet", json: JSON.stringify( {idOrg:idOrg,  all:all}) }, success: function (data) {
           var jso = JSON.parse(data);
           gD.parse(jso, 'json');
           gD.enableRowsHover(true, "grid-row-hover");
            if (opt.onSelect) {
                gD.attachEvent('onRowSelect', function (id)  {
                    var code=gD.cells(gD.getSelectedId(),1).getValue();
                    var name=gD.cells(gD.getSelectedId(),2).getValue();
                     opt.onSelect({id:code, name:name});
                    iasufr.close(t);
                });
            }

            //--------------------------------------------
            if ((gD.getRowsNum() > 0) && (pHeader == 0)) {
                gD.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
                pHeader = 1;
            }
            if  (gD.getRowsNum() == 0) { gD.detachHeader(1);  pHeader = 0;   }
            gD.setSizes();
            //--------------------------------------------
            var cnt = gD.getRowsNum(); var i;
            if (pHeader==1) { for (i = 0; i < gD.getColumnsNum(); i++) $(gD.getFilterElement(i)).val("");  }
            //gD.sortRows(2,"str","desc");
            t.owner.progressOff();
        } });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);  // iasufr.lang.ui.print
        toolbar.addButton("test", 2,"test" , "32/printer_empty.png", "");
        toolbar.addButton("print", 2,iasufr.lang.ui.print , "32/printer_empty.png", "");
        toolbar.addButton("add", 1, iasufr.lang.ui.add, "32/toolbar_add.png", "32/toolbar_add.png");
        toolbar.addButton("edit", 3,iasufr.lang.ui.edit, "32/toolbar_edit.png", "32/toolbar_edit.png");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "32/toolbar_delete.png");
        if (iasufr.pGrp(1))   toolbar.addButton("sel1", 6, "Усi тексти договорiв", "32/manage_sources.png", "");

        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idDog=GetId();
            //iasufr.gridRowFocus(gD, idStan);
            if (id == 'test') {  Excel();
            }
           if (id == 'del') { if  (!idDog) { iasufr.message('Вкажiть строку !'); return; }
                              iasufr.confirm(iasufr.lang.msg.delete, Del);
           }
            if ((id == "edit")||(id == "add")) {
                 if (id == "add") idDog=0;
                 iasufr.loadForm("DogTxtEdit", {onSave: Reload, width: 830, height: 830, idOrg:selOrg.id, idDog:idDog});
            }
            if (id == 'print')  {  gD.printView();        }
            if (id == 'reload') {  Reload(); }
            if (id == 'close')  {  iasufr.close(t);   }
            if (id == 'sel1') { ChangeBut(0); LoadData(1);  }
        }); // onClick
    }

    function Excel()   {
        var stroka="103,372";

        iasufr.ajax( {url:'fin.DogOrg.cls',
            data:{ func: "getOrgAdres", json: JSON.stringify( {sel:stroka} ) },
            success: function(d) { iasufr.messageSuccess("Сформовано файл !");
                var jso =JSON.parse(d); alert(d);
                var A = [[1,2,3]];
                for (var i = 0; i < jso.Adres.length; i++) { A.push([jso.Adres[i].Name, jso.Adres[i].Street,jso.Adres[i].City]); }

                var csvRows = [];
                for(var i=0, l=A.length; i<l; ++i){
                    csvRows.push(A[i].join(';'));
                }
                csvRows.splice(0, 0, "sep=;");
                var csvString = csvRows.join("%0A");
                iasufr.downloadData("Adresa.csv", csvString, 'data:attachment/csv,');

            },
            error: function() { if (t.owner.progressOn) t.owner.progressOff() }
        });

        /*
        var A = [['n','sqrt(n)']];
        for(var j=1; j<10; ++j){
            A.push([j, Math.sqrt(j)]);
        }
        */


    }

    function ChangeBut(pri)   {
        if (pri==0) {
           toolbar.disableItem("add");
           toolbar.disableItem("edit");
           toolbar.disableItem("del");
           $(tbOrg.getInput("Org")).val("");
        }
        if (pri==1) {
           toolbar.enableItem("add");
           toolbar.enableItem("edit");
           toolbar.enableItem("del");
        }
    }
    function OrgSelect(o, $txt)   { selOrg = o;
        if (o.id>0) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
        if (selOrg==null) { selOrg={}; selOrg.id=0; }
        Reload();
    }

    function GetId() {  if (gD.getSelectedId()==null) return 0;
                        var ind=gD.getRowId(gD.getRowIndex(gD.getSelectedId()));
                        return gD.cells(ind,0).getValue();

        //return gD.getRowId(gD.getRowIndex(gD.getSelectedId()));
    }

    function Reload() { t.owner.progressOn(); gD.clearAll();
                        
                        if ($(tbOrg.getInput("Org")).val()=="") $(tbOrg.getInput("Org")).val(orgName);
                        LoadData(0);
                        ChangeBut(1);

    }

    function Del() { var idDog=GetId();
                iasufr.ajax( {url:'fin.DogOrg.cls',
                     data:{ func: "DogTxtDel", json: JSON.stringify( {idDog:idDog, idOrg:selOrg.id} ) },
                     success: function(d) { iasufr.messageSuccess("Видалено !");    Reload();  },
                     error: function() { if (main.progressOn) main.progressOff() }
                });
    }


    return t;
};
