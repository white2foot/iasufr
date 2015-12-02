if (!window.Fin) Fin = {};
if (!Fin.HomeStart1) Fin.HomeStart1 = {};

Fin.HomeStart1.Create = function (opt) {


      // 1111111111
    if (iasufr.pGrp(1)) ask="Питання та заявки на реєстрацiю користувача";
    tb.addTab("a1", "Новини", '150px');
    tb.addTab("a2", "Контакти",  '150px');
    tb.addTab("a3", ask, '300px');
    //tb.addTab("a4", "Вiдгуки", wid);
    tb.addTab("a5", "Типові (поширені) запитання", wid);


    var t=iasufr.initForm(this, opt);
    var user=iasufr.user;
    var toolbar;
    t.owner.progressOn();
    var tb;
    var lt;
    var lt2;
    var lt3;
    var tb3;
    var tb4;
    var gD;
    var gD2;
    var gZ;
    var gC;
    var int;
    var idOrgOsn;
    var idOrgOsnN="";
    var read;

    var orgUser=user.orgId;
    var orgName=user.orgName;
    var code=user.orgCode;
    if (code) orgName="("+code+")" + orgName;
    //if (iasufr.pGrp(1))

    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells('a').hideHeader();

    initTab();
    LoadData(0);

    function initTab() {
       tb = main.cells('a').attachTabbar();
       tb.setImagePath(iasufr.const.IMG_PATH);
       tb.setMargin("2");
       var wid='200px';
       //var offs='400';
       //tb.setOffset(50);
        var ask="Вашi запитання та вiдповiдi";
        if (iasufr.pGrp(1)) ask="Запитання користувача";
       tb.addTab("a1", "Новини", wid);
        tb.addTab("a2", "Контакти",  wid);
        tb.addTab("a3", ask, wid);
        tb.addTab("a4", "Вiдгуки користувачiв", wid);

       tb.setTabActive("a1");
       //tb.disableTab("a3");
       tb.enableAutoReSize();
       //--------------------
       lt = tb.cells("a1").attachLayout("2E");
       lt.cells('a').hideHeader();
       var hh=$( document ).height()-50;
       hh=parseInt(hh/3);
       lt.cells('a').setHeight(hh*2);
       lt.cells("b").setText(orgName);
       lt.cells("b").collapse();
       //-----------------------
        lt2 = tb.cells("a2").attachLayout("2E");
        var hh=$( document ).height()-50;
        hh=parseInt(hh/2);
        lt2.cells('a').setHeight(hh);
        lt2.cells("b").setText(orgName);

        gD = lt2.cells('a').attachGrid();
        gD.setImagePath(iasufr.const.IMG_PATH);
        gD.setHeader(',,,');
        gD.setInitWidths('10,250,250,*');
        gD.setColAlign('center,left,left,left');
        gD.setColTypes("ro,ro,ro,ro");
        gD.setColSorting('int,str,str,str');
        gD.setColumnHidden(0,true);
        gD.init();

        gD2 = lt2.cells('b').attachGrid();
        gD2.setImagePath(iasufr.const.IMG_PATH);
        gD2.setHeader(',,,');
        gD2.setInitWidths('10,250,250,*');
        gD2.setColAlign('center,left,left,left');
        gD2.setColTypes("ro,ro,ro,ro");
        gD2.setColSorting('int,str,str,str');
        gD2.setColumnHidden(0,true);
        gD2.init();
       // ---------------
        //lt3 = tb.cells("a3").attachLayout("1C");
        //lt3.cells('a').hideHeader();
        tb3 =tb.cells('a3').attachToolbar();
        tb3.setIconsPath(iasufr.const.ICO_PATH);
        tb3.addButton("print", 2,iasufr.lang.ui.print , "16/printer_empty.png", "");
        if (!iasufr.pGrp(1)) tb3.addButton("add", 3, "Додати запитання", "16/toolbar_add.png", "");
        if (iasufr.pGrp(1)) tb3.addButton("edit", 3, "Вiдповiсти на запитання", "16/toolbar_add.png", "");
        //tb3.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");

        tb3.attachEvent("onClick", function (id) {
            if ((id == "edit")||(id == "add")) {
                var idRow=0; var hei=250;
                if (iasufr.pGrp(1))  {  if (gZ.getSelectedId()==null) { iasufr.message('Вкажiть строку !'); return; }
                                        var ind=gZ.getRowId(gD.getRowIndex(gZ.getSelectedId()));
                                        idRow=gZ.cells(ind,0).getValue(); hei=420;
                                        var org=gZ.cells(ind,6).getValue(); idRow=idRow+"!"+org;
                }
                iasufr.loadForm("HomeAskEdit", {onSave: Reload, width: 700, height: hei, idOrg:orgUser, idRow:idRow, home:1});
            }
            if (id == 'print')  {  gZ.printView();        }
            if (id == 'reload') {  Reload(); }
        }); // onClick

        gZ = tb.cells('a3').attachGrid();
        gZ.setImagePath(iasufr.const.IMG_PATH);
        var tt='N, Прочитано,Дата запитання, Текст запитання, Текст вiдповiдi,';
        if (!iasufr.pGrp(1)) tt = tt+"Дата вiдповiдi / Адмiн.,";
        if (iasufr.pGrp(1))  tt = tt+"Користувач,";
        gZ.setHeader(tt);
        gZ.setInitWidths('20,55,80,450,450,*,10');
        gZ.setColAlign('center,center,center,left,left,left,left');
        gZ.setColTypes("ro,ch,ro,ro,ro,ro,ro");
        gZ.setColSorting('int,str,str,str,str,str,str');

        gZ.init();
        iasufr.enableRowselectMode(gZ);
        gZ.setColumnHidden(0,true);
        gZ.setColumnHidden(6,true);   // idOrg - чьи вопросы
        if (iasufr.pGrp(1)) { gZ.setColumnHidden(1,true); gZ.setColumnHidden(4,true); }   // checkbox - убрать для админа и текст ответа(пусто)
        gZ.attachEvent("onCheck", function (rId, cInd, state) {
            if (gZ.cells(rId, 4).getValue()!=1)  Read(rId);
        });
        LoadAsk();
        //-------------------  tb3

        //------------------------
        tb4 =tb.cells('a4').attachToolbar();
        tb4.setIconsPath(iasufr.const.ICO_PATH);
        tb4.addButton("print", 2,iasufr.lang.ui.print , "16/printer_empty.png", "");
        tb4.addButton("add", 3, "Додати вiдгук", "16/toolbar_add.png", "");
        //tb4.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");

        tb4.attachEvent("onClick", function (id) {
            if ((id == "edit")||(id == "add")) {
                var idRow=0;
                var hei=250;
                iasufr.loadForm("HomeCommentEdit", {onSave: ReloadC, width: 700, height: hei, idOrg:orgUser, idRow:0});
            }
            if (id == 'print')  {  gC.printView();        }

        }); // onClick

        gC = tb.cells('a4').attachGrid();
        gC.setImagePath(iasufr.const.IMG_PATH);
        gC.setHeader('N, Дата вiдгуку, Текст вiдгуку, Користувач');
        gC.setInitWidths('20,90,800,*');
        gC.setColAlign('center,center,left,left');
        gC.setColTypes("ro,ro,ro,ro");
        gC.setColSorting('int,str,str,str');
        gC.init();
        iasufr.enableRowselectMode(gC);
        gC.setColumnHidden(0,true);
        LoadComment();
        //-------------------  tb4

        tb.attachEvent("onTabClick", function(id, lastId){
            if (id=="a3") { //clearInterval(int);
                var obj=$(tb._tabs["a3"]);
                //$(obj).stop();
                //$(obj).css("font-weight","normal");
                //$(obj).css("color","#000000");

                //setTimeout(function(){   $(obj).animate({ opacity: 0.99}, 500, function(){} );
                //    int=setInterval( function(){ $(obj).animate({ opacity: 1, opacity:"toggle"}, 500)    }
                //        , 400)
                //}, 100);

                //setTimeout( function(){ tb.tabs("a3").setText("555"); $(obj).css("font-weight","normal");
                //$(obj).css("color","#000000");
                //}, 2000)
            }
        });
    }

    //toolbar = main.attachToolbar();   InitToolBar();
    //var tbOrg =main.cells('a').attachToolbar();


    function LoadData(all) {
        iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeStartGet", json: JSON.stringify( {idOrg:orgUser }) }, success: function (data) {
           var jso = JSON.parse(data);
           var htm    = jso.htm;
           var htmOrg = jso.htmOrg;
           idOrgOsn   = jso.idOrg;
           idOrgOsnN  = jso.idOrgN;
           lt2.cells("a").setText(idOrgOsnN);

           if (htmOrg!="")  lt.cells("b").expand();

            lt.cells("a").attachHTMLString('<div id="objDiv">'+htm+'</div>');
            lt.cells("b").attachHTMLString('<div id="objDiv1">'+htmOrg+'</div>');
            //tb.cells("a1").attachHTMLString('<div id="objDiv">'+htm+'</div>');
            $("#objDiv").css("height","100%");
            $("#objDiv").css("overflow","scroll");
            $("#objDiv").css("margin-left","10px");

            $("#objDiv1").css("height","100%");
            $("#objDiv1").css("overflow","scroll");
            $("#objDiv1").css("margin-left","10px");

            LoadCont(0);
            t.owner.progressOff();
        } });
    }

    function LoadCont(edit) { gD.clearAll();
        iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeContGet", json: JSON.stringify( {idOrg:idOrgOsn, edit:edit}) },
            success: function (data) {
                var jso= JSON.parse(data);
                gD.parse(jso, 'json');

                iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeContGet", json: JSON.stringify( {idOrg:orgUser, edit:edit}) },
                    success: function (data) {
                        var jso= JSON.parse(data);
                        gD2.parse(jso, 'json');
                        if (gD2.getRowsNum()==0) lt2.cells("b").collapse();
                    }
                });

            }
        });
    }

    function Reload() { t.owner.progressOn();  LoadAsk(); t.owner.progressOff(); }
    function ReloadC() { t.owner.progressOn();  LoadComment(); t.owner.progressOff(); }

    function LoadAsk() {
        gZ.clearAll();
        iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeAskGet", json: JSON.stringify( {idOrg:orgUser, home:1}) }, success: function (data) {
            var jso = JSON.parse(data);
            gZ.parse(jso, 'json');
            gZ.enableRowsHover(true, "grid-row-hover");
            //var check = gZ.getCheckedRows(1); // 2,3... номера строк в таблице, начиная с 1
            var cnt = gZ.getRowsNum(); var i;
            read=1;                                                                    // Admin

            for (i = 0; i < cnt; i++)  {
                                             if ( (!iasufr.pGrp(1)) && (gZ.cells2(i,1).getValue()==0) && (gZ.cells2(i,4).getValue()!="") ) {
                                               read=0;
                                               gZ.setCellTextStyle(gZ.getRowId(i),4,"color:rgb(12, 213, 91);font-weight:bold");
                                             }
                if ( (iasufr.pGrp(1)) &&  (gZ.cells2(i,4).getValue()=="") ) {
                    read=0;
                    //gZ.setCellTextStyle(gZ.getRowId(i),4,"color:rgb(12, 213, 91);font-weight:bold");
                }
            }
            if (read==0) Blink();
        } });

    }
    function LoadComment() {
        gC.clearAll();
        iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeCommentGet", json: JSON.stringify( {idOrg:orgUser, home:1}) }, success: function (data) {
            var jso = JSON.parse(data);
            gC.parse(jso, 'json');
            gC.enableRowsHover(true, "grid-row-hover");
        } });

    }

    function Read(rId) {
        var zn=gZ.cells(rId, 1).getValue();
        if (zn==1) gZ.setCellTextStyle(rId,4,"color:#000000;font-weight:normal");
        if (zn==0) gZ.setCellTextStyle(rId,4,"color:rgb(12, 213, 91);font-weight:bold");
        var idRow = gZ.cells(rId, 0).getValue();
        iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeAskRead", json: JSON.stringify( {idOrg:orgUser, idRow:idRow, check:zn}) }, success: function (data) {
        } });

    }

    function Blink() {
    //var d = new Date();    d = d.valueOf();
    //var idDiv = 'info' + d;
    //$("<div id="+idDiv+" style='width:100px'>111<div>").insertAfter($(tb._tabs["a1"]));

    var obj=$(tb._tabs["a3"]);
    //$(obj).css("font-weight","bold");
    if (!iasufr.pGrp(1)) $(obj).css("color","rgb(12, 213, 91)");  // зеленый --> пользователю
    if (iasufr.pGrp(1))  $(obj).css("color","#cc0000");  // красный  --> админу
    //
    //    $(obj).hide();
    //setTimeout(function(){  $(obj).show(); int=setInterval( function(){$(obj).toggle();}, 400)
    //                         }, 100);

     $(obj).animate({  opacity: 0.25, }, 500, function() {} );
     setTimeout(function(){   $(obj).animate({ opacity: 1}, 500, function(){} );
                              int=setInterval( function(){ $(obj).animate({ opacity: 0.1, opacity:"toggle"}, 500)    }
                                  , 400)
     }, 100);




   }

    return t;
};
