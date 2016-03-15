iasufr = {

    // ***********************************************************************************
    ready : null,
    mainLayout: null,
    mainCell: null,
    wins: null,
    loadedScripts: [],
    user: {
        login: "",
        orgName: "",
        orgCode: "",
        orgId: "",
        fio: "",
        groups: [],
        funcs: {}
    },

    alert: function(msg, callback) {
        dhtmlx.alert({text: msg.replace(/</g, "").replace(/>/g, ""), callback: callback});
    },

    message: function(msg) {
        dhtmlx.message(msg.replace(/</g, "").replace(/>/g, ""));
    },

    messageSuccess: function(msg) {
        dhtmlx.message({ type:"success", expire:500, text: msg.replace(/</g, "").replace(/>/g, "") });
    },

    showError: function(msg, callback) {
        dhtmlx.message({title: 'Помилка', text: msg.replace(/</g, "").replace(/>/g, ""), type: 'alert-error'});
    },

    confirm: function(msg, callback) {
        dhtmlx.confirm({text: msg.replace(/</g, "").replace(/>/g, ""), cancel: "Нi", ok: "Так", callback: function(r){if (r && callback) callback()}});
    },

    prompt: function(title, text, callback, defaultValue) {
        var wnd = iasufr.wins.createWindow("prompt" + new Date().valueOf(), 0, 0, 320, 160);
        wnd.denyPark();
        wnd.denyResize();
        wnd.setText(title);
        wnd.setModal(true);
        wnd.centerOnScreen();

        var frmData = [
            { type:"settings", inputWidth: 285, labelWidth:285, position:"absolute" },
            { type:"input", name:"input", label: text, labelLeft:10, labelTop:10, inputLeft:10, inputTop:30, rows: 3 },
            { type: "button", name: "ok", value:"Прийняти", inputLeft:40, inputTop: 90 },
            { type: "button", name: "close", value:"Закрити", inputLeft:165, inputTop: 90 }
        ];
        var frm = wnd.attachForm(frmData);
        if (defaultValue) frm.setItemValue("input", defaultValue);
        frm.getInput("input").focus();
        frm.attachEvent("onButtonClick", function(name) {
            if (name === "ok") {
                var value = frm.getItemValue("input");
                if (callback) callback(value);
            }
            wnd.close();
        });
    },

    logError: function (e, txt) {
        if (!txt) console.log("[IASUFR]"); else console.log("[IASUFR] " + txt + ":");
        if (e) console.log(e.stack);
    },

	setTitle: function(t, title) {
        if (t) {
            if (t.owner) {
                if (!t.owner.isWindow || t.owner == iasufr.mainCell) document.title = title;
                if (t.owner.setText) {
                    t.owner.setText(title);
                    return;
                }
            }
        }

   	},

    // инициальзация служебных программ
    internalInit: function() {
        $(document).keydown(function (e){
            if (e.keyCode == 27) {
                var w1 = iasufr.wins.getTopmostWindow(true);
                if (w1) {
                    if (w1.askForClose) {
                        doAskForClose(w1);
                        return;
                    }
                    w1.close();
                }
            }
        });
    },

    // Проверяет может ли родитель привяязвать тулбар, если нет, то создается layout и его клетка становится owner
    checkOwner: function(owner, opt) {
        var w = 800;
        var h = 600;
        var title = "";
        if (opt) {
            if (opt.width) w = opt.width; else opt.width = w;
            if (opt.height) h = opt.height; else opt.height = h;
            if (opt.title) title = opt.title;
        }
        if (!owner) {
            var wnd = iasufr.wins.createWindow("sp" + new Date().valueOf(), 0, 0, w, h);
            wnd.spravName = opt.sprav;
            if (opt) {
                //if (opt.maximized) wnd.maximize();
                if (opt.maximized) {
                    wnd.setDimension(iasufr.wins.vp.offsetWidth, iasufr.wins.vp.offsetHeight - 26);
                    wnd.setPosition(0, 26);
                    //wnd.maximize();
                }
                if (opt.modal) wnd.setModal(true);
                if ((opt.ico != undefined) && (opt.ico)) wnd.setIcon("iasufrIcons/" + opt.ico, "iasufrIcons/" + opt.ico);
            }
            wnd.setText(title);
            if (!opt.maximized) wnd.centerOnScreen();
            setTimeout(function() {try{if(wnd) wnd.bringToTop()}catch(e){}}, 100);
            var evtClose = iasufr.wins.attachEvent("onClose", function(closedWin) {
                if (closedWin == wnd) {
                    if (wnd.onCloseFunc) wnd.onCloseFunc();
                    if (wnd.askForClose) {
                        doAskForClose(wnd);
                        return false;
                    }
                    iasufr.wins.detachEvent(evtClose)
                }
                return true;
            });


            //dhxWins.window(id).bringToTop();
            return wnd;
        }
        if (owner.setText) owner.setText(title);
        if (owner["attachToolbar"] == undefined) {
            var layout;
            layout = new dhtmlXLayoutObject(owner, "1C");
            return layout.cells("a");
        }
        return owner;
    },

    // ****************************** ajax запросы к Cahce *********************************
    ajax: function (options) {
        if (!options.data) options.data={};
        if (options.url) {
            // Проверяем был ли это запрос к классу
            var idx = options.url.indexOf("?");
            var cl = "";
            if (idx != -1) cl = options.url.substr(0, idx); else cl = options.url;
            if (cl.substr(cl.length - 4, cl.length).toLowerCase() == ".cls") cl = cl.substr(0, cl.length - 4); else cl ="";

            // Если это был запрос к классу, то заменяем его в url на base.Page а сам класс передаем как параметр
            if (cl != "ac.CheckLogin" && cl != "") {
                options.url = options.url.replace(cl, "base.Page");
                options.data.class = cl;
                if (options.url.substr(0, 1) == "/") options.url = options.url.substring(1, options.url.length);
            }
            options.url = iasufr.const.CACHE_URL + options.url;
        }

        $.extend(options.data, {iasu: 1});
        var oldSuccess = options.success;
        options.success = function(data, textStatus, jqXHR) {
            //data = data.replace(/\\x/g,"\\u00");
            try {
                // Проверяем, вернулось ли много объектов. Если это произошло, то это список ошибок. Нормальный ответ не должен содержать несколько отдельных объектов
                var str = data.replace("}{", "}\n{");
                var items = str.split("\n");
                var msg = "";
                if (items.length > 1) {
                    for (var i = 0; i < items.length; i++) {
                        var obj = JSON.parse(items[i]);
                        if (obj.msg && obj.error) msg += obj.msg + "<br/>";
                    }
                    if (msg != "") {
                        iasufr.alert(msg);
                        return;
                    }
                }
                var d;
                if (items.length > 1) {
                    d = JSON.parse(items[0]);
                    console.log("[IASUFR] Error: received multiple objects in json:");
                    console.log(data);
                } else d = JSON.parse(data);

                //iasufr.decodeStrings(d);

                if (d.error) {
                    if (d.msg) iasufr.alert(d.msg);
                    if (d.redirectUrl) {
                        iasufr.removeCookies();
                        window.location=d.redirectUrl + "?from=" + window.location;
                    }
                    if (oldError) oldError(data, textStatus, jqXHR);
                    return;
                }
                if (d.msg) {
                    if (d.isMessage == 1) iasufr.message(d.msg); else iasufr.alert(d.msg);
                }
                if (d.changePass == 1) {
                    iasufr.loadForm("ChangePass", {login: JSON.parse(d.user).login});
                }
            } catch(e) {
                if (!options.script) {
                    console.log("[IASUFR] Error loading: " + options.url);
                    console.log(e.stack);
                }
            }
            if (oldSuccess) oldSuccess(data, d);
        }

        var oldError = options.error;
        options.error =   function (data, textStatus, jqXHR) {
            var msg = "";
            if (textStatus) msg += textStatus + ". ";
            if (jqXHR.message) msg += jqXHR.message;
            if (msg=="timeout") msg = "Немає з'єднання з сервером. Повторіть спробу пізніше.";
            if (msg=="error") msg = "Помилка вiдправки запиту до сервера.";
            dhtmlx.message({title: 'Помилка', text: msg, type: 'alert-error'});

            if (oldError) oldError(data, textStatus, jqXHR);
        }

        // Добавляем время чтобы предотвратить кеширование запроса
        var etc = "etc=" + new Date().getTime().toString();
        if (options.url.indexOf("?") == -1) options.url += "?" + etc; else options.url += "&" + etc;

        $.extend(options, {
            type: "POST",
            dataType: "text"
        });
        $.ajax(options);
    },

    checkLogin: function() {
        iasufr.ajax({
            url: "ac.CheckLogin.cls",
            data: {action: "check", url: window.location.pathname},
            success: function (d) {
                try {
                    var data = JSON.parse(d);
                    if (data.error) {
                        if (data.redirectUrl) {
                            iasufr.removeCookies();
                            window.location=data.redirectUrl + "?from=" + window.location;
                            return;
                        } else iasufr.alert(d.msg);
                    } else {
                        if (data.user) iasufr.user = JSON.parse(data.user);
                        iasufr.internalInit();
                        if (iasufr.ready) iasufr.ready();
                        if (iasufr.user .message) iasufr.alert(iasufr.user.message);
                    }
                } catch(e) {
                    console.log("[IASUFR] error during check login");
                    console.log(e.stack);
                }
            },
            error: function (data, textStatus, jqXHR) {
                ///dhtmlx.alert("Помилка пiд час перевiрки логiну");
                if (textStatus != "timeout") window.location=iasufr.const.LOGIN_PAGE;
            }
        });
    },

    removeCookies: function() {
        $.removeCookie('lid');
        $.removeCookie('pid');
    },

    logout: function() {
        iasufr.ajax({
            url: "ac.CheckLogin.cls",
            data: {action: "logout"},
            success: function () {
                iasufr.removeCookies();
                window.location=iasufr.const.LOGIN_PAGE;
            },
            error: function () {
                iasufr.removeCookies();
                window.location=iasufr.const.LOGIN_PAGE;
            }
        });
    },

    getParam: function (sname)
    {
        var params = location.search.substr(location.search.indexOf("?")+1);
        var sval = "";
        params = params.split("&");
        for (var i=0; i<params.length; i++)
        {
            var temp = params[i].split("=");
            if ( [temp[0]] == sname ) { sval = temp[1]; }
        }
        return sval;
    },

    gridRowFocus: function(grid, id) {
        grid.focusRowId = id;
        grid.focusRowNum = grid.getRowIndex(grid.getSelectedId());
    },

    gridRowFocusApply: function(grid) {
        if (grid.focusRowId) grid.setSelectedRow(grid.focusRowId);
        else if (grid.focusRowNum != -1) grid.setSelectedRow(grid.getRowId(grid.focusRowNum)); else grid.setSelectedRow(grid.getRowId(0));
        grid.focusRowId = undefined;
        grid.focusRowNum = -1;
    },

    enableRowselectMode: function(grid) {
        //grid.setStyle("", "", "", "border: 1px solid #eee; border-top: none; border-left: none; background-color: #FADA8A; padding-left: 4px;");
        grid.setStyle("", "", "", "background-image: url(/images/sky_blue_sel.png)");
    },

    ////////////////////////////////////////////// Работа со справочниками, загрузка и т.п. ///////////////////////////////////////
    getSpravDefenition: function(sprav, perm, success, error) {
        if (iasufr.sprav[sprav]) {
            if (success) success(iasufr.sprav[sprav], iasufr.sprav[sprav].perm);
            return;
        }
        iasufr.ajax({url:"base.Page.cls", data: {func: "GetSpravDefinition", sprav: sprav, perm: perm ? perm: "" },
            error: error,
            success: function (data, o) {
                try {
                    if (o.json.opt) {
                        iasufr.sprav[sprav] = o.json.opt;
                        iasufr.sprav[sprav].perm = o.json.perm;
                        iasufr.user.funcs = $.extend(iasufr.user.funcs, o.json.perm);
                        if (success) success(o.json.opt, o.json.perm);
                    }
                    else {
                        iasufr.alert("Не знайден довiдник з назвою " + sprav);
                        return;
                    }
                } catch (e) {
                    console.log("[IASUFR] error during load sprav definition for " + sprav);
                    console.log(e.stack);
                }
            }
        });
    },

    loadForm: function(sprav, args) {
        var sc;
        var fn;
        var ar = args;
        if (!ar.sprav) ar.sprav = sprav;
        if (!ar) ar = {};

        iasufr.getSpravDefenition(sprav, ar.perm, readSpravDef, ar.onError);

        function readSpravDef(o, perm) {
            sc = o.script;
            fn = o.func;
            ar = $.extend({}, o.args, ar);
            if (perm) ar.perm = perm;
            if ($.isArray(sc)) iasufr.loadScripts(sc, exec, args.onError); else iasufr.loadScript(sc, exec, ar.onError);
        }

        function exec() {
            var p = fn.split(".");
            //func is XXX.YYYYY.ZZZZZZ
            var executed = false;
            if (window[p[0]]) if (window[p[0]][p[1]]) if (window[p[0]][p[1]][p[2]]) {
                new window[p[0]][p[1]][p[2]](ar);
                executed = true;
            }
            if (ar) if (ar.onAfterLoad) ar.onAfterLoad();
            if (!executed) iasufr.alert("Не знайдена функцiя " + fn + " у довiднику " + sprav);
        }
    },

    // Инициализировать функцию конструктор справочника
    initForm: function(_this, opt) {
        if (!opt) opt = {};
        _this.opt = opt;
        _this.owner = iasufr.checkOwner(opt.owner, opt);
        _this.onSave = opt.onSave;
        _this.onClose = opt.onClose;
        _this.onSelect = opt.onSelect;

        if (opt.title && !opt.modal) iasufr.setTitle(_this, opt.title);
        if (opt.onShow) opt.onShow();
        return _this;
    },

    loadStyle: function (cssUrl) {
        if ($('head link[href="'+cssUrl+'"]').size() >= 1) return;
        $('<link>')
            .appendTo($('head'))
            .attr({type : 'text/css', rel : 'stylesheet'})
            .attr('href', cssUrl);
    },

    loadScripts: function (scriptsArray, onSuccess, onError) {
        var i = 0;
        function loadOne() {
            if (i >= scriptsArray.length) {
                if (onSuccess) onSuccess();
                return;
            }
            iasufr.loadScript(scriptsArray[i], function() {i++; loadOne()}, onError);
        }
        loadOne();
    },

    loadScript: function (scriptUrl, onSuccess, onError) {
        if (iasufr.loadedScripts.indexOf(scriptUrl) == -1) {
            iasufr.ajax({ url: scriptUrl, script: true, error: onError, success: function(script) {
                try {
                    window.eval(script);
                    iasufr.loadedScripts.push(scriptUrl);
                    if (onSuccess) onSuccess();
                } catch (e) {
                    console.log("[IASUFR] Error loading script: " + scriptUrl);
                    console.log(e.stack);
                }
            }});
        } else {
            if (onSuccess) onSuccess();
        }
    },

    close: function (t) {
        if (t.owner) {
            if (t.owner.askForClose) {
                doAskForClose(t.owner);
                return;
            }
            if (t.owner.close) t.owner.close(); else {
                iasufr.mainCell.detachObject();
                iasufr.mainCell.detachToolbar();
                iasufr.mainCell.detachStatusBar();
                //window.location="/index.html";
            }
        }
        if (t) t.isClosed = true;
    },

    // Позволяет инициировать закачку любых данных из javascript, без обращения к серверу
    //downloadData: function(filename, data) {
    //    var download = document.createElement('a');
    //    download.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(data));
    //     $(download).attr("download", filename);
    //    download.setAttribute('download', filename);
    //    download.click();
    //    $(download).remove();
    //},
    downloadData: function(filename, data, type) {
        var download = document.createElement('a');
        if (type) {
            download.setAttribute('href', 'data:attachment/csv,' + data);
            console.log("csv");
        } else {
            download.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(data));
        }
        $(download).attr("download", filename);
        download.setAttribute('download', filename);
        download.click();
        $(download).remove();
    },

    ///////////////////////////////////////////////////////////
    removeEmptyFields: function (obj) {
        for(var k in obj) if(!obj[k]) delete obj[k];
    },

    /*decodeStrings: function (obj) {
        for (var p in obj) {
            if (typeof(obj[p]) === "string"){
                //obj[p] = obj[p].replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                obj[p] = obj[p].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            }
            if (typeof(obj[p]) === "object") iasufr.decodeStrings(obj[p]);
        }
    },*/

    // преобразует объект дата в строку вида "20140201"
    formatDate: function(d) {
        var dd = d.getDate();
        var mm = d.getMonth()+1;
        var yyyy = d.getFullYear();
        if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} return dd+"."+mm+"."+yyyy;
    },

    // преобразует строку вида "01.02.2014" в строку "20140201"
    formatDateStr: function(str) {
        if (!str || str == "") return "";
        var d = str.split(".");
        if (d.length >= 3) return d[2]+d[1]+d[0]; else return "";
    },

    // преобразует строку вида "20140201" в объект дата
    dateFromStr: function(str) {
        if (!str || str == "") return undefined;
        var d = new Date(str.substring(0,4),parseInt(str.substring(4,6))-1, str.substring(6,8));
        if (!isNaN(d.valueOf())) return d; else return undefined;
        //if (d.length >= 3) return  else return undefined;
    },

    escapeRegExp: function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },

    replaceAll: function(str, find, replace) {
        return str.replace(new RegExp(iasufr.escapeRegExp(find), 'g'), replace);
    },

    setFromReadonly: function(form) {
        var lst = form.getItemsList();
        for (var i = 0; i < lst.length; i++) form.setReadonly(lst[i], true);
    },

    isInteger: function(x) {
        return Math.ceil(x) == Math.floor(x);
    },

    pGrp: function(group) {
        return iasufr.user.groups.indexOf(group) != -1;
    },

    pFunc: function(func) {
        if (iasufr.user.funcs[func] == undefined) {
            iasufr.logError(null, "Запрос функции которая не загружена: " + func);
            return false;
        }
        return iasufr.user.funcs[func];
    },

    enableAskBeforClose: function(t) {
        t.owner.askForClose = true;
    },

    disableAskBeforClose: function(t) {
        t.owner.askForClose = false;
    },

    storeSet: function(paramName, obj) {
        var iasu;
        if (!localStorage.iasu) iasu = {}; else iasu = JSON.parse(localStorage.iasu);
        iasu[paramName] = obj;
        localStorage.iasu = JSON.stringify(iasu);
    },

    storeGet: function(paramName, obj) {
        var iasu;
        if (!localStorage.iasu) iasu = {}; else iasu = JSON.parse(localStorage.iasu);
        return iasu[paramName];
    },

    enableGridColumnWidthStore: function(grid, key) {
        var widths = iasufr.storeGet("grid_widths_" + key);
        if (widths) {
            for (var w = 0; w < grid.getColumnsNum(); w++) if (widths[w]) grid.setColWidth(w, widths[w]);
        }

        grid.attachEvent("onResizeEnd", function() {
            var wi = [];
            for (var i = 0; i < grid.getColumnCount(); i++) wi.push(grid.getColWidth(i));
            iasufr.storeSet("grid_widths_" + key, wi);
        });
    },

    attachButton: function (input, onClick, ignoreReadonly) {
        var $inp = $(input);
        if ($inp.attr("readonly") == "readonly" && ignoreReadonly !== true) return;
        var $img = $("<div class='img-sprav-sel'></div>")
            .css("margin-left", ($inp.width()-18) + "px")
            .css("cursor", "pointer")
            .bind("click", onClick);
        if ($inp.parent().hasClass("dhx_toolbar_btn")) {
            $img.css("margin-left", ($inp.width()-16) + "px").css("margin-top", "0px");
        }
        if ($inp.parent().parent().parent().hasClass("dhx_toolbar_base_18_dhx_skyblue")) {
            $img.css("margin-left", ($inp.width()-21) + "px").css("margin-top", "-6px");
        }
        $inp.after($img);
        $inp.data("btn", $img);
    },

    updateSelectorParam: function(input, params) {
        var $inp = $(input);
        var $img =  $inp.data("btn");
        if ($img) {
            $img.data("extended-params", params);
        }
    },
    
    attachSelector: function (input, form, params) {
        iasufr.getSpravDefenition(form, undefined, doAttach);
        /*if (!iasufr.sprav[form]) {
            iasufr.ajax({url:"base.Page.cls", data: {func: "GetSpravDefinition", sprav: form },
                success: function (data, o) {
                    try {
                        if (o.json.opt) {
                            iasufr.sprav[form] = o.json.opt;
                            doAttach(iasufr.sprav[form]);
                        }
                        else {
                            iasufr.alert("Не знайден довiдник з назвою " + sprav);
                            return;
                        }
                    } catch (e) {
                        console.log("[IASUFR] error during load sprav definition for " + sprav);
                        console.log(e.stack);
                    }
                }
            });
        } else doAttach(iasufr.sprav[form]);*/

        function doAttach(opt, perm) {
            var pars = $.extend({}, opt.args, params, {select: true});
            var $txt = $(input);
            pars.onSelect = function(o) {
                if (params.onSelect) params.onSelect(o, $txt);
            };
            iasufr.attachButton(input, function () { 
                var $inp = $(input);
                var $img =  $inp.data("btn");
                var pp = pars;
                if ($img) {
                        if ($img.data("extended-params")) pp = $.extend(pp, $img.data("extended-params"));
                }                
                iasufr.loadForm(form, pp);
            }, params.ignoreReadonly);
            $txt.click(function(){$txt.select()});
            $txt.keyup(function() { if ($txt.val() == "") if (params.onSelect) params.onSelect(null, $txt)});
            if (pars.searchUrl) {
                $txt.keydown(function (e) {if (e.keyCode == 13) {
                    var searchStr = $txt.val().trim();
                    if (searchStr == "") return;
                    iasufr.ajax({
                        url: pars.searchUrl.replace("%txt%", searchStr),
                        success: function (d) {
                            if (d && params.onSelect) {
                                $txt.blur();
                                try {
                                    var data = JSON.parse(d);
                                    if (data) params.onSelect(data, $txt);
                                } catch (e) { }
                            }
                        }
                    });
                }});
            }

            if (pars.findOnInit == true) {
                var e = jQuery.Event("keydown");
                e.keyCode = 13;
                $txt.trigger(e);
            }
        }
    },

    print: function(htmlText) {
        var data = encodeURI(htmlText);
        var wnd = window.open("/print.html#"+data, "_blank");
    },

    /**
     * Print pdfs
     * @param {Array.<object>|String} pdfs Array of pdfs to print or html string to print
     */
    printPdf: function(pdfs) {
        if (!(pdfs instanceof Array)) pdfs = [{content: pdfs}];
        for (var i = 0; i < pdfs.length; i++) {
            if (!pdfs[i].orientation) pdfs[i].orientation = "portrait";
            if (!pdfs[i].margins) pdfs[i].margins = "25 15 15 15";
            if (!pdfs[i].colonFirst) pdfs[i].colonFirst = "";
            if (!pdfs[i].colonOther) pdfs[i].colonOther = "";
        }
        iasufr.ajax({
            url: "base.Print.cls", data: {
                func: "Print",
                pdfs: JSON.stringify(pdfs)
            },
            success: function (d, res) {
                console.log("pdf generation time: " + res.json.time);
                window.open("/base.Page.cls?&func=View&class=base.Print&iasu=1&pdfdownload=1&file=" + res.json.file);
            }
        });
    },

    //printDiploms: function(pdfs, image1, image2) {
    //    if (!(pdfs instanceof Array)) pdfs = [{content: pdfs}];
    //    for (var i = 0; i < pdfs.length; i++) {
    //        if (!pdfs[i].orientation) pdfs[i].orientation = "portrait";
    //        if (!pdfs[i].margins) pdfs[i].margins = "0 0 0 0";
    //        if (!pdfs[i].pageWidth) pdfs[i].pageWidth = 250;
    //        if (!pdfs[i].pageHeight) pdfs[i].pageHeight = 195;
    //    }
    //    iasufr.ajax({
    //        url: "base.Print.cls", data: {
    //            func: "PrintDiploms",
    //            pdfs: JSON.stringify(pdfs),
    //            image1: image1,
    //            image2: image2
    //        },
    //        success: function (d, res) {
    //            console.log("pdf generation time: " + res.json.time);
    //            window.open("/base.Page.cls?&func=View&class=base.Print&iasu=1&pdfdownload=1&file=" + res.json.file);
    //        }
    //    });
    //},

    //printDiploms: function(htmls, image1, image2, width, height) {
    //    width = width || 250;
    //    height = height || 195;
    //    var img1 = "<div style='z-index: 0; position: absolute; left: 0mm; top: 0mm; width: " + width + "mm; height: " + height + "mm; background-size: contain; background: url(" + image1 +") no-repeat;'>";
    //    var img2 = "<div style='z-index: 0; position: absolute; left: 0mm; top: " + (height-1) + "mm; width: " + width + "mm; height: " + height + "mm; background-size: contain; background: url(" + image2 +") no-repeat;'>";
    //    var pageBreak = "<div style='page-break-after:always'></div>";
    //
    //    var pdfs = [];
    //    for (var i = 0; i < htmls.length; i++) {
    //        pdfs.push({ margins: '0 0 0 0', pageWidth: width, pageHeight: height, content: img1 + "<div style='z-index: 100;width: " + width + "mm'>" + htmls[i] + "</div>" + img2});
    //    }
    //    iasufr.printPdf(pdfs);
    //},

    printDiploms: function(htmls, image1, image2, width, height) {
        width = width || 250;
        height = height || 195;
        var img1 = "<div style='page-break-after:always; z-index: 0; width: " + width + "mm; height: " + (height-1).toString() + "mm; background-size: contain; background: url(" + image1 +") no-repeat;'>";
        var html = "";
        var pdfs = [];
        for (var i = 0; i < htmls.length; i++) {
            html += img1 + htmls[i] + "</div>";

        }
        pdfs.push({ margins: '0 0 0 0', pageWidth: width, pageHeight: height, content: html});
        iasufr.printPdf(pdfs);
    },

    getCurrentSprav: function() {
        var cur = "";
        var win = iasufr.wins.getTopmostWindow();
        if (!win) {
            cur = window.location.search.replace("?form=", "");
        } else cur = win.spravName;
        return cur;
    },

    ru2en: {
        ru_str: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюяІіЇїЄє",
        en_str: ['A', 'B', 'V', 'G', 'D', 'E', 'JO', 'Zh', 'Z', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T',
            'U', 'F', 'H', 'C', 'Ch', 'Sh', 'Shh', '', 'I', '', 'Je', 'Ju',
            'Ja', 'a', 'b', 'v', 'g', 'd', 'e', 'jo', 'zh', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f',
            'h', 'c', 'ch', 'sh', 'shh', '', 'i', '', 'je', 'ju', 'ja', 'I', 'i', 'I', 'i', 'E', 'e'],
        translit: function(org_str) {
            var tmp_str = "";
            for (var i = 0, l = org_str.length; i < l; i++) {
                var s = org_str.charAt(i), n = this.ru_str.indexOf(s);
                if (n >= 0) { tmp_str += this.en_str[n]; }
                else { tmp_str += s; }
            }
            return tmp_str;
        }
    },

    downloadDbf: function(filename, dataArray, meta) {
        function _arrayBufferToBase64( buffer ) {
            var binary = '';
            var bytes = new Uint8Array( buffer );
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode( bytes[ i ] );
            }
            return window.btoa( binary );
        }
        var buf = dbf.structure(dataArray, meta);
        var blob;
        try {
            blob = new Blob([buf], {type: "application/octetstream"});
        }catch (e) {
            window.BlobBuilder = window.BlobBuilder ||
            window.WebKitBlobBuilder ||
            window.MozBlobBuilder ||
            window.MSBlobBuilder;

            if (e.name == 'TypeError' && window.BlobBuilder) {
                var bb = new BlobBuilder();
                bb.append(data);
                blob = bb.getBlob("application/octetstream");
            }
            else if (e.name == "InvalidStateError") {
                // InvalidStateError (tested on FF13 WinXP)
                blob = new Blob([data], {type: "application/octetstream"});
            }
            else {
                // We're screwed, blob constructor unsupported entirely
                blob = null;
                console.error("Error creating blob for download");
            }
        }
        if (blob) saveAs(blob, filename);
    }
};

