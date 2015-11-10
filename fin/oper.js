if (!window.Fin) Fin = {};
if (!Fin.Oper) Fin.Oper = {};


Fin.Oper.Create = function (opt) {
    var _this = iasufr.initForm(this, opt); /// <--------------------- !!!!!!!!!!!!!! init form options
    var dost=iasufr.pFunc("operEdit");

    var pChange = 0;     // флаг изменений в дереве групп
    var pChangeOP = 0;   // флаг изменения на строке операции
    var idOPsel = 0;     // id - строка операции при старте
    var idKP = 536;
    var RR = '•', RR2 = '~~~', RR3 = '|||';
    var imgHELP = 'btn-select.png';
    var zmina = 'Записати змiни ?';
    var pHeader = 0;
    dhtmlx.image_path = iasufr.const.IMG_PATH;
    var itemNULL = '0.0.0';
    var CountRow = 1000;

    var Moper=[];
    var main;
    var toolbar;
    var tree;
    var mygrid;
    var tabbar;
    var idTabBar;
    var grid1;
    var grid2;
    var grid3;
    var grid4;
    var EdTree = "";
    var toolbar1;

    main = new dhtmlXLayoutObject(_this.owner, '3L');
    var a = main.cells('a');
    a.setWidth('180');
    a.setText("Групи операцiй");
    var b = main.cells('b'); b.hideHeader();
    main.cells('c').setHeight('200');

    var selOrg = {}; selOrg.id=0;
    var selOrg1 = {}; selOrg1.id=0;

    var tbOrg = b.attachToolbar();
    tbOrg.setIconsPath(iasufr.const.ICO_PATH);
    tbOrg.addText("OrgT", 1, "Органiз.головна ");
    tbOrg.addInput("Org", 2, "",310);

    tbOrg.addText("OrgT1", 3, "&nbsp;&nbsp;&nbsp;Органiз.пiдпорядк. ");
    tbOrg.addInput("Org1", 4, "",310);

    toolbar = main.attachToolbar();

    if (!opt.select ) InitToolBar();

    InitTree();
    if (dost) iasufr.attachSelector(tbOrg.getInput("Org"), "OrgSelector",  { onSelect: OrgSelect});
    if (dost) iasufr.attachSelector(tbOrg.getInput("Org1"), "OrgSelector",  { onSelect: OrgSelect1});
    else  { $(tbOrg.getInput("Org")).attr('readonly', true); $(tbOrg.getInput("Org1")).attr('readonly', true); }

    function OrgSelect(o, $txt)   { selOrg = o;
      if (o) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
      if (selOrg==null) { selOrg={}; selOrg.id=0; }
      tree.destructor();
      Moper=null; Moper=[];
      InitTree();
      LoadTree();
    }

    function OrgSelect1(o, $txt)   { selOrg1 = o;
        if (o) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
        if (selOrg1==null) { selOrg1={}; selOrg1.id=0; }
        tree.destructor();
        Moper=null; Moper=[];
        InitTree();
        LoadTree();
    }

    //------------------------------------
    function InitTree() {
    tree = a.attachTree();
    if (dost) {
      tree.enableDragAndDrop(true);
      tree.setDragBehavior("complex");
      tree.enableItemEditor(true);
    }

    tree.attachEvent("onSelect", function (id) {
        var check = mygrid.getCheckedRows(0);
        if (check != '') return;
        SelTable(id); TABtable(0);
    });

    tree.attachEvent("onEdit", function (state, id, tree, value) {
        if (state == 2) {
            EdTree = EdTree + id + '^' + value + '!!!';
            pChange = 1;
        }
        return true
    });
    tree.attachEvent("onDrag", function (sId, tId, id, sObject, tObject) {
        if ((sId == itemNULL) || (tId == itemNULL)) return
        var sub = tree.getSubItems(sId);
        var lev = tree.getLevel(tId);
        if (lev == 3) return false;
        if ((lev == 2) && (sub != "")) return false;
        pChange = 1;
        return true
    });
    }  // InitTree


    // --------------------------------------
    InitTabBar();    // вкладки  под таблицей с операциями
    InitToolBar1();  //  кнопки - "додати строку"  "видалити строку"

    // ---- бух проводки
    grid1 = tabbar.cells("a1").attachGrid();
    grid1.setHeader('дебет,кредит,дата початку,дата закiнч.,коефіцієнт');
    grid1.setInitWidths('80,80,100,100,*');
    grid1.setColAlign('center,center,center,center,left');
    if (dost)  grid1.setColTypes('ed,ed,ed,ed,ed');
    if (!dost) grid1.setColTypes('ro,ro,ro,ro,ro');
    grid1.init();
    if (dost) grid1.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
        if ((stage == 2) && (nValue != oValue)) {
            var str =  mygrid.getSelectedId() + RR3 + '1' + RR3 + rowId ;
            grid1.forEachCell(rowId, function (cellObj, ind) {
                if (grid1.getColType(ind) == 'ed')  str = str + RR3 + cellObj.getValue();        });
            iasufr.ajax({url:'fin.Oper.cls',data:{func:'SaveGridData', PAR: str, Org:selOrg.id}, success: function (data) {
                var jso=JSON.parse(data);  var rowIdNew=jso.idRow;
                if (rowId!=rowIdNew) { grid1.changeRowId(rowId,rowIdNew); }
            } })
        }  // запись измененной строки
        return true
    });  //onEdit - grid1

    //--- дебиторы-кредиторы
    grid2 = tabbar.cells("a2").attachGrid();
    grid2.setImagePath(iasufr.const.IMG_PATH);
    grid2.setIconsPath(iasufr.const.ICO_PATH);
    grid2.setHeader('Основна орг.,,код мережi / найменування,р/р осн.орг.,Контрагент,,код мережi / найменування,р/р контраг.');
    grid2.setInitWidths('80,25,300,120,80,25,300,*');
    grid2.setColAlign('center,left,left,center,center,left,left,center');
    if (dost)  grid2.setColTypes('ed,img,ro,ed,ed,img,ro,ed');
    if (!dost) grid2.setColTypes('ro,ro,ro,ro,ro,ro,ro,ro');
    grid2.enableEditTabOnly(true);
    grid2.init();
    if (dost) grid2.attachEvent("onRowSelect", function (id) {
        var ind = grid2.getSelectedCellIndex();
        if ((ind == 1) || (ind == 5)) {
            var ind1 = ind - 1;
            var ind2 = ind + 1;
            var ind3 = ind2 + 1;

            iasufr.loadForm('OrgSelector',{width:1200,height:600,codeAdd:true,accountAdd:true,bankOnly:false,onSelect:function(p) {
                grid2.cells(id,ind1).setValue(p.id);
                grid2.cells(id,ind2).setValue(p.name);
                grid2.cells(id,ind3).setValue(p.account);
                Savegrid2(id);
            }  });
        }
    });

    //-------------------
    if (dost) grid2.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
        if ( (stage == 2) && ((cellInd == 0)||(cellInd == 4)) ) {
            var naiInd = cellInd + 2;
            if (nValue == '') {
                grid2.cells(rowId, naiInd).setValue('');
                grid2.cells(rowId, cellInd).setValue('');
            }

            if (nValue!= oValue) { iasufr.ajax({url:'fin.Oper.cls', data: {func: "getOrgByCode", code: nValue },error:'' , success: function (data) {
                var obj =JSON.parse(data);
                grid2.cells(rowId, naiInd).setValue(obj.nameAddCode);
                grid2.cells(rowId, cellInd).setValue(obj.id);
                if (obj.id == '') { grid2.cells(rowId, cellInd).setValue('');
                    grid2.cells(rowId, naiInd).setValue(''); }
                Savegrid2(rowId);
            } }); // ajax
            }
        }  // проверка полей по оргаизациям
        if ( (stage == 2) && (cellInd != 0) && (cellInd != 4) )  Savegrid2(rowId);
        return true
    });  //onEdit - grid2
    //--------------------

    //---- кекв
    grid3 = tabbar.cells("a3").attachGrid();
    grid3.setImagePath(iasufr.const.IMG_PATH);
    grid3.setIconsPath(iasufr.const.ICO_PATH);
    grid3.enableEditTabOnly(true);
    grid3.setHeader('код видаткiв,,найменування');
    grid3.setInitWidths('100,25,*');
    grid3.setColAlign('center,left,left');
    grid3.enableTooltips("false,false,false");
    if (dost)  grid3.setColTypes('ed,img,ro');
    if (!dost) grid3.setColTypes('ro,img,ro');

    if (dost) grid3.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
        if ((stage == 2) && (nValue != oValue)) {
            //----------------- kekv --------------------------
                if (nValue == '') { grid3.cells(rowId, cellInd).setValue('');  grid3.cells(rowId, cellInd+2).setValue(''); SaveKekv(rowId); return true }
                if (nValue != '') {
                    iasufr.ajax({
                        url:'fin.Kekv.cls',
                        data: {func: "getKekvName", code: nValue },
                        success: function (data) {
                            var obj =JSON.parse(data);
                            grid3.cells(rowId, cellInd+2).setValue(obj.name);
                            if (obj.isMessage)  grid3.cells(rowId, cellInd).setValue('');
                            else  SaveKekv(rowId);
                        } }); // ajax
                }
            //-------------------------------------------
        }  // запись измененной строки
        return true
    });  //onEdit - grid3

    if (dost) grid3.attachEvent("onRowSelect", function (id) {
         var ind = grid3.getSelectedCellIndex();
         if (ind == 1) {
             iasufr.loadForm('Kekvs',{width:800,height:600, select:true, onSelect:function(p) {
                 grid3.cells(id,ind-1).setValue(p.id);
                 grid3.cells(id,ind+1).setValue(p.name);
                 SaveKekv(id);
                }
             });
         }
    });


    grid3.init();

    function SaveKekv(rowId) {
       var str =  mygrid.getSelectedId() + RR3 + '3' + RR3 + rowId ;
       grid3.forEachCell(rowId, function (cellObj, ind) {if (grid3.getColType(ind) == 'ed')  str = str + RR3 + cellObj.getValue();});
       iasufr.ajax({url:'fin.Oper.cls',data:{func:'SaveGridData', PAR: str, Org:selOrg.id}, success: function (data) {
           var jso=JSON.parse(data);  var rowIdNew=jso.idRow;
           if (rowId!=rowIdNew) { grid3.changeRowId(rowId,rowIdNew); }
       } })
    }


    //---кпк
    grid4 = tabbar.cells("a4").attachGrid();
    grid4.setImagePath(iasufr.const.IMG_PATH);
    grid4.setIconsPath(iasufr.const.ICO_PATH);
    grid4.enableEditTabOnly(true);
    grid4.setHeader('код прогр.класиф.,,найменування');
    grid4.setInitWidths('130,25,*');
    grid4.setColAlign('center,left,left');
    if (dost)  grid4.setColTypes('ed,img,ro');
    if (!dost) grid4.setColTypes('ro,img,ro');
    grid4.init();
    //----------------------------
    if (dost) grid4.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
        if ((stage == 2) && (nValue != oValue)) {
            //----------------- kpk --------------------------
            if (nValue == '') { grid4.cells(rowId, cellInd).setValue('');  grid4.cells(rowId, cellInd+2).setValue(''); SaveKpk(rowId,4); return true }
            if (nValue != '') {
                iasufr.ajax({
                    url:'base.Simple.cls',
                    data: {func: "getName", code: nValue, dok: '422' },
                    success: function (data) {
                        var obj =JSON.parse(data);
                        grid4.cells(rowId, cellInd+2).setValue(obj.name);
                        if (obj.isMessage)  grid4.cells(rowId, cellInd).setValue('');
                        else  SaveKpk(rowId);
                    }
                });
            }
            //-------------------------------------------
        }  // запись измененной строки
        return true
    }); //----------------------------  onEdit - grid4

    function SaveKpk(rowId) {
        var str =  mygrid.getSelectedId() + RR3 + '4' + RR3 + rowId ;
        grid4.forEachCell(rowId, function (cellObj, ind) {if (grid4.getColType(ind) == 'ed')  str = str + RR3 + cellObj.getValue();});
        iasufr.ajax({url:'fin.Oper.cls',data:{func:'SaveGridData', PAR: str, Org:selOrg.id}, success: function (data) {
            var jso=JSON.parse(data);  var rowIdNew=jso.idRow;
            if (rowId!=rowIdNew) { grid4.changeRowId(rowId,rowIdNew); }
        } })
    }

    if (dost) grid4.attachEvent("onRowSelect", function (id) {
        var ind = grid4.getSelectedCellIndex();
        if (ind == 1) {
            iasufr.loadForm('KpkSelector',{width:800,height:600, select:true, onSelect:function(p) {
                grid4.cells(id,ind-1).setValue(p.id);
                grid4.cells(id,ind+1).setValue(p.name);
                SaveKpk(id);
            }
            });
        }
    });

    // //   ajax - определение организации по юзеру
    iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetOrg"}, success: function (data) {
        var jso = JSON.parse(data);
        selOrg=null;  selOrg={};   selOrg.id= jso.id1;    $(tbOrg.getInput("Org")).val(jso.name1);
        selOrg1=null; selOrg1={};   selOrg1.id= jso.id;  $(tbOrg.getInput("Org1")).val(jso.name);
        LoadTree()
    }});

    function LoadTree(){
    iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetTreeData",  PAR:'^^'+selOrg.id}, success: function (data) {
        var jso = JSON.parse(data);
        tree.loadJSONObject(jso);
        tree.selectItem(itemNULL);
        //SelTable(0);     // заполнить таблицу - операции из всех групп
        TABtable(0);     // таблицы во вкладках в нижней части экрана
    }});
    }

    //---------------------------------------------------------
        //      таблица - строки операций в правой части
        mygrid = main.cells('b').attachGrid();
        mygrid.enableEditEvents(false, true, true);

      if (opt.select) { mygrid.attachEvent("onRowSelect", function (id) {
             var name = mygrid.cells(id, 2).getValue();
             if (opt.onSelect) opt.onSelect({id:id,name:name, idOrg:selOrg.id});
             iasufr.close(_this);
           });
      }

      if (!opt.select) {
            mygrid.attachEvent("onRowSelect", function (id) {
            var nai = mygrid.cells(id, 2).getValue();
            if (nai.indexOf('---')==-1) TABtable(id);
            else TABtable(0);
            idOPsel = id;
            //TABtable(id);
            });
      }

        mygrid.setHeader('Видал./Змiн.групу,Лок. код,Назва операцii,Ознака документу,Дог. обов`язк.,КЕКВ,Група,');
        mygrid.setInitWidths('45,35,380,70,50,70,*,10');
        mygrid.setColAlign('center,center,left,left,center,center,left,left');
        if (dost)  mygrid.setColTypes('ch,ed,ed,coro,ch,ro,ro,ro');
        if (!dost) mygrid.setColTypes('ch,ro,ed,coro,ch,ro,ro,ro');
        mygrid.setColSorting('str,str,str,str,str,str,str,str');
        mygrid.getCombo(3).put("R", 'списання');
        mygrid.getCombo(3).put("P", 'надходження');
        mygrid.enableEditTabOnly(true);
        mygrid.setColumnHidden(7,true);  // =1 ПРИЗНАК - операция второго уровня
        //mygrid.enableEditEvents(true, false, true);  // включить один щелчок
        mygrid.init();
        //if (!dost) iasufr.enableRowselectMode(mygrid);  // нет режима с выделенной клеткой

        if (dost) mygrid.attachEvent("onCheck", function (rId, cInd, state) {
            if ((mygrid.cells(rId, 7).getValue()!=1) && (cInd!=0)) Savemygrid(rId);
        });

        mygrid.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
            //if (!dost) return false;
            if ( (!dost) && (mygrid.cells(rowId, 7).getValue()!=1)) return false;
            //if ( (dost) && (mygrid.cells(rowId, 7).getValue()==1)) {
            if ( (mygrid.cells(rowId, 7).getValue()==1)) {
                iasufr.loadForm("OperEdit", {idOper:rowId, idOrg:selOrg.id, idOrg1:selOrg1.id, modal:true, height:350, width:1000, onSave: Reload});
                return false
            }
            if ((stage == 2) && (nValue != oValue)) Savemygrid(rowId);
            return true
        });  // onEditCell

    function Reload() { var id=tree.getSelectedItemId();  Moper=null; Moper=[]; SelTable(id); }
    function Savemygrid(rowId) {  //запись измененной строки в таблице - операции
        var treeId=tree.getSelectedItemId();
        var str =  treeId + RR3 + rowId ;
        Moper[treeId]=null;
        mygrid.forEachCell(rowId, function (cellObj, ind) { str = str + RR3 + cellObj.getValue();        });
        iasufr.ajax({url:'fin.Oper.cls',data:{func:'SaveOpData', PAR: str, Org:selOrg.id}, success: function (data) {
            var jso=JSON.parse(data);
            var rowIdNew=jso.idOP;
            if (rowId!=rowIdNew) { mygrid.changeRowId(rowId,rowIdNew); }
        } });
    }


    function Savegrid2(rowId) {   //запись измененной строки в таблице - Дебит-кредиторы
      var str =  mygrid.getSelectedId() + RR3 + '2' + RR3 + rowId ;
        grid2.forEachCell(rowId, function (cellObj, ind) {
            if (grid2.getColType(ind) == 'ed')  str = str + RR3 + cellObj.getValue();        });
        iasufr.ajax({url:'fin.Oper.cls',data:{func:'SaveGridData', PAR: str, Org:selOrg.id}, success: function (data) {
            var jso=JSON.parse(data);  var rowIdNew=jso.idRow;      //alert(jso.idRow);
            if (rowId!=rowIdNew) { grid2.changeRowId(rowId,rowIdNew); } //alert(rowIdNew);
        } })
    }
