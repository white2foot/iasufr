if (!window.Recalc) Recalc = {};
if (!Recalc.Form) Recalc.Form = {};

Recalc.Form.Create = function(opt) {
    var t = iasufr.initForm(this, opt);
    var idForm;
    var l = new dhtmlXLayoutObject(t.owner, "1C");
    t.owner.onCloseFunc = Destroy;
    l.cells("a").hideHeader();
    var interval;
    var progressReceived = true;
    var progressKey;
    var zvitCount;
    var toolbar = l.attachToolbar();
    toolbar.setIconPath(iasufr.const.ICO_PATH);
    toolbar.setIconSize(32);
    toolbar.addButton("close", 1, "Закрити", "32/door.png", "");
    toolbar.attachEvent("onClick", onToolbarClick);

    var cur = new Date();
    var dateFrom = new Date(cur.getFullYear(), cur.getMonth(), 1).toLocaleDateString();
    var dateTo = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).toLocaleDateString();

    var formData = [
        { type:"settings" , labelWidth:80, inputWidth:250, position:"absolute"  },
        { type:"calendar", name:"from", label:"З", inputWidth:80, labelLeft:5, labelTop:5, inputLeft:5, inputTop:24, required: true, value: dateFrom },
        { type:"calendar", name:"to", label:"По", inputWidth:80, labelLeft:100, labelTop:5, inputLeft:100, inputTop:24, required: true, value: dateTo  },
        { type:"input" , name:"form", label:"Форма", labelWidth:450, labelAlign:"left", inputWidth:450, labelLeft:5, labelTop:48, inputLeft:5, inputTop:48+19, required: true },
        { type:"button" , name:"begin", value:"Перерахувати", inputLeft:5, inputTop: 110, width:450 },
        { type:"label", name: "progress", label: "", labelLeft: 210, labelTop: 138}
    ];
    var form = l.cells("a").attachForm(formData);
    form.attachEvent("onChange", onChange);
    iasufr.attachSelector(form.getInput("form"), "Forms", {onSelect: onSelectForm});
    form.attachEvent("onButtonClick", onFormButtonClick);

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function onChange(name, value) {
        //TODO: set "to" date
        /*if (name === "from") {
            form.setItemValue("to",
        }*/
    }

    function onSelectForm(o) {
        if (!o) return;
        idForm = o.id;
        form.setItemValue("form", "(" + o.code + ") " + o.name);
    }

    function onFormButtonClick(name) {
        if (name == "begin") {
            if (!form.validate()) return;
            if (idForm === undefined) return;
            iasufr.ajax({
                url: "frm.Form.cls",
                data: {func: "RecalcAll", idForm: idForm, dateFrom: form.getItemValue("from").toLocaleDateString(), dateTo: form.getItemValue("to").toLocaleDateString() },
                success: onSuccess,
                error: function(e){console.error(e)}
            });
        }
    }

    function onSuccess(resp, d) {
        if (d.json) {
            progressKey = d.json.key;
            zvitCount = d.json.count;
        }
        if (!progressKey) return;
        if (interval) clearInterval(interval);

        interval = setInterval(requestProgress, 1000)
        form.setItemLabel("progress", "0%");
    }

    function requestProgress() {
        if (!progressReceived) return;
        progressReceived = false;
        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: "GetRecalcProgress", key: progressKey },
            success: onProgress,
            error: function(e){console.error(e); clearInterval(interval);}
        });
    }

    function onProgress(txt, d) {
        progressReceived = true;
        if (d.json.progress === "done") {
            clearInterval(interval);
            form.setItemLabel("progress", "100%");
            iasufr.alert("Перераховано звiтiв: " + zvitCount.toString());
            return;
        }

        form.setItemLabel("progress", Math.round(d.json.progress) + "%");
    }

    function onToolbarClick(name) {
        switch (name) {
            case "close": Close(); break;
        }
    }

    function Close() {
        if (interval) clearInterval(interval);
        iasufr.close(t);
    }

    function Destroy() {
        if (interval) clearInterval(interval);
        delete t.owner.onCloseFunc;
    }

    return this;
}
//@ sourceURL=/monu/form/recalc.js