function doAskForClose(wnd) {
    iasufr.confirm("Закрити вiкно? Данi не будут збереженi!", function() {
        wnd.askForClose = false;
        wnd.close();
    });
}

$(document).ready(function () {
    //dhtmlx.message.defPosition="bottom";
    dhtmlx.image_path = iasufr.const.IMG_PATH;

    iasufr.wins = new dhtmlXWindows();
    iasufr.wins.enableAutoViewport(true);
    iasufr.wins.setImagePath(iasufr.const.IMG_PATH);
    window.onpopstate = function(a) {
        if (!a.state) return;
        if (a.state.sprav) {
            iasufr.mainCell.detachObject();
            iasufr.mainCell.detachToolbar();
            iasufr.mainCell.detachStatusBar();
            if (a.state.sprav != "") {
                iasufr.mainCell.progressOn();
                iasufr.loadForm(a.state.sprav, {owner: iasufr.mainCell, onError: function() {iasufr.mainCell.progressOff()}, onAfterLoad: function() {iasufr.mainCell.progressOff()}});
            }
        }
    }
    // history.pushState({sprav:""}, "", "aaa");
    if (window.location.pathname != iasufr.const.LOGIN_PAGE) iasufr.checkLogin(); else {
        if (iasufr.ready) iasufr.ready();
    }
});
