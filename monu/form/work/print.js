if (!window.Frm) window.Frm = {}
if (!Frm.PrintForm) Frm.PrintForm = {};

Frm.PrintForm.Create = function(opt) {
    var t = iasufr.initForm(this, opt);
    var tt = t;

    var ids = opt.ids;
    var isKazn = opt.isKazn;

    var l = new dhtmlXLayoutObject(t.owner, "1C");
    l.cells("a").hideHeader();
    l.progressOn();
    t.owner.progressOn();

    var st;
    var et;

    LoadData();

    function LoadData() {

        iasufr.ajax({url: "frm.Form.cls", data: {
            func: "LoadFormsPrintData",
            customDate: (iasufr.storeGet("print.customDate" + opt.code) || ""),
            customFooter: iasufr.replaceAll((iasufr.storeGet("print.customFooter" + opt.code) || ""), "\n", "<br>"),
            customDateFormat: (iasufr.storeGet("print.customDateFormat" + opt.code) || ""),
            ids: ids.join(","),
            isKazn: isKazn
        },
        success: print2});
    }

    function GetCellIdx(tdesc, rid, cid) {
        if (tdesc.tmpDict) {
            if (tdesc.tmpDict[rid]) {
                if (tdesc.tmpDict[rid][cid]) return tdesc.tmpDict[rid][cid];
            }
        }
        for (var i = 0; i < tdesc.cells.length; i++) {
            if (tdesc.cells[i].col == cid && tdesc.cells[i].row == rid) {
                if (!tdesc.tmpDict) tdesc.tmpDict = {};
                if (!tdesc.tmpDict[rid]) tdesc.tmpDict[rid] = {};
                tdesc.tmpDict[rid][cid] = i;
                return i;
            }
        }
        return -1;
    }

    function GetInputDataIdx(tdesc, rid, cid) {
        if (tdesc.tmpDictI) {
            if (tdesc.tmpDictI[rid]) {
                if (tdesc.tmpDictI[rid][cid]) return tdesc.tmpDictI[rid][cid];
            }
        }
        for (var i = 0; i < tdesc.inputData.length; i++) {
            if (tdesc.inputData[i].idCol == cid && tdesc.inputData[i].idRow == rid) {
                if (!tdesc.tmpDictI) tdesc.tmpDictI = {};
                if (!tdesc.tmpDictI[rid]) tdesc.tmpDictI[rid] = {};
                tdesc.tmpDictI[rid][cid] = i;
                return i;
            }
        }
        return -1;
    }

    function NumberToString(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function FormatValue(val, type) {
        var v;
        if (type === "" || type == undefined) type = 2;
        switch (parseInt(type)) {
            case 0: {
                v = parseInt(val);
                if (isNaN(v)) return ""; else return NumberToString(v.toFixed(0));
                break;
            }
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6: {
                v = parseFloat(val.toString().replace(",", ".").replace(/ /g, ""));
                if (isNaN(v)) return ""; else return NumberToString(v.toFixed(type)).replace(".", ",");
                break;
            }
            default: return val; break;
        }
    }

    function addRow(c, savedData) {
        var ra = c.find(".row-adder");
        var clone = ra.clone();
        ra.removeClass("row-adder");

        var inputs = clone.find(".txtform-input");
        inputs.each(function(idx, input) {
            var newAttr = $(input).attr("datafield").replace(/\d+/g, function(n){ return ++n });
            $(input).attr("datafield", newAttr);
            if (savedData[newAttr] !== undefined) $(input).text(savedData[newAttr]);
        });

        clone.insertAfter(ra);
    }

    function fillTextData(str, savedData) {
        var el = document.createElement("div");
        var html = $.parseHTML( str );
        $(el).append(html);

        var c = $(el);
        var inputs = c.find(".txtform-input");
        // Находим количество заполненых блоков
        var max = 0;
        for (var p in savedData) {
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
        if (count > 0) for (var i = 0; i < count; i++) addRow(c, savedData);
        c.find(".row-adder-button").remove();
        c.remove();
        return c.html();
    }

    function indexOfRow(tdesc, rid) {
        for (var i = 0; i < tdesc.rows.length; i++) if (tdesc.rows[i].id == rid) return i;
        return -1;
    }

    function posSort(a, b) {
        return parseInt(a.pos) < parseInt(b.pos) ? 1: -1;
    }



    function getRowData(tdesc, rowId) {
        for (var i = 0; i < tdesc.rows.length; i++) if (tdesc.rows[i].id == rowId) return tdesc.rows[i];
        return undefined;
    }


    // Add dynamic rows from input data
    function extendTableWithDynamicInputData(tdesc) {
        tdesc.rows.forEach(function(r) { if (r.pos !== undefined) r.pos = parseInt(r.pos); });

        // Sort dun rows by position
        tdesc.dynrows = tdesc.dynrows.sort(posSort);

        // Add dynamic rows
        tdesc.dynrows.forEach(function(dyn) {
            var rd = getRowData(tdesc, dyn.idRow);
            // Row already exists - skip it
            if (rd) return;

            var parent = getRowData(tdesc, dyn.createdFromId);
            rd = $.extend({}, parent);
            rd.id = dyn.idRow;
            rd.createdFromId = parent.id;
            rd.pos = parseInt(parent.pos) + 1;
            //rd.pos = dyn.pos;
            tdesc.rows.forEach(function (r) { if (r.pos > parent.pos) r.pos = parseInt(r.pos) + 1;});
            tdesc.rows.push(rd);



        });

        // Create cells
        tdesc.dynrows.forEach(function(dyn) {
            tdesc.cols.forEach(function (col) {
                var idx = GetCellIdx(tdesc, dyn.createdFromId, col.id);
                var obj = null;
                if (idx !== -1) {
                    obj = tdesc.cells[idx];
                }
                var idx = GetCellIdx(tdesc, dyn.idRow, col.id);
                if (idx == -1) {
                    if (obj) {
                        var newcell = $.extend({}, obj);
                        newcell.row = dyn.idRow;
                        newcell.col = col.id;
                        tdesc.cells.push(newcell);
                    } else
                        tdesc.cells.push({row: dyn.idRow, col: col.id});
                }
            });
        });

        // Sort rows
        tdesc.rows = tdesc.rows.sort(function(a,b) { if (a.pos > b.pos) return 1; else return -1 });
    };
    /*function extendTableWithDynamicData(tdesc) {
        tdesc.inputData = tdesc.inputData.sort(function (a,b) {
            if (a.createdFromId !== undefined && b.createdFromId !== undefined) {
                return a.idx < b.idx ? 1: -1;
            } else {
                return a.idRow < b.idRow ? 1: -1;
            }
        });
        for (var m = 0; m < tdesc.inputData.length - 1; m++) {
            if (tdesc.inputData[m].createdFromId !== undefined) {
                var ridx = indexOfRow(tdesc, tdesc.inputData[m].idRow);
                if (ridx == -1) {
                    var ridx = indexOfRow(tdesc, tdesc.inputData[m].createdFromId);
                    var rd = $.extend({}, tdesc.rows[ridx]);
                    rd.id = tdesc.inputData[m].idRow;
                    tdesc.rows.splice(ridx + 1, 0, rd);

                    // copy cell data
                    var newCells = [];
                    for (var n = 0; n < tdesc.cells.length; n++) if (tdesc.cells[n].row == tdesc.inputData[m].createdFromId) {
                        var nc = $.extend({}, tdesc.cells[n]);
                        nc.row = rd.id;
                        newCells.push(nc);
                    }
                    for (var n = 0; n < newCells.length; n++) tdesc.cells.push(newCells[n]);
                }
            }
            var idx = GetCellIdx(tdesc, tdesc.inputData[m].idRow, tdesc.inputData[m].idCol);
            if (idx == -1) {
                tdesc.cells.push({row: tdesc.inputData[m].idRow, col: tdesc.inputData[m].idCol});
            }
            delete tdesc.inputData[m].createdFromId;
        }
    }*/

    function calcSubtotals(tdesc) {
        // Only one subtotal column supported
        var subIdx = -1;
        var subPrevIdx = 0;
        var subVal = null;
        var subColumns = [];
        var subDoInsert = false;
        var subTitle = "";
        var newRowDescs = [];
        for (var c = 0; c < tdesc.cols.length; c++) {
            if (tdesc.cols[c].subtotal) {
                subTitle = tdesc.cols[c].subtotalTitle;
                subIdx = c;
                subColumns = tdesc.cols[c].subtotal.replace(/ /g, "").split(",")
                subColumns = subColumns.map(function(el) {return parseInt(el)});
            }
        }
        if (subIdx != -1) {
            // find max row id to generate new ones
            var maxid = 0;
            tdesc.rows.map(function(obj){ if (obj.id > maxid) maxid = obj.id; });
            maxid++;

            for (var r = 0; r < tdesc.rows.length; r++) {
                for (var c = 0; c < tdesc.cols.length; c++) {
                    // check for subtotal
                    if ((subIdx == c) && !tdesc.rows[r].header) {
                        var ct = "";
                        var idx = GetCellIdx(tdesc, tdesc.rows[r].id, tdesc.cols[c].id);
                        if (idx != -1) ct = tdesc.cells[idx].value || "";
                        var inputIdx = GetInputDataIdx(tdesc, tdesc.rows[r].id, tdesc.cols[c].id);
                        if (inputIdx != -1) {
                            if (tdesc.inputData[inputIdx].value) {
                                ct = tdesc.inputData[inputIdx].value || "";
                            }
                        }
                        ct = ct.trim();
                        if (subVal != null && ct != "") {
                            if (subVal != ct) {
                                subDoInsert = true;
                            }
                        }
                        if (ct != "") subVal = ct;
                    }
                }

                if (subDoInsert) {
                    console.log("=================");
                    subDoInsert = false;
                    // create new row desc for subtotal row
                    var newDesc = $.extend({}, tdesc.rows[r - 1]);
                    newDesc.id = maxid++;
                    newDesc.insertBefore = r;
                    newRowDescs.push(newDesc);

                    var subRow = [];
                    for (var c = 0; c < tdesc.cols.length; c++) {
                        var cd = {};
                        var idx = GetCellIdx(tdesc, tdesc.rows[r - 1].id, tdesc.cols[c].id);
                        if (idx != -1) cd = $.extend({}, tdesc.cells[idx]);
                        cd.row = newDesc.id;

                        if (cd.formula) {
                            // TODO: formulas support
                        }

                        if (c == subIdx) {
                            cd.value = subTitle.toString();
                        } else if (subColumns.indexOf(c + 1) != -1) {
                            // calc total sub from subPrevIdx to r
                            var total = 0;
                            for (var p = subPrevIdx; p < r; p++) {
                                if (tdesc.rows[p].header) continue;
                                var inputIdx = GetInputDataIdx(tdesc, tdesc.rows[p].id, tdesc.cols[c].id);
                                if (inputIdx != -1) {
                                    var v = tdesc.inputData[inputIdx].value;
                                    if (v != undefined) v = parseFloat(v.replace(/ /g, "").replace(/,/g, "."));
                                    if (c == 6) {
                                        console.log(v);
                                    }
                                    if (!isNaN(v)) total += v;
                                }
                            }
                            console.log("Total: ", total);
                            cd.value = FormatValue(total.toFixed(2), cd.type);
                        } else cd.value = "";

                        tdesc.cells.push(cd);
                    }
                    subPrevIdx = r;
                }
            }

            for (var r = 0; r < newRowDescs.length; r++) {
                tdesc.rows.splice(parseInt(newRowDescs[r].insertBefore) + r, 0, newRowDescs[r]);
            }
            //tdesc.rows.sort(function(a,b) { if (parseInt(a.pos) > parseInt(b.pos)) return 1; else return -1 });
        }
    }

    function printTemplate(template, tdesc) {
        var str = "<div>" + template + "</div>";
        var adder = $(str).find(".row-adder");

        //tdesc.rows.sort(function(a, b) { if (parseInt(a.pos) > parseInt(b.pos)) return 1; else return -1 });
        extendTableWithDynamicInputData(tdesc);
        //extendTableWithDynamicData(tdesc);
        for (var r = 0; r < tdesc.rows.length; r++) {
            if (tdesc.rows[r].header) continue;
            for (var c = 0; c < tdesc.cols.length; c++) {
                var idx = GetCellIdx(tdesc, tdesc.rows[r].id, tdesc.cols[c].id);
                var inputIdx = GetInputDataIdx(tdesc, tdesc.rows[r].id, tdesc.cols[c].id);
                var v = "";

                if (str.indexOf("%CELL%") === -1) {
                    // Кончились блоки для заполнения надо добавить новый
                    var html =  $(str);
                    var lastAdder = html.find(".row-adder");
                    lastAdder = lastAdder.get(lastAdder.size() - 1);
                    adder.clone().insertAfter(lastAdder);
                    str = html.get(0).outerHTML;
                }

                if (inputIdx != -1) {
                    if (tdesc.inputData[inputIdx].value) {
                        v = FormatValue(tdesc.inputData[inputIdx].value, tdesc.cells[idx].type);
                    }
                }
                str = str.replace("%CELL%", v);
            }
        }

        return iasufr.replaceAll(str, "%CELL%", "");
    }

    function print2(d) {
        var o = JSON.parse(d);

        st = performance.now();

        if (o.json[0].isText == "1") {
            iasufr.print(fillTextData(o.json[0].txtData, o.json[0].savedData));
            iasufr.close(tt);
            return;
        }

        var DEF_MARGINS = "25 15 15 15";
        function createTd(cell) {
            var style = "";
            if (cell.margin) {
                if (!style) style = " style='";
                style += " padding-left:" + (parseInt(cell.margin) || 0) + "mm;";
            }
            if (cell.bold) {
                if (!style) style = " style='";
                style += " font-weight: bold;";
            }
            if (cell.decoration === "underline") {
                if (!style) style = " style='";
                style += " text-decoration: underline;";
            }
            if (cell.italics) {
                if (!style) style = " style='";
                style += " font-style: italic;";
            }
            if (cell.alignment) {
                if (!style) style = " style='";
                style += " text-align: " + cell.alignment + ";";
            }
            if (style) style += "'";
            return "<td"+spans+style+">" + (cell.text || "") + "</td>";
        }

        function calcWidths(tdesc) {
            var widths = [];
            var hasCustomWidths = false;
            if (tdesc.printData.customWidths) hasCustomWidths = tdesc.printData.customWidths.replace(/,/g, "").trim() != "";
            if (hasCustomWidths) {
                if (iasufr.replaceAll(tdesc.printData.customWidths, ",", "") != "") {
                    var parts = tdesc.printData.customWidths.split(",");
                    for (var ttt = 0; ttt < parts.length; ttt++) {
                        if (parts[ttt] == "") widths.push("");
                        else
                            widths.push(Math.floor(parseFloat(parts[ttt]) / 100 * PAGE_WIDTH));
                    }
                }
            } else {
                for (var c = 0; c < tdesc.cols.length; c++) {
                    if (tdesc.cols[c].printWidth) widths.push(Math.floor(parseFloat(tdesc.cols[c].printWidth) / 100 * PAGE_WIDTH));
                    else widths.push("");
                }
            }
            var emptyCount = widths.filter(function(el) { return el === ""; }).length;
            if (emptyCount !== 0) {
                var emptySpace = PAGE_WIDTH;
                widths.map(function (el) {
                    if (el) emptySpace -= el;
                });
                emptySpace /= emptyCount;
                if (emptySpace < 0) emptySpace = 0;
                for (var i = 0; i < widths.length; i++) if (widths[i] === "") widths[i] = emptySpace;
            }
            return widths;
        }

        function hasDifferentFormatting(table) {
            return ((orientation !== "" && (getOrientation(table) !== orientation))) || ((pageMargins !== DEF_MARGINS && (getMargins(table) !== pageMargins)));

        }

        function getOrientation(table) {
            if (!table.printData) return "portrait";
            return table.printData.portrait == 1 ? "portrait" : "landscape";
        }

        function getMargins(table) {
            if (!table.printData) return DEF_MARGINS;
            return table.printData.margins || DEF_MARGINS;
        }

        function getLeftMargin() {
            return parseInt(pageMargins.split(" ")[0]);
        }

        function getRightMargin() {
            return parseInt(pageMargins.split(" ")[2]);
        }

        function addPdf(table) {
            pdfs.push({
                content: res,
                orientation: orientation,
                margins: pageMargins,
                colonFirst: table.printData.colonFirst,
                colonOther: table.printData.colonOther
            });
            res= "";
        }

        var res = "";
        var emptyChar = iasufr.storeGet("print.emptyChar") || "-";
        var fontSize = iasufr.storeGet("print.customFontSize" + opt.code) || 8;
        var pageMargins = DEF_MARGINS;
        var orientation = "";
        var PAGE_WIDTH = (297 - getLeftMargin() - getRightMargin());
        var pu = new PrintUtils();
        var pdfs = [];
        var addedIdx = 0;
        for (var z = 0 ; z < o.json.length; z++) {
            for (var t = 0; t < o.json[z].tables.length; t++) {
                var tdesc = o.json[z].tables[t];
                if (hasDifferentFormatting(tdesc)) {
                    addPdf(o.json[z].tables[addedIdx]);
                    addedIdx = t;
                } else {
                    if (tdesc.printData.fromNewPage == 1) {
                        res += "<div style='page-break-after: always;'></div>";
                    }
                }
                orientation = getOrientation(tdesc);
                pageMargins = getMargins(tdesc);
                PAGE_WIDTH = (210 - getLeftMargin() - getRightMargin());
                if (orientation === "landscape") PAGE_WIDTH = (297 - getLeftMargin() - getRightMargin());


                if (tdesc.printData.template) {
                    res += printTemplate(tdesc.printData.template, tdesc);
                    continue;
                }

                var widths = calcWidths(tdesc);


                /*if (tdesc.printData) {
                    if (t != 0) if (tdesc.printData.fromNewPage == 1) content.push({text: "", pageBreak: 'after', pageOrientation: tdesc.printData.portrait == 1 ? 'portrait' : 'landscape'});

                    if (tdesc.printData.caption) {
                        pu.parseHtml(content, tdesc.printData.caption);
                    }
                    if ((z == 0) && (tdesc.printData.portrait == 1)) isPortrait = true;
                }*/

                if (tdesc.printData) {
                        res += tdesc.printData.caption;
                        /*if (tdesc.printData.colonFirst) {
                         res += "<div style='position:fixed; right: 0mm; top: 0mm'>" + tdesc.printData.colonFirst + "</div>";
                         }*/
                }




                //tdesc.rows = tdesc.rows.sort(function(a,b) { if (parseInt(a.pos) > parseInt(b.pos)) return 1; else return -1 });
                //extendTableWithDynamicData(tdesc);
                extendTableWithDynamicInputData(tdesc);
                calcSubtotals(tdesc);

                var tableInitial = '<table border="1" style="font-size: ' + fontSize + 'px;" cellpadding="2" cellspacing="0">';
                var table = /*"<div style='background-color:#FF0000;border:1px solid black;position:fixed;left:0mm;top:0mm;width:185mm;height:40mm'>q</div><div style='page-break-after: always;'>ttttttttttttt</div>" +*/ tableInitial;
                var hasHeader = false;
                var headerDone = false;
                var skipRows = [];
                var hrows = 0;
                var headerOnNewPage = false;

                var headerExisists = tdesc.rows.filter(function(el) { return el.header; }).length !== 0;
                var headerFromNewPageExists = tdesc.rows.filter(function(el) { return el.newpage; }).length !== 0;

                table += "<colgroup>";
                for (var i = 0; i < widths.length; i++) {
                    table += "<col style='width:" + widths[i].toString() + "mm'>";
                }
                table += "</colgroup>";
                if (headerExisists) {
                    table += "<thead>";
                }
                for (var r = 0; r < tdesc.rows.length; r++) {
                    //if ((tdesc.rows[r].header && !tdesc.rows[r].newpage)) continue;
                    if (!headerDone) {
                        if (headerExisists) {
                            if (headerFromNewPageExists) {
                                if (tdesc.rows[r].newpage === 1 && !headerOnNewPage) {
                                    headerOnNewPage = true;
                                    table += "</thead></table>" + tableInitial;
                                    table += "<colgroup style='page-break-before: avoid;'>";
                                    for (var i = 0; i < widths.length; i++) {
                                        table += "<col style='width:" + widths[i].toString() + "mm'>";
                                    }
                                    table += "</colgroup>";
                                    table += "<thead>";
                                }
                            } else {

                            }

                            if (!tdesc.rows[r].header && !headerDone) {
                                headerDone = true;
                                table += "</thead>";
                            }
                        }
                    }

                    var row = "<tr>";
                    var skipCols = 0;
                    for (var c = 0; c < tdesc.cols.length; c++) {
                        if (skipRows[c]) {
                            skipRows[c]--;
                            continue;
                        }
                        if (skipCols != 0) {
                            skipCols--;
                            continue;
                        }
                        var idx = GetCellIdx(tdesc, tdesc.rows[r].id, tdesc.cols[c].id);
                        var cell = { text: '', fontSize: fontSize };
                        if (idx != -1) {
                            if (tdesc.cells[idx].value == "#COL_NUM#") tdesc.cells[idx].value = (c+1).toString();
                            if (tdesc.cells[idx].value) cell.text = tdesc.cells[idx].value.replace(/\\u0027/g, "'");
                            if (tdesc.cells[idx].rspan) {
                                cell.rowSpan = tdesc.cells[idx].rspan;
                                skipRows[c] = cell.rowSpan - 1;
                            }
                            if (tdesc.cells[idx].cspan) {
                                cell.colSpan = tdesc.cells[idx].cspan;
                                skipCols = cell.colSpan - 1;
                            }
                            if (tdesc.cells[idx].indent) cell.margin = tdesc.cells[idx].indent * 5;
                            if (tdesc.cells[idx].font) {
                                var fnt = parseInt(tdesc.cells[idx].font);
                                if ((fnt & 2) != 0) cell.bold = true;
                                if ((fnt & 4) != 0) cell.decoration = "underline";
                                if ((fnt & 8) != 0) cell.italics = true;
                            }
                            if (tdesc.cells[idx].align != undefined) {
                                switch (tdesc.cells[idx].align) {
                                    case 1: cell.alignment = "center"; break;
                                    case 2: cell.alignment = "right"; break;
                                }
                            }
                            if (!cell.text) cell.text = " ";
                            var inputIdx = GetInputDataIdx(tdesc, tdesc.rows[r].id, tdesc.cols[c].id);
                            if (inputIdx != -1) {
                                if (tdesc.inputData[inputIdx].value) {
                                    cell.text = FormatValue(tdesc.inputData[inputIdx].value, tdesc.cells[idx].type);
                                }
                            }
                        }


                        var spans = "";
                        if (cell.rowSpan || cell.colSpan) {
                            if (cell.colSpan) spans = " colspan='" + cell.colSpan + "'";
                            if (cell.rowSpan) spans = " rowspan='" + cell.rowSpan + "'";
                        }
                        if (cell.text == " " || cell.text == "") {
                            if (idx !== -1 && tdesc.cells[idx].readonly == 1) {}
                            else {
                                if (!cell.alignment) cell.alignment = "right";
                                cell.text = emptyChar;
                            }
                        }
                        row += createTd(cell);
                    }
                    row += "</tr>";
                    table += row;
                    headerOnNewPage = false;
                }
                table += "</table>";



                res += table ;

                if (tdesc.printData) {
                     res += tdesc.printData.note || "";
                }

                if (tdesc.printData) {
                    if (tdesc.printData.footer) {
                        res += tdesc.printData.footer;
                    }
                }
            }
        }

        addPdf( o.json[z-1].tables[addedIdx]);
        addedIdx = t;
        var et = performance.now();
        console.log('Data load: ', et - st);
        iasufr.ajax({
            url: "base.Print.cls", data: {
                func: "Print",
                pdfs: JSON.stringify(pdfs)
            },
            success: function(d, res) {
                console.log("pdf generation time: " + res.json.time);
                window.open("/base.Page.cls?&func=View&class=base.Print&iasu=1&pdfdownload=1&file=" + res.json.file);
                iasufr.close(tt);
            }
        });
    }

    function onDataLoaded(d) {
        print2(d);
    }

    return this;
}
//@ sourceURL=/monu/form/work/print.js