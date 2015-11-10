//

if (!window.Fin) Fin = {};
if (!Fin.OrgDoc) Fin.OrgDoc = {};

Fin.OrgDoc.Create = function (opt) {
    var t = iasufr.initForm(this, opt);

    var user=iasufr.user;
    var toolbar;
    var gD;
    t.owner.progressOn();

    var expand=1;
    var FlagName=0;
    var FlagDrop=0;
    var CountRow=1000;


    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells('a').hideHeader();
    toolbar = main.attachToolbar();   InitToolBar();

    gD = main.cells('a').attachGrid();
    gD.setImagePath(iasufr.const.IMG_PATH);
    gD.setHeader("N,Дата висновку,Номер, Найменування установи,ЄДРПОУ,Реєстр. номер,П І Б,Призначення,Погодження звільнення,Відмова призначення,Відмова звільнення,Nсправи");
    gD.setInitWidths('30,80,60,300,70,50,170,250,250,250,250,50');
    gD.setColAlign('center,center,left,left,center,center,left,left,left,left,left,left');
    gD.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    gD.setColSorting('int,str,str,str,str,str,str,str,str,str,str,str');
    gD.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
    gD.init();
    iasufr.enableRowselectMode(gD);

    if (opt.select) { gD.attachEvent("onRowSelect", function (id) {
        var name = gD.cells(gD.getSelectedId(), 0).getValue();
        //alert(id+'-'+name+'-'+selOrg.id);
        opt.onSelect({id:id, name:name, idOrg:selOrg.id});
        iasufr.close(t)
    });
    }

    //iasufr.enableRowselectMode(gD);

    LoadData();
   
    function LoadData() { gD.clearAll();
         iasufr.ajax({url:'fin.Org.cls', data: {func: "GetOrgDoc", json: JSON.stringify( {idOrg:""}) }, success: function (data) {
         var jso = JSON.parse(data); //alert(data); 
         gD.parse(jso, 'json');
         t.owner.progressOff();
         }
         });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("print", 2, iasufr.lang.ui.print, "32/printer_empty.png", "");
        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idStan=GetId();
            iasufr.gridRowFocus(gD, idStan);
            if (id == 'print')  {   gD.printView();  }
            if (id == 'reload') {  Reload();  }
            if (id == 'close') { iasufr.close(t); }
        }); // onClick
    }


    function GetId() { return gD.getRowId(gD.getRowIndex(gD.getSelectedId())); }

    function Reload() { t.owner.progressOn(); gD.clearAll();
                        FlagName=0;
                        LoadData(); }


    return t;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/orgDoc.js