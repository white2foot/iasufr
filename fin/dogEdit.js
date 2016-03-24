// корректировка договора  ^Dog(idOrg,"D",idDog) -  dogEdit.js

if (!window.Fin) Fin = {};
if (!Fin.DogEdit) Fin.DogEdit = {};

Fin.DogEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    //t.owner.setModal(true);
    //t.owner.maximize();
    t.owner.button("park").disable();
    var idOrg=opt.idOrg;
    var orgName="";  if (opt.orgName) orgName=opt.orgName;
    var idDog=opt.idDog;
    
    var user=iasufr.user;
    var idOrgUser=user.orgId;
    var dost=iasufr.pFunc("dogEdit");
    var admin=iasufr.pGrp(1);
    var tolbB;
    var tolbC;
    var tolbD;

    //console.log('dost='+dost+' adm='+admin);

    var hh=$( document ).height()-80;
    hh=parseInt(hh/4);
    dhtmlx.image_path = iasufr.const.IMG_PATH;
    //iasufr.formatDate(new Date()));

    var main = new dhtmlXLayoutObject(t.owner, '3L');
    main.cells('a').setWidth('380');
    main.cells('b').setHeight(hh*2);  // 160
    main.cells("a").hideHeader();

    var c = main.cells('c');
    var mainL = c.attachLayout('2E');
    mainL.cells('a').setHeight(hh);  // 160

    var zag="рег N "+idDog; if (idDog==0) zag="Новий договiр";
    t.owner.setText(zag);
    main.progressOn();

    var form;
    var Counter = 1000;
    var imgHELP = 'btn-select.png';
    var selOrgK = null;
    var selOrgP = null;
    var selKosht = null;
    var selGrp = null;

    var selPersK = null;
    var selPersP = null;

    var tolb = main.attachToolbar();
    tolb.setIconPath(iasufr.const.ICO_PATH);
    tolb.setIconSize(32);


    //if (iasufr.pFunc("dogEdit")) {
        tolb.addButton("save", 7, iasufr.lang.ui.save, "32/database_save.png", "");
        tolb.addButton("del", 8, "Видалити договiр", "32/toolbar_delete.png", "");
    //}
    if (!iasufr.pFunc("dogEdit"))  {
        if (tolb.objPull[tolb.idPrefix + "save"]) tolb.disableItem("save");
        if (tolb.objPull[tolb.idPrefix + "del"]) tolb.disableItem("del");
    }
    //tolb.addButton("reload", 9, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");

    if (idDog>0) {
	   tolb.addSeparator("sep1", 11);
       tolb.addButton("printd", 12, "Друк договору ", "32/printer_empty.png", "");
       tolb.addButton("printdd", 12, "Друк дод.угоди ", "32/printer_empty.png", "");
	   
       tolb.addSeparator("sep1", 13);
       tolb.addButton("print", 14, "Друк акту звiрки на дату ", "32/printer_empty.png", "");
       var dn = iasufr.formatDate(new Date());
       dn="01"+dn.substr(2,10);
       tolb.addInput("dtZVIRKA", 15, dn, 72);
        var c1 = new dhtmlXCalendarObject({input: tolb.getInput("dtZVIRKA")});
        c1.hideTime();
        c1.setDateFormat("%d.%m.%Y");
    }
    tolb.addSeparator("sep3", 17);
    tolb.addButton("close", 18, iasufr.lang.ui.close, "32/door.png", "");


    tolb.attachEvent("onClick", onToolbarClick);
    //----------------------------------------

    function onToolbarClick(name) {
        if (name=='print')        {   DocToPrint(0,'acz');     }
        if (name=='printdd')        {   DocToPrint(0,'dd');     }

        if (name=='printd')        {   ToPrint();     }
        if (name == "save")  { Save(); }
        if (name == "reload"){ Reload(); }
        if (name == "del") iasufr.confirm('Пiдтвердiть: Видалити договiр ?', Del);
        if (name == "close") { iasufr.close(t); }
    }

    function ToPrint() {
        main.progressOn();
        var pu = new PrintUtils();
        iasufr.ajax({url:'fin.Dog.cls', data: {func: "TextForPrint", json: JSON.stringify( {idDog:idDog, idOrg:selOrgK.id, idOrgOsnCode:form.getItemValue('idOrgOsnCode')}) }, success: function (data) {
            var jso = JSON.parse(data);
            var txt =jso.txt;
            iasufr.print( txt );
            main.progressOff();

        } });
    }
    //-------------------------------------------
    var tlbb = main.cells("b").attachToolbar();
    //tlbb.addText("txt", 1, "Зобов`язання органiзацii:&nbsp;&nbsp;&nbsp;<b>" + orgName + "</b>");
    var tbb=InitTAB("b");
    // вкладки

    var tlbc = mainL.cells("a");  //.attachToolbar();
    if (idDog==0) tlbc.setText("Зобов`язання контрагента"); //tlbc.addText("txtс", 1, "Зобов`язання контрагента");
    tlbc.collapse();

    var tbc=InitTAB("c");     // вкладки

    var tbcL=InitTABdop();     // вкладки - состояние договора, переговоры
    var gS = InitTABtableS("a1");
    var gSP = InitTABtableS("a2");

    var gR_F = InitTABtable("OR"); // таблицы во вкладках - Зобов`язання - финансы
    var gK_F = InitTABtable("OK");

    var gR_P = InitTABtable1("OR"); // таблицы во вкладках -послуги
    var gK_P = InitTABtable1("OK");

    LoadData();
    //---------------------------------------------------------------------

    function InitTAB(cellsName) {
        var tb;
        if (cellsName=='b') tb = main.cells(cellsName).attachTabbar();
        else tb = mainL.cells('a').attachTabbar();

        tb.setImagePath(iasufr.const.IMG_PATH);
        tb.setMargin("2");
        var wid='130px';
        var offs='400'; //if (cellsName=='b') offs='350';
        tb.setOffset(offs);
        tb.addTab("a1", "Платежi", wid);
        tb.addTab("a2", "Послуги", wid);
        tb.addTab("a3", "Товари",  wid);
        tb.setTabActive("a2");
        tb.disableTab("a3");
        tb.enableAutoReSize();
        var d = new Date();    d = d.valueOf();
        var idDiv = 'info' + d + cellsName;
        $("<div id="+idDiv+"><div>").insertBefore($(tb._tabs["a1"]));

        var tlb = new dhtmlXToolbarObject(idDiv);

        switch (cellsName) {
            case 'b': {        tolbB=tlb;   break;      }
            case 'c':  {       tolbC=tlb;   break;      }
        }

        tlb.setIconsPath(iasufr.const.ICO_PATH);  // "/images/imgs/");
        tlb.setIconSize(16);
        var add=cellsName + '_add' + d;
        var cut=cellsName + '_cut' + d;
        var akt=cellsName + '_akt' + d;
        var prn=cellsName + '_prn' + d;
        var acc=cellsName + '_acc' + d;
        if (iasufr.pFunc("dogEdit")) {
           tlb.addButton(add, 2, iasufr.lang.ui.add, "16/plus.png", "");
		   tlb.addButton(akt, 4, iasufr.lang.ui.edit, "16/page_white_edit.png", "");
           tlb.addButton(prn, 4, "Друк акту", "16/printer_empty.png", "");
           tlb.addButton(acc, 4, "Друк рахунку", "16/printer_empty.png", "");

           if ( tb.getActiveTab()!='a2' ) { tlb.hideItem(akt); tlb.hideItem(prn); tlb.hideItem(acc); }
           if  (!dost)  { tlb.disableItem(add); tlb.disableItem(akt);  }
        }

        tlb.attachEvent("onClick", function (id) {
            var p=id.substr(0,1);       // b, c
            var tab=tb.getActiveTab(); //
            var make=id.substr(2,3);  // 'add', 'cut'
            AddDel(make,p,tab);
        });

        tb.attachEvent("onSelect", function(id, lastId){    if (id!='a2') { tlb.hideItem(akt); tlb.hideItem(prn); tlb.hideItem(acc); }
                                                             else         { tlb.showItem(akt); tlb.showItem(prn); tlb.showItem(acc); }
            return true
        });

        return tb
    }  // InitTAB

