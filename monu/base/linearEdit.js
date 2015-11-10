/**
 * Created by Anton on 15.03.14.
 * Для работы с простыми формами добавления/изменения
 */


if (!window.Linear) Linear = {};
if (!Linear.FormEdit) Linear.FormEdit = {};


Linear.FormEdit.Create = function(opt) {
    var t = iasufr.initForm(this, opt);
    var frm;
    var req = [];
    var orders = [];
    var sizes = [];
    var types = [];
    var headers = [];
    var widths = [];
    var isEdit = opt.id != undefined || opt.noId;

    if (!opt.global) {
        iasufr.showError("Не вказана глобаль", Close);
        return;
    }
    if (!opt.path) {
        iasufr.showError("Не вказан путь", Close);
        return;
    }
    if (!opt.header) {
        iasufr.showError("Не вказан заголовок таблицi", Close);
        return;
    }
    if (!opt.header) {
        iasufr.showError("Не заданi поля форми args.header", Close);
        return;
    }

    headers = opt.header.split(",");
    if (opt.colTypes) types = opt.colTypes.split(",");
    if (opt.colWidths) widths = opt.colWidths.split(",");
    if (opt.fieldSizes) sizes = opt.fieldSizes.split(",");
    if (opt.order) orders = opt.order.split(",");
    if (opt.required) req = opt.required.split(",");

    /*
    if (types.indexOf("cke") != -1) if (){
        CKEDITOR_BASEPATH = "/js/ckeditor/";
        iasufr.loadScripts(["/js/ckeditor/ckeditor.js", "/js/ckeditor/uk.js"]);
    }*/

    var tb = t.owner.attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(16);
    tb.addButton("save", 1, iasufr.lang.ui.save, "16/tick.png", "");
    tb.addButton("cancel", 2, iasufr.lang.ui.cancel, "16/cross.png", "");

    tb.attachEvent("onClick", onToolbarClick);
    CreateForm();
    if (opt.id != undefined || opt.noId) LoadData(); else CheckCke();

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function onToolbarClick(name) {
        if (name == "cancel") Close();
        if (name == "save") {
            var ofs2 = 0;
            if (opt.canAddId == false && orders.indexOf("id") != -1) ofs2 = 1;

            for (var i = 0; i < types.length; i++) {
                if (types[i].substr(0, 2) == "sp") {
                    frm.setItemValue(frm.getItemsList()[i-ofs2], $(frm.getInput(frm.getItemsList()[i-ofs2])).val())
                }
            }
            if (!frm.validate()) return;
            var items = frm.getItemsList();
            var data = [];
            var id = 0;
            if (opt.canAddId != true) {
                var j = orders.indexOf("id");
                if (j != -1) orders.splice(j, 1);
            } else {
                var j = items.indexOf("id");
                if (j != -1) items.splice(j, 1);
                id = frm.getItemValue("id");
            }

            for (var i= 0; i < items.length; i++) {
                var idx = i;
                if (orders) {
                    idx = orders[i];
                    if (idx == "id") {
                        id = frm.getItemValue(items[i]);
                        continue;
                    } else if (idx.substr(0, 2) == "ex"){
                        idx = opt.externalFields[idx].srcKeyIndex - 1;
                    } else idx = parseInt(idx) - 1;
                }
                if (types.length > i) if (types[i] == "cke") {
                    if (window.CKEDITOR) {
                        data[idx] = window.CKEDITOR.instances[frm.getInput(frm.getItemsList()[i]).id].getData();
                    } else {
                        iasufr.showError("Не знайден ckeditor");
                        return;
                    }
                    continue;
                }

                data[idx] = frm.getItemValue(items[i]);
                if (frm.getItemType(items[i]) == "input") {
                    if ($(frm.getInput(items[i])).attr("selId")) {
                        data[idx] = $(frm.getInput(items[i])).attr("selId");
                    }
                }
                //data[idx] = data[idx].toString();
            }
            if (isEdit && !opt.noid) id = opt.id;

            iasufr.ajax({
                url: "base.Linear.cls",
                data: {func: isEdit? "Edit" : "Add", order: orders.join(","), saveUsingOrder: opt.saveUsingOrder, canAddId: opt.canAddId == true ? 1: 0, global: opt.global, path: opt.path, id: id, noid: opt.noId ? 1:0, data: JSON.stringify(data), idOrg: opt.idOrg },
                success: function (d) {
                    var id;
                    try{id=JSON.parse(d).Id} catch(e){}
                    if (opt.onSave) opt.onSave(id);
                    Close()
                }
            });
        }
    }

    function CreateForm() {


        var items = [{ type:"settings" , position:"label-top", offsetLeft: 4, offsetTop: 2 }];

        if (opt.canAddId == true && orders.indexOf("id") == -1) {
            // Нет стобца в описании для id, поэтому добавляем
            items.push({type: "input", label: "Код", required: true, inputWidth: 64, name: "id"});
        }

        for (var i = 0; i < headers.length; i++) {
            var item = {type: "input", label: headers[i]};

            if (req.length > i) if (req[i] == 1 || req[i] == true) item.required = true;

            if (orders.length > i) if (orders[i] == "id") {
                if ((opt.canAddId == false) || (opt.canAddId == undefined)) continue;
                if (isEdit) {
                    item.readonly = true;
                    item.required = false;
                }
            }
            if (sizes.length > i) if (sizes[i] != "") item.rows = sizes[i];


            if (types.length > i) {
                switch (types[i]) {
                    case "cb": item.type = "checkbox"; item.position = "label-right"; break;
                    case "editor": item.type = "editor"; if (item.rows) item.inputHeight = item.rows * 20; delete item.rows;break;
                }
            }

            var wid = 0;
            if (widths.length > i) wid = widths[i];
            if (wid > opt.width || isNaN(wid) || !wid) wid = opt.width - 26;
            item.inputWidth = wid;
            items.push(item);
        }
        frm = t.owner.attachForm(items);
        if (!isEdit) BinsSprav();
        t.owner.setDimension(opt.width, $(frm.base).height() + 74);
        t.owner.centerOnScreen();
        if (frm.isReadonly(frm.getItemsList()[0])) $(frm.getInput(frm.getItemsList()[1])).focus(); else $(frm.getInput(frm.getItemsList()[0])).focus();
    }

    function BinsSprav() {
        var ofs2 = 0;
        if (opt.canAddId == false && orders.indexOf("id") != -1) ofs2 = 1;

        for (var i = 0; i < types.length; i++) {
            if (types[i].substr(0, 2) == "sp") {
                iasufr.attachSelector(frm.getInput(frm.getItemsList()[i-ofs2]),  types[i].substring(2, types[i].length), {findOnInit: true, onSelect: function(o, $txt){
                    if ($.isArray(o)) {
                        $txt.val(o[1]);
                        $txt.attr("selId", o[0]);
                    } else if (o.name && o.id) {
                        $txt.val(o.name);
                        $txt.attr("selId", o.id);
                    } else {
                        var i = 0;
                        for(var k in o) {
                            if (i == 2) break;
                            if (i == 0) $txt.attr("selId", o[k]);
                            if (i == 1) $txt.val(o[k]);
                            i++;
                        }
                    }
                }});
            }
        }
    }

    function BindCke() {
        for (var i = 0; i < types.length; i++) {
            if (types[i] == "cke") {
                window.CKEDITOR.replace(frm.getInput(frm.getItemsList()[i]), {
                    toolbar : 'Basic',
                    uiColor : '#b4cff4',
                    language: 'uk',
                    resize_enabled: false,
                    //width: "99%",
                    height: ($(frm.getInput(frm.getItemsList()[i])).height()-60) + "px",
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
        window.setTimeout(function(){
            t.owner.setDimension(opt.width, $(frm.base).height() + 74);
        }, 100);
    }

    function FillForm(obj) {
        if (!$.isArray(obj)) return;
        var ord = orders.slice(0);
        var canAddId = opt.canAddId;
        if (canAddId) {
            obj.splice(0,0,opt.id);
        } else if (ord[0] === "id") ord.shift();


        var idx;
        for (var i = 0; i < obj.length; i++) {
            idx = i;
            if (ord.length > i) {
                if (ord[i] == "id") idx = 0; else idx = parseInt(ord[i]) - 1 + (canAddId ? 1 : 0);
                if (ord[i].substr(0, 2) == "ex") {
                    idx = opt.externalFields[ord[i]].srcKeyIndex - 1 + (canAddId ? 1 : 0);
                }
            }
            frm.setItemValue(frm.getItemsList()[i], obj[idx]);
        }

        //var ofs =  opt.canAddId ? 0 : 1;
        //var ofs2 = 0;
        //if (opt.canAddId != false && orders.indexOf("id") != -1) ofs2 = 1;
        /*for (var i = 0; i < obj.length; i++) {
            var idx = i;
            if (orders.length > i) if (orders[i] != "id") {
                if (orders[i].substr(0, 2) == "ex") {
                    idx = opt.externalFields[orders[i]].srcKeyIndex - ofs2;
                } else idx = orders[i];
            } else idx = 0;
            //if (typeof(obj[i]) == "object") {
              //  frm.setItemValue(frm.getItemsList()[i], obj[i].id);
                //frm.setItemText(frm.getItemsList()[i], obj[i].txt);
            //} else
            frm.setItemValue(frm.getItemsList()[i - ofs2], obj[idx]);
        }*/
        BinsSprav();
        CheckCke();
    }

    function CheckCke() {
        if (types.indexOf("cke") != -1) {
            if (window.CKEDITOR) {
                BindCke();
            } else {
                window.CKEDITOR_BASEPATH = "/js/ckeditor/";
                iasufr.loadScripts(["/js/ckeditor/ckeditor.js", "/js/ckeditor/uk.js"], BindCke);
            }
        }
    }

    function LoadData() {
        t.owner.progressOn();
        iasufr.ajax({
            url: "base.Linear.cls",
            data: {func: "Get", sprav: opt.sprav, global: opt.global, path: opt.path, id: opt.id, noid: opt.noId ? 1:0, idOrg: opt.idOrg },
            success: function (d, obj) {
                t.owner.progressOff();
                FillForm(obj.json);
            },
            error: function() {t.owner.progressOff();}
        });
    }

    function Close() {
        iasufr.close(t);
    }
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/base/linearEdit.js