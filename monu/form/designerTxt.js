if (!window.Frm) Frm = {};
if (!Frm.Design) Frm.Design = {};

Frm.Design.CreateTxt = function(opt) {
    var t = iasufr.initForm(this, opt);
    t.idForm = opt.id;
    t.dateForm = opt.date;

    var toolbar = t.owner.attachToolbar();
    toolbar.setIconPath(iasufr.const.ICO_PATH);
    toolbar.setIconSize(16);
    toolbar.addButton("save", 1, "Зберегти", "16/tick.png", "");
    toolbar.addButton("cancel", 2, "Скасувати", "16/cross.png", "");
    toolbar.attachEvent("onClick", onToolbarClick);

    var inpName = "inp" + Date.parse(new Date()).toString();

    if (t.idForm != undefined && t.dateForm != undefined) LoadData();
    t.owner.attachHTMLString("<input id='"+inpName+"'></input>");


    function LoadData() {
        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: "LoadTextData", id: t.idForm, date: t.dateForm},
            success: FillData
            //error: function(){l.progressOff()}
        });
    }

    function FillData(d) {
        var o = "";
        try {
            var r = JSON.parse(d);
            o = r.json;
        } catch (e) {
            console.error(e);
        }
        window.CKEDITOR.replace($("#"+inpName)[0], {
            toolbar : 'Basic',
            uiColor : '#b4cff4',
            language: 'uk',
            resize_enabled: false,
            //width: "99%",
            height: ($("#"+inpName).parent().height()-60) + "px",
            enterMode : window.CKEDITOR.ENTER_BR,
            on: {
                instanceReady: function () {
                    CKEDITOR.instances[inpName].setData(o, {noSnapshot: true});
                }
            },
            toolbar:[
                { name: 'actions', items: ['Undo', 'Redo'] },
                { name: 'basicstyles', items : [ 'FontSize', 'TextColor','BGColor', '-', 'Bold','Underline','Italic','-','Subscript','Superscript','Link','-','RemoveFormat' ] },
                { name: 'paragraph',   items : [ 'JustifyLeft','JustifyCenter','JustifyRight','-', 'NumberedList','BulletedList'] },
                { name: 'add', items: ['Table','HorizontalRule','PageBreak']},
                { name: 'add2', items: ['ShowBlocks','Maximize']},
                { name: 'src', items: ['Source']}]
        });



    }

    function SaveData() {
        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: "SaveTextData", id: t.idForm, date: t.dateForm, html: CKEDITOR.instances[inpName].getData()},
            success: function(){iasufr.close(t);}
            //error: function(){l.progressOff()}
        });

    }

    function onToolbarClick(name) {
        switch (name) {
            case "save": SaveData(); break;
            case "cancel": iasufr.close(t); break;
        }
    }
};

//@ sourceURL=designerTxt.js
