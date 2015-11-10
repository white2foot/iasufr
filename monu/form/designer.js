/**
 * Created by Anton on 27.02.14.
 */
if (!window.Frm) Frm = {};
if (!Frm.Design) Frm.Design = {};

// TODO: проверить ошибку при объединении ячеек
// [*] при добавлении стобца добавлять текст в первую строку
// [*] Проставлять название при задании КЕКВ

// [*] привязать подсветку формул к гриду
// [*] при нескольких окнах формулы подсвечиваются не корректно
// [*] Даблклик на формуле
// [*] убирать подсветку при закрытии
// [*] сделать подсветку формул в окне и учитывать скролл
// [*] несколько окон дизайнера
// [*] Сохранение и загрузка из БД
// [*] после снятия объединения, восстанавливать прорисовку ячеек
// [*] фокусировать на ячейке после объединения
// [*] проверить при очистке, есть ли очистка объединения ччеек
// [*] визуальная поддержка объединения ячеек
// [*] Копирование блока текста
// [*] Проставить КЕКВ по данным ячеек
// [*] При изменении данных ячейки выделять весь текст в поле ввода
// [*] Проставить код строки по данным ячеек
// [*] Не давать вводить код рядка если такой уже есть
// [*] Поддержка ширины
// [*] нельзя убрать заголовок в середине заголовка
// [*] при смене колонки обновлять id колонки в формулах
// [*] кнопка очистки вего формата, типа и настроек ячейки(кроме значения и формул)
// [*] подсветка формул при перемещении
// [*] удалять 0 при вставке формулы, если она выходит за пределы
// [*] нельзя вводить текст поверх формулы
// [*] Поле для ввода значения ячейки или формулы
// [*] При смене столбца обновлять id в данных таблицы
// [*] Рефакторинг, вынести в отдельный js работу с таблицей
// [*] сбрасывать тип если выделено несколько ячеек
// [*] поддержка типа при вводе данных
// [*] уходить стрелками при вводе данных
// [*] копирование при вводе данных
// [*] цвет шрифта и заднего фона ячейки
// [*] Задание формул через right+клик
// [*] копирование формул
// [*] проверить удаление формул через del
// [*] при удалении через del пересчитывать формулу
// [*] показывать +-infinity как 0
// [*] Ввод формул
// [*] подсветка формул
// [*] Удалять свойства из cellData при очистке данных ячеки, выравнивании и т.п.
// [*] При записи писать только заполненную сellData
// [*] При удалении столбца или строки удалять ссылки на него из данных таблицы

