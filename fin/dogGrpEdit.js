    //  корректировка шаблонов номеров договоров для выбранной группы "idGrp" -  ^Dog(idOrg,"G",idGrp,"H")
if (!window.Fin) Fin = {};
if (!Fin.DogGrpEdit) Fin.DogGrpEdit = {};

Fin.DogGrpEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idGrp=t.opt.idGrp;
    var idOrg=t.opt.idOrg;
    var idOrgName=t.opt.idOrgName;

    var idKosht=0;
    var toolbar;
    var form;
    var gS,gZ;
    var FlagCh=0;
    var Counter=1000;


    var main = new dhtmlXLayoutObject(t.owner, '2E');
    main.cells('b').setHeight('350');
    main.cells("a").hideHeader();
    main.cells("b").hideHeader();

    var gT = main.cells("a").attachGrid();
    var hdr="Опис частин шаблону";
    var wid="*";
    var typ="ro";
    var align="left";

    gT.setHeader(hdr);
    gT.setInitWidths(wid);
    gT.setColAlign(align);
    gT.setColTypes(typ);
    gT.setImagePath(iasufr.const.IMG_PATH);
    gT.setIconsPath(iasufr.const.ICO_PATH);
    gT.enableTooltips("false");
    gT.init();
    //iasufr.enableRowselectMode(gT);
    gT.enableRowsHover(true, "grid-row-hover");
    var data = {
        rows: [{
            id: 1,
            data: ["&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ознака = 1 :  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;значення дорівнює змісту цієї частини"]
        }, {
            id: 2,
            data: ["&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ознака = 2 :  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;значення дорівнює черговому порядковому номеру"]  // містить
        }, {
            id: 3,
            data: ["&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ознака = 3 :  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;значення дорівнює коду мережi організації-контрагента"]
        }]
    };
    gT.parse(data,"json");

    toolbar = main.attachToolbar();
    InitToolBar();
    InitTabBar();      //вкладки
    TableTabBar();     //  таблица во вкладке
    LoadData();

    function InitTabBar() {
        tb = main.cells("b").attachTabbar("top");
        tb.setImagePath(iasufr.const.IMG_PATH);
        tb.setOffset(250);
        tb.addTab("a1", "Шаблон номеру договору", "200px");
        tb.addTab("a2", "Значення за умовчанням у договорi", "220px");
		tb.addTab("a3", "Тексти договорiв", "200px");
		
		tb.setTabActive("a3");
        tb.enableAutoReSize();
        $("<div id='infoToolbar'><div>").insertBefore($(tb._tabs["a1"]));

        var tlb = new dhtmlXToolbarObject("infoToolbar");
        tlb.setIconsPath(iasufr.const.ICO_PATH);
        tlb.setIconSize(16);
        tlb.addButton("new", 2, iasufr.lang.ui.add, "16/plus.png", "");
        tlb.addButton("cut", 3, iasufr.lang.ui.delete, "16/cross.png", "");
		//tlb.addButton("edit", 3, iasufr.lang.ui.edit, "16/cross.png", "");
        //tlb.hideItem('edit');
        tb.attachEvent("onSelect", function(id, lastId){    if (id=='a2') { tlb.hideItem('new'); tlb.hideItem('cut');  }
                                                            if (id=='a1') { tlb.showItem('new'); tlb.showItem('cut'); }   // tlb.hideItem('edit');
															if (id=='a3') { tlb.showItem('new'); tlb.showItem('cut');  }  // tlb.showItem('edit');
            return true
        });
        tlb.attachEvent("onClick", function (id) {  AddDel(id);   });
    }  // InitTabBar

    function TableTabBar() {
        gS = tb.cells("a1").attachGrid();
        var hdr="З дати,ознака,значення,,ознака,значення,,ознака,значення,,ознака,значення,,ознака,значення";
        var wid="80,40,100,50,40,100,50,40,100,50,40,100,50,40,*";
        var typ="dhxCalendarA,ed,ed,ro,ed,ed,ro,ed,ed,ro,ed,ed,ro,ed,ed";
        var align="center,center,left,left,center,left,left,center,left,left,left";

        gS.setHeader(hdr);
        gS.setInitWidths(wid);
        gS.setColAlign(align);
        gS.setColTypes(typ);
        gS.setImagePath(iasufr.const.IMG_PATH);
        gS.setIconsPath(iasufr.const.ICO_PATH);
        gS.enableEditTabOnly(true);
        gS.enableTooltips("false    ,false,false,false,false,false,false,false,false,false,false");
        gS.init();


        gS.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
            if ((stage==2)&&(nValue!=oValue)) iasufr.enableAskBeforClose(t);
            //----------------- kekv --------------------------
            if ( (stage == 2) && ( (cellInd==1)||(cellInd==4)||(cellInd==7)||(cellInd==10)||(cellInd==13) ) ) {
                if (nValue == '') gS.cells(rowId, cellInd+1).setValue('');
                if ( (nValue!="")&&(nValue!=1)&&(nValue!=2)&&(nValue!=3) ) { iasufr.alert("Тiльки  1, 2, 3 !"); return false}
            }


            return true
        });  // onEditCell

        gZ = tb.cells("a2").attachGrid();
         hdr=" Код_ДКТП,Кiлькiсть,Од.вимiру,За_скiльки";
         wid="100,100,100,100";
         typ="ed,ed,ed,ed";
         align="center,center,center,center";

        gZ.setHeader(hdr);
        gZ.setInitWidths(wid);
        gZ.setColAlign(align);
        gZ.setColTypes(typ);
        gZ.setImagePath(iasufr.const.IMG_PATH);
        gZ.setIconsPath(iasufr.const.ICO_PATH);
        gZ.init();
		
         gT = tb.cells("a3").attachGrid();
         //     0       1              2            3   4                                               5                      6                      7                 8            9            10
         hdr=" Код, Назва договору,Типи органiзацiй,,Сума договору &nbsp;&nbsp;&nbsp;(за умовч),Сума за квартал (за умовч),Дата початку договору,Дата закiнчення дог.,На пiдставi,Регiстрац.номера органiзацiй,1";
         wid="35,210,400,25,100,100,80,80,80,*,10";
         typ="ro,ro,ed,img,ed,ed,dhxCalendarA,dhxCalendarA,ed,ed,ro";
         align="center,left,left,center,center,center,center,left,left,left,left";

        gT.setHeader(hdr);
        gT.setInitWidths(wid);
        gT.setColAlign(align);
        gT.setColTypes(typ);
        gT.setImagePath(iasufr.const.IMG_PATH);
        gT.setIconsPath(iasufr.const.ICO_PATH);
		gT.enableEditTabOnly(true);
        gT.enableTooltips("false,false,true,false,false,false,false,false,false,true");
		gT.init();
        gT.setColumnHidden(10,true);
        gT.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) { if ((stage==2)&&(nValue!=oValue)) iasufr.enableAskBeforClose(t);  return true  });
		
		gT.attachEvent("onRowSelect", function (id) {
            var ind = gT.getSelectedCellIndex();
            if (ind == 3) {
                 iasufr.loadForm('OrgType',{width:650,height:500,selectMulti:true,onSelect:function(p) { 
				                  var zn='';
								  for (var i = 0; i < p.length; i++)  { zn += p[i][0] + '-' + p[i][1] +', '; }
								  gT.cells(id,2).setValue(zn);
								  iasufr.enableAskBeforClose(t);	 
                 }  });
			
            }
			/*
            if (ind == 5) {
                 iasufr.loadForm('DogTag',{width:400,height:300,selectMulti:true,onSelect:function(p) { 
				                  var zn='';
								  for (var i = 0; i < p.length; i++)  { zn += p[i][0] + '-' + p[i][1] +', '; }
								  gT.cells(id,4).setValue(zn);
								  iasufr.enableAskBeforClose(t);	 
                 }  });
			
            }
            */
        });
		

    }  // TableTabBar

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);

        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            if (id == 'save')   Save() ;
            if (id == 'close')  iasufr.close(t); 
        }); // onClick
    }

    function AddDel(button) {
        var tab = tb.getActiveTab();
        if (tab == 'a3') {
            var ind = gT.getRowIndex(gT.getSelectedId());
            if ( (ind == -1) && (button == 'cut') ) { iasufr.message('Вкажiть строку !'); return  }
            if (button == 'cut') iasufr.confirm(iasufr.lang.msg.delete, DelStr);
			if (button == 'new')  { iasufr.loadForm("DogTxtOrg", {idGrp:idGrp,idOrg:idOrg, idOrgName:idOrgName, modal:true, width:500, height:350, select:true, onSelect:DogSelect }) }
			return
        }
		
		if (button == 'cut') {
            var ind = gS.getRowIndex(gS.getSelectedId());
            if (ind == -1) { iasufr.message('Вкажiть строку !'); return  }
            iasufr.confirm(iasufr.lang.msg.delete, DelStr)
   }
        if (button == 'new') {
            Counter = Counter +1;
            var newid = Counter;
            gS.addRow(newid, ['', '', '','','','','','','','',''], 0);
            window.setTimeout(function(){ gS.selectCell(0,0,false,false,true,true); gS.editCell() }, 1);
        }
		
    }
	
    function DogSelect(o) {  
	        Counter = Counter +1;
            var newid = Counter;
			var img="btn-select.png";
            gT.addRow(newid, [o[0], o[1], "", img,"","","",""]);
            gT.cells(newid,0).setValue(o.id);
            gT.cells(newid,1).setValue(o.name);
            iasufr.enableAskBeforClose(t);
    }

    function DelStr() {   
	   var tab = tb.getActiveTab(); 
	   var gr=gS; if (tab == 'a3') gr=gT;
	   gr.deleteRow( gr.getSelectedId()  ); 
	   iasufr.enableAskBeforClose(t); 
	}

    function LoadData() {
        main.progressOn();
        iasufr.ajax({
            url:'fin.Dog.cls',
            data: {func: "TemplateGet", json: JSON.stringify( { idGrp:idGrp, idOrg:idOrg } ) } ,
            success: function (data) {
                var json=JSON.parse(data);
                gS.parse(json, 'json');
            }
        });
        iasufr.ajax({
            url:'fin.Dog.cls',
            data: {func: "DefaultGet", json: JSON.stringify( { idGrp:idGrp, idOrg:idOrg } ) } ,
            success: function (data) {
                gZ.parse(JSON.parse(data), 'json');
            }
        });
		iasufr.ajax({
            url:'fin.Dog.cls',
            data: {func: "TxtGet", json: JSON.stringify( { idGrp:idGrp, idOrg:idOrg } ) } ,
            success: function (data) { 
                gT.parse(JSON.parse(data), 'json');
                var title;
                var cnt=gT.getRowsNum();
                if (cnt>0) { for (var i = 0; i < cnt; i++) {
                    title=gT.cells2(i,10).getValue();
                    $(gT.cells2(i, 9)).attr('title',title);

                }}
                main.progressOff();
            }
        });
    }
    function Reload() { gS.clearAll();  LoadData();  }

   
    function Save() {
        main.progressOn();
        var json = {idOrg: idOrg, idGrp: idGrp};

        // ---------------------- частини шаблону
        var item = []; var dflt = [];  var dog = []; 
		var date; var dt; var i;
        var zn1,zn2,zn3,zn4;
        var str=""; var idRow; var zn;
        for (i = 0; i < gS.getRowsNum(); i++) {
            date=gS.cells2(i, 0).getValue();
            if (date != "") {
                idRow=gS.getRowId(i);
                gS.forEachCell(idRow, function (cellObj, ind) {
                    zn=cellObj.getValue(); if (ind==0) zn=iasufr.formatDateStr(iasufr.replaceAll(zn,"/","."));
                    if (gS.getColType(ind) != 'ro')  str=str+zn+ "^";
                                                               });
                str=str+"!!!";
            }
        }
             zn1=gZ.cells2(0, 0).getValue();  zn2=gZ.cells2(0, 1).getValue();
             zn3=gZ.cells2(0, 2).getValue();  zn4=gZ.cells2(0, 3).getValue();
             dflt.push({ zn1: zn1, zn2: zn2, zn3: zn3, zn4: zn4} );
            var dn; var dk;
        for ( i = 0; i < gT.getRowsNum(); i++) {
            dn =  gT.cells2(i, 6).getValue();
            dk =  gT.cells2(i, 7).getValue();
            dn=iasufr.formatDateStr(iasufr.replaceAll(dn,"/","."));
            dk=iasufr.formatDateStr(iasufr.replaceAll(dk,"/","."));

            if (gT.cells2(i, 0).getValue() != "") dog.push({Dog: gT.cells2(i, 0).getValue(), Tip: gT.cells2(i, 2).getValue(), sumD: gT.cells2(i, 4).getValue(), sumK: gT.cells2(i, 5).getValue(), dn:dn, dk:dk, osn:gT.cells2(i, 8).getValue(), Org:gT.cells2(i, 9).getValue() });
        }

        json = $.extend( json, {Item: str} , {Dflt: dflt}, {DogTxt: dog} );
        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "TemplateSave", json: JSON.stringify(json)},
            success: onSuccess,
            error: function() {if (main.progressOn) main.progressOff(); }
        });
    }

    function onSuccess(data) {
        main.progressOff();
        iasufr.messageSuccess("Збережено !");
		iasufr.disableAskBeforClose(t);
        if (opt.onSave) opt.onSave();
    }

    return t;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/dogGrpEdit.js