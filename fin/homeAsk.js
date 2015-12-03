if (!window.Fin) Fin = {};
if (!Fin.HomeAsk) Fin.HomeAsk = {};

Fin.HomeAsk.Create = function (opt) {
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

    tbOrg.addText("dt1", 3, "Перiод з ");
    var dn = iasufr.formatDate(new Date());
    dn="01.01"+dn.substr(5,10);
    tbOrg.addInput("dtn", 4, dn, 72);
    tbOrg.addSeparator("sep1", 5);

    tbOrg.addText("dt2", 3, " по ");
    var dk = iasufr.formatDate(new Date());
    tbOrg.addInput("dtk", 4, dk, 72);
    tbOrg.addSeparator("sep2", 5);

    tbOrg.addText("OrgT", 10, "Органiзацiя ");
    tbOrg.addInput("Org", 11, "",350);
    tbOrg.addSeparator("sep", 8);

    var c1 = new dhtmlXCalendarObject({input: tbOrg.getInput("dtn")});
    c1.attachEvent("onClick", Reload);
    c1.hideTime();
    c1.setDateFormat("%d.%m.%Y");

    var c2 = new dhtmlXCalendarObject({input: tbOrg.getInput("dtk")});
    c2.attachEvent("onClick", Reload);
    c2.hideTime();
    c2.setDateFormat("%d.%m.%Y");

    $(tbOrg.getInput("dtn")).keydown(function(e){if (e.keyCode == 13) $(tbOrg.getInput("dtk")).focus();  });
    $(tbOrg.getInput("dtk")).keydown(function(e){if (e.keyCode == 13) $(tbOrg.getInput("dtn")).focus();  });
    //----------------------------------------
    var selOrg = {}; selOrg.id=user.orgId;
    var orgName=user.orgName;
    var code=user.orgCode;
    if (code) orgName="("+code+")" + orgName;
    $(tbOrg.getInput("Org")).val(orgName);
    //-------------------------------------------------------------

    var id="";  if (!iasufr.pGrp(1)) { id=selOrg.id;   }  // ВЫБОР из справочника только самой организ. и подчиненных
    if (iasufr.pGrp(1)) iasufr.attachSelector(tbOrg.getInput("Org"), "OrgSelector",  {idOrg: id,  onSelect: OrgSelect});

    gD = main.cells('a').attachGrid();
    gD.setImagePath(iasufr.const.IMG_PATH);
    gD.setHeader('N, Дата,Час, Текст питання, Користувач, Текст вiдповiдi,Дата,Час,Адмiн.,,');
    gD.setInitWidths('20,80,40,350,150,350,80,40,80,200,10');
    gD.setColAlign('center,center,center,left,left,left,center,center,left,left,left');
    gD.setColTypes("ro,dhxCalendarA,ro,ro,ro,ro,dhxCalendarA,ro,ro,ro,ro");
    gD.setColSorting('int,date,str,str,str,str,date,str,str,str,int');

    gD.init();

    iasufr.enableRowselectMode(gD);
    gD.setColumnHidden(0,true);
    gD.setColumnHidden(10,true);

    LoadData(0);

    function LoadData(all) { gD.clearAll();
        var d = tbOrg.getValue("dtn").split(".");
        var dn=d[2]+d[1]+d[0];
        d = tbOrg.getValue("dtk").split(".");
        var dk=d[2]+d[1]+d[0];
        iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeAskGet", json: JSON.stringify( {idOrg:selOrg.id, dn:dn, dk:dk, all:all}) }, success: function (data) {
           var jso = JSON.parse(data);
           gD.parse(jso, 'json');
            gD.sortRows(1,"date","des"); // asc
           gD.enableRowsHover(true, "grid-row-hover");
            //--------------------------------------------
            if ((gD.getRowsNum() > 0) && (pHeader == 0)) {
                gD.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#rspan,#rspan");
                pHeader = 1;
            }

            var cnt = gD.getRowsNum();  var i; var p; var title
            if (cnt>0) { for ( i = 0; i < cnt; i++) { p=gD.cells2(i, 10).getValue();
                if ((p==0))  { gD.setCellTextStyle(gD.getRowId(i),4,"color:#cc0000");
                               title=gD.cells2(i,4).getValue();
                               title += " - нема вiдмiтки користувача, що прочитав вiдповiдь";
                               $(gD.cells2(i, 4)).attr('title',title);
                }
            }
            }

            if  (gD.getRowsNum() == 0) { gD.detachHeader(1);  pHeader = 0;   }
            gD.setSizes();
            //--------------------------------------------

            if (pHeader==1) { for (i = 0; i < gD.getColumnsNum(); i++) $(gD.getFilterElement(i)).val("");  }
           t.owner.progressOff();
        } });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);  // iasufr.lang.ui.print
        toolbar.addButton("print", 1,iasufr.lang.ui.print , "32/printer_empty.png", "");
        toolbar.addButton("addZ", 2, iasufr.lang.ui.add + ' заявку', "32/toolbar_add.png", "32/toolbar_add.png");
        toolbar.addButton("add", 3, iasufr.lang.ui.add + ' питання', "32/toolbar_add.png", "32/toolbar_add.png");
        toolbar.addButton("edit", 4,iasufr.lang.ui.edit, "32/toolbar_edit.png", "32/toolbar_edit.png");
        toolbar.addButton("del", 5, iasufr.lang.ui.delete, "32/toolbar_delete.png", "32/toolbar_delete.png");
        //if (iasufr.pGrp(1))  { toolbar.addButton("sel", 5, "Oрганiзацii з запитаннями", "32/application_view_detail.png", "");
        toolbar.addButton("sel1", 6, "Усi питання", "32/manage_sources.png", "");

        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idRow=GetId();

           if (id == 'del') { if  (!idRow) { iasufr.message('Вкажiть строку !'); return; }
                var ind=gD.getRowIndex(gD.getSelectedId());
               if ( (!iasufr.pGrp(1)) && ( gD.cells2(ind,6).getValue()!="" ) ) { iasufr.message('Не можна видалити строку з вiдповiддю !'); return; }
                iasufr.confirm(iasufr.lang.msg.delete, Del);
           }
            if ((id == "edit")||(id == "add")) {
                 if (id == "add") idRow=0;
                 if ( (id == "edit")&&(!idRow) ) { iasufr.message('Вкажiть строку !'); return; }
                 var hei=580; if (id=="add") hei=330;
                 iasufr.loadForm("HomeAskEdit", {onSave: Reload, width: 700, height: hei, idOrg:selOrg.id, idRow:idRow, addZ:"0"});
            }
            if (id == "addZ") {
                idRow=0;
                iasufr.loadForm("HomeAskEdit", {onSave: Reload, width: 700, height: 280, idOrg:selOrg.id, idRow:idRow, addZ:"1"});
            }
            if (id == "sel")    {  iasufr.loadForm("OrgSelector", {width:1000, height:800,  HomeAsk:1, onSelect: OrgSelectC } );  }
            if (id == 'print')  {  gD.printView();        }
            if (id == 'reload') {  Reload(); }
            if (id == 'close')  {  iasufr.close(t);   }
            if (id == 'sel1') { ChangeBut(0); LoadData(1);  }
        }); // onClick
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
        if (o) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
        if (selOrg==null) { selOrg={}; selOrg.id=0; }
        Reload();
    }

    function OrgSelectC(o, $txt)   { selOrg = o;
        if (o) {   if (o.name!=undefined)  { var name="(" + o.code + ") " + o.name;  $(tbOrg.getInput("Org")).val(name); } }
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

    function Del() { var idRow=GetId();
                iasufr.ajax( {url:'fin.Home.cls',
                     data:{ func: "HomeAskDel", json: JSON.stringify( {idOrg: selOrg.id, idRow:idRow } )},
                     success: function(d) { iasufr.messageSuccess("Видалено !");    Reload();  },
                     error: function() { if (main.progressOn) main.progressOff() }
                });
    }


    return t;
};
