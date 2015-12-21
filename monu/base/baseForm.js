if (!window.base) base = {};
if (!base.Form) base.Form = {};

base.Form.Create = function(opt) {
//1.1 инициализация параметров
    var _this = iasufr.initForm(this, opt);

//1.2 java переменные
    _this.idDoc=opt.idDoc;
    _this.param=opt.param;if (!_this.param)_this.param="";
    _this.isCookie=opt.isCookie;if (!_this.isCookie)_this.isCookie="";
    if (_this.isCookie!=""){
        if (_this.param==""){
            _this.param=[];
            _this.param.push(_this.isCookie);
            _this.param.push([]);
        }
        var len=_this.isCookie.length;
        for (var numb=0; numb<_this.isCookie.length;numb ++){
            var id=_this.isCookie[numb];
            var val=iasufr.storeGet(_this.idDoc+"."+_this.isCookie[numb]); if (val==null)val="";
            _this.param[0].push(id);
            _this.param[1].push(val);
        }
    }

    _this.openId=opt.openId;if (!_this.openId)_this.openId="";
    var masFunc; //массив функций
    var json1;

//1.3 dhx объекты
    var dhxLayout;
    var dhxLayoutT1;
    var dhxToolbar0;

    //1.4 первая загрузка - json
    iasufr.ajax({
        url: "base.Simple.cls",
        data: {func: "init",idDoc:_this.idDoc,idLayout:"",param:JSON.stringify(_this.param),openId:_this.openId},
        success: function (data) {//alert(data);
            json1 = JSON.parse(data);

            //---------------------2.1 описание Layout ----------------
            dhxLayout = new dhtmlXLayoutObject(_this.owner, "1C");

            dhxLayout.cells("a").setWidth("*");
            dhxLayout.cells("a").hideHeader();
            if (json1.title!="") iasufr.setTitle(_this,json1.title)
            //---------------------2.2 описание TOOLBAR ----------------
            masFunc=json1.func;

            dhxToolbar0= dhxLayout.cells("a").attachToolbar(json1.button[0]);
            dhxToolbar0.setIconSize(16);
            dhxToolbar0.attachEvent("onClick", onToolbarClick);
            //---------------------2.3 описание dhx объектов,events ---------
            dhxLayoutT1= dhxLayout.cells("a").attachForm(json1.data[0].data);
            initPropForm("T1",json1.data[0]);
        }

    });

    ///////////////////////////////////////////////////////////////////
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

            case "save":
                var isRow=0; if ((param[0]!=null)&&(param[0].idRekv=="isRowSave"))isRow=1;
                isSave(idBut,isRow);
                break;
            case "load":
                isLoad(idBut,idRowCheck);
                break;
            case "close": iasufr.close(_this); break;
            }

    }
    //////////////////////////////////////////////////////////////////
    ////////////////////////////////////// 4.INIT,FOCUS//////////////////
    function initForm(idLayout,isData){
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);
        if (isData==null){
            iasufr.ajax({
                url: "base.Simple.cls",
                data: {func: "init",idDoc:_this.idDoc,idLayout:idLayout},
                success: function (data) {//alert(data);
                    var json = JSON.parse(data);
                    dhxLayoutT1.parse(json.data[0].data, 'json');
                    initPropForm(idLayout,json.data[0]);
                }
            })
        }
        else {
            dhxLayoutT1.parse(isData.data, 'json');
            initPropForm(idLayout,isData);

        }

    }
    function initPropForm(idLayout,prop) {
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);
        dhxFormInit.type =prop.type;
        dhxFormInit.idCells =prop.idCells;
        dhxFormInit.isNext =prop.isNext;
        dhxFormInit.idKeysRowTemp=prop.idKeysRowTemp;
        dhxFormInit.selector=prop.selector;
        dhxFormInit.isMany =prop.isMany;
        dhxFormInit.isReloadForm =prop.isReloadForm;
        dhxFormInit.isReloadGrid =prop.isReloadGrid;
        dhxFormInit.isEditor =prop.isEditor;

        dhxFormInit.attachEvent("onChange", function(idRekv, value, is_checked) {
            if (_this.isCookie.indexOf(idRekv)!="-1") {
                if (idRekv=="date1Zvit") value=iasufr.formatDateStr(dhxLayoutT1.getCalendar(idRekv).getDate(true));
                iasufr.storeSet(_this.idDoc+"."+idRekv, value);
            }

            if (dhxFormInit.selector[idRekv]) {
                isChange("T1",idRekv,value)
            }
            else {
                if (dhxFormInit.isReloadForm.indexOf(idRekv)!=-1)
                    initForm("T1");
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
                $($(dhxFormInit.getCombo(idRekv).DOMelem).children()[0]).on( "keydown", function(ev) {isKeyDown(ev,idRekv,idLayout);});
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
        //editor
        if (dhxFormInit.isEditor!="") {
            if (window.CKEDITOR) {
                BindCke(idRekv);
            } else {
                window.CKEDITOR_BASEPATH = "/js/ckeditor/";
                iasufr.loadScripts(["/js/ckeditor/ckeditor.js", "/js/ckeditor/uk.js"], BindCke);
            }
        }

        if (prop.isFocus!="") { if (dhxFormInit.getItemType(prop.isFocus)=="input") dhxFormInit.getInput(prop.isFocus).focus();}
    }
    function BindCke(idRekv){
        for (var numbIdCells = 0; numbIdCells < dhxLayoutT1.idCells.length; numbIdCells++) {
            var idRekv=dhxLayoutT1.idCells[numbIdCells]; if (idRekv=="") break;
            if (dhxLayoutT1.isEditor.indexOf(idRekv)!=-1){
                window.CKEDITOR.replace(dhxLayoutT1.getInput(idRekv), {
                    toolbar : 'Basic',
                    uiColor : '#b4cff4',
                    language: 'uk',
                    resize_enabled: false,
                    //width: "99%",
                    //height: ($(dhxLayoutT1.getInput(idRekv)).height()-60) + "px",
                    enterMode : window.CKEDITOR.ENTER_BR,
                    toolbar:[
                        { name: 'actions', items: ['Undo', 'Redo'] },
                        { name: 'basicstyles', items : [ 'FontSize', 'TextColor','BGColor', '-', 'Bold','Underline','Italic','-','Subscript','Superscript','Link','-','RemoveFormat' ] },
                        { name: 'paragraph',   items : [ 'JustifyLeft','JustifyCenter','JustifyRight','-', 'NumberedList','BulletedList'] },
                        { name: 'add', items: ['Table','HorizontalRule','PageBreak']},
                        { name: 'add2', items: ['ShowBlocks','Maximize']},
                        { name: 'src', items: ['Source']}]
                });
            }
        }

    }
    ////////////////////////////////////////////////////
    /*function isKeyDown(ev,id,idLayout){
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        if (ev.keyCode==13){

            var nextId=dhxFormInit.getItemsList()[dhxFormIni.getItemsList().indexOf(id)+1]; // dhxForm.getItemsList(dhxForm.colDef.indexOf(id));
            var nextType=dhxFormInit.getItemType(nextId)

            if (nextType=="input"){$(dhxFormInit.getInput(nextId)).focus();}
            if (nextType=="calendar"){$(dhxFormInit.getInput(nextId)).focus();}
            else if (nextType=="combo") {($(dhxFormInit.getCombo(nextId).DOMelem).children()[0]).focus();}
        }

    }*/
    function isKeyDown(ev,id,idLayout,value){
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);

        if (ev.keyCode==13){
            //зафиксировать изменения
            if (dhxFormInit.selector[id]) {
                isChange(idLayout,id,dhxFormInit.getFormData()[id])
            }
            //фокус
            var numb1=dhxFormInit.isNext.indexOf(id); if (numb1==-1) return
            var nextId=dhxFormInit.isNext[numb1+1]; if (nextId==undefined) return
            var nextType=dhxFormInit.getItemType(nextId)

            if (nextType=="input"){$(dhxFormInit.getInput(nextId)).focus(); return}
            if (nextType=="calendar"){$(dhxFormInit.getInput(nextId)).focus(); return}
            else if (nextType=="combo") {($(dhxFormInit.getCombo(nextId).DOMelem).children()[0]).focus(); return}
            else if (nextType=="select") {
                var t=dhxFormInit.getSelect(nextId).DOMelem;
                //dhxFormInit.getSelect(nextId).openSelect();
                return}
        }
    }
    function isChange(idLayout,idRekv,value){
        var dhxFormInit;
        var str="dhxFormInit=dhxLayout"+idLayout; //dhxLayoutObj[numbLayout]; //dhxLayoutObj[numbLayout]; //dhxGrid;
        eval(str);
        if ((value=="")||(value==null)||(value==undefined)) value="-";
        iasufr.ajax({
            url: "base.Simple.cls",
            data: {func: "init",idDoc:_this.idDoc,idLayout:idLayout,idRekv:idRekv,code:value,
                param:getParam(dhxFormInit.selector[idRekv].param,dhxFormInit.selector[idRekv].isParam),
                data:dhxFormInit.selector[idRekv].data
            },
            success: function (data) {
                isSelect(JSON.parse(data))
            }
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
            initForm("T1");
        //if (dhxFormInit.isReloadGrid[id]!=null) initGrid(idLayout);
    } //

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
                    if ((idRow==null)) return retError
                    if (isString!=1){
                        numbCellIdKeys=dhxGridInit.idCells.indexOf("idKeysRowTemp");
                        numbIdKeys=dhxGridInit.idKeysRowTemp.indexOf(idObj);
                        if (numbCellIdKeys==null) {alert("не вказан idKeysRowTemp ");return retError}
                        if (numbIdKeys==-1) {alert(idObj+ "не вказан у idKeysRowTemp :" +dhxGridInit.idKeysRowTemp);return retError}
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
            if (dhxLayoutT1.isEditor.indexOf(obj)!=-1) {
                if (window.CKEDITOR) {
                    val = window.CKEDITOR.instances[dhxLayoutT1.getInput(obj).id].getData();
                } else {
                    iasufr.showError("Не знайден ckeditor");
                }
            }
            if (val==null) val="";
            jsoDATA[1].push(val);
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

        var param=[{idLayout:"T1",idKeysRowTemp:dhxLayoutT1.idKeysRowTemp,data:getParamForm()}]
        iasufr.ajax({
            url: "base.Simple.cls",
            data: {func: "save",idDoc:_this.idDoc,idLayout:"",idBut:idBut,param:JSON.stringify(param)},
            success:  function(data) {
                var json = JSON.parse(data)
                if (json!="")setParam(json.param);
                iasufr.messageSuccess("Cбережено");
                var funcLast=masFunc[numbBut].funcLast;
                if (funcLast!="") onToolbarClick(funcLast);
                if (_this.onSave) _this.onSave();
            }
        });
    }

    return this;
}
//@ sourceURL=http://base/baseForm.js