//-----------------  запись изменений в дереве с группами и в таблице с наименованиями операций
    function ZAP() {
        var str = ""; var ErrLevel="";
        tree.clearCut();
        var items = tree.getAllFatItems();
        var Mid = items.split(',');
        for (var i = 0; i < Mid.length; i++) {
            var idd = Mid[i];
            if ( (tree.getLevel(idd)>3) && (ErrLevel=="") ) ErrLevel=tree.getItemText(idd);
            str = str + idd + '^' + tree.getLevel(idd) + '^' + tree.getSubItems(idd) + '^' + tree.getIndexById(idd) + '^' + tree.getItemText(idd) + '!';
        }
        str = str + '~';
        items = tree.getAllLeafs();
        Mid = items.split(',');
        for (i = 0; i < Mid.length; i++) {
            idd = Mid[i];
            if ( (tree.getLevel(idd)>3) && (ErrLevel=="") ) ErrLevel=tree.getItemText(idd);
            if (idd != itemNULL) str = str + idd + '^' + tree.getLevel(idd) + '^' + tree.getSubItems(idd) + '^' + tree.getIndexById(idd) + '^' + tree.getItemText(idd) + '!';
        }

        if (ErrLevel!="") { iasufr.alert('Проверьте уровень вложенности(не более 3-го) группы: ' + ErrLevel); return }
        //----------------- таблица - строки операций
        var strOP = "";
        /*
        if (pChangeOP == 1) {    // отменено !!!
            mygrid.forEachRow(function (id) {
                strOP = strOP + id + '^';
                mygrid.forEachCell(id, function (cellObj, ind) {
                    var val = cellObj.getValue();
                    strOP = strOP + val + '^';
                });
                strOP = strOP + '!!!';
            });
        }
        */
        //------------------------
        var par = str + '~' + EdTree + '~' + strOP;

        iasufr.ajax({url:'fin.Oper.cls',data:{func:'SaveTreeData', PAR: '24^'+par, Org:selOrg.id}, success: function (res) {
            if (res == 1) {
                var txt = "Записано !";
                dhtmlx.message({text: txt, expire: 500});
                var tim = window.setTimeout(function () { pChangeOP=0; window.clearTimeout(tim); }, 500);  }
            else {   dhtmlx.alert("Помилка !");  }
        } }); //ajax
    }  // ZAP