Frm.Design.Create = function(opt) {
    var t = iasufr.initForm(this, opt);
    t.supportSpan = true;
    t.idTable = opt.id;

    var l = new dhtmlXLayoutObject(t.owner, "2U");
    l.cells("a").setWidth(186);
    l.cells("a").hideHeader();
    l.cells("a").fixSize(true, true);
    l.cells("b").hideHeader();

    iasufr.loadStyle('/monu/form/designer.css');

    var tb = l.attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(16);
    tb.addButton("save", 1, iasufr.lang.ui.save, "16/database_save.png", "");
    //tb.addText("txt", 2, "<b>Форма: </b>");
    tb.addSeparator("sep", 3);
    tb.addButton("download", 4, " Зберегти у файл", "16/download.png", "");
    if (File != undefined) tb.addButton("upload", 5, " Завантажити з файлу", "16/sql_server.png", "");
    tb.addButton("close", 6, iasufr.lang.ui.close, "16/door.png", "");
    tb.attachEvent("onClick", onToolbarClick);

    // Tabs ----------------------
    var tabs = l.cells("b").attachTabbar();
    tabs.setImagePath(iasufr.const.IMG_PATH);
    tabs.addTab("t1", "Редагування таблицi", 160, 1);
    tabs.addTab("t2", "Попереднiй перегляд", 160, 2);
    tabs.addTab("t3", "Перегляд друку", 160, 2);
    tabs.setTabActive("t1");
    tabs.attachEvent("onTabClick", function(id){ if (id == "t2") BuildPreview(SerializeTable()); if (id == "t3") PreviewPrint(); return true; });

    var tb2 = tabs.cells("t1").attachToolbar();
    tb2.addText("cell", 1, "");
    tb2.addInput("value", 2, "", 800);
    tb2.setWidth("cell", 40);
    $(tb2.getInput("value")).keydown(onEditorKeydown).keyup(onEditorKeydown).on("input", onEditorChange).click(onEditorKeydown);
    // Grids ----------------------
    var g = tabs.cells("t1").attachGrid();
    g.setImagePath(iasufr.const.IMG_PATH);
    g.setHeader("");
    g.setInitWidths("*");
    g.setColAlign("left");
    g.setColTypes("ed");
    g.enableColumnMove(true);

    g.enableRowspan(true);
    g.enableCollSpan(true);

    g.init();
    g.addRow(1, "");
    g.deleteColumn(0);
    g.enableBlockSelection(true);
    if (t.supportSpan) enableSmartNavigation(g);
    g.attachEvent("onScroll", onGridScroll);
    g.attachEvent("onRowSelect", onCellSelect);
    g.attachEvent("onEditCell", onEditCell);
    g.attachEvent("onKeyPress", onGridKeyPressed);
    g.attachEvent("onResize", onColumnResize);
    g.attachEvent("onRightClick", onGridRightClick);
    g.attachEvent("onBeforeBlockSelected", function(){
        frm.setItemValue("type", "");
        ClearHighlight();
        return true;
    });
    g.setStyle("", "", "background-image: none; background-color: #93C0E7;", "background-image: none; background-color: #ddffdd;");

    var prev;
    prev = tabs.cells("t2").attachGrid();
    prev.setImagePath(iasufr.const.IMG_PATH);
    prev.setHeader("");
    prev.setInitWidths("*");
    prev.setColAlign("left");
    prev.setColTypes("ed");
    prev.enableColumnMove(true);
    prev.enableMultiline(true);
    prev.init();

    /*
    dhtmlXForm.prototype.setFormData_btn2state = function(name, value) {
        this[value==true||parseInt(value)==1||value=="true"||value==this.getItemValue(name)?"checkItem":"uncheckItem"](a);
    };
    dhtmlXForm.prototype.getFormData_btn2state = function(name) {
        return (this.isItemChecked(name)?this.getItemValue(name):0);
    };*/

    var dkey = new Date().valueOf();
    // Form properties -----------------------
    var str = [
        { type:"settings", position: "label-top", inputWidth: 170, offsetTop: 0, offsetLeft : 4, blockOffset: 4},
        {type: "label", label: "Рядок", className: "form-section", offsetLeft : 1},
            { type:"button", name: "addRowUp", value:'<span class="btn-span-left"><img src="/images/icons/16/table_row_insert.png" class="frm-btn-img"> Додати рядок сверху</span>', width: 170 },
            { type:"button", name: "addRowDown", value:'<span class="btn-span-left"><img src="/images/icons/16/table_row_insert.png" class="frm-btn-img"> Додати рядок знизу</span>', width: 170 },
            {type: "block", width: 184, offsetLeft: 0, list:[
                { type:"button", name: "moveRowUp", offsetLeft: 0, value:'<span class="btn-span-left"><img src="/images/icons/16/arrow_up.png" class="frm-btn-img"> Вгору</span>', width: 83 },{type: "newcolumn"},
                { type:"button", name: "moveRowDown", offsetLeft: 0, value:'<span class="btn-span-left"><img src="/images/icons/16/arrow_down.png" class="frm-btn-img"> Вниз</span>', width: 83 }
            ]},
            { type:"button", name: "delRow", value:'<span class="btn-span-left"><img src="/images/icons/16/table_row_delete.png" class="frm-btn-img"> Видалити рядок</span>', width: 170 },
            {type: "block", width: 184, offsetLeft: 0, list:[
                { type:"input", name: "code", label:'Код рядка', width: 80 },{type: "newcolumn"},
                { type:"input", name: "kekv", label:'КЕКВ', width: 80 },
                { type:"input", name: "canAdd", label:'Дiнамiчний рядок', width: 80 }
            ]},
            { type:"checkbox", name: "header", position: "label-right", label:'Заголовок' },
            { type:"checkbox", name: "newpage", position: "label-right", label:'Друк на новій стор.' },
            //{ type:"checkbox", name: "canAdd", position: "label-right", label:'Може додаватися' },
            {type: "label", label: "Стовпчик", className: "form-section", offsetLeft : 1},
            {type: "block", width: 184, offsetLeft: 0, list:[
                { type:"button", name: "addCol", offsetLeft: 0, value:'<span class="btn-span-left"><img src="/images/icons/16/tab_add.png" class="frm-btn-img"> Додати</span>', width: 80 },{type: "newcolumn"},
                { type:"button", name: "delCol", offsetLeft: 0, value:'<span class="btn-span-left"><img src="/images/icons/16/tab_delete.png" class="frm-btn-img"> Видалити</span>', width: 86 }
            ]},
            { type:"input", name: "col", label:'Показник' },
            { type:"input", name: "width", label:'Ширина друку(%)' },
            { type:"input", name: "subtotal", label:'Проміжний підсумок' },
            { type:"input", name: "subtotalTitle", label:'Текст підсумка' },
            { type:"label" },
        {type: "label", label: "Клiтинка", className: "form-section", offsetLeft : 1 },
                {type: "block", width: 180, offsetLeft: 0, offsetTop: 2, list:[
                    {type: "btn2state", name: "bold", width: 16, offsetLeft: 0},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/text_bold.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                    {type: "btn2state", name: "italic", width: 16, offsetLeft: 1},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/text_italic.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                    {type: "btn2state", name: "underline", width: 16, offsetLeft: 1},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/text_underline.png">', className: "frm-lbl-img" },{type: "newcolumn"},

                    {type: "btn2state", name: "left", checked: true, width: 16, offsetLeft: 10},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/text_align_left.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                    {type: "btn2state", name: "center", width: 16, offsetLeft: 1},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/text_align_center.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                    {type: "btn2state", name: "right", width: 16, offsetLeft: 1},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/text_align_right.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                    {type: "btn2state", name: "clearFormat", width: 16, offsetLeft: 10 },{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/draw_eraser.png">', className: "frm-lbl-img" }
                ]},
                {type: "block", width: 180, offsetLeft: 0, offsetTop: 0, list:[
                    {type: "btn2state", name: "sumUp", width: 16, offsetLeft: 0},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/sum_up.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                    {type: "btn2state", name: "sumDown", width: 16, offsetLeft: 1},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/sum_down.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                    {type: "btn2state", name: "insTag", width: 16, offsetLeft: 1},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/tag_hash.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                    {type: "btn2state", name: "merge", width: 16, offsetLeft: 10},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/table_select.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                    {type: "btn2state", name: "split", width: 16, offsetLeft: 1},{type: "newcolumn"},
                    {type:"label", label:'<img src="/images/icons/16/table_select_cell.png">', className: "frm-lbl-img" },{type: "newcolumn"},
                ]},
                {type: "select", name: "type", options:[
                    {text: "", value: ""},
                    {text: "Ціле число", value: 0},
                    {text: "Грошовий 0.0", value: 1},
                    {text: "Грошовий 0.00", value: 2},
                    {text: "Грошовий 0.000", value: 3},
                    {text: "Грошовий 0.0000", value: 4},
                    {text: "Грошовий 0.00000", value: 5},
                    {text: "Грошовий 0.000000", value: 6},
                    {text: "Текстовий", value: 10},
                    {text: "Дата", value: 11}
                ]},
                { type: "block", width: 180, offsetTop: 6, offsetLeft: 0, list:[
                    { type:"input", name: "indent", width: 53, offsetLeft: 0},{type: "newcolumn"},
                    { type:"input", name: "cspan", width: 53 },{type: "newcolumn"},
                    { type:"input", name: "rspan", width: 52 }
                ]},
                { type: "block", width: 180, offsetTop: 24, offsetLeft: 0, list:[
                    { type:"input", name: "fontsize", width: 53, offsetLeft: 0},{type: "newcolumn"},
                    {type: "select", name: "valign", width: 111, options:[
                        {text: "Посередині", value: 0},
                        {text: "Зверху", value: 1},
                        {text: "Знизу", value: 2}
                    ]}
                ]},
                { type: "block", width: 180, offsetLeft: 0, offsetTop:26, list:[
                    {type: 'colorpicker', name: 'fontcolor'+dkey , offsetLeft: 0, value:"#6EEA11", imagePath: iasufr.const.IMG_PATH, width: 82},{type: "newcolumn"},
                    {type: 'colorpicker', name: 'bgcolor'+dkey, offsetLeft: 4, value:"#6EEA11", imagePath: iasufr.const.IMG_PATH, width: 82}
                ]},
                { type:"checkbox", name: "readonly", position: "label-right", label:'Тiльки перегляд' },
                {type: "block", width: 184, offsetLeft: 0, list:[
                    { type:"button", name: "fixKazn", offsetLeft: 0, value:'<span class="btn-span-left">Фiкс. казн.</span>', width: 83 },{type: "newcolumn"},
                    { type:"button", name: "fixMonu", offsetLeft: 0, value:'<span class="btn-span-left">Фiкс. МОН</span>', width: 83 }
                ]},
                { type:"button", name: "unfix", value:'<span class="btn-span-left">Зняти фiксацiю</span>', width: 170 },
                { type:"label" },

                { type: "label", label: "Формула дiє", className: "form-section", offsetLeft : 1},
                {type: "block", width: 180, offsetLeft: 0, offsetTop: 0, list:[
                    {type: "checkbox", label: "М", name: "fM", width: 16, offsetLeft: 0, position:"label-left"},{type: "newcolumn"},
                    {type: "checkbox", label: "К", name: "fK", width: 16, offsetLeft: 1, position:"label-left"},{type: "newcolumn"},
                    {type: "checkbox", label: "Р", name: "fY", width: 16, offsetLeft: 1, position:"label-left"}
                ]}
    ];
    var frm = l.cells("a").attachForm(str);
    $(frm.getInput("subtotal")).keydown(blurOnEnter);
    $(frm.getInput("subtotalTitle")).keydown(blurOnEnter);
    $(frm.getInput("code")).keydown(blurOnEnter);
    $(frm.getInput("indent")).keydown(blurOnEnter).addClass("fd-txt-indent").attr("title", "Вiдступ");
    $(frm.getInput("cspan")).keydown(blurOnEnter).addClass("fd-txt-cspan").attr("title", "Об'єднує клiтинок по горизонталі");
    $(frm.getInput("rspan")).keydown(blurOnEnter).addClass("fd-txt-rspan").attr("title", "Об'єднує клiтинок по вертикалі");
    $(frm.getInput("fontcolor"+dkey)).keydown(blurOnEnter).addClass("fd-txt-font").attr("title", "Колiр шрифту");
    $(frm.getInput("bgcolor"+dkey)).keydown(blurOnEnter).addClass("fd-txt-fill").attr("title", "Колiр клiтинки");
    $(frm.getSelect("type")).keydown(blurOnEnter).addClass("fd-txt-type").attr("title", "Тип даних");
    $(frm._getItemByName("subtotal")).attr("title","Номера стовпцiв по якiм робити пiдсумок. Наприклад: 4,5,8");
    $(frm._getItemByName("bold")).attr("title","Жирний");
    $(frm._getItemByName("italic")).attr("title","Курсив");
    $(frm._getItemByName("underline")).attr("title","Пiдкреслений");
    $(frm._getItemByName("left")).attr("title","Вирівняти по лівому краю");
    $(frm._getItemByName("center")).attr("title","Вирівняти по центру");
    $(frm._getItemByName("right")).attr("title","Вирівняти по правому краю");
    $(frm._getItemByName("sumUp")).attr("title","Зробити iтог з верху");
    $(frm._getItemByName("sumDown")).attr("title","Зробити iтог з низу");
    $(frm._getItemByName("clearFormat")).attr("title","Очистити формат та налаштування");
    $(frm._getItemByName("insTag")).attr("title","Вставити тег");
    $(frm._getItemByName("merge")).attr("title","Об'єднати клiтинки");
    $(frm._getItemByName("split")).attr("title","Роз'єднати клiтинки");
    $(frm._getItemByName("fontsize")).keydown(blurOnEnter).attr("title","Розмiр шрифту");
    $(frm._getItemByName("valign")).attr("title","Вирівнювання по вертикалі");
    $(frm._getItemByName("canAdd")).keydown(blurOnEnter).attr("title","Рядок який може клонувати користувач. Якщо не 0, то це кiлькiсть рядкив якi треба створити автоматично");

    frm.attachEvent("onButtonClick", onFormButtonClick);
    frm.attachEvent("onChange", onFormChange);
    iasufr.attachSelector(frm.getInput("col"), "Columns", {onShow: ClearHighlight, onSelect: SelectColumn});
    iasufr.attachSelector(frm.getInput("kekv"), "Kekvs", {width: 700, height: 480, onShow: ClearHighlight, onSelect: SelectKekv});

    var rowData = {};
    var colData = [];
    var cellData = [];
    var clipboard;
    var highlight = [];
    var colPrnWidths = {};
    var evtClose = iasufr.wins.attachEvent("onClose", onClose);
    if (t.idTable != undefined) LoadData();


    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function onClose(win) {
        if (win == t.owner) {
            ClearHighlight();
            iasufr.wins.detachEvent(evtClose)
        }
        return true;
    };

    function onGridScroll(sLeft,sTop){
        for (var i = 0; i < highlight.length; i++) {
            var c = g.cells(highlight[i].row, highlight[i].col).cell;
            if (!c) continue;
            var ofs = $(g.entBox).offset();
            var pos = g.getPosition(c);
            pos[0] = pos[0] - ofs.left;
            pos[1] = pos[1] - ofs.top;
            highlight[i].el.css("left", pos[0] + 1 + "px").css("top", pos[1] + 1 + "px")
        }
        return true;
    }

    function onColumnResize(cInd,cWidth,obj){
        for (var i = 0; i < highlight.length; i++) if (highlight[i].col == cInd) {
            var c = g.cells(highlight[i].row, cInd).cell;
            if (!c) continue;
            var pos = g.getPosition(c);
            highlight[i].el.width(c.offsetWidth - 3);
            highlight[i].el.height(c.offsetHeight - 3);
            highlight[i].el.css("left", pos[0] + 1 + "px").css("top", pos[1] + 1 + "px")
        }
        return true;
    }

    function RemoveHighlight(rowId, colIdx) {
        var i = 0;
        while (i < highlight.length) {
            if (highlight[i].el.attr("rowId") == rowId && highlight[i].el.attr("colIdx") == colIdx) {
                highlight[i].el.remove();
                highlight.splice(i, 1);
            } else i++;
        }
    }

    function HighlightCell(rowId, colIdx, bgColor, txt) {
        var c = g.cells(rowId, colIdx).cell;
        if (!c) return;
        //console.log(g.entBox);
        var ofs = $(g.entBox).offset();
        var pos = g.getPosition(c);
        pos[0] = pos[0] - ofs.left;
        pos[1] = pos[1] - ofs.top;
        var $div = $("<div></div>").text(txt)
            .css("left", pos[0]+1 + "px")
            .css("top", pos[1]+1 + "px")
            .css("width", c.offsetWidth-3 + "px")
            .css("background-color", bgColor)
            .css("height", c.offsetHeight-3 + "px")
            .attr("rowId", rowId)
            .attr("colIdx", colIdx)
            .attr("col", bgColor)
            .addClass("fm-formula-hl");
        $div.appendTo(g.entBox);
        highlight.push({el: $div, row: rowId, col: colIdx});
    }

    function ClearHighlight() {
        while (highlight.length != 0) {
            highlight[0].el.remove();
            highlight.splice(0, 1);
        }
    }

    function onCellSelect(ind, col) {
        tb2.setItemText("cell", "");
        var rowId = g.getSelectedRowId();
        var colId = g.getColumnId(col);
        if (colId == undefined || rowId == undefined) return;
        ClearHighlight();
        tb2.setItemText("cell", "[" + rowId + ";" + colId + "]=");
        tb2.setValue("value", "");
        frm.setItemValue("col", /*"(" + colId + ") " + */g.getColumnLabel(col));
        frm.setItemValue("newpage", 0);
        frm.setItemValue("header", 0);
        frm.setItemValue("canAdd", 0);
        frm.setItemValue("kekv", "");
        frm.setItemValue("code", rowId);
        frm.setItemValue("fontsize", "");
        frm.setItemValue("type", "");
        frm.setItemValue("valign", 0);
        frm.setItemValue("indent", "");
        frm.setItemValue("bold", 0);
        frm.setItemValue("underline", 0);
        frm.setItemValue("italic", 0);
        frm.setItemValue("left", 1);
        frm.setItemValue("readonly", 0);
        frm.setItemValue("left", 1);
        frm.setItemValue("center", 0);
        frm.setItemValue("right", 0);
        frm.setItemValue("rspan", "");
        frm.setItemValue("cspan", "");
        frm.setItemValue("fontcolor"+dkey, "");
        frm.setItemValue("bgcolor"+dkey, "");
        frm.setItemValue("fM", 1);
        frm.setItemValue("fK", 1);
        frm.setItemValue("fY", 1);

      /*  var bl = g.getSelectedBlock();
        if (bl) {
            frm.setItemValue("type", -1);
        }*/

        if (colPrnWidths[col]) {
            frm.setItemValue("width", colPrnWidths[col]);
        } else frm.setItemValue("width", "");


        var cold = colData[colId];
        frm.setItemValue("subtotal", "");
        frm.setItemValue("subtotalTitle", "");
        if (cold) {
            frm.setItemValue("subtotal", cold.subtotal);
            frm.setItemValue("subtotalTitle", cold.subtotalTitle);
        }

        var rd = rowData[rowId];
        if (rd) {
            if (rd.code != undefined && rd.code != "") {
                frm.setItemValue("code", rd.code);
                tb2.setItemText("cell", "[" + rd.code + ";" + colId + "]=");
            }
            frm.setItemValue("kekv", rd.kekv);
            frm.setItemValue("header", rd.header);
            frm.setItemValue("canAdd", rd.canAdd);
            frm.setItemValue("newpage", rd.newpage);
        }

        var cd = getCellData(rowId, colId);
        if (cd) {
            if (cd.fPeriod !== undefined && cd.fPeriod !== 0) {
                var p = cd.fPeriod.split("");
                frm.setItemValue("fM", p[0] == "1" ? 1:0);
                frm.setItemValue("fK", p[1] == "1" ? 1:0);
                frm.setItemValue("fY", p[2] == "1" ? 1:0);
            }
            if (cd.value != undefined) tb2.setValue("value", cd.value);
            if (cd.formula != undefined) tb2.setValue("value", "=" + PlaceRowCodesInFormula(cd.formula));

            if (cd.valign != undefined) frm.setItemValue("valign", cd.valign);
            if (cd.type != undefined) frm.setItemValue("type", cd.type);
            if (cd.indent != undefined) frm.setItemValue("indent", cd.indent);
            if (cd.font != undefined) {
                frm.setItemValue("bold", (cd.font & 2) != 0 ? 1:0);
                frm.setItemValue("underline", (cd.font & 4) != 0 ? 1:0);
                frm.setItemValue("italic", (cd.font & 8) != 0 ? 1:0);
            }
            if (cd.align != undefined) {
                switch (cd.align) {
                    case 1:frm.setItemValue("center", 1);frm.setItemValue("left", 0);break;
                    case 2:frm.setItemValue("right", 1);frm.setItemValue("left", 0);break;
                }
            }
            if (cd.fontsize != undefined) frm.setItemValue("fontsize", cd.fontsize);
            if (cd.readonly != undefined) frm.setItemValue("readonly", cd.readonly);
            if (cd.cspan != undefined) frm.setItemValue("cspan", cd.cspan);
            if (cd.rspan != undefined) frm.setItemValue("rspan", cd.rspan);
            if (cd.fontcolor != undefined) frm.setItemValue("fontcolor"+dkey, cd.fontcolor);
            if (cd.bgcolor != undefined) frm.setItemValue("bgcolor"+dkey, cd.bgcolor);
            if (cd.formula != undefined && cd.formula != "") HighlightFormulaCells(cd.formula);
        }
        g._HideSelection();
    }

    function curRow(){
        return g.getRowIndex(g.getSelectedRowId());
    }

    function onFormButtonClick(name) {
        var colIdx = g.getSelectedCellIndex();
        var colId = g.getColumnId(g.getSelectedCellIndex());
        var rowIdx = g.getRowIndex(g.getSelectedRowId());
        var rowId = g.getSelectedRowId();
        switch (name) {
            case "addCol": {
                ClearHighlight();
                iasufr.loadForm("Columns", {selectMulti: true, onSelect: AddColumns});
                break;
            }
            case "delCol": {
                if (colId == undefined || colIdx == undefined) return;
                iasufr.confirm("Видалити стовпчик " + g.getColumnLabel(colIdx) + "?", function() {
                    var i = 0;
                    var colId = g.getColumnId(colIdx);
                    while (i < cellData.length) {
                        if (cellData[i].col == colId) cellData.splice(i, 1); else i++;
                    }
                    g.deleteColumn(g.getSelectedCellIndex());
                    if (g.getColumnsNum() != 0) g.selectCell(curRow(), g.getColumnsNum() - 1, true);
                });
                break;
            }
            case "addRowDown": {
                var newId = getNewId();
                g.addRow(newId, "", rowIdx+1);
                rowData[newId] = {};
                g.selectCell(rowIdx+1, colIdx, true);
                break;
            }
            case "addRowUp": {
                var newId = getNewId();
                g.addRow(newId, "", rowIdx);
                rowData[newId] = {};
                g.selectCell(rowIdx, colIdx, true);
                break;
            }
            case "delRow": {
                iasufr.confirm("Видалити рядок?", function(){
                    delete rowData[rowId];
                    var i = 0;
                    while (i < cellData.length) {
                        if (cellData[i].row == rowId) cellData.splice(i, 1); else i++;
                    }
                    g.deleteRow(g.getSelectedRowId());
                    if (rowIdx > g.getRowsNum()-1) rowIdx = g.getRowsNum()-1;
                    g.selectCell(rowIdx, colIdx, true);
                });
                break;
            }
            case "moveRowUp": {
                var isHeader = false;
                if (rowData[rowId]) if (rowData[rowId].header == true) isHeader = true;
                if (!isHeader) {
                    var prevIdx = rowIdx - 1;
                    var prevIdx = g.getRowId(prevIdx);
                    if (prevIdx) if (rowData[prevIdx]) if (rowData[prevIdx].header == true) {
                        dhtmlx.message("Неможливо зрушити звичайный рядок у заголовок.");
                        return;
                    }
                }
                g.moveRow(rowId,"up");
                break;
            }
            case "moveRowDown": {
                var nextIdx = rowIdx + 1;
                var nextId = g.getRowId(nextIdx);
                if (rowData[rowId]) if (rowData[rowId].header == true) if (nextId) if (rowData[nextId]) if (rowData[nextId].header != true) {
                    dhtmlx.message("Неможливо зрушити заголовок у низ.");
                    return;
                }
                g.moveRow(rowId,"down");
                break;
            }
            case "fixKazn": {
                var bl = g.getSelectedBlock();
                if (bl) {
                    for (var i = bl.LeftTopRow; i <= bl.RightBottomRow; i++) {
                        for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                            setCellData(g.getRowId(i), g.getColumnId(j), {fixedKazn: 1});
                            UpdateCellStyle(g.getRowId(i), j);
                        }
                    }
                    return false;
                } else {
                    setCellData(g.getSelectedRowId(), g.getColumnId(colIdx), {fixedKazn: 1});
                    UpdateCellStyle(g.getSelectedRowId(), colIdx);
                    return false;
                }
            }
            case "fixMonu": {
                var bl = g.getSelectedBlock();
                if (bl) {
                    for (var i = bl.LeftTopRow; i <= bl.RightBottomRow; i++) {
                        for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                            setCellData(g.getRowId(i), g.getColumnId(j), {fixedMonu: 1});
                            UpdateCellStyle(g.getRowId(i), j);
                        }
                    }
                    return false;
                } else {
                    setCellData(g.getSelectedRowId(), g.getColumnId(colIdx), {fixedMonu: 1});
                    UpdateCellStyle(g.getSelectedRowId(), colIdx);
                    return false;
                }
            }
            case "unfix": {
                var bl = g.getSelectedBlock();
                if (bl) {
                    for (var i = bl.LeftTopRow; i <= bl.RightBottomRow; i++) {
                        for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                            setCellData(g.getRowId(i), g.getColumnId(j), {fixedMonu: 0, fixedKazn: 0});
                            UpdateCellStyle(g.getRowId(i), j);
                        }
                    }
                    return false;
                } else {
                    setCellData(g.getSelectedRowId(), g.getColumnId(colIdx), {fixedMonu: 0, fixedKazn: 0});
                    UpdateCellStyle(g.getSelectedRowId(), colIdx);
                    return false;
                }
            }
        }
        setTimeout(function() {g.setActive()}, 100);
    }

    function getNewId() {
        var n = 0;
        for (var id in rowData) {
            if (parseInt(id) > n) n = parseInt(id);
        }
        n++;
        return n;
    }

    function AddColumns(data, noAddNum) {
        if (data) if ($.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                if (g.getColIndexById(data[i][0]) != undefined) {
                    dhtmlx.message('Стовпчик "' + data[i][1] + '" вже існує.');
                    continue;
                }
                var w = "100";
                var idx = g.getColumnsNum();
                if (noAddNum == true) g.insertColumn(idx, data[i][1], "ed", w);
                else g.insertColumn(idx, "(" + data[i][0].toString() +") " + data[i][1], "ed", w);
                g.setColumnId(idx, data[i][0]);
                if (g.getRowsNum() != 0) {
                    g.cells(g.getRowId(0), idx).setValue(data[i][2]);
                    setCellData(g.getRowId(0), g.getColumnId(idx), {value: data[i][2]});
                }
            }
            if (g.getSelectedRowId() == undefined) g.setSelectedRow(1);

            // update header styling
            for (var i = 0; i < g.getRowsNum(); i++) if (rowData[g.getRowId(i)]) if (rowData[g.getRowId(i)].header == true) {
                for (var j = 0; j < g.getColumnsNum(); j++) UpdateCellStyle(g.getRowId(i), j);
            }

            g.selectCell(g.getRowIndex(g.getSelectedRowId()), idx, true);
            g.setSizes();
        }
    }

    function SelectKekv(data, $txt){
        if (!data) return;
        if (data.id) $txt.val(data.id);
        var rIdx = g.getSelectedId();
        if (rIdx != undefined) rowData[rIdx].kekv = $txt.val();
    }

    function SelectColumn(data, $txt){
        var colIdx = g.getSelectedCellIndex();
        if (colIdx == undefined) return;
        if (data) if ($.isArray(data)) {
            if (g.getColIndexById(data[0]) != undefined) {
                dhtmlx.message('Стовпчик "' + data[1] + '" вже існує.');
                return;
            }
            var oldId = g.getColumnId(colIdx);
            g.setColumnId(colIdx, data[0]);
            g.setColumnLabel(colIdx, "(" + data[0] + ") " + data[1]);
            $txt.val("(" + data[0] + ") " + data[1]);
            // Update data
            ColumnChanged(oldId, data[0]);
        }
    }

    function ColumnChanged(oldId, newId) {
        for (var i = 0; i < cellData.length; i++) {
            if (cellData[i].col == oldId) cellData[i].col = newId;
            if (cellData[i].formula != undefined && cellData[i].formula != "") {
                var s = cellData[i].formula;
                var cells = s.match(/[^[\]]+(?=])/g);
                if (cells) if (cells.length != 0) {
                    for (var j = 0; j < cells.length; j++) {
                        var c = cells[j].split(";");
                        if (c.length == 2) if (parseInt(c[1]) == parseInt(oldId)) c[1] = newId;
                        s = iasufr.replaceAll(s, "["+cells[j]+"]", "[" + c[0] + ";" + c[1] + "]");
                    }
                }
                cellData[i].formula = s;
            }
        }
    }

    function UpdateCellProp(name, value, rowId, colId, colIdx) {
        if (rowId != undefined || colId != undefined) {
            var val = frm.getItemValue(name);
            if (name == "type") setCellData(rowId, colId, {type: val});
            if (name == "valign") setCellData(rowId, colId, {valign: val});
            if (name == "indent") setCellData(rowId, colId, {indent: value});
            if (name == "fontsize") setCellData(rowId, colId, {fontsize: value});
            if (name == "left") {
                setCellData(rowId, colId, {align: 0});
                frm.setItemValue("left", 1);
                frm.setItemValue("center", 0);
                frm.setItemValue("right", 0);
            }
            if (name == "center") {
                setCellData(rowId, colId, {align: 1});
                frm.setItemValue("left", 0);
                frm.setItemValue("center", 1)
                frm.setItemValue("right", 0);
            }
            if (name == "right") {
                setCellData(rowId, colId, {align: 2});
                frm.setItemValue("left", 0);
                frm.setItemValue("center", 0)
                frm.setItemValue("right", 1);
            }
            if (name == "readonly") setCellData(rowId, colId, {readonly: val});
            if (name == "rspan") setCellData(rowId, colId, {rspan: value});
            if (name == "cspan") setCellData(rowId, colId, {cspan: value});
            if (name == "fontcolor"+dkey) setCellData(rowId, colId, {fontcolor: value});
            if (name == "bgcolor"+dkey) setCellData(rowId, colId, {bgcolor: value});

            var cd = getCellData(rowId, colId);
            var fnt = 0;
            if (cd) if (cd.font !== undefined) fnt = cd.font;
            var checked = value != undefined ? value : frm.getItemValue(name) == 1;
            if (name == "bold") setCellData(rowId, colId, {font: checked ? fnt | 2 : fnt & (~2)});
            if (name == "underline") setCellData(rowId, colId, {font: checked ? fnt | 4 : fnt & (~4)});
            if (name == "italic") setCellData(rowId, colId, {font: checked ? fnt | 8 : fnt & (~8)});

            var cd = getCellData(rowId, colId);
            var fPeriod = "111";
            if (cd) if (cd.fPeriod !== undefined) fPeriod = cd.fPeriod;
            var p = fPeriod.split("");
            if (name == "fM") p[0] = checked ? 1 : 0;
            if (name == "fK") p[1] = checked ? 1 : 0;
            if (name == "fY") p[2] = checked ? 1 : 0;
            fPeriod = p.join("");
            if (fPeriod !== "111") setCellData(rowId, colId, { fPeriod: fPeriod }); else delete cd.fPeriod;
        }
        UpdateCellStyle(rowId, colIdx);
    }

    function ClearCellFormat(rowIdx, colIdx) {
        var cd = getCellData(g.getRowId(rowIdx), g.getColumnId(colIdx));
        if (cd) {
            var f = cd.formula;
            var v = cd.value;
            var idx = cellData.indexOf(cd);
            delete cellData[idx];
            cellData.splice(idx, 1);
            setCellData(g.getRowId(rowIdx), g.getColumnId(colIdx), {value: v, formula: f});
            var cdn = getCellData(g.getRowId(rowIdx), g.getColumnId(colIdx));
            if (cd.rspan) cdn.rspan = cd.rspan;
            if (cd.cspan) cdn.cspan = cd.cspan;
            UpdateCellStyle(g.getRowId(rowIdx), colIdx);
        }
    }

    function onFormChange(name, value) {
        var rowId = g.getSelectedRowId();
        var idx = g.getRowIndex(rowId);
        var colIdx = g.getSelectedCellIndex();
        var colId = g.getColumnId(g.getSelectedCellIndex());

        if (name == "insTag") {
            frm.setItemValue(name, 0);
            if (colIdx == undefined || g.getSelectedRowId() == undefined) return;
            ClearHighlight();
            iasufr.loadForm("Tags", {select: true, onSelect: InsertTag});
            return true;
        }
        if (name == "merge") {
            frm.setItemValue(name, 0);
            var bl = g.getSelectedBlock();
            if (bl) {
                if (bl.LeftTopRow != bl.RightBottomRow || bl.LeftTopCol != bl.RightBottomCol) {
                    var cs = bl.RightBottomCol - bl.LeftTopCol + 1;
                    var rs = bl.RightBottomRow - bl.LeftTopRow + 1;
                    rowId = g.getRowId(bl.LeftTopRow);
                    colIdx = bl.LeftTopCol;
                    colId = g.getColumnId(colIdx);
                    if (CheckSpan(rowId, colIdx, rs, cs)) {
                        setCellData(rowId, colId, {rspan: rs, cspan: cs});
                        g._HideSelection();
                        g.selectCell(bl.LeftTopRow, colIdx, true);
                    } else {
                        iasufr.message("Неможливо об'єднати клiтинки");
                        return;
                    }
                }
            }
        }

        if (name == "split") {
            frm.setItemValue(name, 0);
            setCellData(rowId, colId, {rspan: 1, cspan: 1});
            for (var i = 0; i < cellData.length; i++) UpdateCellStyle(cellData[i].row, g.getColIndexById(cellData[i].col));
            return;
        }


        if (colId !== undefined) {
            if (name == "width") {
                colPrnWidths[colIdx] = value;
                if (colPrnWidths[colIdx] == "") delete colPrnWidths[colIdx];
            }
            if (name == "subtotal") {
                if (!colData[colId]) colData[colId] = {};
                if (value != "") colData[colId].subtotal = value; else delete colData[colId].subtotal;
            }
            if (name == "subtotalTitle") {
                if (!colData[colId]) colData[colId] = {};
                if (value != "") colData[colId].subtotalTitle = value; else delete colData[colId].subtotalTitle;
            }
        }

        ///////////// rows
        if (rowId != undefined) {
            if (name == "code") {
                if (value != "") if (findRowIdByRowCode(value) != -1) {
                    iasufr.message("Рядок з кодом " + value + " вже існує.");
                    return;
                }
                rowData[rowId].code = value;
                if (rowData[rowId].code == "") delete rowData[rowId].code;
            }
            if (name == "kekv") {
                rowData[rowId].kekv = value;
                if (rowData[rowId].kekv == "") delete rowData[rowId].kekv;
            }
            if (name == "header") {
                var canSet = true;
                var prevId = g.getRowId(idx-1);
                if (prevId != undefined) {
                    if (rowData[prevId]) if (rowData[prevId].header != true) canSet = false;
                }
                if (!canSet) {
                    dhtmlx.message("Неможливо зробити заголовок посеред таблицi. Використовуйте верхнi рядки.");
                    frm.setItemValue(name, 0);
                    return;
                }
                var nextId= g.getRowId(idx+1);
                if (nextId != undefined) {
                    if (rowData[rowId]) if (rowData[rowId].header == true) if (rowData[nextId]) if (rowData[nextId].header == true) {
                        dhtmlx.message("Неможливо убрати заголовок посеред заголовка. Спочатку уберить нижнiй рядок.");
                        frm.setItemValue(name, 0);
                        return;
                    }
                }
                rowData[rowId].header = frm.getItemValue(name);
                if (rowData[rowId].header != 1) {
                    delete rowData[rowId].header;
                    delete rowData[rowId].newpage;
                }
                for (var i=0; i < g.getColumnsNum(); i++) UpdateCellStyle(rowId, i);
            }
            if (name == "newpage") {
                if (rowData[rowId].header != true) {
                    dhtmlx.message("Друкувати на новій сторінці можливо лише заголовки. ");
                    frm.setItemValue(name, 0);
                    return;
                }
                rowData[rowId].newpage = frm.getItemValue(name);
                if (rowData[rowId].newpage != 1) delete rowData[rowId].newpage;
            }
            if (name == "canAdd") {
                rowData[rowId].canAdd = frm.getItemValue(name);
                if (!rowData[rowId].canAdd) delete rowData[rowId].canAdd;
                UpdateCellStyle(rowId, 0);
                //for (var m = 0; m < g.getColumnsNum(); m++) UpdateCellStyle(rowId, m);
            }
        }
        ///////////// cells
        var bl = g.getSelectedBlock();
        if (bl) {
            for (var i = bl.LeftTopRow; i <= bl.RightBottomRow; i++) {
                for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                    UpdateCellProp(name, value, g.getRowId(i), g.getColumnId(j), j);
                }
            }
        } else UpdateCellProp(name, value, rowId, colId, colIdx);

        if (name == "clearFormat") {
            frm.setItemValue(name, 0);
            if (bl) {
                for (var i = bl.LeftTopRow; i <= bl.RightBottomRow; i++) {
                    for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                        ClearCellFormat(i, j);
                    }
                }
            } else {
                ClearCellFormat(g.getRowIndex(rowId), colIdx);
            }
        }

        if (rowId != undefined || colId != undefined) {
            if (name == "sumUp" || name == "sumDown") {
                frm.setItemValue(name, 0);
                if (bl) {
                    var so = 0;//start offset
                    var eo = 0;//end offset
                    if (name == "sumUp") so = 1;
                    if (name == "sumDown") eo = 1;
                    for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                        var formula = "";
                        for (var i = bl.LeftTopRow + so; i <= bl.RightBottomRow - eo; i++) {
                            formula += "[" + g.getRowId(i) + ";" + g.getColumnId(j) + "]+";
                        }
                        if (formula[formula.length - 1] == "+") formula = formula.substring(0, formula.length - 1);
                        var fid;
                        if (name == "sumUp") fid = g.getRowId(bl.LeftTopRow); else fid = g.getRowId(bl.RightBottomRow);
                        setCellData(fid, g.getColumnId(j), {formula: formula, value: ""});
                        g.cells(fid, j).setValue("");
                        UpdateCellStyle(fid, j);
                    }
                }
            }
            /*if (name == "setFontRow") {
                frm.setItemValue("setFontRow", 0);
                var cd = getCellData(rowId, colId);
                var font = 0;
                var align = 0;
                if (cd) {
                    if (cd.font != undefined) font = cd.font;
                    if (cd.align != undefined) align = cd.align;
                }
                for (var i = 0; i < g.getColumnsNum(); i++) {
                    setCellData(rowId, g.getColumnId(i), {font: font, align: align});
                    UpdateCellStyle(rowId, i);
                }
            }
            if (name == "setFontCol") {
                frm.setItemValue("setFontCol", 0);
                var cd = getCellData(rowId, colId);
                var font = 0;
                var align = 0;
                if (cd) {
                    if (cd.font != undefined) font = cd.font;
                    if (cd.align != undefined) align = cd.align;
                }
                for (var i = 0; i < g.getRowsNum(); i++) {
                    if (rowData[g.getRowId(i)] != undefined) if (rowData[g.getRowId(i)].header == true) continue;
                    setCellData(g.getRowId(i), colId, {font: font, align: align});
                    UpdateCellStyle(g.getRowId(i), colIdx);
                }
            }
            if (name == "setTypeRow") {
                frm.setItemValue("setTypeRow", 0);
                var cd = getCellData(rowId, colId);
                var type = "";
                if (cd) if (cd.type != undefined) type = cd.type;
                for (var i = 0; i < g.getColumnsNum(); i++) {
                    setCellData(rowId, g.getColumnId(i), {type: type});
                    UpdateCellStyle(rowId, i);
                }
            }
            if (name == "setTypeCol") {
                frm.setItemValue("setTypeCol", 0);
                var cd = getCellData(rowId, colId);
                var type = "";
                if (cd) if (cd.type != undefined) type = cd.type;
                for (var i = 0; i < g.getRowsNum(); i++) {
                    if (rowData[g.getRowId(i)] != undefined) if (rowData[g.getRowId(i)].header == true) continue;
                    setCellData(g.getRowId(i), colId, {type: type});
                    UpdateCellStyle(g.getRowId(i), colIdx);
                }
            }*/
          /*  var val = frm.getItemValue(name);
            if (name == "type") setCellData(rowId, colId, {type: val});
            if (name == "indent") setCellData(rowId, colId, {indent: parseInt(value)});
            if (name == "left") {
                setCellData(rowId, colId, {align: 0});
                frm.setItemValue("left", 1);
                frm.setItemValue("center", 0);
                frm.setItemValue("right", 0);
            }
            if (name == "center") {
                setCellData(rowId, colId, {align: 1});
                frm.setItemValue("left", 0);
                frm.setItemValue("center", 1)
                frm.setItemValue("right", 0);
            }
            if (name == "right") {
                setCellData(rowId, colId, {align: 2});
                frm.setItemValue("left", 0);
                frm.setItemValue("center", 0)
                frm.setItemValue("right", 1);
            }
            if (name == "readonly") setCellData(rowId, colId, {readonly: val});
            if (name == "rspan") setCellData(rowId, colId, {rspan: value});
            if (name == "cspan") setCellData(rowId, colId, {cspan: value});

            var cd = getCellData(rowId, colId);
            var fnt = 0;
            if (cd) if (cd.font) fnt = cd.font;
            var checked = frm.getItemValue(name) == 1;
            if (name == "bold") setCellData(rowId, colId, {font: checked ? fnt | 2 : fnt & (~2)});
            if (name == "underline") setCellData(rowId, colId, {font: checked ? fnt | 4 : fnt & (~4)});
            if (name == "italic") setCellData(rowId, colId, {font: checked ? fnt | 8 : fnt & (~8)});
        */
        }
        g.setActive();
    }

    function UpdateCellStyle(rowId, colIdx) {
        var cd = getCellData(rowId, g.getColumnId(colIdx));
        var style = "";
        if (cd) {
            var img = "";
            if (cd.type == "0") img = "edit-number-icon.png"; else
            if (cd.type == 10) img = "fonts-icon.png"; else
            if (cd.type == 11) img = "date.png";
            if (cd.formula != undefined && cd.formula != "") {
                style += "background-image: url('/images/icons/16/sum.png');background-repeat: no-repeat;background-position:center;";
            } else {
                if (img != "") style += "background-image: url('/images/icons/16/"+img+"');background-repeat: no-repeat;background-position:right;";
            }
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
            //if (cd.bgcolor != undefined && cd.bgcolor != "") style += "background-color: " + cd.bgcolor + ";";

            if (cd.readonly == 1) if (cd.formula == undefined || cd.formula == "") style +="background-image: url('/images/cheaker2.png');background-repeat: repeat;";
            if (cd.fixedKazn == 1) style += "box-shadow: inset 0px 0px 1px 1px rgba(29,158,74,1);"
            if (cd.fixedMonu == 1) style += "box-shadow: inset 0px 0px 1px 1px rgba(227,240,45,1);"
        }
        if (rowData[rowId]) {
            if (rowData[rowId].canAdd && colIdx == 0) {
                style +="background-image: url('/images/icons/16/plus.png');background-repeat: no-repeat;background-position: 0% 50%;";
            }
            if (rowData[rowId].header == true) {
                style +="border-right: 1px solid #44A;border-bottom: 1px solid #44A;background-image: url('/images/cheaker.png');background-repeat: repeat;";
            }
        }
        g.setCellTextStyle(rowId, colIdx, style);
    }

    function getCellData(rowId, colId) {
        for (var i = 0; i < cellData.length; i++) if (cellData[i].row == parseInt(rowId) && cellData[i].col == parseInt(colId)) {
            return cellData[i];
        }
        return null;
    }
