if (!window.Fin) Fin = {};
if (!Fin.DogKoshtEdit) Fin.DogKoshtEdit = {};         

Fin.DogKoshtEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idKosht=t.opt.idKosht; //alert(idKosht);
    var idOrg=t.opt.idOrg;
         
    var toolbar;
    var form;
    var gS;
    var FlagCh=0;
    var Counter=1000;
    
    var selGrup = null;

    var main = new dhtmlXLayoutObject(t.owner, '2E');
    main.cells('b').setHeight('440');
    main.cells("a").hideHeader();
    main.cells("b").hideHeader();
    main.progressOn();

    toolbar = main.attachToolbar();    InitToolBar();
    
    LoadData();
    InitTabBar();      //вкладки 
    TableTabBar();     //  таблица во вкладке 


   function LoadData() { 
         iasufr.ajax({url:'fin.Dog.cls', data: {func: "KoshtEdit", json: JSON.stringify( {idKosht:idKosht, idOrg:idOrg, item:0} ) } ,
             success: function (data) { 
             var jso = JSON.parse(data);
             form = main.cells("a").attachForm(jso);
             form.attachEvent("onChange", function (id, value){ FlagCh=1; });
             FlagCh=0;

                 //-------------------
             //iasufr.attachSelector(form.getInput("Grup"), "DogGrup",  { onSelect: GrupSelect});
             //selGrup={};  selGrup.id= form.getItemValue("GrupCode");
                 //-------------------

             $(form.getInput("Name")).focus();

             $(form.getInput("Name")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Num")).focus()  });
             $(form.getInput("Num")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Date")).focus()  });
             main.progressOff();
         }
         });
    }



    function InitTabBar() {
        tb = main.cells("b").attachTabbar("top");
        tb.setImagePath(iasufr.const.IMG_PATH);
        //tb.setMargin("2");
        tb.setOffset(250);
        tb.addTab("a1", "Статтi", "200px");
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
        gS = tb.cells("a1").attachGrid();
        var hdr="рег.N,Назва статтi,номер,сумма,формула,кекв,,назва кекв";
        var wid="30,180,80,80,150,40,25,*";
        var typ="ro,ed,ed,ed,ed,ed,img,ro";
        var align="center,left,center,right,center,right,center,left";

        gS.setHeader(hdr);
        gS.setInitWidths(wid);
        gS.setColAlign(align);
        gS.setColTypes(typ);
        gS.setImagePath(iasufr.const.IMG_PATH);
        gS.setIconsPath(iasufr.const.ICO_PATH);
        gS.enableEditTabOnly(true);
        gS.enableTooltips("false,true,false,false,false,false,false,true");
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

                          } }); // ajax
                                         } 

                                                         }

                    //-------------------------------------------  
                   //----------ДЛЯ формулі расчета ---------------------------------
                   if ( (stage == 2) && (cellInd == 4) ) {
                        if ( (nValue!= oValue) && (nValue != '') ) { //return true
                           var idK=form.getItemValue("idK");
                           iasufr.ajax({ 
                           url:'fin.Dog.cls', 
                           data: {func: "KoshtSumItem",  json: JSON.stringify( {idKosht: idK, idOrg:idOrg, frm: nValue} ) },
                           success: function (data) { 
                                  var obj =JSON.parse(data); 
                                  gS.cells(rowId, cellInd-1).setValue(obj.sum);
                                  
                          } }); // ajax
                                                                   } 
                                                         }

                  //-------------------------------------------  

                      return true
          });  // onEditCell
       

       iasufr.ajax({
               url:'fin.Dog.cls', 
               data: {func: "KoshtEdit", json: JSON.stringify( {idKosht:idKosht, idOrg:idOrg, item:1} ) } ,
               success: function (data) { 
                     var json=JSON.parse(data);
                     gS.parse(json, 'json');

                    //--------------------
                    var cnt=gS.getRowsNum();
                    if (cnt>0) { for (var i = 0; i < cnt; i++) {
                                //gS.cells2(i,0).getValue();
                                $(gS.cells2(i, 6).cell).click(onCellClick);
                                                               } }
                    //-------------------- 

                    var tmp = idKosht.split('.');
                    var idRow = tmp[1];
                    gS.selectRowById(idRow);
                    var RowInd = gS.getRowIndex(idRow);
                    gS.selectCell(RowInd,3);
                                        }
        });


     }
    
     function onCellClick(e){
        var ind=$(e.currentTarget).parent().index()-1;
        var idRow=gS.getRowId(ind);

        iasufr.loadForm('Kekvs',{width:550,height:600, select:true, onSelect:function(p) {
                gS.cells(idRow,5).setValue(p.id);
                gS.cells(idRow,7).setValue(p.name);
                FlagCh=1;
            }  });

    }


    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);

        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {

            if (id == 'save')  {  Save() }
            if (id == 'del')   {  iasufr.confirm("Пiдтвердiть видалення кошторису ", Del);
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


                    // видалення усьго кошторису
    function Del() {
                var idK=form.getItemValue("idK"); 
                iasufr.ajax({
                    url: "fin.Dog.cls",
                    data: {func: "DogKoshtDel", json: JSON.stringify({idKosht: idK, idOrg:idOrg})},
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
            var img="btn-select.png";
            gS.addRow(newid, ['', '', '','','','',img], 0);   
            FlagCh=1; 
            $(gS.cells2(0, 6).cell).click(onCellClick);  
            window.setTimeout(function(){ gS.selectCell(0,1,false,false,true,true); gS.editCell() }, 1);

        }
    }  


   function DelStr() {   gS.deleteRow( gS.getSelectedId() ); FlagCh=1; }

  
 function Save() {
            if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
            var dateZ=iasufr.formatDateStr(form.getCalendar("Date").getDate(true));  

            main.progressOn();
            var json = $.extend(form. getFormData(), {idOrg: idOrg, DateZ:dateZ});

          
         // ---------------------- статті
            var item = []; var idRow;
            for (i = 0; i < gS.getRowsNum(); i++) { idRow=gS.getRowId(i);
                if (gS.cells2(i, 1).getValue() != "") item.push({idRow:idRow, name: gS.cells2(i, 1).getValue(), num: gS.cells2(i, 2).getValue(), sum: gS.cells2(i, 3).getValue(), frm: gS.cells2(i, 4).getValue(), kekv: gS.cells2(i, 5).getValue()} );
                                                  }
            //-----------------------

            if (item.length != 0) json = $.extend( json, {Item: item} );
            
            iasufr.ajax({
                url: "fin.Dog.cls",
                data: {func: "KoshtSave", json: JSON.stringify(json)},
                success: onSuccess,
                error: function() {if (main.progressOn) main.progressOff(); }
            });
         
       
        }
  

        function onSuccess(data) {
                                   main.progressOff();  
                                   iasufr.messageSuccess("Збережено !");
                                   if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список кошторисів в таблице
                                   iasufr.close(t);                                    
                                 }


    return t;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/dogKoshtEdit.js