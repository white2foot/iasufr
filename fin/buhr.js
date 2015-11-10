if (!window.Fin) Fin = {};
if (!Fin.Buhr) Fin.Buhr = {};

Fin.Buhr.Create = function (opt) {
    var win = iasufr.initForm(this, opt);
    var dostOsn=iasufr.pFunc("buhrOsn");
    var dostSubrah=iasufr.pFunc("buhrSubrah");
    var dostSubrahP=iasufr.pFunc("buhrSubrahP");

    var user=iasufr.user;
    var toolbar;
    var gD;
    win.owner.progressOn();

    var expand=0;
    var item="";
    var main = new dhtmlXLayoutObject(win.owner, '1C');
    main.cells('a').hideHeader();

    if (!opt.select )  { toolbar = main.attachToolbar();   InitToolBar(); }  // нет входа извне


    var tbOrg =main.cells('a').attachToolbar();
    tbOrg.setIconsPath(iasufr.const.ICO_PATH);
    tbOrg.addText("OrgT", 1, "Органiзацiя ");
    tbOrg.addInput("Org", 2, "",350);


    function OrgSelect(o, $txt)   { selOrg = o;
        if (o) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
        if (selOrg==null) { selOrg={}; selOrg.id=0; }
        LoadData(); }

    //----------------------------------------
    var selOrg = {}; var orgName="";
    if (!win.opt.idOrg ) {
        selOrg.id=user.orgId;
        orgName=user.orgName;
        var code=user.orgCode;
        if (code) orgName="("+code+")" + orgName;
    }
    else { selOrg.id=win.opt.idOrg;  orgName=win.opt.orgName;    }
    $(tbOrg.getInput("Org")).val(orgName);
    //-----------------------------------------
    // ---
    var idOrgHelp=0; if (selOrg.id) idOrgHelp=selOrg.id;
    if (!opt.select ) iasufr.attachSelector(tbOrg.getInput("Org"), "OrgSelector",  { idOrg:idOrgHelp, onSelect: OrgSelect});
    $(tbOrg.getInput("Org")).attr('readonly', true);
    //-------------------------------------------------------------


    gD = main.cells('a').attachGrid();

    if (opt.select) { gD.attachEvent("onRowSelect", function (id) {
        var name = gD.cells(gD.getSelectedId(), 0).getValue();
        if (gD.getParentId(id)) { name = name + "/" + gD.cells(gD.getParentId(id), 0).getValue(); }
        opt.onSelect({id:id, name:name, idOrg:selOrg.id});
        iasufr.close(win)
    });
    }

    gD.setImagePath(iasufr.const.IMG_PATH);
    gD.setHeader('Клас / Група / Рахунок / Субрахунок,');
    gD.setInitWidths('700,100');
    gD.setColAlign('left,center');
    gD.setColTypes("tree,ro");
    gD.attachHeader("#text_filter,#rspan");
    gD.init();
    gD.setColumnHidden(1,true);
    gD.enableTreeCellEdit(false);

    var nameGrp = [];
    gD.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
        if ( (stage==2) && (nValue!=oValue) )  { nameGrp.push( {idRow: rId, name: nValue} ); FlagName=1; }
        return true
    });

    iasufr.enableRowselectMode(gD);

    gD.attachEvent("onDrop", function(sId,tId,dId,sObj,tObj,sCol,tCol){
        gD.openItem(sId);
        FlagDrop=1;
        return true
    });

    LoadData();

    function LoadData() { gD.clearAll();
        iasufr.ajax({url:'fin.Buhr.cls', data: {func: "BuhrGetTree", json: JSON.stringify( {idOrg:selOrg.id}) }, success: function (data) {
            var jso = JSON.parse(data); //alert(data);
            gD.parse(jso, 'json');
            gD.expandAll();
            for (var i = 0; i < gD.getRowsNum(); i++) {  var idr=gD.getRowId(i);
                var sub=gD.getSubItems(idr);
                var prnt=gD.getParentId(idr);
                if  ((prnt==0) && (sub!=''))  { gD.setRowTextStyle(idr, "font-weight: bold;");
                    gD.setItemImage(idr, iasufr.const.ICO_PATH + "16/folder.png");
                }
                //if  (sub!='')   gD.setRowTextStyle(idr, "font-weight: bold;");
                //if  (sub!='')   gD.setItemImage(idr, iasufr.const.ICO_PATH + "16/folder.png");

                if  (gD.cells2(i, 1).getValue()==3) { gD.setItemImage(idr, iasufr.const.ICO_PATH + "16/book.png");
                    gD.setRowTextStyle(idr, "color: #0000cc; font-weight: bold;");   }
            }
            //alert(expand);
            //if (expand==1) { gD.collapseAll(); expand=0;  }
            //if (expand==0) { gD.expandAll(); expand=1;    }

            gD.collapseAll();
            if (item!="") gD.openItem(item);
            iasufr.gridRowFocusApply(gD);
            win.owner.progressOff();
        }
        });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("print", 2, "Друк", "32/printer_empty.png", "");
       if ( (dostOsn)||(dostSubrah)||(dostSubrahP) ) {
         toolbar.addButton("add", 3,iasufr.lang.ui.add, "32/toolbar_add.png", "");
         toolbar.addButton("edit", 4, iasufr.lang.ui.edit , "32/toolbar_edit.png", "");
       }

        toolbar.addButton("grup", 6, "Згорнути / Розгорнути", "32/group_stroke.png", "");
        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");

        //toolbar.addButton("addS", 8, "Додати субрахунок", "32/toolbar_add.png", "");
        //toolbar.addButton("editS", 9, "Змiнити субрахунок", "32/toolbar_edit.png", "");
        toolbar.addButton("close", 10, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idRow=gD.getSelectedId();
            item=idRow;
            iasufr.gridRowFocus(gD, idRow);
            var name;

            if (id == 'grup')  { if (expand==1) { gD.collapseAll(); expand=0; return }
                if (expand==0) { gD.expandAll(); expand=1; return }
            }

            if (id == 'print')  {   gD.printView();  }
            if (id == 'reload')  {  Reload(); }

            if (id == 'close') { iasufr.close(win);  }
            var level;
            var dostNo="Немае доступу для корегування !";
            if (id == 'add') {
                if (!idRow) { iasufr.message("Вкажiть строку - до якоi додати !"); return }
                level=gD.cells(idRow, 1).getValue();
                //var p=idRow.split("."); idRow=p[0]+'.0';
                //alert(dostOsn+'-'+dostSubrah+'-'+dostSubrahP+'-'+idOrgHelp+'-'+selOrg.id+'-'+level);
                if ( (!dostOsn)&&(level<5) ) { iasufr.message(dostNo); return }
                if ( (!dostSubrah)&& ((level==5)||(level==51)) &&(idOrgHelp==selOrg.id) ) { iasufr.message(dostNo); return }
                if ( (!dostSubrahP)&& ((level==5)||(level==51)) &&(idOrgHelp!=selOrg.id) ) { iasufr.message(dostNo); return }

                iasufr.loadForm("BuhrEdit", {idBuhr:idRow, idOrg:selOrg.id,  Date:0, Level:level, Edit:0, modal:true, height:200, width:600, onSave: Reload});
            }
            if (id == 'edit') {
                var txt="Вкажiть строку !";
                if (!idRow) { iasufr.message(txt); return }
                //var p=idRow.split("/");
                //prnt=gD.getParentId(idRow);
                var sub=gD.getSubItems(idRow);
                level = gD.cells(idRow, 1).getValue();
                if ( (!dostOsn)&&(level<10) ) { iasufr.message(dostNo); return }
                if ( (!dostSubrah)&&(level==51)&&(idOrgHelp==selOrg.id) ) { iasufr.message(dostNo); return }
                if ( (!dostSubrahP)&&(level==51)&&(idOrgHelp!=selOrg.id) ) { iasufr.message(dostNo); return }
                iasufr.loadForm("BuhrEdit", {idBuhr:idRow, idOrg:selOrg.id, Date:0, Level:level, SubItem:sub, Edit:1, modal:true, height:200, width:600, onSave: Reload});
            }
        }); // onClick
    }

    function Reload() { win.owner.progressOn(); gD.clearAll();  expand=0;  LoadData();   }

    return win;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/buhr.js