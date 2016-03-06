if (!window.Fin) Fin = {};
if (!Fin.OrgEdit) Fin.OrgEdit = {};
                                 // справочник организаций ^Org("P",idKP)
Fin.OrgEdit.Create = function (opt) {
    var win = iasufr.initForm(this, opt);
    win.owner.setModal(true);
    var idOrg=opt.json.idOrg;
    var Date=opt.json.Date;    //alert(idOrg+'---'+Date);
    dhtmlx.image_path = iasufr.const.IMG_PATH;

    //iasufr.formatDate(new Date()));

    var main = new dhtmlXLayoutObject(win.owner, '2E');
    main.cells('b').setHeight('200'); 	main.cells("a").hideHeader();
    var zag="рег N "+idOrg; if (idOrg==0) zag="Нова органiзацiя";
    win.owner.setText(zag);
    main.progressOn();
    var form;
    var tb;
    var tlb;
    var grid1;
    var grid2;
    var grid3;
    var grid4;
    var grid5;
    var selOrg = null;
    var selOrgR = null;
    var selCity = null;
    var selCityF = null;
    var selStreet = null;
    var selStreetF = null;
    var CountRow = 1000;
    var imgHELP = 'btn-select.png';
    var DateCopy=0;

    var tolb = main.cells('a').attachToolbar();
    tolb.setIconPath(iasufr.const.ICO_PATH);
    tolb.setIconSize(32);
    tolb.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");

    if (iasufr.pFunc("orgEdit")) { tolb.addButton("copy", 2, "Зробити копiю опису", "32/database_go.png", "");  //
                                  tolb.setItemToolTip("copy", "Можна вказати нову дату,з якоi органiзацiя змiнюе свiй опис та отримати копiю опису организацii");
    }

    //----------------------------
    //tolb.addSeparator("sep1", 3);
    tolb.addText("dateT", 4, "Нова дата опису органiзацii ");
    tolb.addInput("dateNew", 5, "");
    //tolb.addSeparator("sep1", 6);

    tolb.hideItem("dateT"); tolb.hideItem("dateNew");
    var cnd = new dhtmlXCalendarObject({input: tolb.getInput("dateNew")});
    //cnd.attachEvent("onClick", func);
    cnd.hideTime();
    cnd.setDateFormat("%d.%m.%Y");
    //-------------------------------
    if (iasufr.pFunc("orgEdit")) tolb.addButton("del", 8, "Видалити органiзацiю", "32/toolbar_delete.png", "");
    tolb.addButton("reload", 9, "Оновити", "32/arrow_rotate_anticlockwise.png", "");
    tolb.addButton("close", 10, iasufr.lang.ui.close, "32/door.png", "");

    tolb.attachEvent("onClick", onToolbarClick);

    function CopyOrg() {
        if (tolb.isVisible("dateT")) { tolb.hideItem("dateT"); tolb.hideItem("dateNew"); }
        else  { tolb.showItem("dateT"); tolb.showItem("dateNew"); }
    }

    function onToolbarClick(name) {
        if (name == "save") {  SaveData(); }
        if (name == "copy") {  CopyOrg(); }
        if (name == "reload") { Reload();  }
        if (name == "del") {
            dhtmlx.confirm("Пiдтвердiть: Видалити органiзацiю з вибраною датою опису ?", function(result) {
                if (result) DelOrg("P"); });
            }
        if (name == "delz") {
            dhtmlx.confirm("Пiдтвердiть: Видалити iз списку заявок та перенести у довiдник органiзацiй", function(result) {
                if (result) DelOrg("Z");
            });
        }
            if (name == "close") { iasufr.close(win); }
    }


    InitTAB();     // вкладки
    InitTABtable(); // таблицы во вкладках
    // вкладки в нижней части экрана
    function InitTAB() {

        tb = main.cells("b").attachTabbar("top");
        tb.setImagePath(iasufr.const.IMG_PATH);
        tb.setMargin("2");
        tb.setOffset(280);
        tb.addTab("a1", "Контактна iнформацiя", "150px");
        tb.addTab("a2", "Банк", "100px");
        tb.addTab("a3", "Висновки про гол.бухг.", "150px");
        tb.addTab("a4", "Журнал надання дозволiв", "150px");
        tb.addTab("a5", "Журнал обліку порушень", "150px");
        //tb.addTab("a5", "Висновки про гол.бухг.", "200px");
        if (!iasufr.pFunc("orgEdit")) { tb.disableTab("a3"); tb.disableTab("a4"); tb.disableTab("a5"); }
        tb.setTabActive("a2");
        tb.enableAutoReSize();
        $("<div id='infoToolbar'><div>").insertBefore($(tb._tabs["a1"]));

        var tlb = new dhtmlXToolbarObject("infoToolbar");
        tlb.setIconsPath(iasufr.const.ICO_PATH);  // "/images/imgs/");
        tlb.setIconSize(16);
        tlb.addButton("new", 2, iasufr.lang.ui.add, "16/plus.png", "");
        tlb.setItemToolTip("new", "Додати нову строку ");
        tlb.addButton("cut", 3, iasufr.lang.ui.delete, "16/cross.png", "");
        tlb.setItemToolTip("cut", "Видалити вказану строку");

        tlb.attachEvent("onClick", function (id) {
            if (id == 'new')  AddDel(1);
            if (id == 'cut')  AddDel(2);
        });
    }  // InitTB


    LoadData();

    function LoadData() {
        iasufr.ajax({
            url: "fin.Org.cls",
            data: {func: "Get", json: JSON.stringify({idOrg: idOrg, Date: Date})},
            success: AddData
        });
        }

    function AddData(d) {
        main.progressOff(); //alert(d);
        var jso=JSON.parse(d);
        form = main.cells("a").attachForm(jso);
        //form.setFontSize('11px');
        form.attachEvent("onChange", function (id, value){
                      var type=form.getItemType('ob0');
                      if ( (id=="ob0") && (type=="select") ) { Reload();
                      }
                      else { if ( (id=="ob27") && (value=="") ) { selStreet.id  = 0;  }
                             if ( (id=="ob40") && (value=="") ) { selStreetF.id = 0;  }
                           iasufr.enableAskBeforClose(win);
                      }
                          });

        selOrg={}; selOrgR={};
        selCity={}; selCityF={};
        selStreet={};  selStreetF={};
        selOrg.id= form.getItemValue("ob4Code");
        selOrgR.id= form.getItemValue("ob5Code");
        selCity.id= form.getItemValue("ob26Code");
        selCityF.id= form.getItemValue("ob39Code");
        selStreet.id= form.getItemValue("ob27Code");
        selStreetF.id= form.getItemValue("ob40Code");
        var isp=form.getItemValue("ispZ");

        if (iasufr.pFunc("orgEdit"))  {         // || (!iasufr.pFunc(("orgEdit") && ( iasufr.pFunc("orgEditPart")
        iasufr.attachSelector(form.getInput("ob4"), "OrgSelector",  { onSelect: OrgSelect});
        iasufr.attachSelector(form.getInput("ob5"), "OrgSelector",  {onSelect: OrgSelect1});
        //iasufr.attachSelector(form.getInput("ob12"), "Kveds",  {onSelect: KvedSelect});
        }
        if ( (iasufr.pFunc("orgAdd")) && (isp!="") ) {
            tolb.addSeparator("sep1", 11);
            tolb.addButton("delz", 12, "Видалити iз заявок ", "32/toolbar_delete.png", "");
            tolb.addSeparator("sep1", 13);
            tolb.addText("isp", 14, "<b>Виконавець заявки:</b> "+isp);
            tolb.setItemToolTip("isp", isp);
        }

        iasufr.attachSelector(form.getInput("ob26"), "CitySelector", {onSelect: CitySelect});
        iasufr.attachSelector(form.getInput("ob39"), "CitySelector", {onSelect: CitySelectF});
        iasufr.attachSelector(form.getInput("ob27"), "CityStreet", {onSelect: StreetSelect});
        iasufr.attachSelector(form.getInput("ob40"), "CityStreet", {onSelect: StreetSelectF});
        iasufr.attachSelector(form.getInput("ob12"), "Kveds",  {onSelect: KvedSelect});
        iasufr.attachSelector(form.getInput("ob34"), "OrgKvk", {onSelect: KvkSelect});
        //-----------------------
        var tt=form.getItemValue("ob26Z");
        if (tt!="") { form.setNote("ob26", { text:tt, width:260 });
                      var obj=$( "input[name='ob26']" ).parent().find(".dhxform_note").css( "color", "red" );
        }
        tt=form.getItemValue("ob27Z");
        if (tt!="") { form.setNote("ob27", { text:tt, width:260 });
            var obj=$( "input[name='ob27']" ).parent().find(".dhxform_note").css( "color", "red" );
        }


        iasufr.ajax({url:'fin.Org.cls', data: {func: "OrgGetCont", Sel: "cont", idOrg: idOrg , Date: Date}, success: function (data) {
            var json1 = JSON.parse(data);
            console.log(data);
            var user =JSON.parse(data);
            if (user.Cnts) {
                grid1.clearAll();
                for (var i = 0; i < user.Cnts.length; i++) { grid1.addRow(i+1, [user.Cnts[i].Tip, user.Cnts[i].Num, user.Cnts[i].Kom], i); }
            }
            } });
        iasufr.ajax({url:'fin.Org.cls', data: {func: "OrgGetCont", Sel: "bank", idOrg: idOrg, Date: Date}, success: function (data) {
                var json2 = JSON.parse(data);
                grid2.parse(json2, 'json');
                var pp=$(tb._tabs["a2"]).find("span");
                var i = 0; var zn7=0;
                while ( i < grid2.getRowsNum() ) {  // отметить цветом банк, если мфо и банк указаны в заявке на кодирование
                        zn7=grid2.cells2(i,7).getValue();
                        if (zn7>0) grid2.setCellTextStyle(grid2.getRowId(i),3,"color:#cc0000");
                        i++;
                }
                if (zn7>0)   pp.css("color","red");

           }
        });
        iasufr.ajax({url:'fin.Org.cls', data: {func: "OrgGetCont", Sel: "buhg", idOrg: idOrg, Date: Date}, success: function (data) {
                    var json3 = JSON.parse(data);
                    grid3.parse(json3, 'json');
                } });
        iasufr.ajax({url:'fin.Org.cls', data: {func: "OrgGetCont", Sel: "dozv", idOrg: idOrg, Date: Date}, success: function (data) {
            var json4 = JSON.parse(data);
            grid4.parse(json4, 'json');
        } });
        iasufr.ajax({url:'fin.Org.cls', data: {func: "OrgGetCont", Sel: "porush", idOrg: idOrg, Date: Date}, success: function (data) {
            var json5 = JSON.parse(data);
            grid5.parse(json5, 'json');
        } });

    }  // AddData

    function OrgSelect(o, $txt)   { selOrg = o;    if ( o ) $txt.val("(" + o.code + ") " + o.name); iasufr.enableAskBeforClose(win);}
    function OrgSelect1(o, $txt)  { selOrgR = o;   $txt.val("(" + o.code + ") " + o.name);   iasufr.enableAskBeforClose(win);}
    function CitySelect(o, $txt)  { selCity = o;   $txt.val(o.name); iasufr.enableAskBeforClose(win); }
    function CitySelectF(o, $txt)  { selCityF = o;   $txt.val(o.name); iasufr.enableAskBeforClose(win); }
    function KvedSelect(o, $txt)  { $txt.val(o.kved); iasufr.enableAskBeforClose(win); form.setItemValue('ob12', o.kved); }
    function KvkSelect(o, $txt)  {
        if (!o) return;
        if (!$.isArray(o)) return;
        $txt.val(o[0]);
        form.setItemValue('ob34', o[0]);
        iasufr.enableAskBeforClose(win); }
    

    function StreetSelect(o, $txt){  selStreet.id = o[0]; $txt.val(o[1]+" "+o[2]); iasufr.enableAskBeforClose(win); }
    function StreetSelectF(o, $txt){ selStreetF.id = o[0]; $txt.val(o[1]+" "+o[2]); iasufr.enableAskBeforClose(win); }

    //-------------таблицы во вкладках - контакты, банковская информация, клиент-банк
    function InitTABtable() {

        // ---- контакты
        grid1 = tb.cells("a1").attachGrid();
        var hdr="Тип, Контакт,Коментар";
        var wid="150,200,*";
        var typ="co,ed,ed";
        var align="left,left,left";
        grid1.setHeader(hdr);
        grid1.setInitWidths(wid);
        grid1.setColAlign(align);
        grid1.setColTypes(typ);
        grid1.setImagePath(iasufr.const.IMG_PATH);
        grid1.setIconsPath(iasufr.const.ICO_PATH);
         // заполнить в контактах первый столбец - справочником ^Org("TK" - типы контактов
        iasufr.ajax({
            url:'fin.Org.cls',
            data:{func:'OrgGetForm', Sel:"cont"},
            success: function (data) {
                var jso=JSON.parse(data);
                var combo = grid1.getCombo(0);
                if (jso.cont) { grid1.clearAll();for (var i = 0; i < jso.cont.length; i++) { combo.put(jso.cont[i][0],jso.cont[i][1]); }}
            }
        });
        grid1.init();
        grid1.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
                      if ((stage==2)&&(nValue!=oValue)) iasufr.enableAskBeforClose(win);
                      return true
        });

        grid2 = tb.cells("a2").attachGrid();
        hdr="Р/рахунок,Код банку,МФО / Найменування банку,,Вiдкрито,Закрито,Коментар,1";
        wid="120,80,300,25,80,80,*,10";  typ="ed,ed,ro,img,dhxCalendarA,dhxCalendarA,ed,ro";
        align="right,right,left,left,center,center,left,left";
        grid2.setHeader(hdr);
        grid2.setInitWidths(wid);
        grid2.setColAlign(align);
        grid2.setColTypes(typ);
        grid2.setImagePath(iasufr.const.IMG_PATH);
        grid2.setIconsPath(iasufr.const.ICO_PATH);
        grid2.init();
        grid2.setColumnHidden(1,true); grid2.setColumnHidden(7,true);

        //grid2.enableMarkedCells(true);
        grid2.enableTooltips("false,false,false,false,false");
        grid2.enableEditTabOnly(true);

        grid2.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
            if ((stage==2)&&(nValue!=oValue)) iasufr.enableAskBeforClose(win);
            return true
        });

        grid2.attachEvent("onRowSelect", function (id) {
            var ind = grid2.getSelectedCellIndex();
            if (ind == 3) {
                 var bnk = 1;  var name = 2;
                 iasufr.loadForm('OrgSelector',{width:1200,height:600,codeAdd:false,accountAdd:true,bankOnly:true,onSelect:function(p) {
                    grid2.cells(id,bnk).setValue(p.id);
                    grid2.cells(id,name).setValue(p.mfo+'/'+p.name);
                    //grid2.cells(id,mfo1).setValue(p.mfo);
                    //grid2.cells(id,account).setValue(p.account);
                     iasufr.enableAskBeforClose(win);
                }  });
            }
        });

        grid3 = tb.cells("a3").attachGrid();
        hdr="Дата висновку,Номер,П І Б,Призначення,Погодження звільнення,Відмова призначення,Відмова звільнення,N справи";
        wid="80,60,170,200,200,200,200,40";  typ="dhxCalendarA,ed,ed,ed,ed,ed,ed,ed";
        align="center,center,left,left,left,left,left,center";
        grid3.setHeader(hdr);
        grid3.setInitWidths(wid);
        grid3.setColAlign(align);
        grid3.setColTypes(typ);
        grid3.setImagePath(iasufr.const.IMG_PATH);
        grid3.setIconsPath(iasufr.const.ICO_PATH);
        grid3.init();
        //grid3.enableTooltips("false,false,false,false,false");

        grid3.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
            if ((stage==2)&&(nValue!=oValue)) iasufr.enableAskBeforClose(win);
            return true
        });

        grid4 = tb.cells("a4").attachGrid();
        hdr="Дата вх.листа,№ вх.листа,Дата наказа,№ наказа, Сумма списання";
        wid="100,100,100,100,200";  typ="dhxCalendarA,ed,dhxCalendarA,ed,edn";
        grid4.setNumberFormat("0,000.00",4,"."," ");
        align="center,left,center,left,right";
        grid4.setHeader(hdr);
        grid4.setInitWidths(wid);
        grid4.setColAlign(align);
        grid4.setColTypes(typ);
        grid4.setImagePath(iasufr.const.IMG_PATH);
        grid4.setIconsPath(iasufr.const.ICO_PATH);
        grid4.init();
        grid4.enableTooltips("false,false,false,false,false");
        grid4.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
            if ((stage==2)&&(nValue!=oValue)) iasufr.enableAskBeforClose(win);
            return true
        });

        grid5 = tb.cells("a5").attachGrid();
        hdr="id,Контролюючий орган,,Документ про порушення,Дата документа,Номер документа,Термін дії";
        wid="0,300,30,350,100,100,100";  typ="ro,ro,img,coro,dhxCalendarA,ed,dhxCalendarA";
        align="center,left,center,left,center,left,center";
        grid5.setHeader(hdr);
        grid5.setInitWidths(wid);
        grid5.setColAlign(align);
        grid5.setColTypes(typ);
        grid5.setImagePath(iasufr.const.IMG_PATH);
        grid5.setIconsPath(iasufr.const.ICO_PATH);

        grid5.getCombo(3).put("1", 'Протокол про порушення бюджетного законодавства');
        grid5.getCombo(3).put("2", 'Розпорядження про зупинення операцій з бюджетними коштами');
        grid5.getCombo(3).put("3", 'Розпорядження про відновлення операцій з бюджетними коштами');
        grid5.init();
        grid5.attachEvent("onRowSelect", function (id) {
            var ind = grid5.getSelectedCellIndex();
            if (ind == 2) {
                iasufr.loadForm('OrgSelector',{isType:1,width:1200,height:600,onSelect:function(p) {
                    grid5.cells(id,1).setValue(p.name);
                    grid5.cells(id,0).setValue(p.id);
                    iasufr.enableAskBeforClose(win);
                }  });
            }
        });
        grid5.enableTooltips("false,true,false,true,false");

        grid5.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
            if ((stage==2)&&(nValue!=oValue)) iasufr.enableAskBeforClose(win);
            return true
        });
        return;

        // enable(disable) tb,tolb  - если новая организация
        var idTB = ["a1", "a2", "a3", "a4", "a5"];
        for (var q = 0; q < idTB.length; q++) {
            if (idOrg == 0) tb.disableTab(idTabBar[q]);
            else        tb.enableTab(idTabBar[q]);
        }
        toolbar1.forEachItem(function (itemId) {
            if (idOrg == 0) tlb.disableItem(itemId);
            else        tlb.enableItem(itemId);
        });

    }   // TABtable(id)



    //добавить, удалить строку в таблицах во вкладках
    function AddDel(pri) {
        var tab = tb.getActiveTab();
        var grid;
        switch (tab) {
            case 'a1': grid = grid1;  break;
            case 'a2': grid = grid2;  break;
            case 'a3': grid = grid3;  break;
            case 'a4': grid = grid4;  break;
            case 'a5': grid = grid5;  break;
         }
        if (pri == 2) {
            var ind = grid.getRowIndex(grid.getSelectedId());
            if (ind == -1) { dhtmlx.alert('Вкажiть строку !'); return  }
            dhtmlx.confirm("Пiдтвердiть видалення !", function (result) {
                var idRow=grid.getSelectedId();
                if (result) grid.deleteRow(idRow);
                iasufr.enableAskBeforClose(win);
            });
        }

        if (pri == 1) {
            CountRow = CountRow +1;
            var newid = CountRow;
            if (grid == grid1) { grid.addRow(newid, ['', '', ''], 0);   }
            if (grid == grid2) { grid.addRow(newid, ['', '','',imgHELP, '', '', ''], 0); }
            if (grid == grid3) { grid.addRow(newid, ['', '','','','','','',''], 0); }
            if (grid == grid4) { grid.addRow(newid, ['','','','','','',''], 0); }
            if (grid == grid5) { grid.addRow(newid, ['','',imgHELP,'','','',''], 0); }
            window.setTimeout(function(){ grid.selectCell(0,0,false,false,true,true); grid.editCell() }, 1);

        }
    }  // AddDel

        function SaveData() {
            if (!form.validate()) { dhtmlx.alert(" Перевiрте вiдмiченi строки !"); return; }

            var ob4=""; if (selOrg) { ob4=selOrg.id; }
            var ob5=""; if (selOrgR) { ob5=selOrgR.id; }
            var ob26=""; if (selCity) { ob26=selCity.id; }
            var ob39=""; if (selCityF) { ob39=selCityF.id; }

            var ob27=""; if (selStreet) { ob27=selStreet.id; }
            var ob40=""; if (selStreetF) { ob40=selStreetF.id; }

            var dateN =0;
            if (idOrg==0) { dateN=iasufr.formatDateStr(form.getCalendar("ob0").getDate(true));  }
            var date=iasufr.formatDateStr(form.getCalendar("ob32").getDate(true));

            //----------------------------------------------------
            if ((idOrg>0)&&(tolb.isVisible("dateNew"))) { var dt=iasufr.formatDateStr(tolb.getValue("dateNew"));
                                                          if (!dt) return;
                                                          if (!confirm("Пiдтвердiть: Зробити копiю опису органiзацii на вибрану дату ?")) return;
                                                          DateCopy=dt; dateN=dt;
                                                        }
            //-----------------------------------------------------

            if (main.progressOn) main.progressOn();
            var json = $.extend(form. getFormData(), {Id: idOrg, ob4Sel: ob4 , ob5Sel: ob5, ob26Sel: ob26, ob39Sel: ob39, ob27Sel: ob27, ob40Sel: ob40, ob32:date, dateNew:dateN});
            //alert(JSON.stringify(json));
            // контакты
                var cont = [];
                for (var i = 0; i < grid1.getRowsNum(); i++) {
                    if (grid1.cells2(i, 1).getValue() != "") cont.push({Tip: grid1.cells2(i, 0).getValue(), Num: grid1.cells2(i, 1).getValue(), Kom: grid1.cells2(i, 2).getValue()});
                }
                if (cont.length != 0) json = $.extend(json, {Cont: cont});

            // банковские реквизиты
            var bank = [];
            for (i = 0; i < grid2.getRowsNum(); i++) {
                if (grid2.cells2(i, 0).getValue() != "") bank.push({Rs: grid2.cells2(i, 0).getValue(), Bnk: grid2.cells2(i, 1).getValue(), Dn: grid2.cells2(i, 4).getValue(), Dk: grid2.cells2(i, 5).getValue(), Kom: grid2.cells2(i, 6).getValue()});
            }
            if (bank.length != 0) json = $.extend(json, {Bank: bank});
            
            // про головного бухг/
            var buhg = []; var rek1;
            for (i = 0; i < grid3.getRowsNum(); i++) {
                rek1=grid3.cells2(i, 0).getValue();
                if ( rek1!= "") buhg.push({Rek1:grid3.cells2(i, 0).getValue(), Rek2: grid3.cells2(i, 1).getValue(), Rek3: grid3.cells2(i, 2).getValue(), Rek4: grid3.cells2(i, 3).getValue(), Rek5: grid3.cells2(i, 4).getValue(), Rek6: grid3.cells2(i, 5).getValue(), Rek7: grid3.cells2(i, 6).getValue(), Rek8: grid3.cells2(i, 7).getValue()});
            }
            if (buhg.length != 0) json = $.extend(json, {Buhg: buhg});
            // про дозволи
            var dozv = []; var rek1;
            for (i = 0; i < grid4.getRowsNum(); i++) {
                rek1=grid4.cells2(i, 0).getValue();
                if ( rek1!= "") dozv.push({ Rek1:grid4.cells2(i, 0).getValue(),Rek2: grid4.cells2(i, 1).getValue(),Rek3: grid4.cells2(i, 2).getValue(),Rek4: grid4.cells2(i, 3).getValue(),Rek5: grid4.cells2(i, 4).getValue()});
            }
            if (dozv.length != 0) json = $.extend(json, {Dozv: dozv});
            // про порушення
            var porush = []; var rek1;
            for (i = 0; i < grid5.getRowsNum(); i++) {
                rek1=grid5.cells2(i, 0).getValue();
                if ( rek1!= "") porush.push({Rek1:grid5.cells2(i, 0).getValue(),Rek2: grid5.cells2(i, 3).getValue(),Rek3: grid5.cells2(i, 4).getValue(),Rek4: grid5.cells2(i, 5).getValue(),Rek5: grid5.cells2(i, 6).getValue()});
            }
            if (porush.length != 0) json = $.extend(json, {Porush: porush});
            iasufr.disableAskBeforClose(win);
            iasufr.ajax({
                url: "fin.Org.cls",
                data: {func: "SaveOrgOsn", json: JSON.stringify(json)},
                success: onSuccess,
                error: function(){if (main.progressOn) main.progressOff()}
            });
        }
        function onSuccess(data) {
                                   var d = JSON.parse(data);
                                   if (idOrg==0) idOrg= d.Id;
                                   main.progressOff();  dhtmlx.message({text:"Збережено !",expire:800});
                                   if (opt.onSave) opt.onSave(idOrg,win);  // ОБНОВИТЬ список организаций в таблице
                                   // main.progressOff();  dhtmlx.message({text:"Збережено !",expire:800});
                                   iasufr.disableAskBeforClose(win);
                                   if (!win.isClosed) Reload();

                                     }

    function DelOrg(vet) {
    var date=form.getItemValue("ob0");
    iasufr.ajax({
        url: "fin.Org.cls",
        data: {func: "Del", json: JSON.stringify({idOrg: idOrg, Date: date, Vet: vet})},
        success: onDel
    });
    }

    function onDel() { if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список организаций в таблице
                       win.owner.close()  }

    function Reload() {    var type=form.getItemType('ob0');
                            if (type=="select") var date=form.getItemValue("ob0");
                            else  var date=iasufr.formatDateStr(form.getCalendar("ob0").getDate(true));
                            if (DateCopy>0) { date=DateCopy; DateCopy=0; }
                            Date=date; //если изменили дату в select (или новая организация)
        tolb.hideItem("dateT"); tolb.hideItem("dateNew");
        form.unload(); form=null; grid1.clearAll(); grid2.clearAll();grid3.clearAll();grid4.clearAll();grid5.clearAll(); LoadData();
        }



    return win;
   };

//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/orgEdit.js