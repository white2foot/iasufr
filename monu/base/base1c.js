if (!window.base) base = {};
if (!base.Layout1C) base.Layout1C = {};

base.Layout1C.Create = function (opt) {
//1.1 инициализация параметров
    var _this = iasufr.initForm(this, opt);

//1.2 java переменные
    _this.idDoc=opt.idDoc;
    _this.param=opt.param;if (!_this.param)_this.param="";
    var masFunc; //массив функций
    var json1;
    var expand=0;
//1.3 dhx объекты
    var dhxLayout;
    var dhxLayoutT1;
    var dhxToolbar0;
    /*//1.1 инициализация параметров
    var t = iasufr.initForm(this, opt);
    //1.2 java переменные
    t.dok=opt.dok; if (!t.dok) return
    t.dokOpen=opt.dokOpen;
    t.dokOpenId=opt.dokOpenId;
    //1.3 dhx объекты
    var dhxLayout;
    var dhxGrid;
    var dhxToolbar;*/
//1.4 первая загрузка - json
    iasufr.ajax({
        url: "base.Simple.cls",
        data: {func: "init",idDoc:_this.idDoc,idLayout:"",param:JSON.stringify(_this.param)},
        success: function (data) {//alert(data);
            json1 = JSON.parse(data);

            //---------------------2.1 описание Layout ----------------
            dhxLayout = new dhtmlXLayoutObject(_this.owner, "1C");

            dhxLayout.cells("a").setWidth("*");
            dhxLayout.cells("a").hideHeader();
            //---------------------2.2 описание TOOLBAR ----------------
            masFunc=json1.func;

            dhxToolbar0= dhxLayout.cells("a").attachToolbar(json1.button[0]);
            dhxToolbar0.setIconSize(32);
            dhxToolbar0.attachEvent("onClick", onToolbarClick);
            //---------------------2.3 описание dhx объектов,events ---------
            //////////////////////////TREE GRID//////////////////////////
            dhxLayoutT1=dhxLayout.cells("a").attachGrid();
            dhxLayoutT1.enableDragAndDrop(true);
            dhxLayoutT1.setDragBehavior("complex");
            dhxLayoutT1.enableTreeCellEdit(false);

            dhxLayoutT1.attachEvent("onCheck", function (rowId, cellInd, state) { //alert(rId+"="+cInd+"="+state)
                //показ измененной строки
                dhxLayoutT1.setRowTextStyle(rowId, iasufr.const.rowChangedCss);
                //массив измененных строк
                var numbIsChange=dhxLayoutT1.idCells.indexOf("isChangeRowTemp");if (numbIsChange==-1) return
                dhxLayoutT1.cells(rowId,numbIsChange).setValue(1);

            });

            dhxLayoutT1.attachEvent("onRowDblClicked", function(rowId,cellInd){
                var isFunc=dhxLayoutT1.isFunc[cellInd];
                if (dhxLayoutT1.isFunc[dhxLayoutT1.idCells.indexOf("idKeysRowTemp")]!=""){
                    isFunc=dhxLayoutT1.isFunc[dhxLayoutT1.idCells.indexOf("idKeysRowTemp")]
                };

                if ((isFunc!=null)&&(isFunc!="")){
                    var idBut1=isFunc,idBut2="";
                    if (isFunc.lastIndexOf(".")>-1){isFunc=isFunc.split(".");idBut1=isFunc[0],idBut2=isFunc[1]}
                    if (idBut1!="") onToolbarClick(idBut1,rowId)
                    if (idBut2!="") onToolbarClick(idBut2,rowId) //по обяз.параметрам не пропустит
                }
            });

            dhxLayoutT1.init();
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
            case "save":
                var isRow=0; if ((param[0]!=null)&&(param[0].idRekv=="isRowSave"))isRow=1;
                isSave(idBut,isRow);
                break;
            case "load":
                isLoad(idBut,idRowCheck);
                break;
            case "print":
                dhxLayoutT1.printView();
                break;
            case "delete":
                isDelete(idBut);
                break;
            case "close": iasufr.close(_this); break;
            case "expand" : { if (expand==1) {dhxLayoutT1.collapseAll(); expand=0; return }
                if (expand==0) { dhxLayoutT1.expandAll(); expand=1; return }
            }}
    }
    function initGrid(idLayout,isData) {
        var dhxGridInit; if (idLayout==null)idLayout="T1"
        var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        if (dhxGridInit){
            var idRowActiv=dhxGridInit.getSelectedRowId();
            iasufr.gridRowFocus(dhxGridInit, idRowActiv);
            if (dhxGridInit.type=="treeGrid")
                dhxGridInit.saveOpenStates("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
        }

        dhxGridInit.clearAll(true);


        if (isData==null){

            iasufr.ajax({
                url: "base.Simple.cls",
                data: {func: "init",idDoc:_this.idDoc,idLayout:idLayout,param:""},
                success: function (data) {//alert(data);
                    var json = JSON.parse(data);
                    initPropGrid(idLayout,json.data[0].prop);
                    dhxGridInit.parse(json.data[0].data, 'json');
                    initProp2Grid(idLayout);
                }
            })
        }
        else {
            initPropGrid(idLayout,isData.prop);
            dhxGridInit.parse(isData.data, 'json');
            initProp2Grid(idLayout);
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
        if (prop.text) {
            dhxLayout.cells("a").showHeader();
            dhxLayout.cells("a").setText(prop.text);}
        dhxGridInit.setInitWidths(prop.width);
        dhxGridInit.setColAlign(prop.align);
        dhxGridInit.attachHeader(prop.filtr);
        if (prop.itog1) dhxGridInit.attachHeader(prop.itog1);
        if (prop.itog2) dhxGridInit.attachHeader(prop.itog2);
        dhxGridInit.setColTypes(prop.types);
        var masType=prop.types.split("•")
        for (var i = 0; i < prop.idCells.length; i++){
            if (masType[i]=="edn")
                dhxGridInit.setNumberFormat("0,000.00",i,"."," ");
        }
        dhxGridInit.setDateFormat("%d/%m/%Y");
        dhxGridInit.setColSorting(prop.sort);
        dhxGridInit.setImagePath(iasufr.const.IMG_PATH);

        dhxGridInit.idLayout=prop.idLayout;
        dhxGridInit.type=prop.type;
        dhxGridInit.idCells=prop.idCells;
        dhxGridInit.idKeysRowTemp=prop.idKeysRowTemp;
        dhxGridInit.isFunc=prop.isFunc;

        if (prop.multiline) dhxGridInit.enableMultiline(true);

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

        dhxGridInit.expandAll();
        for (var i = 0; i < dhxGridInit.getRowsNum(); i++){
            dhxGridInit.setItemImage(dhxGridInit.getRowId(i), "/js/dhtmlxw/imgs/blank.gif","/js/dhtmlxw/imgs/blank.gif");
        } //for
        dhxGridInit.collapseAll();

        if (dhxGridInit.type=="treeGrid"){
            dhxGridInit.loadOpenStates("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
        }

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
            if (str2Obj!="") jsoDATA.push(str2Obj); //[12587,1587]
            return {param:jsoDATA}
        }
        if (isString==1) return str0Obj
        else             return JSON.parse("{"+str0Obj +"}")

    }
    ///////////////////////////////////////////////////
    //////////////////setParam////////////////////////
    function setParam(listParam,idRowCheck){
        if (!listParam) return
        var idObj,idLayout,val1,val2,isReq,name

        var dhxGridInit; //var numbLayout
        var idRow,numbCellIdKeys,numbIdKeys,strCell
        for (var numbObj = 0; numbObj < listParam.length; numbObj++){
            //описание
            idObj=listParam[numbObj].idRekv;
            idLayout=listParam[numbObj].idLayout;
            val1=listParam[numbObj].val;
            //получить val2
            if ((idLayout!="")){
                var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
                eval(str);

                if (dhxGridInit.type=="form"){
                    dhxGridInit.setItemValue(idObj, val1);
                }
                else if ((dhxGridInit.type=="grid")||(dhxGridInit.type=="treeGrid")){
                    idRow = dhxGridInit.getSelectedRowId(); if (idRowCheck!=null)idRow = idRowCheck;
                    if ((idRow==null)) return ""
                    dhxGridInit.cells(idRow).setValue(val1);
                }

            }
        }
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
        if (isRow==1) {i1= dhxGridInit.getRowIndex(dhxGridInit.getSelectedRowId()),i2=i1; if ((i1==null)||(i1==-1)) {i1=0; i2=-1;};}
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
    ///////////////////////////// 5.save,delete///////////////////////////////////
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
            data: {func: "save",idDoc:_this.idDoc,idLayout:"",idBut:idBut,param:JSON.stringify(param)},
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
                            dhxLayoutT1.cells(dhxLayoutT1.getRowId(i),isChangeRowTemp).setValue("0");
                        }
                    }
                }

            }

        });
    }
    function isDelete(idBut) {

        var numbBut; for (var numbObj = 0; numbObj < masFunc.length; numbObj++){
            if (masFunc[numbObj].id==idBut) {numbBut=numbObj;break;}
        }
        if ((numbBut==null) )return
        var paramBut=masFunc[numbBut].param;

        var idLayout=paramBut[0].idLayout;
        var dhxGridInit;
        var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        var mess=getParam(paramBut[1],"",null,1) ;
        var tt=mess;

        var param=[{idLayout:idLayout,idKeysRowTemp:dhxGridInit.idKeysRowTemp,data:getParamGrid(idLayout,1,1)}]
        var t=param;

        dhtmlx.confirm({
            text: "Видалити запис:"+mess,
            callback: function(result) {
                if (result) {
                    iasufr.ajax({
                        url: "base.Simple.cls",
                        data: {func: "save",idDoc:_this.idDoc,idLayout:"",idBut:idBut,param:JSON.stringify(param)},
                        success:  function() {
                            iasufr.messageSuccess("Запис видалено");
                            initGrid("T1");
                        }

                    });
                }
            }
        });

    }
    function isPrint(){
        var masW=dhxLayoutT2.width.split("•")
        for (var i = 0; i < dhxLayoutT2.idCells.length; i++){
            if (masW[i]=="0")
                dhxLayoutT2.setColumnHidden(i,true);
        }
    }


}
//@ sourceURL=http://base/base1c.js

