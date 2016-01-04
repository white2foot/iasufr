if (!window.Frm) window.Frm = {}
if (!Frm.PrintForm) Frm.PrintForm = {};

Frm.PrintForm.Create = function(opt) {

    var t = iasufr.initForm(this, opt);
    var tt=t;
    var dhxLayout;
    //var ID_ORG = iasufr.user.orgId;
    var ids = opt.ids;
    var isKazn = opt.isKazn;

    dhxLayout = new dhtmlXLayoutObject(t.owner, "1C");
    dhxLayout.cells("a").hideHeader();


    /*if (ids) if (ids.length != 0) {
        var str = "";
        for (var i = 0; i < ids.length; i++) str += ids[i] + ",";
        str = str.substr(0, str.length - 1);
        dhxLayout.cells("a").attachURL("/base.Page.cls?iasu=1&class=frm.Table&func=PrintPdf&pdfdownload=1&ids=" + str + "&isKazn=" + (opt.isKazn ? "1" : "0"));
    }*/

    LoadData();


    function LoadData() {
        console.log(ids);
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
        // РќР°С…РѕРґРёРј РєРѕР»РёС‡РµСЃС‚РІРѕ Р·Р°РїРѕР»РЅРµРЅС‹С… Р±Р»РѕРєРѕРІ
        var max = 0;
        for (var p in savedData) {
            var v = parseInt(p.match(/\d+/)[0]);
            if (v > max) max = v;
        }
        var cur = 0;
        // РќР°С…РѕРґРёРј  СЃРєРѕР»СЊРєРѕ Р±Р»РѕРєРѕРІ Р·Р°РґР°РЅРѕ РІ С„РѕСЂРјРµ
        inputs.each(function(idx, input){
            var v = parseInt($(input).attr("datafield").match(/\d+/)[0]);
            if (v > cur) cur = v;
        });
        // РљРѕР»С‡РёРµСЃС‚РІРѕ Р±Р»РѕРєРѕРІ РєРѕС‚СЂС‹Рµ РЅСѓР¶РЅРѕ СЃРѕР·РґР°С‚СЊ
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
        //var o = {"json":[{"idOrg":434,"org":"(03135) Харківська державна академія дизайну і мистецтв","idForm":16,"prg":"2201160","dateInput":"01.04.2015","period":"2","formName":"Додаток 10. Звіт про заборгованість за бюджетними коштами","formCode":"7","isText":"0","savedData":{},"txtData":"","fond":"спецiальний","tables":[{"id":286,"name":"7- 7 Додаток 10.","cols":[{"id":205,"width":100,"printWidth":22,"name":"Показники"},{"id":206,"width":100,"printWidth":5,"name":"КЕКВ"},{"id":207,"width":100,"printWidth":3,"name":"Код рядка"},{"id":2575,"width":100,"printWidth":7,"name":"Дебіторська забаргованість на початок звітного року, усього"},{"id":2576,"width":100,"printWidth":7,"name":"Дебіторська забаргованість на кінець звітного періоду (року) усього"},{"id":2577,"width":100,"printWidth":7,"name":"Дебіторська забаргованість на кінець звітного періоду (року) з неї прострочена"},{"id":2578,"width":100,"printWidth":7,"name":"Дебіторська забаргованість списана за період з початку звітного року"},{"id":2579,"width":100,"printWidth":7,"name":"Кредиторська забаргованість на початок звітного року, усього"},{"id":2580,"width":100,"printWidth":6,"name":"Кредиторська забаргованість на кінець звітного періоду (року) усього"},{"id":2581,"width":100,"printWidth":6,"name":"Кредиторська забаргованість на кінець звітного періоду (року) з неї прострочена"},{"id":2582,"width":100,"printWidth":8,"name":"Кредиторська забаргованість на кінець звітного періоду (року) з неї  термін оплати якої не настав"},{"id":2583,"width":100,"printWidth":7,"name":"Кредиторська забаргованість списана за період з початку звітного року"},{"id":2584,"width":100,"printWidth":8,"name":"Зареєстровані фінансові зобовязання на кінець звітного періоду (року) "}],"rows":[{"id":7885,"code":"010","pos":5},{"id":7886,"code":"020","pos":6},{"id":7887,"code":"030","pos":8,"kekv":"2000"},{"id":7888,"code":"040","pos":9,"kekv":"2100"},{"id":7889,"code":"050","pos":10,"kekv":"2110"},{"id":7890,"code":"060","pos":11,"kekv":"2111"},{"id":7891,"code":"070","pos":12,"kekv":"2112"},{"id":7892,"code":"080","pos":13,"kekv":"2120"},{"id":7893,"code":"090","pos":14,"kekv":"2200"},{"id":7894,"code":"100","pos":15,"kekv":"2210"},{"id":7895,"code":"110","pos":16,"kekv":"2220"},{"id":7896,"code":"120","pos":17,"kekv":"2230"},{"id":7897,"code":"130","pos":18,"kekv":"2240"},{"id":7898,"code":"140","pos":19,"kekv":"2250"},{"id":7899,"code":"150","pos":20,"kekv":"2260"},{"id":7900,"code":"160","pos":21,"kekv":"2270"},{"id":7901,"code":"170","pos":22,"kekv":"2271"},{"id":7902,"code":"180","pos":23,"kekv":"2272"},{"id":7903,"code":"190","pos":24,"kekv":"2273"},{"id":7904,"code":"200","pos":25,"kekv":"2274"},{"id":7905,"code":"210","pos":26,"kekv":"2275"},{"id":7906,"code":"220","pos":27,"kekv":"2280"},{"id":7907,"code":"230","pos":28,"kekv":"2281"},{"id":7908,"code":"240","pos":29,"kekv":"2282"},{"id":7909,"code":"250","pos":30,"kekv":"2400"},{"id":7910,"code":"280","pos":33,"kekv":"2600"},{"id":7911,"code":"290","pos":34,"kekv":"2610"},{"id":7912,"code":"300","pos":35,"kekv":"2620"},{"id":7913,"code":"310","pos":36,"kekv":"2630"},{"id":7914,"code":"330","pos":38,"kekv":"2710"},{"id":7915,"code":"340","pos":39,"kekv":"2720"},{"id":7916,"code":"350","pos":40,"kekv":"2730"},{"id":7917,"code":"360","pos":41,"kekv":"2800"},{"id":7918,"code":"370","pos":42,"kekv":"3000"},{"id":7919,"code":"380","pos":43,"kekv":"3100"},{"id":7920,"code":"390","pos":44,"kekv":"3110"},{"id":7921,"code":"400","pos":45,"kekv":"3120"},{"id":7922,"code":"410","pos":46,"kekv":"3121"},{"id":7923,"code":"420","pos":47,"kekv":"3122"},{"id":7924,"code":"430","pos":48,"kekv":"3130"},{"id":7925,"code":"440","pos":49,"kekv":"3131"},{"id":7926,"code":"450","pos":50,"kekv":"3132"},{"id":7927,"code":"460","pos":51,"kekv":"3140"},{"id":7928,"code":"470","pos":52,"kekv":"3141"},{"id":7929,"code":"480","pos":53,"kekv":"3142"},{"id":7930,"code":"490","pos":54,"kekv":"3143"},{"id":7931,"code":"500","pos":55,"kekv":"3150"},{"id":7932,"code":"510","pos":56,"kekv":"3160"},{"id":7933,"code":"520","pos":57,"kekv":"3200"},{"id":7934,"code":"530","pos":58,"kekv":"3210"},{"id":7935,"code":"540","pos":59,"kekv":"3220"},{"id":7936,"code":"550","pos":60,"kekv":"3230"},{"id":7937,"code":"560","pos":61,"kekv":"3240"},{"id":7938,"code":"260","pos":31,"kekv":"2410"},{"id":7939,"code":"270","pos":32,"kekv":"2420"},{"id":7940,"code":"320","pos":37,"kekv":"2700"},{"id":8978,"pos":7},{"id":8979,"pos":3,"header":1},{"id":8980,"pos":2,"header":1},{"id":8981,"pos":1,"header":1},{"id":8982,"pos":0,"header":1},{"id":8983,"pos":4,"header":1,"newpage":1}],"cells":[{"row":7885,"col":205,"value":"Доходи","font":2,"align":1,"indent":0},{"row":7885,"col":206,"value":"х","font":2,"align":1,"indent":0},{"row":7885,"col":207,"value":"010","font":2,"align":1,"indent":0},{"row":7885,"col":2575,"font":2,"align":2,"fixedKazn":"1"},{"row":7885,"col":2576,"font":2,"align":2,"fixedKazn":"1"},{"row":7885,"col":2577,"font":2,"align":2,"fixedKazn":"1"},{"row":7885,"col":2578,"font":2,"align":2,"fixedKazn":"1"},{"row":7885,"col":2579,"font":2,"align":2,"fixedKazn":"1"},{"row":7885,"col":2580,"font":2,"align":2,"fixedKazn":"1"},{"row":7885,"col":2581,"font":2,"align":2,"fixedKazn":"1"},{"row":7885,"col":2582,"font":2,"align":2},{"row":7885,"col":2583,"font":2,"align":2,"fixedKazn":"1"},{"row":7885,"col":2584,"font":2,"align":2,"fixedKazn":"1"},{"row":7886,"col":205,"value":"Видатки - усього на утримання установи","font":2,"align":1,"indent":0},{"row":7886,"col":206,"value":"х","font":2,"align":1,"indent":0},{"row":7886,"col":207,"value":"020","font":2,"align":1,"indent":0},{"row":7886,"col":2575,"align":2,"formula":"[7887;2575]+[7918;2575]","fixedKazn":"1"},{"row":7886,"col":2576,"align":2,"formula":"[7887;2576]+[7918;2576]","fixedKazn":"1"},{"row":7886,"col":2577,"align":2,"formula":"[7918;2577]+[7887;2577]","fixedKazn":"1"},{"row":7886,"col":2578,"align":2,"formula":"[7887;2578]+[7918;2578]","fixedKazn":"1"},{"row":7886,"col":2579,"align":2,"formula":"[7887;2579]+[7918;2579]","fixedKazn":"1"},{"row":7886,"col":2580,"align":2,"formula":"[7887;2580]+[7918;2580]","fixedKazn":"1"},{"row":7886,"col":2581,"align":2,"formula":"[7887;2581]+[7918;2581]","fixedKazn":"1"},{"row":7886,"col":2582,"align":2,"formula":"[7887;2582]+[7918;2582]","fixedKazn":"1"},{"row":7886,"col":2583,"align":2,"formula":"[7887;2583]+[7918;2583]","fixedKazn":"1"},{"row":7886,"col":2584,"align":2,"formula":"[7887;2584]+[7918;2584]","fixedKazn":"1"},{"row":7887,"col":205,"value":"Поточні видатки","font":2,"align":1,"indent":0},{"row":7887,"col":206,"value":"2000","font":2,"align":1,"indent":0},{"row":7887,"col":207,"value":"030","font":2,"align":1,"indent":0},{"row":7887,"col":2575,"align":2,"formula":"[7888;2575]+[7893;2575]+[7909;2575]+[7910;2575]+[7940;2575]+[7917;2575]"},{"row":7887,"col":2576,"align":2,"formula":"[7888;2576]+[7893;2576]+[7909;2576]+[7910;2576]+[7940;2576]+[7917;2576]"},{"row":7887,"col":2577,"align":2,"formula":"[7888;2577]+[7893;2577]+[7909;2577]+[7910;2577]+[7940;2577]+[7917;2577]"},{"row":7887,"col":2578,"align":2,"formula":"[7888;2578]+[7893;2578]+[7909;2578]+[7910;2578]+[7940;2578]+[7917;2578]"},{"row":7887,"col":2579,"align":2,"formula":"[7888;2579]+[7893;2579]+[7909;2579]+[7910;2579]+[7940;2579]+[7917;2579]"},{"row":7887,"col":2580,"align":2,"formula":"[7888;2580]+[7893;2580]+[7909;2580]+[7910;2580]+[7940;2580]+[7917;2580]"},{"row":7887,"col":2581,"align":2,"formula":"[7888;2581]+[7893;2581]+[7909;2581]+[7910;2581]+[7940;2581]+[7917;2581]"},{"row":7887,"col":2582,"align":2,"formula":"[7888;2582]+[7893;2582]+[7909;2582]+[7910;2582]+[7940;2582]+[7917;2582]"},{"row":7887,"col":2583,"align":2,"formula":"[7888;2583]+[7893;2583]+[7909;2583]+[7910;2583]+[7940;2583]+[7917;2583]"},{"row":7887,"col":2584,"align":2,"formula":"[7888;2584]+[7893;2584]+[7909;2584]+[7910;2584]+[7940;2584]+[7917;2584]"},{"row":7888,"col":205,"value":"Оплата праці і нарахування на заробітну плату","font":2,"align":0,"indent":0},{"row":7888,"col":206,"value":"2100","font":2,"align":1,"indent":0},{"row":7888,"col":207,"value":"040","font":2,"align":1,"indent":0},{"row":7888,"col":2575,"align":2,"formula":"[7889;2575]+[7892;2575]"},{"row":7888,"col":2576,"align":2,"formula":"[7889;2576]+[7892;2576]"},{"row":7888,"col":2577,"align":2,"formula":"[7889;2577]+[7892;2577]"},{"row":7888,"col":2578,"align":2,"formula":"[7889;2578]+[7892;2578]"},{"row":7888,"col":2579,"align":2,"formula":"[7889;2579]+[7892;2579]"},{"row":7888,"col":2580,"align":2,"formula":"[7889;2580]+[7892;2580]"},{"row":7888,"col":2581,"align":2,"formula":"[7889;2581]+[7892;2581]"},{"row":7888,"col":2582,"align":2,"formula":"[7889;2582]+[7892;2582]"},{"row":7888,"col":2583,"align":2,"formula":"[7889;2583]+[7892;2583]"},{"row":7888,"col":2584,"align":2,"formula":"[7889;2584]+[7892;2584]"},{"row":7889,"col":205,"value":"Оплата праці ","font":8,"align":0,"indent":0},{"row":7889,"col":206,"value":"2110","font":8,"align":1,"indent":0},{"row":7889,"col":207,"value":"050","font":8,"align":1,"indent":0},{"row":7889,"col":2575,"align":2,"formula":"[7890;2575]+[7891;2575]"},{"row":7889,"col":2576,"align":2,"formula":"[7890;2576]+[7891;2576]"},{"row":7889,"col":2577,"align":2,"formula":"[7890;2577]+[7891;2577]"},{"row":7889,"col":2578,"align":2,"formula":"[7890;2578]+[7891;2578]"},{"row":7889,"col":2579,"align":2,"formula":"[7890;2579]+[7891;2579]"},{"row":7889,"col":2580,"align":2,"formula":"[7890;2580]+[7891;2580]"},{"row":7889,"col":2581,"align":2,"formula":"[7890;2581]+[7891;2581]"},{"row":7889,"col":2582,"align":2,"formula":"[7890;2582]+[7891;2582]"},{"row":7889,"col":2583,"align":2,"formula":"[7890;2583]+[7891;2583]"},{"row":7889,"col":2584,"align":2,"formula":"[7890;2584]+[7891;2584]"},{"row":7890,"col":205,"value":"   Заробітна плата","align":0,"indent":1},{"row":7890,"col":206,"value":"2111","align":1,"indent":0},{"row":7890,"col":207,"value":"060","align":1,"indent":0},{"row":7890,"col":2575,"align":2},{"row":7890,"col":2576,"align":2},{"row":7890,"col":2577,"align":2},{"row":7890,"col":2578,"align":2},{"row":7890,"col":2579,"align":2},{"row":7890,"col":2580,"align":2},{"row":7890,"col":2581,"align":2},{"row":7890,"col":2582,"align":2},{"row":7890,"col":2583,"align":2},{"row":7890,"col":2584,"align":2},{"row":7891,"col":205,"value":"   Грошове забезпечення військовослужбовців","align":0,"indent":1},{"row":7891,"col":206,"value":"2112","align":1,"indent":0},{"row":7891,"col":207,"value":"070","align":1,"indent":0},{"row":7891,"col":2575,"align":2},{"row":7891,"col":2576,"align":2},{"row":7891,"col":2577,"align":2},{"row":7891,"col":2578,"align":2},{"row":7891,"col":2579,"align":2},{"row":7891,"col":2580,"align":2},{"row":7891,"col":2581,"align":2},{"row":7891,"col":2582,"align":2},{"row":7891,"col":2583,"align":2},{"row":7891,"col":2584,"align":2},{"row":7892,"col":205,"value":"Нарахування на оплату праці","font":8,"align":0,"indent":0},{"row":7892,"col":206,"value":"2120","font":8,"align":1,"indent":0},{"row":7892,"col":207,"value":"080","font":8,"align":1,"indent":0},{"row":7892,"col":2575,"font":8,"align":2},{"row":7892,"col":2576,"font":8,"align":2},{"row":7892,"col":2577,"font":8,"align":2},{"row":7892,"col":2578,"font":8,"align":2},{"row":7892,"col":2579,"font":8,"align":2},{"row":7892,"col":2580,"font":8,"align":2},{"row":7892,"col":2581,"font":8,"align":2},{"row":7892,"col":2582,"font":8,"align":2},{"row":7892,"col":2583,"font":8,"align":2},{"row":7892,"col":2584,"font":8,"align":2},{"row":7893,"col":205,"value":"Використання товарів і послуг","font":2,"align":0,"indent":0},{"row":7893,"col":206,"value":"2200","font":2,"align":1,"indent":0},{"row":7893,"col":207,"value":"090","font":2,"align":1,"indent":0},{"row":7893,"col":2575,"align":2,"formula":"[7894;2575]+[7895;2575]+[7896;2575]+[7897;2575]+[7898;2575]+[7899;2575]+[7900;2575]+[7906;2575]"},{"row":7893,"col":2576,"align":2,"formula":"[7894;2576]+[7895;2576]+[7896;2576]+[7897;2576]+[7898;2576]+[7899;2576]+[7900;2576]+[7906;2576]"},{"row":7893,"col":2577,"align":2,"formula":"[7894;2577]+[7895;2577]+[7896;2577]+[7897;2577]+[7898;2577]+[7899;2577]+[7900;2577]+[7906;2577]"},{"row":7893,"col":2578,"align":2,"formula":"[7894;2578]+[7895;2578]+[7896;2578]+[7897;2578]+[7898;2578]+[7899;2578]+[7900;2578]+[7906;2578]"},{"row":7893,"col":2579,"align":2,"formula":"[7894;2579]+[7895;2579]+[7896;2579]+[7897;2579]+[7898;2579]+[7899;2579]+[7900;2579]+[7906;2579]"},{"row":7893,"col":2580,"align":2,"formula":"[7894;2580]+[7895;2580]+[7896;2580]+[7897;2580]+[7898;2580]+[7899;2580]+[7900;2580]+[7906;2580]"},{"row":7893,"col":2581,"align":2,"formula":"[7894;2581]+[7895;2581]+[7896;2581]+[7897;2581]+[7898;2581]+[7899;2581]+[7900;2581]+[7906;2581]"},{"row":7893,"col":2582,"align":2,"formula":"[7894;2582]+[7895;2582]+[7896;2582]+[7897;2582]+[7898;2582]+[7899;2582]+[7900;2582]+[7906;2582]"},{"row":7893,"col":2583,"align":2,"formula":"[7894;2583]+[7895;2583]+[7896;2583]+[7897;2583]+[7898;2583]+[7899;2583]+[7900;2583]+[7906;2583]"},{"row":7893,"col":2584,"align":2,"formula":"[7894;2584]+[7895;2584]+[7896;2584]+[7897;2584]+[7898;2584]+[7899;2584]+[7900;2584]+[7906;2584]"},{"row":7894,"col":205,"value":"Предмети, матеріали, обладнання та інвентар","font":8,"align":0,"indent":0},{"row":7894,"col":206,"value":"2210","font":8,"align":1,"indent":0},{"row":7894,"col":207,"value":"100","font":8,"align":1,"indent":0},{"row":7894,"col":2575,"font":8,"align":2},{"row":7894,"col":2576,"font":8,"align":2},{"row":7894,"col":2577,"font":8,"align":2},{"row":7894,"col":2578,"font":8,"align":2},{"row":7894,"col":2579,"font":8,"align":2},{"row":7894,"col":2580,"font":8,"align":2},{"row":7894,"col":2581,"font":8,"align":2},{"row":7894,"col":2582,"font":8,"align":2},{"row":7894,"col":2583,"font":8,"align":2},{"row":7894,"col":2584,"font":8,"align":2},{"row":7895,"col":205,"value":"Медикаменти та перевязувальні матеріали","font":8,"align":0,"indent":0},{"row":7895,"col":206,"value":"2220","font":8,"align":1,"indent":0},{"row":7895,"col":207,"value":"110","font":8,"align":1,"indent":0},{"row":7895,"col":2575,"font":8,"align":2},{"row":7895,"col":2576,"font":8,"align":2},{"row":7895,"col":2577,"font":8,"align":2},{"row":7895,"col":2578,"font":8,"align":2},{"row":7895,"col":2579,"font":8,"align":2},{"row":7895,"col":2580,"font":8,"align":2},{"row":7895,"col":2581,"font":8,"align":2},{"row":7895,"col":2582,"font":8,"align":2},{"row":7895,"col":2583,"font":8,"align":2},{"row":7895,"col":2584,"font":8,"align":2},{"row":7896,"col":205,"value":"Продукти харчування","font":8,"align":0,"indent":0},{"row":7896,"col":206,"value":"2230","font":8,"align":1,"indent":0},{"row":7896,"col":207,"value":"120","font":8,"align":1,"indent":0},{"row":7896,"col":2575,"font":8,"align":2},{"row":7896,"col":2576,"font":8,"align":2},{"row":7896,"col":2577,"font":8,"align":2},{"row":7896,"col":2578,"font":8,"align":2},{"row":7896,"col":2579,"font":8,"align":2},{"row":7896,"col":2580,"font":8,"align":2},{"row":7896,"col":2581,"font":8,"align":2},{"row":7896,"col":2582,"font":8,"align":2},{"row":7896,"col":2583,"font":8,"align":2},{"row":7896,"col":2584,"font":8,"align":2},{"row":7897,"col":205,"value":"Оплата послуг (крім комунальних)","font":8,"align":0,"indent":0},{"row":7897,"col":206,"value":"2240","font":8,"align":1,"indent":0},{"row":7897,"col":207,"value":"130","font":8,"align":1,"indent":0},{"row":7897,"col":2575,"font":8,"align":2},{"row":7897,"col":2576,"font":8,"align":2},{"row":7897,"col":2577,"font":8,"align":2},{"row":7897,"col":2578,"font":8,"align":2},{"row":7897,"col":2579,"font":8,"align":2},{"row":7897,"col":2580,"font":8,"align":2},{"row":7897,"col":2581,"font":8,"align":2},{"row":7897,"col":2582,"font":8,"align":2},{"row":7897,"col":2583,"font":8,"align":2},{"row":7897,"col":2584,"font":8,"align":2},{"row":7898,"col":205,"value":"Видатки на вiдрядження","font":8,"align":0,"indent":0},{"row":7898,"col":206,"value":"2250","font":8,"align":1,"indent":0},{"row":7898,"col":207,"value":"140","font":8,"align":1,"indent":0},{"row":7898,"col":2575,"font":8,"align":2},{"row":7898,"col":2576,"font":8,"align":2},{"row":7898,"col":2577,"font":8,"align":2},{"row":7898,"col":2578,"font":8,"align":2},{"row":7898,"col":2579,"font":8,"align":2},{"row":7898,"col":2580,"font":8,"align":2},{"row":7898,"col":2581,"font":8,"align":2},{"row":7898,"col":2582,"font":8,"align":2},{"row":7898,"col":2583,"font":8,"align":2},{"row":7898,"col":2584,"font":8,"align":2},{"row":7899,"col":205,"value":"Видатки та заходи спеціального призначення","font":8,"align":0,"indent":0},{"row":7899,"col":206,"value":"2260","font":8,"align":1,"indent":0},{"row":7899,"col":207,"value":"150","font":8,"align":1,"indent":0},{"row":7899,"col":2575,"font":8,"align":2},{"row":7899,"col":2576,"font":8,"align":2},{"row":7899,"col":2577,"font":8,"align":2},{"row":7899,"col":2578,"font":8,"align":2},{"row":7899,"col":2579,"font":8,"align":2},{"row":7899,"col":2580,"font":8,"align":2},{"row":7899,"col":2581,"font":8,"align":2},{"row":7899,"col":2582,"font":8,"align":2},{"row":7899,"col":2583,"font":8,"align":2},{"row":7899,"col":2584,"font":8,"align":2},{"row":7900,"col":205,"value":"Оплата комунальних послуг та енергоносіїв","font":8,"align":0,"indent":0},{"row":7900,"col":206,"value":"2270","font":8,"align":1,"indent":0},{"row":7900,"col":207,"value":"160","font":8,"align":1,"indent":0},{"row":7900,"col":2575,"align":2,"formula":"[7901;2575]+[7902;2575]+[7903;2575]+[7904;2575]+[7905;2575]"},{"row":7900,"col":2576,"align":2,"formula":"[7901;2576]+[7902;2576]+[7903;2576]+[7904;2576]+[7905;2576]"},{"row":7900,"col":2577,"align":2,"formula":"[7901;2577]+[7902;2577]+[7903;2577]+[7904;2577]+[7905;2577]"},{"row":7900,"col":2578,"align":2,"formula":"[7901;2578]+[7902;2578]+[7903;2578]+[7904;2578]+[7905;2578]"},{"row":7900,"col":2579,"align":2,"formula":"[7901;2579]+[7902;2579]+[7903;2579]+[7904;2579]+[7905;2579]"},{"row":7900,"col":2580,"align":2,"formula":"[7901;2580]+[7902;2580]+[7903;2580]+[7904;2580]+[7905;2580]"},{"row":7900,"col":2581,"align":2,"formula":"[7901;2581]+[7902;2581]+[7903;2581]+[7904;2581]+[7905;2581]"},{"row":7900,"col":2582,"align":2,"formula":"[7901;2582]+[7902;2582]+[7903;2582]+[7904;2582]+[7905;2582]"},{"row":7900,"col":2583,"align":2,"formula":"[7901;2583]+[7902;2583]+[7903;2583]+[7904;2583]+[7905;2583]"},{"row":7900,"col":2584,"align":2,"formula":"[7901;2584]+[7902;2584]+[7903;2584]+[7904;2584]+[7905;2584]"},{"row":7901,"col":205,"value":"Оплата теплопостачання","align":0,"indent":1},{"row":7901,"col":206,"value":"2271","align":1,"indent":0},{"row":7901,"col":207,"value":"170","align":1,"indent":0},{"row":7901,"col":2575,"align":2},{"row":7901,"col":2576,"align":2},{"row":7901,"col":2577,"align":2},{"row":7901,"col":2578,"align":2},{"row":7901,"col":2579,"align":2},{"row":7901,"col":2580,"align":2},{"row":7901,"col":2581,"align":2},{"row":7901,"col":2582,"align":2},{"row":7901,"col":2583,"align":2},{"row":7901,"col":2584,"align":2},{"row":7902,"col":205,"value":"Оплата водопостачання та водовiдведення","align":0,"indent":1},{"row":7902,"col":206,"value":"2272","align":1,"indent":0},{"row":7902,"col":207,"value":"180","align":1,"indent":0},{"row":7902,"col":2575,"align":2},{"row":7902,"col":2576,"align":2},{"row":7902,"col":2577,"align":2},{"row":7902,"col":2578,"align":2},{"row":7902,"col":2579,"align":2},{"row":7902,"col":2580,"align":2},{"row":7902,"col":2581,"align":2},{"row":7902,"col":2582,"align":2},{"row":7902,"col":2583,"align":2},{"row":7902,"col":2584,"align":2},{"row":7903,"col":205,"value":"Оплата електроенергiї","align":0,"indent":1},{"row":7903,"col":206,"value":"2273","align":1,"indent":0},{"row":7903,"col":207,"value":"190","align":1,"indent":0},{"row":7903,"col":2575,"align":2},{"row":7903,"col":2576,"align":2},{"row":7903,"col":2577,"align":2},{"row":7903,"col":2578,"align":2},{"row":7903,"col":2579,"align":2},{"row":7903,"col":2580,"align":2},{"row":7903,"col":2581,"align":2},{"row":7903,"col":2582,"align":2},{"row":7903,"col":2583,"align":2},{"row":7903,"col":2584,"align":2},{"row":7904,"col":205,"value":"Оплата природного газу","align":0,"indent":1},{"row":7904,"col":206,"value":"2274","align":1,"indent":0},{"row":7904,"col":207,"value":"200","align":1,"indent":0},{"row":7904,"col":2575,"align":2},{"row":7904,"col":2576,"align":2},{"row":7904,"col":2577,"align":2},{"row":7904,"col":2578,"align":2},{"row":7904,"col":2579,"align":2},{"row":7904,"col":2580,"align":2},{"row":7904,"col":2581,"align":2},{"row":7904,"col":2582,"align":2},{"row":7904,"col":2583,"align":2},{"row":7904,"col":2584,"align":2},{"row":7905,"col":205,"value":"Оплата iнших енергоносіїв","align":0,"indent":1},{"row":7905,"col":206,"value":"2275","align":1,"indent":0},{"row":7905,"col":207,"value":"210","align":1,"indent":0},{"row":7905,"col":2575,"align":2},{"row":7905,"col":2576,"align":2},{"row":7905,"col":2577,"align":2},{"row":7905,"col":2578,"align":2},{"row":7905,"col":2579,"align":2},{"row":7905,"col":2580,"align":2},{"row":7905,"col":2581,"align":2},{"row":7905,"col":2582,"align":2},{"row":7905,"col":2583,"align":2},{"row":7905,"col":2584,"align":2},{"row":7906,"col":205,"value":"Дослідження і розробки, окремі заходи по реалізації державних (регіональних) програм ","font":8,"align":0,"indent":0},{"row":7906,"col":206,"value":"2280","font":8,"align":1,"indent":0},{"row":7906,"col":207,"value":"220","font":8,"align":1,"indent":0},{"row":7906,"col":2575,"align":2,"formula":"[7907;2575]+[7908;2575]"},{"row":7906,"col":2576,"align":2,"formula":"[7907;2576]+[7908;2576]"},{"row":7906,"col":2577,"align":2,"formula":"[7907;2577]+[7908;2577]"},{"row":7906,"col":2578,"align":2,"formula":"[7907;2578]+[7908;2578]"},{"row":7906,"col":2579,"align":2,"formula":"[7907;2579]+[7908;2579]"},{"row":7906,"col":2580,"align":2,"formula":"[7907;2580]+[7908;2580]"},{"row":7906,"col":2581,"align":2,"formula":"[7907;2581]+[7908;2581]"},{"row":7906,"col":2582,"align":2,"formula":"[7907;2582]+[7908;2582]"},{"row":7906,"col":2583,"align":2,"formula":"[7907;2583]+[7908;2583]"},{"row":7906,"col":2584,"align":2,"formula":"[7907;2584]+[7908;2584]"},{"row":7907,"col":205,"value":"Дослідження і розробки, окремі заходи розвитку по реалізації  державних (регіональних) програм","align":0,"indent":1},{"row":7907,"col":206,"value":"2281","align":1,"indent":0},{"row":7907,"col":207,"value":"230","align":1,"indent":0},{"row":7907,"col":2575,"align":2},{"row":7907,"col":2576,"align":2},{"row":7907,"col":2577,"align":2},{"row":7907,"col":2578,"align":2},{"row":7907,"col":2579,"align":2},{"row":7907,"col":2580,"align":2},{"row":7907,"col":2581,"align":2},{"row":7907,"col":2582,"align":2},{"row":7907,"col":2583,"align":2},{"row":7907,"col":2584,"align":2},{"row":7908,"col":205,"value":"Окремi заходи по реалiзацiї державних (регіональних) програм, не віднесені до заходів розвитку","align":0,"indent":1},{"row":7908,"col":206,"value":"2282","align":1,"indent":0},{"row":7908,"col":207,"value":"240","align":1,"indent":0},{"row":7908,"col":2575,"align":2},{"row":7908,"col":2576,"align":2},{"row":7908,"col":2577,"align":2},{"row":7908,"col":2578,"align":2},{"row":7908,"col":2579,"align":2},{"row":7908,"col":2580,"align":2},{"row":7908,"col":2581,"align":2},{"row":7908,"col":2582,"align":2},{"row":7908,"col":2583,"align":2},{"row":7908,"col":2584,"align":2},{"row":7909,"col":205,"value":"Обслуговування боргових зобовязань","font":2,"align":0,"indent":0},{"row":7909,"col":206,"value":"2400","font":2,"align":1,"indent":0},{"row":7909,"col":207,"value":"250","font":2,"align":1,"indent":0},{"row":7909,"col":2575,"align":2,"formula":"[7938;2575]+[7939;2575]"},{"row":7909,"col":2576,"align":2,"formula":"[7938;2576]+[7939;2576]"},{"row":7909,"col":2577,"align":2,"formula":"[7938;2577]+[7939;2577]"},{"row":7909,"col":2578,"align":2,"formula":"[7938;2578]+[7939;2578]"},{"row":7909,"col":2579,"align":2,"formula":"[7938;2579]+[7939;2579]"},{"row":7909,"col":2580,"align":2,"formula":"[7938;2580]+[7939;2580]"},{"row":7909,"col":2581,"align":2,"formula":"[7938;2581]+[7939;2581]"},{"row":7909,"col":2582,"align":2,"formula":"[7938;2582]+[7939;2582]"},{"row":7909,"col":2583,"align":2,"formula":"[7938;2583]+[7939;2583]"},{"row":7909,"col":2584,"align":2,"formula":"[7938;2584]+[7939;2584]"},{"row":7910,"col":205,"value":"Поточнi трансферти","font":2,"align":0,"indent":0},{"row":7910,"col":206,"value":"2600","font":2,"align":1,"indent":0},{"row":7910,"col":207,"value":"280","font":2,"align":1,"indent":0},{"row":7910,"col":2575,"align":2,"formula":"[7911;2575]+[7912;2575]+[7913;2575]"},{"row":7910,"col":2576,"align":2,"formula":"[7911;2576]+[7912;2576]+[7913;2576]"},{"row":7910,"col":2577,"align":2,"formula":"[7911;2577]+[7912;2577]+[7913;2577]"},{"row":7910,"col":2578,"align":2,"formula":"[7911;2578]+[7912;2578]+[7913;2578]"},{"row":7910,"col":2579,"align":2,"formula":"[7911;2579]+[7912;2579]+[7913;2579]"},{"row":7910,"col":2580,"align":2,"formula":"[7911;2580]+[7912;2580]+[7913;2580]"},{"row":7910,"col":2581,"align":2,"formula":"[7911;2581]+[7912;2581]+[7913;2581]"},{"row":7910,"col":2582,"align":2,"formula":"[7911;2582]+[7912;2582]+[7913;2582]"},{"row":7910,"col":2583,"align":2,"formula":"[7911;2583]+[7912;2583]+[7913;2583]"},{"row":7910,"col":2584,"align":2,"formula":"[7911;2584]+[7912;2584]+[7913;2584]"},{"row":7911,"col":205,"value":"Субсидії та поточні трансферти підприємствам (установам, організаціям)","font":8,"align":0,"indent":0},{"row":7911,"col":206,"value":"2610","font":8,"align":1,"indent":0},{"row":7911,"col":207,"value":"290","font":8,"align":1,"indent":0},{"row":7911,"col":2575,"font":8,"align":2},{"row":7911,"col":2576,"font":8,"align":2},{"row":7911,"col":2577,"font":8,"align":2},{"row":7911,"col":2578,"font":8,"align":2},{"row":7911,"col":2579,"font":8,"align":2},{"row":7911,"col":2580,"font":8,"align":2},{"row":7911,"col":2581,"font":8,"align":2},{"row":7911,"col":2582,"font":8,"align":2},{"row":7911,"col":2583,"font":8,"align":2},{"row":7911,"col":2584,"font":8,"align":2},{"row":7912,"col":205,"value":"Поточні трансферти органам державного управління інших рівнів","font":8,"align":0,"indent":0},{"row":7912,"col":206,"value":"2620","font":8,"align":1,"indent":0},{"row":7912,"col":207,"value":"300","font":8,"align":1,"indent":0},{"row":7912,"col":2575,"font":8,"align":2},{"row":7912,"col":2576,"font":8,"align":2},{"row":7912,"col":2577,"font":8,"align":2},{"row":7912,"col":2578,"font":8,"align":2},{"row":7912,"col":2579,"font":8,"align":2},{"row":7912,"col":2580,"font":8,"align":2},{"row":7912,"col":2581,"font":8,"align":2},{"row":7912,"col":2582,"font":8,"align":2},{"row":7912,"col":2583,"font":8,"align":2},{"row":7912,"col":2584,"font":8,"align":2},{"row":7913,"col":205,"value":"Поточнi трансферти урядам іноземних держав та міжнародним організаціям","font":8,"align":0,"indent":0},{"row":7913,"col":206,"value":"2630","font":8,"align":1,"indent":0},{"row":7913,"col":207,"value":"310","font":8,"align":1,"indent":0},{"row":7913,"col":2575,"font":8,"align":2},{"row":7913,"col":2576,"font":8,"align":2},{"row":7913,"col":2577,"font":8,"align":2},{"row":7913,"col":2578,"font":8,"align":2},{"row":7913,"col":2579,"font":8,"align":2},{"row":7913,"col":2580,"font":8,"align":2},{"row":7913,"col":2581,"font":8,"align":2},{"row":7913,"col":2582,"font":8,"align":2},{"row":7913,"col":2583,"font":8,"align":2},{"row":7913,"col":2584,"font":8,"align":2},{"row":7914,"col":205,"value":"Виплата пенсiй i допомоги","font":8,"align":0,"indent":0},{"row":7914,"col":206,"value":"2710","font":8,"align":1,"indent":0},{"row":7914,"col":207,"value":"330","font":8,"align":1,"indent":0},{"row":7914,"col":2575,"font":8,"align":2},{"row":7914,"col":2576,"font":8,"align":2},{"row":7914,"col":2577,"font":8,"align":2},{"row":7914,"col":2578,"font":8,"align":2},{"row":7914,"col":2579,"font":8,"align":2},{"row":7914,"col":2580,"font":8,"align":2},{"row":7914,"col":2581,"font":8,"align":2},{"row":7914,"col":2582,"font":8,"align":2},{"row":7914,"col":2583,"font":8,"align":2},{"row":7914,"col":2584,"font":8,"align":2},{"row":7915,"col":205,"value":"Стипендiї","font":8,"align":0,"indent":0},{"row":7915,"col":206,"value":"2720","font":8,"align":1,"indent":0},{"row":7915,"col":207,"value":"340","font":8,"align":1,"indent":0},{"row":7915,"col":2575,"font":8,"align":2},{"row":7915,"col":2576,"font":8,"align":2},{"row":7915,"col":2577,"font":8,"align":2},{"row":7915,"col":2578,"font":8,"align":2},{"row":7915,"col":2579,"font":8,"align":2},{"row":7915,"col":2580,"font":8,"align":2},{"row":7915,"col":2581,"font":8,"align":2},{"row":7915,"col":2582,"font":8,"align":2},{"row":7915,"col":2583,"font":8,"align":2},{"row":7915,"col":2584,"font":8,"align":2},{"row":7916,"col":205,"value":"  Інші виплати населенню  ","font":8,"align":0,"indent":0},{"row":7916,"col":206,"value":"2730","font":8,"align":1,"indent":0},{"row":7916,"col":207,"value":"350","font":8,"align":1,"indent":0},{"row":7916,"col":2575,"font":8,"align":2},{"row":7916,"col":2576,"font":8,"align":2},{"row":7916,"col":2577,"font":8,"align":2},{"row":7916,"col":2578,"font":8,"align":2},{"row":7916,"col":2579,"font":8,"align":2},{"row":7916,"col":2580,"font":8,"align":2},{"row":7916,"col":2581,"font":8,"align":2},{"row":7916,"col":2582,"font":8,"align":2},{"row":7916,"col":2583,"font":8,"align":2},{"row":7916,"col":2584,"font":8,"align":2},{"row":7917,"col":205,"value":"Інші поточнi видатки","font":2,"align":0,"indent":0},{"row":7917,"col":206,"value":"2800","font":2,"align":1,"indent":0},{"row":7917,"col":207,"value":"360","font":2,"align":1,"indent":0},{"row":7917,"col":2575,"font":2,"align":2},{"row":7917,"col":2576,"font":2,"align":2},{"row":7917,"col":2577,"font":2,"align":2},{"row":7917,"col":2578,"font":2,"align":2},{"row":7917,"col":2579,"font":2,"align":2},{"row":7917,"col":2580,"font":2,"align":2},{"row":7917,"col":2581,"font":2,"align":2},{"row":7917,"col":2582,"font":2,"align":2},{"row":7917,"col":2583,"font":2,"align":2},{"row":7917,"col":2584,"font":2,"align":2},{"row":7918,"col":205,"value":"Капiтальнi видатки","font":2,"align":1,"indent":0},{"row":7918,"col":206,"value":"3000","font":2,"align":1,"indent":0},{"row":7918,"col":207,"value":"370","font":2,"align":1,"indent":0},{"row":7918,"col":2575,"align":2,"formula":"[7919;2575]+[7933;2575]","fixedKazn":"1"},{"row":7918,"col":2576,"align":2,"formula":"[7919;2576]+[7933;2576]","fixedKazn":"1"},{"row":7918,"col":2577,"align":2,"formula":"[7919;2577]+[7933;2577]","fixedKazn":"1"},{"row":7918,"col":2578,"align":2,"formula":"[7919;2578]+[7933;2578]","fixedKazn":"1"},{"row":7918,"col":2579,"align":2,"formula":"[7919;2579]+[7933;2579]","fixedKazn":"1"},{"row":7918,"col":2580,"align":2,"formula":"[7919;2580]+[7933;2580]","fixedKazn":"1"},{"row":7918,"col":2581,"align":2,"formula":"[7919;2581]+[7933;2581]","fixedKazn":"1"},{"row":7918,"col":2582,"align":2,"formula":"[7919;2582]+[7933;2582]","fixedKazn":"1"},{"row":7918,"col":2583,"align":2,"formula":"[7919;2583]+[7933;2583]","fixedKazn":"1"},{"row":7918,"col":2584,"align":2,"formula":"[7919;2584]+[7933;2584]","fixedKazn":"1"},{"row":7919,"col":205,"value":"Придбання основного капiталу*","font":2,"align":0,"indent":0},{"row":7919,"col":206,"value":"3100","font":2,"align":1,"indent":0},{"row":7919,"col":207,"value":"380","font":2,"align":1,"indent":0},{"row":7919,"col":2575,"align":2,"formula":"[7920;2575]+[7921;2575]+[7924;2575]+[7927;2575]+[7931;2575]+[7932;2575]","fPeriod":"011"},{"row":7919,"col":2576,"align":2,"formula":"[7920;2576]+[7921;2576]+[7924;2576]+[7927;2576]+[7931;2576]+[7932;2576]","fPeriod":"011"},{"row":7919,"col":2577,"align":2,"formula":"[7920;2577]+[7921;2577]+[7924;2577]+[7927;2577]+[7931;2577]+[7932;2577]","fPeriod":"011"},{"row":7919,"col":2578,"align":2,"formula":"[7920;2578]+[7921;2578]+[7924;2578]+[7927;2578]+[7931;2578]+[7932;2578]","fPeriod":"011"},{"row":7919,"col":2579,"align":2,"formula":"[7920;2579]+[7921;2579]+[7924;2579]+[7927;2579]+[7931;2579]+[7932;2579]","fPeriod":"011"},{"row":7919,"col":2580,"align":2,"formula":"[7920;2580]+[7921;2580]+[7924;2580]+[7927;2580]+[7931;2580]+[7932;2580]","fPeriod":"011"},{"row":7919,"col":2581,"align":2,"formula":"[7920;2581]+[7921;2581]+[7924;2581]+[7927;2581]+[7931;2581]+[7932;2581]","fPeriod":"011"},{"row":7919,"col":2582,"align":2,"formula":"[7920;2582]+[7921;2582]+[7924;2582]+[7927;2582]+[7931;2582]+[7932;2582]","fPeriod":"011"},{"row":7919,"col":2583,"align":2,"formula":"[7920;2583]+[7921;2583]+[7924;2583]+[7927;2583]+[7931;2583]+[7932;2583]","fPeriod":"011"},{"row":7919,"col":2584,"align":2,"formula":"[7920;2584]+[7921;2584]+[7924;2584]+[7927;2584]+[7931;2584]+[7932;2584]","fPeriod":"011"},{"row":7920,"col":205,"value":"Придбання обладнання і предметів довгострокового користування","font":8,"align":0,"indent":0},{"row":7920,"col":206,"value":"3110","font":8,"align":1,"indent":0},{"row":7920,"col":207,"value":"390","font":8,"align":1,"indent":0},{"row":7920,"col":2575,"font":8,"align":2},{"row":7920,"col":2576,"font":8,"align":2},{"row":7920,"col":2577,"font":8,"align":2},{"row":7920,"col":2578,"font":8,"align":2},{"row":7920,"col":2579,"font":8,"align":2},{"row":7920,"col":2580,"font":8,"align":2},{"row":7920,"col":2581,"font":8,"align":2},{"row":7920,"col":2582,"font":8,"align":2},{"row":7920,"col":2583,"font":8,"align":2},{"row":7920,"col":2584,"font":8,"align":2},{"row":7921,"col":205,"value":"Капiтальне будiвництво (придбання)","font":8,"align":0,"indent":0},{"row":7921,"col":206,"value":"3120","font":8,"align":1,"indent":0},{"row":7921,"col":207,"value":"400","font":8,"align":1,"indent":0},{"row":7921,"col":2575,"align":2,"formula":"[7922;2575]+[7923;2575]","fPeriod":"011"},{"row":7921,"col":2576,"align":2,"formula":"[7922;2576]+[7923;2576]","fPeriod":"011"},{"row":7921,"col":2577,"align":2,"formula":"[7922;2577]+[7923;2577]","fPeriod":"011"},{"row":7921,"col":2578,"align":2,"formula":"[7922;2578]+[7923;2578]","fPeriod":"011"},{"row":7921,"col":2579,"align":2,"formula":"[7922;2579]+[7923;2579]","fPeriod":"011"},{"row":7921,"col":2580,"align":2,"formula":"[7922;2580]+[7923;2580]","fPeriod":"011"},{"row":7921,"col":2581,"align":2,"formula":"[7922;2581]+[7923;2581]","fPeriod":"011"},{"row":7921,"col":2582,"align":2,"formula":"[7922;2582]+[7923;2582]","fPeriod":"011"},{"row":7921,"col":2583,"align":2,"formula":"[7922;2583]+[7923;2583]","fPeriod":"011"},{"row":7921,"col":2584,"align":2,"formula":"[7922;2584]+[7923;2584]","fPeriod":"011"},{"row":7922,"col":205,"value":"Капітальне будiвництво (придбання) житла","align":0,"indent":1},{"row":7922,"col":206,"value":"3121","align":1,"indent":0},{"row":7922,"col":207,"value":"410","align":1,"indent":0},{"row":7922,"col":2575,"align":2},{"row":7922,"col":2576,"align":2},{"row":7922,"col":2577,"align":2},{"row":7922,"col":2578,"align":2},{"row":7922,"col":2579,"align":2},{"row":7922,"col":2580,"align":2},{"row":7922,"col":2581,"align":2},{"row":7922,"col":2582,"align":2},{"row":7922,"col":2583,"align":2},{"row":7922,"col":2584,"align":2},{"row":7923,"col":205,"value":"Капітальне будівництво (придбання) інших обєктів","align":0,"indent":1},{"row":7923,"col":206,"value":"3122","align":1,"indent":0},{"row":7923,"col":207,"value":"420","align":1,"indent":0},{"row":7923,"col":2575,"align":2},{"row":7923,"col":2576,"align":2},{"row":7923,"col":2577,"align":2},{"row":7923,"col":2578,"align":2},{"row":7923,"col":2579,"align":2},{"row":7923,"col":2580,"align":2},{"row":7923,"col":2581,"align":2},{"row":7923,"col":2582,"align":2},{"row":7923,"col":2583,"align":2},{"row":7923,"col":2584,"align":2},{"row":7924,"col":205,"value":"Капiтальний ремонт","font":8,"align":0,"indent":0},{"row":7924,"col":206,"value":"3130","font":8,"align":1,"indent":0},{"row":7924,"col":207,"value":"430","font":8,"align":1,"indent":0},{"row":7924,"col":2575,"align":2,"formula":"[7925;2575]+[7926;2575]","fPeriod":"011"},{"row":7924,"col":2576,"align":2,"formula":"[7925;2576]+[7926;2576]","fPeriod":"011"},{"row":7924,"col":2577,"align":2,"formula":"[7925;2577]+[7926;2577]","fPeriod":"011"},{"row":7924,"col":2578,"align":2,"formula":"[7925;2578]+[7926;2578]","fPeriod":"011"},{"row":7924,"col":2579,"align":2,"formula":"[7925;2579]+[7926;2579]","fPeriod":"011"},{"row":7924,"col":2580,"align":2,"formula":"[7925;2580]+[7926;2580]","fPeriod":"011"},{"row":7924,"col":2581,"align":2,"formula":"[7925;2581]+[7926;2581]","fPeriod":"011"},{"row":7924,"col":2582,"align":2,"formula":"[7925;2582]+[7926;2582]","fPeriod":"011"},{"row":7924,"col":2583,"align":2,"formula":"[7925;2583]+[7926;2583]","fPeriod":"011"},{"row":7924,"col":2584,"align":2,"formula":"[7925;2584]+[7926;2584]","fPeriod":"011"},{"row":7925,"col":205,"value":"Капiтальний ремонт житлового фонду (приміщень)","align":0,"indent":1},{"row":7925,"col":206,"value":"3131","align":1,"indent":0},{"row":7925,"col":207,"value":"440","align":1,"indent":0},{"row":7925,"col":2575,"align":2},{"row":7925,"col":2576,"align":2},{"row":7925,"col":2577,"align":2},{"row":7925,"col":2578,"align":2},{"row":7925,"col":2579,"align":2},{"row":7925,"col":2580,"align":2},{"row":7925,"col":2581,"align":2},{"row":7925,"col":2582,"align":2},{"row":7925,"col":2583,"align":2},{"row":7925,"col":2584,"align":2},{"row":7926,"col":205,"value":"Капiтальний ремонт iнших об`єктiв","align":0,"indent":1},{"row":7926,"col":206,"value":"3132","align":1,"indent":0},{"row":7926,"col":207,"value":"450","align":1,"indent":0},{"row":7926,"col":2575,"align":2},{"row":7926,"col":2576,"align":2},{"row":7926,"col":2577,"align":2},{"row":7926,"col":2578,"align":2},{"row":7926,"col":2579,"align":2},{"row":7926,"col":2580,"align":2},{"row":7926,"col":2581,"align":2},{"row":7926,"col":2582,"align":2},{"row":7926,"col":2583,"align":2},{"row":7926,"col":2584,"align":2},{"row":7927,"col":205,"value":"Реконструкція та реставрація","font":8,"align":0,"indent":0},{"row":7927,"col":206,"value":"3140","font":8,"align":1,"indent":0},{"row":7927,"col":207,"value":"460","font":8,"align":1,"indent":0},{"row":7927,"col":2575,"align":2,"formula":"[7928;2575]+[7929;2575]+[7930;2575]","fPeriod":"011"},{"row":7927,"col":2576,"align":2,"formula":"[7928;2576]+[7929;2576]+[7930;2576]","fPeriod":"011"},{"row":7927,"col":2577,"align":2,"formula":"[7928;2577]+[7929;2577]+[7930;2577]","fPeriod":"011"},{"row":7927,"col":2578,"align":2,"formula":"[7928;2578]+[7929;2578]+[7930;2578]","fPeriod":"011"},{"row":7927,"col":2579,"align":2,"formula":"[7928;2579]+[7929;2579]+[7930;2579]","fPeriod":"011"},{"row":7927,"col":2580,"align":2,"formula":"[7928;2580]+[7929;2580]+[7930;2580]","fPeriod":"011"},{"row":7927,"col":2581,"align":2,"formula":"[7928;2581]+[7929;2581]+[7930;2581]","fPeriod":"011"},{"row":7927,"col":2582,"align":2,"formula":"[7928;2582]+[7929;2582]+[7930;2582]","fPeriod":"011"},{"row":7927,"col":2583,"align":2,"formula":"[7928;2583]+[7929;2583]+[7930;2583]","fPeriod":"011"},{"row":7927,"col":2584,"align":2,"formula":"[7928;2584]+[7929;2584]+[7930;2584]","fPeriod":"011"},{"row":7928,"col":205,"value":"Реконструкція житлового фонду (приміщень)","align":0,"indent":1},{"row":7928,"col":206,"value":"3141","align":1,"indent":0},{"row":7928,"col":207,"value":"470","align":1,"indent":0},{"row":7928,"col":2575,"align":2},{"row":7928,"col":2576,"align":2},{"row":7928,"col":2577,"align":2},{"row":7928,"col":2578,"align":2},{"row":7928,"col":2579,"align":2},{"row":7928,"col":2580,"align":2},{"row":7928,"col":2581,"align":2},{"row":7928,"col":2582,"align":2},{"row":7928,"col":2583,"align":2},{"row":7928,"col":2584,"align":2},{"row":7929,"col":205,"value":"Рекострукція та реставрація інших обїєктів","align":0,"indent":1},{"row":7929,"col":206,"value":"3142","align":1,"indent":0},{"row":7929,"col":207,"value":"480","align":1,"indent":0},{"row":7929,"col":2575,"align":2},{"row":7929,"col":2576,"align":2},{"row":7929,"col":2577,"align":2},{"row":7929,"col":2578,"align":2},{"row":7929,"col":2579,"align":2},{"row":7929,"col":2580,"align":2},{"row":7929,"col":2581,"align":2},{"row":7929,"col":2582,"align":2},{"row":7929,"col":2583,"align":2},{"row":7929,"col":2584,"align":2},{"row":7930,"col":205,"value":"Реставрація памяток культури, історії та архітектури","align":0,"indent":1},{"row":7930,"col":206,"value":"3143","align":1,"indent":0},{"row":7930,"col":207,"value":"490","align":1,"indent":0},{"row":7930,"col":2575,"align":2},{"row":7930,"col":2576,"align":2},{"row":7930,"col":2577,"align":2},{"row":7930,"col":2578,"align":2},{"row":7930,"col":2579,"align":2},{"row":7930,"col":2580,"align":2},{"row":7930,"col":2581,"align":2},{"row":7930,"col":2582,"align":2},{"row":7930,"col":2583,"align":2},{"row":7930,"col":2584,"align":2},{"row":7931,"col":205,"value":"Створення державних запасiв i резервiв","font":8,"align":0,"indent":0},{"row":7931,"col":206,"value":"3150","font":8,"align":1,"indent":0},{"row":7931,"col":207,"value":"500","font":8,"align":1,"indent":0},{"row":7931,"col":2575,"font":8,"align":2},{"row":7931,"col":2576,"font":8,"align":2},{"row":7931,"col":2577,"font":8,"align":2},{"row":7931,"col":2578,"font":8,"align":2},{"row":7931,"col":2579,"font":8,"align":2},{"row":7931,"col":2580,"font":8,"align":2},{"row":7931,"col":2581,"font":8,"align":2},{"row":7931,"col":2582,"font":8,"align":2},{"row":7931,"col":2583,"font":8,"align":2},{"row":7931,"col":2584,"font":8,"align":2},{"row":7932,"col":205,"value":"Придбання землi та нематерiальних активiв","font":8,"align":0,"indent":0},{"row":7932,"col":206,"value":"3160","font":8,"align":1,"indent":0},{"row":7932,"col":207,"value":"510","font":8,"align":1,"indent":0},{"row":7932,"col":2575,"font":8,"align":2},{"row":7932,"col":2576,"font":8,"align":2},{"row":7932,"col":2577,"font":8,"align":2},{"row":7932,"col":2578,"font":8,"align":2},{"row":7932,"col":2579,"font":8,"align":2},{"row":7932,"col":2580,"font":8,"align":2},{"row":7932,"col":2581,"font":8,"align":2},{"row":7932,"col":2582,"font":8,"align":2},{"row":7932,"col":2583,"font":8,"align":2},{"row":7932,"col":2584,"font":8,"align":2},{"row":7933,"col":205,"value":"Капiтальнi трансферти","font":2,"align":0,"indent":0},{"row":7933,"col":206,"value":"3200","font":2,"align":1,"indent":0},{"row":7933,"col":207,"value":"520","font":2,"align":1,"indent":0},{"row":7933,"col":2575,"align":2,"formula":"[7934;2575]+[7935;2575]+[7936;2575]+[7937;2575]","fPeriod":"011"},{"row":7933,"col":2576,"align":2,"formula":"[7934;2576]+[7935;2576]+[7936;2576]+[7937;2576]","fPeriod":"011"},{"row":7933,"col":2577,"align":2,"formula":"[7934;2577]+[7935;2577]+[7936;2577]+[7937;2577]","fPeriod":"011"},{"row":7933,"col":2578,"align":2,"formula":"[7934;2578]+[7935;2578]+[7936;2578]+[7937;2578]","fPeriod":"011"},{"row":7933,"col":2579,"align":2,"formula":"[7934;2579]+[7935;2579]+[7936;2579]+[7937;2579]","fPeriod":"011"},{"row":7933,"col":2580,"align":2,"formula":"[7934;2580]+[7935;2580]+[7936;2580]+[7937;2580]","fPeriod":"011"},{"row":7933,"col":2581,"align":2,"formula":"[7934;2581]+[7935;2581]+[7936;2581]+[7937;2581]","fPeriod":"011"},{"row":7933,"col":2582,"align":2,"formula":"[7934;2582]+[7935;2582]+[7936;2582]+[7937;2582]","fPeriod":"011"},{"row":7933,"col":2583,"align":2,"formula":"[7934;2583]+[7935;2583]+[7936;2583]+[7937;2583]","fPeriod":"011"},{"row":7933,"col":2584,"align":2,"formula":"[7934;2584]+[7935;2584]+[7936;2584]+[7937;2584]","fPeriod":"011"},{"row":7934,"col":205,"value":"Капiтальнi трансферти пiдприємствам (установам, органiзацiям)","font":8,"align":0,"indent":0},{"row":7934,"col":206,"value":"3210","font":8,"align":1,"indent":0},{"row":7934,"col":207,"value":"530","font":8,"align":1,"indent":0},{"row":7934,"col":2575,"font":8,"align":2},{"row":7934,"col":2576,"font":8,"align":2},{"row":7934,"col":2577,"font":8,"align":2},{"row":7934,"col":2578,"font":8,"align":2},{"row":7934,"col":2579,"font":8,"align":2},{"row":7934,"col":2580,"font":8,"align":2},{"row":7934,"col":2581,"font":8,"align":2},{"row":7934,"col":2582,"font":8,"align":2},{"row":7934,"col":2583,"font":8,"align":2},{"row":7934,"col":2584,"font":8,"align":2},{"row":7935,"col":205,"value":"Капітальні трансферти органам державного управління інших рівнів","font":8,"align":0,"indent":0},{"row":7935,"col":206,"value":"3220","font":8,"align":1,"indent":0},{"row":7935,"col":207,"value":"540","font":8,"align":1,"indent":0},{"row":7935,"col":2575,"font":8,"align":2},{"row":7935,"col":2576,"font":8,"align":2},{"row":7935,"col":2577,"font":8,"align":2},{"row":7935,"col":2578,"font":8,"align":2},{"row":7935,"col":2579,"font":8,"align":2},{"row":7935,"col":2580,"font":8,"align":2},{"row":7935,"col":2581,"font":8,"align":2},{"row":7935,"col":2582,"font":8,"align":2},{"row":7935,"col":2583,"font":8,"align":2},{"row":7935,"col":2584,"font":8,"align":2},{"row":7936,"col":205,"value":"Капiтальнi трансферти урядам іноземних держав та міжнародним організаціям","font":8,"align":0,"indent":0},{"row":7936,"col":206,"value":"3230","font":8,"align":1,"indent":0},{"row":7936,"col":207,"value":"550","font":8,"align":1,"indent":0},{"row":7936,"col":2575,"font":8,"align":2},{"row":7936,"col":2576,"font":8,"align":2},{"row":7936,"col":2577,"font":8,"align":2},{"row":7936,"col":2578,"font":8,"align":2},{"row":7936,"col":2579,"font":8,"align":2},{"row":7936,"col":2580,"font":8,"align":2},{"row":7936,"col":2581,"font":8,"align":2},{"row":7936,"col":2582,"font":8,"align":2},{"row":7936,"col":2583,"font":8,"align":2},{"row":7936,"col":2584,"font":8,"align":2},{"row":7937,"col":205,"value":"Капiтальнi трансферти населенню","font":8,"align":0,"indent":0},{"row":7937,"col":206,"value":"3240","font":8,"align":1,"indent":0},{"row":7937,"col":207,"value":"560","font":8,"align":1,"indent":0},{"row":7937,"col":2575,"font":8,"align":2},{"row":7937,"col":2576,"font":8,"align":2},{"row":7937,"col":2577,"font":8,"align":2},{"row":7937,"col":2578,"font":8,"align":2},{"row":7937,"col":2579,"font":8,"align":2},{"row":7937,"col":2580,"font":8,"align":2},{"row":7937,"col":2581,"font":8,"align":2},{"row":7937,"col":2582,"font":8,"align":2},{"row":7937,"col":2583,"font":8,"align":2},{"row":7937,"col":2584,"font":8,"align":2},{"row":7938,"col":205,"value":"Обслуговування внутрішніх боргових зобовязань","align":0,"indent":0},{"row":7938,"col":206,"value":"2410","align":1,"indent":0},{"row":7938,"col":207,"value":"260","align":1,"indent":0},{"row":7938,"col":2575,"align":2},{"row":7938,"col":2576,"align":2},{"row":7938,"col":2577,"align":2},{"row":7938,"col":2578,"align":2},{"row":7938,"col":2579,"align":2},{"row":7938,"col":2580,"align":2},{"row":7938,"col":2581,"align":2},{"row":7938,"col":2582,"align":2},{"row":7938,"col":2583,"align":2},{"row":7938,"col":2584,"align":2},{"row":7939,"col":205,"value":"Обслуговування зовнішніх боргових зобовязань","align":0,"indent":0},{"row":7939,"col":206,"value":"2420","align":1,"indent":0},{"row":7939,"col":207,"value":"270","align":1,"indent":0},{"row":7939,"col":2575,"align":2},{"row":7939,"col":2576,"align":2},{"row":7939,"col":2577,"align":2},{"row":7939,"col":2578,"align":2},{"row":7939,"col":2579,"align":2},{"row":7939,"col":2580,"align":2},{"row":7939,"col":2581,"align":2},{"row":7939,"col":2582,"align":2},{"row":7939,"col":2583,"align":2},{"row":7939,"col":2584,"align":2},{"row":7940,"col":205,"value":"Соціальне забезпечення","font":2,"align":0,"indent":0},{"row":7940,"col":206,"value":"2700","font":2,"align":1,"indent":0},{"row":7940,"col":207,"value":"320","font":2,"align":1,"indent":0},{"row":7940,"col":2575,"align":2,"formula":"[7914;2575]+[7915;2575]+[7916;2575]"},{"row":7940,"col":2576,"align":2,"formula":"[7914;2576]+[7915;2576]+[7916;2576]"},{"row":7940,"col":2577,"align":2,"formula":"[7914;2577]+[7915;2577]+[7916;2577]"},{"row":7940,"col":2578,"align":2,"formula":"[7914;2578]+[7915;2578]+[7916;2578]"},{"row":7940,"col":2579,"align":2,"formula":"[7914;2579]+[7915;2579]+[7916;2579]"},{"row":7940,"col":2580,"align":2,"formula":"[7914;2580]+[7915;2580]+[7916;2580]"},{"row":7940,"col":2581,"align":2,"formula":"[7914;2581]+[7915;2581]+[7916;2581]"},{"row":7940,"col":2582,"align":2,"formula":"[7914;2582]+[7915;2582]+[7916;2582]"},{"row":7940,"col":2583,"align":2,"formula":"[7914;2583]+[7915;2583]+[7916;2583]"},{"row":7940,"col":2584,"align":2,"formula":"[7914;2584]+[7915;2584]+[7916;2584]"},{"row":8978,"col":205,"value":"у тому числі:","align":1,"indent":0},{"row":8978,"col":206,"readonly":1},{"row":8978,"col":207,"align":1,"readonly":1},{"row":8978,"col":2575,"align":2,"readonly":1},{"row":8978,"col":2576,"align":2,"readonly":1},{"row":8978,"col":2577,"align":2,"readonly":1},{"row":8978,"col":2578,"align":2,"readonly":1},{"row":8978,"col":2579,"align":2,"readonly":1},{"row":8978,"col":2580,"align":2,"readonly":1},{"row":8978,"col":2581,"align":2,"readonly":1},{"row":8978,"col":2582,"align":2,"readonly":1},{"row":8978,"col":2583,"align":2,"readonly":1},{"row":8978,"col":2584,"align":2,"readonly":1},{"row":8979,"col":2581,"value":"прострочена","align":1},{"row":8979,"col":2582,"value":"термін оплати якої не настав","align":1},{"row":8980,"col":2576,"value":"усього","rspan":2,"align":1},{"row":8980,"col":2577,"value":"з неї прострочена","rspan":2,"align":1},{"row":8980,"col":2580,"value":"усього","rspan":2,"align":1},{"row":8980,"col":2581,"value":"з неї","cspan":2,"align":1},{"row":8981,"col":2575,"value":"на початок звітного року, усього","rspan":3,"align":1},{"row":8981,"col":2576,"value":"на кінець звітного періоду (року)","cspan":2,"align":1},{"row":8981,"col":2577,"align":1},{"row":8981,"col":2578,"value":"списана за період з початку звітного року","rspan":3,"align":1},{"row":8981,"col":2579,"value":"на початок звітного року, усього","rspan":3,"align":1},{"row":8981,"col":2580,"value":"на кінець звітного періоду (року)","cspan":3,"align":1},{"row":8981,"col":2581,"align":1},{"row":8981,"col":2582,"align":1},{"row":8981,"col":2583,"value":"списана за період з початку звітного року","rspan":3,"align":1},{"row":8982,"col":205,"value":"Показники","rspan":4,"align":1},{"row":8982,"col":206,"value":"КЕКВ","rspan":4,"align":1},{"row":8982,"col":207,"value":"Код рядка","rspan":4,"align":1},{"row":8982,"col":2575,"value":"Дебіторська заборгованість","cspan":4,"align":1},{"row":8982,"col":2576,"align":1},{"row":8982,"col":2577,"align":1},{"row":8982,"col":2578,"align":1},{"row":8982,"col":2579,"value":"Кредиторська заборгованість","cspan":5,"align":1},{"row":8982,"col":2580,"valign":"0"},{"row":8982,"col":2581,"valign":"0"},{"row":8982,"col":2582,"valign":"0"},{"row":8982,"col":2583,"valign":"0"},{"row":8982,"col":2584,"value":"Зареєстровані бюджетні фінансові зобовязання на кінець звітного періоду (року) усього","rspan":4,"align":1},{"row":8983,"col":205,"value":"#COL_NUM#","align":1},{"row":8983,"col":206,"value":"#COL_NUM#","align":1},{"row":8983,"col":207,"value":"#COL_NUM#","align":1},{"row":8983,"col":2575,"value":"#COL_NUM#","align":1},{"row":8983,"col":2576,"value":"#COL_NUM#","align":1},{"row":8983,"col":2577,"value":"#COL_NUM#","align":1},{"row":8983,"col":2578,"value":"#COL_NUM#","align":1},{"row":8983,"col":2579,"value":"#COL_NUM#","align":1},{"row":8983,"col":2580,"value":"#COL_NUM#","align":1},{"row":8983,"col":2581,"value":"#COL_NUM#","align":1},{"row":8983,"col":2582,"value":"#COL_NUM#","align":1},{"row":8983,"col":2583,"value":"#COL_NUM#","align":1},{"row":8983,"col":2584,"value":"#COL_NUM#","align":1}],"printData":{"caption":"<div style=\"text-align:center;font-size:11px\"><br />\r<strong>Звіт</strong><br />\r<strong>про заборгованість за бюджетними коштами (форма <u>№7 д</u>, №7 м)</strong><br />\r<strong>станом на <u>01 квiтня 2015 р.</u></strong><br />\r&nbsp;</div>\r\r<table style=\"font-size:7px\" widths=\"80%,20%\">\r\t<tbody>\r\t\t<tr>\r\t\t\t<td><span style=\"font-size:8px;\"><strong>Установа &nbsp;<u>(03135) Харківська державна академія дизайну і мистецтв</u><br />\r\t\t\tТериторія &nbsp;<u></u><br />\r\t\t\tОрганізаційно-правова форма господарювання &nbsp;<u></u><br />\r\t\t\tКод та назва відомчої класифікації видатків та кредитування державного бюджету &nbsp;<u>220 Міністерство освіти і науки України</u><br />\r\t\t\tКод та назва програмної класифікації видатків та кредитування державного бюджету <u> 2201160 Підготовка кадрів вищими навчальними закладами III і IV рівнів акредитації та забезпечення діяльності їх баз практики</u><br />\r\t\t\tКод та назва типової відомчої класифікації видатків та кредитування місцевих бюджетів <br />\r\t\t\tКод та назва програмної класифікації видатків та кредитування місцевих бюджетів (код та назва Типової програмної класифікації видатків та кредитування місцевих бюджетів/тимчасової класифікації видатків та кредитування для бюджетів місцевого самоврядування, які на застосовують програмно-цільового методу)** </strong><br />\r\t\t\tПеріодичність: мiсячна,<u>квартальна</u>,річна<br />\r\t\t\tОдиниця виміру: грн коп.<br />\r\t\t\t<strong>Форма складена: за <u>спецiальним</u>, загальним фондом&nbsp;(необхідне підкреслити).</strong></span></td>\r\t\t\t<td>&nbsp;\r\t\t\t<table>\r\t\t\t\t<tbody>\r\t\t\t\t\t<tr>\r\t\t\t\t\t\t<td>&nbsp;</td>\r\t\t\t\t\t\t<td style=\"text-align:center; vertical-align:top\">Коди</td>\r\t\t\t\t\t</tr>\r\t\t\t\t\t<tr>\r\t\t\t\t\t\t<td style=\"text-align:right\"><br />\r\t\t\t\t\t\t<strong>за ЄДРПОУ<br />\r\t\t\t\t\t\tза КОАТУУ<br />\r\t\t\t\t\t\tза КОПФГ</strong></td>\r\t\t\t\t\t\t<td style=\"text-align:center\">\r\t\t\t\t\t\t<table border=\"1\">\r\t\t\t\t\t\t\t<tbody>\r\t\t\t\t\t\t\t\t<tr>\r\t\t\t\t\t\t\t\t\t<td style=\"text-align:center\"><strong>&nbsp;02071145</strong></td>\r\t\t\t\t\t\t\t\t</tr>\r\t\t\t\t\t\t\t\t<tr>\r\t\t\t\t\t\t\t\t\t<td style=\"text-align:center\"><strong>6310136600</strong></td>\r\t\t\t\t\t\t\t\t</tr>\r\t\t\t\t\t\t\t\t<tr>\r\t\t\t\t\t\t\t\t\t<td style=\"text-align:center\"><strong>&nbsp;425</strong></td>\r\t\t\t\t\t\t\t\t</tr>\r\t\t\t\t\t\t\t</tbody>\r\t\t\t\t\t\t</table>\r\t\t\t\t\t\t</td>\r\t\t\t\t\t</tr>\r\t\t\t\t</tbody>\r\t\t\t</table>\r\t\t\t</td>\r\t\t</tr>\r\t</tbody>\r</table>\r","footer":"test","colonFirst":"<div style=\"text-align: left; font-size: 8px;margin-left:640px;margin-top:20\">Додаток 10<br />\rдо Порядку складання фінансової, бюджетної та<br />\rіншої звітності розпорядниками та одержувачами<br />\rбюджетних коштів<br />\r(абзац дев&rsquo;ятий підпункту 2.1.2 пункту 2.1)</div>\r","colonOther":"<div style=\"text-align: right; font-size: 8px; margin-top:18px;margin-bottom:2px;margin-right:32px;\">Продовження додатка 10</div>\r","note":"<div style=\"font-size:6px\">*) У місячній бюджетній звітності рядки з 380 по 560 не заповнюються</div>\r\r<div style=\"font-size:6px\">**) До запровадження програмно-цільового методу складання та виконання місцевих бюджетів проставляються код та назва тимчасової класифікації видатків та кредитування місцевих бюджетів.</div>\r","portrait":"0","fromNewPage":"0","margins":"50 30 30 15"},"inputData":[{"idRow":7885,"idCol":2575,"value":"10541,93"},{"idRow":7885,"idCol":2576,"value":"51251,17"},{"idRow":7885,"idCol":2579,"value":"1249143,86"},{"idRow":7885,"idCol":2580,"value":"492182,31"},{"idRow":7885,"idCol":2583,"value":"8523,28"},{"idRow":7886,"idCol":2575,"value":"542,62"},{"idRow":7886,"idCol":2576,"value":"10210,22"},{"idRow":7886,"idCol":2579,"value":"536269,36"},{"idRow":7886,"idCol":2580,"value":"50911,82"},{"idRow":7886,"idCol":2582,"value":"50911,82"},{"idRow":7886,"idCol":2584,"value":"50911,82"},{"idRow":7887,"idCol":2575,"value":"542,62"},{"idRow":7887,"idCol":2576,"value":"10210,22"},{"idRow":7887,"idCol":2579,"value":"532276,36"},{"idRow":7887,"idCol":2580,"value":"50911,82"},{"idRow":7887,"idCol":2582,"value":"50911,82"},{"idRow":7887,"idCol":2584,"value":"50911,82"},{"idRow":7888,"idCol":2576,"value":"1544,15"},{"idRow":7889,"idCol":2576,"value":"1509,43"},{"idRow":7890,"idCol":2576,"value":"1509,43"},{"idRow":7892,"idCol":2576,"value":"34,72"},{"idRow":7893,"idCol":2575,"value":"542,62"},{"idRow":7893,"idCol":2576,"value":"8348,86"},{"idRow":7893,"idCol":2579,"value":"523210,8"},{"idRow":7893,"idCol":2580,"value":"50911,82"},{"idRow":7893,"idCol":2582,"value":"50911,82"},{"idRow":7893,"idCol":2584,"value":"50911,82"},{"idRow":7894,"idCol":2576,"value":"104,47"},{"idRow":7894,"idCol":2579,"value":"184860,33"},{"idRow":7894,"idCol":2580,"value":"779,82"},{"idRow":7894,"idCol":2582,"value":"779,82"},{"idRow":7894,"idCol":2584,"value":"779,82"},{"idRow":7897,"idCol":2576,"value":"43,98"},{"idRow":7897,"idCol":2579,"value":"330465,62"},{"idRow":7897,"idCol":2580,"value":"49882"},{"idRow":7897,"idCol":2582,"value":"49882"},{"idRow":7897,"idCol":2584,"value":"49882"},{"idRow":7898,"idCol":2576,"value":"1661,43"},{"idRow":7898,"idCol":2579,"value":"7524,85"},{"idRow":7898,"idCol":2580,"value":"250"},{"idRow":7898,"idCol":2582,"value":"250"},{"idRow":7898,"idCol":2584,"value":"250"},{"idRow":7900,"idCol":2575,"value":"542,62"},{"idRow":7900,"idCol":2576,"value":"6538,98"},{"idRow":7901,"idCol":2576,"value":"6025,43"},{"idRow":7902,"idCol":2576,"value":"205,59"},{"idRow":7903,"idCol":2575,"value":"542,62"},{"idRow":7903,"idCol":2576,"value":"307,96"},{"idRow":7906,"idCol":2579,"value":"360"},{"idRow":7908,"idCol":2579,"value":"360"},{"idRow":7917,"idCol":2576,"value":"317,21"},{"idRow":7917,"idCol":2579,"value":"9065,56"},{"idRow":7918,"idCol":2579,"value":"3993"},{"idRow":7919,"idCol":2579,"value":"3993"},{"idRow":7920,"idCol":2579,"value":"3993"}]}]}]};
        var emptyChar = iasufr.storeGet("print.emptyChar") || "-";
        var fontSize = iasufr.storeGet("print.customFontSize" + opt.code) || 7;
        var pageMargins = "";
        var PAGE_WIDTH = 210;
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
                                    widths.push(Math.round(parseFloat(parts[ttt]) / 100 * PAGE_WIDTH));
                            }
                        }
                    } else {
                        for (var c = 0; c < tdesc.cols.length; c++) {
                            if (tdesc.cols[c].printWidth) widths.push(Math.round(parseFloat(tdesc.cols[c].printWidth) / 100 * PAGE_WIDTH));
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

                function createTd(cell, width) {
                    var style = "";
                    if (width) style = " style='width:" + width + "mm'";
                    return "<td"+spans+style+">" + (cell.text || "") + "</td>";
                }
                var widths = calcWidths(tdesc);
                tdesc.rows.sort(function(a,b) { if (parseInt(a.pos) > parseInt(b.pos)) return 1; else return -1 });

                var tableInitial = '<table border="1" style="font-size: ' + fontSize + 'px; font-family: Times; border: 1px solid" cellpadding="0" cellspacing="0">';
                var table = tableInitial;
                var hasHeader = false;
                var headerDone = false;
                var skipRows = [];
                var hrows = 0;
                var headerOnNewPage = false;
                for (var r = 0; r < tdesc.rows.length; r++) {
                    if (!headerDone) {
                        if (tdesc.rows[r].header) {
                            if (tdesc.rows[r].newpage === 1) {
                                if (hasHeader) {
                                    headerOnNewPage = true;
                                    table += "</thead>" + tableInitial + "<thead>";
                                }
                            }
                            if (!hasHeader) {
                                hasHeader = true;
                                table += "<thead>";
                                var maxspan = 0;
                                tdesc.cells.map(function (el) {
                                    if (el.row === tdesc.rows[r].id) {
                                        var v = el.rspan || 0;
                                        if (v > maxspan) maxspan = v;
                                    }
                                });
                                hrows += maxspan;
                            }
                        } else {
                            hrows--;
                            if (hasHeader && hrows < 0) {
                                table += "</thead>";
                                headerDone = true;
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


                        var setWidth = (hrows === 1 && hasHeader) || headerOnNewPage;
                        var spans = "";
                        if (cell.rowSpan || cell.colSpan) {
                            if (cell.colSpan) spans = " colspan='" + cell.colSpan + "'";
                            if (cell.rowSpan) spans = " rowspan='" + cell.rowSpan + "'";
                        }
                        if (cell.text == " " || cell.text == "") {
                            if (idx !== -1 && tdesc.cells[idx].readonly == 1)
                                row += createTd(cell, setWidth ? widths[c] : undefined);
                            else {
                                if (!cell.alignment) cell.alignment = "right";
                                cell.text = emptyChar;
                                row += createTd(cell, setWidth ? widths[c] : undefined);
                            }
                        } else row += createTd(cell, setWidth ? widths[c] : undefined);


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
//@ sourceURL=/monu/form/printForm.js