/*
    function setCellSpan(rowId, colId, rspan, colspan) {
        if (t.supportSpan) {
            var rspan;
            var cspan;
            if (cd) rspan = cd.rspan;
            if (cd) cspan = cd.cspan;
            if (data.rspan) rspan = data.rspan;
            if (data.cspan) cspan = data.cspan;
            var nocheck = false;
            if (cd) {
                debugger;
                if (cd.rspan && cd.cspan) {
                    if (cd.rspan >= rspan && cd.colspan <= cspan) nocheck = true;
                } else if (cd.rspan) {
                    if (cd.rspan >= rspan) nocheck = true;
                } else if (cd.cspan) {
                    if (cd.cspan >= cspan) nocheck = true;
                }
            }
            if (nocheck || CheckSpan(rowId, g.getColIndexById(colId), rspan, cspan)) {
                if (data.cspan) g.setColspan(rowId, g.getColIndexById(colId), data.cspan == "" ? 0 : data.cspan);
                if (data.rspan) g.setRowspan(rowId, g.getColIndexById(colId), data.rspan == "" ? 0 : data.rspan);
            } else {
                iasufr.message("Неможливо об'єднати клiтинки");
                delete data.cspan;
                delete data.rspan;
            }
        }
    }*/

    function setCellData(rowId, colId, data) {
        iasufr.enableAskBeforClose(t);
        var cd = getCellData(rowId, colId);
        if (t.supportSpan && (data.rspan  != undefined || data.cspan != undefined)) {
            //debugger;
            var rspan;
            var cspan;
            if (cd) rspan = parseInt(cd.rspan);
            if (cd) cspan = parseInt(cd.cspan);
            if (data.rspan != undefined) rspan = parseInt(data.rspan);
            if (data.cspan != undefined) cspan = parseInt(data.cspan);
            if (isNaN(rspan)) rspan = 1;
            if (isNaN(cspan)) cspan = 1;
            var nocheck = false;
            if (cd) {
                if (cd.rspan != undefined && cd.cspan != undefined) {
                    if (parseInt(cd.rspan) > rspan && parseInt(cd.colspan) <= cspan) nocheck = true;
                } else if (cd.rspan != undefined) {
                    if (parseInt(cd.rspan) > rspan) nocheck = true;
                } else if (cd.cspan != undefined) {
                    if (parseInt(cd.cspan) > cspan) nocheck = true;
                }
            }
            //debugger;
            if (nocheck || CheckSpan(rowId, g.getColIndexById(colId), rspan == "" ? 1 : rspan, cspan == "" ? 1 : cspan)) {
                if (data.cspan) g.setColspan(rowId, g.getColIndexById(colId), data.cspan == "" ? 1 : data.cspan);
                if (data.rspan) g.setRowspan(rowId, g.getColIndexById(colId), data.rspan == "" ? 1 : data.rspan);
            } else {
                iasufr.message("Неможливо об'єднати клiтинки");
                delete data.cspan;
                delete data.rspan;
            }
        }

        if (cd){
            $.extend(cd, data);
            if (cd.type == 2 || cd.type == "") delete cd.type;
            if (cd.font == 0 || cd.font == "") delete cd.font;
            if (cd.fontsize == 0 || cd.fontsize == "") delete cd.fontsize;
            if (cd.value == "") delete cd.value;
            if (cd.valign == 0 || cd.valign == "") delete cd.valign;
            if (cd.align == 0 || cd.align == "") delete cd.align;
            if (cd.indent == 0 || cd.indent == "") delete cd.indent;
            if (cd.newpage == 0 || cd.newpage == "") delete cd.newpage;
            if (cd.readonly == 0 || cd.readonly == "") delete cd.readonly;
            if (parseInt(cd.rspan) == 1 || parseInt(cd.rspan) == 0 || cd.rspan == "") delete cd.rspan;
            if (parseInt(cd.cspan) == 1 || parseInt(cd.cspan) == 0 || cd.cspan == "") delete cd.cspan;
            if (cd.fontcolor == 0 || cd.fontcolor == "" || cd.fontcolor == "#000000") delete cd.fontcolor;
            if (cd.bgcolor == 0 || cd.bgcolor == "" || cd.bgcolor == "#ffffff") delete cd.bgcolor;
            if (cd.formula == "") delete cd.formula;
            if (cd.fixedKazn == 0) delete cd.fixedKazn;
            if (cd.fixedMonu == 0) delete cd.fixedMonu;
        } else {
            if (data.formula == "") delete data.formula;
            cellData.push($.extend({row: parseInt(rowId), col: parseInt(colId)}, data));
        }
        if (colId == 2 && data.value != undefined) { // row code column
            if (data.value != "" && iasufr.isInteger(data.value)) {
                if (findRowIdByRowCode(data.value) != -1) {
                    iasufr.message("Рядок з кодом " + data.value + " вже існує.");
                } else {
                    rowData[rowId].code = data.value;
                }
            } else {
                delete rowData[rowId].code;
            }
        }
        if (colId == 3 && data.value != undefined) { // kekv code column
            if (data.value != "" && iasufr.isInteger(data.value)) {
                rowData[rowId].kekv = data.value;
                // find kekv name
                iasufr.ajax({
                    url: "fin.Kekv.cls",
                    data: {func: "getKekvName", code: data.value},
                    success: function(d, o) {
                        if (o) if (o.name) {
                            var cidx = g.getColIndexById(1);
                            if (cidx != undefined) {
                                g.cells(rowId, cidx).setValue(o.name);
                                setCellData(rowId, 1, {value: o.name});
                            }
                        }
                    }
                });
            } else {
                delete rowData[rowId].kekv;
            }
        }

        if (data.cspan || data.rspan) {
//            DesetializeTable(SerializeTable());
        }
    }

    function blurOnEnter(e) {
        if (e.keyCode == 13) {
            $(e.target).blur();
            if (e.target.name == "fontcolor"+dkey || e.target.name == "bgcolor"+dkey) onFormChange(e.target.name, frm.getItemValue(e.target.name));
        }
    }

    function onToolbarClick(name) {
        if (name == "save") Save();
        if (name == "close") iasufr.close(t);
        if (name == "download") iasufr.downloadData("form.txt", JSON.stringify(SerializeTable()));
        if (name == "upload") {
            ClearHighlight();
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

    function onEditCell(stage,rId,cInd,nValue) {
        if (stage == 0) {
            //isEditing = true;
            var colId = g.getColumnId(cInd);
            if (rId != undefined && colId != undefined) {
                var cd = getCellData(rId, colId);
                if (cd) if (cd.formula != undefined && cd.formula != "") {
                    //g.cells(rId, cInd).setValue("=" + PlaceRowCodesInFormula(cd.formula));
                }
            }
            $(tb2.getInput("value")).focus().select();
            //$(tb2.getInput("value")).selectAll()
            return false;

        } else
        if (stage == 2) {
            //isEditing = false;
            var colId = g.getColumnId(cInd);
            if (rId != undefined && colId != undefined) {
                if (nValue[0] == "=") {
                    setCellData(rId, colId, {formula: GetFormulaFromString(nValue)});
                    UpdateCellStyle(rId, cInd);
                    g.cells(rId, cInd).setValue("");
                    return "";
                } else {
                    setCellData(rId, colId, {formula: "", value: nValue});
                }
            }
        }
        return true;
    }


    function HighlightFormulaCells(str) {
        ClearHighlight();
        var s = str.replace(/ /g, "");
        if (s == "") return;
        var cells = s.match(/[^[\]]+(?=])/g);
        if (cells) if (cells.length != 0) {
            for (var i = 0; i < cells.length; i++) {
                var c = cells[i].split(";");
                var j = 0;
                var idx = 0;
                for (j = 0; j <= i; j++) idx = s.indexOf(cells[j], idx);
                var sign = s[idx - 2];
                if (!sign) sign = "+";
                if (!rowData[c[0]]) c[0] = findRowIdByRowCode(c[0]);
                if (c[0] != -1) if (rowData[c[0]]) {
                    var colIdx = g.getColIndexById(c[1]);
                    var color = "#faf";
                    if (sign != "+" && sign != "-" && sign != "*" && sign != "/") sign = "+";
                    switch (sign) {
                        case "-": color = "#aaf"; break;
                        case "*": color = "#ffa"; break;
                        case "/": color = "#faf"; break;
                    }
                    if (colIdx != undefined) HighlightCell(c[0], colIdx, color, sign);
                }
            }
        }
    }


    function PlaceRowCodesInFormula(str) {
        var s = str.replace(/ /g,"");
        var cells = s.match(/[^[\]]+(?=])/g);
        if (cells) if (cells.length != 0) {
            for (var i = 0; i < cells.length; i++) {
                var c = cells[i].split(";");
                if (!c) {
                    dhtmlx.message("Помилка у формулi: " + cells[i]);
                    return s;
                }
                if (c.length != 2) {
                    dhtmlx.message("Помилка у формулi: " + cells[i]);
                    return s;
                }
                if (rowData[c[0]]) if (rowData[c[0]].code != undefined && rowData[c[0]].code != "") c[0] = rowData[c[0]].code;
                //s = s.replace(new RegExp("[" + cells[i] + "]", 'g'), "[" + c[0] + ";" + c[1] + "]");
                s = iasufr.replaceAll(s, "[" + cells[i] + "]", "[" + c[0] + ";" + c[1] + "]");
                //s = s.split("[" + cells[i] + "]").join("[" + c[0] + ";" + c[1] + "]");
            }
        }
        return s ;//s.replace(/\./, ",");
    }

    function GetFormulaFromString(str) {
        var s = str.substring(1, str.length).replace(/ /g, "").replace(/,/g,".");

        var cells = s.match(/[^[\]]+(?=])/g);
        if (cells) if (cells.length != 0) {
            for (var i = 0; i < cells.length; i++) {
                var c = cells[i].split(";");
                if (!c) {
                    dhtmlx.message("Помилка у формулi: " + cells[i]);
                    return s;
                }
                if (c.length != 2) {
                    dhtmlx.message("Помилка у формулi: " + cells[i]);
                    return s;
                }
                var idr = findRowIdByRowCode(c[0]);
                if (idr == -1) idr = c[0];
                if (!rowData[idr]) {
                    dhtmlx.message("Помилка у формулi. Не знайдена строка з кодом " + c[0]);
                    return s;
                }
                c[0]=idr;
                if (g.getColIndexById(c[1]) == undefined) {
                    dhtmlx.message("Помилка у формулi. Не знайден стовбець з номером " + c[1]);
                    return s;
                }
                //s = s.replace(new RegExp("[" + cells[i] + "]", 'g'), "[" + c[0] + ";" + c[1] + "]");
                s = iasufr.replaceAll(s, "[" + cells[i] + "]", "[" + c[0] + ";" + c[1] + "]");
                //s = s.split("[" + cells[i] + "]").join("[" + c[0] + ";" + c[1] + "]");
            }
        }
        try {
            CheckIfFormulaValid(s);
        } catch (e) {
            dhtmlx.message("Некорректна формула.");
        }
        return s;
    }

    function CheckIfFormulaValid(str) {
        var s = str;
        var cells = s.match(/[^[\]]+(?=])/g);
        if (cells) for (var i = 0; i < cells.length; i++) s = s.replace("["+cells[i]+"]", "1");
        eval("var q = " + s);
    }

    function findRowIdByRowCode(code) {
        for (var id in rowData) {
            if (rowData[id].code) if (rowData[id].code == code) return id;
        }
        return -1;
    }

    function InsertTag(d) {
        if (!d) return;
        if (!$.isArray(d)) return;

        var bl = g.getSelectedBlock();
        if (bl) {
            for (var i = bl.LeftTopRow; i <= bl.RightBottomRow; i++) {
                for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                    g.cells2(i, j).setValue(d[0]);
                    onEditCell(2, g.getRowId(i), j, d[0]);
                }
            }
        } else {
            var colIdx = g.getSelectedCellIndex();
            var rowIdx = g.getRowIndex(g.getSelectedRowId());
            if (rowIdx == undefined || colIdx == undefined) return;
            g.cells2(rowIdx, colIdx).setValue(d[0]);
            onEditCell(2, g.getSelectedRowId(), colIdx, d[0]);
        }
    }

    function SerializeTable() {
        var r = {};
        r.rows = [];
        r.cols = [];
        r.cells = [];
        for (var i = 0; i < g.getColumnsNum(); i++) {
            var subtotal = "";
            var subtotalTitle = "";
            var cid = g.getColumnId(i);
            var cold = colData[cid];
            if (cold) {
                if (cold.subtotal) subtotal = cold.subtotal;
                if (cold.subtotalTitle) subtotalTitle = cold.subtotalTitle;
            }
            r.cols.push({id: cid, name: g.getColumnLabel(i), width: g.getColWidth(i), printWidth: colPrnWidths[i] || "", subtotal: subtotal, subtotalTitle: subtotalTitle });
        }
        for (var i = 0; i < g.getRowsNum(); i++) r.rows.push($.extend({id: g.getRowId(i), pos: i }, rowData[g.getRowId(i)]));
        for (var i = 0; i < g.getColumnsNum(); i++) {
            for (var j = 0; j < g.getRowsNum(); j++) {
                var cd = getCellData(g.getRowId(j), g.getColumnId(i));
                if (cd) {
                    /*if (forSave == true) {
                        if (Object.keys(cd).length <= 2) cd.delete = 1;
                        r.cells.push(cd);
                    } else */if (Object.keys(cd).length > 2) r.cells.push(cd);
                }
            }
        }

        return r;
    }

    function DesetializeTable(r) {
        if (!r) return;
        if (!r.rows) return;
        if (!r.cols) return;
        if (!r.cells) return;

        delete rowData; rowData = {};
        delete cellData; cellData = r.cells;

        var i, j, id, c;
        c = [];
        colData = [];
        for (i = 0; i < r.cols.length; i++) {
            c.push([r.cols[i].id, r.cols[i].name]);
            colData[r.cols[i].id] = {};
            if (r.cols[i].subtotal) colData[r.cols[i].id].subtotal = r.cols[i].subtotal;
            if (r.cols[i].subtotalTitle) colData[r.cols[i].id].subtotalTitle = r.cols[i].subtotalTitle;
        }

        g.clearAll();
        while (g.getColumnsNum() != 0) g.deleteColumn(0);
        AddColumns(c, true);
        colPrnWidths = {};
        for (i = 0; i < r.cols.length; i++) {
            if (r.cols[i].width != undefined && r.cols[i].width != 0 && r.cols[i].width != "") g.setColWidth(i, r.cols[i].width);
            if (r.cols[i].printWidth) colPrnWidths[i] = r.cols[i].printWidth;
        }

        r.rows.sort(function(a,b) { if (parseInt(a.pos) > parseInt(b.pos)) return 1; else return -1 });
        for (i = 0; i < r.rows.length; i++) {
            id = r.rows[i].id;
            delete r.rows[i].pos;

            rowData[id] = r.rows[i];
            g.addRow(id, "");
            for (j = 0; j < g.getColumnsNum(); j++) {
                var cd = getCellData(id, g.getColumnId(j));
                if (cd) {
                    if (cd.value != undefined) g.cells(id, j).setValue(iasufr.replaceAll(cd.value, "\\u0027", "'"));
                }
                UpdateCellStyle(id, j);
            }
            delete rowData[r.rows[i].id].id;
        }
        if (t.supportSpan) {
            for (i = 0; i < cellData.length; i++) {
                //if (data.cspan) g.setColspan(rowId, g.getColIndexById(colId), data.cspan == "" ? 0 : data.cspan);
                //if (data.rspan) g.setRowspan(rowId, g.getColIndexById(colId), data.rspan == "" ? 0 : data.rspan);

                if (cellData[i].cspan && cellData[i].cspan != "") g.setColspan(cellData[i].row, g.getColIndexById(cellData[i].col), cellData[i].cspan);
                if (cellData[i].rspan && cellData[i].rspan != "") g.setRowspan(cellData[i].row, g.getColIndexById(cellData[i].col), cellData[i].rspan);
            }
        }

        if (g.getRowsNum() != 0 && g.getColumnsNum() != 0) g.selectCell(g.getRowId(0), 0, true);
    }

    function BuildPreview(data) {

        //if (prev) prev.destructor();

        ClearHighlight();
        var fd = new FormUtils(data);
        fd.buildGrid(prev);
        delete fd;

        /*return;
        data.rows = data.rows.sort(function(a,b) { if (parseInt(a.pos) > parseInt(b.pos)) return 1; else return -1 });

        function _getColIndex(colId) {
            for (j = 0; j < data.cols.length; j++) if (data.cols[j].id == colId) return j;
            return -1;
        }

        function _getRowData(id) {
            for (var i = 0; i < data.rows.length; i++) if (data.rows[i].id == id) return data.rows[i];
            return undefined;
        }
        function _getCellData(idR, idC) {
            for (var i = 0; i < data.cells.length; i++) if (data.cells[i].row == idR & data.cells[i].col == idC) return data.cells[i];
        }

        if (prev) prev.destructor();
        prev = tabs.cells("t2").attachGrid();
        prev.setImagePath(iasufr.const.IMG_PATH);
        prev.setHeader("");
        prev.setInitWidths("*");
        prev.setColAlign("left");
        prev.setColTypes("ed");
        prev.enableColumnMove(true);
        prev.init();
        prev.deleteColumn(0);
        //prev.addRow(1, "");

        //prev.clearAll();
        //while (prev.getColumnsNum() != 0) prev.deleteColumn(0);

        var i, j, str, cspan, rowId, rd, cd, first, m;
        first = true;
        m = {};
        for (j = 0; j < data.cols.length; j++) {
            prev.insertColumn(data.cols[j].id, "", "ed");
            prev.setColumnId(j, data.cols[j].id);
        }
        for (i = 0; i < data.rows.length; i++) {
            rowId = g.getRowId(i);
            rd = _getRowData(rowId);
            if (rd) {
                if (rd.header == true) {
                    str = "";
                    cspan = 0;
                    for (j = 0; j < g.getColumnsNum(); j++) {
                        if (cspan > 1) {
                            str += "#cspan,";
                            cspan--;
                            continue;
                        }
                        if (m[j]) {
                            if (m[j] > 1) {
                                str += "#rspan,";
                                m[j]--;
                                continue;
                            }
                        }
                        cd = _getCellData(rowId, g.getColumnId(j));
                        if (cd) {
                            if (cd.cspan != undefined) cspan = cd.cspan;
                            if (cd.rspan != undefined) m[j] = cd.rspan;
                            if (cd.value != undefined) str += ReplaceTemplateTags(cd.value.replace(",", "."), data, rowId, g.getColumnId(j), i, j);
                        }
                        str += ",";
                    }
                    if (str[str.length - 1] == ",") str = str.substr(0, str.length - 1);
                    prev.attachHeader(str, true);
                } else {
                    prev.addRow(rowId, "");
                }
            }
        }

        prev.enableRowspan(true);
        prev.enableCollSpan(true);
        for (i = 0; i < data.cells.length; i++) {
            rd = _getRowData(data.cells[i].row);
            if (rd) if (rd.header == true) continue;
            if (data.cells[i].value != undefined) {
                var cidx = _getColIndex(data.cells[i].col);
                //console.log(data.cells[i].row, cidx, data.cells[i].value );
                if (cidx != -1) {
                    try {
                        prev.cells(data.cells[i].row, cidx).setValue(ReplaceTemplateTags(data.cells[i].value, data, data.cells[i].row,data.cells[i].col, prev.getRowIndex(data.cells[i].row), prev.getColIndexById(data.cells[i].col)));
                        UpdateCellStyle(data.cells[i].row, cidx, prev, true);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
            if (data.cells[i].rspan) prev.setRowspan(data.cells[i].row, cidx, data.cells[i].rspan);
            if (data.cells[i].cspan) prev.setColspan(data.cells[i].row, cidx, data.cells[i].cspan);
        }

        prev.setSizes();
        prev.detachHeader(0);*/
    }

    function enableSmartNavigation(grid) {
        grid.attachEvent("onKeyPress", smartNav);
        function smartNav(code) {
            if (code == 37 || code == 38 || code == 39 || code == 40) {
                var colIdx = grid.getSelectedCellIndex();
                var rowIdx = grid.getRowIndex(grid.getSelectedRowId());
                if (colIdx != undefined && rowIdx != undefined) {
                    var c = grid.cells2(rowIdx, colIdx).cell;
                    if (c) {
                        var pos = grid.getPosition(c);
                        var w = c.offsetWidth;
                        var h = c.offsetHeight;
                        var x = pos[0];
                        var y = pos[1];
                        switch (code) {
                            case 37: x -= 10; y += h / 2; break;
                            case 39: x += w + 10; y += h / 2; break;
                            case 38: x += w / 2-2; y -= 10; break;
                            case 40: x += w / 2-2; y += h + 10; break;
                        }
                        var elem = document.elementFromPoint(x, y);
                        for (var i = 0; i < grid.getRowsNum(); i++) {
                            for (var j = 0; j < grid.getColumnsNum(); j++) {
                                if (grid.cells2(i, j).cell == elem) {
                                    grid.selectCell(i, j);
                                    grid.doClick(elem, true);
                                    return false;
                                }
                            }
                        }
                    }
                }
                return false;
            }
            return true;
        }
    }


    function onGridKeyPressed(code,ctrl,shift){
        var colIdx = g.getSelectedCellIndex();
        var rowIdx = g.getRowIndex(g.getSelectedRowId());
        if (rowIdx == undefined || colIdx == undefined) return true;

        if (code == 115) { // F4
            LoadData();
            //checkSpan(g.getSelectedRowId(), colIdx, 3, 1);
            /*
            if (c) {
                var pos = g.getPosition(c);
                var w = c.offsetWidth;
                var h = c.offsetHeight;
                var x = pos[0] - 10;
                var y = pos[1] + h / 2;
                var elem = document.elementFromPoint(x, y);
                for (var i = 0; i < g.getRowsNum(); i++) {
                    for (var j = 0; j < g.getColumnsNum(); j++) {
                        if (g.cells2(i, j).cell == elem) {
                            g.selectCell(i, j);
                            return;
                        }
                    }
                }
                //if (elem) console.log(elem);
            }
*/
        }

        if (code == 113) { // F2
            $(tb2.getInput("value")).focus();
            return false;
        }
        if (code == 187)  {
            g.editCell();
        }
        if (code == 13) {
            g._HideSelection();
            g.editStop();
            onCellSelect(g.getSelectedRowId(), g.getSelectedCellIndex());
            return false;
        }
        if (code == 66 && ctrl) onFormChange("bold", true);
        if (code == 73 && ctrl) onFormChange("italic", true);
        if (code == 85 && ctrl) onFormChange("underline", true);
        if (code == 76 && ctrl) onFormChange("left", true);
        if (code == 69 && ctrl) { onFormChange("center", true); return false}
        if (code == 82 && ctrl) onFormChange("right", true);
        if (code == 46) {
            var bl = g.getSelectedBlock();
            if (bl) {
                for (var i = bl.LeftTopRow; i <= bl.RightBottomRow; i++) {
                    for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                        g.cells2(i, j).setValue("");
                        setCellData(g.getRowId(i), g.getColumnId(j), {formula: ""});
                        onEditCell(2, g.getRowId(i), j, "");
                        UpdateCellStyle(g.getRowId(i), j);
                    }
                }
                ClearHighlight();
                onCellSelect(g.getSelectedRowId(), colIdx);
                return false;
            } else {
                setCellData(g.getSelectedRowId(), g.getColumnId(colIdx), {formula: ""});
                g.cells2(rowIdx, colIdx).setValue("");
                onEditCell(2, g.getSelectedRowId(), colIdx, "");
                UpdateCellStyle(g.getSelectedRowId(), colIdx);
                ClearHighlight();
                onCellSelect(g.getSelectedRowId(), colIdx);
                return false;
            }
        }
        if (code == 27) {
            g._HideSelection();
            g.editStop();
            return false;
        }
        if ((code == 67 || code == 88) && ctrl) { // Copy
            var bl = g.getSelectedBlock();
            if (bl) {
                clipboard = [];
                for (var i = bl.LeftTopRow; i <= bl.RightBottomRow; i++) {
                    for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                        clipboard.push({dy: i - bl.LeftTopRow , dx: j - bl.LeftTopCol, value: g.cells2(i, j).getValue()});
                        if (code == 88) {
                            g.cells2(i, j).setValue("");
                            onEditCell(2, g.getRowId(i), j, "");
                            UpdateCellStyle(g.getRowId(i), j);
                        }
                    }
                }
            } else {
                var cd = getCellData(g.getSelectedRowId(), g.getColumnId(colIdx));
                if (cd) if (cd.formula != undefined && cd.formula != "")
                    clipboard = [{formula: CopyFormula(rowIdx, colIdx, cd.formula)}];
                else
                    clipboard = [{dx:0, dy: 0, value: g.cells2(rowIdx, colIdx).getValue()}];
            }
        }
        if (code == 86 && ctrl) { // Paste
            if (!clipboard) return;
            var bl = g.getSelectedBlock();
            if (bl) {
                for (var i = bl.LeftTopRow; i <= bl.RightBottomRow; i++) {
                    for (var j = bl.LeftTopCol; j <= bl.RightBottomCol; j++) {
                        if (clipboard.length == 1) {
                            g.cells2(i, j).setValue(clipboard[0].value);
                            onEditCell(2, g.getRowId(i), j, clipboard[0].value);
                        }
                    }
                }
            } else {
                if (clipboard.length >= 1) {
                    if (clipboard[0].formula) {
                        setCellData(g.getSelectedRowId(), g.getColumnId(colIdx), {formula: PasteFormula(rowIdx, colIdx, clipboard[0].formula)});
                        g.cells2(rowIdx, colIdx).setValue("");
                        UpdateCellStyle(g.getSelectedRowId(), colIdx);
                        onCellSelect(g.getSelectedRowId(), colIdx);
                    } else {
                        for (var i = 0; i < clipboard.length; i++) {
                            var ri = parseInt(clipboard[i].dy) + rowIdx;
                            var ci = parseInt(clipboard[i].dx) + colIdx;
                            var rid = g.getRowId(ri);
                            if (rid != undefined && g.getColumnId(ci) != undefined) {
                                g.cells(rid, ci).setValue(clipboard[i].value);
                                onEditCell(2, rid, ci, clipboard[i].value);
                            }
                        }
                    }
                }
            }
            /*return;
            for (var i = 0; i < clipboard.length; i++) {
                clipboard.push({row: i, col: j, value: g.cells2(i, j).getValue()});
                g.cells2(clipboard[i].row, clipboard[i].col).setValue(clipboard[i].value);
                onEditCell(2, g.getRowId(clipboard[i].row(), clipboard[i].col).setValue(clipboard[i].value);
            }*/
        }
        return true;
    }

    function PasteFormula(rowIdx, colIdx, formula) {
        var s = formula;
        var cells = s.match(/[^[\]]+(?=])/g);
        if (cells) if (cells.length != 0) {
            for (var i = 0; i < cells.length; i++) {
                var c = cells[i].split(";");
                var dx = parseInt(c[0]);
                var dy = parseInt(c[1]);
                if (dx != undefined && dy != undefined) {
                    var ri = g.getRowId(rowIdx + dx);
                    var ci = g.getColumnId(colIdx + dy);
                    if (ri != undefined && ci != undefined)
                        //s = s.split("[" + cells[i] + "]").join("["+ri+";"+ci+"]");
                        s = iasufr.replaceAll(s, "[" + cells[i] + "]", "["+ri+";"+ci+"]");
                        //s = s.replace(new RegExp("[" + cells[i] + "]", 'g'), "["+ri+";"+ci+"]");
                    else //s.split("[" + cells[i] + "]").join("0");
                        s = iasufr.replaceAll(s, "[" + cells[i] + "]", "0");
                        //s = s.replace(new RegExp("[" + cells[i] + "]", 'g'), "0");
                }
            }
        }
        s = iasufr.replaceAll(s, "+0", "");
        s = iasufr.replaceAll(s, "-0", "");
        s = iasufr.replaceAll(s, "*0", "");
        s = iasufr.replaceAll(s, "/0", "");
        s = iasufr.replaceAll(s, "0+", "");
        s = iasufr.replaceAll(s, "0-", "");
        s = iasufr.replaceAll(s, "0*", "");
        s = iasufr.replaceAll(s, "0/", "");
        if (s == "0") s = "";
        return s
    }

    function CopyFormula(rowIdx, colIdx, formula) {
        var s = formula;
        var cells = s.match(/[^[\]]+(?=])/g);
        if (cells) if (cells.length != 0) {
            for (var i = 0; i < cells.length; i++) {
                var c = cells[i].split(";");
                var ri = g.getRowIndex(c[0]);
                var ci = g.getColIndexById(c[1]);
                if (ri != undefined && ci != undefined) {
                    var dx = ri - rowIdx;
                    var dy = ci - colIdx;
                    //s = s.split("[" + cells[i] + "]").join("["+dx+";"+dy+"]");
                    s = iasufr.replaceAll(s, "[" + cells[i] + "]", "["+dx+";"+dy+"]");
                    //s = s.replace(new RegExp("[" + cells[i] + "]", 'g'), "["+dx+";"+dy+"]");
                }
            }
        }
        return s;
    }

    function onGridRightClick(id,ind,obj){
        var $txt = $(tb2.getInput("value"));
        $txt.attr("noHighlight", 1);
        if ($txt.is(":focus")) {
            if (id == g.getSelectedRowId() && ind == g.getSelectedCellIndex()) return;
            var str = "[";
            var code = id;
            if (rowData[id]) if (rowData[id].code != undefined && rowData[id].code != "") code = rowData[id].code;
            str += code + ";" + g.getColumnId(ind) + "]";
            var oldv = $txt.val();
            var idx = oldv.indexOf(str);
            if (idx != -1) {
                oldv = oldv.replace(str, "");
                if (oldv[idx - 1] == "+" || oldv[idx - 1] == "-" || oldv[idx - 1] == "*" || oldv[idx - 1] == "/") oldv = oldv.substr(0, idx - 1) + oldv.substring(idx, oldv.length);
                $txt.val(oldv);
                RemoveHighlight(id, ind);
                $txt.removeAttr("noHighlight");
                return false;
            }
            if (oldv[0] != "=") oldv = "=";
            var ch = oldv[oldv.length - 1];
            if (ch != "=" && ch != "+" && ch != "*" && ch != "/" && ch != "-") {
                str = "+" + str;
                ch = "+";
            } if (ch == "=") ch = "+";
            var color = "#faf";
            switch (ch) {
                case "-": color = "#aaf"; break;
                case "*": color = "#ffa"; break;
                case "/": color = "#faf"; break;
            }
            HighlightCell(id, ind, color, ch);
            $txt.val(oldv + str);
            $txt.removeAttr("noHighlight");
            return false;
        }
        $txt.removeAttr("noHighlight");
        return true;
    }

    function onEditorKeydown(e) {
        var $txt = $(tb2.getInput("value"));
        var s = tb2.getValue("value");
        if (e.keyCode == 13) {
            var rowId = g.getSelectedRowId();
            var colIdx = g.getSelectedCellIndex();
            $txt.blur();
            if (s == "=") s = "";
            //if (s[0] == "=") s = s.replace(/ /g, "");
            g.cells(rowId, colIdx).setValue(s);
            onEditCell(2, rowId, colIdx, s);
            onCellSelect(rowId, colIdx);
            UpdateCellStyle(rowId, colIdx);
            g.setActive();
            return;
        }
        if (e.keyCode == 27) {
            $txt.blur();
            g.setActive();
            onCellSelect(g.getSelectedRowId(), g.getSelectedCellIndex());
            //tb2.setValue("value", g.cells(g.getSelectedRowId(), g.getSelectedCellIndex()).getValue());
            return;
        }

        // highlight cell that positioned by caret in input
        var idx = parseInt($txt.get(0).selectionStart);
        if (isNaN(idx)) return;
        var idxLeft = s.lastIndexOf("[", idx);
        var idxRight = s.indexOf("]", idx-1);
        if (idxLeft != -1 && idxRight != -1) {
            var cell = s.substring(idxLeft + 1, idxRight);
            if (cell && cell != "") {
                var c = cell.replace(/ /g, "").split(";");
                if (c) if (c.length == 2) {
                    for (var i = 0; i < highlight.length; i++) {
                        highlight[i].el.removeClass("fm-formula-hl2").css("background-color", highlight[i].el.attr("col"));
                        if (highlight[i].el.attr("rowId") == c[0] && highlight[i].el.attr("colIdx") == g.getColIndexById(c[1])) highlight[i].el.addClass("fm-formula-hl2").css("background-color", "#ff0"); else
                            if (highlight[i].el.attr("rowId") == findRowIdByRowCode(c[0]) && highlight[i].el.attr("colIdx") == g.getColIndexById(c[1])) highlight[i].el.addClass("fm-formula-hl2").css("background-color", "#ff0");
                    }
                }
            }
        }
        return true;
    }

    function onEditorChange(e) {
        var $txt = $(tb2.getInput("value"));
        if ($txt.attr("noHighlight") == 1) return;
        var s = $txt.val();
        if (s[0] == "=") HighlightFormulaCells(s);
        onEditorKeydown(e);
    }

    function CheckSpan(rowId, colIdx, rspan, cspan) {
        var rs = parseInt(rspan);
        if (!rs || isNaN(rs)) rs = 1;
        if (rs < 0) rs = 1
        var cs = cspan;
        if (!cs || isNaN(cs)) cs = 1;
        if (cs < 0) cs = 1
        if (rs == 1 && cs == 1) return true;
        //if (rs > 1 && cs > 1) return false;
        var currentCell = g.cells(rowId, colIdx).cell;

        function checkColspan(r) {
            var startCol = colIdx;
            //if (r._childIndexes) startCol = r._childIndexes[colIdx]; TODO: ??

            for (var j = startCol; j < startCol + cs; j++) {
                if (j >= g.getColumnsNum()) continue;
                if (j != startCol + cs && r._childIndexes) {
                    if (r._childIndexes[j] == r._childIndexes[j+1]) return false;
                }
                var nodeidx = j;
                if (r._childIndexes) nodeidx =  r._childIndexes[j];
                if (r.childNodes[nodeidx].colSpan != undefined && r.childNodes[nodeidx].colSpan != "" && parseInt(r.childNodes[nodeidx].colSpan) > 1) return false;
                if (r.childNodes[nodeidx].rowSpan != undefined && r.childNodes[nodeidx].rowSpan != "" && parseInt(r.childNodes[nodeidx].rowSpan) > 1) return false;
            }
            return true;
        }

        function checkRowspan(cidx) {
            var rowIdx = g.getRowIndex(rowId);
            for (var j = rowIdx; j < rowIdx + rs; j++) {
                var r = g.getRowById(g.getRowId(j));
                if (r) {
                    if (r._childIndexes) {
                        if (r._childIndexes[cidx + 1]) if (r._childIndexes[cidx] == r._childIndexes[cidx + 1]) return false;
                        // TODO: нужна корректная проверка, без этой проверки возможно некорректное объединение ячеек
                        //if (r._childIndexes[cidx - 1]) if (r._childIndexes[cidx] == r._childIndexes[cidx - 1]) return false;
                    }
                    if (!checkColspan(r)) return false;
                }
            }
            return true;
        }
        if (rspan > 1) return checkRowspan(colIdx); else return checkColspan(g.getRowById(rowId));
    }

    function Save() {
        if (t.idTable == undefined) {
            iasufr.showError("Не вказан idTable");
            return;
        }
        l.progressOn();
        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: "SaveTableData", json: JSON.stringify($.extend({id: t.idTable}, SerializeTable()))},
            success: onSuccess,
            error: function(){l.progressOff()}
        });
    }

    function FillData(txt, o) {
        l.progressOff();
        if (t.owner.isWindow) t.owner.setText("Дизайнер форми: (" + o.json.form.code + ") " + o.json.form.name + " - " + o.json.form.table);
        if (o.json) DesetializeTable(o.json);
    }

    function onSuccess() {
        l.progressOff();
        iasufr.messageSuccess("Данi збережено");
        iasufr.disableAskBeforClose(t);
    }

    function LoadData() {
        if (t.idTable == undefined) {
            iasufr.showError("Не вказан idTable");
        }
        l.progressOn();
        iasufr.ajax({
            url: "frm.Form.cls",
            data: {func: "LoadTableData", id: t.idTable},
            success: FillData,
            error: function(){l.progressOff()}
        });
    }

    function PreviewPrint() {
        tabs.cells("t3").attachURL("/base.Page.cls?iasu=1&class=frm.Table&func=PreviewPdf&pdfdownload=1&id=" + t.idTable);
    }

    return this;
}
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/monu/form/designer.js