//---------------------------------------------------------------------
    function InitTABdop() {
        var tb = mainL.cells('b').attachTabbar();
        tb.setImagePath(iasufr.const.IMG_PATH);
        tb.setMargin("2");
        tb.setOffset(280);
        tb.addTab("a1", "Стан договору", "200px");
        tb.addTab("a2", "Переговори", "200px");

        tb.setTabActive("a1");
        tb.enableAutoReSize();
        var d = new Date();    d = d.valueOf();
        var idDiv = 'info' + d;
        $("<div id="+idDiv+"><div>").insertBefore($(tb._tabs["a1"]));

        var tlb = new dhtmlXToolbarObject(idDiv);
        tolbD=tlb;
        tlb.setIconsPath(iasufr.const.ICO_PATH);
        tlb.setIconSize(16);
        var add='d_add' + d;
        var cut='d_cut' + d;
        if (iasufr.pFunc("dogEdit")) {
           tlb.addButton(add, 2, iasufr.lang.ui.add, "16/plus.png", "");
           tlb.addButton(cut, 3, iasufr.lang.ui.delete, "16/cross.png", "");
            if  (!dost)  { tlb.disableItem(add); tlb.disableItem(cut); }
        }


        tlb.attachEvent("onClick", function (id) {
            var p=id.substr(0,1);       // d
            var tab=tb.getActiveTab(); //
            var make=id.substr(2,3);  // 'add', 'cut'
            AddDel(make,p,tab);
        });
        return tb
    }  // InitTABdop


    function LoadData() {
        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "GetDog", json: JSON.stringify({idOrg: idOrg, idDog: idDog})},
            error: function() {if (main.progressOn) main.progressOff(); },
            success: AddData
        });
        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "GetDogTable", json: JSON.stringify({idOrg: idOrg, idDog: idDog})},
            error: function() {if (main.progressOn) main.progressOff(); },
            success: function (data) {
                var jso=JSON.parse(data);
                var label;
                //---------  послуги
                var js = jso.tOR1;   gR_P.parse(js, 'json');
                js = jso.tOK1;   gK_P.parse(js, 'json');
                var cnt=gR_P.getRowsNum();

                //  скрыть строки, в к-рых состояние акта не явл.последним:  дата начала=""
                var dts,dtsp;
                for ( var i = 0; i <cnt; i++) {
                      dtsp="";
                      if ((i>0) && (gR_P.cells2(i-1, 5).getValue() != "")) dtsp=gR_P.cells2(i-1, 8).getValue();
                      if ((gR_P.cells2(i, 5).getValue()) == "") {
                          dts=gR_P.cells2(i, 8).getValue();  //дата стану
                          if ( (dts!=dtsp)&&(dts!="") )  gR_P.setRowHidden(gR_P.getRowId(i),true);
                      }
                }

                if (cnt>0) { tbb.setTabActive("a2");  }
                cnt=gK_P.getRowsNum();
                if (cnt>0) { tbc.setTabActive("a2"); }
                //iasufr.gridRowFocusApply(gR_P); iasufr.gridRowFocusApply(gK_P);

                // ---------финансы
                js= jso.tOR;   gR_F.parse(js, 'json');
                js= jso.tOK;   gK_F.parse(js, 'json');
                cnt=gR_F.getRowsNum();  if (cnt>0) {  tbb.setTabActive("a1");  }
                cnt=gK_F.getRowsNum();   
				
				if (cnt>0) {  tbc.setTabActive("a1"); tlbc.expand(); }
				//else { tlbc.expand(); mainL.cells('a').setHeight(100); }
				//
                //----------состояние, переговоры
                var combo = gS.getCombo(1);
                if (jso.StanDog) { gS.clearAll(); for (var i = 0; i < jso.StanDog.length; i++) { combo.put(jso.StanDog[i][0],jso.StanDog[i][1]);  }}
                js = jso.tStan;   gS.parse(js, 'json');

                //alert($(".dhx_combo_select").css("overflow"));
                // $("select .dhx_combo_select").css("overflow","auto");
                
                js= jso.tSpeak;   gSP.parse(js, 'json');

            }
        });

    }

    function Label(tb,tab) {  var label=tbb.getLabel(tab); label=label+' *'; tbb.setLabel(tab,label,'150px');   }
	function clc() { alert(888);}
	
	function AddPlus() {
        var $inp = $(form.getInput('idOrgK'));  // class='img-sprav-sel'
		var p = $inp.position();
		var top=p.top;
		//alert($inp.width() +'---'+ top); .css("background-image", "url(/images/sky_blue_sel.png)") 
        
		var $img = $("<div id='d555'></div>")  
		    .css("background-image", "url(/images/imgs/plus.gif)") 
		    .css("margin-left", ($inp.width()+1) + "px")
			.css("margin-top", "-16px")
			.css("display", "block")
			.css("width", "20px")
			.css("height", "20px")
			.css("cursor", "pointer")
            .bind("click", clc);
		var im = $("<img>");
        //$(im[0]).css("width", "40px").css("height", "40px");
				
        $img.insertAfter($inp);
		
    }

    function AddData(d) {
        main.progressOff();
        var jso=JSON.parse(d);
        form = main.cells("a").attachForm(jso);
        form.setNumberFormat("Sum","0,000.00",",",".");
        //$(form.getItemLabel('FormAkt')).attr('title','Зберегти формуються рядки з актами про надання послуг');
        //form.setTooltip ('idOrgOsn', '', '555');
		form.setNote("idOrgK", { text:form.getItemValue('idOrgKcity') , width:300 });
		form.setNote("idOrgOsn", { text:form.getItemValue('idOrgCity') , width:300 });
        var arr = ["idOrgOsn","Grp","idOrgK","idOrgP", "idPersK" , "idPersP"];
        for (var a in arr) $(form.getInput(arr[a])).css('color','#0000cc');

        tlbb.addText("txt", 1, "Зобов`язання органiзацii:&nbsp;&nbsp;&nbsp;<b>" + form.getItemValue("idOrgOsn") + "</b>");
		// AddPlus();
				
		if ( (!admin) && (idDog==0) ) idOrg=form.getItemValue("idOrgOsnCode");
		if ( (!admin) && (idOrg!=idOrgUser) ) { tolb.disableItem("save"); tolb.disableItem("del"); }
        var orgNameK=form.getItemValue("idOrgK");
        if (idDog>0) { var name=orgNameK;   //.substr(0,103); if ( orgNameK.substr(103,3)!='' ) name+='...'
            tlbc.setText("Зобов`язання контрагента:&nbsp;<b>" + name + "</b>");
        }

        form.attachEvent("onChange", function (id, value){
            iasufr.enableAskBeforClose(t);
            if (id=='Kosht') {iasufr.ajax({url:'fin.Dog.cls', data: {func: "getKoshtName", idOrg:idOrg, num:value },
                success: function (data) {
                    jso=JSON.parse(data);
                    if (jso.isMessage) selKosht=null;
                    else { selKosht=null; selKosht={}; selKosht.id = jso.id; }
                    form.setItemValue('Kosht',jso.name);
                }
            })
            }

        });
        form.attachEvent("onFocus", function(name){
            if ( (name=="DateN") && (form.getItemValue(name)=="") ) { form.setItemValue(name,'01.01.2015') }
            if ( (name=="Num") && (form.getItemValue(name)=="") ) {
                var date=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
                if (date=="") return;
                if (selGrp==null) return;
                var idK=0; if (selOrgK!=null) idK=selOrgK.id;
                var json={ idOrg:idOrg, idOrgK:idK, idGrp:selGrp.id, Date:date };
                iasufr.ajax({url:'fin.Dog.cls', data: {func: "getDogNum", json: JSON.stringify(json) },
                    success: function (data) {
                        jso=JSON.parse(data);
                        form.setItemValue('Num',jso.num);
                    }
                })
            }
        });
         if (!dost) form.lock();
         /*
             var lst = form.getItemsList(); var type;
         for (var i = 0; i < lst.length; i++) {
                      type=form.getItemType(lst[i]);
                      //console.log('i='+i+'/'+type);
                      if  ( (type=='input')   &&  (!form.isItemHidden(lst[i])) )   {  form.setReadonly(lst[i], true); }
         }
         */



        $(form.getInput("Kosht")).keydown(function(e){if (e.keyCode == 13) { $(form.getInput("Kom")).focus();}  });
        //$(form.getInput("Date")).keydown(function(e){if (e.keyCode == 13) { $(form.getInput("Num")).focus();}  });

        selOrgK=null; selOrgP=null; selKosht=null; selGrp=null; selPersK=null;  selPersP=null;
        selOrgK={};   selOrgP={};   selKosht={};   selGrp={};   selPersK={};    selPersP={};
        selOrgK.id= form.getItemValue("idOrgKcode"); selOrgK.name = form.getItemValue("idOrgK");
        selOrgP.id= form.getItemValue("idOrgPcode"); selOrgP.name = form.getItemValue("idOrgP");
        selKosht.id= form.getItemValue("KoshtCode");
        selGrp.id = form.getItemValue("GrpCode");
        selPersK.id = form.getItemValue("idPersKcode");
        selPersP.id = form.getItemValue("idPersPcode");
        //form.setReadonly("idOrgK", true);
        //form.setReadonly("idOrgP", true);

        if (dost) {
          iasufr.attachSelector(form.getInput("idOrgK"), "OrgSelector",  { width:1100,height:600, AddCode:true, accountAdd:true, bankOnly:false, isType:true, AddCode:true, onSelect: OrgSelectK});
          iasufr.attachSelector(form.getInput("idOrgP"), "OrgSelector",  { width:1100,height:600,AddCode:true,accountAdd:true,bankOnly:false,onSelect: OrgSelectP});
          if (admin) { iasufr.attachSelector(form.getInput("idPersK"), "Pers",  { onSelect: PersSelectK});
                       iasufr.attachSelector(form.getInput("idPersP"), "Pers",  { onSelect: PersSelectP});
          }

          iasufr.attachSelector(form.getInput("RRosn"), "OrgSelector", { width:1100,height:600,accountAdd:true,bankOnly:false, idOrg:idOrg, onSelect: OrgSelectR} );
          iasufr.attachSelector(form.getInput("RRkor"), "OrgSelector", { width:1100,height:600,accountAdd:true,bankOnly:false, idOrg:selOrgK.id,  ChangeOrg:true,  onSelect: OrgSelectRRkor} );
          iasufr.attachSelector(form.getInput("RRpl"),  "OrgSelector", { width:1100,height:600,accountAdd:true,bankOnly:false, idOrg:selOrgP.id,  ChangeOrg:true,  onSelect: OrgSelectRRpl});

          $("div .img-sprav-sel").click(oncl);
        }

        function oncl()  {
              var name=$(this).prev().attr('name');
              switch (name) {
                case 'RRkor': {
                    iasufr.loadForm("OrgSelector", { width:1100,height:600,accountAdd:true,bankOnly:false, idOrg:selOrgK.id, ChangeOrg:false, onSelect: OrgSelectRRkor});
                    break;
                }
                case 'RRpl':  {
                    iasufr.loadForm("OrgSelector", { width:1100,height:600,accountAdd:true,bankOnly:false, idOrg:selOrgP.id, ChangeOrg:false, onSelect: OrgSelectRRpl});
                    break;
                }
              }
        }
        if (dost) {
           iasufr.attachSelector(form.getInput("Grp"), "DogGrp", {onSelect: GrpSelect, idOrg:idOrg, orgName:orgName});
           iasufr.attachSelector(form.getInput("Kosht"), "DogKosht", {onSelect: KoshtSelect, idOrg:idOrg, orgName:orgName});
        }
        TitleWrite();  TitleWriteRR();
    }  // AddData

    function OrgSelectK(o, $txt)  { selOrgK = o;
        if ( o ) { $txt.val("(" + o.code + ") " + o.name);
            iasufr.enableAskBeforClose(t);
            //if (form.getItemValue("RRkor")=="")  form.setItemValue("RRkor", o.account);
            form.setItemValue("RRkor", o.account);
        }
        else form.setItemValue("RRkor", "");
        TitleWrite(); TitleWriteRR();
    }

    function OrgSelectP(o, $txt)  { selOrgP = o;
        if ( o ) { $txt.val("(" + o.code + ") " + o.name);
            iasufr.enableAskBeforClose(t);
            //if (form.getItemValue("RRpl")=="")
            form.setItemValue("RRpl", o.account);
        }
        else form.setItemValue("RRpl", "");
        TitleWrite(); TitleWriteRR();
    }
    function PersSelectK(o, $txt)  { //selOrgK = o;
        if ( o ) { $txt.val("(" + o.code + ") " + o.name);
            iasufr.enableAskBeforClose(t);
        }
    }

    function PersSelectP(o, $txt)  { //selOrgK = o;
        if ( o ) { $txt.val("(" + o.code + ") " + o.name);
            iasufr.enableAskBeforClose(t);
        }
    }

    function OrgSelectR(o, $txt)  {  if ( o ) {
        iasufr.enableAskBeforClose(t);
        form.setItemValue("RRosn", o.account);  TitleWriteRR(); }
    }
    function OrgSelectRRkor(o, $txt)  { var p=""; if ( o )   p = o.account;
        form.setItemValue("RRkor", p);
        iasufr.enableAskBeforClose(t);
        TitleWriteRR();
    }

    function OrgSelectRRpl(o, $txt)  {  var p=""; if ( o )   p = o.account;
        form.setItemValue("RRpl", p);
        iasufr.enableAskBeforClose(t);
        TitleWriteRR();
    }
    function GrpSelect(o, $txt)   { selGrp = o;     $txt.val(o.name);   iasufr.enableAskBeforClose(t); }
    function KoshtSelect(o, $txt) { selKosht = o;   $txt.val(o.name);   iasufr.enableAskBeforClose(t);}

    function TitleWrite() {
        var data  = [selOrgK,selOrgP];
        var data1 = ['idOrgK','idOrgP'];
        var title;
        for (var a in data1) {
            title="";  if (data[a]) title=data[a].name;
            $(form.getInput(data1[a])).attr('title',title);
        }
		
		$(form.getInput('idOrgOsn')).attr('title',form.getItemValue('idOrgOsn'));
    }
    function TitleWriteRR() {
        var data  = ['RRosnBank','RRkorBank','RRplBank'];
        var data1 = ['RRosn','RRkor','RRpl'];
        var title;
        for (var a in data1) {
            title=form.getItemValue(data[a]);
            $(form.getInput(data1[a])).attr('title',title);
        }
    }
    //-------------таблицы во вкладках - финансы
    function InitTABtable(p) {
        // ---- финансы
        var grid;
        if (p=='OR') grid = tbb.cells("a1").attachGrid();
        else         grid = tbc.cells("a1").attachGrid();

        var hdr="Сума, Дата поч., Дата закiнч, Коментар";
        var wid="100,80,80,*";
        var typ="ed,dhxCalendarA,dhxCalendarA,ed";
        var align="center,center,center,left";
        GridInit(grid,hdr,wid,align,typ);
        iasufr.gridRowFocusApply(grid);
        return grid
    }
    //-------------таблицы во вкладках - послуги
    function InitTABtable1(p) {
        var grid;
        if (p=='OR') grid = tbb.cells("a2").attachGrid();
        else         grid = tbc.cells("a2").attachGrid();

        var hdr=" Код ДКТП,Кiльк.,Од.вимiру,N акту,За скiльки,Дата поч., Дата закiнч,Сума,Дата стану,Стан акту,Коментар,Дата опл,Сума,";
        var toltip="true,true,false,false,true";
        var wid="50,30,60,70,30,70,70, 70,90,220,*,70,60,0";
        //var typ="ed,ed,ed,ed,ed,dhxCalendarA,dhxCalendarA,ed,ro,ro,ro,ro,ro,ro";
        var typ="ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro";
        var align="left,center,center,center,center,center,center, center,center,left,left,center,center,left";
        GridInit(grid,hdr,wid,align,typ,toltip,p);
        grid.enableEditTabOnly(true);
        grid.setColumnHidden(0,true); grid.setColumnHidden(1,true);grid.setColumnHidden(2,true);grid.setColumnHidden(4,true);grid.setColumnHidden(13,true);
        iasufr.gridRowFocusApply(grid);

        grid.attachEvent("onRowSelect", function (id) {
            var ind = grid.getSelectedCellIndex();
            if (ind == 9) {
                //  показать строки, в к-рых состояние акта не явл.последним:  дата начала=""
                var cnt=grid.getRowsNum();
                var idSub=grid.cells(id, 13).getValue();
                var zn=grid.cells(id, ind).getValue();
                var simv = "-&gt;"
                if (zn.indexOf(simv)!=-1) {
                  zn=iasufr.replaceAll(zn,simv,"");
                  grid.cells(id, ind).setValue(zn);
                   for ( var i = 0; i <cnt; i++) {
                         if ( (grid.cells2(i, 5).getValue() == "") && (grid.cells2(i, 13).getValue() == idSub) ) grid.setRowHidden(grid.getRowId(i),false);
                   }
                }
                else                      {
                    for ( var i = 0; i <cnt; i++) {
                        if ( (grid.cells2(i, 5).getValue() == "") && (grid.cells2(i, 13).getValue() == idSub) ) grid.setRowHidden(grid.getRowId(i),true);
                        if ( (grid.cells2(i, 5).getValue() != "") && (grid.cells2(i, 13).getValue() == idSub) ) {
                                // если есть след. строка в таблице с таким же idSub
                                if ( ((i+1)<cnt) && ( grid.cells2(i+1, 13).getValue() == idSub) )  grid.cells2(i, ind).setValue( grid.cells2(i, ind).getValue() + '' + simv);
                        }
                    }
                }

            }
        });



        return grid
    }

    //-------------таблицы во вкладках - состояние договора,переговоры
    function InitTABtableS(p) {
        var grid;
        grid = tbcL.cells(p).attachGrid();
        var hdr;
        var wid;
        var typ;
        var align;

        if (p=="a1") {
            hdr="Дата, Стан договору, Коментар,ID,Виконавець";
            wid="80,250,*,10,200";
            typ="dhxCalendarA,co,ed,ro,ro";
            align="center,left,left,left,left";
        }
        if (p=="a2") {
            hdr="Дата,Текст,П I Б - з ким розмова , Телефон, Виконавець";
            wid="80,370,180,120,*";
            typ="dhxCalendarA,ed,ed,ed,ed";
            align="center,left,left,left,left";
        }
        GridInit(grid,hdr,wid,align,typ);
        if (p=="a1") grid.setColumnHidden(3,true);
        return grid
    }

    function GridInit(grid,hdr,wid,align,typ,toltip) {
        grid.setHeader(hdr);
        grid.setInitWidths(wid);
        grid.setColAlign(align);
        grid.setColTypes(typ);
        grid.setImagePath(iasufr.const.IMG_PATH);
        grid.setIconsPath(iasufr.const.ICO_PATH);
        if (toltip!=null) grid.enableTooltips(toltip);
        grid.init();
        grid.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) { if ((stage==2)&&(nValue!=oValue)) iasufr.enableAskBeforClose(t);  return true  });

    }

    //добавить, удалить строку в таблицах во вкладках
    function AddDel(make,p,tab) {
        var grid; var aktExist=0;
        switch (tab) {
            case 'a1': {
                if (p=='b') grid = gR_F;
                if (p=='c') grid = gK_F;
                if (p=='d') grid = gS;
                break;
            }
            case 'a2':  {
                if (p=='b') { grid = gR_P; aktExist=1; }
                if (p=='c') grid = gK_P;
                if (p=='d') grid = gSP;
                break;
            }
        }
        var ind = grid.getRowIndex(grid.getSelectedId());
        if (make != 'add') { if (ind == -1) { iasufr.message('Вкажiть рядок !'); return  }     }

        if (make == 'cut') {
            if ( (aktExist) && ( (grid.cells2(ind, 3).getValue()!='')||(grid.cells2(ind, 8).getValue()!='')||(grid.cells2(ind, 10).getValue()!='')) ) { iasufr.message('Не можна видалити - акт про виконання робiт !'); return  }
            dhtmlx.confirm("Пiдтвердiть видалення !", function (result) {
                var idRow=grid.getSelectedId();
                if (result) grid.deleteRow(idRow);
                iasufr.enableAskBeforClose(t);
            });
        }
        if (((make == 'add')&&(p=='d')) ||  ((p!='d')&&(tab=='a1')) ) {
            Counter = Counter +1;
            var newid = Counter;
            var f=null; var f=['','','','','','',''];  var zn;
            //if ( p!='d') {
            //  if  (tab == 'a2')  { grid.addRow(newid, f, 0);   }           // обязат предприятия - послуги
            //  //if ( (grid.getRowId(1)) && (p!='d') ) { grid.copyRowContent(grid.getRowId(1),newid);  NewPeriod(grid,tab,p)    }
            //}

            if ( (tab == 'a1') && (p!='d') ) { grid.addRow(newid, ['','','','',''], 0);   }                 //  платежi
            if ( (tab == 'a1') && (p=='d') ) { grid.addRow(newid, ['','','',''], 0);   }                 //  состояние -  3
            if ( (tab == 'a2') && (p=='d') ) { grid.addRow(newid, ['','','','',''], 0);   }           //  переговоры - 5
            window.setTimeout(function(){ grid.selectCell(0,0,false,false,true,true); grid.editCell() }, 1);
            iasufr.enableAskBeforClose(t);
        }
            var numberAkt="";
            var num,idr;

        if ( (make == 'akt') || ((make == 'add')&&(p!='d')&&(tab=='a2')) ) {
            if ( (ind!=-1)&&(make == 'akt') ) idRow = grid.cells2(ind, 13).getValue();
            iasufr.loadForm("DogEditAkt", {idOrg: idOrg, idDog: idDog, numberAkt: numberAkt , idRow: idRow, modal:true, height:430, width:1000, onSave: Reload});  //
        }
            if ( (ind!=-1)&& ( (make == 'prn')||(make == 'acc')) )        {  var idRow=grid.cells2(ind, 13).getValue();  DocToPrint(idRow,make);     }

    }  // AddDel
    //----------------
    var period  = ['01.01','31.03','01.04','30.06','01.07','30.09','01.10','31.12'];
    var month  = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    var day    = ['31','28','31','30','31','30','31','31','30','31','30','31'];
    //-------- копирование строк в таблице - изменение периода на новых строках + формирование номера акта - ОТКЛЮЧЕНО
    function NewPeriod(grid,tab,p) {
        var c1,c2,c3,a2,kv,year,kvAkt;
        switch (tab) {
            case 'a1': {  c1=1; c2=2; c3=0;  break; }    // ФИНАНСИ
            case 'a2': {  c1=5; c2=6; c3=7;  break; }    // ПОСЛУГИ
        }
        var z1 = grid.cells2(0, c1).getValue(); var z2 = grid.cells2(0, c2).getValue();
        // период выполнения - квартал
        if ( form.getItemValue("Period")==2 ) { var z11=z1.substr(0,5);  var z22=z2.substr(0,5);
            for (var a in period) { if (period[a]==z11) { a2=a; a2++; a2++;  grid.cells2(0, c1).setValue( period[a2]+''+z1.substr(5,5) ); }
                if (period[a]==z22) { a2=a; a2++; a2++;  grid.cells2(0, c2).setValue( period[a2]+''+z2.substr(5,5) );
                    if (c3>0) {
                        var name=form.getItemValue("idOrgK");
                        var code=name.indexOf(")") - 1 ;
                        code=name.substr(1,code);
                        kv=grid.cells2(0, c2).getValue();
                        year=kv.substr(8,2);
                        kv=kv.substr(3,2); kv=parseInt(kv/3);
                        kvAkt = ''; if (kv>0) kvAkt = kv + '-' +year+ '/' +code;
                        grid.cells2(0, c3).setValue(kvAkt);
                        grid.setColumnExcellType(c3,"ed");
                    }
                }
            }
        }
        // период выполнения - МЕСЯЦ
        if ( form.getItemValue("Period")==1 ) {   var z11=z1.substr(3,2);   var z22=z2.substr(0,2);
            for (var a in month) {
                if ( (month[a]==z11)&& (a<11) ) { a2=a; a2++;
                    grid.cells2(0, c1).setValue( z1.substr(0,3) + '' + month[a2] + z1.substr(5,5) );
                    grid.cells2(0, c2).setValue( day[a2] + '.' + month[a2] + '' + z2.substr(5,5) );
                }
            }
        }
        if ( (tab == 'a2') && (p!='d') ) { for (var i = 8; i < 14; i++) { grid.cells2(0, i).setValue(""); } }
    }
    function Save() {
        //if (!form.validate()) { iasufr.message(" Перевiрте вiдмiченi строки !"); return; }
        var idOrgK="";   if (selOrgK) { idOrgK=selOrgK.id; }

        if (idOrgK=="") { iasufr.message(" Перевiрте контрагента договору !"); return; }
        if (form.getItemValue("Num")=="") { iasufr.message(" Перевiрте номер договору !"); return; }
        if (form.getItemValue("Sum")=="") { iasufr.message(" Перевiрте суму договору !"); return; }

        if (main.progressOn) main.progressOn();
        
        var idOrgP="";   if (selOrgP) { idOrgP=selOrgP.id; }
        var idGrp="";    if (selGrp)   { idGrp=selGrp.id; }
        var idKosht="";  if (selKosht) { idKosht=selKosht.id; }
        var idPersK="";   if (selPersK) { idPersK=selPersK.id; }
        var idPersP="";   if (selPersP) { idPersP=selPersP.id; }
        var date=iasufr.formatDateStr(form.getCalendar("Date").getDate(true));
        var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
        var dateK=iasufr.formatDateStr(form.getCalendar("DateK").getDate(true));
        var fAkt=0; if (form.isItemChecked('FormAkt')) fAkt=1;

        var json = {idOrg: idOrg, idDog: idDog, Num:form.getItemValue("Num"), Kom:form.getItemValue("Kom"), Val:form.getItemValue("Val") };
        json = $.extend(json, { idOrgK: idOrgK, idOrgP: idOrgP, idGrp: idGrp, idKosht: idKosht, Date:date, DateN:dateN, DateK:dateK} );
        json = $.extend(json, { RRosn: form.getItemValue("RRosn"), RRkor: form.getItemValue("RRkor"), RRpl: form.getItemValue("RRpl"), Period: form.getItemValue("Period"), Sum: form.getItemValue("Sum"), FormAkt:fAkt  } );

        // ------------------  финансы
        var f= null; f = [];
        f = GetFin(f, gR_F , "OR");
        f = GetFin(f, gK_F , "OK");
        if (f.length != 0) json = $.extend(json, {fin: f});

        // -------------------- послуги
        f= null; f = [];
        f = GetPos(f, gR_P , "OR");
        f = GetPos(f, gK_P , "OK");
        if (f.length != 0) json = $.extend(json, {usl: f});

        //------------------состояние договора
        f= null; f = [];
        var dt; var idRow; var i;
        for ( i = 0; i < gS.getRowsNum(); i++) {
            dt= gS.cells2(i, 0).getValue();   dt= GetDate(dt);
            idRow=gS.cells2(i, 3).getValue();  //gS.getRowId(i);
            if (gS.cells2(i, 0).getValue() != "") f.push({Dn: dt, Stan: gS.cells2(i, 1).getValue(),  Kom: gS.cells2(i, 2).getValue(), idRow:idRow });
        }
        if (f.length != 0) json = $.extend(json, {Stan: f});
        //-------------------------

        //------------------переговоры
        f= null; f = [];
        for ( i = 0; i < gSP.getRowsNum(); i++) {
            dt= gSP.cells2(i, 0).getValue();   dt= GetDate(dt);
            if (dt != "") f.push({Dn: dt, Text: gSP.cells2(i, 1).getValue(), Fio: gSP.cells2(i, 2).getValue(), Tel: gSP.cells2(i, 3).getValue(), idPE: gSP.getRowId(i) });
        }
        if (f.length != 0) json = $.extend(json, {Speak: f});
        //-------------------------

        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "SaveDog", json: JSON.stringify(json)},
            success: onSuccess ,
            error: function(){if (main.progressOn) main.progressOff()}
        });
    }
    function GetDate(dt) { dt=iasufr.formatDateStr(iasufr.replaceAll(dt,"/","."));  return dt }

    function GetFin(f , gr, vet) {
        var dn; var dk; var idRow;
        for (var i = 0; i < gr.getRowsNum(); i++) {
            dn=gr.cells2(i, 1).getValue(); dn= GetDate(dn);
            dk=gr.cells2(i, 2).getValue(); dk= GetDate(dk);
            idRow=gr.getRowId(i);
            if (gr.cells2(i, 0).getValue() != "") f.push( {Sum: gr.cells2(i, 0).getValue(), Dn: dn, Dk: dk, Kom: gr.cells2(i, 3).getValue(), Vet:vet, idRow:idRow} );
        }
        return f;
    }

    function GetPos(f , gr, vet) {
        var zn;
        var dn; var dk; var akt; var idRow;
        for (var i = 0; i < gr.getRowsNum(); i++) {
            dn=gr.cells2(i, 5).getValue(); dn= GetDate(dn);
            dk=gr.cells2(i, 6).getValue(); dk= GetDate(dk);
            akt=gr.cells2(i, 3).getValue();
            zn=gr.cells2(i, 0).getValue();
            idRow=gr.cells2(i, 13).getValue();  //gr.getRowId(i);
            if ( (dn!= "")||(akt!="") ) f.push({Kod: gr.cells2(i, 0).getValue(), Kol: gr.cells2(i, 1).getValue(), Ei: gr.cells2(i, 2).getValue(), Cena: gr.cells2(i, 3).getValue(), M: gr.cells2(i, 4).getValue(), Dn: dn, Dk: dk, Akt: akt, Vet:vet, idRow:idRow});
        }
        return f;
    }

    function onSuccess(data) {
        var d = JSON.parse(data);
        if (idDog==0) idDog= d.Id;
        iasufr.messageSuccess("Збережено !");
        iasufr.disableAskBeforClose(t);
        Reload();
        if (opt.onSave) opt.onSave();
    }

    function Del() {
        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "DelDog", json: JSON.stringify({idOrg: idOrg, idDog: idDog})},
            success: onDel
        });
    }

    function onDel() {
        if (opt.onSave) opt.onSave();
        iasufr.messageSuccess("Видалено !");
        t.owner.close()
    }

    function Reload() {
        selOrgK = null; selOrgK = [];
        selOrgP = null; selOrgP = [];
        selKosht = null; selKosht = [];
        selGrp = null; selGrp = [];
        selPersK = null; selPersK = {};
        selPersP = null; selPersP = {};
        form.unload(); form=null;
        gR_F.clearAll(); gK_F.clearAll();
        gR_P.clearAll(); gK_P.clearAll();
        gS.clearAll(); gSP.clearAll();
        LoadData();
        main.progressOff();
    }
    function DocToPrint(idRow,doc) {   // doc:  "akt", "acc",  "acz"(акт сверки) "dd"дод.угода
        var pu = new PrintUtils();
        var idOrgK=selOrgK.id;
        
        var d = tolb.getValue("dtZVIRKA").split(".");
        var dn=d[2]+d[1]+d[0];

        iasufr.ajax({url:'fin.Dog.cls', data: {func: "DocToPrint", json: JSON.stringify( {idOrg:idOrg, idOrgK:idOrgK, idDog:idDog, idRow:idRow, Doc:doc, dtZVIRKA: dn}) }, success: function (data) {
            var jso = JSON.parse(data); //alert(data);
            var txt =jso.txt;
            /*
            var dd = [];
            pu.parseHtml(dd, txt);
            pu.cleanUp(dd);
            pdfMake.createPdf( { content:dd }).open();
            */
            //var ww = window.open("/print.html","_blank");
            //ww.onload =//function(){this.document.body.innerHTML += txt;};
            iasufr.print( txt );
            t.owner.progressOff();

        } });
    }

    $( document ).ready(function() {
        //$("div.dhx_header_cmenu_item").on( "click", onClick1);
        //$("div.hdrcell").on( "click", onClick);
        //$("input[type='checkbox']").on( "click", onClick);
        DisableItem(tolbB); DisableItem(tolbC); DisableItem(tolbD);

    });

    function DisableItem(tlb) {
        tlb.forEachItem(function(itemId){
            var btn=itemId.substr(2,3);
            //console.log(itemId+'---'+btn+'---');
            if ( ((!admin) && (idOrg!=idOrgUser)) && ((btn=='add') || (btn=='cut') || (btn=='akt')) ){ tlb.disableItem(itemId); }
        });
    }

        return t;
};
// dogEdit.js