//--------панель с кнопками
    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
      if (dost) {
        toolbar.addButton("save", 1, "Зберегти групи", "32/database_save.png","");
        toolbar.addSeparator("sep1", 2);
        var add="32/note_add.png";
        var del="32/note_delete.png";
        //var newOpts = Array(Array('cutGR', 'obj', 'Видалити групу', 'text_document.gif'), Array('cutOP', 'obj', 'Видалити операцiю', 'text_document.gif'));
        toolbar.addButton("newGR", 3, "Додати групу", add, "");
        toolbar.addButton("cutGR", 4, "Видалити групу", del, "");
        toolbar.setItemToolTip("cutGR", "Для видалення клацнiть на групi");
        toolbar.addSeparator("sep1", 5);
        //toolbar.setItemToolTip("newGR","Додати нову групу або нову операцiю");

        toolbar.addButton("newOP", 6, "Додати операцiю", "32/toolbar_add.png", "");
        toolbar.addButton("cutOP", 7, "Видалити операцiю", "32/toolbar_delete.png", "");
        toolbar.setItemToolTip("cutOP", "Для видалення вкажiть строки операцiй");
        toolbar.addButton("movGR", 8, "Перенести операцiю", "32/toolbar_go.png", "");
        toolbar.setItemToolTip("movGR", "Змiнити групу на вiдмiчених строках операцiй");
        toolbar.addSeparator("sep1", 9);
      }
        toolbar.addButton("newOPV", 10, "Додати внутр.операцiю", "32/toolbar_add.png", "");
        toolbar.addButton("editOPV", 11, "Змiнити внутр.операцiю", "32/toolbar_edit.png", "");
        toolbar.addButton("close", 12, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            if ((pChangeOP == 1) && (id != 'save') && (id != 'newOP') && (id != 'cutOP')) {
                dhtmlx.confirm(zmina, function (result) { if (result) {  ZAP(); return false;    }
                                                          else pChangeOP = 0;    });
            return  }

            if (id == 'save') {  ZAP();  }

            if (id == 'movGR') {
                var check = mygrid.getCheckedRows(0);
                if (!check) {  dhtmlx.alert('Немае вiдмiчених строк! !');  return }
                var idd = tree.getSelectedItemId();
                if ((!idd) || (idd == itemNULL)) { dhtmlx.alert('Вкажiть групу !'); return }
                dhtmlx.confirm("Пiдтвердiть: перенести строки до вибраноi групи ? ", function (result) {
                    if (result) {
                        main.progressOn();
                        iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetOperData", PAR: "26^"+idd+ '^^' + check, Org:selOrg.id}, success: function (res) {
                        //var loader = iasufr.ajax({url:'/user/SPR.index.cls',data:{PAR: '26^'+idd+ '^^' + check}, success: function (res) {
                            Moper=null; Moper=[];
                            SelTable(idd);
                            pChangeOP = 0;

                        } });
                    }
                });
            }
            //-----------
            if (id == 'cutGR') {
                var idd = tree.getSelectedItemId();
                if (idd == '') { dhtmlx.alert('Вкажiть групу !');   return }
                var listRow = mygrid.getAllRowIds();
                if (listRow != '') { dhtmlx.alert('Неможливо видалити - група має строки операцiй  !');return }
                tree.deleteItem(idd, true);
                tree.selectItem(itemNULL);
                pChange = 1;
            }

            if (id == 'newGR') {
                var idd = tree.getSelectedItemId();
                if (idd == '') idd = 0;
                var lev = tree.getLevel(idd);
                if (lev == 3) { idd = tree.getParentId(idd); }
                var tt = 'Новая группа';
                var d = new Date();
                var idN = d.valueOf();
                tree.insertNewItem(0, idN, tt, 0, 0, 0, 0, 'SELECT');
                EdTree = EdTree + idN + '^' + tt + '!!!';
                pChange = 1;
                return
            }
            //---------------------
            if (id == 'cutOP') {
                var check = mygrid.getCheckedRows(0);
                if (!check) { dhtmlx.alert('Вкажiть операцiю !');   return }
                dhtmlx.confirm("Пiдтвердiть: видалити строки операцiй ? ", function (result) {
                    if (result) {
                        main.progressOn();
                        var idd = tree.getSelectedItemId();
                        iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetOperData", PAR: "27^"+id+ '^^' + check, Org:selOrg.id}, success: function (data) {
                            var idd = tree.getSelectedItemId();
                            pChangeOP = 0;
                            if (idd != '') { Moper[idd]=null;  SelTable(idd); pChangeOP=0; }
                         } });
                    }
                })
            }
            //--------------------
            if (id == 'newOPV') {
                var idRow=mygrid.getSelectedId();
                if (!idRow) { iasufr.message('Вкажiть строку - до якоi додати'); return }
                var name = mygrid.cells(idRow, 2).getValue();
                if (name=="") { iasufr.message('Вкажiть назву операцii - до якоi додати'); return }
                var p=idRow.split("."); idRow=p[0]+'.0';
                iasufr.loadForm("OperEdit", {idOper:idRow, idOrg:selOrg.id, idOrg1:selOrg1.id, modal:true, height:350, width:1000, onSave: Reload});
            }


            if (id == 'editOPV') {
                var idRow=mygrid.getSelectedId();
                if (!idRow) { iasufr.message('Вкажiть строку'); return }
                var p=idRow.split(".");
                if (!p[1]) { iasufr.message('Вкажiть строку внутр.операцii'); return }
                iasufr.loadForm("OperEdit", {idOper:idRow, idOrg:selOrg.id, idOrg1:selOrg1.id, modal:true, height:350, width:1000, onSave: Reload});
            }

            if (id == 'newOP') {
                var idd = tree.getSelectedItemId();
                var nai = "";
                //if ((idd=='')||(idd==itemNULL)) { dhtmlx.alert('Вкажiть групу !'); return }
                if (idd == '') {dhtmlx.alert('Вкажiть групу !'); return}
                if ((idd) && (idd != itemNULL)) { nai = tree.getItemText(idd); nai = nai + '///' + idd;}
                //var idd = (new Date()).valueOf();
                CountRow = CountRow +1;
                var idn = CountRow;
                mygrid.addRow(idn, ['', '', '', 'R', 1, '', nai], 0);
                window.setTimeout(function(){ mygrid.selectCell(0,2,false,false,true,true); mygrid.editCell() }, 1);
            }
            if (id == 'ref') { if (pChange) { dhtmlx.confirm(zmina, function (result) { if (result)  ZAP(); }); }}
            if (id == 'close') { iasufr.close(_this);}

        }); // onClic
    }

    //------------------------end  InitToolBar()

    function SelTable(id) {  // ЗАПОЛНЕНИЕ таблицы - строки операций из указанной группы 'id'
        mygrid.clearAll(); var jso;
        if (Moper[id]!=null) { jso= Moper[id];  mygrid. parse(jso, 'json'); SelFilter(); return }
        main.progressOn();
        iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetTreeData", PAR: '23^'+id+'^'+selOrg.id+'^'+selOrg1.id}, success: function (data) {
                jso = JSON.parse(data);
                Moper[id]=jso;
                  //var idd = tree.getSelectedItemId();
                  //var txt = tree.getItemText(idd);
                mygrid. parse(jso, 'json');
                SelFilter();
                main.progressOff();
        }
        }); //ajax

    }
    function SelFilter() {
      if ((mygrid.getRowsNum() > 0) && (pHeader == 0)) {
          mygrid.attachHeader('#rspan,#rspan,#text_filter,#rspan,#rspan,#rspan,#rspan,#rspan');
          pHeader = 1;
      }
      if  (mygrid.getRowsNum() == 0) {
          mygrid.detachHeader(1);
          pHeader = 0;
      }
      mygrid.setSizes();
      if (pHeader==1) $(mygrid.getFilterElement(2)).focus();
    }

