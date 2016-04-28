if (!window.Seminar) Seminar = {};
if (!Seminar.Form) Seminar.Form = {};


Seminar.Form.Create = function(opt) {

    var t = iasufr.initForm(this, opt);

    var tb;
    tb = t.owner.attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(32);
    tb.addButton("add", 3, iasufr.lang.ui.add, "32/toolbar_add.png", "");
    tb.addButton("edit", 4, iasufr.lang.ui.edit, "32/toolbar_edit.png", "");
    tb.addButton("del", 5, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
    //tb.addButton("reload", 6, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
    tb.addSeparator("sep2", 7);
    tb.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);

    var g = t.owner.attachGrid();

    g.setHeader('Назва семінару,Дата початку,Дата закінчення,Почат. реєстр.,Кінець реєстр.,Статус');
     
    var winwidth = $(window).width(),
        othercol= 90,
        statuscol = 120,
        onecol,
        widths;

    if (winwidth<680){
       onecol = 300;
    } else if (winwidth<1100) {
       onecol = winwidth - (othercol*4) - 20;
    } else {
       onecol = 700;
    }

    widths = [onecol,othercol,othercol,othercol,othercol,statuscol];
    g.setInitWidths(widths.join(','));
    g.setColAlign("left,center,center,center,center,center");
    str = "#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter";
    g.attachHeader(str);
    g.setColTypes("ro,dhxCalendar,dhxCalendar,dhxCalendar,dhxCalendar,ro");
    g.setColSorting('str,date,date,date,date,str');
    g.setImagePath(iasufr.const.IMG_PATH);  
    g.setDateFormat("%d.%m.%Y");
    g.attachEvent("onRowSelect", onRowSelect);

    g.init();
    //iasufr.enableRowselectMode(g);
    this.grid = g;
    this.form = t;
     
    var k = 'regsmr' + new Date().getMonth().toString();
    iasufr.enableGridColumnWidthStore(g,k);
    RefreshGrid();

    /////////////////////////////////////////////////////////////////////////////////////////////////////


    function onRowSelect(id) {
       // if (id == 1) tb.disableItem("del");
       // else tb.enableItem("del");
    }


    function RefreshGrid(id) {
        iasufr.gridRowFocus(g, id);
        var data = {func: "SelectSe"};
        iasufr.ajax({url: "fin.Sem.cls", data: data, success: onAfterLoad });
    }


    function onAfterLoad(data) {
        g.clearAll();
        if (data) g.parse(JSON.parse(data), 'json');
        g.sortRows(1,"date","asc");
        g.setSortImgState(true, 1, "asc");
        iasufr.gridRowFocusApply(g);
    }


    function onToolbarClick(name) {
        switch (name) {
           // case "reload": RefreshGrid(); break;
            case "add": ShowAddForm(false); break;
            case "edit": ShowAddForm(true); break;
            case "del": DeleteRecord(); break;
            case "close": Close(); break;
        }
    }



    function ShowAddForm(isEdit){
        var selId = g.getSelectedId();
        if (!isEdit) selId = 0; 


        var w = iasufr.wins.createWindow("smr" + new Date().getTime().toString(), 0, 0, 650, 500);
        w.setText("Додавання семінару");
        w.setModal(true);
        w.centerOnScreen();
        var tbe = w.attachToolbar();

        tbe.setIconPath(iasufr.const.ICO_PATH);
        tbe.setIconSize(16);
        tbe.addButton("save", 1, iasufr.lang.ui.save, "16/tick.png", "");
        tbe.addButton("cancel", 2, iasufr.lang.ui.cancel, "16/cross.png", "");
        tbe.attachEvent("onClick", onEditToolbarClick);

        var items = [{type: "settings", position: "label-left", labelWidth: 130, inputWidth: 100, offsetLeft: 10, offsetTop: 10 }];

        var item = {type: "input", name: "name", label: "Назва семінару:"};
        item.required = true;
        item.inputWidth = 470;
        items.push(item);

        item = {type: "calendar", name: "datebegin", label: "Дата початку:", calendarPosition: "right", dateFormat: "%d.%m.%Y"},
        item.required = true;
        items.push(item);

        item = {type: "calendar", name: "dateend", label: "Дата закінчення:", calendarPosition: "right", dateFormat: "%d.%m.%Y"},
        item.required = true;
        items.push(item);

        item = {type: "calendar", name: "datebegreg", label: "Початок реєстрації:", calendarPosition: "right", dateFormat: "%d.%m.%Y"},
        item.required = true;
        items.push(item);

        item = {type: "calendar", name: "dateendreg", label: "Кінець реєстрації:", calendarPosition: "right", dateFormat: "%d.%m.%Y"},
        item.required = true;
        items.push(item);
  
        var frm = w.attachForm(items);
        w.setDimension(650, $(frm.base).height() + 74);
        w.centerOnScreen(); 
        $(frm.getInput("name")).focus();
        if (isEdit) LoadData();
      
        function onEditToolbarClick(name) {
            if (name == "cancel") w.close();
            if (name == "save") {
                if (!frm.validate()) return;
                var dataedit = [];
                dataedit[0] = frm.getItemValue("name");
                dataedit[1] = iasufr.formatDateStr(iasufr.formatDate(frm.getItemValue("datebegin")));
                dataedit[2] = iasufr.formatDateStr(iasufr.formatDate(frm.getItemValue("dateend")));
                dataedit[3] = iasufr.formatDateStr(iasufr.formatDate(frm.getItemValue("datebegreg")));
                dataedit[4] = iasufr.formatDateStr(iasufr.formatDate(frm.getItemValue("dateendreg")));
                iasufr.ajax({
                    url: "fin.Sem.cls",
                    data: {func: "EditSe", id: selId, data: JSON.stringify(dataedit)},
                    success: function (d) {
                        var id;
                        try{id=JSON.parse(d).Id} catch(e){}
                        RefreshGrid(id);
                        w.close()
                    }
                });
            }
        }


        function FillForm(obj) {
            frm.setItemValue("name", obj[0]);
            frm.setItemValue("datebegin", obj[1]);
            frm.setItemValue("dateend", obj[2]);
            frm.setItemValue("datebegreg", obj[3]);
            frm.setItemValue("dateendreg", obj[4]);
        }


        function LoadData() {
          t.owner.progressOn();
          //var selId = g.getSelectedId();
          iasufr.ajax({
              url: "fin.Sem.cls",
              data: {func: "GetSe", id: selId},
              success: function (d, obj) {
                t.owner.progressOff();
                FillForm(obj.json);
              },
              error: function() {t.owner.progressOff();}
          });
        }

    }

    function DeleteRecord() {
        var id = g.getSelectedRowId();
        if (!id) return;
        dhtmlx.confirm({
            text: iasufr.lang.msg.delete,
            callback: function(r) { if (r) iasufr.ajax({url: "fin.Sem.cls", data:{func:"DeleteSem", id: id}, success: RefreshGrid}); }
        });
    }



    function Close() {
        iasufr.close(t);
    }


    return this;
}
