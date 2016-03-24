if (!window.Fin) Fin = {};
if (!Fin.PriceEdit) Fin.PriceEdit = {};

Fin.PriceEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idPrice=t.opt.idPrice;
    var idOrg=t.opt.idOrg;
    var user=iasufr.user;
    var idOrgUser=user.orgId;
    //alert(idPrice);

    var toolbar;
    var form;
    var gS;
    var tb;

    var Counter=1000;
    
    var selDep   = null;
    var selRspSP = null; selRspSP =[];
    var selRspFN = null; selRspFN =[];
    var selRspOKR= null; selRspOKR=[];

    var main = new dhtmlXLayoutObject(t.owner, '2E');
    main.cells('a').setHeight('250');
    main.cells("a").hideHeader();
    main.cells("b").hideHeader();
    main.progressOn();

      toolbar = main.attachToolbar();  InitToolBar();

      var p=InitTabBar();
      LoadData();

      function LoadData() {
         iasufr.ajax({url:'fin.Pers.cls', data: {func: "PriceEdit", json: JSON.stringify( {idPrice:idPrice, idOrg:idOrg} ) } ,
             success: function (data) { 
             var jso = JSON.parse(data);
             form = main.cells("a").attachForm(jso.form);
             selRspSP = null;  selRspSP =[]; selRspSP.id=jso.spec;
             selRspFN = null;  selRspFN =[]; selRspFN.id=jso.formn;
             selRspOKR = null; selRspOKR =[]; selRspOKR.id=jso.riv;
             selDep = null;   selDep   ={}; selDep.id  =jso.dep;

             form.attachEvent("onChange", function (id, value){
                 iasufr.enableAskBeforClose(t);
             });

             $(form.getInput("Name")).focus();
             $(form.getInput("Name")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Num")).focus()  });
             $(form.getInput("Num")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Date")).focus()  });
             gS.parse(jso.table, 'json');
             gS.sortRows(1);
             iasufr.attachSelector(form.getInput("Dep"), "OrgSelector",  {  AddCode:true, idOrg:idOrg, department:1, onSelect: DepSelect});
             iasufr.attachSelector(form.getInput("Spec"), "RspSP",  {  onSelect: RspSPSelect});
             iasufr.attachSelector(form.getInput("Form"), "RspFN",  {  onSelect: RspFNSelect});
             iasufr.attachSelector(form.getInput("Riv"), "RspOKR",  {  onSelect: RspOKRSelect});

             main.progressOff();
         }
         });
      }

        function DepSelect(o, $txt)  { selDep = o;
              if ( o ) { $txt.val("(" + o.code + ") " + o.name);
                         iasufr.enableAskBeforClose(t);
              }
        }
        function RspSPSelect(o, $txt)  {
           if ( o ) {  selRspSP.id = o[0]; $txt.val(o[2]);
                      iasufr.enableAskBeforClose(t);
           }
           else  selRspSP.id = 0;
        }

    function RspFNSelect(o, $txt)  {
        if ( o ) { selRspFN.id = o[0]; $txt.val(o[2]);
            iasufr.enableAskBeforClose(t);
        }
        else  selRspSP.id = 0;
    }
    function RspOKRSelect(o, $txt)  { selRspOKR.id = o[0];
        if ( o ) { $txt.val(o[2]);
            iasufr.enableAskBeforClose(t);
        }
    }
    function InitTabBar() {
        tb = main.cells("b").attachTabbar("top");
        tb.setImagePath(iasufr.const.IMG_PATH);
        //tb.setMargin("2");
        tb.setOffset(250);
        tb.addTab("a1", "Академічні періоди для оплати", "200px");
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

        TableTabBar();
        return 1
    }  // InitTabBar


    function TableTabBar() {
        gS = tb.cells("a1").attachGrid();
        var hdr="Коментар,Початок, Кiнець, Сумма оплати";
        var wid="100,100,100,*";
        var typ="ed,dhxCalendarA,dhxCalendarA,ed";
        var align="center,center,center,center";

        gS.setHeader(hdr);
        gS.setInitWidths(wid);
        gS.setColAlign(align);
        gS.setColTypes(typ);
        gS.setImagePath(iasufr.const.IMG_PATH);
        gS.setIconsPath(iasufr.const.ICO_PATH);
        gS.enableEditTabOnly(true);
        gS.enableTooltips("false,false,false,false");
        gS.setColSorting('str,str,str,str');
        gS.init();         

    }   // TableTabBar


    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);

        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {

            if (id == 'save')  {  Save() }
            if (id == 'del')   {  iasufr.confirm("Пiдтвердiть видалення правила оплати", Del);
                               }
            if (id == 'close') { iasufr.close(t);  }
        }); // onClick
    }

    function Del() {
                iasufr.ajax({
                    url: "fin.Pers.cls",
                    data: {func: "PriceDel", json: JSON.stringify({idPrice: idPrice, idOrg:idOrg})},
                    success: function() { main.progressOff(); if (opt.onSave) opt.onSave();
                                          iasufr.messageSuccess("Видалено !"); iasufr.close(t); }
                });
    }

      function AddDel(pri) {
        var tab = tb.getActiveTab();
        if (pri == 2) {
            var ind = gS.getRowIndex(gS.getSelectedId());
            if (ind == -1) { iasufr.message('Вкажiть строку !'); return  }
            iasufr.confirm(iasufr.lang.msg.delete, DelStr)
            
                      }

        if (pri == 1) {
            Counter = Counter +1;
            var newid = Counter;
            gS.addRow(newid, ['', '', '',''], 0);
            window.setTimeout(function(){ gS.selectCell(0,0,false,false,true,true); gS.editCell() }, 1);
            iasufr.enableAskBeforClose(t);

        }
      }

        function DelStr() {   gS.deleteRow( gS.getSelectedId() );  }

     function Save() {
         var dep=""; if (selDep) dep=selDep.id;
            if (form.getItemValue("Prsk")=="") { iasufr.message("Вкажiть назву прейскуранту !"); return; }
            if (dep=="") { iasufr.message("Вкажiть факультет !"); return; }
            main.progressOn();
            var dk=iasufr.formatDateStr(form.getCalendar("DateK").getDate(true));

            var rspSP=""; if (selRspSP) rspSP=selRspSP.id;
            var rspFN=""; if (selRspFN) rspFN=selRspFN.id;
            var rspOKR=""; if (selRspOKR) rspOKR=selRspOKR.id;
            //alert(rspSP);
            var json = {idPrice:idPrice, idOrg: idOrg, DateK:dk, Dep:dep, RspSP:rspSP, RspFN:rspFN, RspOKR:rspOKR, State:form.getItemValue("State"), Val:form.getItemValue("Val"), Prsk:form.getItemValue("Prsk") };
            var item = []; var idRow;
            for (var i = 0; i < gS.getRowsNum(); i++) { //idRow=gS.getRowId(i);
                item.push({ kom: gS.cells2(i,0).getValue(), dn: gS.cells2(i, 1).getValue(), dk: gS.cells2(i, 2).getValue(), sum: gS.cells2(i, 3).getValue()} );
            }
            if (item.length != 0) json = $.extend( json, {Item: item} );
            iasufr.ajax({
                url: "fin.Pers.cls",
                data: {func: "PriceSave", json: JSON.stringify(json)},
                success: onSuccess,
                error: function() {if (main.progressOn) main.progressOff(); }
            });

     }

        function onSuccess(data) {
                                   main.progressOff();
                                   iasufr.disableAskBeforClose(t);
                                   iasufr.messageSuccess("Збережено !");
                                   Reload();
                                   if (opt.onSave) opt.onSave();
                                   //iasufr.close(t);
        }

    function Reload() {
        form.unload(); form=null;
        gS.clearAll();
        LoadData();
       main.progressOff();
    }

        return t;
    };
