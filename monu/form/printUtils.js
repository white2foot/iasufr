function PrintUtils() {
    var isDirty;

    this.parseHtml = ParseHtml;
    this.cleanUp = function (o){
        isDirty = true;
        while (isDirty) {
            isDirty = false;
            CleanUp(o);
        }
    };

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
                    case "page-break-after": {
                        if (st[1].toLowerCase() == "always") o.pageBreak = 'after';
                        break;
                    }
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
            case "b":case "strong":
            {
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
                p.text.push({text:" "});
                cnt.push(p);
                break;
            }
            case "table":
            {
                var t = {
                    table: {
                        //TODO: fix this ?
                        //widths: [],
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
                   /* if (t.table.body.length != 0) {
                        if (t.table.body[0].length != 0) for (var k = 0; k < t.table.body[0].length; k++) t.table.widths.push("*");
                    }*/
                } else {
                    var w = widths.split(",");
                    t.table.widths = [];
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

    function CreateParagraph() {
        var p = {text:[]};
        return p;
    }

    function ParseHtml(cnt, htmlText) {
        htmlText = htmlText.replace(/\t/g, "").replace(/\n/g, "").replace(/&nbsp;/g, "").replace(/(\r\n|\n|\r)/gm,"");
        if (htmlText.substr(1, 1) != "<") {
            htmlText = "<div>" + htmlText + "</div>";
        }
        var html = $(htmlText);
        var p = CreateParagraph();
        for (var i = 0; i < html.length; i++) ParseElement(cnt, html.get(i), p);
    }

    function IsEmpty(item) {
        if (item.text) {
            if (Array.isArray(item.text)) if (item.text.length != 0) return false;
            if (typeof item.text === "string") if (item.text !== "") return false;
        }
        if (item.stack) {
            if (Array.isArray(item.stack)) if (item.stack.length != 0) return false;
        }
        return true;
    }

    function CleanUpArray(a) {
        if (a.length == 0) {
            console.log("Cleanup array length is 0. Don't should be");
            return;
        }
        var i = 0;
        while (i < a.length) {
            if (IsEmpty(a[i])) {
                a.splice(i, 1);
                continue;
            }
            if (a[i].stack) if (Array.isArray(a[i].stack)) CleanUpArray(a[i].stack);
            if (a[i].text) if (Array.isArray(a[i].text)) {
                if (a[i].text.length == 1) {
                    a[i].text = a[i].text[0].text;
                } else CleanUpArray(a[i].text);
            }
            if (typeof a[i].text === "string") {
                if (Object.keys(a[i]).length == 1) a[i] = a[i].text;
            }
            i++;
        }
        /*var done = false;
        while (!done) {
            done = true;

        }*/
    }

    function CleanUp(o) {
        if (o.stack) if (Array.isArray(o.stack)) CleanUpArray(o.stack);
        if (o.text) if (Array.isArray(o.text)) CleanUpArray(o.text);
        if (Array.isArray(o)) CleanUpArray(o);

        /*if (!o) return;
        if (typeof o.text === "string") return;
        if (Array.isArray(o)) {
            for (var i = 0; i < o.length; i++) {
                if (Array.isArray(o[i].stack)) {
                    for (var j = 0; j < o[i].stack.length; j++) {
                        if (Array.isArray(o[i].stack[j].text)) {
                            if (o[i].stack[j].text.length == 0) {
                                o[i].stack.splice(j, 1);
                                isDirty = true;
                                return;
                            }
                        }
                    }
                } else
                if (Array.isArray(o[i].text)) {
                    if (o[i].text.length == 1) {
                        o[i].text = o[i].text[0];
                        isDirty = true;
                    }
                    // check nested text arrays
                    for (var j = 0; j < o[i].text.length; j++) if (Array.isArray(o[i].text[j].text)) {
                        var itemsToMove = o[i].text[j].text;
                        var removedObj = o[i].text[j];
                        o[i].text.splice(j, 1);
                        for (var k = 0; k < itemsToMove.length; k++) {
                            if (Object.keys(removedObj).length > 1) {
                                if (typeof itemsToMove[k] === "string") itemsToMove[k] = { text: itemsToMove[k] };
                                for (var attr in removedObj) if (attr != "text") itemsToMove[k][attr] = removedObj[attr];
                            }
                            o[i].text.splice(j, 0, itemsToMove[k])
                        }
                        isDirty = true;
                        return;
                    }
                    CleanUp(o[i]);
                } else {
                    if (typeof o[i].text === "string") {
                        if (Object.keys(o[i]).length === 1) {
                            o[i] = o[i].text;
                            isDirty = true;
                        }
                    } else {
                        if (Object.keys(o[i]).length === 1) {
                            if (o[i].text) {
                                if (o[i].text.text) {
                                    o[i].text = o[i].text.text;
                                    isDirty = true;
                                    continue;
                                }
                            }
                        }
                        CleanUp(o[i]);
                    }
                }
                ///} else CleanUp(o[i]);
            }
        } else {
            if (o.text) CleanUp(o.text); else if (o.stack) CleanUp(o.stack);
        }*/
    }
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
    var textElement = { text: [] };
    var block = textElement;
    var blockStyle = "";
    var isDirty = false;

    function GetNodeStyle(node) {
        var o = {};
        if (node.nodeName == '#text') return o;
        var style = node.attributes["style"];
        if (!style) style = ""; else style = style.textContent;
        var styles = style.toLowerCase().trim().split(";");

        // Get style based on node tag
        switch (node.tagName.toLowerCase()) {
            case "b":case "strong":
                styles.push("font-weight:bold");
                break;
            case "u":
                styles.push("text-decoration:underline");
                break;
            case "i":
                styles.push("font-style:italic");
                break;
        }


        // Get style based on node style
        for (var i = 0; i < styles.length; i++) {
            var st = styles[i].trim().toLowerCase().split(":");
            if (st.length == 2) {
                st[0] = st[0].trim();
                st[1] = st[1].trim();
                switch (st[0]) {
                    case "page-break-after":
                    {
                        if (st[1].toLowerCase() == "always") o.pageBreak = 'after';
                        break;
                    }
                    case "margin-top":
                    {
                        if (!o.margin) o.margin = [0, 0, 0, 0];
                        o.margin[1] = parseInt(st[1]);
                        break;
                    }
                    case "margin-bottom":
                    {
                        if (!o.margin) o.margin = [0, 0, 0, 0];
                        o.margin[3] = parseInt(st[1]);
                        break;
                    }
                    case "margin-left":
                    {
                        if (!o.margin) o.margin = [0, 0, 0, 0];
                        o.margin[0] = parseInt(st[1]);
                        break;
                    }
                    case "margin-right":
                    {
                        if (!o.margin) o.margin = [0, 0, 0, 0];
                        o.margin[2] = parseInt(st[1]);
                        break;
                    }
                    case "font-size":
                    {
                        o.fontSize = parseInt(st[1]);
                        break;
                    }
                    case "text-align":
                    {
                        switch (st[1]) {
                            case "right":
                                o.alignment = 'right';
                                break;
                            case "center":
                                o.alignment = 'center';
                                break;
                        }
                        break;
                    }
                    case "font-weight":
                    {
                        switch (st[1]) {
                            case "bold":
                                o.bold = true;
                                break;
                        }
                        break;
                    }
                    case "text-decoration":
                    {
                        switch (st[1]) {
                            case "underline":
                                o.decoration = "underline";
                                break;
                        }
                        break;
                    }
                    case "font-style":
                    {
                        switch (st[1]) {
                            case "italic":
                                o.italics = true;
                                break;
                        }
                        break;
                    }
                }
            }
        }

        return o;
        // TODO: Get node based on node class
    }


    function ParseNode(node) {

        if (node.nodeName == '#text') {

            textElement.text.push(node.textContent);
            return;
        }
        var prevStyle = null;
        var style = null;
        var oldBlock = null;
        for (var i = 0; i < node.childNodes.length; i++) {

            var style = GetNodeStyle(node.childNodes[i]);


            if (node.tagName) if (node.tagName.toLowerCase() === "div") {
                var newEl = {text:[]};
                textElement = {stack: [textElement, newEl]};
                textElement = newEl;
            }


            if ((Object.keys(style).length != 0)) {
                prevStyle = style;
                var newEl = {text:[]};
                for (var k in style) newEl[k] = style[k];
                textElement.text.push(newEl);
                oldBlock = textElement;
                textElement = newEl;
            }

            ParseNode(node.childNodes[i]);
            if (oldBlock) {
                textElement = oldBlock;
                oldBlock = null;
                //textElement = {text: ""};
                //block.text.push(textElement);
            }
        }
    }

    function CleanUp(o) {
        if (!o) return;
        if (typeof o.text === "string") return;
        if (Array.isArray(o)) {
            for (var i = 0; i < o.length; i++) {
                if (Array.isArray(o[i].text)) {
                    if (o[i].text.length == 1) {
                        o[i].text = o[i].text[0];
                        isDirty = true;
                    }
                    // check nested text arrays
                    for (var j = 0; j < o[i].text.length; j++) if (Array.isArray(o[i].text[j].text)) {
                        var itemsToMove = o[i].text[j].text;
                        var removedObj = o[i].text[j];
                        o[i].text.splice(j, 1);
                        for (var k = 0; k < itemsToMove.length; k++) {
                            if (Object.keys(removedObj).length > 1) {
                                if (typeof itemsToMove[k] === "string") itemsToMove[k] = { text: itemsToMove[k] };
                                for (var attr in removedObj) if (attr != "text") itemsToMove[k][attr] = removedObj[attr];
                            }
                            o[i].text.splice(j, 0, itemsToMove[k])
                        }
                        isDirty = true;
                        return;
                    }
                    CleanUp(o[i]);
                } else
                    if (typeof o[i].text === "string")
                    {
                        if (Object.keys(o[i]).length === 1) {
                            o[i] = o[i].text;
                            isDirty = true;
                        }
                    } else {
                        if (Object.keys(o[i]).length === 1) {
                            if (o[i].text) {
                                if (o[i].text.text) {
                                    o[i].text = o[i].text.text;
                                    isDirty = true;
                                    continue;
                                }
                            }
                        }
                        CleanUp(o[i]);
                    }
                ///} else CleanUp(o[i]);
            }
        } else CleanUp(o.text);
    }

    function ParseHtml(htmlText) {
        htmlText = "<div>ffff<span>ss</span></div><div>ggg</div>";
        var doc = new DOMParser().parseFromString(htmlText, "text/html");
        textElement = { text: [] };
        block = textElement.text;

        ParseNode(doc.body);
        isDirty = true;
        while (isDirty) {
            isDirty = false;
            CleanUp(block);
        }

        console.log(JSON.stringify(block));
        return block;
    }*/
}

//@ sourceURL=/anton/printUtils.js