//-------------таблицы во вкладках - бухпроводки, организации, кекв , кпк
    function TABtable(id) {
        //if (id != 0) { grid1.clearAll();  grid2.clearAll(); grid3.clearAll(); grid4.clearAll();}
        grid1.clearAll();  grid2.clearAll(); grid3.clearAll(); grid4.clearAll();
        iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetOperData", PAR: "25.1^" + id, Org:selOrg.id}, success: function (data) {
            var json1 = JSON.parse(data);
            grid1.parse(json1, 'json');

            iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetOperData", PAR: "25.2^" + id, Org:selOrg.id}, success: function (data) {
            var json2 = JSON.parse(data);
            grid2.parse(json2, 'json');
            } });

            iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetOperData", PAR: "25.3^" + id, Org:selOrg.id}, success: function (data) {
                var json3 = JSON.parse(data);
                grid3.parse(json3, 'json');

            } });

            iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetOperData", PAR: "25.4^" + id, Org:selOrg.id}, success: function (data) {
                var json4 = JSON.parse(data);
                grid4.parse(json4, 'json');
            } });

        } });

        // enable(disable) tabbar,toolbar1  - в зависимости от выбора строки операции
        for (var q = 0; q < idTabBar.length; q++) {
            if (id == '') tabbar.disableTab(idTabBar[q]);
            else        tabbar.enableTab(idTabBar[q]);
        }
        toolbar1.forEachItem(function (itemId) {
            if ((id == '') || (!dost) ) toolbar1.disableItem(itemId);
            else        toolbar1.enableItem(itemId);
        });
    }   // TABtable(id)


