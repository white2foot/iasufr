/**
 * Created by Anton on 18.02.14.
 */
if (!window.Errors) window.Errors = {}
if (!Errors.Form) Errors.Form = {};

Errors.Form.Create = function(opt) {

    var t = iasufr.initForm(this, opt);

    var tb = t.owner.attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(32);
    tb.addButton("reload", 1, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
    tb.addText("txtD", 2, "Дата");
    tb.addInput("date", 3, iasufr.formatDate(new Date()), 72);
    tb.addSeparator("sep", 4);
    tb.addButton("close", 5, iasufr.lang.ui.close, "32/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);
    //tb.getItem("date").setWidth(10);

    //myToolbar.addInput("calendar", null, "12.06.2013", 90);
    var cal = new dhtmlXCalendarObject({input: tb.getInput("date")});
    cal.attachEvent("onClick", RefreshGrid);
    //cal.loadUserLanguage("ua");
    cal.hideTime();
    cal.setDateFormat("%d.%m.%Y");

    $(tb.getInput("date")).keydown(function(e){if (e.keyCode == 13) RefreshGrid()});

    var g = t.owner.attachGrid();

    g.setHeader("Дата,Час,Користувач,Назва,Адреса");
    g.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
    g.setInitWidths("64, 64, 120,*,*");
    g.setColAlign("center,center,left,left,left");
    g.setColSorting('str,str,str,str,str');
    g.setColTypes("ro,ro,ro,ro,ro");
    g.setImagePath(iasufr.const.IMG_PATH);
    g.init();
    iasufr.enableRowselectMode(g);
    RefreshGrid();

    function RefreshGrid() {
        iasufr.gridRowFocus(g);
        var d = tb.getValue("date").split(".");
        iasufr.ajax({url: "base.Errors.cls", data: {func: "Select", date: d[2]+d[1]+d[0]}, success: onAfterLoad});
    }

    function onAfterLoad(d) {
        g.clearAll();
        g.parse(JSON.parse(d),'json');
        $(tb.getInput("date")).blur();
        g.sortRows(1,"str","desc");
        g.setSortImgState(true,1,"desc");
        iasufr.gridRowFocusApply(g);
        UpdateLinks();
    }

    function UpdateLinks() {
        var cnt = g.getRowsNum();
        for (var i = 0; i < cnt; i++) {
            var txt = g.cells2(i, 2).getValue();
            g.cells2(i, 2).setValue('<a href="#'+txt+'" onclick="iasufr.loadForm(\'UserAdd\',{Login:\''+txt+'\', view: true, modal: true})">'+txt+'</a>');
        }
    }

    function onToolbarClick(name){
        if (name == "reload") RefreshGrid();
        if (name == "close") iasufr.close(t);
        }

    return this;
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/base/errors.js