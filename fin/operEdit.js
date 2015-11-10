 // корректировка операции второго уровня ^Oper(idOrg,
if (!window.Fin) Fin = {};
if (!Fin.OperEdit) Fin.OperEdit = {};

Fin.OperEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idOper=t.opt.idOper;
    var idOrg=t.opt.idOrg;
    var idOrg1=t.opt.idOrg1;
         
    var toolbar;
    var form;
    var gS;
    var gD;
    var tb;
    var FlagCh=0;
    var Counter=1000;
    var gridT;

    var selGrup = null;

    var main = new dhtmlXLayoutObject(t.owner, '2E');
    main.cells('b').setHeight('200');
    main.cells("a").hideHeader();
    main.cells("b").hideHeader();
    main.progressOn();

    toolbar = main.attachToolbar();    InitToolBar();
    
    LoadData();
    InitTabBar();      //вкладки 
    TableTabBar();     //  таблица во вкладке

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");
        toolbar.attachEvent("onClick", function (id) {
            if (id == 'save')  {  Save() }
            if (id == 'del')   {  iasufr.confirm("Пiдтвердiть видалення операцii", Del);
            }
            if (id == 'close') {
                if ( FlagCh ) {
                    dhtmlx.confirm("Записати змiни ?", function(result) {
                        if (result) Save();
                        else iasufr.close(t);
                    } );

                }
                if (!FlagCh)  iasufr.close(t);
            }
        }); // onClick
    }


   function LoadData() {
         iasufr.ajax({url:'fin.Oper.cls', data: {func: "OperEdit", json: JSON.stringify( {idOper:idOper, idOrg:idOrg, idOrg1:idOrg1} ) } ,
             success: function (data) { 
             var jso = JSON.parse(data);
             form = main.cells("a").attachForm(jso);
             form.attachEvent("onChange", function (id, value){ FlagCh=1; });
             FlagCh=0;
             $(form.getInput("Name")).focus();
             $(form.getInput("Name")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Num")).focus()  });
             $(form.getInput("Num")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Name")).focus()  });

                 iasufr.ajax({
                     url: "fin.Oper.cls",
                     data: {func: "OperEditTable", json: JSON.stringify({idOper:idOper, idOrg:idOrg, idOrg1:idOrg1}) },
                     error: function() {if (main.progressOn) main.progressOff();},
                     success: function (data) {
                         var jso=JSON.parse(data);
                         t.owner.setText(jso.Name);
                         //--------- дебиторы-кредиторы, субрахунки
                         var js = jso.tD;
                         gD.parse(js, 'json');
                         js = jso.tS;
                         gS.parse(js, 'json');
                     }
                 });
                 main.progressOff();
         }
         });
   }

    function InitTabBar() {
        tb = main.cells("b").attachTabbar("top");
        tb.setImagePath(iasufr.const.IMG_PATH);
        tb.setMargin("2");
        tb.setOffset(250);
        tb.addTab("a1", "Дебитори-кредитори", "200px");
        tb.addTab("a2", "Субрахунки", "200px");
        tb.setTabActive("a1");
        tb.enableAutoReSize();
        $("<div id='infoToolbar'><div>").insertBefore($(tb._tabs["a1"]));

        var tlb = new dhtmlXToolbarObject("infoToolbar");
        tlb.setIconsPath(iasufr.const.ICO_PATH);  
        tlb.setIconSize(16);
        tlb.addButton("new", 2, "Додати строку", "16/plus.png", "");
        tlb.addButton("cut", 3, "Видалити строку", "16/cross.png", "");
       
        tlb.attachEvent("onClick", function (id) {
            if (id == 'new')  AddDel(1);
            if (id == 'cut')  AddDel(2);
        });
    }  // InitTabBar


    function TableTabBar() {
        gD = tb.cells("a1").attachGrid();
        gD.setImagePath(iasufr.const.IMG_PATH);
        gD.setIconsPath(iasufr.const.ICO_PATH);
        gD.setHeader('Основна орг.,,код мережi / найменування,р/р осн.орг.,Контр агент,,код мережi / найменування,р/р контраг.');
        gD.setInitWidths('50,25,300,120,50,25,300,*');
        gD.setColAlign('center,left,left,center,center,left,left,center');
        gD.setColTypes('ed,img,ro,ed,ed,img,ro,ed');
        gD.enableEditTabOnly(true);
        gD.init();

        gD.attachEvent("onRowSelect", function (id) {
            var ind = gD.getSelectedCellIndex();
            if ((ind == 1) || (ind == 5)) {
                var ind1 = ind - 1;
                var ind2 = ind + 1;
                var ind3 = ind2 + 1;
                var t=""; if (ind==1) t=idOrg1;
                iasufr.loadForm('OrgSelector',{width:1200,height:600,codeAdd:true,accountAdd:true,bankOnly:false, idOrg:t, onSelect:function(p) {
                    gD.cells(id,ind1).setValue(p.id);
                    gD.cells(id,ind2).setValue(p.name);
                    gD.cells(id,ind3).setValue(p.account);
                    FlagCh=1;
                }  });
            }
        });

        //-------------------
        gD.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
            if ( (stage == 2) && ((cellInd == 0)||(cellInd == 4)) ) {
                var naiInd = cellInd + 2;
                FlagCh=1;
                if (nValue == '') {
                    gD.cells(rowId, naiInd).setValue('');
                    gD.cells(rowId, cellInd).setValue('');
                }

                if (nValue!= oValue) {
                    iasufr.ajax({url:'fin.Oper.cls', data: {func: "getOrgByCode", code: nValue },error:'' ,
                        success: function (data) {
                                  var obj =JSON.parse(data);
                                  gD.cells(rowId, naiInd).setValue(obj.nameAddCode);
                                  gD.cells(rowId, cellInd).setValue(obj.id);
                                  if (obj.id == '') { gD.cells(rowId, cellInd).setValue('');  gD.cells(rowId, naiInd).setValue('');   }
                                 }
                    }); // ajax
                }
            }  // проверка полей по оргаизациям

            //if ( (stage == 2) && (cellInd != 0) && (cellInd != 4) )
            return true
        });  //onEdit - gD
        //--------------------

        gS = tb.cells("a2").attachGrid();
        var hdr="Д-т субрах.,К-т субрах.,Коментар";
        var wid="80,80,*";
        var typ="ed,ed,ed";
        var align="center,center,left";

        gS.setHeader(hdr);
        gS.setInitWidths(wid);
        gS.setColAlign(align);
        gS.setColTypes(typ);
        gS.setImagePath(iasufr.const.IMG_PATH);
        gS.setIconsPath(iasufr.const.ICO_PATH);
        gS.enableEditTabOnly(true);
        gS.enableEditTabOnly(true);
        gS.enableTooltips("false,false,false");
        gS.init();         

        gS.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
                   if ((stage==2)&&(nValue!=oValue)) FlagCh=1;
                   //----------------- kekv --------------------------
                   if ( (stage == 2) && (cellInd == 5) ) {
                        if (nValue == '') { gS.cells(rowId, cellInd).setValue('');
                                            gS.cells(rowId, cellInd+2).setValue('');  }

                    if ( (nValue!= oValue) && (nValue != '') ) { 
                        iasufr.ajax({ 
                          url:'fin.Kekv.cls',
                          data: {func: "getKekvName", code: nValue },
                               success: function (data) {
                                  var obj =JSON.parse(data);
                                  gS.cells(rowId, cellInd+2).setValue(obj.name);
                                  if (obj.isMessage)  gS.cells(rowId, cellInd).setValue('');

                               }
                        }); // ajax
                    }
                   }
             return true
        });  // onEditCell
    }   // TableTabBar


    function Del() {
                iasufr.ajax({
                    url: "fin.Oper.cls",
                    data: {func: "OperDel", json: JSON.stringify({idOper: idOper, idOrg:idOrg, idOrg1:idOrg1}) },
                    success: function() { main.progressOff(); if (opt.onSave) opt.onSave();
                                          iasufr.messageSuccess("Видалено !"); iasufr.close(t); }
                });
    }

    function AddDel(pri) {
        var tab = tb.getActiveTab();
        switch (tab) {
            case 'a1': gridT = gD;  break;
            case 'a2': gridT = gS;  break
        }
        if (pri == 2) {
            var ind = gridT.getRowIndex(gridT.getSelectedId());
            if (ind == -1) { iasufr.message('Вкажiть строку !'); return  }
            iasufr.confirm(iasufr.lang.msg.delete, DelStr)
        }

        if (pri == 1) {
            Counter = Counter +1;
            var newid = Counter;
            var img = 'btn-select.png';
            if (gridT == gS) { gridT.addRow(newid, ['', '', ''], 0);   }
            if (gridT == gD) { gridT.addRow(newid, ['', img, '', '', '', img, '', ''], 0); }
            FlagCh=1;
            window.setTimeout(function(){ gridT.selectCell(0,0,false,false,true,true); gridT.editCell() }, 1);
        }
    }  

   function DelStr() {   gridT.deleteRow( gridT.getSelectedId() ); FlagCh=1; }

   function Save() {
            if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
            main.progressOn();
            var json = {idOrg: idOrg, idOrg1: idOrg1, idOper: idOper, Name:form.getItemValue("Name"), Num:form.getItemValue("Num") };

            // ---------------------- дебиторы
            var org= null; org = []; var idRow;
            for (var i = 0; i < gD.getRowsNum(); i++) { idRow=gD.getRowId(i);
                org.push({idRow:idRow, org1: gD.cells2(i, 0).getValue(), rs1: gD.cells2(i, 3).getValue(), org2: gD.cells2(i, 4).getValue(), rs2: gD.cells2(i, 7).getValue() } );  }

            if (org.length != 0) json = $.extend( json, {Org: org} );
            // ---------------------- субрахунки
            var sub= null; sub= [];
            for ( i = 0; i < gS.getRowsNum(); i++) { idRow=gS.getRowId(i);
            if (gS.cells2(i, 0).getValue() != "") sub.push({idRow:idRow, deb: gS.cells2(i, 0).getValue(), kred: gS.cells2(i, 1).getValue(), kom: gS.cells2(i, 2).getValue() } );  }
            //-----------------------

            if (sub.length != 0) json = $.extend( json, {Sub: sub} );

            iasufr.ajax({
                url: "fin.Oper.cls",
                data: {func: "OperSave", json: JSON.stringify(json)},
                success: onSuccess,
                error: function() {if (main.progressOn) main.progressOff(); }
            });

   }
          function onSuccess(data) {
                                   main.progressOff();  
                                   iasufr.messageSuccess("Збережено !");
                                   if (opt.onSave) opt.onSave();
                                   iasufr.close(t);                                    
                                 }


    return t;
};
//@ sourceURL=operEdit.js