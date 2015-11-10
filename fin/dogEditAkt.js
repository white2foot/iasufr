if (!window.Fin) Fin = {};
if (!Fin.DogEditAkt) Fin.DogEditAkt = {};

Fin.DogEditAkt.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    t.owner.setModal(true);
    t.owner.button("park").disable();

    var idDog=t.opt.idDog;
    var idOrg=t.opt.idOrg;
    var idRow=t.opt.idRow;
    var numberAkt=t.opt.numberAkt;
    var jsonOpt = {idDog:idDog, idOrg:idOrg, idRow:idRow, numberAkt: numberAkt} ;

    var toolbar;
    var form;
    var gS;
    var tb;
    var Counter=1000;

    var main = new dhtmlXLayoutObject(t.owner, '2E');
    main.cells('a').setHeight('170');
    main.cells("a").hideHeader();
    main.cells("b").hideHeader();
    main.progressOn();

    toolbar = main.attachToolbar();

    InitToolBar();
    LoadData();
    InitTabBar();      //вкладки

    gS = tb.cells("a1").attachGrid();
    //         0            1       2           3            4         5        6            7            8
    var hdr="Дата стану,Стан акту,Коментар,Виконавець стану,Дата опл,Сума,Виконавець оплати,ID оплати,ID стану";
    var wid="80,180,180,180,110,60,*,10,10";
    var typ="dhxCalendarA,co,ed,ro,dhxCalendarA,ed,ro,ro,ro";
    var align="center,left,left,left,center,center,left,left,left";

    gS.setHeader(hdr);
    gS.setInitWidths(wid);
    gS.setColAlign(align);
    gS.setColTypes(typ);
    gS.setImagePath(iasufr.const.IMG_PATH);
    gS.setIconsPath(iasufr.const.ICO_PATH);
    gS.enableEditTabOnly(true);
    gS.init();

    gS.setColumnHidden(3,true); gS.setColumnHidden(6,true);
    gS.enableHeaderMenu("true,true,true,true,true,true,true");

    gS.enableAutoHiddenColumnsSaving("gS");
    gS.loadHiddenColumnsFromCookie("gS");
    gS.enableAutoSaving();
    gS.loadSizeFromCookie();
    gS.setColumnHidden(7,true); gS.setColumnHidden(8,true);

    gS.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) { if ((stage==2)&&(nValue!=oValue)) iasufr.enableAskBeforClose(t);  return true  });
    gS.attachEvent("onRowSelect", function (id) {
        var ind = gS.getSelectedCellIndex();
        if (ind==5) { var sum=form.getItemValue("Sum"); gS.cells(id, ind).setValue(sum); }
    });


    TableTabBar();     //  таблица во вкладке - наполнить


    function LoadData() {
        iasufr.ajax({url:'fin.Dog.cls', data: {func: "DogAktEdit", json: JSON.stringify(jsonOpt) } ,
            success: function (data) {
                var jso = JSON.parse(data);
                form = main.cells("a").attachForm(jso);
                form.attachEvent("onChange", function (id, value){  iasufr.enableAskBeforClose(t);} );
                iasufr.disableAskBeforClose(t);
                $(form.getInput("Num")).focus();
                main.progressOff();
            }
        });
    }

    function InitTabBar() {
        tb = main.cells("b").attachTabbar("top");
        tb.setImagePath(iasufr.const.IMG_PATH);
        //tb.setMargin("2");
        tb.setOffset(300);
        tb.addTab("a1", "Стан та оплата акту", "200px");
        tb.setTabActive("a1");
        tb.enableAutoReSize();
        $("<div id='infoToolbar'><div>").insertBefore($(tb._tabs["a1"]));

        var tlb = new dhtmlXToolbarObject("infoToolbar");
        tlb.setIconsPath(iasufr.const.ICO_PATH);
        tlb.setIconSize(16);
        tlb.addButton("new", 2, iasufr.lang.ui.add, "16/plus.png", "");
        tlb.addButton("cut", 3, iasufr.lang.ui.delete, "16/cross.png", "");

        tlb.attachEvent("onClick", function (id) {
            if (id == 'new')  AddDel(1);
            if (id == 'cut')  AddDel(2);
        });
    }  // InitTabBar


    function TableTabBar() {

        iasufr.ajax({
            url:'fin.Dog.cls',
            data: {func: "getAktEditTable", json: JSON.stringify(jsonOpt) } ,
            success: function (data) {
                var jso=JSON.parse(data);
                var combo = gS.getCombo(1);
                if (jso.StanSpr) { gS.clearAll(); for (var i = 0; i < jso.StanSpr.length; i++) { combo.put(jso.StanSpr[i][0],jso.StanSpr[i][1]); }}
                gS.parse(jso.Row, 'json');


            }
        });
    } // TableTabBar()

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            if (id == 'save')  {  Save() }
            if (id == 'del')   {  if (gS.getRowsNum()>0) {iasufr.message('Спочатку видалiть строки оплати та стану !'); return}
                                  iasufr.confirm("Пiдтвердiть видалення акту про виконання робiт ", Del);   }
            if (id == 'close') iasufr.close(t);
        });
    }


    // видалення усьго акту
    function Del() {

        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "DogAktDel", json: JSON.stringify(jsonOpt) },
            success: function() { main.progressOff(); if (opt.onSave) opt.onSave();
                iasufr.disableAskBeforClose(t);
                iasufr.messageSuccess("Видалено !"); iasufr.close(t); }
        });
    }

    function AddDel(pri) {
        var tab = tb.getActiveTab();
        var ind = gS.getRowIndex(gS.getSelectedId());

        if (pri == 2) {
            if (ind == -1) { iasufr.message('Вкажiть строку !'); return  }
            iasufr.confirm(iasufr.lang.msg.delete, DelStr)
        }
        if (pri == 1) {
            Counter = Counter +1;
            var newid = Counter;
            gS.addRow(newid, ['', '', '','',''], 0);
            //$(gS.cells2(0, 2).cell).click(onCellClick);
            window.setTimeout(function(){ gS.selectCell(0,0,false,false,true,true); gS.editCell() }, 1);
        }
        iasufr.enableAskBeforClose(t);
    }

    function DelStr() {   gS.deleteRow( gS.getSelectedId() );  }

    function Save() {
        if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
        main.progressOn();
        // ----------------------
        var rowt = []; var dOpl,dStan;
        for (var i = 0; i < gS.getRowsNum(); i++) {
            dOpl=gS.cells2(i, 4).getValue();  dOpl  = iasufr.formatDateStr(iasufr.replaceAll(dOpl,"/","."));
            dStan=gS.cells2(i, 0).getValue(); dStan = iasufr.formatDateStr(iasufr.replaceAll(dStan,"/","."));   // id:gS.getRowId(i)
            //      0         1         2        3              4       5       6                 7        8
            //"Дата стану,Стан акту,Коментар,Виконавець стану,Дата опл,Сума,Виконавець оплати,ID оплати,ID стану";
            rowt.push({ dOpl: dOpl, sum: gS.cells2(i, 5).getValue(), dStan: dStan, stan: gS.cells2(i, 1).getValue(), kom: gS.cells2(i, 2).getValue(), idOpl:gS.cells2(i, 7).getValue(), idStan:gS.cells2(i, 8).getValue()} );
        }
        //-----------------------
        var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
        var dateK=iasufr.formatDateStr(form.getCalendar("DateK").getDate(true));
        var StanWrt=0; if (form.isItemChecked('StanWrt')) StanWrt=1;
        var json = $.extend( jsonOpt, { Num:form.getItemValue("Num"), Sum:form.getItemValue("Sum"), DateN:dateN, DateK:dateK, StanWrt:StanWrt } );
            json = $.extend( json,  {str: rowt}  );

        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "DogAktSave", json: JSON.stringify(json) },
            success: onSuccess,
            error: function() { if (main.progressOn) main.progressOff(); }
        });
    }

    function onSuccess(data) {
        //main.progressOff();
        iasufr.disableAskBeforClose(t);
        iasufr.messageSuccess("Збережено !");
        Reload();
        if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список в таблице по актам
        //iasufr.close(t);
    }

    function Reload() {
        form.unload(); form=null;
        gS.clearAll();
        LoadData();
        TableTabBar();
        main.progressOff();
    }

    return t;
};
//dogEditAkt.js