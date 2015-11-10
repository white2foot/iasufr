// Исправлена работа с функциями. Ошибка при отсутствии прав
// Исправлена работа с функциями. Ошибка при отсутствии прав
if (!window.Frm) window.Frm = {}
if (!Frm.WorkWithFormsSettings) Frm.WorkWithFormsSettings = {};

Frm.WorkWithFormsSettings.Create = function(opt) {

    var t = iasufr.initForm(this, opt);
    t.formCode = opt.code;

    var l = new dhtmlXLayoutObject(t.owner, "1C");

    var tb =  l.cells("a").attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(16);
    tb.addButton("save", 1, iasufr.lang.ui.save, "16/database_save.png", "");
    tb.addButton("close", 6, iasufr.lang.ui.close, "16/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);

    l.cells("a").hideHeader();

    var formData = [
        {
            type: "settings",
            position: "label-top",
            labelWidth: 360,
            inputWidth: 160,
            offsetLeft: 8,
            offsetTop: 8
        },
        {
            type: "input",
            label: "Пуста клітинка у звіті",
            name: "emptyChar",
            value: iasufr.storeGet("print.emptyChar")
        },
        {
            type: "input",
            label: "Друкувати дату у звітах(для форми " + t.formCode + ")",
            name: "customDate",
            value: iasufr.storeGet("print.customDate"+ t.formCode)
        },
        {
            type: "input",
            label: "Формат виводу періоду звіту(для форми " + t.formCode + ")",
            name: "customDateFormat",
            value: iasufr.storeGet("print.customDateFormat" + t.formCode)
        },
        {
            type: "input",
            label: "Формат виводу підписів(для форми " + t.formCode + ")",
            name: "customFooter",
            value: iasufr.storeGet("print.customFooter" + t.formCode),
            rows: 4,
            inputWidth: 560
        }

    ];
    t.form = l.cells("a").attachForm(formData);



    function onToolbarClick(name) {
        if (name == "save") Save();
        if (name == "close") iasufr.close(t);
    }

    function Save() {
        iasufr.storeSet("print.emptyChar", t.form.getItemValue("emptyChar"));
        iasufr.storeSet("print.customDate" + t.formCode, t.form.getItemValue("customDate"));
        iasufr.storeSet("print.customDateFormat" + t.formCode, t.form.getItemValue("customDateFormat"));
        iasufr.storeSet("print.customFooter" + t.formCode, t.form.getItemValue("customFooter"));

        iasufr.close(t);
    }


};

//@ sourceURL=/monu/form/work/settings.js