if (!window.SmrSelect) SmrSelect = {};
if (!SmrSelect.Form) SmrSelect.Form = {};

SmrSelect.Form.Create = function(opt) {
    var t = iasufr.initForm(this, opt);

    var tb;
    tb = t.owner.attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(32);

    tb.addText("text", 3, "Виберіть семінар ");
    //tb.addButton("select", 3, iasufr.lang.ui.select, "32/tick.png", "");
    //tb.addButton("reload", 4, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
    tb.addSeparator("sep2", 5);
    tb.addButton("close", 6, iasufr.lang.ui.close, "32/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);
   
    var tlayout;
    tlayout = t.owner.attachLayout("1C");
    tlayout.cells("a").setText(""); 

    var g = tlayout.cells("a").attachGrid();

    g.setHeader('Назва семінару,Дата початку,Дата закінчення,Почат. реєстр.,Кінець реєстр.,.');

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
    g.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
    g.setColTypes("ro,dhxCalendar,dhxCalendar,dhxCalendar,dhxCalendar,ro");
    g.setColSorting('str,date,date,date,date,str');
    g.setImagePath(iasufr.const.IMG_PATH);  
    g.setDateFormat("%d.%m.%Y");
    g.attachEvent("onFilterEnd", onFilterEnd);

    g.init();
    //iasufr.enableRowselectMode(g);
    this.grid = g;
    this.form = t;

    var k = 'smrselect' + new Date().getMonth().toString();
    iasufr.enableGridColumnWidthStore(g,k);
    RefreshGrid();

    /////////////////////////////////////////////////////////////////////////////////////////////////////


    function RefreshGrid(id) {
        iasufr.gridRowFocus(g, id);
        var data = {func: "SelectSe"};
        iasufr.ajax({url: "fin.Sem.cls", data: data, success: onAfterLoad });
    }

    function onAfterLoad(data) {
        g.clearAll();
        if (data) g.parse(JSON.parse(data), 'json');
        g.sortRows(1,"date","des");
        g.setSortImgState(true, 1, "des");
        iasufr.gridRowFocusApply(g);
        var cnt = g.getRowsNum();
        tlayout.cells("a").setText("Всього строк: " + cnt );
        if (cnt>0) for (var i = 0; i < cnt; i++) {
                       g.cells2(i, 0).setValue("<a href='#'>"+g.cells2(i, 0).getValue()+"</a>");
                       $(g.cells2(i, 0).cell).click(onCellClick);
                   }
    }

    function onCellClick(e) {
        var ind=$(e.currentTarget).parent().index()-1;
        var idRow=g.getRowId(ind);
        iasufr.gridRowFocus(g, idRow);
        RegMembersload(idRow);
    }

    function onFilterEnd() {
        tlayout.cells("a").setText("Всього строк: " + g.getRowsNum());
    }


    function onToolbarClick(name) {
        switch (name) {
         //  case "select": RegMembersload(); break;
           case "close": Close(); break;
        }
    }

    function RegMembersload(idRow) {
        var args = $.extend({}, opt);
        var selId = idRow;
        if (!selId) return;
        args.id = selId;
        args.title = "Реєстрація учасників семінару"; 
        t.owner.detachToolbar();
        tb = null;
        iasufr.loadForm("SmrMembers", args);
    }

    function Close() {
        iasufr.close(t);
    }

    return this;
}


