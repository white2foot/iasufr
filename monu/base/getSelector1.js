// ПОИСК по справочнику _this.idRekv...

if (!window.Selector) Selector = {};
if (!Selector.Find) Selector.Find = {};

Selector.Find.Create = function(opt) {
    //1.1 инициализация параметров
    var _this = iasufr.initForm(this, opt);
    //1.2 java переменные
    _this.idDoc=opt.idDoc;     if (!_this.idDoc) return
    _this.idLayout=opt.idLayout;if (!_this.idLayout) _this.idLayout="T1"
    _this.idRekv=opt.idRekv;   if (!_this.idRekv) return

    _this.title=opt.title;     if (_this.title) _this.owner.setText(_this.title);

    _this.isMany=opt.isMany;   if (!_this.isMany)  _this.isMany=0;
    _this.type=opt.type;       if (!_this.type)    _this.type=1;

    _this.data=opt.data;       if (!_this.data)_this.data=""; //список передается
    _this.id=opt.id;           if (!_this.id)  _this.id="";

    _this.param=opt.param;     if (!_this.param)  _this.param="";
    //1.3 dhx объекты
    var dhxLayout;
    var dhxLayoutT1;

    //---------------------2.1 описание Layout ----------------
    dhxLayout = new dhtmlXLayoutObject(_this.owner, "1c");
    dhxLayout.cells("a").hideHeader();

    //---------------------2.2 описание TOOLBAR ----------------
    if (_this.isMany==1){
        var dhxToolbar = dhxLayout.attachToolbar();
        dhxToolbar.setIconPath(iasufr.const.ICO_PATH);
        dhxToolbar.setIconSize(16);
        dhxToolbar.addButton("save", 1, "Обрати", "16/tick.png", "");
        dhxToolbar.addButton("close", 2, "Закрити", "16/door.png", "");
        dhxToolbar.attachEvent("onClick", onToolbarClick);
    }


    //---------------------2.3 описание dhx объектов,events -----
    dhxLayoutT1=dhxLayout.cells("a").attachGrid();
    _this.owner.progressOn();

    iasufr.ajax({ url:'base.Simple.cls', data:{func:'init',
            idDoc:_this.idDoc,idLayout:_this.idLayout,idRekv:_this.idRekv,isMany:_this.isMany,
            data:_this.data,id:_this.id,
            param:JSON.stringify(_this.param)},
        success: function (data) {
            var json = JSON.parse(data);
            var prop=json.data[0].prop;
            dhxLayoutT1.setDelimiter("•");
            dhxLayoutT1.setHeader(prop.head1);
            dhxLayoutT1.setInitWidths(prop.width);
            dhxLayoutT1.setColAlign(prop.align);
            dhxLayoutT1.attachHeader(prop.filtr);

            dhxLayoutT1.setColTypes(prop.types);
            dhxLayoutT1.setColSorting(prop.sort);
            dhxLayoutT1.type=prop.type;
            dhxLayoutT1.idCells=prop.idCells;
            dhxLayoutT1.idKeysRowTemp=prop.idKeysRowTemp;
            dhxLayoutT1.init();
            dhxLayoutT1.enableAutoHiddenColumnsSaving("idDoc:"+_this.idDoc+",idLayout:"+_this.idLayout+",idRekv:"+_this.idRekv);
            dhxLayoutT1.loadHiddenColumnsFromCookie("idDoc:"+_this.idDoc+",idLayout:"+_this.idLayout+",idRekv:"+_this.idRekv);
            dhxLayoutT1.enableAutoSizeSaving("idDoc:"+_this.idDoc+",idLayout:"+_this.idLayout+",idRekv:"+_this.idRekv);
            dhxLayoutT1.loadSizeFromCookie("idDoc:"+_this.idDoc+",idLayout:"+_this.idLayout+",idRekv:"+_this.idRekv);

            //dhxLayoutT1.enableAutoHeight(true,400);

            if (json.retMess!=""){
                dhtmlx.message({title: '', text: json.retMess, type: 'alert-error'});
            }
            dhxLayoutT1.parse(json.data[0].data, 'json');

            var indId=dhxLayoutT1.idCells.indexOf("idKeysRowTemp");
            var indName=dhxLayoutT1.idCells.indexOf("name");
            if (json.data[0].prop.type=="treeGrid") {

                dhxLayoutT1.expandAll();
                for (var i = 0; i < dhxLayoutT1.getRowsNum(); i++){
                    dhxLayoutT1.setItemImage(dhxLayoutT1.getRowId(i), "/js/dhtmlxw/imgs/blank.gif","/js/dhtmlxw/imgs/blank.gif");
                } //for
                dhxLayoutT1.collapseAll();
                dhxLayoutT1.loadOpenStates("idDoc:"+_this.idDoc+",idLayout:"+_this.idLayout+",idRekv:"+_this.idRekv);
            }
            if ((_this.isMany==1)) {
                var idRow;
                for (var i = 0; i < dhxLayoutT1.getRowsNum(); i++){
                    idRow=dhxLayoutT1.getRowId(i);
                    if (dhxLayoutT1.cells(idRow,indId).getValue()==-1){
                        dhxLayoutT1.setRowTextBold(idRow);
                        break;
                    }
                } //for
            }
            //focus
            iasufr.gridRowFocusApply(dhxLayoutT1);

            $(dhxLayoutT1.getFilterElement(indName)).focus();
            _this.owner.progressOff();

            $(dhxLayoutT1.entBox).css("cursor", "pointer");
            dhxLayoutT1.enableRowsHover(true, "grid-row-hover");

            if (_this.isMany==1) dhxLayoutT1.attachEvent("onCheck", function (rowId, cellInd, state) { //alert(rId+"="+cInd+"="+state)
                var indId=dhxLayoutT1.idCells.indexOf("idKeysRowTemp");
                var indCheck=dhxLayoutT1.idCells.indexOf("isCHECK");
                var id=dhxLayoutT1.cells(rowId,indId).getValue();
                if (id==-1) checkAll(dhxLayoutT1.cells(rowId,indCheck).getValue());
            });

            dhxLayoutT1.attachEvent('onRowSelect', function (id1)  {
	            var rowId=dhxLayoutT1.getSelectedId();

                var indId=dhxLayoutT1.idCells.indexOf("idKeysRowTemp");
                var indCheck=dhxLayoutT1.idCells.indexOf("isCHECK");
                var indCode=dhxLayoutT1.idCells.indexOf("code");
                var indName=dhxLayoutT1.idCells.indexOf("name");

                var id=dhxLayoutT1.cells(rowId,indId).getValue();
                if (_this.isMany==0){
                    if (dhxLayoutT1.type=="treeGrid") dhxLayoutT1.saveOpenStates("idDoc:"+_this.idDoc+",idLayout:"+_this.idLayout+",idRekv:"+_this.idRekv);
                    var code=""; if (indCode!=-1)code=dhxLayoutT1.cells(rowId,indCode).getValue();
                    var name=dhxLayoutT1.cells(rowId,indName).getValue();
                    if (_this.type==2) name= id + "   "+name;
                    if (_this.type==3) name= code + "   "+name;
                    if (_this.type==4) name= code;
                    if (_this.type==5) name= "("+id + ")   "+name;
                    if (_this.type==6) name= "("+code + ")   "+name;
                    if (opt.onSelect) { opt.onSelect({id:id,code:code,name:name,idDoc:_this.idDoc,idLayout:_this.idLayout,idRekv:_this.idRekv}); iasufr.close(_this); }
                }
                else if ((_this.isMany==1)&&(id==-1)){
                    var isCheckAll=dhxLayoutT1.cells(rowId,indCheck).getValue();
                    if (isCheckAll==0) checkAll(1);
                    else checkAll(0);

                }
                else if ((_this.isMany==1)&&(id!=-1)){
                    var isCheck=dhxLayoutT1.cells(rowId,indCheck).getValue();
                    if (isCheck==0)  dhxLayoutT1.cells(rowId,indCheck).setValue(1);
                    else             dhxLayoutT1.cells(rowId,indCheck).setValue(0);

                }
                });
        }

        });
    //////////////////////////////////////////////////////////////////
    //////////////////////////onToolbarClick//////////////////////////
    function onToolbarClick(name) {
        switch (name) {
            case "save":
                saveForm();
                break;
            case "close":
                if (dhxLayoutT1.type=="treeGrid") {
                    dhxLayoutT1.saveOpenStates("idDoc:"+_this.idDoc+",idLayout:"+_this.idLayout+",idRekv:"+_this.idRekv);
                }
                iasufr.close(_this);
                break;

        }
    }
    function checkAll(flag){
        var indCheck=dhxLayoutT1.idCells.indexOf("isCHECK");
        for (var i = 0; i <= dhxLayoutT1.getRowsNum(); i++){
            dhxLayoutT1.cells2(i,indCheck).setValue(flag);
        } //for
    }

    function saveForm(){
        if (dhxLayoutT1.type=="treeGrid") {
            dhxLayoutT1.saveOpenStates("idDoc:"+_this.idDoc+",idLayout:"+_this.idLayout+",idRekv:"+_this.idRekv);
        }

        var idRet="",codeRet="",nameRet="";
        var nameAll="";

        var indId=dhxLayoutT1.idCells.indexOf("idKeysRowTemp");
        var indCheck=dhxLayoutT1.idCells.indexOf("isCHECK");
        var indCode=dhxLayoutT1.idCells.indexOf("code");
        var indName=dhxLayoutT1.idCells.indexOf("name");

        var countCheck=0;
        var isComa="";
        var countT1=dhxLayoutT1.getRowsNum();
        var isAll=0;
        for (var i = 0; i <countT1; i++){
            var rowId=dhxLayoutT1.getRowId(i);
            var id=dhxLayoutT1.cells(rowId,indId).getValue();

            var isCheck=dhxLayoutT1.cells(rowId,indCheck).getValue();

            if ((isCheck==1)&&(id!=-1)) countCheck=countCheck+1;

            if (id==-1) {nameAll=dhxLayoutT1.cells(rowId,indCheck+1).getValue();nameAll=nameAll.replace("<b>",""),nameAll=nameAll.replace("</b>",""),nameAll=nameAll.replace("<B>",""),nameAll=nameAll.replace("</B>","")}
            //if ((id==-1) &&(isCheck==1)) isAll=1;
            if ((id!=-1) &&(isCheck==1)) {

                var code=""; if (indCode!=-1)code=dhxLayoutT1.cells(rowId,indCode).getValue();
                var name=dhxLayoutT1.cells(rowId,indName).getValue();
                if (_this.type==2) name= id + "   "+name;
                if (_this.type==3) name= code + "   "+name;
                if (_this.type==4) name= code;
                if (_this.type==5) name= "("+id + ")   "+name;
                if (_this.type==6) name= "("+code + ")   "+name;
                idRet=idRet+id+",";
                isComa="";if (countCheck>1) isComa=","
                if (countCheck==1){
                    codeRet=codeRet+isComa+code;
                    nameRet=nameRet+isComa+name;
                };

            }
        } //for
        if (countCheck<=1){}
        else{
            if ((countCheck==countT1-1)) { //((isAll==1)&&(countCheck==countT1))||((isAll==0)
                idRet=-1;codeRet="";nameRet=nameAll;
            }
            else{
                nameRet="Декiлька";
            }

        }

        if (opt.onSelect) { opt.onSelect({id:idRet,code:codeRet,name:nameRet,idDoc:_this.idDoc,idLayout:_this.idLayout,idRekv:_this.idRekv}); iasufr.close(_this); }
    }
    return _this;
};
//@ sourceURL=http://base/getSelector.js




                
     