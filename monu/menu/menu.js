
    function CreateMenu(owner, onAfterLoad){
        iasufr.ajax({
            url: "ac.Menu.cls",
            data: {func: "InitMenu"},
            success: function (e) {
                try {
                    var retAjax = JSON.parse(e);
                    var menu = owner.attachMenu(retAjax.json.data);
                    iasufr.menu = menu;

                    // добавляем имя пользователя с иконкой
                    var orgTxt = iasufr.user.orgName;
                    if (iasufr.user.orgCode) orgTxt = "(" + iasufr.user.orgCode + ") " + orgTxt;
                    //<img src='/images/icons/16/user_silhouette.png' style='vertical-align: middle'>
                    menu.setTopText("<span onclick='GoToEditCurrentOrg()' style='cursor:pointer;color:#4c4c4c;font-style: italic'>"+ orgTxt + " </span><span onclick='GoToEditCurrentUser()' style='cursor: pointer;padding-right:100px'>&nbsp;<b><u>" + iasufr.user.login + "</u></b></span>");
                    menu.setIconsPath(iasufr.const.ICO_PATH);
                    menu.attachEvent("onClick", function (id, a, keys, button){
                        if (retAjax.json.url[id]) {
                            if (retAjax.json.url[id].j!="") eval(retAjax.json.url[id].j);//javaFun
                            else {
                                    if (retAjax.json.url[id].n==1) window.open(retAjax.json.url[id].u);//isNewWind
                                    else {
                                        if (retAjax.json.url[id].u.indexOf(".") != -1 || retAjax.json.url[id].u.indexOf("/") != -1) { self.location=retAjax.json.url[id].u;}
                                        else {
                                            if (keys) if (keys.shift || keys.ctrl) {
                                                if (keys.shift) {
                                                    iasufr.loadForm(retAjax.json.url[id].u);
                                                } else {
                                                    window.open("/index.html?form=" + retAjax.json.url[id].u);
                                                }
                                            } else
                                            {
                                                if (button == 1){
                                                    var w = window.open("/index.html?form=" + retAjax.json.url[id].u, "_blank");
                                                    //setTimeout(w.focus, 100);
                                                    return;
                                                }
                                                iasufr.mainCell.detachObject();
                                                iasufr.mainCell.detachToolbar();
                                                iasufr.mainCell.detachStatusBar();
                                                iasufr.mainCell.progressOn();
                                                iasufr.loadForm(retAjax.json.url[id].u, {owner: iasufr.mainCell, onError: function() {iasufr.mainCell.progressOff()}, onAfterLoad: function() {
                                                    iasufr.mainCell.progressOff();
                                                    history.pushState({sprav:retAjax.json.url[id].u}, "", "?form="+retAjax.json.url[id].u);
                                                }});
                                            }
                                        }

                                    }
                            }
                        }
                    });
                    if (onAfterLoad) onAfterLoad();
                } catch (e) {
                    console.log("[IASUFR] Error in menu");
                    console.log(e.stack);
                }
            }
        });
    }

    function GoToEditCurrentUser() {
        iasufr.loadForm("UserAdd", {Login: iasufr.user.login});
    }

    function GoToEditCurrentOrg() {
        iasufr.loadForm("OrgEdit", { json: {idOrg: iasufr.user.orgId}, width:1100, onSave: function(o, t) {iasufr.close(t)} });
    }