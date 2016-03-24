if (!window.Fin) Fin = {};
if (!Fin.DogPrice) Fin.DogPrice = {};

Fin.DogPrice.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var user=iasufr.user;
    var toolbar;
    var gK;
    t.owner.progressOn();

    var expand=1;
    var pHeader = 0;


    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells('a').hideHeader();

    if (!opt.select )  { toolbar = main.attachToolbar();   InitToolBar(); }

    var tbOrg =main.cells('a').attachToolbar();
    tbOrg.setIconsPath(iasufr.const.ICO_PATH);
    tbOrg.addText("OrgT", 1, "Органiзацiя ");
    tbOrg.addInput("Org", 2, "",350);

    if (!opt.select )  if (iasufr.pGrp(1))  iasufr.attachSelector(tbOrg.getInput("Org"), "OrgSelector",  { onSelect: OrgSelect});
    function OrgSelect(o, $txt)   { selOrg = o;
        if (o) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
        if (selOrg==null) { selOrg={}; selOrg.id=0; }
        LoadData(); }


    //----------------------------------------
    var selOrg = {}; var orgName="";
    if (!t.opt.idOrg ) {
        selOrg.id=user.orgId;
        var orgName=user.orgName;
        var code=user.orgCode;
        if (code) orgName="("+code+")" + orgName;
    }
    else { selOrg.id=t.opt.idOrg;  orgName=t.opt.orgName;    }
    $(tbOrg.getInput("Org")).val(orgName);

    //-------------------------------------------------------------

    gK = main.cells('a').attachGrid();

    if (opt.select) { gK.attachEvent("onRowSelect", function (id) {
            //gK.getSelectedId()
            var idRow=id;
            var name = gK.cells(idRow, 0).getValue();
            //var num = gK.cells(idRow, 1).getValue();
            //alert(id+'---'+name);
            opt.onSelect({id:idRow, code:idRow, name:name});
            iasufr.close(t)
        });
    }
 
    gK.setImagePath(iasufr.const.IMG_PATH);
    gK.setHeader('Назва прейскуранту,Факультет,Спеціальність,Громадянство,Валюта,Форма навчання,Освітньо-кв.рівень,Закр.прейск.,Правила оплати'); //,#cspan,#cspan,#cspan');
    //gK.attachHeader("#rspan,#rspan,#rspan,#rspan,#rspan,#rspan,#rspan,#rspan,рiк,початок,кiнець, сума");
    gK.setInitWidths('250,250,150,70,50,130,130,80,*'); //,80,80,80');
    gK.setColAlign('left,left,left,left,left,left,left,left,left'); //,center,center,center');
    gK.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro"); //,dhxCalendarA,dhxCalendarA,ro");
    gK.setColSorting('str,str,str,str,str,str,str,str,str'); //,str,str,str');
    gK.enableTreeCellEdit(false);
    gK.init();

    iasufr.enableRowselectMode(gK);
    LoadData();

    function LoadData() {
         gK.clearAll();
         iasufr.ajax({url:'fin.Pers.cls', data: {func: "PriceGet", json: JSON.stringify( {idOrg:selOrg.id}) },
           success: function (data) {
               var jso = JSON.parse(data);
               gK.parse(jso.table, 'json');
               gK.sortRows(1);
               iasufr.gridRowFocusApply(gK);
               // -------------------------------------------
               
               if ((gK.getRowsNum() > 0) && (pHeader == 0)) {
                    gK.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter"); //,#text_filter,#text_filter,#text_filter");
                    pHeader = 1;
               }
               if  (gK.getRowsNum() == 0) {
                    gK.detachHeader(1);
                    pHeader = 0;
               }
                gK.setSizes();
                if (pHeader==1) $(gK.getFilterElement(1)).focus();

               t.owner.progressOff();
           }
         });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("print", 2, "Друк", "32/printer_empty.png", "");
        toolbar.addButton("add", 3,iasufr.lang.ui.add, "32/toolbar_add.png", "");
        toolbar.addButton("edit", 4, iasufr.lang.ui.edit, "32/toolbar_edit.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");

        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idPrice=GetId();
            iasufr.gridRowFocus(gK, idPrice);
         
            if ((id == 'edit')||(id == 'add')) { if ( (!idPrice)&&(id=='edit') ) { iasufr.message('Вкажiть строку !'); return; }
                    if (id == 'add') idPrice=0;
                    iasufr.gridRowFocus(gK, idPrice);
                    iasufr.loadForm("PriceEdit", {idOrg:selOrg.id, idPrice:idPrice, onSave: Reload});
                                               }
            

           if (id == 'del') { if  (!idPrice) { iasufr.message('Вкажiть строку !'); return; }
                                               iasufr.confirm(iasufr.lang.msg.delete, DelPrice);
                            }


            if (id == 'grup')  { if (expand==1) { gK.collapseAll(); expand=0; return }
                                  if (expand==0) { gK.expandAll(); expand=1; return }
                                }
            if (id == 'print')  {   gK.printView();  }
            if (id == 'reload') {  Reload();  }
            if (id == 'close')  { iasufr.close(t); }



        }); // onClick
    }


    function GetId() { return gK.getRowId(gK.getRowIndex(gK.getSelectedId()));}

    function Reload() { t.owner.progressOn();
                        gK.clearAll();
                        LoadData(); }

    function DelPrice() {
                var idPrice=GetId();

                iasufr.ajax( {url:'fin.Pers.cls',
                data:{ func: "PriceDel", json: JSON.stringify( {idOrg: selOrg.id, idPrice:idPrice } )},
                success: function(d) { iasufr.messageSuccess("Видалено !");  Reload();  },
                error: function() { if (main.progressOn) main.progressOff() }
                            });
     }

    return t;
};
