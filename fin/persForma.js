
if (!window.Fin) Fin = {};
if (!Fin.PersForm) Fin.PersForm = {};

Fin.PersForm.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    //t.owner.button("park").disable();
    var idOrg=opt.idOrg;
    var orgName="";  if (opt.orgName) orgName=opt.orgName;
    var idDog=opt.idDog;
    var idPers=opt.idPers;
    
    var user=iasufr.user;
    var idOrgUser=user.orgId;
    var dost=iasufr.pFunc("dogEdit");
    var admin=iasufr.pGrp(1);
    var selCity = null;    selCity={};
    var selState = null;   selState={};
    var tb;
    var grid;
    var editTR=0;
    var tlb;
    var ButEditTR;
    var selOrg=null;  selOrg={};

    var hh=$( document ).height()-80;
    hh=parseInt(hh/4);
    dhtmlx.image_path = iasufr.const.IMG_PATH;
    //iasufr.formatDate(new Date()));

    var main = new dhtmlXLayoutObject(t.owner, '2U');
    main.cells('a').setWidth('530');
    //main.cells('b').setHeight(hh*2);  // 160
    main.cells("b").hideHeader();

    var c = main.cells('a');
    var mainL = c.attachLayout('3U');
    mainL.cells("a").hideHeader();
    mainL.cells("b").hideHeader();
    mainL.cells("c").hideHeader();

    mainL.cells('a').setHeight(180);
    mainL.cells('a').setWidth('150');
   //mainL.cells('a').setHeight(hh);  // 160

    var d = new Date();    d = d.valueOf();
    var idDiv='objDiv' + d;
    mainL.cells("a").attachHTMLString('<div id='+idDiv+'></div>');

    var zag="Нова анкета"; if ( idPers>0 ) zag="Реєстрац. N " + idPers;
    t.owner.setText(zag);
    main.progressOn();
    InitToolBar();
    InitTAB();
    LoadData();

    var form;
    var form1;
    var Counter = 1000;
    var imgHELP = 'btn-select.png';
    var selOrgK = null;
    var selOrgP = null;
    var selKosht = null;
    var selGrp = null;



    function InitToolBar() {
        var toolbar = main.attachToolbar();
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        //toolbar.addButton("print", 2,iasufr.lang.ui.print , "32/printer_empty.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("rel", 11, "Оновити", "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            if (id == 'save')  { Save()   }
            if (id == 'del')   { iasufr.confirm("Пiдтвердiть видалення анкетu  ", Del);   }
            if (id == 'rel')   { Reload();}
            if (id == 'close') iasufr.close(t);
        });
    }

    //-------------------------------------------


    function InitTAB() {
        tb = main.cells("b").attachTabbar();
        //else tb = mainL.cells('a').attachTabbar();

        tb.setImagePath(iasufr.const.IMG_PATH);
        tb.setMargin("2");
        var wid='200px';
        var offs='180'; //if (cellsName=='b') offs='350';
        tb.setOffset(offs);
        tb.addTab("a1", "Студенти та абiтурiєнти", wid);
        tb.addTab("a2", "Iнше", wid);
        tb.setTabActive("a1");
        //tb.disableTab("a3");
        tb.enableAutoReSize();
        tb.attachEvent("onSelect", function(id, lastId){   // if (id!='a2') { tlb.hideItem(akt); tlb.hideItem(prn); tlb.hideItem(acc); }
                                                            // else         { tlb.showItem(akt); tlb.showItem(prn); tlb.showItem(acc); }
            return true
        });
        //----------------------
        var d = new Date();    d = d.valueOf();
        var idDiv = 'info' + d;  // + cellsName;
        $("<div id="+idDiv+"><div>").insertBefore($(tb._tabs["a1"]));

        tlb = new dhtmlXToolbarObject(idDiv);

        tlb.setIconsPath(iasufr.const.ICO_PATH);
        tlb.setIconSize(16);
        var add='add' + d;
        var edit='edit' + d;
        var rel='rel' + d;
        ButEditTR=edit;
                //if (iasufr.pFunc("dogEdit")) {
            tlb.addButton(add, 2, iasufr.lang.ui.add, "16/plus.png", "");
            tlb.addButton(edit, 4, iasufr.lang.ui.edit, "16/page_white_edit.png", "");
            //tlb.addButton(rel, 5, "Оновити", "16/arrow_rotate_anticlockwise.png", "");

        tlb.attachEvent("onClick", function (id) {
            var p=id.substr(0,3);  var cell=-1;      // 'add', 'cut'

            if ((grid.getSelectedCellIndex()<1)&&(p=='edi')) { cell=1; }  // iasufr.message('Вкажiть дату для редагування змiсту стовбчика!'); return }

            if ((cell==-1)&&(p=='edi')) cell=grid.getSelectedCellIndex();
            if (p=='add')  var idRow=0;
            else var idRow=grid.cells2(0, cell).getValue();

            iasufr.loadForm("PersTRedit", {onSave: LoadDataTR, idPers:idPers, idRow:idRow});
           // alert(idRow);
           // editTR=1; LoadDataTR(1,idRow);
            //tlb.disableItem(add); tlb.disableItem(edit);
        });
    }  // InitTAB


    function LoadData() {
        iasufr.ajax({
            url: "fin.Pers.cls",
            data: {func: "AnketaGet", json: JSON.stringify({idPers: idPers})},
            error: function() {if (main.progressOn) main.progressOff(); },
            success: AddForm
        });
        LoadDataTR();
    }
    function LoadDataTR() {
        iasufr.ajax({
            url: "fin.Pers.cls",
            data: {func: "AnketaTRGet", json: JSON.stringify({idPers: idPers})},
            error: function() {if (main.progressOn) main.progressOff(); },
            success: AddTR
        });
    }

    function AddForm(d) {
       var jso=JSON.parse(d);
        form = mainL.cells("b").attachForm(jso.form);
        form1 = mainL.cells("c").attachForm(jso.form1);
        var age = jso.Age;

        var f='images/foto/'+idPers+'.jpg';
        var img="<img src="+f+" height=150 width=150><br>Вiк: "+age;

        window.setTimeout(function(){ $('#'+idDiv).prepend(img);}, 3);

        form1.setNote("CitySpr", { text:"тут можна ввести iнформацiю тiльки iз довiдника", width:300 });
        form1.setNote("CityTxt", { text:"тут можна ввести мiсце народження текстом", width:300 });
        $(form.getInput("Fio")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Name")).focus()  });
        $(form.getInput("Name")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Otch")).focus()  });
          var arr  = ['Fio',  'Name' , 'Otch']; var name;
        for (var a in arr)  {   name=arr[a];
		    //$(form.getInput(name)).css('font-size','12px');
		    $(form.getInput(name)).css('font-weight','bold');
        }
        var arr  = ['Docum', 'Live',  'LiveR' , 'LiveA']; var name;
        for (var a in arr)  {   name=arr[a];
                                $(form1.getInput(name)).attr('title',form1.getItemValue(name));
        }
        iasufr.attachSelector(form.getInput("State"), "CityState", {onSelect: StateSelect});  //, selectMulti:true});
        //$(form1.getInput("CitySpr")).css('background-color','#ebebeb');
        //$(form.getInput("Age")).css('border-top','none').css('border-left','none').css('border-right','none');
        //$(form1.getInput("State")).css('border-top','none').css('border-left','none').css('border-right','none');
        iasufr.attachSelector(form1.getInput("CitySpr"), "CitySelector", {onSelect: CitySelect});

        form.attachEvent("onFocus", function(name){
        });
        form1.attachEvent("onFocus", function(name){
            if (idPers==0 ) { iasufr.message(" Спочатку виконайте 'Зберегти' анкету !"); return; }
            if (name.substr(0,3)=="Liv") { iasufr.loadForm("PersLiveEdit", {onSave: Reload, idPers:idPers, Live:name});
                                           $(form1.getInput(name)).blur();  }
            if (name.substr(0,3)=="Con") { iasufr.loadForm("PersContEdit", {onSave: Reload, idPers:idPers});
                                           $(form1.getInput(name)).blur();  }
            if (name.substr(0,3)=="Doc") { iasufr.loadForm("PersDocumEdit", {onSave: Reload, idPers:idPers});
                                           $(form1.getInput(name)).blur();  }
            return true
        });

        selCity=null;          selState=null;
        selCity={};            selState={};
        selCity.id=jso.selCity; selState.id=jso.selState;
        if (form.getItemValue("Fio")=="") $(form.getInput('Fio')).focus();
    }  // AddForm

    function AddTR(d) {
        var jso   = JSON.parse(d);
        var edit=jso.edit;
        var cntTR=jso.cntTR;

        if (cntTR==0) tlb.disableItem(ButEditTR);

        var hdr=jso.hdr;
         var wid=jso.wid;
        var typ=jso.typ;
        var align=jso.align;
        InitTABtable(hdr,wid,typ,align,edit);
        grid.clearAll();

        var table=jso.table;
        grid.parse(table,'json');
        var cnt = grid.getRowsNum(); var i;
        var cells=grid.getColumnsNum();
        if (cnt>0) { for (i = 0; i < cnt; i++) {
                //if (!pGrup) { gD.cells2(i, 0).setValue("<a href='#'>"+gD.cells2(i, 0).getValue()+"</a>");
                $(grid.cells2(i, 0).cell).css("font-weight","bold"); //'background-color','#ebebeb');
                 if (i==0) { for (var is = 1; is < cells; is++) { $(grid.cells2(i, is).cell).css("font-weight","bold"); } }
                                               }
        }
        if (cnt>0) { for (i = 0; i < cnt; i++) {
                 $(grid.cells2(i, 0).cell).css("font-weight","bold"); //'background-color','#ebebeb');
                                               }
        }
        //if (edit==1) { grid.selectRow(0);   grid.selectCell(0,1); grid.editCell(); }
        main.progressOff();
    }

    function CitySelect(o, $txt)  { selCity = o;   $txt.val(o.name); iasufr.enableAskBeforClose(t); }
    function StateSelect(o, $txt)  { selState.id= o[0];   $txt.val(o[1]); iasufr.enableAskBeforClose(t); }
    //-------------таблицы во вкладках - трудова дiяльнiсть
    function InitTABtable(hdr,wid,typ,align,edit) {
        grid = tb.cells("a1").attachGrid();
        grid.setHeader(hdr);
        grid.setInitWidths(wid);
        grid.setColAlign(align);
        grid.setColTypes(typ);
        grid.setImagePath(iasufr.const.IMG_PATH);
        grid.setIconsPath(iasufr.const.ICO_PATH);
        //grid.setColumnHidden(1,true);  // id
        grid.enableEditTabOnly(true);
        grid.enableTooltips("false,true,false");
        grid.init();
        grid.splitAt(1);

        grid.attachEvent("onRowSelect", function (id) {
            var ind = grid.getSelectedCellIndex();
            //if (ind==2) {
            //    iasufr.loadForm("OrgSelector", { onSelect: function(o) { selOrg = o; grid.cells(id, 1).setValue("(" + o.code + ") " + o.name);} });
            //    return
            //}
            //grid.editCell();
            })
        grid.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
            //var edit=0; if (stage==2) { $(grid.cells2(rId, cInd).cell).keydown(function(e){if (e.keyCode == 13)  {alert(555); edit=1 }  });  }
            //if ((stage==2)) {  var r = rId;  //+1;
             //                  grid.selectRow(r); grid.selectCell(r,cInd);
            //}

            return true
        });
    }


    function Save() {
        if (!form.validate() ) { iasufr.message(" Перевiрте вiдмiченi строки !"); return; }
        if (form.getItemValue("Pol")==0 ) { iasufr.message(" Перевiрте стать !"); return; }
        main.progressOn();

        var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
        //var fAkt=0; if (form.isItemChecked('FormAkt')) fAkt=1;
        var state="";   if (selState) { state=selState.id; }
        var city="";    if (selCity)  { city =selCity.id; }

        var json = {idPers: idPers, DateN: dateN, Fio:form.getItemValue("Fio"), Name:form.getItemValue("Name"), Otch:form.getItemValue("Otch") };
        json = $.extend(json, { Pol: form.getItemValue("Pol"), INN:form.getItemValue("INN"), State:state, CitySpr:city, CityTxt:form1.getItemValue("CityTxt")} );

        //alert(JSON.stringify(json));
        iasufr.ajax({
            url: "fin.Pers.cls",
            data: {func: "AnketaSave", json: JSON.stringify(json)},
            success: onSuccess ,
            error: function(){if (main.progressOn) main.progressOff()}
        });
    }

    function onSuccess(data) {
        var d = JSON.parse(data);
        if (idPers==0) idPers= d.Id;
        iasufr.messageSuccess("Збережено !");
        iasufr.disableAskBeforClose(t);
        Reload();
        if (opt.onSave) opt.onSave();
    }

    function Del() {
        iasufr.ajax({
            url: "fin.Pers.cls",
            data: {func: "AnketaDel", json: JSON.stringify({idPers: idPers})},
            success: onDel
        });
    }

    function onDel() {
        if (opt.onSave) opt.onSave();
        iasufr.messageSuccess("Видалено !");
        t.owner.close()
    }

    function Reload() {
        main.progressOn();
        form.unload(); form=null;
        form1.unload(); form1=null;
        LoadData();
        main.progressOff();
    }


        return t;
};

