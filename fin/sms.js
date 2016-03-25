// смс - рассылки  ^ReqSMS(idOrg)

if (!window.Fin) Fin = {};
if (!Fin.ReqSms) Fin.ReqSms = {};

Fin.ReqSms.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idOrg="";   var orgName="";
    if (t.opt.idOrg)  { idOrg=t.opt.idOrg; orgName=t.opt.orgName;  t.owner.setModal(true); }
    var listDog=""; if (t.opt.listDog) listDog=t.opt.listDog;
    var listOrg=""; if (t.opt.listOrg)  listOrg=t.opt.listOrg;
    var user=iasufr.user;
    var idOrgUser=user.orgId;
    dhtmlx.image_path = iasufr.const.IMG_PATH;

    var main = new dhtmlXLayoutObject(t.owner, '2U');
    main.cells("a").setWidth('260');
    main.cells("a").hideHeader();
    //main.cells('b').setText("");
    var mainB=main.cells('b');

    var pSelTable=0;
    var pHeader=0;
    var regim="";
    if ( t.opt.listDog )  regim="Iз договорiв/ ";
    if ( t.opt.listOrg )  regim="Iз довiдника органiзацiй/ ";
    var cntOrg=regim + " Усього строк: ";
    var cntOrgTel="Для смс-повiдомлень: ";
    var cntKomu="Кому вiдправлено";
    var cntSumT="";  //"&nbsp;&nbsp;&nbsp;на суму:&nbsp;&nbsp;&nbsp;";
    var cntSumTO=""; //"&nbsp;&nbsp;&nbsp;сплачено: ";
    var form;
    var toolbar;
    var cellNumDog;
    var gD;
    var pKomu=0;

    var selOrg=null;  selOrg = {};
    var selSMS=null;  selSMS = {};
    var selUser=null; selUser= {}; selUser.id=0;
    if (idOrg>0) selOrg.id=idOrg;
    var SumI={};

    var dost=1; //iasufr.pFunc("dogAdd");
    var admin=iasufr.pGrp(1);
    //----------------------------------------
    if (idOrg=="") {
    selOrg.id=user.orgId;
    orgName=user.orgName;
    selOrg.name=user.orgName;
    var code=user.orgCode;
    if (code) orgName="("+code+")" + orgName;
                   }

    ToolB();
    InitTable();


    function ToolB() {
        toolbar = main.attachToolbar();
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);

        toolbar.addButton("komu", 3, cntKomu , "32/edit_group.png", "");
        toolbar.addButton("sms", 1, "Вiдправити", "32/webmail.png", "");

        toolbar.setItemToolTip("komu", "Подивитися список користувачiв, яким було вiдправлено вибраний текст повiдомлення");
        toolbar.addButton("print", 2, "Друк", "32/printer_empty.png", "");
        // toolbar.addButton("edit", 3, "Редагувати договiр", "32/toolbar_edit.png", "");
        toolbar.addButton("rel", 5, "Оновити", "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 6, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function(id){
            switch (id) {
                case "print": gD.printView(); break;
                case "rel":
                             $(form.getInput("User")).blur();
                             $(form.getInput("Text")).blur();
                              pKomu=0; //if (selUser.id>0) pKomu=1;
                              SelTable();
                break;
                case "close":   iasufr.close(t); break;
                case "sms":
                    if (form.getItemValue('Text')=="") { iasufr.message("Перевiрте текст повiдомлення !"); return }
                    var cnt=gD.getCheckedRows(1);
                    if ( cnt=="" ) { iasufr.message("Вкажiть строки з користувачами для вiдправлення повiдомлення !"); return }
                    var len=cnt.split(",");

                    var cntRow = gD.getRowsNum(); var koli=0; var zn;
                    for (var i = 0; i < cntRow; i++)  {
                        zn=gD.cells2(i,4).getValue();
                        if ( (gD.cells2(i,1).getValue()==1) && (zn.indexOf('-')==-1) )  koli=koli+1;
                    }

                    var txt=form.getItemValue('Text');
                    pKomu=0;                                      // len.length
                    iasufr.confirm('Пiдтвердiть вiдправлення для  ' + koli +' користувачiв: '+txt, Send);
                break;
                case "komu":
                    $(form.getInput("User")).blur();
                    $(form.getInput("Text")).blur();
                    var idUser=0; if (selUser) idUser=selUser.id;
                    var idSMS=0; if (selSMS) idSMS=selSMS.id;
                    if (idSMS==0) { iasufr.message("Виберiть текст повiдомлення iз довiдника!"); return }
                    pKomu=1;
                    SelTable();
                break;
            }
        });

    }   //------------------------ ToolB()

    function Txt(obj) { form.setItemValue('Text',obj[2]); selSMS.id=obj[0]; }

    function Send() { mainB.progressOn();
        var cnt = gD.getRowsNum(); var list="";
        for (var i = 0; i < cnt; i++)  { if ( (gD.cells2(i,1).getValue()==1) && (gD.cells2(i,4).getValue()!="---") )  list+= gD.cells2(i,0).getValue() + '^' + gD.cells2(i,4).getValue() +',';  }
        var idSMS=0; if (selSMS) idSMS=selSMS.id;
        var json={idOrg:selOrg.id, list:list, text:form.getItemValue('Text'), idSMS:idSMS};

        iasufr.ajax({
            url:'fin.Sms.cls',
            data:{func:'SmsSend', json: JSON.stringify(json) },
            success: function (data) {
                var d = JSON.parse(data);
                selSMS.id = d.Id;

                mainB.progressOff();
                iasufr.messageSuccess("Вiдправлено !");
                pKomu=1;
                SelTable();
            }
        });
    }

    function InitTable() {
        gD=main.cells('b').attachGrid();
        gD.setImagePath(iasufr.const.IMG_PATH);
        //            0  1                  2             3                   4         5
        gD.setHeader(",#master_checkbox,Логiн корист..,П I Б користувача., Моб.телефон,Органiзацiя,Дата_час,Текст");
        gD.setInitWidths("10,40,70,180,120,350,120,300");
        gD.setColAlign("center,center,center,left,center,left,center,left");
        gD.setColTypes("ro,ch,ro,ro,ed,ro,ro,ro");
        gD.setColSorting("str,ch,str,str,str,str,str,str");
        //                0   1     2    3    4    5
        gD.setColumnIds("sKOD,sOTM,sLOG,sFIO,sTEL,sORG,sDAT,sTXT");
        gD.init();
        gD.setColumnHidden(gD.getColIndexById('sKOD'),true);
        if (pKomu!=1) { gD.setColumnHidden(gD.getColIndexById('sDAT'),true); gD.setColumnHidden(gD.getColIndexById('sTXT'),true); }
        //gD.enableTooltips("false,false,true");
        //gD.sortRows(2,"str","asc");
        gD.sortRows(4);
        gD.setColSorting("int,ch,str,str,str,str,str,str")
        cellNumDog=gD.getColIndexById("sKOD");
        //gD.splitAt(4);
        gD.enableHeaderMenu("false,false,true,true,true,true,true,true");

        //gD.enableAutoHiddenColumnsSaving("gD");
        //gD.loadHiddenColumnsFromCookie("gD");
        gD.enableAutoSizeSaving("gD");
        gD.enableAutoSaving();
        gD.loadSizeFromCookie("gD");

        //gD.setColumnHidden(gD.getColIndexById('sTXT'),false);
        gD.attachEvent("onFilterEnd", function(elements){
             var cnt = gD.getRowsNum(); var i; var cntTel=0;
                for (i = 0; i < cnt; i++)  { if (gD.cells2(i,4).getValue()!="---")  cntTel++; }
                mainB.setText(cntOrg+gD.getRowsNum()+ " / "+cntOrgTel + cntTel);
            return true
        });

        gD.attachEvent("onCheck", function(rId,cInd,state) {
            //var ind=gD.getRowId(gD.getRowIndex(gD.getSelectedId()));
            var ch=gD.cells(rId,1).getValue();
            var tel=gD.cells(rId,4).getValue();
            if (tel=='---') gD.cells(rId,1).setValue(0);
        });

        /*
        gD.attachEvent("onHeaderClick", function(ind,obj){
            if (ind!=1) return true
            var list=gD.getCheckedRows(1);
            if (list!="")  gD.setCheckedRows(1,0);
            else  { var cnt = gD.getRowsNum(); var i;
                    for (i = 0; i < cnt; i++)  { if (gD.cells2(i,4).getValue()!="---")  gD.cells2(i,1).setValue(1); }
                  }

            //gD.setCheckedRows(1,0)
            gD.sortRows(4);
            return true
        });
        */
    }  // InitTable()

    // ------------------------------------------------------- фильтр слева
    var json={idOrg:selOrg.id};

    iasufr.ajax({
        url:'fin.Sms.cls',
        data:{func:'SmsFilter', json: JSON.stringify(json) },
        success: function (data) {
            var obj=JSON.parse(data);
            var jso=obj.form;
            form = main.cells("a").attachForm(jso);
            form.setItemValue('idOrg',orgName);
            form.setNote("idOrg", { text: "органiзацiя, що вiдправляє повiдомлення", width:250 });
            form.setItemFocus('Text');

            form.attachEvent("onChange", function(name, value, is_checked) {
                if (name=="Text") selSMS.id=0;
                if ((name=="User") && (value=="")) selUser.id=0;
                return true;

            });

            var pDog=1; if (iasufr.pGrp(1)) pDog=0;  //pDog=1 - показать тодько огранич.список организаций для выбора
            iasufr.attachSelector(form.getInput("idOrg"), "OrgSelector",  { pDog:pDog,  onSelect: OrgSelect});
            iasufr.attachSelector(form.getInput("Text1"), "SMS",  { select:true,  onSelect: Txt});
            iasufr.attachSelector(form.getInput("User1"), "UserSelector",  { ignoreReadonly:true, multiSelect:true, onSelect: UserSelect});
            if ( (listDog!="")||(listOrg!='') ) SelTable();
            mainB.setText(' ');
        }
    });

    function UserSelect(o, $txt)  {
        selUser=null; selUser= {};
        var list=""; var ListFio="";
        for (var r = 0; r < o.length; r++) {
            list=list + o[r].id + ",";
            ListFio=ListFio + o[r].fio;
            if (r<(o.length-1))  ListFio=ListFio + ", ";
        }
        selUser.id=list;
        //selUser = o;
        form.setItemValue('User',ListFio);
        //selSMS.id=obj[0];
        //if ( o )  $txt.val(o.fio); //+'/' + o.orgName);
    }

    //----------------------------------------------------------
    function OrgSelect(o, $txt)   { selOrg = o;
                                    if ( o ) { orgName="(" + o.code + ") " + o.name;
                                                            $txt.val(orgName);
                                        //if  ( (dost) && (!admin)  && (selOrg.id != idOrgUser) )   toolbar.disableItem("new");
                                        //else  toolbar.enableItem("new");
                                     //   form.setItemValue("Grp",""); selGrp=null;  selGrp = {};
                                     //   iasufr.updateSelectorParam(form.getInput("Grp"), { idOrg:selOrg.id, orgName:orgName } );

                                    }
        SelTable();
    }

    // таблица в правой части - перечень договоров
    function SelTable() {
        if (pSelTable) return;
        pSelTable=1;
        gD.clearAll();
        mainB.progressOn();

        var idOrg="";  if (selOrg) idOrg=selOrg.id;
        form.forEachItem(function(id){
        });

        //var speak=0; if (form.isItemChecked('Speak')) speak=1;
        var idSMS=0; if (selSMS) idSMS=selSMS.id;
        var idUser=0; if (selUser) idUser=selUser.id;
        var json={idOrg:idOrg, selDog:listDog, selOrg:listOrg, komu:pKomu, idSMS:idSMS, idUser:idUser}; // form.getItemValue('Real')
        
        iasufr.ajax({
            url:'fin.Sms.cls',
            data:{func:'SmsSel', json: JSON.stringify(json) },
            success: function (data) {
                var p   = JSON.parse(data);
                var jso = p.table;
                gD.parse(jso,'json');
                //gD.sortRows(3,"str","asc");
                gD.sortRows(4);
                iasufr.gridRowFocusApply(gD);
                //--------------------------------------------
                if ((gD.getRowsNum() > 0) && (pHeader == 0)) {
                    gD.attachHeader(",,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
                    pHeader = 1;
                }
                if  (gD.getRowsNum() == 0) { gD.detachHeader(1);  pHeader = 0;   }
                gD.setSizes();
                //--------------------------------------------
                
                var cnt = gD.getRowsNum(); var i;
                if (pHeader==1) { for (i = 0; i < gD.getColumnsNum(); i++) $(gD.getFilterElement(i)).val("");  }
                var cntTel=0;
                if (cnt>0) { for (i = 0; i < cnt; i++) {
                                  //gD.cells2(i, 3).setValue("<a href='#'>"+gD.cells2(i, 3).getValue()+"</a>");
                                  //$(gD.cells2(i, 3).cell).click(onCellClick);
                                  if (gD.cells2(i, 4).getValue()!="---") cntTel++;

                }}
                mainB.progressOff();
                if (pKomu!=1)  { gD.setColumnHidden(gD.getColIndexById('sDAT'),true);
                                 gD.setColumnHidden(gD.getColIndexById('sTXT'),true);
                                 mainB.setText(cntOrg + gD.getRowsNum() + " / "+cntOrgTel + cntTel);
                }
                else { gD.setColumnHidden(gD.getColIndexById('sDAT'),false);
                       gD.setColumnHidden(gD.getColIndexById('sTXT'),false);
                       mainB.setText(cntKomu + ": " + gD.getRowsNum());
                }

            }
        });
        pSelTable=0;
    }  // SelTable()


    function onCellClick(e){
        window.setTimeout( function(){
            var ind=$(e.currentTarget).parent().index()-1;
            var idRow=gD.cells2(ind, cellNumDog).getValue();
        }, 1);
        pSelTable=0;
    }

    return t;
};

//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/Dog.js


