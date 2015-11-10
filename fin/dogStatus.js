if (!window.Fin) Fin = {};
if (!Fin.DogStatus) Fin.DogStatus = {};

Fin.DogStatus.Create = function (opt) {
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

    if (!opt.select )  { toolbar = main.attachToolbar();   InitToolBar(); }

    var tbOrg =main.cells('a').attachToolbar();
    tbOrg.setIconsPath(iasufr.const.ICO_PATH);
    tbOrg.addText("OrgT", 1, "Органiзацiя ");
    tbOrg.addInput("Org", 2, "",350);

    if (( !opt.select )&&( iasufr.pGrp(1) )) iasufr.attachSelector(tbOrg.getInput("Org"), "OrgSelector",  { onSelect: OrgSelect});
    function OrgSelect(o, $txt)   { selOrg = o;
        if (o) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
        if (selOrg==null) { selOrg={}; selOrg.id=0; }
        LoadData(); }

    //----------------------------------------
    var selOrg = {}; selOrg.id=user.orgId;
    var orgName=user.orgName; 
    var code=user.orgCode;  
    if (code) orgName="("+code+")" + orgName;
    $(tbOrg.getInput("Org")).val(orgName);
    //-------------------------------------------------------------

    gD = main.cells('a').attachGrid();
    gD.setImagePath(iasufr.const.IMG_PATH);
    gD.setHeader('Код, Стани договорiв та актiв, Прiоритет,Формується iз друку договору');
    gD.setInitWidths('80,300,80,100');
    gD.setColAlign('center,left,center,center');
    gD.setColTypes("ro,ed,ed,ch");
    gD.setColSorting('int,str,int,str');
    gD.attachHeader("#text_filter,#text_filter,#text_filter,#rspan");
    gD.init();


    if (opt.select) { gD.attachEvent("onRowSelect", function (id) {
        var name = gD.cells(gD.getSelectedId(), 0).getValue();
        opt.onSelect({id:id, name:name, idOrg:selOrg.id});
        iasufr.close(t)
    });
    }

    var nameGrp = null; nameGrp = [];
    gD.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
                     //if ( (stage==2) && (nValue!=oValue) )  {
                     if  ( (stage==2) || (cInd==3) )   { 
                         nameGrp.push( {idRow: rId, name: gD.cells(rId, 1).getValue(), prior: gD.cells(rId, 2).getValue(), print: gD.cells(rId, 3).getValue() } ); FlagName=1;
                     }
     return true
     });

    LoadData();
   
    function LoadData() { gD.clearAll();
         iasufr.ajax({url:'fin.Dog.cls', data: {func: "DogGetStan", json: JSON.stringify( {idOrg:selOrg.id}) }, success: function (data) {
         var jso = JSON.parse(data); //alert(data); 
         gD.parse(jso, 'json');
         gD.sortRows(2);  //,"str","des"); // (asc,des)
         t.owner.progressOff();
         }
         });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("print", 2, iasufr.lang.ui.print, "32/printer_empty.png", "");
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", ""); 
        toolbar.addButton("add", 3,iasufr.lang.ui.add, "32/toolbar_add.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");

        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idStan=GetId();
            iasufr.gridRowFocus(gD, idStan);
            if (id == 'save')  {   Save();  }
            if (id == 'add') {
                CountRow = CountRow +1;  var idn = CountRow; 
                var prnt=0; var ind=0;
                var name='Новий стан договору';
                gD.addRow(idn, ['' , name], ind);
                gD.setRowTextStyle(idn, "color: red;"); 
                nameGrp.push( {idRow: idn, name: name} ); FlagName=1;
            }

           if (id == 'del') { if  (!idStan) { iasufr.message('Вкажiть строку !'); return; }
                              if ( FlagName ) { iasufr.message('Спочатку збережiть змiни або виконайте "Оновити" !'); return; }

                              iasufr.confirm(iasufr.lang.msg.delete, DelStan);
           }
            if (id == 'print')  {   gD.printView();  }
            if (id == 'reload')  {  Reload(); }

        
            if (id == 'close') {
                         if ( FlagName ) {
                                            dhtmlx.confirm("Записати змiни ?", function(result) {
                                                           if (result) Save();
                                                           else iasufr.close(t);
                                                                        } ); 
                                                            
                         }
                         if ( !FlagName )  iasufr.close(t);
            }



        }); // onClick
    }


    function GetId() { return gD.getRowId(gD.getRowIndex(gD.getSelectedId())); }

    function Reload() { t.owner.progressOn(); gD.clearAll();
                        FlagName=0;
                        nameGrp = null; nameGrp = []; 
                        LoadData(); }

    function DelStan() { var idStan=GetId();
                iasufr.ajax( {url:'fin.Dog.cls', 
                data:{ func: "DogStatusDel", json: JSON.stringify( {idOrg: selOrg.id, idStan:idStan } )},
                success: function(d) { iasufr.messageSuccess("Видалено !");  Reload();  },
                error: function() { if (main.progressOn) main.progressOff() }
                            });
     }

    
    function Save() {
        var json={idOrg: selOrg.id, Name: nameGrp };

        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "DogStatusSave", json: JSON.stringify(json)},
            success: function() { t.owner.progressOff();  iasufr.messageSuccess("Збережено !");
                                  nameGrp = null; nameGrp = []; 
                                  Reload(); },
            error: function(){if (t.owner.progressOn) t.owner.progressOff()}
        });
    }


    return t;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/dogGrp.js