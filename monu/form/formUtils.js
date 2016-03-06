/**
 * Created by Anton on 05.03.14.
 */

function FormUtils(tableData, period) {
    var t = this;
    t.data = tableData;
    if (t.data) t.data.rows = t.data.rows.sort(function(a,b) { if (parseInt(a.pos) > parseInt(b.pos)) return 1; else return -1 });
    t.grid = undefined;
    t.fd = {};//formula dependientes
    t.recursionCheck = 0;
    t.recursionErrorShowed = false;
    t.alerts = [];
    t.period = parseInt(period);

    t.getColIndex = function(colId) {
        for (var j = 0; j < t.data.cols.length; j++) if (t.data.cols[j].id == colId) return j;
        return -1;
    }

    t.getRowData = function(rowId) {
        for (var i = 0; i < t.data.rows.length; i++) if (t.data.rows[i].id == rowId) return t.data.rows[i];
        return undefined;
    }

    t.getCellData = function(rowId, colId) {
        for (var i = 0; i < t.data.cells.length; i++) if (t.data.cells[i].row == rowId & t.data.cells[i].col == colId) return t.data.cells[i];
    }

    t.onEditCell = function(stage,rId,cInd,nValue,oValue)  {
        var type = 2;
        if (stage == 0) {
            var cd = t.getCellData(rId, t.data.cols[cInd].id);
            if (cd) {
                if (cd.value != undefined && cd.value != "") return false;
                if (cd.readonly == 1) return false;
                if (cd.formula != undefined && cd.formula != "") return false;
                if (cd.type != undefined) type = cd.type;
            }
            if (t.grid) {
                t.grid.cells(rId, cInd).setValue(t.unformatValue(t.grid.cells(rId, cInd).getValue(), type));
                //t.grid.changedCells.push({(idrow: rId, idCol: cInd});
            }
            return true;
        } else
        if (stage == 2) {
            var colId = t.data.cols[cInd].id;
            var cd = t.getCellData(rId, colId);
            if (cd) {
                if (cd.type != undefined) type = cd.type;
            }
            t.recursionCheck = 0;
            t.recursionErrorShowed = false;
            CheckForRecalc(rId, colId);
            return t.formatValue(nValue, type);
        }
        return true;
    }

    t.numberToString = function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    t.unformatValue = function(val, type) {
        if (!val) return val;
        if (val == "") return val;
        if (type === "") type = 2;
        if (type >= 1 && type <= 4) return val.replace(/ /g, "");
        return val;
    }

    t.formatValue = function(val, type) {
        var v;
        if (type === "" || type == undefined) type = 2;
        switch (parseInt(type)) {
            case 0: {
                v = parseInt(val);
                if (isNaN(v)) return ""; else return t.numberToString(v.toFixed(0));
                break;
            }
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6: {
                v = parseFloat(val.toString().replace(",", ".").replace(/ /g, ""));
                if (isNaN(v)) return ""; else return t.numberToString(v.toFixed(type)).replace(".", ",");
                break;
            }
            case 11: {
                v = val.toString().replace(/\D/g,'');
                var year = v.substring(4, 8);
                if (year.length === 1) year = "200" + year;
                if (year.length === 2) year = "20" + year;
                v = v.substring(0, 2) + "." + v.substring(2, 4) + "." + year;
                return v;
                break;
            }
            default: return val; break;
        }
    }

    t.buildGrid = function(grid, notUseFormulas, buildOnlyHeader) {
        t.alerts = [];
        if (notUseFormulas == true) {
            for (var j = 0; j < t.data.cells.length; j++) delete t.data.cells[j].formula;
        }
        // Remove formulas depending on period
        for (var j = 0; j < t.data.cells.length; j++) {
            if (t.data.cells[j].fPeriod !== undefined) {
                var p = t.data.cells[j].fPeriod.split("");
                if (p[0] == "0" && t.period == 1) delete t.data.cells[j].formula;
                if (p[1] == "0" && t.period == 2) delete t.data.cells[j].formula;
                if (p[3] == "0" && t.period == 3) delete t.data.cells[j].formula;
            }
        }
        t.grid = grid;
        grid.clearAll(true);
        grid.setHeader("");
        grid.enableRowspan(true);
        grid.enableCollSpan(true);
        grid.init();
        grid.deleteColumn(0);
        grid.setDelimiter("§");
        //grid.changedCells = [];

        if (!t.evt1) t.evt1 = grid.attachEvent("onEditCell", t.onEditCell);
        if (!t.evt2) t.evt2 = grid.attachEvent("onKeyPress", t.onGridKeyPressed);

        var i, j, str, cspan, rowId, rd, cd, first, m;
        first = true;
        m = {};
        for (j = 0; j < t.data.cols.length; j++) {
            grid.insertColumn(t.data.cols[j].id, "", "ed");
            grid.setColumnId(j, t.data.cols[j].id);
            if (t.data.cols[j].width != undefined && t.data.cols[j].width != 0 && t.data.cols[j].width != "") grid.setColWidth(j, t.data.cols[j].width);
        }
        for (i = 0; i < t.data.rows.length; i++) {
            rowId = t.data.rows[i].id;
            rd = t.getRowData(rowId);
            if (rd) {
                if (rd.header == true) {
                    str = "";
                    cspan = 0;
                    for (j = 0; j < grid.getColumnsNum(); j++) {
                        var colId = grid.getColumnId(j);
                        if (cspan > 1) {
                            str += "#cspan§";
                            cspan--;
                            continue;
                        }
                        if (m[j]) {
                            if (m[j] > 1) {
                                str += "#rspan§";
                                m[j]--;
                                continue;
                            }
                        }
                        cd = t.getCellData(rowId, colId);
                        if (cd) {
                            if (cd.cspan != undefined) cspan = cd.cspan;
                            if (cd.rspan != undefined) m[j] = cd.rspan;
                            if (cd.value != undefined) str += replaceTemplateTags(cd.value, rowId, colId, i, j);
                        }
                        str += "§";
                    }
                    if (str[str.length - 1] == "§") str = str.substr(0, str.length - 1);
                    grid.attachHeader(str, true);
                } else {
                    if (buildOnlyHeader == true) break;
                    grid.addRow(rowId, "");
                }
                if (rd.canAdd) {
                    var ce = grid.cells(rowId, 0);
                    if (ce) {
                        grid.setCellExcellType(rowId, 0, "addBtn");
                        $(ce.cell).attr("data-rid", rowId).click(addDynRow);
                    }
                }
            }
        }

        if (buildOnlyHeader != true) {
            for (i = 0; i < t.data.cells.length; i++) {
               initCell(i);
            }
            if (notUseFormulas != true) BuildFormulaData();
        }
        if (t.alerts.length != 0) {
            var s = "";
            for (var i = 0; i < t.alerts.length; i++) s += t.alerts[i] + ". ";
            iasufr.alert(s);
        }
        grid.setSizes();
        grid.detachHeader(0);


        // auto generate dynamic rows
        for (i = 0; i < t.data.rows.length; i++) {
            rowId = t.data.rows[i].id;
            rd = t.getRowData(rowId);
            if (rd.canAdd > 1) {
                var cnt = rd.canAdd;
                var id = rowId;
                for (var m = 0; m < cnt-1; m++) {
                    var ce = grid.cells(id, 0);
                    if (ce) if (ce.cell.children.length != 0) id = addDynRow({target: ce.cell.children[0]});
                }
            }
        }
    };

    t.recalcFormulas = function() {
        for (var i = 0; i < t.data.cells.length; i++) if (t.data.cells[i].formula != undefined && t.data.cells[i].formula != "") {
            t.recursionCheck = 0;
            CalcFormula(t.data.cells[i].row, t.data.cells[i].col);
        }
    };

    function initCell(i) {
        var rd = t.getRowData(t.data.cells[i].row);
        if (rd) if (rd.header == true) return;
        if (t.data.cells[i].value != undefined) {
            var cidx = t.getColIndex(t.data.cells[i].col);
            if (cidx != -1) {
                try {
                    t.grid.cells(t.data.cells[i].row, cidx).setValue(replaceTemplateTags(t.data.cells[i].value, t.data.cells[i].row, t.data.cells[i].col, t.grid.getRowIndex(t.data.cells[i].row), t.grid.getColIndexById(t.data.cells[i].col)));
                } catch (e) {
                    console.log(e);
                }
            }
        }
        if (t.data.cells[i].rspan) t.grid.setRowspan(t.data.cells[i].row, t.grid.getColIndexById(t.data.cells[i].col), t.data.cells[i].rspan);
        if (t.data.cells[i].cspan) t.grid.setColspan(t.data.cells[i].row, t.grid.getColIndexById(t.data.cells[i].col), t.data.cells[i].cspan);
        updateCellStyle(t.data.cells[i].row, t.data.cells[i].col, t.grid);
    }


    function getNewId() {
        var id = 0;
        //for (var i = 0; i < t.grid.getRowsNum(); i++) if (t.grid.getRowId(i) >= id) id = t.grid.getRowId(i) + 1;
        for (var i = 0; i < t.data.rows.length - 1; i++) if (t.data.rows[i].id >= id) id = t.data.rows[i].id + 1;
        return id;
    }

    t.addDynRow = addDynRow;
    function addDynRow(e, existsRowId, customId) {
        var rowId;
        var newId
        if (existsRowId === undefined) {
            if (!e.target) return;
            if (!e.target.tagName) return;
            if (e.target.tagName.toUpperCase() !== "SPAN") return;
            rowId = $(e.target).parent().attr("data-rid");
        } else rowId = existsRowId;
        if (customId === undefined) newId = getNewId(); else newId = customId;

        //t.grid.setCellExcellType(rowId, 0, "ed");
        var newIdx = t.grid.getRowIndex(rowId) + 1;
        t.grid.addRow(newId, "", newIdx);
        t.grid.setCellExcellType(newId, 0, "addBtn");
        var ce = t.grid.cells(newId, 0);
        $(ce.cell).attr("data-rid", newId).click(addDynRow);

        // copy row data
        var rd = t.getRowData(rowId);
        var newRd = $.extend({}, rd);
        delete rd.canAdd;
        newRd.id = newId;
        newRd.canAdd = 1;
        if (rd.createdFromId) newRd.createdFromId = rd.createdFromId; else newRd.createdFromId = rowId;
        t.data.rows.push(newRd);
        // move all rows down by 1
        for (var i = newIdx; i < t.grid.getRowsNum(); i++) {
            var rd = t.getRowData(t.grid.getRowId(i));
            rd.pos++;
        }

        // copy cell data
        var newCells = [];
        for (var i = 0; i < t.data.cells.length; i++) if (t.data.cells[i].row == rowId) {
            var nc =  $.extend({}, t.data.cells[i]);
            nc.row = newId;
            newCells.push(nc);
        }
        for (var i = 0; i < newCells.length; i++) {
            t.data.cells.push(newCells[i]);
            initCell(t.data.cells.length - 1);
        }
        for (var i = 0; i < t.grid.getColumnsNum(); i++) {
            extendFormulasForNewCell(newId,  t.grid.getColumnId(i), rowId);
        }

        //recalc only if added from button
        if (e) t.recalcFormulas();

        return newId;
    }

    function extendFormulasForNewCell(newId, cId, oldId) {
        var cd = t.getCellData(newId, cId);

        if (cd) if (cd.formula) {
            // replace old row ids to new ids
            var s = cd.formula;
            var cells = s.match(/[^[\]]+(?=])/g);
            if (cells) if (cells.length != 0) {
                for (var i = 0; i < cells.length; i++) {
                    var c = cells[i].split(";");
                    if (!c) continue;
                    if (c.length != 2) continue;
                    if (c[0] == oldId) {
                        s = iasufr.replaceAll(s, "[" + oldId + ";" + c[1] + "]", "[" + newId + ";" + c[1] + "]");
                        if (!t.fd[newId]) t.fd[newId] = {};
                        if (!t.fd[newId][c[1]]) t.fd[newId][c[1]] = [];
                        t.fd[newId][c[1]].push({row: newId, col: cId});
                    }
                }
            }
            cd.formula = s;
        }

        var f = t.fd[oldId];
        if (!f) return;
        f = f[cId];
        if (!f) return;

        // extend all formulas in which cell exists
        for (var i = 0; i < f.length; i++) {
            var fRow = f[i].row;
            var fCol = f[i].col;
            if (fRow == oldId) continue;
            var cd = t.getCellData(fRow, fCol);
            if (!cd) continue;
            if (!cd.formula) continue;

            var formula = cd.formula.replace(/ /g, "");
            var idx = formula.indexOf("[" + oldId + ";" + cId + "]");
            var sign = "+";
            if (idx > 0) sign = formula.substr(idx - 1, 1);
            if (sign != "+" && sign != "-" && sign != "*") sign = "+";

            cd.formula += sign + "[" + newId + ";" + cId + "]";

            // add new dependency
            if (!t.fd[newId]) t.fd[newId] = {};
            if (!t.fd[newId][cId]) t.fd[newId][cId] = [];
            t.fd[newId][cId].push({row: fRow, col: fCol});

        }
    }

    function BuildFormulaData() {
        delete t.fd;
        t.fd = {};
        for (var i = 0; i < t.data.cells.length; i++) if (t.data.cells[i].formula != undefined && t.data.cells[i].formula != "") {
            CalcDependientes(t.data.cells[i].formula, t.data.cells[i].row, t.data.cells[i].col);
        }
        // recalc formulas
        for (var i = 0; i < t.data.cells.length; i++) if (t.data.cells[i].formula != undefined && t.data.cells[i].formula != "") {
            t.recursionCheck = 0;
            CalcFormula(t.data.cells[i].row, t.data.cells[i].col);
        }
    }

    function CalcFormula(rowId, colId) {
        var v;
        if (t.recursionErrorShowed) {
            t.grid.setCellTextStyle(rowId, t.grid.getColIndexById(colId), "border:solid 2px #F00");
            return;
        }
        t.recursionCheck++;
        if (t.recursionCheck > 1000) {
            t.grid.setCellTextStyle(rowId, t.grid.getColIndexById(colId), "border:solid 2px #F00");
            t.recursionErrorShowed = true;
            iasufr.showError("У формi задана циклична формула. Зверниться у службу пiдтримки!");
            return;
        }
        var cd = t.getCellData(rowId, colId);
        if (!cd) return;
        if (cd.formula == undefined || cd.formula == "") return;
        var s = cd.formula;
        var cells = s.match(/[^[\]]+(?=])/g);
        if (cells) if (cells.length != 0) {
            for (var i = 0; i < cells.length; i++) {
                var c = cells[i].split(";");
                if (!c) return;
                if (c.length != 2) return;
                v = 0;
                if (t.grid.doesRowExist(c[0]))
                    v =  t.grid.cells(c[0], t.grid.getColIndexById(c[1])).getValue();
                else {
                    var msg = "У формi не знайден рядок с внутрiшним кодом " + c[0] + ". Вiн бере участь у формулi у клiтики: [рядок ";
                    var rdd = t.getRowData(rowId);
                    if (rdd) {
                        msg += rdd.code + ", стовбчик " + (t.grid.getColIndexById(colId) + 1).toString() + "]";
                        var gridCell = t.grid.cellById(rowId, t.grid.getColIndexById(colId) );
                        if (gridCell) if (gridCell.cell) $(gridCell.cell).addClass("cell-formula-red");
                    }
                    if (t.alerts.indexOf(msg) == -1) t.alerts.push(msg);
                }
                if (v == undefined || v == "") v = "0";
                v = v.replace(",", ".").replace(/ /g, "");
                v = parseFloat(v);
                if (isNaN(v)) v = 0;
                //s = s.replace(new RegExp("[" + cells[i] + "]", 'g'), v);
                s = iasufr.replaceAll(s, "[" + cells[i] + "]", v.toString());
                //s = s.split("[" + cells[i] + "]").join(v);
            }
        }
        try {
            v = eval(s.replace(/,/g,"."));
            if (isNaN(v) || v == Infinity) v = 0;
            t.grid.cells(rowId, t.grid.getColIndexById(colId)).setValue(t.formatValue(v, cd.type));
            CheckForRecalc(rowId, colId);
        } catch (e) { }
    }

    function CalcDependientes(f, row, col) {
        var s = f;
        var cells = s.match(/[^[\]]+(?=])/g);
        if (cells) if (cells.length != 0) {
            for (var i = 0; i < cells.length; i++) {
                var c = cells[i].split(";");
                if (!c) {
                    console.log("Помилка у формулi: " + cells[i]);
                    return s;
                }
                if (c.length != 2) {
                    console.log("Помилка у формулi: " + cells[i]);
                    return s;
                }
                if (t.getRowData(c[0]) && t.getColIndex(c[1]) != -1) {
                    if (!t.fd[parseInt(c[0])]) {
                        t.fd[parseInt(c[0])] = {};
                        t.fd[parseInt(c[0])][parseInt(c[1])] = [];
                    } else
                        if (!t.fd[parseInt(c[0])][parseInt(c[1])]) t.fd[parseInt(c[0])][parseInt(c[1])] = [];
                    t.fd[parseInt(c[0])][parseInt(c[1])].push({row: row, col: col });
                }
            }
        }
    }

    function updateCellStyle(rowId, colId, grid) {
        var cd = t.getCellData(rowId, colId);
        var style = "";
        if (cd) {
            if (cd.fontsize) style += "font-size: " + cd.fontsize + "px;";
            if (cd.font) {
                if ((cd.font & 2) != 0) style += "font-weight: bold;";
                if ((cd.font & 4) != 0) style += "text-decoration: underline;";
                if ((cd.font & 8) != 0) style += "font-style: italic;";
            }
            if (cd.indent != undefined) style += "padding-left: " + (10 * parseInt(cd.indent)).toString() + "px;";
            if (cd.align != undefined) {
                switch (cd.align) {
                    case 1: style += "text-align: center;"; break;
                    case 2: style += "text-align: right;"; break;
                }
            }
            if (cd.valign != undefined) {
                switch (parseInt(cd.valign)) {
                    case 1: style += "vertical-align: top;"; break;
                    case 2: style += "vertical-align: bottom;"; break;
                }
            }
            if (cd.fontcolor != undefined && cd.fontcolor != "") style += "color: " + cd.fontcolor + ";";
            if (cd.bgcolor != undefined && cd.bgcolor != "") style += "background-color: " + cd.bgcolor + ";";
            if (cd.formula != undefined && cd.formula != "") style += "background-color: rgb(216, 216, 216);";
            //if (cd.value != undefined && cd.value != "") style += "background-color: #fef";
        }
        grid.setCellTextStyle(rowId, grid.getColIndexById(colId), style);
    }


    function replaceTemplateTags(str, rId, cId, rIdx, cIdx) {
        var s = str;
        s = iasufr.replaceAll(s, "\\u0027", "'");
        s = s.replace("#COL_NUM#", cIdx + 1);
        s = s.replace("#ROW_NUM#", rIdx + 1);
        if (t.data.cols[cIdx]) s = s.replace("#COL_NAME#", t.data.cols[cIdx].name);
        s = s.replace("#DATE#", (new Date()).toLocaleDateString());
        var rd = t.getRowData(rId);
        if (rd) {
            s = s.replace("#ROW_CODE#", rd.code != undefined ? rd.code : "");
            s = s.replace("#KEKV_CODE#", rd.kekv != undefined ? rd.kekv : "");
        }
        return s;
    }

    t.onGridKeyPressed = function onGridKeyPressed(code,ctrl,shift){
        var rowId = t.grid.getSelectedRowId();
        var colIdx = t.grid.getSelectedCellIndex();
        var cd;
        if (code == 46) {
            cd = t.getCellData(rowId, t.grid.getColumnId(colIdx));
            if (cd) if (cd.readonly == 1 || (cd.value != undefined && cd.value != "")) return false;
            t.grid.cells(rowId, colIdx).setValue("");
            CheckForRecalc(rowId, t.grid.getColumnId(colIdx));
            return false;
        }
        if (code == 67 && ctrl) {
            t.clipboard = t.grid.cells(rowId, colIdx).getValue();
            return false;
        }
        if (code == 86 && ctrl) {
            var type = 2;
            cd = t.getCellData(rowId, t.grid.getColumnId(colIdx));
            if (cd) {
                if (cd.type != undefined) type = cd.type;
                if (cd.formula || cd.readonly == 1 || (cd.value != undefined && cd.value != "")) return false;
            }
            if (t.clipboard) {
                t.grid.cells(rowId, colIdx).setValue(t.formatValue(t.clipboard, type));
                CheckForRecalc(rowId, t.grid.getColumnId(colIdx));
            }
        }
        if (code == 37 || code == 38 || code == 39 || code == 40) t.grid.editStop();
        return true;
    }

    function CheckForRecalc(rowId, colId) {
        if (t.fd[rowId]) if (t.fd[rowId][colId]) {
            for (var i = 0; i < t.fd[rowId][colId].length; i++) CalcFormula(t.fd[rowId][colId][i].row, t.fd[rowId][colId][i].col);
        }
    }

    return this;
}



function eXcell_addBtn(cell){ //the eXcell name is defined here
    if (cell){                // the default pattern, just copy it
        this.cell = cell;
        this.grid = this.cell.parentNode.grid;
        eXcell_ed.call(this); //uses methods of the "ed" type
    }
    //this.edit = function(){}  //read-only cell doesn't have edit method
    //this.isDisabled = function(){ return true; } // the cell is read-only, so it's always in the disabled state
    this.setValue=function(val){
        this.setCValue("<span class='add-btn'></span>" + val, val);
    };

    this.getValue=function(){
        var r = this.cell.innerHTML;
        var parts = r.split("</span>");
        if (parts.length < 2) return "";
        return parts[1];
    }
}
eXcell_addBtn.prototype = new eXcell;

//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/form/formUtils.js