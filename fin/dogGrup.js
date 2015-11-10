if (!window.Fin) Fin = {};
if (!Fin.DogGrup) Fin.DogGrup = {};

Fin.DogGrup.Create = function (opt) {
    var win = iasufr.initForm(this, opt);

    var toolbar;
    var gG;
    win.owner.progressOn();
    var Flag=0;
    var CountRow = 1000;

    var main = new dhtmlXLayoutObject(win.owner, '1C');
    main.cells('a').hideHeader();

    // if (!opt.select )      // нет входа извне
     toolbar = main.attachToolbar();   InitToolBar();

    gG = main.cells('a').attachGrid();
    gG.setImagePath(iasufr.const.IMG_PATH);
    gG.setIconsPath(iasufr.const.ICO_PATH);
    gG.setHeader('Код,Назва групи договору,Наявнiсть типу договору,');
    gG.setInitWidths('80,500,80,*');
    gG.setColAlign('center,left,center,left');
    gG.setColTypes("ro,ed,ro,ro");
    gG.setColSorting('str,str,str,str');
    gG.attachHeader("#text_filter,#text_filter,#rspan");
    gG.enableEditTabOnly(true);
    gG.init();

    //if (opt.select) { gG.setColumnHidden(0,true);   // вход извне для выбора и нет множеств. выбора - спрятать чекбоксы
    //    $(gG.entBox).css("cursor", "pointer");
    //    gG.enableRowsHover(true, "grid-row-hover");   }

    var cellHid=3;
    gG.setColumnHidden(cellHid,true);

    gG.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
        if ((stage==2)&&( nValue!=oValue)) { Flag=1; gG.cells(rowId,cellHid).setValue(1); }
        return true
    });
    
    //-----------------------------------------------------------------
    var tbOrg =main.cells('a').attachToolbar();
    tbOrg.setIconsPath(iasufr.const.ICO_PATH);
    tbOrg.addText("OrgT", 1, "Органiзацiя ");
    tbOrg.addInput("Org", 2, "",350);

    iasufr.attachSelector(tbOrg.getInput("Org"), "OrgSelector",  { onSelect: OrgSelect});
    function OrgSelect(o, $txt)   { selOrg = o;
        if (o) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
        if (selOrg==null) { selOrg={}; selOrg.id=0; }
        LoadData(); }

    var name=iasufr.user.orgName; var code=iasufr.user.orgCode;
    if (code!="") name="("+ code + ")"+ name;
    var selOrg={};  selOrg.id=iasufr.user.orgId; $(tbOrg.getInput("Org")).val(name);
    LoadData();



    function LoadData() { gG.clearAll();
        iasufr.ajax({url:'fin.Dog.cls', data: {func: "DogGetGrup", json: JSON.stringify( {idOrg:selOrg.id}) }, success: function (data) {
            var jso = JSON.parse(data);
            gG.parse(jso, 'json');
            win.owner.progressOff();
        }
        });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        if (opt.select) toolbar.addButton("select", 1, iasufr.lang.ui.select, "32/tick.png", "");
        toolbar.addButton("save", 1, "Зберегти", "32/database_save.png","");
        toolbar.addButton("print", 2, "Друк", "32/printer_empty.png", "");
        toolbar.addButton("add", 3,iasufr.lang.ui.add, "32/toolbar_add.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idGr=GetGrup(); if (id == 'add') idGr=0;
            iasufr.gridRowFocus(gG, idGr);

            if (opt.select) { if (id == 'select') {
                              if (!idGr) { iasufr.message('Вкажiть строку !'); return; }
                               var name = gG.cells(gG.getSelectedId(), 1).getValue();
                               var code=gG.getSelectedId();
                               opt.onSelect({id:code,name:name});
                               iasufr.close(win)
                                                   }
            }

            if (id == 'save')   {  SaveGrup();  }
            if (id == 'add') {
                CountRow = CountRow +1;
                var idn = CountRow;
                gG.addRow(idn, ['', '', '', ''], 0);
                window.setTimeout(function(){ gG.selectCell(0,1,false,false,true,true); gG.editCell() }, 1);
            }

            if (id == 'print')  {   gG.printView();  }
            if (id == 'reload') {  Reload(); }

            if (id == "close") {
                if (Flag) { dhtmlx.confirm("Записати змiни ?", function(result) { if (result) { SaveGrup(); }   });  }
                if (!Flag) iasufr.close(win);
            }

            if (id == 'del') { var idGrup=GetGrup();
                 if  (!idGrup) { iasufr.message('Вкажiть строку !'); return; }
                 var ind=gG.getRowIndex(gG.getSelectedId());
                 var plus=gG.cells2(ind,2).getValue();
                if  (plus=="+") { iasufr.message('Неможливо видалити - е типи договорiв !'); return; }
                 dhtmlx.confirm("Пiдтвердiть: видалити вибрану групу ? ", function (result) {
                       if (result) {
                        var json = {idOrg: selOrg.id, idGrup:idGrup };
                        iasufr.ajax({url:'fin.Dog.cls', data: {func: "DogDelGrup", json: JSON.stringify(json)}, success:function(d) {
                            iasufr.messageSuccess("Видалено !"); Flag=0;
                            Reload(); }
                        });
                       }
                 })
            }



        }); // onClic
    }
    function GetGrup() { return gG.getRowId(gG.getRowIndex(gG.getSelectedId())); }
    function Reload() { win.owner.progressOn(); gG.clearAll(); LoadData(); }

    function SaveGrup() {
        var json = {idOrg:selOrg.id};
        var RowCh = [];
        for (var i = 0; i < gG.getRowsNum(); i++) {
            if (gG.cells2(i, cellHid).getValue()==1) {
                RowCh.push({Kod: gG.cells2(i, 0).getValue(), Name: gG.cells2(i, 1).getValue() }); }
        }
        if (RowCh.length != 0) json = $.extend(json, {Row: RowCh});

        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "DogSaveGrup", json: JSON.stringify(json)},
            success: function() { win.owner.progressOff();  iasufr.messageSuccess("Збережено !"); Reload(); },
            error: function(){if (win.owner.progressOn) win.owner.progressOff()}
        });
    }


    return win;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/dogGrup.js