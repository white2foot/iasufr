if (!window.Fin) Fin = {};
if (!Fin.Org) Fin.Org = {};
// справочник организаций ^Org("P",idKP)
Fin.Org.Create = function (opt) {
    var ths = iasufr.initForm(this, opt);
    dhtmlx.image_path = iasufr.const.IMG_PATH;
    //alert(iasufr.pFunc("orgEdit")+'---'+iasufr.pFunc("orgEditPart"));
    var WID=1100; var HEI=$(document).height();
    var main = new dhtmlXLayoutObject(ths.owner, '2U');
    main.cells("a").setWidth('200');
    main.cells("a").hideHeader();
    main.cells('b').setText("Довiдник организацiй");
    var mainB=main.cells('b');
    
    var pSelTable=0;
    var gridOB;
    var Accord;
    var email='';
    ToolB();
    initAcc();

    //-------- панель с кнопками в левой запросной части
    function ToolB() {
        var toolbar = main.attachToolbar();
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("print", 1, "Друк", "32/printer_empty.png", "");
        if (iasufr.pFunc("orgAdd")) {
            toolbar.addButton("new", 3, "Додати органiзацiю", "32/toolbar_add.png", "");
            //addButtonSelect(id, pos, text, opts, imgEnabled, imgDisabled);

            var jrnList = [];
            //if (iasufr.pFunc("..."))
            jrnList.push(['doc1', 'obj', 'Журнал реєстрацiї висновків', '32/document_index.png']);
            jrnList.push(['sep']);
            jrnList.push(['doc2', 'obj', "Журнал надання дозволiв", '32/document_index.png']);
            jrnList.push(['sep']);
            jrnList.push(['doc3', 'obj', "Журнал облiку порушень", '32/document_index.png']);

            toolbar.addButtonSelect("doc", 5, "Журнали", jrnList, "32/document_index.png", "", "disabled", true);
            toolbar.addButton('doc4', '10', "Електронна пошта", "32/webmail.png", "");
        }

        toolbar.addButton("rel", 11, "Оновити", "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 12, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function(id){
            switch (id) {
                case "print": grOrg.printView(); break;
                case "new":   iasufr.loadForm("OrgEdit", {width:WID, height:HEI, json: {Date:0, idOrg:0}, onSave: SelTable});  break;
                case "doc1":  iasufr.loadForm("OrgDoc", {width:1200, height:600, json: {Date:0, idOrg:0} });  break;
                case "doc2":  iasufr.loadForm("PermOrgReports", {width:1200, height:600, json: {Date:0, idOrg:0} });  break;
                case "doc3":  iasufr.loadForm("DislocOrgReports", {width:1200, height:600, json: {Date:0, idOrg:0} });  break;
                case "doc4":
                    var cnt = grOrg.getRowsNum();
                    var cells=grOrg.getColumnsNum();
                    var cellsVal; email='';
                    //grOrg.getColumnId(3);
                    if (cnt>0) { for (var i = 0; i < cnt; i++) {
                        for (var is = 1; is < cells; is++) { cellsVal=grOrg.cells2(i,is).getValue(); if ((cellsVal.indexOf("@")) != -1)  email=email + cellsVal + '; '; }
                    }}
                    if (email=='') { iasufr.message('У таблицi вкажiть контактну iнформацiю - електр.пошта !');  break}
                    iasufr.loadForm("OrgEmail", { Email:email, height:500, width:700});  break;
                case "rel":   SelTable(1); break;
                case "close": iasufr.close(ths); break;
            }
        });
    }   //------------------------ ToolB()

    var cntOrg="Усього строк: ";
    var grOrg=main.cells('b').attachGrid();
    grOrg.setImagePath(iasufr.const.IMG_PATH);
    grOrg.enableTooltips("false,false,true,true,true,true");
    grOrg.attachEvent("onFilterEnd", function(elements){ mainB.setText(cntOrg+grOrg.getRowsNum());  });
    iasufr.enableRowselectMode(grOrg);
    grOrg.attachEvent("onResizeEnd", function(obj){ SaveCheck(2); });
    //grOrg.attachEvent("onRowSelect", function (id){ if (grOrg.getSelectedCellIndex()==0) KOR(id);  })

    // запросная часть слева
    var dt = iasufr.formatDate(new Date());
    /*
     var formData = [
     { type:"settings" , position:"label-left", labelWidth:130, inputWidth:180  },
     { type:"calendar", name:"Date", required: true, label: "На дату", dateFormat: '%d.%m.%Y', serverDateFormat: '%d/%m/%Y', inputWidth:80, calendarPosition: 'right', value:dt },
     { type:"input" ,   name:"idKP", label:"Органiзацiя" },
     { type:"radio" ,   name:"Level", label:"Пiдпорядк.безпосередньо", offsetTop:0, labelWidth:"auto", position: "label-right",  checked:true, value:"1"  },
     { type:"radio" ,   name:"Level", label:"Пiдпорядк.усього", offsetTop:0, labelWidth:"auto", position: "label-right",  checked:false, value:"2"  },
     { type:"input" ,   name:"Frm", label:"Фрагмент для пошуку"},
     //{ type:"combo" ,   name:"Tip", comboType: 'checkbox', label:"Тип органiз."},
     ];
     */
    var form;
    //var form = Accord.cells("a1").attachForm(formData);
    //form.getCombo('Tip').setOptionHeight(200);

    //form.attachEvent("onChange", function (id, value){ if (id=='idKP') SelTable(1);  });
    //$(form.getInput("idKP")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Frm")).focus()  });

    //$(form.getInput("Frm")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("idKP")).focus()  });

    // заполнить форму - справочники: типы организаций , области, типы контактов
    iasufr.ajax({
        url:'fin.Org.cls',
        data:{func:'OrgGetSpr'},
        success: function (data) {
            var jso=JSON.parse(data); // alert(data+'---'+jso);
            form = Accord.cells("a1").attachForm(jso);
            form.forEachItem(function(id){ if (id.indexOf('z')!=-1) form.hideItem(id); });
            form.setFontSize('11px');
            form.attachEvent("onChange", function (id, value){ if ((id=='idKP')||(id=='Frm')) SelTable(1);  });
            //$(form.getItemLabel("Req")).css("background-color","green");

            $(form.getInput("idKP")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("idKP")).blur()  });
            //$(form.getInput("Frm")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Bank")).focus()  });

            form.attachEvent("onChange", function(name, value, is_checked) {
                var t;
                if (name=="L1") t="zt";
                if (name=="L2") t="zo";
                if (name=="L3") t="zk";
                form.forEachItem(function(id){
                    if (is_checked) {if (id.indexOf(t)!=-1) form.showItem(id); }
                    else            {if (id.indexOf(t)!=-1) form.hideItem(id); }
                });
            });
            //myForm.setItemLabel(id, String(myForm.getItemText(id)).toLowerCase());
            //var dl=jso.tip.length;   for (var i = 0; i < dl; i++)  { jso.tip[i][1];  }
            //form.getCombo('Obl').addOption(jso.state);
            //form.getCombo('Tip').addOption(jso.tip);
            //form.getCombo('Cont').addOption(jso.cont);
            //form.setItemValue ('Date',jso.date);
            //var Ch={ type:"checkbox", name:"111", label:"555", position: 'label-right',labelWidth: 150, checked: false }
            //form.addItem(null, Ch, 10);
            SelTable(0);
        }
    });  // ajax



    // таблица в правой части - перечень организаций
    function SelTable(priz) {   if (pSelTable) return;  //
        mainB.setText("");
        pSelTable=1;
        grOrg.clearAll(true);
        mainB.progressOn();
        email='';
        //alert(JSON.stringify(form.getFormData()));
        var date=iasufr.formatDateStr(form.getCalendar("Date").getDate(true));
        var tip=""; var obl=""; var cont="";

        form.forEachItem(function(id){
            if (id.indexOf('zt')!=-1) { if ((form.isItemChecked(id)) && (form.getItemValue('L1')))  tip+=form.getItemValue(id)+',';  }
            if (id.indexOf('zo')!=-1) { if ((form.isItemChecked(id)) && (form.getItemValue('L2')))  obl+=form.getItemValue(id)+',';  }
            if (id.indexOf('zk')!=-1) { if ((form.isItemChecked(id)) && (form.getItemValue('L3')))  cont+=form.getItemValue(id)+',';  }
        });

        var json=$.extend({idKP:form.getItemValue('idKP')}, {Obl:""} );
        // form.getItemValue('Frm')
        //json=$.extend(json, {Frm:form.getItemValue('Frm'), Tip:form.getCombo('Tip').getChecked().toString()} );
        json=$.extend(json, {Frm:"", Tip:tip, Obl:obl, Cont:cont } );
        json=$.extend(json, {accountAdd: form.getItemValue('Bank'), ATO: form.getItemValue('ATO'), Real:form.getItemValue('Real')} );
        json=$.extend(json, {Level:form.getItemValue('Level'), Date:date} );
        json=$.extend(json, {Par:'org',pHelp:0, ReqOnly: form.getItemValue('Req'), Dog: form.getItemValue('Dog')} );  //Req - только заявки

        var json1=$.extend({accountAdd: form.getItemValue('Bank'), Cont: cont, pHelp:0}, {Par:'zag'} );
        var jsOrg={Date:date};

        iasufr.ajax({         // данные для заголовка таблицы
            url:'fin.Org.cls',
            data:{func:'OrgSelTable', json: JSON.stringify(json1)},
            success: function (data) { var t=JSON.parse(data);
                var hdr= t.hdr;
                var wid= t.wd;
                var typ= t.tp;
                var al= t.align;
                var src= t.src;
                var sort= t.sort;
               
                grOrg.setHeader(hdr);
                grOrg.attachHeader(src);
                grOrg.setInitWidths(wid);
                grOrg.setColAlign(al);
                grOrg.setColTypes(typ);
                grOrg.setColSorting(sort);
                grOrg.setColumnIds('1,2,3,4,5,6,7,8,9,10,11,12,13,14,15');
                grOrg.init();
                grOrg.setColumnHidden(0,true);


                iasufr.ajax({              // данные для строк таблицы
                    url:'fin.Org.cls',
                    data:{func:'OrgSelTable', json: JSON.stringify(json) },
                    success: function (data) {
                        var jso=JSON.parse(data);
                        grOrg.parse(jso,'json');
                        //if (form.getItemValue('City')==1) grOrg.groupBy(3);
                        iasufr.gridRowFocusApply(grOrg);
                        var cnt = grOrg.getRowsNum();
                        var cells=grOrg.getColumnsNum();
                        var cellsVal;
                        if (cnt>0) { for (var i = 0; i < cnt; i++) {
                            var idKP=grOrg.cells2(i,0).getValue();
                            var jsOrg={Date:date,idOrg:idKP} ;
                            //for (var is = 1; is < cells; is++) { cellsVal=grOrg.cells2(i,is).getValue(); if ((cellsVal.indexOf("@")) != -1)  email=email + cellsVal + '; '; }

                            //grOrg.cells2(i, 1).setValue("<a href='#' onclick='iasufr.loadForm(\"OrgEdit\", {onSave: function(){SelTable()} , width:"+wid+", height:"+hei+", json:"+ JSON.stringify(jsOrg) +"})'>"+grOrg.cells2(i, 1).getValue()+"</a>");
                            grOrg.cells2(i, 1).setValue("<a href='#'>"+grOrg.cells2(i, 1).getValue()+"</a>");

                            $(grOrg.cells2(i, 1).cell).click(onCellClick);
                            if ((idKP.indexOf(".")) != -1)  grOrg.setRowTextBold(grOrg.getRowId(i));
                            //$(grOrg.cells2(i, 1)).
                        }}
                        ///grOrg.splitAt(3);
                        mainB.progressOff();
                        var tt=""; if (form.isItemChecked('Req')) tt=" (заявки)"
                        mainB.setText(cntOrg + grOrg.getRowsNum()+tt);
                    }
                });


            }
        });  // ajax
        pSelTable=0;
    }  // SelTable()

    function onCellClick(e){
        var date=iasufr.formatDateStr(form.getCalendar("Date").getDate(true));
        //var hei=$(document).height(); //var wid=1100;
        var ind=$(e.currentTarget).parent().index()-1;
        var idRow=grOrg.getRowId(ind);
        iasufr.gridRowFocus(grOrg, idRow);
        var idKP=grOrg.cells2(ind,0).getValue();
        var jsOrg={Date:date,idOrg:idKP};
        iasufr.loadForm("OrgEdit", {onSave: SelTable, width: WID, height: HEI, json: jsOrg});
    }

    function initAcc() {
        Accord=main.cells("a").attachAccordion();
        //Accord.enableMultiMode();
        Accord.addItem("a1", "Фiльтр");
        //Accord.addItem("a2", "Типи органiзацiй");
        //Accord.addItem("a3", "Областi");
        //Accord.addItem("a4", "Типи контактiв");
        Accord.addItem("a2", "Налаштування таблицi");
        //Accord.cells("a1").(main.cells("a").getHeight());
        //Accord.cells("a2").setHeight(250);
        Accord.openItem("a1");
        //Accord.forEachItem(function(item){ alert(item); Accord.closeItem(item);   });


        gridOB = Accord.cells("a2").attachGrid();
        gridOB.setImagePath(iasufr.const.IMG_PATH);
        gridOB.setHeader("N,Наименование");
        gridOB.setInitWidths("30,*");
        gridOB.setColAlign("center,left");
        gridOB.setColTypes("ch,ro");
        gridOB.init();
        gridOB.detachHeader(0);
        iasufr.enableRowselectMode(gridOB);

        gridOB.attachEvent("onCheck", function(rId,cInd,state){
            if (state) gridOB.setRowTextBold(rId);
            else  gridOB.setRowTextNormal(rId);
            SaveCheck(1);
        });

        iasufr.ajax({
            url:'fin.Org.cls',
            data:{func:'OrgGetData'},
            success: function (data) {
                var jso=JSON.parse(data);
                gridOB.parse(jso,'json');
                gridOB.forEachRow(function(id){ //var rowIndex=gridOB.getRowIndex(id);
                    gridOB.forEachCell(id,function(cellObj,ind){
                        if (ind==0) { if (cellObj.isChecked()) gridOB.setRowTextBold(id); } });
                })   }
        });

    } // ------------------------------initACC

    //сохранение размеров столбцов таблицы после onResizeEnd(priz=2)  и после отметки в 'настройка таблицы' (priz=1)
    function SaveCheck(prizn) {
        var check = gridOB.getCheckedRows(0);
        var width="";
        if (prizn==2) var cel=grOrg.getColumnCount();  for (var i=0; i<cel; i++)  { width+= grOrg.getColWidth(i)+';'; }

        var json= {Check: check, Pr: prizn, Width: width};

        iasufr.ajax({
            url: "fin.Org.cls",
            data: {func: "OrgSaveData", json: JSON.stringify(json)},
            success: ""  //onSuccess,
        });
    }   // -------------- SaveCheck


    return ths;
};

//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/Org.js