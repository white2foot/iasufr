if (!window.base) base = {};
if (!base.Layout2Tab) base.Layout2Tab = {};

//форма | таблица
base.Layout2Tab.Create = function (opt) {
//1.1 инициализация параметров
    var _this = iasufr.initForm(this, opt);

//1.2 java переменные
    _this.idDoc=opt.idDoc;
    _this.param=opt.param;if (!_this.param)_this.param="";
    _this.isCookie=opt.isCookie;if (!_this.isCookie)_this.isCookie="";
    if ((_this.param=="")&&(_this.isCookie!="")) {
        _this.param=[];
        _this.param.push(_this.isCookie);
        _this.param.push([]);
        var len=_this.isCookie.length;
        for (var numb=0; numb<_this.isCookie.length;numb ++){
            var val=iasufr.storeGet(_this.idDoc+"."+_this.isCookie[numb]);if (val==null)val="";
            _this.param[1].push(val);
        }
    }

    var masFunc; //массив функций
    var json1;
    var idLayoutActivTab=""; //activ tabbar
//1.3 dhx объекты
    var dhxLayout;
    var dhxLayoutT1; //form
    var dhxLayoutTab; //tabbar

    var dhxLayoutT2,dhxLayoutT3,dhxLayoutT4,dhxLayoutT5,dhxLayoutT6,dhxLayoutT7;//grid
    var dhxToolbar0;
    var nameBar,nameForm,nameGrid;
//1.4 первая загрузка - json
    iasufr.ajax({
        url: "base.Simple.cls",
        data: {func: "init",idDoc:_this.idDoc,idLayout:"",param:JSON.stringify(_this.param),atFirst:1},
        success: function (data) {//alert(data);
            json1 = JSON.parse(data);

            //---------------------2.1 описание Layout ----------------
            var type="2U"; if (json1.type.type!=null)type=json1.type.type;
            dhxLayout = new dhtmlXLayoutObject(_this.owner, type);
            var w1=200,h1="*",w2="*",h2="*";
            if (json1.type.w1!="") w1=json1.type.w1;
            if (json1.type.h1!="") h1=json1.type.h1;
            if (json1.type.w2!="") w2=json1.type.w2;
            if (json1.type.h2!="") w1=json1.type.h2;

            dhxLayout.cells("a").hideHeader();
            dhxLayout.cells("b").hideHeader();
            if (type=="3T"){
                dhxLayout.cells("c").hideHeader();
            }

            if (type=="3T"){
                dhxLayout.cells("a").setHeight(32);
                dhxLayout.cells("b").setWidth(w1);
                dhxLayout.cells("c").setWidth(w2);
                nameBar="a",nameForm="b",nameGrid="c"
            }
            else if (type=="2E"){
                dhxLayout.cells("a").setHeight(h1);
                dhxLayout.cells("b").setHeight(h2);
                nameBar="a",nameForm="a",nameGrid="b"
            }

            //---------------------2.2 описание TOOLBAR ----------------
            masFunc=json1.func;
            dhxToolbar0= dhxLayout.cells(nameBar).attachToolbar(json1.button[0]);
            dhxToolbar0.setIconSize(32);
            dhxToolbar0.attachEvent("onClick", onToolbarClick);

            //---------------------2.3 описание dhx объектов,events ---------
            //////////////////////////FORM///////////////////////////////
            dhxLayoutT1= dhxLayout.cells(nameForm).attachForm(json1.data[0].data);
            initPropForm("T1",json1.data[0]);
            //////////////////////////TREE GRID//////////////////////////
            initTab(json1);

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
                initGrid("T2");
                break;
            case "save":
                var isRow=0; if ((param[0]!=null)&&(param[0].idRekv=="isRowSave"))isRow=1;
                isSave(idBut,isRow);
                break;
            case "load":
                isLoad(idBut,idRowCheck);
                break;
            case "print":
                dhxLayoutT2.printView();
                break;
            case "delStr":{}
                break;
            case "addStr":{}
                break;
            case "close": iasufr.close(_this); break;
            case "expand" : { if (expand==1) {dhxLayoutT1.collapseAll(); expand=0; return }
                if (expand==0) { dhxLayoutT1.expandAll(); expand=1; return }
            }}

    }
    //////////////////////////////////////////////////////////////////
    ////////////////////////////////////// 4.INIT,FOCUS///////////////
    function initTab(json){
        dhxLayoutTab=dhxLayout.cells(nameGrid).attachTabbar("top");
        dhxLayoutTab.setImagePath(iasufr.const.IMG_PATH);
        dhxLayoutTab.setMargin("2");

        for (var numbLayout = 0; numbLayout <json.data.length; numbLayout++){
            if (json.data[numbLayout].type=="grid"){
                var name=""; if (json.data[numbLayout].prop!=null) {
                    name=json.data[numbLayout].prop.title;
                }
                var id=json.data[numbLayout].idLayout; if (id==null)id="T2";
                if ((json.data[numbLayout].prop!=null)||(id=="T2"))dhxLayoutTab.addTab(id, name, 200);
            }
        }
        if (idLayoutActivTab==""){idLayoutActivTab="T2";}
        if (dhxLayoutTab.cells(idLayoutActivTab)==null){idLayoutActivTab="T2";}
        dhxLayoutTab.setTabActive(idLayoutActivTab);

        if (dhxLayoutTab.cells("T2")){
            dhxLayoutT2 = dhxLayoutTab.cells("T2").attachGrid();
            dhxLayoutT2.enableDragAndDrop(true);dhxLayoutT2.setDragBehavior("complex");dhxLayoutT2.enableTreeCellEdit(false);

            dhxLayoutT2.attachEvent("onCheck", function (rowId, cellInd, state) { //alert(rId+"="+cInd+"="+state)
                dhxLayoutT2.setRowTextStyle(rowId, iasufr.const.rowChangedCss);
                var numbIsChange=dhxLayoutT2.idCells.indexOf("isChangeRowTemp");if (numbIsChange==-1) return
                dhxLayoutT2.cells(rowId,numbIsChange).setValue(1);

            });

            dhxLayoutT2.attachEvent("onRowDblClicked", function(rowId,cellInd){
                var isFunc=dhxLayoutT2.isFunc[cellInd];
                if (dhxLayoutT2.isFunc[dhxLayoutT2.idCells.indexOf("idKeysRowTemp")]!=""){
                    isFunc=dhxLayoutT2.isFunc[dhxLayoutT2.idCells.indexOf("idKeysRowTemp")]
                };

                if ((isFunc!=null)&&(isFunc!="")){
                    var idBut1=isFunc,idBut2="",idBut3="";
                    if (isFunc.lastIndexOf(".")>-1){isFunc=isFunc.split(".");idBut1=isFunc[0],idBut2=isFunc[1]; if (isFunc[2]!=undefined)idBut3=isFunc[2]}
                    if (idBut1!="") onToolbarClick(idBut1,rowId)
                    if (idBut2!="") onToolbarClick(idBut2,rowId) //по обяз.параметрам не пропустит
                    if (idBut3!="") onToolbarClick(idBut3,rowId)
                }
            });
            dhxLayoutT2.init();
        }


        if (dhxLayoutTab.cells("T3")){
            dhxLayoutT3 = dhxLayoutTab.cells("T3").attachGrid();
            dhxLayoutT3.enableDragAndDrop(true);dhxLayoutT3.setDragBehavior("complex");dhxLayoutT3.enableTreeCellEdit(false);
            dhxLayoutT3.init();
        }
        if (dhxLayoutTab.cells("T4")){
            dhxLayoutT4 = dhxLayoutTab.cells("T4").attachGrid();
            dhxLayoutT4.enableDragAndDrop(true);dhxLayoutT4.setDragBehavior("complex");dhxLayoutT4.enableTreeCellEdit(false);
            dhxLayoutT4.init();
        }

        var dhxGridInit;
        for (var numbLayout = 0; numbLayout <json.data.length; numbLayout++){
            if ((json.data[numbLayout].type=="grid")&&(json.data[numbLayout].prop!=null)){
                var idLayout=json.data[numbLayout].idLayout;
                var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
                eval(str);
                initPropGrid(idLayout,json.data[numbLayout].prop);
                dhxGridInit.parse(json.data[numbLayout].data, 'json');
                initProp2Grid(idLayout);


            }
        }

    }
    function initForm(idLayout,isData){
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);
        if (isData==null){
            var paramFiltrs=getParamForm();
            iasufr.ajax({
                url: "base.Simple.cls",
                data: {func: "init",idDoc:_this.idDoc,idLayout:idLayout,param:JSON.stringify(paramFiltrs)},
                success: function (data) {//alert(data);
                    var json = JSON.parse(data);
                    dhxLayoutT1= dhxLayout.cells(nameForm).attachForm(json.data[0].data);
                    initPropForm(idLayout,json.data[0]);
                }
            })
        }
        else {
            dhxLayoutT1= dhxLayout.cells(nameForm).attachForm(isData);
            initPropForm(idLayout,isData);
        }

    }
    function initPropForm(idLayout,prop) {
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);
        dhxFormInit.type =prop.type;
        dhxFormInit.idCells =prop.idCells;
        dhxFormInit.idKeysRowTemp=prop.idKeysRowTemp;
        dhxFormInit.selector=prop.selector;
        dhxFormInit.isMany =prop.isMany;
        dhxFormInit.isReloadForm =prop.isReloadForm;
        dhxFormInit.isReloadGrid =prop.isReloadGrid;

        dhxFormInit.attachEvent("onChange", function(idRekv, value, is_checked) {
            if (_this.isCookie.indexOf(idRekv)!="-1") {
                if (idRekv=="date1Zvit") value=iasufr.formatDateStr(dhxLayoutT1.getCalendar(idRekv).getDate(true));
                iasufr.storeSet(_this.idDoc+"."+idRekv, value);
            }

            if (dhxFormInit.selector[idRekv]) {
                isChange(idLayout,idRekv,value)
            }
            else {
                if (dhxFormInit.isReloadForm.indexOf(idRekv)!=-1)
                    initForm("T1");
                if (dhxFormInit.isReloadGrid.indexOf(idRekv)!=-1)
                    initGrid("T2");
            }
        });

        dhxFormInit.attachEvent("onKeyDown",function(inp, ev, id){
            isKeyDown(ev,id,idLayout)});

        for (var numbIdCells = 0; numbIdCells < dhxFormInit.idCells.length; numbIdCells++) {
            var idRekv=dhxFormInit.idCells[numbIdCells]; if (idRekv=="") break;
            //combo - поиск
            //и enter
            if (dhxFormInit.getItemType(idRekv)=='combo') {
                dhxFormInit.getCombo(idRekv).enableFilteringMode('between');
                //$($(dhxFormInit.getCombo(idRekv).DOMelem).children()[0]).on( "keydown", function(ev) {isKeyDown(ev,idRekv,idLayout);});
            };

            //Selector добавить
            if (dhxFormInit.selector[idRekv]) {
                var isMany=0; if (dhxFormInit.isMany[idRekv]) {isMany=1;}
                var param1Sel={onSelect: isSelect,idDoc:_this.idDoc,idLayout:idLayout,idRekv:idRekv,isMany:isMany,codeAdd:1,
                    data:dhxFormInit.selector[idRekv].data,
                    id:dhxFormInit.selector[idRekv].id,
                    type:dhxFormInit.selector[idRekv].type
                }
                var param2Sel=getParam(dhxFormInit.selector[idRekv].param,dhxFormInit.selector[idRekv].isParam)
                $.extend(param1Sel, param2Sel);
                iasufr.attachSelector(dhxFormInit.getInput(idRekv),dhxFormInit.selector[idRekv].javaObj,param1Sel)
            }
        }
    }
    function initGrid(idLayout,isData) {
        idLayoutActivTab=dhxLayoutTab.getActiveTab();;

        for (var numbLayout = 2; numbLayout <=7; numbLayout++){
            var str="dhxGridInit=dhxLayoutT"+numbLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
            eval(str);
            if ((dhxGridInit!=null)&&(dhxGridInit!=undefined)){
                iasufr.gridRowFocus(dhxGridInit, dhxGridInit.getSelectedRowId());
                if (dhxGridInit.type=="treeGrid")dhxGridInit.saveOpenStates("idDoc:"+_this.idDoc+",idLayout:T"+numbLayout)
                dhxGridInit.clearAll(true);
            }
        }

        var paramFiltrs=getParamForm();
        iasufr.ajax({
                url: "base.Simple.cls",
                data: {func: "init",idDoc:_this.idDoc,idLayout:"",param:JSON.stringify(paramFiltrs)},
                success: function (data) {//alert(data);
                    var json = JSON.parse(data);
                    initTab(json);
                }
            })

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
        if (prop.head3)dhxGridInit.attachHeader(prop.head3);
        if (prop.head4)dhxGridInit.attachHeader(prop.head4);
        dhxGridInit.setInitWidths(prop.width);
        dhxGridInit.setColAlign(prop.align);
        dhxGridInit.attachHeader(prop.filtr);
        if (prop.itog1) dhxGridInit.attachFooter(prop.itog1);
        if (prop.itog2) dhxGridInit.attachFooter(prop.itog2);

        dhxGridInit.setColTypes(prop.types);
        var masType=prop.types.split("•")
        var masPType=prop.ptypes.split("•")
        for (var i = 0; i < prop.idCells.length; i++){
            if ((masType[i]=="edn")&&(masPType[i]!=""))
                dhxGridInit.setNumberFormat(masPType[i],i,"."," ");
        }
        dhxGridInit.setColSorting(prop.sort);
        dhxGridInit.setImagePath(iasufr.const.IMG_PATH);

        dhxGridInit.idLayout=prop.idLayout;
        dhxGridInit.type=prop.type;
        dhxGridInit.idCells=prop.idCells;
        dhxGridInit.idKeysRowTemp=prop.idKeysRowTemp;
        dhxGridInit.isFunc=prop.isFunc;

        dhxGridInit.init();

        //dhxGridInit.enableStableSorting(true);

        dhxGridInit.enableHeaderMenu(prop.isMenu);
        dhxGridInit.enableAutoHiddenColumnsSaving("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
        dhxGridInit.loadHiddenColumnsFromCookie("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
        dhxGridInit.enableAutoSizeSaving("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
        dhxGridInit.loadSizeFromCookie("idDoc:"+_this.idDoc+",idLayout:"+idLayout);

        //dhxGridInit.setColumnHidden(dhxGridInit.idCells.indexOf("idKeysRowTemp"),true);

    }
    function initProp2Grid(idLayout){


        var dhxGridInit;
        var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        //focus
        iasufr.gridRowFocusApply(dhxGridInit);
        var t=dhxGridInit.getRowsNum();
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
    ////////////////////////////////////////////////////
    function isKeyDown(ev,id,idLayout,value){
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        if (ev.keyCode==13){
            if (dhxFormInit.selector[id]) {
                isChange(idLayout,id,dhxFormInit.getFormData()[id])
            }
        }
    }



    function isChange(idLayout,idRekv,value){
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);
        if ((value=="")||(value==null)||(value==undefined)) value="-";
        if (dhxFormInit.isChangeNow==1) return
        dhxFormInit.isChangeNow=1
        iasufr.ajax({
            url: "base.Simple.cls",
            data: {func: "init",idDoc:_this.idDoc,idLayout:idLayout,idRekv:idRekv,code:value,
                param:getParam(dhxFormInit.selector[idRekv].param,dhxFormInit.selector[idRekv].isParam),
                data:dhxFormInit.selector[idRekv].data
            },
            success: function (data) {
                isSelect(JSON.parse(data))
                dhxFormInit.isChangeNow=0;
            }
            //error:function{dhxFormInit.isChangeNow=0}
        })

    }
    /*function isKeyDown(ev,id,idLayout){
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        if (ev.keyCode==13){
            var tt=dhxFormInit.getItemsList();
            var t=dhxFormInit.getItemsList().indexOf(id)+1;
            var nextId=dhxFormInit.getItemsList()[dhxFormInit.getItemsList().indexOf(id)+1]; // dhxForm.getItemsList(dhxForm.colDef.indexOf(id));
            var nextType=dhxFormInit.getItemType(nextId)

            if (nextType=="input"){$(dhxFormInit.getInput(nextId)).focus();}
            else if (nextType=="calendar"){$(dhxFormInit.getInput(nextId)).focus();}
            else if (nextType=="combo") {($(dhxFormInit.getCombo(nextId).DOMelem).children()[0]).focus();}
        }

    }*/

    function isSelect(o, $txt)   {
        if (!o) return
        var idDoc="",idLayout="",idRekv="",id="",name="";
        if (o) {idDoc=o.idDoc;idLayout=o.idLayout;idRekv= o.idRekv;id= o.id;name= o.name}
        if (idRekv=="") return

        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout;
        eval(str);

        dhxFormInit.selector[idRekv].id=id;
        //$txt.val(name);
        dhxLayoutT1.setItemValue(idRekv, name);

        var isMany=0; if (dhxFormInit.isMany[idRekv]) {isMany=1;}
        var param1Sel={onSelect: isSelect,idDoc:_this.idDoc,idLayout:idLayout,idRekv:idRekv,isMany:isMany,codeAdd:1,
            data:dhxFormInit.selector[idRekv].data,
            id:id,
            type:dhxFormInit.selector[idRekv].type
        }
        var param2Sel=getParam(dhxFormInit.selector[idRekv].param,dhxFormInit.selector[idRekv].isParam)
        $.extend(param1Sel, param2Sel);

        iasufr.updateSelectorParam(dhxFormInit.getInput(idRekv),param1Sel);

        if (_this.isCookie.indexOf(idRekv)!="-1") {
            iasufr.storeSet(_this.idDoc+"."+idRekv, id);
        }

        if (dhxFormInit.isReloadForm.indexOf(idRekv)!=-1)
            initForm("T1");
        if (dhxFormInit.isReloadGrid.indexOf(idRekv)!=-1)
            initGrid("T2");
    } //
    ////////////////////////////////////////////////////


    function getParamForm(){
        var jsoDATA = [];
        //1)1-ая строка - id
        jsoDATA.push(dhxLayoutT1.idCells); //ID,412...
        //2)2-ая строка - value
        jsoDATA.push([]);
        var formData=dhxLayoutT1.getFormData();

        var obj="";
        for (var i = 0; i < dhxLayoutT1.idCells.length; i++) {
            var obj=dhxLayoutT1.idCells[i]; if (obj=="") break;
            var val=formData[obj];
            if (dhxLayoutT1.getItemType(obj)=='calendar') {val=iasufr.formatDateStr(dhxLayoutT1.getCalendar(obj).getDate(true));};
            if (dhxLayoutT1.selector[obj]) {val=dhxLayoutT1.selector[obj].id;}
            if (val==null) val="";

            jsoDATA[1].push(val);
        }
        return jsoDATA

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
        var numbIsChange=dhxGridInit.idCells.indexOf("isChangeRowTemp");
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

        var param=[{idLayout:"T1",idKeysRowTemp:dhxLayoutT1.idKeysRowTemp,data:getParamForm()},{idLayout:"T2",idKeysRowTemp:dhxLayoutT2.idKeysRowTemp,data:getParamGrid("T2",isRow)}]
        iasufr.ajax({
            url: "base.Simple.cls",
            data: {func: "save",idDoc:_this.idDoc,idLayout:"",idBut:idBut,param:JSON.stringify(param)},
            success:  function(data) {
                if (_this.idDoc!="ReqFormOrgReports"){
                    var json = JSON.parse(data)
                    if (json!="")setParam(json.param);
                }
                iasufr.messageSuccess("Cбережено");
                var funcLast=masFunc[numbBut].funcLast;
                if (funcLast!="") onToolbarClick(funcLast);
                else{
                    var isChangeRowTemp=dhxLayoutT2.idCells.indexOf("isChangeRowTemp");
                    if (isChangeRowTemp!=-1){
                        for (var i = 0; i < dhxLayoutT2.getRowsNum(); i++) {
                            dhxLayoutT2.setRowTextStyle(dhxLayoutT2.getRowId(i), "")
                            dhxLayoutT2.cells(dhxLayoutT2.getRowId(i),isChangeRowTemp).setValue("0");
                        }
                    }
                }

            }

        });
    }
    function isDelete(idBut) {
        var param=[{idLayout:"T2",idKeysRowTemp:dhxLayoutT2.idKeysRowTemp,data:getParamGrid("T2",1,1)}]

        dhtmlx.confirm({
            text: iasufr.lang.msg.delete,
            callback: function(result) {
                if (result) {
                    iasufr.ajax({
                        url: "base.Simple.cls",
                        data: {func: "save",idDoc:_this.idDoc,idLayout:"",idBut:idBut,param:JSON.stringify(param)},
                        success:  function() {
                            iasufr.messageSuccess("Запис видалено");
                            initGrid("T2");
                        }

                    });
                }
            }
        });

    }

}
//@ sourceURL=http://base/base2Tab.js

