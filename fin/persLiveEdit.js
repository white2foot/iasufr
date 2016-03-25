if (!window.Fin) Fin = {};
if (!Fin.PersLiveEdit) Fin.PersLiveEdit = {};

Fin.PersLiveEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    t.owner.button("park").disable();

    var idPers=t.opt.idPers;
    var live=t.opt.Live;
    var jsonOpt = {idPers:idPers, Live:live} ;
    var zag='Проживання';
    if (live=='LiveR') zag='Реєстрацiя';
    if (live=='LiveA') zag='Адреса для листування';
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
        var hdr="З дати,Поштовий iндекс,Населений пункт (iз довiдника),,Населений пункт (текстом),Район мiста,,Вулиця,,Буд.,Кв.,1,2,3";
        var wid="80,50,250,25,250,150,25,170,25,40,30,10,10,10";
        var typ="dhxCalendarA,ed,ed,img,ed,ed,img,ed,img,ed,ed,ro,ro,ro";
        var align="center,center,left,left,left,left,left,left,left,center,center,left,left,left";

        gS.setHeader(hdr);
        gS.setInitWidths(wid);
        gS.setColAlign(align);
        gS.setColTypes(typ);
        gS.setImagePath(iasufr.const.IMG_PATH);
        gS.setIconsPath(iasufr.const.ICO_PATH);
        gS.enableEditTabOnly(true);
        gS.enableTooltips("true,false,true,true,false,true,false,true");
        //                                                                                12       13
        gS.setColumnIds("dt,post,city,img1,cityTxt,ray,img2,street,img3,house,apart,cityK,rayK,streetK");
        gS.init();
        var arr1 = ["cityK","rayK","streetK"];
        for (var a in arr1) gS.setColumnHidden(gS.getColIndexById(arr1[a]),true);


        gS.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
            if ((stage==2)&&(nValue!=oValue))  iasufr.enableAskBeforClose(t);
            //----------------- --------------------------
            if  (stage == 2) { var nom=gS.getColIndexById('city'); var noms=gS.getColIndexById('street'); }
            if ( (stage == 2) && (cellInd == nom) ) {
                var city=gS.getColIndexById('cityK');
                if (nValue == '') { gS.cells(rowId, city).setValue(''); }
                if ( (nValue!= oValue) && (nValue != '') ) {
                    iasufr.ajax({
                        url:'fin.Org.cls',
                        data: {func: "getCityByCode", code: nValue },
                        error: function() {
                            gS.cells(rowId, nom).setValue("");
                            gS.cells(rowId, city).setValue("");
                        },
                        success: function (data) {
                            var obj =JSON.parse(data);
                            gS.cells(rowId, nom).setValue(obj.name);
                            gS.cells(rowId, city).setValue(obj.id);
                            if (obj.isMessage)  gS.cells(rowId, cellInd).setValue('');

                        } });
                }

            }
            if ( (stage == 2) && (cellInd == noms) ) {
                var street=gS.getColIndexById('streetK');
                if (nValue == '') { gS.cells(rowId, street).setValue(''); }
                if ( (nValue!= oValue) && (nValue != '') ) {
                    iasufr.ajax({
                        url:'fin.Org.cls',
                        data: {func: "getStreetByCode", code: nValue },
                        error: function() {
                            gS.cells(rowId, noms).setValue("");
                            gS.cells(rowId, street).setValue("");
                        },
                        success: function (data) {
                            var obj =JSON.parse(data);
                            gS.cells(rowId, noms).setValue(obj.name);
                            gS.cells(rowId, street).setValue(obj.id);
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
            if (ids=='city')   selector='CitySelector';
            if (ids=='street') selector='CityStreet';
            if (selector!='') {
                var nom=gS.getColIndexById(idsK);
                iasufr.loadForm(selector,{select:true, onSelect:function(p) {
                    if (ids=='city')   { gS.cells(id,nom).setValue(p.id);  gS.cells(id,ind-1).setValue(p.name); }
                    if (ids=='street') { gS.cells(id,nom).setValue(p[0]);  gS.cells(id,ind-1).setValue(p[1]+' '+p[2]); }
                    iasufr.enableAskBeforClose(t);
                }                              });
            }

        return true
        });

    }
    function LoadData(){
        iasufr.ajax({
              url:'fin.Pers.cls',
              data: {func: "PersLiveEdit", json: JSON.stringify( jsonOpt ) } ,
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


    function Del() { return
        var idK=form.getItemValue("idK");
        iasufr.ajax({
            url: "fin.Pers.cls",
            data: {func: "PersLiveDel", json: JSON.stringify({idKosht: idK, idOrg:idOrg})},
            success: function() { main.progressOff(); if (opt.onSave) opt.onSave();
                iasufr.messageSuccess("Видалено !"); iasufr.close(t); }
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
            gS.addRow(newid, ['', '', '',img,'','',img,'',img,'','','','',''], 0);
            window.setTimeout(function(){ gS.selectCell(0,0,false,false,true,true); gS.editCell() }, 1);

        }
    }


    function DelStr() {   gS.deleteRow( gS.getSelectedId() ); iasufr.enableAskBeforClose(t);  }


    function Save() {
        main.progressOn();
        var json=jsonOpt;
        var adr = [];
        var arr=['dt','post','city','cityTxt','ray','street','house','apart','cityK','rayK','streetK'];
        var nom; var str;
        for (var i = 0; i < gS.getRowsNum(); i++) { str="";
                for (var a in arr) { nom=gS.getColIndexById(arr[a]);  str=str + gS.cells2(i,nom).getValue() + "~";  }
                adr.push({Str:str});
        }
        if (adr.length != 0) json = $.extend(json, {Adr: adr});

        iasufr.ajax({
            url: "fin.Pers.cls",
            data: {func: "PersLiveSave", json: JSON.stringify(json)},
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