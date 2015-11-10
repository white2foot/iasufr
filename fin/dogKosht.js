if (!window.Fin) Fin = {};
if (!Fin.DogKosht) Fin.DogKosht = {};

Fin.DogKosht.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var user=iasufr.user;
    var toolbar;
    var gK;
    t.owner.progressOn();

    var expand=1;
    var pHeader = 0;


    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells('a').hideHeader();

    if (!opt.select )  { toolbar = main.attachToolbar();   InitToolBar(); }  // нет входа извне

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

    //для выбора извне
    if (opt.select) { gK.attachEvent("onRowSelect", function (id) {
            //gK.getSelectedId()
            var idRow=id; if (gK.getParentId(id)) idRow=gK.getParentId(id);
            var name = gK.cells(idRow, 0).getValue();
            var num = gK.cells(idRow, 1).getValue();
            if (num) name='(' + num+') '+name;
            opt.onSelect({id:idRow, name:name});
            iasufr.close(t)
        });
    }
 
    gK.setImagePath(iasufr.const.IMG_PATH);
    gK.setHeader('Найменування кошторису,Номер,Сума статтi,Формула,Кекв, Дата закриття');
    gK.setInitWidths('400,60,80,130,300,*');
    gK.setColAlign('left,center,right,center,left,left');
    gK.setColTypes("tree,ro,ro,ro,ro,ro");
    gK.setColSorting('str,str,str,str,str,str');
    gK.enableTreeCellEdit(false);
    
    gK.init();
    iasufr.enableRowselectMode(gK);
    LoadData();

    function LoadData() { gK.clearAll(); 
         iasufr.ajax({url:'fin.Dog.cls', data: {func: "DogGetKosht", json: JSON.stringify( {idOrg:selOrg.id}) }, success: function (data) {
         var jso = JSON.parse(data); //alert(data); 
         gK.parse(jso, 'json');
         if (!opt.select) gK.expandAll();
         iasufr.gridRowFocusApply(gK);
         // -------------------------------------------
         if ((gK.getRowsNum() > 0) && (pHeader == 0)) {
                    gK.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
                    pHeader = 1;
               }
               if  (gK.getRowsNum() == 0) {
                    gK.detachHeader(1);
                    pHeader = 0;
               }
                gK.setSizes();
                if (pHeader==1) $(gK.getFilterElement(1)).focus();
         //-----------------------------------------------


         for (var i = 0; i < gK.getRowsNum(); i++) {  var idr=gK.getRowId(i); 
                             var sub=gK.getSubItems(idr); 
                             var prnt=gK.getParentId(idr);
                             if  ((prnt==0) && (sub!=''))   gK.setRowTextStyle(idr, "font-weight: bold;"); 
                             if  (sub!='')   gK.setItemImage(gK.getRowId(i), iasufr.const.ICO_PATH + "16/book.png");                                      
                                                   }

         //iasufr.gridRowFocusApply(gK);
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
      
        toolbar.addButton("grup", 5, "Згорнути / Розгорнути", "32/group_stroke.png", "");
        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idKosht=GetKoshtId(); 
            iasufr.gridRowFocus(gK, idKosht);
         
            if ((id == 'edit')||(id == 'add')) { if ( (!idKosht)&&(id=='edit') ) { iasufr.message('Вкажiть строку !'); return; }
                    if (id == 'add') idKosht=0;
                    iasufr.gridRowFocus(gK, idKosht); 
                    iasufr.loadForm("DogKoshtEdit", {idKosht:idKosht,idOrg:selOrg.id, modal:true, height:600, onSave: Reload});
                                               }
            

           if (id == 'del') { if  (!idKosht) { iasufr.message('Вкажiть строку !'); return; }
                              if (gK.getSubItems(idKosht)!='') { iasufr.message('Неможливо видалити - e статтi !'); return; }                            

                              iasufr.confirm(iasufr.lang.msg.delete, DelKosht);
                            }


            if (id == 'grup')  { if (expand==1) { gK.collapseAll(); expand=0; return }
                                  if (expand==0) { gK.expandAll(); expand=1; return }
                                }
            if (id == 'print')  {   gK.printView();  }
            if (id == 'reload') {  Reload();  }
            if (id == 'close')  { iasufr.close(t); }



        }); // onClick
    }


    function GetKoshtId() { return gK.getRowId(gK.getRowIndex(gK.getSelectedId()));}

    function Reload() { t.owner.progressOn(); gK.clearAll(); 
                        LoadData(); }

    function DelKosht() { var idKosht=GetKoshtId();
                iasufr.ajax( {url:'fin.Dog.cls', 
                data:{ func: "DogKoshtDel", json: JSON.stringify( {idOrg: selOrg.id, idKosht:idKosht } )}, 
                success: function(d) { iasufr.messageSuccess("Видалено !");  Reload();  },
                error: function() { if (main.progressOn) main.progressOff() }
                            });
     }

    


    return t;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/dogKosht.js