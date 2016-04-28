if (!window.SmrMembers) SmrMembers = {};

if (!SmrMembers.Form) SmrMembers.Form = {};

SmrMembers.Form.Create = function(opt) {

    var t = iasufr.initForm(this, opt);
    var adm = false;
    if (iasufr.pGrp(1)) adm = true;
    var tb;
    var tlayout;
    tlayout = t.owner.attachLayout("2E");
    tlayout.cells("a").hideHeader();
    //tlayout.cells("b").hideHeader();
    tlayout.cells("b").setText('');
    tlayout.cells("a").setHeight(40);
    tlayout.cells("a").fixSize(0,1);
    tlayout.cells("b").fixSize(0,1);
    
    LoadNameSeminar();

    tb = tlayout.cells("b").attachToolbar();
    tb.setIconPath(iasufr.const.ICO_PATH);
    tb.setIconSize(32);
    if (adm) {
      tb.addButton("accept", 1, "Прийняти", "32/add_user.png", "");
      tb.addButton("disagree", 2, "Не приймати", "32/del_user.png", "");
      //tb.addButton("copyemail", 3, "Copy email", "32/webmail.png", "");
      //tb.addInput("inpemail", 4, "",90);
      tb.addButton("yesprinted", 3, "Роздруковано", "32/script_stamp.png", "");
      tb.addButton("noprinted", 4, "Не роздруковано", "32/after_delete.png", "");
      tb.addSeparator("sep3", 5);
    }
    tb.addButton("add", 6, iasufr.lang.ui.add, "32/toolbar_add.png", "");
    tb.addButton("edit", 7, iasufr.lang.ui.edit, "32/toolbar_edit.png", "");
    tb.addButton("del", 8, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
    //tb.addButton("reload", 9, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
    tb.addSeparator("sep2", 10);
    if (adm) tb.addButton("print", 11, "Друк запрошення", "32/printer_empty.png", ""); 
    tb.addButton("close", 12, iasufr.lang.ui.close, "32/door.png", "");
    if (adm) tb.addButton("printtest", 13, "Друк тест", "32/printer_empty.png", "");

    tb.attachEvent("onClick", onToolbarClick);

    var g = tlayout.cells("b").attachGrid();
    g.setHeader('Статус,Роздр.,Код Мережі,Організація,ПІБ,Посада,Дата заїзду,Готель,Стать,Телефон,E-mail,Код оганізації,Коментар');
    g.setInitWidths("80,40,50,200,200,200,70,50,50,80,100,10,250");
    g.setColTypes("ro,ro,ed,ed,ed,ed,dhxCalendar,ed,ed,ed,ed,ro,ed");
    g.setColSorting('str,str,str,str,str,str,date,str,str,str,str,str,str');
    g.setColAlign("center,center,left,left,left,left,center,center,center,left,left,left,left");
    g.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
    g.setImagePath(iasufr.const.IMG_PATH);  
    g.setDateFormat("%d.%m.%Y");
    if (!adm) g.setColumnsVisibility("false,true,true,true,false,false,false,false,false,false,false,true,false");
    else g.setColumnsVisibility("false,false,false,false,false,false,false,false,false,false,false,true,false");
    g.attachEvent("onFilterEnd", onFilterEnd); 
    g.attachEvent("onRowSelect", onRowSelect);

    g.init();
    iasufr.enableRowselectMode(g);
    this.grid = g;
    this.form = t;
    RefreshGrid();

    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function RefreshGrid(id) {
        iasufr.gridRowFocus(g, id);
        var data = {func: "SelectMemb",id: opt.id,idOrg:iasufr.user.orgId};
        iasufr.ajax({url: "fin.Sem.cls", data: data, success: onAfterLoad});
    }

    function onAfterLoad(data) {
        g.clearAll();
        if (data) g.parse(JSON.parse(data), 'json');
        iasufr.gridRowFocusApply(g);

        var cnt = g.getRowsNum();
        //var cntaccept = 0;
        //tlayout.cells("b").setText("Всього строк: " + cnt );
        
        if (cnt>0) for (var i = 0; i < cnt; i++) {
            if (g.cells2(i, 0).getValue() == "Прийнято") { 
                g.cells2(i, 0).setBgColor('#468847');
                g.cells2(i, 0).setTextColor('white');
            } else {
                g.cells2(i, 0).setBgColor('white');
                g.cells2(i, 0).setTextColor('white');
            }

                       
        }
        onFilterEnd();
        onRowSelect(g.getSelectedRowId()); 
    }

    function onToolbarClick(name) {
        switch (name) {
           // case "reload": RefreshGrid(); break;
           case "add": ShowAddForm(false); break;
           case "edit": ShowAddForm(true); break;
           case "del": DeleteMember(); break;
           case "close": Close(); break;
           case "accept": AcceptMember(1); break; 
           case "disagree": AcceptMember(2); break;
           case "print": ToPrint(); break;
           case "yesprinted": PrintedMember(1); break;
           case "noprinted": PrintedMember(2); break;
           case "printtest": PrintTest(); break;
           //case "copyemail": CopyEmailToClipboard(); break;

        }
    }

    function PrintTest() {
 alert(iasufr.user.login);    
//iasufr.printPdf([{ content: '<table><thead><th>header</th></thead><tr><td>1</td></tr></table>', orientation: 'landscape'}])
    }


    function onFilterEnd() {
        var cnt = g.getRowsNum();
        var cntaccept = 0;
        if (cnt>0) for (var i = 0; i < cnt; i++) {
            if (g.cells2(i, 0).getValue() == "Прийнято") cntaccept++;
            //g.cells(id, 0).setTextColor('white');
        }
        tlayout.cells("b").setText("Всього заявок: " + cnt + ", прийнято:" + cntaccept + ", не прийнято:" + (cnt - cntaccept));
    }

    function onRowSelect(id) {
        var cnt = g.getRowsNum();
        if (cnt>0) for (var i = 0; i < cnt; i++) {
            if (g.getRowId(i)==id) g.cells2(i, 0).setTextColor('red');
            else  g.cells2(i, 0).setTextColor('white');
        }
    }


    /*
    function CopyEmailToClipboard() {
        var selId=g.getSelectedRowId();
        //tb.setItemValue("inpemail", "ttt");
        //g.cells(selId, 6);
        $(tb.getInput("inpemail")).val(g.cells(selId, 8).getValue());  
    }
    */


    function AcceptMember(Status){
        if (!adm) return; 
        var selId = g.getSelectedId();
        var selOrg;
        if (selId) selOrg = g.cellById(selId, 11).getValue();
        if (!selOrg) return;
        iasufr.ajax({
            url: "fin.Sem.cls",
            data: {func: "EditStatus", id: selId, idOrg:selOrg, idSem:opt.id, St:Status},
            success: function (d) {
                var id;
                try{id=JSON.parse(d).Id} catch(e){}
                RefreshGrid(id);
            }
        });
    }


    function PrintedMember(isPrinted){
        if (!adm) return; 
        var selId = g.getSelectedId();
        var selOrg;
        if (selId) selOrg = g.cellById(selId, 11).getValue();
        if (!selOrg) return;
        iasufr.ajax({
            url: "fin.Sem.cls",
            data: {func: "EditPrinted", id: selId, idOrg:selOrg, idSem:opt.id, Printed:isPrinted},
            success: function (d) {
                var id;
                try{id=JSON.parse(d).Id} catch(e){}
                RefreshGrid(id);
//alert(isPrinted+"!"); 
            }
        });
    }




    function DeleteMember(){
        var selId = g.getSelectedRowId();
        if (!selId) return;
        selOrg = g.cellById(selId, 11).getValue();
        dhtmlx.confirm({
            text: iasufr.lang.msg.delete,
            callback: function(r) { 
              if (r) iasufr.ajax(
                { 
                 url: "fin.Sem.cls",
                 data:{func:"DeleteMemb", id: selId, idOrg:selOrg, idSem:opt.id}, 
                 success: RefreshGrid}); 
            }
        });
    }

    function ShowAddForm(isEdit){

        var countRows=g.getRowsNum();
        if (isEdit && !countRows) return;
        var selId = g.getSelectedId();
        var selOrg, status;
        if (selId) {
            selOrg = g.cellById(selId, 11).getValue();
            status = g.cellById(selId, 0).getValue();
        } else {
            selOrg = iasufr.user.orgId
            status = '';    
        } 

        if (!adm && isEdit && status == 'Прийнято') { 
            iasufr.showError("Заборонено редагувати заявки з статусом 'Прийнято'");        
            return;
        }

        if (isEdit && !selId) return;

        if (!isEdit) {
            selId = 0;
            selOrg = iasufr.user.orgId;
        } 

        var w = iasufr.wins.createWindow("smrm" + new Date().getTime().toString(), 0, 0, 500, 500);
        w.askForClose = true;
        if (isEdit) w.setText("Редагування учасника семінару");
        else w.setText("Додавання учасника семінару");  
        w.setModal(true);
        w.centerOnScreen();
 
        var tbe = w.attachToolbar();
        tbe.setIconPath(iasufr.const.ICO_PATH);
        tbe.setIconSize(16);
        tbe.addButton("save", 1, iasufr.lang.ui.save, "16/tick.png", "");
        tbe.addButton("cancel", 2, iasufr.lang.ui.cancel, "16/cross.png", "");
        tbe.attachEvent("onClick", onEditToolbarClick);

        var items = [{type: "settings", position: "label-left", labelWidth: 130, inputWidth: 100, offsetLeft: 10, offsetTop: 10 }];

        var item = {type: "input", name: "pib", label: "Прізвище Ім'я По-батькові:"};
        item.required = true;
        item.inputWidth = 300;
        items.push(item);

        var item = {type: "input", name: "posada", label: "Посада:"};
        item.required = true;
        item.inputWidth = 300;
        items.push(item);

        item = {type: "calendar", name: "datein", label: "Дата заїзду:", calendarPosition: "right", dateFormat: "%d.%m.%Y"},
        item.required = true;
        items.push(item);

        var item = {type: "select", name: "hotel", label: "Готель:", options:[
                    {value: "", text: "", selected:false},
                    {value: "так", text: "так", selected:false},
                    {value: "ні",  text: "ні", selected:false}                    
                    ]
        };
        item.required = true;
        items.push(item);

        var item = {type: "select", name: "gender", label: "Стать:", options:[
                    {value: "", text: "", selected:false},
                    {value: "1", text: "Чол.", selected:false},
                    {value: "2",  text: "Жін.", selected:false}                    
                    ]
        };
        item.required = true;
        items.push(item);

        var item = {type: "input", name: "phone", label: "Телефон:"};
        item.required = true;
        items.push(item);

        var item = {type: "input", name: "email", label: "E-mail:", validate:"ValidEmail"};
        item.required = true;
        item.inputWidth = 130;
        items.push(item);

        var item = { type:"input" , name:"comment", label:"Коментар", rows:"3", inputWidth:450, inputHeight:63};
        items.push(item);

        var frm = w.attachForm(items);

        w.setDimension(500, $(frm.base).height() + 74);
        w.centerOnScreen(); 
        $(frm.getInput("pib")).focus();

        if (isEdit) LoadData();

        var evtClose = null;
        frm.attachEvent("onChange", function (name, value){
            if (!evtClose)  evtClose = iasufr.wins.attachEvent("onClose", function(w) {
                if (w.askForClose) iasufr.confirm("Закрити вiкно? Данi не будут збереженi!", function() {
                    w.askForClose = false;
                    iasufr.wins.detachEvent(evtClose);
                    w.close();
                }); 
                return false;
            });
        });


        
        function FillForm(obj) {
            frm.setItemValue("pib", obj[0]);
            frm.setItemValue("posada", obj[1]);
            frm.setItemValue("datein", obj[2]);
            frm.setItemValue("hotel", obj[3]);
            frm.setItemValue("gender", obj[4]);
            frm.setItemValue("phone", obj[5]);
            frm.setItemValue("email", obj[6]);
            frm.setItemValue("comment", obj[7]);
        }


        function LoadData() {
          t.owner.progressOn();
          iasufr.ajax({
              url: "fin.Sem.cls",
              data: {func: "GetMemb", id: selId, idOrg:selOrg, idSem:opt.id},
              success: function (d, obj) {
                t.owner.progressOff();
                FillForm(obj.json);
              },
              error: function() {
              t.owner.progressOff();
              w.close();
              }
          });
        }


        function onEditToolbarClick(name) {
          if (name == "cancel") w.close();
          if (name == "save") {
       

            w.askForClose = false;

            //var r = /^\w+@\w+\.\w{2,4}$/i;
            //if (!r.test(document.forma.email.value) {
            //}



            if (!frm.validate()) return;

           // var r = /^\w+@\w+\.\w{2,4}$/i;
           // if (!r.test(frm.getItemValue("email"))) {
           //    iasufr.showError("Перевірте корректність e-mail");
           //    return;
           // }

            var dataedit = [];
            dataedit[0] = frm.getItemValue("pib");
            dataedit[1] = frm.getItemValue("posada");
            dataedit[2] = iasufr.formatDateStr(iasufr.formatDate(frm.getItemValue("datein")));
            dataedit[3] = frm.getItemValue("hotel");
            dataedit[4] = frm.getItemValue("gender");
            dataedit[5] = frm.getItemValue("phone");
            dataedit[6] = frm.getItemValue("email");
            dataedit[7] = frm.getItemValue("comment");

            iasufr.ajax({
                url: "fin.Sem.cls",
                data: {func: "EditMemb", id: selId, idOrg:selOrg, idSem:opt.id, data: JSON.stringify(dataedit)},
                success: function (d) {
                    var id;
                    try{id=JSON.parse(d).Id} catch(e){}
                    RefreshGrid(id);
                    if (evtClose) iasufr.wins.detachEvent(evtClose); 
                    w.close()
                }
            });
          }
        }

    }


    function FillNameSeminar(obj) {
        var leftbr =  (obj[5] != '') ? '   (': '' ,
            rightbr =   (obj[5] != '') ? ')': '' ;
        var currentsem = obj[0] + '  ' + /* obj[1] + ' - ' + obj[2]  + */ leftbr + obj[5] + rightbr;
        //var strtopfrm = [
	  //  { type:"label" , name:"label1", label:"("+iasufr.user.orgCode+") "+ iasufr.user.orgName},
	  //  { type:"label" , name:"label2", label:currentsem}         
        //];
        var strtopfrm = [
            { type:"label" , name:"label1", label:currentsem}         
        ];
        topfrm = tlayout.cells("a").attachForm(strtopfrm);
        ShowButtons(obj[2]); 
    }

    function ShowButtons(endsem){
        var now = new Date();
        var dateendsem = iasufr.dateFromStr(iasufr.formatDateStr(endsem));
        var showbutton = (now<dateendsem);
        if (!showbutton){
            tb.disableItem("add");
            tb.disableItem("edit");
            tb.disableItem("del");
        } else {
            tb.enableItem("add");
            tb.enableItem("edit");
            tb.enableItem("del");
        }
    }


    function LoadNameSeminar() {
        iasufr.ajax({
            url: "fin.Sem.cls",
            data: {func: "GetSe", id: opt.id},
            success: function (d, obj) {
              FillNameSeminar(obj.json);
            },
            error: function() {Close();}
        });
    }


    function ToPrint() {
        t.owner.progressOn();
        var selId = g.getSelectedRowId();
        if (!selId) { iasufr.message(" Вкажiть строку !"); return; }
        var selOrg = g.cellById(selId, 11).getValue();
        var pu = new PrintUtils();
        iasufr.ajax({url:'fin.Sem.cls', data: {func: "TextForPrint", json: JSON.stringify( {id:selId, idOrg:selOrg, idSem:opt.id, ispFIO:iasufr.user.fio}) },
            success: function (data) {
            var jso = JSON.parse(data);
            var txt =jso.txt;
            iasufr.print( txt );
            t.owner.progressOff();

        } });
    }


    function Close() {
        iasufr.close(t);
    }

    return this;
}





