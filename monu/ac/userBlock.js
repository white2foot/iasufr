if (!window.Usr) Usr = {};
if (!Usr.FormBlock) Usr.FormBlock = {};

Usr.FormBlock.Create = function(opt) {
    var t = iasufr.initForm(this, opt);
    t.onRefresh = opt.onRefresh;
    var idUser = opt.id;
    /*if (!id) {
        iasufr.close(t);
        return this;
    }*/

    var toolbar = t.owner.attachToolbar();
    toolbar.setIconPath(iasufr.const.ICO_PATH);
    toolbar.setIconSize(32);
    toolbar.addButton("block", 1, iasufr.lang.ui.block, "32/disable_enable_demo_mode.png", "");
    toolbar.addButton("reload", 2, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
    toolbar.addSeparator("sep", 3);
    toolbar.addButton("close", 4, iasufr.lang.ui.close, "32/door.png", "");
    toolbar.attachEvent("onClick", onToolbarClick);

    var g = t.owner.attachGrid();
    g.setHeader("Початок,Кiнець,Причина");
    g.setInitWidths("72,72,*");
    g.setColAlign("center,center,left");
    g.setColTypes("ro,ro,ro");
    g.setColSorting('str,str,str');
    g.setImagePath(iasufr.const.IMG_PATH);
    g.init();
    iasufr.enableRowselectMode(g);

    //w.hide();
    var fd = [
        {
            type: "settings",
            position: "label-top",
            labelWidth: 116,
            inputWidth: 300,
            inputHeight: 64,
            offsetLeft: 8
        },
        {
            type: "input",
            label: "Причина",
            name: "reason",
            required: true,
            value: "",
            rows: 4
        },
        {type: "block", inputWidth: 240, list:[
            {
                type: "button",
                value: iasufr.lang.ui.accept,
                name: "ok",
                width: 116
            },
            {type:"newcolumn"},
            {
                type: "button",
                value: iasufr.lang.ui.cancel,
                name: "cancel",
                position:"absolute",
                inputLeft:35,
                width: 116
            }
        ]}
    ];
    var frm;
    var w;

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function IsBlockMode() {
        var isBlock = true;
        if (g.getRowsNum() != 0) {
            var maxId = Math.max.apply(null,g.getAllRowIds().split(","));
            isBlock = g.cells(maxId, 1).getValue() != "";
        }
        return isBlock;
    }

    function UpdateButtonText() {
        toolbar.setItemText("block", IsBlockMode() ? "Блокувати користувача" : "Зняти блокування");
    }

    function ShowBlockForm() {
        if (IsBlockMode()) {
            w = iasufr.wins.createWindow("block" + new Date().getTime().toString(), 0, 0, 336, 160);
            w.setModal(true);
            w.setText("Блокування");
            w.denyResize();
            w.denyPark();
            w.centerOnScreen();
            frm = w.attachForm(fd);
            frm.attachEvent("onButtonClick", formButtonClick);
            $(frm.getInput("reason")).focus();
        } else {
            dhtmlx.confirm({ text: "Зняти блокування?", callback: function(r){if (r) BlockUser()}});
        }
    }

    function formButtonClick(name) {
        if (name == "cancel") {
            w.close();
            return;
        }
        if (name == "ok") {
            if (!frm.validate()) return;
            BlockUser(frm.getItemValue("reason"));
            w.close();
        }
    }

    function onToolbarClick(name) {
        switch (name) {
            case "block": ShowBlockForm(); break;
            case "reload": ReloadGrid(); break;
            case "close": iasufr.close(t); break;
        }
    }

    function onAfterLoad(d) {
        g.clearAll();
        g.parse(JSON.parse(d),'json');

        g.sortRows(1,"str","asc");
        g.setSortImgState(true, 1);
        iasufr.gridRowFocusApply(g);
        UpdateButtonText();
    }

    function ReloadGrid(id) {
        iasufr.gridRowFocus(g, id);
        iasufr.ajax({url: "ac.Usr.cls", data:{func:"SelectBlocks", id: idUser}, success: onAfterLoad});
    }

    function GetId() {
        return g.getRowId(g.getRowIndex(g.getSelectedId()));
    }

    function BlockUser(reason) {
        var action = 1;
        iasufr.ajax({
            url: "ac.Usr.cls",
            data: {func: "Block", json: JSON.stringify({Id: idUser, reason: reason})},
            success: function() { ReloadGrid(); if (t.onRefresh) t.onRefresh()}
        });
    }

    ReloadGrid();
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/ac/userBlock.js