if (!window.Fin) Fin = {};
if (!Fin.PersDocumEdit) Fin.PersDocumEdit = {};

Fin.PersDocumEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    t.owner.button("park").disable();

    var idPers=t.opt.idPers;
    var live=t.opt.Live;
    var jsonOpt = {idPers:idPers} ;
    var zag='Паспорт';
    t.owner.setText(zag);
    var toolbar;
    var form;
    var gS;
    var img="btn-select.png";
    var Counter=1000;

    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells("a").hideHeader();

    //main.progressOn();

    toolbar = main.attachToolbar();
    InitToolBar();
    InitTable();
    LoadData();

    function InitTable() {
        gS = main.cells("a").attachGrid();
        var hdr="Документ,,Серiя,Номер,Ким виданий,,Дата видачi,Дата закриття,1";
        var wid="200,25,80,80,300,25,80,*,10";
        var typ="ed,img,ed,ed,ed,img,dhxCalendarA,dhxCalendarA,ro";
        var align="center,left,center,center,left,left,center,center,left";

        gS.setHeader(hdr);
        gS.setInitWidths(wid);
        gS.setColAlign(align);
        gS.setColTypes(typ);
        gS.setImagePath(iasufr.const.IMG_PATH);
        gS.setIconsPath(iasufr.const.ICO_PATH);
        gS.enableEditTabOnly(true);
        //gS.enableTooltips("true,false,true,true,false,true,false,true");
        //                                                                                12       13
        gS.setColumnIds("tip,img,ser,num,kum,img1,dn,dk,tipK");
        gS.init();
        var arr1 = ["tipK"];
        for (var a in arr1) gS.setColumnHidden(gS.getColIndexById(arr1[a]),true);


        gS.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
            if ((stage==2)&&(nValue!=oValue))  iasufr.enableAskBeforClose(t);
            //----------------- --------------------------
            if  (stage == 2) { var nom=gS.getColIndexById('tip');}
            if ( (stage == 2) && (cellInd == nom) ) {
                var tip=gS.getColIndexById('tipK');
                if (nValue == '') { gS.cells(rowId, tip).setValue(''); }
                if ( (nValue!= oValue) && (nValue != '') ) {
                    iasufr.ajax({
                        url:'fin.Pers.cls',
                        data: {func: "getRspName", id: nValue,  path:"TD" },
                        error: function() {
                            gS.cells(rowId, nom).setValue("");
                            gS.cells(rowId, tip).setValue("");
                        },
                        success: function (data) {
                            var obj =JSON.parse(data);
                            gS.cells(rowId, nom).setValue(obj[2]);
                            gS.cells(rowId, tip).setValue(obj[0]);
                            if (obj.isMessage)  gS.cells(rowId, cellInd).setValue('');

                        } });
                }

            }

            //----------------
         return true
        });  // onEditCell


        gS.attachEvent("onRowSelect", function (id) {
            var ind = gS.getSelectedCellIndex();
            var ids = gS.getColumnId(ind-1);
            var selector=""; var idsK = ids+"K";
            if (ids=='tip')   selector='RspTD';
            if (ids =='kum')   selector='DocKemSelector';
            if (selector=='RspTD') {
                var nom=gS.getColIndexById(idsK);
                iasufr.loadForm(selector,{select:true, onSelect:function(p) {
                    if (ids=='tip') { gS.cells(id,nom).setValue(p[0]);  gS.cells(id,ind-1).setValue(p[2]); }
                    iasufr.enableAskBeforClose(t);
                }                              });
            }
            if (ids =='kum') {
                var nom=gS.getColIndexById(ids);
                iasufr.loadForm(selector,{select:true, onSelect:function(p) {
                    gS.cells(id,nom).setValue(p.name);
                    iasufr.enableAskBeforClose(t);
                }                              });
            }

        return true
        });

    }
    function LoadData(){
        iasufr.ajax({
              url:'fin.Pers.cls',
              data: {func: "PersDocumEdit", json: JSON.stringify( jsonOpt ) } ,
              success: function (data) {
                 var json=JSON.parse(data);
                 var table=json.table;
                 gS.parse(table, 'json');

              }
        });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);

        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        toolbar.addButton("add", 3, iasufr.lang.ui.add, "32/toolbar_add.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            if (id == 'save')    Save();
            if (id == 'add')     AddDel(1);
            if (id == 'del')     AddDel(2);
            if (id == 'close')   iasufr.close(t);
        });
    }


    function AddDel(pri) {
       if (pri == 2) {
            var ind = gS.getRowIndex(gS.getSelectedId());
            if (ind == -1) { iasufr.message('Вкажiть строку !'); return  }
            iasufr.confirm(iasufr.lang.msg.delete, DelStr);
        }

        if (pri == 1) {
            Counter = Counter +1;
            var newid = Counter;
            gS.addRow(newid, ['', img,'','','',img,'','',''], 0);
            window.setTimeout(function(){ gS.selectCell(0,0,false,false,true,true); gS.editCell() }, 1);

        }
    }


    function DelStr() {   gS.deleteRow( gS.getSelectedId() ); iasufr.enableAskBeforClose(t);  }


    function Save() {
        main.progressOn();
        var json=jsonOpt;
        var doc = [];

        var arr=['tip','ser','num','kum','dn','dk','tipK'];
        var nom; var str;
        for (var i = 0; i < gS.getRowsNum(); i++) { str="";
                for (var a in arr) { nom=gS.getColIndexById(arr[a]);  str=str + gS.cells2(i,nom).getValue() + "~";  }
            doc.push({Str:str});
        }
        if (doc.length != 0) json = $.extend(json, {Doc: doc});

        iasufr.ajax({
            url: "fin.Pers.cls",
            data: {func: "PersDocumSave", json: JSON.stringify(json)},
            success: onSuccess,
            error: function() {if (main.progressOn) main.progressOff(); }
        });
    }


    function onSuccess(data) {
        main.progressOff();
        iasufr.messageSuccess("Збережено !");
        iasufr.disableAskBeforClose(t);
        if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список
        iasufr.close(t);
    }


    return t;
};