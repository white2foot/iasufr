if (!window.Frm) Frm = {};
if (!Frm.Input) Frm.Input = {};

Frm.Input.Create = function(opt) {
    var t = iasufr.initForm(this, opt);

    if (opt.idZvit == undefined) {
        iasufr.close(t);
        iasufr.alert("Не вказан idZvit");
        return;
    }
    t.idZvit = opt.idZvit;
    t.isKazn = opt.isKazn;
    if (!t.isKazn) t.isKazn = 0;
    t.tableData = {};

    var formData, rowAdder, rowAdderBtn;
    //iasufr.alert(t.idZvit);

    var layout = t.owner.attachLayout("2E");
    layout.cells("b").hideHeader();

    layout._minHeight = 20;
    layout.cells("a").setHeight(20);
    layout.cells("a").hideHeader();
    layout.cells("a").fixSize(true, true);
    //dhxLayout.cells("a").setF



    var tb = layout.cells("b").attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(16);
    if (!opt.status) {
        tb.addButton("saveandquit", 1, iasufr.lang.ui.saveAndQuit, "16/database_save.png", "");
        tb.addButton("save", 1, iasufr.lang.ui.save, "16/database_save.png", "");
        tb.addSeparator("sep", 3);
    }
    tb.addButton("download", 4, " Зберегти у файл", "16/download.png", "");
    if (!opt.status) if (File != undefined) tb.addButton("upload", 5, " Завантажити з файлу", "16/sql_server.png", "");
    tb.addButton("transfer", 6, "Перенести суми з попереднього перiоду", "16/arrow_rotate_clockwise.png", "");
    tb.addButton("close", 7, iasufr.lang.ui.close, "16/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);

    var tabs;
    var isText = false;
    LoadData();

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////


    function onToolbarClick(name) {
        if (name == "transfer") Transfer(false);
        if (name == "save") Save(false);
        if (name == "saveandquit") Save(true);
        if (name == "close") iasufr.close(t);
        if (name == "download") iasufr.downloadData("form.txt", JSON.stringify(SerializeTables()));
        if (name == "upload") {
            var wnd = iasufr.wins.createWindow("up" + new Date().valueOf(), 0, 0, 320, 120);
            wnd.setModal(true);
            wnd.centerOnScreen();
            wnd.denyPark();
            wnd.denyResize();
            wnd.setText("Завантажити файл");

            if ($("#frm-uploader-block").size() == 0) $(document.body).append('<div id="frm-uploader-block"><input id="frm-uploader" class="fm-uploader" type="file" /></div>');
            wnd.attachObject("frm-uploader-block");
            document.getElementById('frm-uploader').addEventListener('change', readSingleFile, false);
            document.getElementById('frm-uploader').addEventListener('dragover', function(){$("#frm-uploader").addClass("fm-uploader-over")}, false);
            document.getElementById('frm-uploader').addEventListener('dragleave', function(){$("#frm-uploader").removeClass("fm-uploader-over")}, false);

            function readSingleFile(evt) {
                 var f = evt.target.files[0];
                 if (f) {
                    var r = new FileReader();
                    r.onload = function(e) {
                    var contents = e.target.result;
                 try {
                    DesetializeTable(JSON.parse(contents));
                 } catch (exp) {
                    iasufr.alert(exp.message);
                 }
                    $("#frm-uploader-block").remove();
                    wnd.close();
                 }
                    r.readAsText(f);
                 } else {
                    iasufr.alert("Помилка завантаження файла")
                 }
            }
        }
    }

    function Transfer() {
        var trans = formData.transfer;
        console.log(formData.transfer);
        for (var i = 0; i < t.tableData.tables.length; i++) {
            if (!trans[t.tableData.tables[i].id]) continue;
            var g = t.tableData.tables[i].grid;
            var fd = g.tableData;
            for (var j = 0; j < trans[t.tableData.tables[i].id].length; j++ ) {
                var tr = trans[t.tableData.tables[i].id][j];

                var tcd = fd.getCellData(tr.row, tr.col);
                var ctype = 2;
                if (tcd) ctype = tcd.type;

                var colIdx = g.getColIndexById(tr.col);
                if (colIdx != undefined) {
                    var ce = g.cells(tr.row, g.getColIndexById(tr.col));
                    if (ce) ce.setValue(fd.formatValue(tr.value, ctype));
                }
            }
        }
    }

    function IsDataFixed(idRow, idCol, tableIdx) {
        var cells = t.tableData.tables[tableIdx].cells;
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].row == idRow && cells[i].col == idCol && (cells[i].value != undefined || (cells[i].formula != undefined && !t.isKazn))) return true;
        }
        return false;
    }

    function DesetializeTable(d) {
        if (!t.tableData) return;
        if (!t.tableData.tables) return;
        if (t.tableData.tables.length == 0) return;
        if (!d) return;
        if (d.length != 0) {
            for (var k = 0; k < d.length; k++) {
                var tableIdx = -1;
                for (var i = 0; i < t.tableData.tables.length; i++) if (d[k].id == t.tableData.tables[i].id) {
                    tableIdx = i;
                    break;
                }
                if (tableIdx == -1) continue;
                var g = t.tableData.tables[tableIdx].grid;
                //clear grid
                for (var i = 0; i < g.getRowsNum(); i++) {
                    for (var j = 0; j < g.getColumnsNum(); j++) {
                        if (!IsDataFixed(g.getRowId(i), g.getColumnId(j), tableIdx)) g.cells2(i, j).setValue("");
                    }
                }
                for (var i = 0; i < d[k].cells.length; i++) {
                    var cell = d[k].cells[i];
                    if (!IsDataFixed(cell.idRow, cell.idCol, tableIdx)) g.cells(cell.idRow, g.getColIndexById(cell.idCol)).setValue(cell.value);
                }
                g.tableData.recalcFormulas();
            }
        }
    }

    function SerializeTables() {
        var data = [];
        var chackedCells = [];
        for (var k = 0; k < t.tableData.tables.length; k++) {
            var g = t.tableData.tables[k].grid;
            var o = {id: t.tableData.tables[k].id, cells:[]};
            for (var r = 0; r < g.getRowsNum(); r++) {
                for (var c = 0; c < g.getColumnsNum(); c++) {
                    var idRow = g.getRowId(r);
                    var idCol = g.getColumnId(c);
                    var value = g.cells(idRow, c).getValue();
                    var td = g.cells(idRow, c).cell;
                    if (chackedCells.indexOf(td) != -1) continue;
                    chackedCells.push(td);

                    var rd = g.tableData.getRowData(idRow);
                    if (!IsDataFixed(idRow, idCol, k) || ((rd) && (rd.createdFromId !== undefined))) {
                        var item = {idRow: idRow, idCol: idCol, value: value};

                        if (rd) if (rd.createdFromId) {
                            item.createdFromId = rd.createdFromId;
                            item.idx = r;
                        }
                        if ((item.value) || (item.createdFromId !== undefined)) {
                            o.cells.push(item);
                        }
                    }
                }
            }
            data.push(o);
        }
        return data;
    }

    function Save(quitAfterSave) {
        if (t.idZvit == undefined) {
            iasufr.showError("Не вказан idZvit");
            return;
        }

        if (isText) {
            var inputs = $(layout.cells("b")).find("input");
            var res = {};
            for (var i = 0; i < inputs.length; i++) {
                var $inp = $(inputs[i]);
                res[$inp.attr("datafield")] = $inp.val();
            }
            iasufr.ajax({
                url: "frm.Form.cls",
                data: {func: "SaveInputData", json: JSON.stringify({id: t.idZvit, textData: res})},
                success: quitAfterSave ? quitToWorkForms : onSuccess,
                error: function(){t.owner.progressOff()}
            });
            return;
        }

        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: "SaveInputData", json: JSON.stringify({id: t.idZvit, isKazn: t.isKazn, tables: SerializeTables()})},
            success: quitAfterSave ? quitToWorkForms : onSuccess,
            error: function(){t.owner.progressOff()}
        });
    }

    function quitToWorkForms() {
        iasufr.messageSuccess("Данi збережено");
        iasufr.disableAskBeforClose(t);
        setTimeout(function() {
            window.location = "/index.html?form=WorkWithForms&idOrg=" + formData.idOrg + "&dateInput=" + formData.dateInput + "&idZvit=" + t.idZvit + "&orgName=" + encodeURI(formData.orgName);
        }, 100);
    }

    function onSuccess() {
        t.owner.progressOff();
        iasufr.messageSuccess("Данi збережено");
        iasufr.disableAskBeforClose(t);
    }

    function LoadData() {
        if (t.idZvit == undefined) {
            iasufr.showError("Не вказан idZvit");
        }
        t.owner.progressOn();
        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: "LoadFormInputData", id: t.idZvit, isKazn: t.isKazn},
            success: FillData,
            error: function(){t.owner.progressOff()}
        });
    }

    function onTxtInputKeyDown(e) {
        if (e.which == 13) { //Enter key
            e.preventDefault(); //Skip default behavior of the enter key
            var txt = $(e.target);
            if (txt.attr("datafield").indexOf("SUM") != -1) {
                var fu = new FormUtils();
                txt.val(fu.formatValue(txt.val(), 2));
                var sumTxt = $("input[datafield=" + txt.attr("datafield") + "_TEXT");
                if (sumTxt) {
                    var value = parseFloat(txt.val().replace(/ /g, "").replace(/,/g, "."));
                    if (!isNaN(value)) sumTxt.val(FloatToSamplesInWords(value));
                }
            }

            var inputs = $(layout.cells("b")).find("input").not('[datafield*="_TEXT"]');
            var nextIndex = inputs.index(this) + 1;
            if (nextIndex < inputs.length)
                inputs[nextIndex].focus();
            else {
                inputs[nextIndex - 1].blur();
            }
        }
    }

    function onAddRow(noAnim) {
        rowAdder.removeClass("anim-size").removeClass("anim-move");
        var clone = rowAdder.clone();
        if (!noAnim) clone.addClass("anim-move");
        clone.insertAfter(rowAdder);
        rowAdder.removeClass("row-adder");
        if (!noAnim) rowAdder.addClass("anim-size");
        rowAdderBtn.remove();

        rowAdder = clone;
        rowAdderBtn = clone.find(".row-adder-button");
        var inputs = rowAdder.find(".txtform-input");
        inputs.each(function(idx, input) {
            var newAttr = $(input).attr("datafield").replace(/\d+/g, function(n){ return ++n });
            $(input).attr("datafield", newAttr);
        });
        inputs.val("").bind("keydown", onTxtInputKeyDown);
        if (!noAnim && inputs[0]) $(inputs[0]).focus();
        rowAdderBtn.click(function(){onAddRow();});
    }

    function fillTextData(cell, savedData) {
        var inputs = cell.find(".txtform-input");
        for (var p in savedData) {
            var input = cell.find("[datafield=" + p + "]");
            input.val(savedData[p]);
        }
    }

    function FillData(txt, o) {
        t.owner.progressOff();
        var prg = o.json.prg;
        formData = {
            dateInput: o.json.dateInput,
            idOrg: o.json.idOrg,
            orgName: o.json.org,
            transfer: o.json.per
        };

        if (prg) prg = prg.substring(3, 7);
        if (t.owner.isWindow) t.owner.setText(o.json.dateInput + ". Форма (" + o.json.formCode + ") " + prg + " - " + o.json.formName + (o.json.fond != "" ? (" (" + o.json.fond + " фонд)") : ""));
        layout.cells("a").attachHTMLString(o.json.org);



        if (o.json.isText == "1") {
            isText = true;
            tb.hideItem("download");
            tb.hideItem("upload");
            layout.cells("b").attachHTMLString("<div style='overflow-y: scroll;width:100%;height:100%'>" + o.json.txtData + "</div>");
            var cell = $(layout.cells("b"));
            var inputs = cell.find(".txtform-input");
            if (inputs.length != 0) inputs[0].focus();
            inputs.bind("keydown", onTxtInputKeyDown);
            rowAdder = cell.find(".row-adder");
            rowAdderBtn = $("<div></div>")
                                .addClass("row-adder-button")
                                .click(function(){onAddRow();})
                                .appendTo(rowAdder);
            //rowAdderBtn = cell.find(".row-adder-button");
            //rowAdderBtn.click(onAddRow);

            // Создаем недостающие поля
            // Находим количество заполненых блоков
            var max = 0;
            for (var p in o.json.savedData) {
                var v = parseInt(p.match(/\d+/)[0]);
                if (v > max) max = v;
            }
            var cur = 0;
            // Находим  сколько блоков задано в форме
            inputs.each(function(idx, input){
               var v = parseInt($(input).attr("datafield").match(/\d+/)[0]);
               if (v > cur) cur = v;
            });
            // Колчиество блоков котрые нужно создать
            var count = max - cur;
            if (count > 0) for (var i = 0; i < count; i++) onAddRow(true);

            fillTextData(cell, o.json.savedData);
            return;
        }


        //if (o.json) DesetializeTable(o.json);
        t.tableData = o.json;

        if (t.tableData.tables) if (t.tableData.tables.length > 0) {
            tabs = layout.cells("b").attachTabbar();
            tabs.setImagePath(iasufr.const.IMG_PATH);

            for (var i = 0; i < t.tableData.tables.length; i++) {
                tabs.addTab(t.tableData.tables[i].id, t.tableData.tables[i].name, 200);

                var g = tabs.cells(t.tableData.tables[i].id).attachGrid();
                g.setImagePath(iasufr.const.IMG_PATH);
                g.setHeader("");
                g.setInitWidths("*");
                g.setColAlign("left");
                g.setColTypes("ed");
                g.enableColumnMove(true);
                g.enableMultiline(true);
                g.init();
                g.attachEvent("onEditCell", onEditCell);
                g.attachEvent("onRowDblClicked", onGridClick);

                t.tableData.tables[i].grid = g;

                try {
                    var fd = new FormUtils(t.tableData.tables[i], o.json.period);
                    fd.buildGrid(g, t.isKazn == 1);
                    g.tableData = fd;
                    t.tableData.tables[i].inputData.sort(function (a,b) {
                       if (a.createdFromId !== undefined && b.createdFromId !== undefined) {
                           return a.idx < b.idx ? 1: -1;
                       } else {
                           return a.idRow < b.idRow ? 1: -1;
                       }
                    });
                    if (t.tableData.tables[i].inputData.length != 0) {
                        for (var k = 0; k < t.tableData.tables[i].inputData.length; k++) {
                            var cell = t.tableData.tables[i].inputData[k];
                            if (cell.value == "e") {
                                console.log("e");
                            }
                            var tcd = fd.getCellData(cell.idRow, cell.idCol);
                            if (cell.createdFromId) tcd = fd.getCellData(cell.createdFromId, cell.idCol);
                            var ctype = 2;
                            if (tcd) ctype = tcd.type;
                            if (!IsDataFixed(cell.idRow, cell.idCol, i)) {
                                if (g.isItemExists(cell.idRow)) {
                                    var colIdx = g.getColIndexById(cell.idCol);
                                    if (colIdx != undefined) {
                                        var ce = g.cells(cell.idRow, g.getColIndexById(cell.idCol));
                                        if (ce) ce.setValue(fd.formatValue(cell.value, ctype));
                                    }
                                } else
                                if (cell.createdFromId) {
                                    fd.addDynRow(null, cell.createdFromId, cell.idRow);
                                    if (g.isItemExists(cell.idRow)) {
                                        var colIdx = g.getColIndexById(cell.idCol);
                                        if (colIdx != undefined) {
                                            var ce = g.cells(cell.idRow, colIdx);
                                            if (ce) ce.setValue(fd.formatValue(cell.value, ctype));
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!t.isKazn) fd.recalcFormulas();
                    delete fd;
                } catch (e) {
                    console.log("Error: " + e.toString(), e.stack);
                }

                iasufr.enableGridColumnWidthStore(g, "formInput_" + o.json.formCode.toString() + "_" + i.toString());


                /*var widths = iasufr.storeGet("formInput_" +  g.formData.formCode + "_" + g.formData.tableNum);
                 if (widths) {
                 for (w = 0; w < g.getColumnsNum(); w++) if (widths[w]) g.setColWidth(w, widths[w]);
                 }*/
            }
            tabs.setTabActive(t.tableData.tables[0].id);
        }

        iasufr.storeSet("myParam", { id:1, filter: "name"});

        var o = iasufr.storeGet("myParam"); // o.filter будет равен name, o.id будет равен 1
    }

    function onGridClick(rid, cidx, evt) {
        if (!evt.currentTarget.grid) return;
        var g = evt.currentTarget.grid;
        if (!g.tableData) return;
        var cd = g.tableData.getCellData(rid, g.getColumnId(cidx));
        if (!cd) return;
        var styledCells = [];
        if (cd.formula) if (cd.formula != "") {
            var f = "<b>[" + rid.toString() + ";" + g.getColumnId(cidx).toString() + "]</b> = " + cd.formula;

            //console.log(f);

            var s = f.replace(/ /g,"");
            var cells = s.match(/[^[\]]+(?=])/g);
            if (cells) if (cells.length != 0) {
                for (var i = 0; i < cells.length; i++) {
                    var c = cells[i].split(";");
                    if (!c) continue;
                    if (c.length != 2) continue;
                    var colIndex = g.tableData.getColIndex(c[1]) + 1;
                    if (g.doesRowExist(c[0])) {
                        var rowCode = g.tableData.getRowData(c[0]).code;
                        if (rowCode === undefined) {
                            // get index
                            rowCode = "№" + (g.getRowIndex(parseInt(c[0])) + 1);
                        }
                        //s = s.replace(new RegExp("[" + cells[i] + "]", 'g'), "[" + c[0] + ";" + c[1] + "]");
                        s = iasufr.replaceAll(s, "[" + cells[i] + "]", " (графа " + colIndex + " рядок " + rowCode + ") ");
                        var gridCell = g.cellById(c[0], colIndex - 1);
                        if (gridCell) if (gridCell.cell) {
                            $(gridCell.cell).addClass("cell-formula-blue");
                            styledCells.push(gridCell.cell);
                        }
                        g.setCellTextStyle(c[0], g.getColumnId(c[1]), "border-style: 2px solid #000");
                    } else {
                        s = iasufr.replaceAll(s, "[" + cells[i] + "]", " (графа " + colIndex + " рядок ???) ");
                    }
                    //s = s.split("[" + cells[i] + "]").join("[" + c[0] + ";" + c[1] + "]");
                }
            }
            var w = iasufr.wins.createWindow("modal" +  new Date().valueOf(), $(window).offsetWidth / 2, $(window).offsetHeight / 2, 640, 180);
            var wtb = w.attachToolbar();
            wtb.setIconPath(iasufr.const.ICO_PATH);
            wtb.addButton("close", 6, iasufr.lang.ui.close, "16/door.png", "");
            wtb.attachEvent("onClick", function() {
                for (var k = 0; k < styledCells.length; k++) {
                    $(styledCells[k]).removeClass("cell-formula-blue");
                }
                styledCells = [];
                w.close();
            });
            w.setIcon("iasufrIcons/sum.png");
            w.setText("Формула");
            w.button("minmax1").hide();
            w.button("stick").hide();
            w.button("park").hide();
            w.button("close").hide();
            w.centerOnScreen();
            w.attachHTMLString(s);
            //w.setModal(true);
            //console.log(s);
        }

    }

    function onEditCell(stage,rId,cInd,nValue) {
        if (stage == 0) {

        }
        if (stage == 2) {
            iasufr.enableAskBeforClose(t);
        }
        return true;
    }


    var mapNumbers = {
        0: [2, 1, "нуль"],
        1: [0, 2, "один", "одна"],
        2: [1, 2, "два", "дві"],
        3: [1, 1, "три"],
        4: [1, 1, "чотири"],
        5: [2, 1, "п`ять"],
        6: [2, 1, "шість"],
        7: [2, 1, "сім"],
        8: [2, 1, "вісім"],
        9: [2, 1, "дев`ять"],
        10: [2, 1, "десять"],
        11: [2, 1, "одинадцять"],
        12: [2, 1, "дванадцять"],
        13: [2, 1, "тринадцять"],
        14: [2, 1, "чотирнадцять"],
        15: [2, 1, "п`ятнадцять"],
        16: [2, 1, "шістнадцять"],
        17: [2, 1, "сімнадцять"],
        18: [2, 1, "вісімнадцять"],
        19: [2, 1, "дев`ятнадцять"],
        20: [2, 1, "двадцять"],
        30: [2, 1, "тридцять"],
        40: [2, 1, "сорок"],
        50: [2, 1, "п`ятдесят"],
        60: [2, 1, "шістдесят"],
        70: [2, 1, "сімдесят"],
        80: [2, 1, "вісімдесят"],
        90: [2, 1, "дев`яносто"],
        100: [2, 1, "сто"],
        200: [2, 1, "двісті"],
        300: [2, 1, "триста"],
        400: [2, 1, "чотириста"],
        500: [2, 1, "п`ятсот"],
        600: [2, 1, "шістсот"],
        700: [2, 1, "сімсот"],
        800: [2, 1, "вісімсот"],
        900: [2, 1, "дев`ятсот"]
    };

    var mapOrders = [
        //{ _Gender: false, _arrStates: ["гривня", "гривні", "гривень"], _bAddZeroWord: true },
        { _Gender: false, _arrStates: ["грн.", "грн.", "грн."], _bAddZeroWord: true },
        { _Gender: false, _arrStates: ["тисяча", "тисячі", "тисяч"] },
        { _Gender: true, _arrStates: ["мільйон", "мільйона", "мільйонів"] },
        { _Gender: true, _arrStates: ["мільярд", "мільярда", "мільярдів"] },
        { _Gender: true, _arrStates: ["триліон", "триліона", "триліонів"] }
    ];

    //var objKop = { _Gender: false, _arrStates: ["копійка", "копійки", "копійок"] };
    var objKop = { _Gender: false, _arrStates: ["коп.", "коп.", "коп."] };

    function Value(dVal, bGender) {
        var xVal = mapNumbers[dVal];
        if (xVal[1] == 1) {
            return xVal[2];
        } else {
            return xVal[2 + (bGender ? 0 : 1)];
        }
    }

    function From0To999(fValue, oObjDesc, fnAddNum, fnAddDesc) {
        var nCurrState = 2;
        if (Math.floor(fValue / 100) > 0) {
            var fCurr = Math.floor(fValue / 100) * 100;
            fnAddNum(Value(fCurr, oObjDesc._Gender));
            nCurrState = mapNumbers[fCurr][0];
            fValue -= fCurr;
        }

        if (fValue < 20) {
            if (Math.floor(fValue) > 0) {
                fnAddNum(Value(fValue, oObjDesc._Gender));
                nCurrState = mapNumbers[fValue][0];
            }
        } else {
            var fCurr = Math.floor(fValue / 10) * 10;
            fnAddNum(Value(fCurr, oObjDesc._Gender));
            nCurrState = mapNumbers[fCurr][0];
            fValue -= fCurr;

            if (Math.floor(fValue) > 0) {
                fnAddNum(Value(fValue, oObjDesc._Gender));
                nCurrState = mapNumbers[fValue][0];
            }
        }

        fnAddDesc(oObjDesc._arrStates[nCurrState]);
    }

    function FloatToSamplesInWords(fAmount) {
        var fInt = Math.floor(fAmount + 0.005);
        var fDec = Math.floor(((fAmount - fInt) * 100) + 0.5);

        var arrRet = [];
        var iOrder = 0;
        var arrThousands = [];
        for (; fInt > 0.9999; fInt /= 1000) {
            arrThousands.push(Math.floor(fInt % 1000));
        }
        if (arrThousands.length == 0) {
            arrThousands.push(0);
        }

        function PushToRes(strVal) {
            arrRet.push(strVal);
        }

        for (var iSouth = arrThousands.length - 1; iSouth >= 0; --iSouth) {
            if (arrThousands[iSouth] == 0) {
                continue;
            }
            From0To999(arrThousands[iSouth], mapOrders[iSouth], PushToRes, PushToRes);
        }

        if (arrThousands[0] == 0) {
            //  Handle zero amount
            if (arrThousands.length == 1) {
                PushToRes(Value(0, mapOrders[0]._Gender));
            }

            var nCurrState = 2;
            PushToRes(mapOrders[0]._arrStates[nCurrState]);
        }

        if (arrRet.length > 0) {
            // Capitalize first letter
            arrRet[0] = arrRet[0].match(/^(.)/)[1].toLocaleUpperCase() + arrRet[0].match(/^.(.*)$/)[1];
        }

        arrRet.push((fDec < 10) ? ("0" + fDec) : ("" + fDec));
        From0To999(fDec, objKop, function () { }, PushToRes);

        return arrRet.join(" ");
    }

    return t;
}
//@ sourceURL=/monu/form/formInput.js