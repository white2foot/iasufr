if (!window.Fin) Fin = {};
if (!Fin.DogGrp) Fin.DogGrp = {};

Fin.DogGrp.Create = function (opt) {
    var win = iasufr.initForm(this, opt);
    //    if (opt.select) win.owner.setModal(true); 

    var user=iasufr.user;
    var toolbar;
    var gD;
    win.owner.progressOn();

    var expand=1;
    var FlagName=0;
    var FlagDrop=0;
    var CountRow=1000;

    
    var main = new dhtmlXLayoutObject(win.owner, '1C');
    main.cells('a').hideHeader();

    if (!opt.select )  { toolbar = main.attachToolbar();   InitToolBar(); }  // нет входа извне


    var tbOrg =main.cells('a').attachToolbar();
    tbOrg.setIconsPath(iasufr.const.ICO_PATH);
    tbOrg.addText("OrgT", 1, "Органiзацiя ");
    tbOrg.addInput("Org", 2, "",350);

    var admin=iasufr.pGrp(1);
    if (( !opt.select )&&( iasufr.pGrp(1) )) iasufr.attachSelector(tbOrg.getInput("Org"), "OrgSelector",  { onSelect: OrgSelect});

    function OrgSelect(o, $txt)   { selOrg = o;
        if (o) { if (o.name!=undefined)  $txt.val("(" + o.code + ") " + o.name);  }
        if (selOrg==null) { selOrg={}; selOrg.id=0; }
        LoadData(); }

    //----------------------------------------
    var selOrg = {}; var orgName="";
    if (!win.opt.idOrg ) {            // поиск группы договоров по указ.организации
      selOrg.id=user.orgId;
      orgName=user.orgName;
      var code=user.orgCode;
      if (code) orgName="("+code+")" + orgName;
    }
    else { selOrg.id=win.opt.idOrg;  orgName=win.opt.orgName;    }
    $(tbOrg.getInput("Org")).val(orgName);
    //-------------------------------------------------------------


    gD = main.cells('a').attachGrid();

    if (opt.select) { gD.attachEvent("onRowSelect", function (id) {
        var name = gD.cells(gD.getSelectedId(), 0).getValue();
        if (gD.getParentId(id)) { name = name + "/" + gD.cells(gD.getParentId(id), 0).getValue(); }
        opt.onSelect({id:id, name:name, idOrg:selOrg.id});
        iasufr.close(win)
    });
    }

    gD.setImagePath(iasufr.const.IMG_PATH);
    gD.setHeader('Групи договорiв,Шаблон номеру договору,Значення за умовчанням,Тексти договорiв');
    gD.setInitWidths('400,70,100,500');
    gD.setColAlign('left,center,center,left');
    gD.setColTypes("tree,ro,ro,ro");
    //gD.setColSorting('str');
    gD.attachHeader("#text_filter,#rspan,#rspan,#rspan");
    gD.init();
    gD.enableDragAndDrop(true);
    gD.setDragBehavior("complex");

    var nameGrp = [];
    gD.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
        if ( (stage==2) && (nValue!=oValue) )  { nameGrp.push( {idRow: rId, name: nValue} ); FlagName=1; }
        return true
    });

    iasufr.enableRowselectMode(gD);

    gD.attachEvent("onDrop", function(sId,tId,dId,sObj,tObj,sCol,tCol){
        gD.openItem(sId);
        FlagDrop=1;
        return true
    });

    LoadData();

    function LoadData() { gD.clearAll();
        iasufr.ajax({url:'fin.Dog.cls', data: {func: "DogGetGrp", json: JSON.stringify( {idOrg:selOrg.id}) }, success: function (data) {
            var jso = JSON.parse(data);
            gD.parse(jso, 'json');
            gD.expandAll();

            for (var i = 0; i < gD.getRowsNum(); i++) {  var idr=gD.getRowId(i);
                var sub=gD.getSubItems(idr);
                var prnt=gD.getParentId(idr);
                if  ((prnt==0) && (sub!=''))   gD.setRowTextStyle(idr, "font-weight: bold;");
                if  (sub!='')   gD.setItemImage(gD.getRowId(i), iasufr.const.ICO_PATH + "16/book.png");


            }


            //iasufr.gridRowFocusApply(gD);
            win.owner.progressOff();
        }
        });
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("print", 2, "Друк", "32/printer_empty.png", "");
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        toolbar.addButton("add", 3,iasufr.lang.ui.add, "32/toolbar_add.png", "");
        toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("edit", 4, iasufr.lang.ui.edit, "32/toolbar_edit.png", "");
        //toolbar.setItemToolTip("edit", "Можна вказати шаблон/текст договору для номеру договору для вибраноi групи");

        toolbar.addButton("grup", 5, "Згорнути / Розгорнути", "32/group_stroke.png", "");
        toolbar.addButton("reload", 7, iasufr.lang.ui.reload, "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            var idGrp=GetGrpId(); //if (id == 'add') idGrp=0;
            iasufr.gridRowFocus(gD, idGrp);
            if (id == 'save')  {   SaveGrp();  }

            if ((id == 'edit')) { if ( (!idGrp) ) { iasufr.message('Вкажiть строку !'); return; }
              var w=$( document ).width()-30;
              iasufr.loadForm("DogGrpEdit", {idGrp:idGrp,idOrg:selOrg.id, idOrgName:$(tbOrg.getInput("Org")).val(), width:w, height:470,onSave: Reload});
            }

            if (id == 'add') {
                CountRow = CountRow +1;  var idn = CountRow;
                var prnt=0; var ind=0;
                if (idGrp) { prnt=idGrp; ind=null; }
                var name='Нова група договору';
                gD.addRow(idn, [name], ind, prnt);
                gD.setRowTextStyle(idn, "color: red;");

                if (prnt) gD.openItem(prnt);
                FlagDrop=1;
                nameGrp.push( {idRow: idn, name: name} ); FlagName=1;
            }

            if (id == 'del') { 
                if  (!idGrp) { iasufr.message('Вкажiть строку !'); return; }
                if (gD.getSubItems(idGrp)!='') { iasufr.message('Неможливо видалити - e пiдгрупи !'); return; }
                if ( (FlagDrop) || (FlagName) ) { iasufr.message('Спочатку збережiть змiни або виконайте "Оновити" !'); return; }
                iasufr.confirm(iasufr.lang.msg.delete, DelGrp);
            }

            if (id == 'grup')  { if (expand==1) { gD.collapseAll(); expand=0; return }
                                 if (expand==0) { gD.expandAll(); expand=1; return }
            }
            //--------------------------------------------
            if (id == 'print')  {
                    //if  ( !idGrp || gD.cells(idGrp,3).getValue()=='') { iasufr.message('Вкажiть строку з договором !'); return; }
                    //iasufr.loadForm("DogPrint", { modal:true, width:1000, height:600, idOrg:selOrg.id, idGrp:idGrp });
        			//var docDefinition = { content: 'проверка печати в PDF формате' };
                  gD.printView();
			}
			//-------------------------------------
            if (id == 'reload')  {  Reload(); }

            if (id == 'close') {
                if ( (FlagDrop) || (FlagName) ) {
                    dhtmlx.confirm("Записати змiни ?", function(result) {
                        if (result) SaveGrp();
                        else iasufr.close(win);
                    } );
                }
                if ( (!FlagDrop) && (!FlagName) )  iasufr.close(win);
            }



        }); // onClick
    }


    function GetGrpId() { return gD.getRowId(gD.getRowIndex(gD.getSelectedId())); }

    function Reload() { win.owner.progressOn(); gD.clearAll();
        FlagName=0; FlagDrop=0;
        nameGrp = null; nameGrp = [];
        LoadData(); }

    function DelGrp() { var idGrp=GetGrpId();
        iasufr.ajax( {url:'fin.Dog.cls',
            data:{ func: "DogGrpDel", json: JSON.stringify( {idOrg: selOrg.id, idGrp:idGrp } )},
            success: function(d) { iasufr.messageSuccess("Видалено !");  Reload();  },
            error: function() { if (main.progressOn) main.progressOff() }
        });
    }


    function SaveGrp() {
        var Row = [];
        if (FlagDrop==1) {
            for (var i = 0; i < gD.getRowsNum(); i++) {
                var idRow=gD.getRowId(i);
                var prnt=gD.getParentId(idRow);
                var name=gD.getItemText(idRow);
                Row.push({idRow: idRow, name: name, idParent: prnt,  Num: i });
            }
        }

        var json={idOrg: selOrg.id };
        json = $.extend(json, {Row:Row, Name: nameGrp});

        iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "DogGrpSave", json: JSON.stringify(json)},
            success: function() { win.owner.progressOff();  iasufr.messageSuccess("Збережено !");
                nameGrp = null; nameGrp = [];
                Reload(); },
            error: function(){if (win.owner.progressOn) win.owner.progressOff()}
        });
    }

	function ToPdf() {
        var pu = new PrintUtils();
        iasufr.ajax({url:'fin.Dog.cls', data: {func: "DogPdf", json: JSON.stringify( {idOrg:selOrg.id}) }, success: function (data) { 
		    //alert(data);
			//
            var jso = JSON.parse(data);

            var txt=jso.txt; 
	/*		txt=iasufr.replaceAll(txt, "~", "\n");

			var docDefinition = {
              content: [
              { text: txt}
                                        ]
            };
            */
            var dd = [];
            //var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;
            //data = data.replace(/[^а-яa-z0-9~`\!@#\$%\^&\*\(\)\-_\+\=\{\[\}\]\|\\\:;\'\"<\,>\.\?\/\n\r\s\t]/gi, '');

                /*for (var i = 0, n = data.length; i < n; i++) {
                    if (data.charCodeAt( i ) > 1103 ||  (data.charCodeAt( i ) < 1040 && data.charCodeAt( i ) > 255)) {
                        console.log("HAS");
                    }
                }



            for (var c = 0; c <= 31; c++) {
                data = iasufr.replaceAll(data,String.fromCharCode(c), "");
            }

            for (var c = 140; c <= 255; c++) {
                data = iasufr.replaceAll(data,String.fromCharCode(c), "");
            }*/

            //pu.parseHtml(dd, data);
            // pu.cleanUp(dd);

            //console.log(JSON.stringify(dd));
            // pdfMake.createPdf( { content:dd }).open();
            iasufr.print(txt);

            win.owner.progressOff();
        }
        });
    }





    return win;
};
//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/dogGrp.js