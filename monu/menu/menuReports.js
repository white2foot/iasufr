
if (!window.ac) ac = {};
if (!ac.MenuReports) ac.MenuReports = {};

ac.MenuReports.Create = function (opt) {

//1.1 инициализация параметров
    var _this = iasufr.initForm(this, opt);

//1.2 java переменные
    _this.idDoc=opt.idDoc;
    var masFunc; //массив функций
    var json1;

    var imgGroup="16/book.png";     if (this.idDoc=="MenuReports")imgGroup="16/folder.png";
    var imgFile="16/bullet_key.png";if (this.idDoc=="MenuReports")imgFile="16/menu_item.png";
    var expand=1;

//1.3 dhx объекты
    var dhxLayout;
    var dhxLayoutT1;
    var dhxLayoutT2;
    var dhxToolbar0;
    var dhxToolbar2;

//1.4 первая загрузка - json
    iasufr.ajax({
        url: "base.Simple.cls",
        data: {func: "init",idDoc:_this.idDoc,idLayout:""},
        success: function (data) {//alert(data);
            json1 = JSON.parse(data);

            //---------------------2.1 описание Layout ----------------
            dhxLayout = new dhtmlXLayoutObject(_this.owner, "2E");

            dhxLayout.cells("a").setHeight("*");
            dhxLayout.cells("b").setHeight("200");

            dhxLayout.cells("a").hideHeader();
            dhxLayout.cells("b").hideHeader();

            //---------------------2.2 описание TOOLBAR ----------------
            masFunc=json1.func;

            dhxToolbar0= dhxLayout.cells("a").attachToolbar(json1.button[0]);
            dhxToolbar0.setIconSize(32);
            dhxToolbar0.attachEvent("onClick", onToolbarClick);

            dhxToolbar2 = dhxLayout.cells("b").attachToolbar(json1.button[1]);
            dhxToolbar2.setIconPath(iasufr.const.ICO_PATH);
            dhxToolbar2.attachEvent("onClick", onToolbarClick);

            //---------------------2.3 описание dhx объектов,events ---------
            //////////////////////////TREE GRID//////////////////////////
            dhxLayoutT1=dhxLayout.cells("a").attachGrid();
            dhxLayoutT1.enableDragAndDrop(true);
            dhxLayoutT1.setDragBehavior("complex");
            dhxLayoutT1.enableTreeCellEdit(false);

            dhxLayoutT1.attachEvent("onDrop", function(id1,id2){
                //alert(id1+"/"+id2)
                dhtmlx.confirm({
                    text: "Зберегти змiни",
                    callback: function(result) {
                        if (result) {
                            saveFormNum(id1,id2);
                            //if (dhxLayoutT1.getSubItems(id1)!="") dhxLayoutT1.setItemImage(id1, iasufr.const.ICO_PATH + imgGroup);
                            //else  dhxLayoutT1.setItemImage(id1, iasufr.const.ICO_PATH + imgFile);
                            return true
                        }
                        else {initGrid("T1");}
                    }
                });


            });

            dhxLayoutT1.attachEvent("onCheck", function (rowId, cellInd, state) { //alert(rId+"="+cInd+"="+state)
                //показ измененной строки
                dhxLayoutT1.setRowTextStyle(rowId, iasufr.const.rowChangedCss);
                //массив измененных строк
                var numbIsChange=dhxLayoutT1.idCells.indexOf("isChangeRowTemp");if (numbIsChange==-1) return
                dhxLayoutT1.cells(rowId,numbIsChange).setValue(1);

            });

            dhxLayoutT1.attachEvent("onRowSelect", function(rowId,cellInd){
                var isFunc=dhxLayoutT1.isFunc[cellInd];
                if (dhxLayoutT1.isFunc[dhxLayoutT1.idCells.indexOf("idKeysRowTemp")]!=null){
                    isFunc=dhxLayoutT1.isFunc[dhxLayoutT1.idCells.indexOf("idKeysRowTemp")]
                };

                if (isFunc!=null){
                    var idBut1=isFunc,idBut2="";
                    if (isFunc.lastIndexOf(".")>-1){isFunc=isFunc.split(".");idBut1=nameBut[0],idBut2=nameBut[1]}
                    if (idBut1!="") onToolbarClick(idBut1,rowId)
                    if (idBut2!="") onToolbarClick(idBut2,rowId) //по обяз.параметрам не пропустит
                }

            });

            dhxLayoutT1.init();

            dhxLayoutT2=dhxLayout.cells("b").attachGrid();
            dhxLayoutT2.init();

            initGrid("T1",json1.data[0]);

        } //success
    }); //ajax
//////////////////////////////////////////////////////////////////
//////////////////////////onToolbarClick//////////////////////////

    function onToolbarClick(idBut,idRowCheck) {
        //из наименования номер ToolBar
        var numbBut; for (var numbObj = 0; numbObj < masFunc.length; numbObj++){
            if (masFunc[numbObj].id==idBut) {numbBut=numbObj;break;}
        }
        if ((numbBut==null) )return

        //взять функцию и параметры
        var func=masFunc[numbBut].func; if(!func) return
        var param=masFunc[numbBut].param;
        if (func.lastIndexOf("(")>-1) {eval(func);return}
        switch (func) {
            case "reload":
                initGrid(param[0].idLayout);
                break;
            case "reload2":
                initGrid("T2",null,param);
                break;
            case "save":
                isSave(idBut);
                break;
            case "load":
                isLoad(idBut,idRowCheck);
                break;
            case "delete":
                isDelete(idBut);
                break;
            case "addUsr":
                iasufr.loadForm("Users", { selectUser: true, modal: true, onSelect: function(u) {isSaveUsers(idBut,u.id,1)}});
                break;
            case "delUsr":
                isSaveUsers(idBut,"",2);
                break;
            case "close": iasufr.close(_this); break;
            case "expand" : { if (expand==1) {dhxLayoutT1.collapseAll(); expand=0; return }
                if (expand==0) { dhxLayoutT1.expandAll(); expand=1; return }
        }}


    }
//////////////////////////////////////////////////////////////////
////////////////////////////////////// 4.INIT/////////////////////
    function initGrid(idLayout,isData,param) {
        var dhxGridInit; if (idLayout==null) idLayout="T1";
        var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        if (dhxGridInit){
            var idRowActiv=dhxGridInit.getSelectedRowId();
            iasufr.gridRowFocus(dhxGridInit, idRowActiv);
            if (dhxGridInit.type=="treeGrid") dhxGridInit.saveOpenStates("idDoc:"+_this.idDoc+",idLayout:"+idLayout)
        }

        dhxGridInit.clearAll(true);

        var paramLoad=""; if (param!=null) paramLoad=getParam(param,1,null);

        if (isData==null){
            iasufr.ajax({
                url: "base.Simple.cls",
                data: {func: "init",idDoc:_this.idDoc,idLayout:idLayout,param:paramLoad},
                success: function (data) {//alert(data);
                    var json = JSON.parse(data);
                    initPropGrid(idLayout,json.data[0].prop);
                    dhxGridInit.parse(json.data[0].data, 'json');
                    initProp2Grid(idLayout);
                    if ( idLayout=="T1") onToolbarClick("editUser");
                }
                })
        }
        else {
            initPropGrid(idLayout,isData.prop);
            dhxGridInit.parse(isData.data, 'json');
            initProp2Grid(idLayout);
            if ( idLayout=="T1") onToolbarClick("editUser");
        }
    }
    function initPropGrid(idLayout,prop){
        if (!prop) return
        var dhxGridInit;
        var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        dhxGridInit.type=prop.type;
        if (prop.type=="treeGrid")dhxGridInit.enableTreeCellEdit(false);
        dhxGridInit.setDelimiter("•");
        dhxGridInit.setHeader(prop.head1);
        if (prop.head2)dhxGridInit.attachHeader(prop.head2);
        dhxGridInit.setInitWidths(prop.width);
        dhxGridInit.setColAlign(prop.align);
        if (idLayout!="T2")dhxGridInit.attachHeader(prop.filtr);
        if (prop.itog1) dhxGridInit.attachHeader(prop.itog1);
        if (prop.itog2) dhxGridInit.attachHeader(prop.itog2);
        dhxGridInit.setColTypes(prop.types);
        dhxGridInit.setColSorting(prop.sort);
        dhxGridInit.setImagePath(iasufr.const.IMG_PATH);

        dhxGridInit.idLayout=prop.idLayout;
        dhxGridInit.type=prop.type;
        dhxGridInit.idCells=prop.idCells;
        dhxGridInit.idKeysRowTemp=prop.idKeysRowTemp;
        dhxGridInit.isFunc=prop.isFunc;

        dhxGridInit.init();

        //dhxGridInit.setColumnIds(prop.idCells2);

        dhxGridInit.enableHeaderMenu(prop.isMenu);
        dhxGridInit.enableAutoHiddenColumnsSaving("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
        dhxGridInit.loadHiddenColumnsFromCookie("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
        dhxGridInit.enableAutoSizeSaving("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
        dhxGridInit.loadSizeFromCookie("idDoc:"+_this.idDoc+",idLayout:"+idLayout);

        dhxGridInit.setColumnHidden(dhxGridInit.idCells.indexOf("idKeysRowTemp"),true);
    }
    function initProp2Grid(idLayout){
        var dhxGridInit;
        var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        //focus
        iasufr.gridRowFocusApply(dhxGridInit);
        if (dhxGridInit.type!="treeGrid") return

        //img tree
        var numbIsGroup=dhxGridInit.idCells.indexOf("urlMenu");
        dhxGridInit.expandAll();
        if (_this.idDoc=="FuncReports")  numbIsGroup=dhxGridInit.idCells.indexOf("idFunc");
        for (var i = 0; i < dhxGridInit.getRowsNum(); i++){
            if (dhxGridInit.cells2(i,numbIsGroup).getValue() == "") {
                dhxGridInit.setItemImage(dhxGridInit.getRowId(i), iasufr.const.ICO_PATH + imgGroup);
                dhxGridInit.setRowTextStyle(dhxGridInit.getRowId(i), "font-weight:bold");
                //на папках (группах)спрятать checkbox
                for (var j=1;j<dhxGridInit.idCells.length;j++){
                    if (dhxGridInit.idCells[j].lastIndexOf("CHECK")>-1)$(dhxGridInit.cells2(i,j).cell).children().hide();
                }
            }
            else dhxGridInit.setItemImage(dhxGridInit.getRowId(i), iasufr.const.ICO_PATH + imgFile);

        } //for
        dhxGridInit.collapseAll();
        dhxGridInit.loadOpenStates("idDoc:"+_this.idDoc+",idLayout:"+idLayout);



    }
    ///////////////////////////////////////////////////
    //////////////////getParam////////////////////////
    function getParam(listParam,isParam,idRowCheck,isString){
        //isString - строка из ячеек для удаления
        if (!listParam) return

        var str1Obj=[];
        var str2Obj=[];
        var str0Obj="";
        var idObj,idLayout,val1,val2,isReq,name,isArr;

        var dhxGridInit; //var numbLayout

        var retError=-1;

        var idRow,numbCellIdKeys,numbIdKeys,strCell
        for (var numbObj = 0; numbObj < listParam.length; numbObj++){
            //описание
            idObj=listParam[numbObj].idRekv;
            idLayout=listParam[numbObj].idLayout; if (idLayout==null) idLayout="";
            val1=listParam[numbObj].val;    if (val1==null) val1="";
            val2="";
            isReq=listParam[numbObj].isReq; if (isReq==null) isReq=0;
            name=listParam[numbObj].name;   if (name==null) name=idObj;
            isArr=listParam[numbObj].isArr; if (isArr==null) isArr=0;
            //получить val2
            if ((val1=="")&&(idLayout!="")){
                /*numbLayout; for (var numbLayout = 0; numbLayout < dhxLayoutObj.length; numbLayout++){
                 if (dhxLayoutObj[numbLayout].idLayout==idLayout) {numbLayout=numbLayout;break;}
                 }
                 if (numbLayout==null) return ""
                 */
                var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
                eval(str);

                if (dhxGridInit.type=="form"){
                    val2= dhxGridInit.getFormData()[idObj];
                    if (dhxGridInit.getItemType(idObj)=='calendar') {val2=iasufr.formatDateStr(dhxGridInit.getCalendar(idObj).getDate(true));};
                    if (dhxGridInit.selector[idObj]) {val2=dhxGridInit.selector[idObj].id;}
                }
                else if ((dhxGridInit.type=="grid")||(dhxGridInit.type=="treeGrid")){
                    idRow = dhxGridInit.getSelectedRowId(); if (idRowCheck!=null)idRow = idRowCheck;
                    if ((idRow==null)&&(isReq==1)) return retError
                    if (idRow==null){
                        val2="";
                    }
                    else {
                        if (isString!=1){
                            numbCellIdKeys=dhxGridInit.idCells.indexOf("idKeysRowTemp");
                            numbIdKeys=dhxGridInit.idKeysRowTemp.indexOf(idObj);
                            if (numbCellIdKeys==null) {alert("не вказан idKeysRowTemp ");return retError}
                            if ((numbIdKeys==-1)&&(isReq==1)) {alert(idObj+ "не вказан у idKeysRowTemp :" +dhxGridInit.idKeysRowTemp);return retError}
                            strCell=dhxGridInit.cells(idRow,numbCellIdKeys).getValue();
                            if (strCell==null) return retError
                            strCell=strCell.split(".");
                            val2=strCell[numbIdKeys]; if (val2==null) val2="";
                        }
                        else {
                            val2=dhxGridInit.cells(idRow,dhxGridInit.idCells.indexOf(idObj)).getValue();
                        }
                    }
                }

            }
            if ((val1=="")&&(idLayout=="")){return retError}
            if (val1!=""){val2=val1}
            //если обяз. и пуст
            if ((isReq==1)&&(val2=="")) return retError
            //собрать значения
            if (isParam==1){
                str1Obj.push(name);
                str2Obj.push(val2);
            }
            else {
                if (isString==1){
                    str0Obj=str0Obj+val2;
                }
                else{
                    if (isArr==0)str0Obj=str0Obj+'"'+name+'":"'+val2+'"';
                    else str0Obj=str0Obj+'"'+name+'":['+val2+']';
                }
                if (numbObj<(listParam.length-1)){str0Obj=str0Obj+","}
            }
        }

        if (isParam==1) {
            var jsoDATA = [];
            jsoDATA.push(str1Obj); //[idOrg,idZvit]
            jsoDATA.push(str2Obj);//[12587,1587]
            return {param:jsoDATA}
        }
        if (isString==1) return str0Obj
        else             return JSON.parse("{"+str0Obj +"}")

    }

    function getParamGrid(idLayout,isRow,isDel){
        var dhxGridInit;
        var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        var jsoDATA = [];
        //1)1-ая строка - id
        jsoDATA.push(dhxGridInit.idCells); //ID,412...
        //2)2-ая строка - value

        var idI="";
        var indRowEdit=0;
        var numbIsChange=dhxLayoutT1.idCells.indexOf("isChangeRowTemp");
        var t=dhxGridInit.getSelectedRowId();
        var i1= 0,i2=dhxGridInit.getRowsNum()-1;
        if (isRow==1) {i1= dhxGridInit.getRowIndex(dhxGridInit.getSelectedRowId()),i2=i1; if (i1==null) {i1=0; i2=-1;};}
        for (var i = i1; i <= i2; i++) {
            if ((numbIsChange==-1)||(dhxGridInit.cells2(i, numbIsChange).getValue()==1)||(isDel!=null)){
                indRowEdit=indRowEdit+1;
                jsoDATA.push([]);
                for (var j=0;j<dhxGridInit.getColumnsNum();j++){
                    var val=dhxGridInit.cells2(i,j).getValue();
                    if (val==null) val="";
                    jsoDATA[indRowEdit].push(val);
                }
            }
        }
        return jsoDATA

    }

    function isLoad(idBut,idRowCheck)
    {
        //из наименования номер ToolBar
        var numbBut; for (var numbObj = 0; numbObj < masFunc.length; numbObj++){
        if (masFunc[numbObj].id==idBut) {numbBut=numbObj;break;}
    }
        if ((numbBut==null) )return

        //взять функцию и параметры
        var func=masFunc[numbBut].func; if(!func) return
        var param=masFunc[numbBut].param;

        var javaObj=masFunc[numbBut].javaObj; if(javaObj==null) return
        var paramLoad=getParam(masFunc[numbBut].param,masFunc[numbBut].isParam,idRowCheck); if (paramLoad==-1) return
        var paramLoadFunc={onSave:initGrid};
        $.extend(paramLoad, paramLoadFunc );
        iasufr.loadForm(javaObj, paramLoad);

    }

    function isSave(idBut,isRow){
        //из наименования номер ToolBar
        var numbBut; for (var numbObj = 0; numbObj < masFunc.length; numbObj++){
            if (masFunc[numbObj].id==idBut) {numbBut=numbObj;break;}
        }
        if ((numbBut==null) )return

        var param=[{idLayout:"T1",idKeysRowTemp:dhxLayoutT1.idKeysRowTemp,data:getParamGrid("T1",isRow)}]
        var t=param;
        iasufr.ajax({
            url: "base.Simple.cls",
            data: {func: "save",idDoc:_this.idDoc,idBut:idBut,param:JSON.stringify(param)},
            success:  function(data) {
                //var json = JSON.parse(data)
                //if (json!="")setParam(json.param);
                iasufr.messageSuccess("Cбережено");
                var funcLast=masFunc[numbBut].funcLast;
                if (funcLast!="") onToolbarClick(funcLast);
                else{
                    var isChangeRowTemp=dhxLayoutT1.idCells.indexOf("isChangeRowTemp");
                    if (isChangeRowTemp!=-1){
                        for (var i = 0; i < dhxLayoutT1.getRowsNum(); i++) {
                            dhxLayoutT1.setRowTextStyle(dhxLayoutT1.getRowId(i), "")
                            dhxLayoutT1.cells(dhxLayoutT2.getRowId(i),isChangeRowTemp).setValue("0");
                        }
                    }
                }

            }

        });
    }

    function isDelete(idBut) {
        var param=[{idLayout:"T1",idKeysRowTemp:dhxLayoutT1.idKeysRowTemp,data:getParamGrid("T1",1,1)}]

        dhtmlx.confirm({
            text: iasufr.lang.msg.delete,
            callback: function(result) {
                if (result) {
                    iasufr.ajax({
                        url: "base.Simple.cls",
                        data: {func: "save",idDoc:_this.idDoc,idBut:idBut,param:JSON.stringify(param)},
                        success:  function() {
                            iasufr.messageSuccess("Запис видалено");
                            initGrid("T1");
                        }

                    });
                }
            }
        });

    }

    function saveFormNum(id1,id2) {
        var jsoT2 = [];
        var idI;
        var indParentI;
        var keyI="";
        var keyParentI=""
        var indKey=dhxLayoutT1.idCells.indexOf("idKeysRowTemp");
        for (var i = 0; i < dhxLayoutT1.getRowsNum() ;i++) { //dhxLayoutT1.getRowsNum();
            jsoT2.push([]);
            //id тек.строки
            idI=dhxLayoutT1.getRowId(i);
            //idKeysRowTemp
            keyI=dhxLayoutT1.cells2(i,indKey).getValue();
            keyI=keyI.split(".");
            jsoT2[i].push(keyI[0]);
            //idParentI
            var tt=dhxLayoutT1.getParentId(idI);
            var tt2=dhxLayoutT1.getRowIndex(dhxLayoutT1.getParentId(idI));
            indParentI=dhxLayoutT1.getRowIndex(dhxLayoutT1.getParentId(idI));
            if (indParentI!=-1){
                keyParentI=dhxLayoutT1.cells2(indParentI,indKey).getValue();
                keyParentI=keyParentI.split(".");
                jsoT2[i].push(keyParentI[0]);
            }
            else{
                jsoT2[i].push("");
            }
            jsoT2[i].push((i+1));

        }
        var t=jsoT2;

        iasufr.ajax({
            url: "ac.MenuReports.cls",
            data: {func: "SaveNum", json:JSON.stringify({idDoc:_this.idDoc,T2:jsoT2,numb:dhxLayoutT1.getRowsNum()})},
            success: function(data) {iasufr.messageSuccess("Налаштування сбережено");}
            //error:function(data) {iasufr.messageSuccess("Налаштування сбережено");reloadForm();}
        });
    }

    function isSaveUsers(idBut,idUser,flagSave) {
        var param="";
        var idRow1 = dhxLayoutT1.getSelectedRowId(); if (!idRow1) return
        var t1=dhxLayoutT1.getRowIndex(idRow1);
        var t2=dhxLayoutT1.idCells.indexOf("idKeysRowTemp");
        var idKeys1=dhxLayoutT1.cells2(dhxLayoutT1.getRowIndex(idRow1),dhxLayoutT1.idCells.indexOf("idKeysRowTemp")).getValue();
        idKeys1=idKeys1.split(".");
        var idMenu=idKeys1[0]; if (idMenu==null) return
        var id="idMenu";if (_this.idDoc=="FuncReports")id="idFunc";
        if (flagSave==1) {
            if (!idUser) return
            param=[["idKeysRowTemp",id,"idUserCHECK"+idUser],["",idMenu,1]]
        }
        else if (flagSave==2) {
            var idRow2 = dhxLayoutT2.getSelectedRowId(); if (!idRow2) return
            var id2=dhxLayoutT2.cells2(dhxLayoutT2.getRowIndex(idRow2),dhxLayoutT2.idCells.indexOf("idKeysRowTemp")).getValue();
            param=[["idKeysRowTemp",id,"idUserCHECK"+id2],["",idMenu,0]]
        }
        var param2=[{idLayout:"T2",idKeysRowTemp:dhxLayoutT2.idKeysRowTemp,data:param}]
        var t=param2;
        iasufr.ajax({
            url: "base.Simple.cls",
            data: {func: "save",idDoc:_this.idDoc,idBut:idBut,param:JSON.stringify(param2)},
            success:  function(data) {
                onToolbarClick("editUser");
            }

        });
    }
}

if (!ac.MenuHelpReports) ac.MenuHelpReports = {};

ac.MenuHelpReports.Create = function (opt) {
    //1.1 инициализация параметров
    var t = iasufr.initForm(this, opt);

    //1.2 java переменные

    //1.3 dhx объекты
    var dhxLayout;
    var dhxGrid1;

    //---------------------2.1 описание Layout ----------------
    dhxLayout = new dhtmlXLayoutObject(t.owner, "1C");
    dhxLayout.cells("a").setHeight("*");
    dhxLayout.cells("a").hideHeader();

    //---------------------2.2 описание TOOLBAR ----------------
    //---------------------2.3 описание dhx объектов,events ---------

    //////////////////////////TREE GRID//////////////////////////
    dhxGrid1=dhxLayout.cells("a").attachGrid();
    dhxGrid1.attachEvent("onRowSelect", function(id){
        isClick(id);
    });
    //выделегие строки, не ячеечное
    iasufr.enableRowselectMode(dhxGrid1);

    iasufr.ajax({
        url: "base.Simple.cls",
        data: {func: "init",idDoc : "MenuHelpReports",idLayout:"T1"},
        success: function (data) {
            var json = JSON.parse(data);

            var prop=json.data[0].prop;
            dhxGrid1.setDelimiter("•");
            dhxGrid1.enableTreeCellEdit(false);
            dhxGrid1.type=prop.type;
            dhxGrid1.idCells=prop.idCells;
            dhxGrid1.setHeader(prop.head1);
            if (prop.head2)dhxGrid1.attachHeader(prop.head2);
            dhxGrid1.setInitWidths(prop.width);
            dhxGrid1.setColAlign(prop.align);
            dhxGrid1.attachHeader(prop.filtr);
            dhxGrid1.setColTypes(prop.types);
            dhxGrid1.setColSorting(prop.sort);
            dhxGrid1.setImagePath(iasufr.const.IMG_PATH);
            dhxGrid1.init();


            //dhxGrid1.setColumnIds(prop.idCells2);
            dhxGrid1.parse(json.data[0].data, 'json');

            dhxGrid1.expandAll();
            for (var i = 0; i < dhxGrid1.getRowsNum(); i++){
                dhxGrid1.setItemImage(dhxGrid1.getRowId(i), "/js/dhtmlxw/imgs/blank.gif","/js/dhtmlxw/imgs/blank.gif");
            } //for
            //focus
            iasufr.gridRowFocusApply(dhxGrid1);

        } //success
    }); //ajax
    function isClick(id){
        var numbIsJava=dhxGrid1.idCells.indexOf("jsCodeMenu"); if (numbIsJava==null) return
        var isJava= dhxGrid1.cells(id,numbIsJava).getValue();
        if (isJava!=""){eval(isJava);iasufr.close(t);}
        else {
            var numbUrl=dhxGrid1.idCells.indexOf("urlMenu"); if (numbIsJava==null) return
            var url=dhxGrid1.cells(id,numbUrl).getValue();
            if (url=="") return
            if ((url.indexOf(".") != -1 || url.indexOf("/") != -1)) { self.location=url;}
            else self.location="index.html?form="+url;
        }
    }
}
//@ sourceURL=http://ac/menuReports.js

