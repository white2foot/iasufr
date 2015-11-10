if (!window.Fin) Fin = {};
if (!Fin.Kved) Fin.Kved = {};


Fin.Kved.Create = function (opt) {
    var win = iasufr.initForm(this, opt);
    var CountRow = 1000;
    var toolbar;
    var gridK;
    var FlagChange=0;
    win.owner.progressOn();

    ////if (!opt.select )
     toolbar = win.owner.attachToolbar();   InitToolBar();

    gridK = win.owner.attachGrid();
    gridK.enableEditEvents(false, true, true);

    //для выбора кеква извне
    if (opt.select) { gridK.attachEvent("onRowSelect", function (id) { Sel(id) });   }
    function Sel(id) {
      var check = gridK.getCheckedRows(0);
            var selKved = ""; var idRow;
            if (id!="") selKved=gridK.cells(id, 1).getValue();
            for (var i = 0; i < gridK.getRowsNum(); i++) {
                idRow=gridK.getRowId(i);
                if ( (gridK.cells2(i, 0).getValue()==1)&&(id!=idRow) ) { if (selKved!="") selKved = selKved +',';
                                                        selKved=selKved + gridK.cells2(i, 1).getValue() ; }
            }
      opt.onSelect({kved:selKved});
      iasufr.close(win);
    }

    gridK.setImagePath(iasufr.const.IMG_PATH);
    gridK.setIconsPath(iasufr.const.ICO_PATH);
    gridK.setHeader(',Код Квед,Назва Квед,Дата початку,Дата закриття,,,Секцiя');
    gridK.setInitWidths('24,60,550,80,80,10,10,50');
    gridK.setColAlign('center,right,left,center,left,left,left,center');
    gridK.setColTypes("ch,ed,ed,ro,dhxCalendarA,ro,ro,ed");
    gridK.setColSorting('str,str,str,str,str,str,str,str');
    gridK.attachHeader("#rspan,#text_filter,#text_filter,#text_filter,#text_filter,#rspan,#rspan,#text_filter");
    gridK.enableEditTabOnly(true);
    gridK.init();
    if (opt.select) { //gridK.setColumnHidden(0,true);   //  спрятать чекбоксы
                      $(gridK.entBox).css("cursor", "pointer");
                      gridK.enableRowsHover(true, "grid-row-hover");   }

    gridK.setColumnHidden(5,true); gridK.setColumnHidden(6,true);
    LoadData();

    gridK.attachEvent("onEditCell", function (stage, rowId, cellInd, nValue, oValue) {
        if ((stage==2)&&( nValue!=oValue)) { FlagChange=1; gridK.cells(rowId,6).setValue(1);
                                             //alert(gridK.cells(rowId,4).getValue());
            //RowChange.push(rowId); for (var i = 0; i < RowChange.length; i++) {   }

                                       }
    return true
        });
    //gridK.attachEvent("onCellChanged", function(rId,cInd,nValue){ });

    function LoadData() {
    if (!opt.select) var dt = iasufr.formatDateStr(toolbar.getValue("dateNew"));
    else  { var dt=iasufr.formatDate(new Date()); dt = iasufr.formatDateStr(dt); }
    iasufr.ajax({url:'fin.Kved.cls', data: {func: "GetData", Date:dt}, success: function (data) {
         var jso = JSON.parse(data);
         gridK.parse(jso, 'json');

        var cnt = gridK.getRowsNum();
        if (cnt>0) { for (var i = 0; i < cnt; i++) {
            var bold=gridK.cells2(i,5).getValue();
            if (bold == 1)  gridK.setRowTextBold(gridK.getRowId(i));
            //$(grOrg.cells2(i, 1)).
        }}

        win.owner.progressOff();
    }
    });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        if (opt.select ) toolbar.addButton("select", 0, iasufr.lang.ui.select, "32/tick.png", "");
      else {
        toolbar.addButton("save", 1, "Зберегти", "32/database_save.png","");
        toolbar.addButton("print", 2, "Друк", "32/printer_empty.png", "");
        var add="32/toolbar_add.png";
        var del="32/toolbar_delete.png";
        toolbar.addButton("new", 3, "Додати Квед", add, "");
        toolbar.addButton("cut", 4, "Видалити Квед", del, "");
        toolbar.addButton("reload", 5, "Оновити", "32/arrow_rotate_anticlockwise.png", "");

        toolbar.addSeparator("sep1", 7);
        toolbar.addText("dateT", 8, "Дата");
        var dt = iasufr.formatDate(new Date());
        toolbar.addInput("dateNew", 10, dt,72);
        var cnd = new dhtmlXCalendarObject({input: toolbar.getInput("dateNew")});
        //cnd.attachEvent("onClick", func);
        cnd.hideTime();
        cnd.setDateFormat("%d.%m.%Y");
        toolbar.addSeparator("sep1", 11);
        toolbar.addButton("copy", 12, "Зробити копiю Квед", "32/database_go.png", "");  //
        toolbar.setItemToolTip("copy", "Можна зробити копiю довiдника з новоi дати");
      }
        toolbar.addButton("close", 13, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            if (id == 'select')   {  Sel("");  }
            if (id == 'save')   {  SaveKved();  }
            if (id == 'print')   { gridK.printView(); }
            if (id == 'reload')  { Reload(); }
            if (id == 'cut') {
                var check = gridK.getCheckedRows(0);
                if (!check) { dhtmlx.alert('Вкажiть строки для видалення !');   return }
                dhtmlx.confirm("Пiдтвердiть: видалити строки Квед ? ", function (result) {
                    if (result) {
                        var dateN = 0; // iasufr.formatDateStr(toolbar.getValue("dateNew"));
                        var json = {dateNew:dateN};
                        var RowCheck = [];
                        for (var i = 0; i < gridK.getRowsNum(); i++) {
                            if (gridK.cells2(i, 0).getValue()==1) {
                                var dn=iasufr.formatDateStr(gridK.cells2(i, 3).getValue());
                                RowCheck.push({Kod: gridK.cells2(i, 1).getValue(), Dn:dn });}
                        }
                        json = $.extend(json, {Row: RowCheck});
                        iasufr.ajax({url:'fin.Kved.cls', data: {func: "DelData", json: JSON.stringify(json)}, success:function(d) {
                            dhtmlx.message({text:"Видалено !",expire:800}); FlagChange=0;
                            Reload(); }
                        });

                    }
                })
            }
            if (id == 'new') {
                CountRow = CountRow +1;
                var idn = CountRow;
                gridK.addRow(idn, ['', '', '', '','','','',''], 0);
                window.setTimeout(function(){ gridK.selectCell(0,1,false,false,true,true); gridK.editCell() }, 1);

            }
            if (id == 'copy') { CopyKved();  }

            if (id == 'close') {
                if (FlagChange==1) {dhtmlx.confirm("Зберегти змiни ?", function (result) {
                                    if (result) {  SaveKved();  }
                                    else iasufr.close(win);
                                   } )}
                else iasufr.close(win)
            }


        }); // onClic
    }

    function CopyKved() {
        var w = iasufr.wins.createWindow("prn" + new Date().getTime().toString(), 0, 0, 370, 130);
        w.setText("Довiдник Квед");
        w.setModal(true);
        w.centerOnScreen();
        var formData = [
            { type:"calendar", name:"DateNew", required: true, label: "Зробити копiю на дату",
              dateFormat: '%d.%m.%Y', inputWidth:80, calendarPosition: 'right', offsetTop: 20  }
        ];
        var frm = w.attachForm(formData);

        var tb = w.attachToolbar();
        tb.setIconPath(iasufr.const.ICO_PATH);
        tb.setIconSize(16);
        tb.addButton("save", 1, "Зберегти", "16/tick.png", "");
        tb.attachEvent("onClick", function (name) {
                if (!frm.validate()) return;
                var date = iasufr.formatDateStr(frm.getCalendar("DateNew").getDate(true));
                if (name="save") {
                    iasufr.ajax({
                        url: "fin.Kved.cls",
                        data: {func: "Copy", json: JSON.stringify( {dateNew:date} )},
                        success: function() { win.owner.progressOff();  iasufr.messageSuccess("Збережено !"); FlagChange=0; w.close(); Reload();  },
                        error: function(){if (win.owner.progressOn) win.owner.progressOff()}
                    });
                }
        });
    }

    function Reload() { win.owner.progressOn(); gridK.clearAll(); LoadData(); }

    function SaveKved() {
        var dateN = iasufr.formatDateStr(toolbar.getValue("dateNew"));
        var json = {dateNew:dateN};
        var RowCh = []; var sec; var dk;
        for (var i = 0; i < gridK.getRowsNum(); i++) {
            if (gridK.cells2(i, 6).getValue()==1) { dk = gridK.cells2(i, 4).getValue();  sec = gridK.cells2(i, 7).getValue();
                                                    RowCh.push({Kod: gridK.cells2(i, 1).getValue(), Name: gridK.cells2(i, 2).getValue(), Dk:dk, Sec:sec });
            }
        }
        if (RowCh.length != 0) json = $.extend(json, {Row: RowCh});
        //alert(JSON.stringify(json));
        iasufr.ajax({
            url: "fin.Kved.cls",
            data: {func: "SaveData", json: JSON.stringify(json)},
            success: function() { win.owner.progressOff();  iasufr.messageSuccess("Збережено !"); FlagChange=0; Reload(); },
            error: function(){if (win.owner.progressOn) win.owner.progressOff()}
        });
    }


    return win;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/Kved.js