//--------панель с кнопками  - вкладки: бухпроводки,...
    function InitToolBar1() {
        toolbar1 = new dhtmlXToolbarObject(idDiv);
        toolbar1.setIconsPath(iasufr.const.ICO_PATH);  // "/images/imgs/");
        toolbar1.setIconSize(16);
        //toolbar1.addButton("save", 1, "", "32/database_save.png", "");
        //toolbar1.setItemToolTip("save", "Зберегти");
        toolbar1.addButton("new", 2, "Додати строку", "16/plus.png", "");
        toolbar1.setItemToolTip("new", "Додати нову строку ");
        toolbar1.addButton("cut", 3, "Видалити строку", "16/cross.png", "");
        toolbar1.setItemToolTip("cut", "Видалити вказану строку");
        ///toolbar1.addText("info", 7, "");

        if (dost) toolbar1.attachEvent("onClick", function (id) {
            if (id == 'new')  AddDel(1);
            if (id == 'cut')  AddDel(2);
        });
    }

// вкладки в нижней части экрана под операциями
    function InitTabBar() {
        idTabBar = ["a1",  "a3", "a4"]; // "a2"
        tabbar = main.cells("c").attachTabbar("top");
        tabbar.setImagePath(iasufr.const.IMG_PATH);
        tabbar.setMargin("2");
        tabbar.setOffset(280);
        tabbar.addTab("a1", "Бух.рахунки", "150px");
        tabbar.addTab("a2", "Дебитори-кредитори", "150px");
        tabbar.addTab("a3", "К Е К В", "150px");
        tabbar.addTab("a4", "К П К", "150px");
        tabbar.disableTab("a2")
        tabbar.setTabActive("a1");
        tabbar.enableAutoReSize();
        var d = new Date();    idDiv = d.valueOf();
        $("<div id="+idDiv+"><div>").insertBefore($(tabbar._tabs["a1"]));

    }

