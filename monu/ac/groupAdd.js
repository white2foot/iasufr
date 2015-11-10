/**
 * Created by Anton on 17.02.14.
 */
if (!window["Grp"]) Grp = {};
if (!Grp.FormAdd) Grp.FormAdd = {};

Grp.FormAdd.Create = function(opt) {
    var t = iasufr.initForm(this, opt)
    t.Id = opt.Id;

    var formData = [
        {
            type: "settings",
            position: "label-top",
            labelWidth: 200,
            offsetLeft: 8,
            offsetTop: 4
        },
        {
            type: "input",
            label: "Код",
            required: true,
            name: "Code",
            inputWidth: 72,
            value: ""
        },
        {
            type: "input",
            label: "Назва",
            required: true,
            name: "Name",
            inputWidth: 320,
            value: ""
        }
    ];
    var form = t.owner.attachForm(formData);

    var tb = t.owner.attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(16);
    tb.addButton("save", 1, "Зберегти", "16/tick.png", "");
    tb.addButton("cancel", 2, "Скасувати", "16/cross.png", "");
    tb.attachEvent("onClick", onToolbarClick);

    if (t.Id) LoadData(); else $(form.getInput("Code")).focus();

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function onToolbarClick(name) {
        switch (name) {
            case "save": SaveData(); break;
            case "cancel": Close(); break;
        }
    }

    function SaveData() {
        if (!form.validate()) return;
        if (t.owner.progressOn) t.owner.progressOn();
        var json = $.extend(form.getFormData(), {Id:t.Id});
        iasufr.ajax({
            url: "ac.Grp.cls",
            data: {func: t.Id ? "Edit": "Add", json: JSON.stringify(json)},
            success: onSuccess,
            error: function(){if (t.owner.progressOn) t.owner.progressOff()}
        });
    }

    function LoadData() {
        form.setReadonly("Code", true);
        iasufr.ajax({
            url: "ac.Grp.cls",
            data: {func: "Get", json: JSON.stringify({Code: t.Id})},
            success: FillData
        });
    }

    function FillData(d) {
        try {
            var g = JSON.parse(d).json;
            form.setItemValue("Code", g.Code);
            form.setItemValue("Name", g.Name);
        } catch (e){}
        $(form.getInput("Name")).focus();
    }

    function onSuccess(data, textStatus, jqXHR) {
        if (t.owner.progressOn) t.owner.progressOff();
        var id;
        try {
            var d = JSON.parse(data);
            id = d.Id;
            if (d.error == 1) return;
        } catch (e) {
            return;
        }
        if (t.onSave) t.onSave(id);
        Close();
    }


    function Close() {
        if (t.owner.close != undefined) t.owner.close();
    }


    return this;
}