if (!window.Frm) window.Frm = {}
if (!Frm.PrintForm) Frm.PrintForm = {};

Frm.PrintForm.Create = function(opt) {

    var ids = opt.ids;
    var isKazn = opt.isKazn;

    LoadData();


    function LoadData() {
        iasufr.ajax({url: "frm.Form.cls", data: {
            func: "LoadFormsPrintData",
            customDate: (iasufr.storeGet("print.customDate" + opt.code) || ""),
            customFooter: (iasufr.storeGet("print.customFooter" + opt.code) || ""),
            customDateFormat: (iasufr.storeGet("print.customDateFormat" + opt.code) || ""),
            ids: ids.join(","),
            isKazn: isKazn
        },
        success: onDataLoaded});
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

    function ParseContainer(cnt, e, p, styles) {
        var elements = [];
        var children = e.childNodes;
        if (children.length != 0) {
            for (var i = 0; i < children.length; i++) p = ParseElement(elements, children[i], p, styles);
        }  else {
            //p = ParseElement(cnt, e, p, styles);
            //if (e.innerText) elements.push({ text: e.innerText });
        }
        if (elements.length != 0) {
            //for (var i = 0; i < elements.length; i++) cnt.push(elements[i]);
            //if (onCurLevel) {
                for (var i = 0; i < elements.length; i++) cnt.push(elements[i]);
            //} else cnt.push({stack: elements});
            //cnt.push(elements);
        }
        return p;
    }

    function ComputeStyle(o, styles) {
        for (var i = 0; i < styles.length; i++) {
            var st = styles[i].trim().toLowerCase().split(":");
            if (st.length == 2) {
                st[0] = st[0].trim();
                st[1] = st[1].trim();
                switch (st[0]) {
                    case "margin-top":{
                        if (!o.margin) o.margin = [0, 0, 0, 0];
                        o.margin[1] = parseInt(st[1]);
                        break;
                    }
                    case "margin-bottom":{
                        if (!o.margin) o.margin = [0, 0, 0, 0];
                        o.margin[3] = parseInt(st[1]);
                        break;
                    }
                    case "margin-left":{
                        if (!o.margin) o.margin = [0, 0, 0, 0];
                        o.margin[0] = parseInt(st[1]);
                        break;
                    }
                    case "margin-right":{
                        if (!o.margin) o.margin = [0, 0, 0, 0];
                        o.margin[2] = parseInt(st[1]);
                        break;
                    }
                    case "font-size":{
                        o.fontSize = parseInt(st[1]);
                        break;
                    }
                    case "text-align": {
                        switch (st[1]) {
                            case "right": o.alignment = 'right'; break;
                            case "center": o.alignment = 'center'; break;
                        }
                        break;
                    }
                    case "font-weight": {
                        switch (st[1]) {
                            case "bold": o.bold = true; break;
                        }
                        break;
                    }
                    case "text-decoration": {
                        switch (st[1]) {
                            case "underline": o.decoration = "underline"; break;
                        }
                        break;
                    }
                    case "font-style": {
                        switch (st[1]) {
                            case "italic": o.italics = true; break;
                        }
                        break;
                    }
                }
            }
        }
    }

    function ParseElement(cnt, e, p, styles) {
        if (!styles) styles = [];
        if (e.getAttribute) {
            var nodeStyle = e.getAttribute("style");
            if (nodeStyle) {
                var ns = nodeStyle.split(";");
                for (var k = 0; k < ns.length; k++) styles.push(ns[k]);
            }
        }

        switch (e.nodeName.toLowerCase()) {
            case "#text": {
                var t = { text: e.textContent.replace(/\n/g, "") };
                if (styles) ComputeStyle(t, styles);
                p.text.push(t);
                break;
            }
            case "b":case "strong": {
                //styles.push("font-weight:bold");
                ParseContainer(cnt, e, p, styles.concat(["font-weight:bold"]));
                break;
            }
            case "u": {
                //styles.push("text-decoration:underline");
                ParseContainer(cnt, e, p, styles.concat(["text-decoration:underline"]));
                break;
            }
            case "i": {
                //styles.push("font-style:italic");
                ParseContainer(cnt, e, p, styles.concat(["font-style:italic"]));
                //styles.pop();
                break;
                //cnt.push({ text: e.innerText, bold: false });
            }
            case "span": {
                ParseContainer(cnt, e, p, styles);
                break;
            }
            case "br": {
                p = CreateParagraph();
                cnt.push(p);
                break;
            }
            case "table":
            {
                var t = {
                    table: {
                        widths: [],
                        body: []
                    }
                }
                var border = e.getAttribute("border");
                var isBorder = false;
                if (border) if (parseInt(border) == 1) isBorder = true;
                if (!isBorder) t.layout = 'noBorders';
                ParseContainer(t.table.body, e, p, styles);

                var widths = e.getAttribute("widths");
                if (!widths) {
                    if (t.table.body.length != 0) {
                        if (t.table.body[0].length != 0) for (var k = 0; k < t.table.body[0].length; k++) t.table.widths.push("*");
                    }
                } else {
                    var w = widths.split(",");
                    for (var k = 0; k < w.length; k++) t.table.widths.push(w[k]);
                }
                cnt.push(t);
                break;
            }
            case "tbody": {
                ParseContainer(cnt, e, p, styles);
                break;
            }
            case "tr": {
                var row = [];
                ParseContainer(row, e, p, styles);
                cnt.push(row);
                break;
            }
            case "td": {
                p = CreateParagraph();
                var st = {stack: []}
                st.stack.push(p);

                var rspan = e.getAttribute("rowspan");
                if (rspan) st.rowSpan = parseInt(rspan);
                var cspan = e.getAttribute("colspan");
                if (cspan) st.colSpan = parseInt(cspan);

                ParseContainer(st.stack, e, p, styles);
                cnt.push(st);
                break;
            }
            case "div": {
                p = CreateParagraph();
                var st = {stack: []}
                st.stack.push(p);
                ComputeStyle(st, styles);
                ParseContainer(st.stack, e, p);

                cnt.push(st);
                break;
            }
            default: {
                console.log("Parsing for node " + e.nodeName + " not found");
                break;
            }
        }
        return p;
    }
/*
    function ParseHtml(cnt, html) {
        var elements = [];
        var children = html.children();
        var len = children.length;

        for (var i = 0; i < len; i++) {
            var e = $(children[i]);
            if (e.children().length == 0) {
                ParseElement(elements, e[0]);
            } else {
                ParseHtml(elements, e);
            }
        }
        if (elements.length != 0) cnt.push({ stack: elements });
    }*/

    function ParseNode(cnt, node) {
        if (node.length == 1) {
            var el = node.get(0);
            ParseElement(cnt, el);
        } else {
            var elements = [];
            for (var i = 0; i < node.length; i++) ParseNode(elements, $(node.get(i)));
            if (elements.length != 0) cnt.push({ stack: elements });
        }
    }


    function CreateParagraph() {
        var p = {text:[]};
        return p;
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

    window.tempPrint = function() {
        print2();
    };

    function print2(d) {
        var res = "";
        var o = JSON.parse(d);
        var emptyChar = iasufr.storeGet("print.emptyChar") || "-";
        var fontSize = iasufr.storeGet("print.customFontSize" + opt.code) || 8;
        var pageMargins = "";
        var PAGE_WIDTH = (297 - 10 - 10);
        var pu = new PrintUtils();

        function indexOfRow(tdesc, rid) {
            for (var i = 0; i < tdesc.rows.length; i++) if (tdesc.rows[i].id == rid) return i;
            return -1;
        }

        for (var z = 0 ; z < o.json.length; z++) {
            for (var t = 0; t < o.json[z].tables.length; t++) {
                var tdesc = o.json[z].tables[t];

                if (!pageMargins) if (tdesc.printData.margins) pageMargins = tdesc.printData.margins;
                /*if (tdesc.printData) {
                    if (t != 0) if (tdesc.printData.fromNewPage == 1) content.push({text: "", pageBreak: 'after', pageOrientation: tdesc.printData.portrait == 1 ? 'portrait' : 'landscape'});

                    if (tdesc.printData.caption) {
                        pu.parseHtml(content, tdesc.printData.caption);
                    }
                    if ((z == 0) && (tdesc.printData.portrait == 1)) isPortrait = true;
                }*/

                if (tdesc.printData) {
                    res += tdesc.printData.caption;
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
                var widths = calcWidths(tdesc);

                tdesc.rows.sort(function(a,b) { if (parseInt(a.pos) > parseInt(b.pos)) return 1; else return -1 });

                var tableInitial = '<table border="1" style="table-layout: fixed;font-size: ' + fontSize + 'px;" cellpadding="2" cellspacing="0">';
                var table = /*"<div style='background-color:#FF0000;border:1px solid black;position:fixed;left:0mm;top:0mm;width:185mm;height:40mm'>q</div><div style='page-break-after: always;'>ttttttttttttt</div>" +*/ tableInitial;
                var hasHeader = false;
                var headerDone = false;
                var skipRows = [];
                var hrows = 0;
                var headerOnNewPage = false;

                var headerExisists = tdesc.rows.filter(function(el) { return el.header; }).length !== 0;
                var headerFromNewPageExists = tdesc.rows.filter(function(el) { return el.newpage; }).length !== 0;

                for (var i = 0; i < widths.length; i++) {
                    table += "<col style='width:" + widths[i].toString() + "mm'>";
                }
                if (headerExisists) {
                    table += "<thead>";
                }
                for (var r = 0; r < tdesc.rows.length; r++) {
                    if (!headerDone) {
                        if (headerExisists) {
                            if (headerFromNewPageExists) {
                                if (tdesc.rows[r].newpage === 1 && !headerOnNewPage) {
                                    headerOnNewPage = true;
                                    table += "</thead></table>" + tableInitial;
                                    for (var i = 0; i < widths.length; i++) {
                                        table += "<col style='width:" + widths[i].toString() + "mm'>";
                                    }
                                    table += "<thead>";
                                }
                            } else {

                            }

                            if (!tdesc.rows[r].header && !headerDone) {
                                headerDone = true;
                                table += "</thead>";
                            }
                        }
                        /*if (tdesc.rows[r].header) {
                            if (tdesc.rows[r].newpage === 1 && !headerOnNewPage) {
                                if (hasHeader) {
                                    headerOnNewPage = true;
                                    table += "</thead></table>" + tableInitial + "<thead>";
                                    hrows = 0;
                                }
                            }
                            if (!hasHeader) {
                                hasHeader = true;
                                table += "<thead>";*/
                                /*var maxspan = 0;
                                tdesc.cells.map(function (el) {
                                    if (el.row === tdesc.rows[r].id) {
                                        var v = el.rspan || 0;
                                        if (v > maxspan) maxspan = v;
                                    }
                                });
                                hrows += maxspan;*/
                        /*    }
                        } else {
                            //hrows--;
                            if (hasHeader && hrows <= 0) {
                                table += "</thead>";
                                headerDone = true;
                            }
                        }*/
                    }

                    //if (r > 10) continue;

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
            }
        }

        iasufr.ajax({
            url: "base.Print.cls", data: {
                func: "Test",
                content: res
            },
            success: function(d, res) {
                window.open("/base.Page.cls?&func=View&class=base.Print&iasu=1&pdfdownload=1&file=" + res.json);
            }
        });
    }

    function onDataLoaded(d) {
        print2(d);
        return;
        var o = JSON.parse(d);
        var content  = [];
        var isPortrait = false;
        var pageMargins = "";
        var emptyChar = iasufr.storeGet("print.emptyChar") || "-";
        var fontSize = iasufr.storeGet("print.customFontSize" + opt.code) || 7;

        if (o.json[0].isText == "1") {
            iasufr.print(fillTextData(o.json[0].txtData, o.json[0].savedData));
            iasufr.close(tt);
            return;
        }

        var pu = new PrintUtils();


        function indexOfRow(tdesc, rid) {
            for (var i = 0; i < tdesc.rows.length; i++) if (tdesc.rows[i].id == rid) return i;
            return -1;
        }

        for (var z = 0 ; z < o.json.length; z++) {
            for (var t = 0; t < o.json[z].tables.length; t++) {
                var tdesc = o.json[z].tables[t];
                if (!pageMargins) if (tdesc.printData.margins) pageMargins = tdesc.printData.margins;
                if (tdesc.printData) {
                    if (t != 0) if (tdesc.printData.fromNewPage == 1) content.push({text: "", pageBreak: 'after', pageOrientation: tdesc.printData.portrait == 1 ? 'portrait' : 'landscape'});

                    if (tdesc.printData.caption) {
                        pu.parseHtml(content, tdesc.printData.caption);
                    }
                    if ((z == 0) && (tdesc.printData.portrait == 1)) isPortrait = true;


                }

                var table = {
                    table: {
                        dontBreakRows: true,
                        headerRows: 0,
                        body: []
                    },
                    layout:
                    {
                        hLineWidth: function(i, node)
                        {
                            return (i === 0 || i === node.table.body.length) ? 0.5 : 0.5;
                        }
                    }
                };

                var hasCustomWidths = false;
                if (tdesc.printData.customWidths) hasCustomWidths = tdesc.printData.customWidths.replace(/,/g, "").trim() != "";
                if (hasCustomWidths) {
                    if (iasufr.replaceAll(tdesc.printData.customWidths, ",", "") != "") {
                        var parts = tdesc.printData.customWidths.split(",");
                        table.table.widths = [];
                        for (var ttt = 0; ttt < parts.length; ttt++) {
                            if (parts[ttt] == "") table.table.widths.push("auto");
                            else
                                table.table.widths.push(parts[ttt] + "%");
                        }
                    }
                } else {
                    table.table.widths = [];
                    for (var c = 0; c < tdesc.cols.length; c++) {
                        if (tdesc.cols[c].printWidth) table.table.widths.push(tdesc.cols[c].printWidth + "%");
                        else table.table.widths.push("auto");
                    }
                }
                tdesc.rows.sort(function(a,b) { if (parseInt(a.pos) > parseInt(b.pos)) return 1; else return -1 });

                // Add dynamic rows from input data
                tdesc.inputData.sort(function (a,b) {
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
                                            if (v != undefined) v = parseInt(v);
                                            if (c == 6) {
                                                console.log(v);
                                            }
                                            if (!isNaN(v)) total += v;
                                        }
                                    }
                                    console.log("Total: ", total);
                                    cd.value = FormatValue(total, cd.type);
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


                for (var r = 0; r < tdesc.rows.length; r++) {
                    if (tdesc.rows[r].header) table.table.headerRows++;

                    //if (tdesc.rows[r].header) table.table.headerRows++;
                    var row = [];
                    var skipCols = 0;
                    for (var c = 0; c < tdesc.cols.length; c++) {
                        if (skipCols != 0) {
                            row.push("");
                            skipCols--;
                            continue;
                        }



                        var idx = GetCellIdx(tdesc, tdesc.rows[r].id, tdesc.cols[c].id);
                        var cell = { text: '', fontSize: fontSize };
                        if (idx != -1) {
                            if (tdesc.cells[idx].value == "#COL_NUM#") tdesc.cells[idx].value = (c+1).toString();
                            if (tdesc.cells[idx].value) cell.text = tdesc.cells[idx].value.replace(/\\u0027/g, "'");
                            //cell.text = "test";
                            if (tdesc.cells[idx].rspan) cell.rowSpan = tdesc.cells[idx].rspan;
                            if (tdesc.cells[idx].cspan) {
                                cell.colSpan = tdesc.cells[idx].cspan;
                                skipCols = cell.colSpan - 1;
                            }
                            if (tdesc.cells[idx].indent) cell.margin = [tdesc.cells[idx].indent * 5, 0];
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

                        /*delete cell.alignment;
                        delete cell.bold;
                        delete cell.decoration;
                        delete cell.italics;
                        delete cell.margin;*/
                        if (cell.text == " " || cell.text == "") {
                            if (idx !== -1 && tdesc.cells[idx].readonly == 1)
                                row.push(" ");
                            else {
                                if (!cell.alignment) cell.alignment = "right";
                                cell.text = emptyChar;
                                row.push(cell);
                            }
                        } else row.push(cell);
                    }
                    table.table.body.push(row);
                }
                content.push(table);
                if (tdesc.printData.note) {
                    pu.parseHtml(content, tdesc.printData.note);
                }
                if (tdesc.printData) {
                    if (tdesc.printData.footer) {
                        pu.parseHtml(content, tdesc.printData.footer);
                    }
                }
            }
            if (z != o.json.length - 1) content.push({text:"", pageBreak: 'after'});
        }

        var pm = pageMargins.replace(/,/g, "").trim().split(" ");
        if (pm.length !== 4) pm = [50, 15, 15, 15]; else pm = pm.map(function(el) {return parseInt(el)});

        pdfMake.createPdf({
            content:content,
            pageSize: 'A4',
            pageOrientation: isPortrait ? 'portrait' : 'landscape',
            // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
            pageMargins: pm,
            header: function(page) {
                if (page != 1) return {text: page.toString(), alignment: 'center', fontSize: 8, margin: [0, 11, 0, 0]};
                return "";
            },
            background: function(currentPage) {
                if (o.json[0]) if (o.json[0].tables[0]) if (o.json[0].tables[0].printData) {
                    var pd = o.json[0].tables[0].printData;
                    if (currentPage == 1) {
                        if (pd.colonFirst) {
                            var ccc = [];
                            pu.parseHtml(ccc, pd.colonFirst);
                            return ccc;
                        }
                    } else {
                        if (pd.colonOther) {
                            var ccc = [];
                            pu.parseHtml(ccc, pd.colonOther);
                            return ccc;
                        }
                    }
                }
            }
        }).open();/*getDataUrl(function(outDoc) {
            dhxLayout.cells("a").attachURL(outDoc);
        });*/

        //.download();
         iasufr.close(tt);



    }

    return this;
}
//@ sourceURL=/monu/form/print.js