if (!window.base) base = {};
if (!base.Layout2) base.Layout2 = {};

//форма | таблица
base.Layout2.Create = function (opt) {
//1.1 инициализация параметров
    var _this = iasufr.initForm(this, opt);

//1.2 java переменные
    _this.idDoc=opt.idDoc;
    _this.param=opt.param;      if (!_this.param)   _this.param="";
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
    };

    var masFunc; //массив функций
    var json1;
    var expand=0;
    var isCheck=0;
//1.3 dhx объекты
    var dhxLayout;
    var dhxLayoutT1;
    var dhxLayoutT2;
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
            dhxLayoutT2=dhxLayout.cells(nameGrid).attachGrid();
            dhxLayoutT2.enableDragAndDrop(true);
            dhxLayoutT2.setDragBehavior("complex");


            dhxLayoutT2.attachEvent("onCheck", function (rowId, cellInd, state) { //alert(rId+"="+cInd+"="+state)
                //показ измененной строки
                dhxLayoutT2.setRowTextStyle(rowId, iasufr.const.rowChangedCss);
                //массив измененных строк
                var numbIsChange=dhxLayoutT2.idCells.indexOf("isChangeRowTemp");if (numbIsChange==-1) return
                dhxLayoutT2.cells(rowId,numbIsChange).setValue(1);

            });
            dhxLayoutT2.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
                if ((stage==2)&&(nValue!=oValue)) {
                    //массив измененных строк
                    var numbIsChange=dhxLayoutT2.idCells.indexOf("isChangeRowTemp");if (numbIsChange==-1) return
                    dhxLayoutT2.cells(rowId,numbIsChange).setValue(1);
                }
                    // iasufr.enableAskBeforClose(t);  return true
                return true
            });
            dhxLayoutT2.attachEvent("onRowDblClicked", function(rowId,cellInd){

                var isFunc=dhxLayoutT2.isFunc[cellInd];
                if (dhxLayoutT2.isFunc[dhxLayoutT2.idCells.indexOf("idKeysRowTemp")]!=""){
                    isFunc=dhxLayoutT2.isFunc[dhxLayoutT2.idCells.indexOf("idKeysRowTemp")]
                };

                if ((isFunc!=null)&&(isFunc!="")){
                    var idBut1=isFunc,idBut2="",idBut3="";
                    var cellId=dhxLayoutT2.idCells[cellInd];
                    if (isFunc.lastIndexOf(".")>-1){isFunc=isFunc.split(".");idBut1=isFunc[0],idBut2=isFunc[1]; if (isFunc[2]!=undefined)idBut3=isFunc[2]}
                    if (idBut1!="") {onToolbarClick(idBut1,rowId,cellId);return false}
                    if (idBut2!="") {onToolbarClick(idBut2,rowId,cellId);return false} //по обяз.параметрам не пропустит
                    if (idBut3!="") {onToolbarClick(idBut3,rowId,cellId);return false}
                }
                var masType=dhxLayoutT2.types.split("•");
                var t=masType[cellInd];
                if (masType[cellInd]=="ed") return true
                return false
            });


            dhxLayoutT2.attachEvent("onDrop", function(id1,id2){
                //alert(id1+"/"+id2)
                dhtmlx.confirm({
                    text: "Зберегти змiни",
                    callback: function(result) {
                        if (result) {
                            onToolbarClick("changePos");
                            initGrid("T2");
                            }
                        }
                });
            });
            dhxLayoutT2.attachEvent("onHeaderClick", function(ind,obj){
                if (dhxLayoutT2.idCells[ind]=="isCHECK") {
                    if (isCheck==0){isCheck=1;dhxLayoutT2.setColLabel(ind,"img:[/images/imgs/iconCheckGray.gif]");}
                    else {isCheck=0;dhxLayoutT2.setColLabel(ind,"img:[/images/imgs/iconUncheckAll.gif]");}
                    for (var i = 0; i <= dhxLayoutT2.getRowsNum()-1; i++){
                        dhxLayoutT2.cells2(i,ind).setValue(isCheck);
                    } //for

                    return false
                }
                return true
            });

            dhxLayoutT2.init();
            initGrid("T2",json1.data[1]);
        } //success
    }); //ajax

    //////////////////////////////////////////////////////////////////
    //////////////////////////onToolbarClick//////////////////////////
    function onToolbarClick(idBut,idRowCheck,idCellCheck) {
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
            case "changePos":
                isSave(idBut);break;
            case "save":
                var isRow=0; if ((param[0]!=null)&&(param[0].idRekv=="isRowSave"))isRow=1;
                isSave(idBut,isRow);
                break;
            case "load":
                isLoad(idBut,idRowCheck,idCellCheck);
                break;
            case "print":
                dhxLayoutT2.printView();
                break;
            case "delete":
                isDelete(idBut);
                break;
            case "addStr":{}
                break;
            case "close": iasufr.close(_this); break;
            case "expand" : { if (expand==1) {dhxLayoutT2.collapseAll(); expand=0; return }
                if (expand==0) { dhxLayoutT2.expandAll(); expand=1; return }
            }}

    }
    //////////////////////////////////////////////////////////////////
    ////////////////////////////////////// 4.INIT,FOCUS///////////////
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
        dhxFormInit.isChangeNow =0;
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
                    //searchUrl: "base.Simple.cls?func=init&code=%txt%&idDoc="+_this.idDoc+"&idLayout="+idLayout+"&idRekv="+idRekv+"&param="+param2Sel
                }
                var param2Sel=getParam(dhxFormInit.selector[idRekv].param,dhxFormInit.selector[idRekv].isParam)
                $.extend(param1Sel, param2Sel);
                iasufr.attachSelector(dhxFormInit.getInput(idRekv),dhxFormInit.selector[idRekv].javaObj,param1Sel)
            }
        }
    }
    function initGrid(idLayout,isData) {
        if (idLayout==null) idLayout="T2"; //после сохр, временно,т.к. нужен id
        var dhxGridInit;
        var str="dhxGridInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        if (dhxGridInit){
            var idRowActiv=dhxGridInit.getSelectedRowId();
            iasufr.gridRowFocus(dhxGridInit, idRowActiv);
            if (dhxGridInit.type=="treeGrid")
                dhxGridInit.saveOpenStates("idDoc:"+_this.idDoc+",idLayout:"+idLayout)
        }

        dhxGridInit.clearAll(true);


        if (isData==null){
            var paramFiltrs=getParamForm();

            iasufr.ajax({
                url: "base.Simple.cls",
                data: {func: "init",idDoc:_this.idDoc,idLayout:idLayout,param:JSON.stringify(paramFiltrs)},
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


        dhxGridInit.setDelimiter("•");
        dhxGridInit.setHeader(prop.head1);

        if (prop.head2)dhxGridInit.attachHeader(prop.head2);
        if (prop.head3)dhxGridInit.attachHeader(prop.head3);
        if (prop.head4)dhxGridInit.attachHeader(prop.head4);
        if (prop.text) {
            dhxLayout.cells("c").showHeader();
            dhxLayout.cells("c").setText(prop.text);}

        dhxGridInit.setInitWidths(prop.width);
        dhxGridInit.setColAlign(prop.align);
        dhxGridInit.attachHeader(prop.filtr);
        if (prop.itog1) dhxGridInit.attachFooter(prop.itog1);
        if (prop.itog2) dhxGridInit.attachFooter(prop.itog2);


        dhxGridInit.enableTreeCellEdit(dhxGridInit.isEdit);

        dhxGridInit.setColTypes(prop.types);
        var masType=prop.types.split("•");
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
        dhxGridInit.types=prop.types;
        dhxGridInit.idKeysRowTemp=prop.idKeysRowTemp;
        dhxGridInit.style=prop.style;
        dhxGridInit.isFunc=prop.isFunc;
        dhxGridInit.isEdit=prop.isEdit;


        //dhxGridInit.enableColumnMove(true,"false,true,true,true,true,true");
        //dhxGridInit.enableCollSpan(true);
        if (prop.multiline==1) dhxGridInit.enableMultiline(true);
        //if (prop.isImg==1)     dhxGridInit.enableHeaderImages(true); - не нужно - ошибки (в справ-ке и не было)

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

        if (dhxGridInit.type=="treeGrid") {
            dhxGridInit.expandAll();
        }


        var numbCellIdKeys=dhxGridInit.idCells.indexOf("idKeysRowTemp");
        var style=dhxGridInit.style;
        var isImgTree=0;
        if ((style=="")&&(dhxGridInit.type=="treeGrid")) {style=["img"];isImgTree="/js/dhtmlxw/imgs/blank.gif"}
        var countStyle=style.length;
        var t=JSON.stringify(style).lastIndexOf("colspan");
        if (JSON.stringify(style).lastIndexOf("colspan")>-1){
            dhxGridInit.enableColSpan(true);}
        var styleI,data,json;

        if (style!="") for (var i = 0; i < dhxGridInit.getRowsNum(); i++){
            var idRow=dhxGridInit.getRowId(i);
            data=dhxGridInit.cells2(i,numbCellIdKeys).getValue();
            if (data!=""){
                json=JSON.parse(data);
                if (!json[1]){if (isImgTree!=0)dhxGridInit.setItemImage(idRow, isImgTree)}
                else{
                    for (var j = 0; j < countStyle; j++){
                        styleI=style[j].split("/");
                        //по ячейкам
                        if (json[1][j]!=""){
                            if (styleI[1]!=null){
                                switch (styleI[0]) {
                                    case "style":{
                                        dhxGridInit.setCellTextStyle(idRow,styleI[1],json[1][j]);
                                        break;
                                    }
                                    case "rowspan": {
                                        dhxGridInit.setRowspan(dhxGridInit.getRowId(i+1), styleI[1],json[1][j]);
                                        break;
                                    }
                                    case "colspan": {
                                        dhxGridInit.setColspan(dhxGridInit.getRowId(i+1), styleI[1],json[1][j]);
                                        break;
                                    }
                                }

                            }
                            else{
                                switch (style[j]) {
                                    case "style":{
                                        dhxGridInit.setRowTextStyle(dhxGridInit.getRowId(i), json[1][j]);
                                        break;
                                    }
                                    case "img":  {
                                        dhxGridInit.setItemImage(dhxGridInit.getRowId(i), iasufr.const.ICO_PATH + json[1][j]);
                                        break;
                                    }
                                }//switch
                            } //if (json[1][j]=="")
                        }
                    } //for
                } //else json[1]!=""
            } //if data!=""

        } //for


        if (dhxGridInit.type=="treeGrid") {
            dhxGridInit.collapseAll();
            dhxGridInit.loadOpenStates("idDoc:"+_this.idDoc+",idLayout:"+idLayout)
        }

        /*
         / так можно установить новые кукисы или переписать значения у уже существующих:
         $.cookie('cookie_name', 'cookie_value');

         // получить значение существующих кукисов можно так:
         $.cookie('cookie_name');
         // если запрашиваемых кукисов не существует, то эта функция вернет null

         // а так можно удалить кукисы
         $.cookie('cookie_name', null);
----------------------
         http://docs.dhtmlx.com/grid__basic_operations.html
         ------------------
         mygrid.sortRows(0,"str","des");
         mygrid.setColSorting("int,str,date,na,sortingFunction")
         -------------------
         <a href="javascript:void(0)" onClick="tree.saveOpenStates()">Save open state</a><br>
         <a href="javascript:void(0)" onClick="tree.loadOpenStates()">Restore open state</a><br>
         --------------------
         mygrid.setFiltrationLevel(this.value)"
         ------------------------
         mygrid.setRowColor(mixed row_id,"red");
         mygrid.setRowExcellType(mixed row_id,"ra_str");
         ------------------------
         mygrid.setRowId(0,"new_row_id");
---------------------
         mygrid.setDelimiter(";");
         mygrid.setHeader("First Column;Second Column;Third Column");
-----------------------
         mygrid.setCustomSorting(sort_custom,1);
         ...
         function sort_custom(a,b,order){
         var n=a.length;
         var m=b.length;
         if(order=="asc")
         return n>m?1:-1;
         else
         return n<m?1:-1;
--------------------------
         //set the min width of the first column
         mygrid.setColumnMinWidth(50,0);
         }

         mygrid.setHeader(
         "A,B,C",
         null,
         ["text-align:right;","text-align:left;","text-align:center"]
         );
         //or
         mygrid.setHeader("<div style='width:100%; text-align:left;'>A</div>,B,C");

         -------------
         mygrid.setColumnIds("title,year");
         getColumnId(0);

         http://docs.dhtmlx.com/grid__math.html
         ----
         http://docs.dhtmlx.com/grid__statistics_counter.html
         -------------
         http://docs.dhtmlx.com/grid__filtering.html

         http://docs.dhtmlx.com/grid__searching.html
         ---------------
         mygrid.setColumnColor("white,#d5f1ff,#d5f1ff");
         ------------------------
         numeric_filter - a text filter that allows using comparison operators in it. Retrieves values which contain mask defined through text field.
         The possible comparison operators are:
         '=' - equal to;
         '>' - greater than;
         '<' - less than;
         '?' - less or equal to;
         '>=' - greater or equal to;
         'n1..n2' - a range of values.
         */

        //img tree
        //dhxGridInit.groupBy(dhxGridInit.idCells.indexOf("idKeysRowTemp"));




    }
    ///////////////////////////////////////////////////
    //////////////////getParam////////////////////////
    function getParam(listParam,isParam,idRowCheck,isString){
        //isString - строка из ячеек для удаления
        if (!listParam) return

        var str1Obj=[];
        var str2Obj=[];
        var str0Obj="";
        var idObj,idLayout,val1,val2,isReq,name,isArr,isDateStr,isName;

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
            isDateStr=listParam[numbObj].isDateStr; if (isDateStr==null) isDateStr=0;
            isName=listParam[numbObj].isName; if (isName==null) isName=0;
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
                    if (dhxGridInit.getItemType(idObj)=='calendar') {
                        val2=iasufr.formatDateStr(dhxGridInit.getCalendar(idObj).getDate(true));
                        if (isDateStr==1)val2=dhxGridInit.getCalendar(idObj).getDate(true);
                    };
                    if (dhxGridInit.selector[idObj]) {
                        val2=dhxGridInit.selector[idObj].id;
                        if (isName==1) val2=dhxGridInit.getFormData()[idObj];
                    }
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
                            strCell=JSON.parse(strCell);
                            val2=strCell[0][numbIdKeys]; if (val2==null) val2="";
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
            initForm(idLayout);
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
        if (dhxGridInit.type=="treeGrid") {
            dhxGridInit.saveOpenStates("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
            dhxGridInit.expandAll();}

        var jsoDATA = [];
        //1)1-ая строка - id
        jsoDATA.push(dhxGridInit.idCells); //ID,412...
        //2)2-ая строка - value

        var idI="";
        var json;
        var indRowEdit=0;
        var numbIsChange=dhxGridInit.idCells.indexOf("isChangeRowTemp"); //выбор из нижней таблицы
        var numbCellIdKeys=dhxGridInit.idCells.indexOf("idKeysRowTemp");
        var t=dhxGridInit.getSelectedRowId();
        var i1= 0,i2=dhxGridInit.getRowsNum()-1;
        var strCheck="";
        if (dhxGridInit.idCells.indexOf("isCHECK")>-1) {strCheck= dhxGridInit.getCheckedRows(dhxGridInit.idCells.indexOf("isCHECK"));}
        if (strCheck=="") strCheck=dhxGridInit.getSelectedRowId();
        strCheck=","+strCheck+",";
         var t2=dhxGridInit.getRowIndex(dhxGridInit.getSelectedRowId());
        var t=dhxGridInit.getSelectedRowId();

        if (isRow==1) {i1= dhxGridInit.getRowIndex(dhxGridInit.getSelectedRowId()),i2=i1; if ((i1==null)||(i1==-1)) {i1=0; i2=-1;};}

        for (var i = i1; i <= i2; i++) {
            var isCheck=strCheck.lastIndexOf(","+(i+1)+",");
            //if ((numbIsChange==-1)||(dhxGridInit.cells2(i, numbIsChange).getValue()==1)||((isDel!=null)&&(strCheck.indexOf(i)>-1))){
            if (((isDel==null)&&((numbIsChange==-1)||(dhxGridInit.cells2(i, numbIsChange).getValue()==1)))||((isDel!=null)&&(isCheck>-1))){
                indRowEdit=indRowEdit+1;
                jsoDATA.push([]);
                for (var j=0;j<dhxGridInit.getColumnsNum();j++){
                    var val=dhxGridInit.cells2(i,j).getValue();
                    if (val==null) val="";
                    if (j==numbCellIdKeys) {json=JSON.parse(val);val=json[0][0]+","+json[0][1]+","+json[0][2]+","+json[0][3]+","+json[0][4]}
                    jsoDATA[indRowEdit].push(val);
                }
            }
        }
        if (dhxGridInit.type=="treeGrid") {
            dhxGridInit.collapseAll();
            dhxGridInit.loadOpenStates("idDoc:"+_this.idDoc+",idLayout:"+idLayout);
        }
        return jsoDATA

    }
    ///////////////////////////// 5.save,delete///////////////////////////////////
    function isLoad(idBut,idRowCheck,idCellCheck)
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
        var paramLoadFunc={onSave:initGrid,openId:idCellCheck};
        $.extend(paramLoad, paramLoadFunc );
        iasufr.loadForm(javaObj, paramLoad);

    }

    function isSave(idBut,isRow){
        //из наименования номер ToolBar
        var numbBut; for (var numbObj = 0; numbObj < masFunc.length; numbObj++){
            if (masFunc[numbObj].id==idBut) {numbBut=numbObj;break;}
        }
        if ((numbBut==null) )return
        var tt=getParamGrid("T2",isRow);

        var param=[{idLayout:"T1",idKeysRowTemp:dhxLayoutT1.idKeysRowTemp,data:getParamForm()},{idLayout:"T2",idKeysRowTemp:dhxLayoutT2.idKeysRowTemp,data:getParamGrid("T2",isRow)}]
        iasufr.ajax({
            url: "base.Simple.cls",
            data: {func: "save",idDoc:_this.idDoc,idLayout:"",idBut:idBut,param:JSON.stringify(param)},
            success:  function(data) {
                if ((_this.idDoc!="ReqFormOrgReports")&&(_this.idDoc!="ReqFormTypeReports")){
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

        var param=[{idLayout:idLayout,idKeysRowTemp:dhxGridInit.idKeysRowTemp,data:getParamGrid(idLayout,0,1)}]
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
                            initGrid("T2");
                        }

                    });
                }
            }
        });

    }

}
//@ sourceURL=http://base/base2.js