//добавить, удалить строку в таблицах во вкладках
    function AddDel(pri) {
        var tab = tabbar.getActiveTab();
        var grid;
        var nn = tab.substr(1);
        switch (tab) {
            case 'a1': { grid = grid1;  break }
            case 'a2': { grid = grid2;  break }
            case 'a3': { grid = grid3;  break }
            case 'a4': grid = grid4;  break
        }
        if (pri == 2) {
            var ind = grid.getRowIndex(grid.getSelectedId());
            if (ind == -1) { dhtmlx.alert('Вкажiть строку !'); return  }
            dhtmlx.confirm("Пiдтвердiть видалення !", function (result) {
                var idRow=grid.getSelectedId();
                if (result) grid.deleteRow(idRow);

                var Ngrid=tab.substr(1);
                var str =  mygrid.getSelectedId() + RR3 + Ngrid + RR3 + idRow;
                iasufr.ajax({url:'fin.Oper.cls',data:{func:'SaveGridData', PAR: str, Org:selOrg.id}, success: function (data) {
                var jso=JSON.parse(data);
                } })


            });
        }

        if (pri == 1) {
            CountRow = CountRow +1;
            var newid = CountRow;
            if (grid == grid1) { grid.addRow(newid, ['', '', '', '', ''], 0);   }
            if (grid == grid2) { grid.addRow(newid, ['', imgHELP, '', '', '', imgHELP, '', ''], 0); }
            if ((grid == grid3) || (grid == grid4)) { grid.addRow(newid, ['', imgHELP,''], 0);  }
            window.setTimeout(function(){ grid.selectCell(0,0,false,false,true,true); grid.editCell() }, 1);

        }
    }

    return _this;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/Oper.js