// персонал  ^Pers("IP",idPers)

if (!window.Fin) Fin = {};
if (!Fin.Pers) Fin.Pers = {};

Fin.Pers.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var user=iasufr.user;
    var idOrgUser=user.orgId;
    var bodyhei=$('body').height()-100;
    dhtmlx.image_path = iasufr.const.IMG_PATH;

    var main = new dhtmlXLayoutObject(t.owner, '2U');
    main.cells("a").setWidth('200');
    main.cells("a").hideHeader();
    //main.cells("b").hideHeader();
    var mainB=main.cells('b');

    var pSelTable=0;
    var pHeader=0;
    var cntPers="Усього строк: ";
    var cntSumT="&nbsp;&nbsp;&nbsp;на суму:&nbsp;&nbsp;&nbsp;";
    var cntSumTO="&nbsp;&nbsp;&nbsp;сплачено: ";
    var form;
    var toolbar;
    var cellNumDog=0;

    var gD;
    var orgName;
    var selOrg=null;  selOrg = {};
    var selOrgK=null; selOrgK = {};
    var selOrgP=null; selOrgP = {};
    var selKosht=null;  selKosht = {};
    var selGrp=null;  selGrp = {};
    var SumI={};

    var dost=1;  //iasufr.pFunc("persAdd");
    var admin=iasufr.pGrp(1);
    //----------------------------------------
    selOrg.id=user.orgId;
    orgName=user.orgName; selOrg.name=user.orgName;
    var code=user.orgCode;
    if (code) orgName="("+code+")" + orgName;
    //-------------------------------------------------------------

    if (!opt.select ) ToolB();

    function ToolB() {
        toolbar = main.attachToolbar();
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        //if (admin) { toolbar.addButton("sms", 1, "Смс-повiдомлення", "32/webmail.png", "");
        //toolbar.setItemToolTip("sms", "Надiслати смс-повiдомлення користувачам вибраних органiзацiй");
        //}
        //toolbar.addButton("printA", 1, "Друк адрес", "32/printer_book.png", "");
        toolbar.addButton("print", 2, "Друк", "32/printer_empty.png", "");
        toolbar.addButton("new", 3, "Додати анкету", "32/toolbar_add.png", "");
        //if (iasufr.pFunc("dogEdit"))
        toolbar.addButton("edit", 3, "Редагувати анкету", "32/toolbar_edit.png", "");
        toolbar.addButton("rel", 5, "Оновити", "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 6, iasufr.lang.ui.close, "32/door.png", "");
        toolbar.addButton("save", 10,"Зберегти налаштування таблицi" , "32/database_save.png", "");

        toolbar.attachEvent("onClick", function(id){
            switch (id) {
                case "print": gD.printView(); break;
                case "save":   SaveTable(); break;
                case "new":
                    iasufr.loadForm("PersForm", {onSave: SelTable, idPers:0});
                    break;
                case "edit":
                    if (gD.getSelectedId()=='null') { iasufr.message("Вкажiть строку !"); return }
                    var ind = gD.getRowIndex(gD.getSelectedId());
                    var idPers=gD.cells2(ind, 0).getValue();

                    iasufr.gridRowFocus(gD, idPers);
                    iasufr.loadForm("PersForm", {onSave: SelTable, idPers:idPers});
                    pSelTable=0;
                    break;
                case "rel":   SelTable(); break;
                case "close":   iasufr.close(t); break;
            }
        });

        var btn=$("img[src='/images/icons/32/database_save.png']");  //.offset();
        var w=$( document ).width()-230;
        btn.parent().offset({left:w});
        //console.log(btn+'---'+w );
    }   //------------------------ ToolB()

    function InitTable(hdr,wid,typ,align,menu,ids,sort) {
        gD=main.cells('b').attachGrid();
        gD.setImagePath(iasufr.const.IMG_PATH);
        //                0        1           2          3       4         5            6           7            8         9           10        11        12         13      14      15      16          17       18     19        20
        gD.setHeader(hdr);
        gD.setInitWidths(wid);
        gD.setColAlign(align);
        gD.setColTypes(typ);
        gD.setColSorting(sort);
        gD.setColumnIds(ids);
        gD.init();
        //gD.splitAt(2);
        gD.enableHeaderMenu(menu);
        gD.attachEvent("onResizeEnd", function(obj){

        });
        if (opt.select) { gD.attachEvent("onRowSelect", function (id) {
            var name = gD.cells(id, 2).getValue();
            var inn = gD.cells(id, 3).getValue();
            var idPers = gD.cells(id, 0).getValue();
            //if (gD.getParentId(id)) { name = name + "/" + gD.cells(gD.getParentId(id), 0).getValue(); }
            opt.onSelect({code:idPers,id:idPers, name:name, inn:inn});
            iasufr.close(t);
        });
        }

        //var arr1 = ["datOpl","datIsp","sDTD","sSFK", "sPLAT" , "sGRUP", "stan", "regDog", "sSTAN","speak","koment","period"];
        //for (var a in arr1) gD.setColumnHidden(gD.getColIndexById(arr1[a]),true);


        gD.attachEvent("onFilterEnd", function(elements){  mainB.setText(cntPers+' '+gD.getRowsNum());
                                                           return true
                                                            });

    }  // InitTable()

    // фильтр слева
    var json={};
    iasufr.ajax({
        url:'fin.Pers.cls',
        data:{func:'PersFilter', json: JSON.stringify(json) },
        success: function (data) {
            var jso=JSON.parse(data);
            form = main.cells("a").attachForm(jso.form);

            form.attachEvent("onChange", function(name, value, is_checked) {
                if (name=="Grup") { SelTable(); return}
                var t;
            });
			//$(form.base[0]).find(".block_dhxform_item_label_top").css("display","inline");
			//$(form.base[0]).find(".dhxform_base_nested.in_block").css("display","inline");
			SelTable();
            mainB.setText(' ');

        }
    });  // ajax


     function GrpSelect(o, $txt)  { selGrp = o;   $txt.val(o.name);  }

    // таблица в правой части
    function SelTable() {
        //if (pSelTable) return;
        pSelTable=1;
        mainB.progressOn();
        var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
        var idOrg="";  if (selOrg) idOrg=selOrg.id;
        //var speak=0; if (form.isItemChecked('Speak')) speak=1;

        var json=$.extend( form.getFormData(), {DateN:dateN } );
        //alert(JSON.stringify(json));
        iasufr.ajax({
            url:'fin.Pers.cls',
            data:{func:'PersSel', json: JSON.stringify(json) },
            success: function (data) {
                var jso   = JSON.parse(data);
                var table = jso.table;

                var hdr=jso.hdr;
                var wid=jso.wid;
                var typ=jso.typ;
                var align=jso.align;
                var menu=jso.menu;
                var ids=jso.ids;
                var sort=jso.sort;

                InitTable(hdr,wid,typ,align,menu,ids,sort);
                pHeader=0;
                gD.clearAll();

                gD.parse(table,'json');
                mainB.setText(cntPers+' '+gD.getRowsNum());
                var dl=jso.sizes.length; var ids,wid,ind,vis;
                for ( i = 0; i < dl; i++)  {
                    ids=jso.sizes[i][0]; wid=jso.sizes[i][1];
                    ind=gD.getColIndexById(ids);
                    if (wid>0) gD.setColWidth(ind,wid);
                    vis=jso.visibl[i][1];
                    //alert(ids+'---'+vis+'---'+ind);
                    if (vis==0) gD.setColumnHidden(ind,true);
                    if (vis==1) gD.setColumnHidden(ind,false);
                }


                iasufr.gridRowFocusApply(gD);
                if ((gD.getRowsNum() > 0) && (pHeader == 0)) {
                                      // 0            1            2             3             4            5              6              7            8           9           10              11          12            13           14             15             16           17           18          19         20            21
                    gD.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
                    pHeader = 1;
                }
                if  (gD.getRowsNum() == 0) { gD.detachHeader(1);  pHeader = 0;   }
                gD.setSizes();
                //--------------------------------------------
                
                var cnt = gD.getRowsNum(); var i;
                if (pHeader==1) { for (i = 0; i < gD.getColumnsNum(); i++) $(gD.getFilterElement(i)).val("");  }

                if (!opt.select) {
                   if (cnt>0) { for (i = 0; i < cnt; i++) {
                       gD.cells2(i, 1).setValue("<a href='#'>"+gD.cells2(i, 0).getValue()+"</a>");
                       $(gD.cells2(i, 1).cell).click(onCellClick);

                }  }}

                mainB.progressOff();

            }
        });
        pSelTable=0;
    }  // SelTable()


    function onCellClick(e){
        window.setTimeout( function(){
            var ind=$(e.currentTarget).parent().index()-1;
            var idPers=gD.cells2(ind, 0).getValue();
            iasufr.loadForm("PersForm", {onSave: SelTable, idPers:idPers});
        }, 1);
        pSelTable=0;
    }


    function SaveTable(){
       //gD.isColumnHidden(3);
        var sizes="";
        for (var c=0; c<gD.getColumnCount(); c++){  sizes+= gD.getColumnId(c) + '^' + gD.getColWidth(c)+';';    }
        iasufr.ajax({
            url:'fin.Pers.cls',
            data:{func:'SaveUserTable', json: JSON.stringify( {Sizes:sizes} ) },
            success: function (data) { iasufr.messageSuccess("Збережено !");
            }
        })
    }
    return t;
};

//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/Dog.js


