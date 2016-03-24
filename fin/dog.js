// договора  ^Dog(idOrg,"D",idDog)

if (!window.Fin) Fin = {};
if (!Fin.Dog) Fin.Dog = {};

Fin.Dog.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var user=iasufr.user;
    var idOrgUser=user.orgId;
    var bodyhei=$('body').height()-30;
    dhtmlx.image_path = iasufr.const.IMG_PATH;

    var main = new dhtmlXLayoutObject(t.owner, '2U');
    main.cells("a").setWidth('260');
    main.cells("a").hideHeader();
    //main.cells('b').setText("");
    var mainB=main.cells('b');

    var pSelTable=0;
    var pHeader=0;
    var cntOrg="Усього договорiв: ";
    var cntSumT="&nbsp;&nbsp;&nbsp;на суму:&nbsp;&nbsp;&nbsp;";
    var cntSumTO="&nbsp;&nbsp;&nbsp;сплачено: ";
    var form;
    var toolbar;
    var cellNumDog;
    //var myPop;
    var gD;
    var orgName;
    var selOrg=null;  selOrg = {};
    var selOrgK=null; selOrgK = {};
    var selOrgP=null; selOrgP = {};
    var selKosht=null;  selKosht = {};
    var selGrp=null;  selGrp = {};
    var SumI={};

    var dost=iasufr.pFunc("dogAdd");
    var admin=iasufr.pGrp(1);
    //----------------------------------------
    selOrg.id=user.orgId;
    orgName=user.orgName; selOrg.name=user.orgName;
    var code=user.orgCode;
    if (code) orgName="("+code+")" + orgName;
    //-------------------------------------------------------------
    //  определение последней организации(Договора организации), с -крой была работа юзера
    iasufr.ajax({url:'fin.Oper.cls', data: {func: "GetOrg", pOrg:"DOG"}, success: function (data) {
        var jso = JSON.parse(data);
        if (jso.id) { selOrg.id=jso.id; orgName=jso.name; selOrg.name=orgName;
            //if  ( (dost) && (!admin)  && (selOrg.id != idOrgUser) )   toolbar.disableItem("new");
            //else  toolbar.enableItem("new");

        }
    }});

    ToolB();
    InitTable();


    function ToolB() {
        toolbar = main.attachToolbar();
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        if (admin) { toolbar.addButton("sms", 1, "Смс-повiдомлення", "32/webmail.png", "");
        toolbar.setItemToolTip("sms", "Надiслати смс-повiдомлення користувачам вибраних органiзацiй");
        }
        toolbar.addButton("printA", 1, "Друк адрес", "32/printer_book.png", "");
        toolbar.addButton("print", 2, "Друк", "32/printer_empty.png", "");
        toolbar.setItemToolTip("printA", "Адреси вибраних органiзацiй будуть сформованi у Excel-файлi");

		toolbar.addButton("new", 3, "Додати договiр", "32/toolbar_add.png", "");
        if (iasufr.pFunc("dogEdit")) toolbar.addButton("edit", 3, "Редагувати договiр", "32/toolbar_edit.png", "");
        toolbar.addButton("rel", 5, "Оновити", "32/arrow_rotate_anticlockwise.png", "");
        toolbar.addButton("close", 6, iasufr.lang.ui.close, "32/door.png", "");
        toolbar.addButton("save", 10,"Зберегти налаштування таблицi" , "32/database_save.png", "");

        toolbar.attachEvent("onClick", function(id){
            switch (id) {
                case "print": gD.printView(); break;
                case "save":   SaveTable(); break;
                case "new":   var idOrg=0;   if (selOrg) idOrg=selOrg.id;
                    if (idOrg>0) iasufr.loadForm("DogEdit", {width:1200, height:bodyhei, idDog:0, idOrg:idOrg, orgName:orgName, onSave: SelTable});
                    else  iasufr.message("Вкажiть органiзацiю !");
                    break;
                case "edit":  var ind = gD.getRowIndex(gD.getSelectedId());
                    var idRow=gD.cells2(ind, cellNumDog).getValue();
                    if (!idRow) { iasufr.message("Вкажiть договiр !"); return }
                    iasufr.gridRowFocus(gD, idRow);
                    iasufr.loadForm("DogEdit", {onSave: SelTable, width: 1200, height: bodyhei, idOrg:selOrg.id, idDog:idRow, orgName:orgName });
                    pSelTable=0;
                    break;
                case "rel":   SelTable(); break;
                case "close":   iasufr.close(t); break;
                case "printA":
                    var cnt = gD.getRowsNum(); stroka="";
                    if ( cnt==0 ) { iasufr.message("Вкажiть список договорiв !"); return }
                    if (cnt>0) {
                        for (var i = 0; i < cnt; i++) {
                          var idRow=gD.cells2(i, cellNumDog).getValue();
                            stroka+=idRow+",";
                        }
                    }
                    iasufr.confirm('Пдтвердть формування файла з адресами вибраних органзацй', Excel);
                    break;
                case "sms":
                    var cnt = gD.getRowsNum(); stroka="";
                    if ( cnt==0 ) { iasufr.message("Сформуйте список органiзацiй з договорами  !"); return }
                    if (cnt>0) {
                        for (var i = 0; i < cnt; i++) {
                            var idRow=gD.cells2(i, cellNumDog).getValue();
                            stroka+=idRow+",";
                        }
                    }
                    //alert(stroka); break;
                    var hei=$( document ).height()-50;
                    if (admin) iasufr.loadForm("ReqSms", { width: 1200, height: hei, idOrg:selOrg.id, orgName:orgName,  listDog:stroka } );
                    //else alert('В разработке !');
                    break;
            }
        });

        var btn=$("img[src='/images/icons/32/database_save.png']");  //.offset();
        var w=$( document ).width()-230;
        btn.parent().offset({left:w});
        //console.log(btn+'---'+w );
    }   //------------------------ ToolB()

    function Excel()   {
        mainB.progressOn();
         iasufr.ajax( {url:'fin.DogOrg.cls',
            data:{ func: "getOrgAdres", json: JSON.stringify( {idOrg:selOrg.id, sel:stroka} ) },
            success: function(d) { iasufr.messageSuccess("Сформовано файл !");
                var jso =JSON.parse(d);
                console.log(d);
                var csvContent = "";  //"11;22;33" + "\n";
                //csvContent += "проверка;тест;32" + "\n";
                //csvContent += "test;fff;ggg" + "\n";
                for (var i = 0; i < jso.Adres.length; i++) {
                    csvContent +=jso.Adres[i].Name + ';' + jso.Adres[i].Street + ';' + jso.Adres[i].City + "\n";
                }

                var link = window.document.createElement("a");
                link.setAttribute("href", "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(csvContent));
                link.setAttribute("download", "Adresa.csv");
                link.click();

                /*
                var A = [[1,2,3]];
                for (var i = 0; i < jso.Adres.length; i++) { A.push([jso.Adres[i].Name, jso.Adres[i].Street,jso.Adres[i].City]); }

                var csvRows = [];
                for(var i=0, l=A.length; i<l; ++i){
                    csvRows.push(A[i].join(';'));
                }
                csvRows.splice(0, 0, "sep=;");
                var csvString = csvRows.join("%0A");
                iasufr.downloadData("Adresa.csv", csvString, 'data:attachment/csv,');
                */

                mainB.progressOff();

            },
            error: function() { if (mainB.progressOn) mainB.progressOff() }
        });
    }


    function CntSum(pp) {
             var sum=0,sumA=0,sumO=0,idRow,s6,s7;
             var cnt = gD.getRowsNum();
             if (cnt>0) { for (var i = 0; i < cnt; i++) { //s=gD.cells2(i, 4).getValue();
                 sum+=gD.cells2(i, 7).getValue()*1;
                 s6=gD.cells2(i, 8).getValue(); s7=gD.cells2(i, 9).getValue();
                 sumA+=s6*1;
                 sumO+=s7*1;
                 if ((s6!=s7)&&(form.getItemValue('op5')==11))  gD.setCellTextStyle(gD.getRowId(i),9,"color:#cc0000");
                                                        }
             }
             if (sumA==0) sumA="";
             else sumA=sumA.toFixed(2);

             //if (sumO==0) sumO="";
             //else
             sumO=sumO.toFixed(2);
             sum=sum.toFixed(2);
        //------------------
        var arr  = [sum,  sumA , sumO];
        var arr1 = ['', '', ''];
        for (var a in arr)  {  var c=''; var ch=arr[a];
                               count=0;
                               for(i=ch.length-1;i>-1;i--) {
                                    result = count%3;
                                    count++;
                                    if ((result == 0)&&(count>4)) c=ch[i]+' '+c;
                                    else c=ch[i]+c;
                               }
                               arr1[a]=c;
        }
        SumI.sumD=sum;  SumI.sumD1=arr1[0];
        SumI.sumA=sumA; SumI.sumA1=arr1[1];
        SumI.sumO=sumO; SumI.sumO1=arr1[2];
    }
        //gD.forEachRow(function(id){ sum+= this.cellById(id,4).getValue()*1;    });

    function InitTable() {
        gD=main.cells('b').attachGrid();
        gD.setImagePath(iasufr.const.IMG_PATH);
        //                0        1           2          3       4         5            6           7            8         9           10        11        12         13      14      15      16          17       18     19        20
        gD.setHeader("N договору,Дата дог.,Сформ. корист.,Код,Контрагент,ЄДРПОУ,Тип органiзацii,Сума договору,Сума актiв,Сума оплати,Перiод опл.,Дата опл.,Дата вводу,Платник,Мiсто,Область,Группа,Стан договору,рег.N,Стан акту,Переговори,Коментар");
        gD.setInitWidths("110,70,35,40,300,70,90,80,80,80,80,80,80,250,90,100,100,130,30,130,200,180");
        //                0      1      2      3     4    5     6      7     8    9    10      11    12   13   14     15   16   17
        gD.setColAlign("center,center,center,center,left,center,left,right,right,right,left,center,center,left,left,left,left,left,right,left,left,left");
        gD.setColTypes("ro,ro,ro,ro,ro,ro,ro,edn,edn,edn,ro,dhxCalendarA,dhxCalendarA,ro,ro,ro,ro,ro,ro,ro,ro,ro");
        gD.setColSorting("str,str,str,str,str,str,str,int,int,int,str,date,date,str,str,str,str,str,int,str,str,str");
        //                0                        5                     10                             15                          20
        gD.setColumnIds("sND,sDTD,sSFK,sKOD,sORGK,sEDRP,tip,ssD,ssA,ssO,period,datOpl,datIsp,sPLAT,city,obl,sGRUP,stan,regDog,sSTAN,speak,koment");
        gD.init();
        //gD.enableTooltips("false,false,true");
        cellNumDog=gD.getColIndexById("regDog");
        var issD=gD.getColIndexById("ssD");    var issA=gD.getColIndexById("ssA");  var issO=gD.getColIndexById("ssO");
        gD.setNumberFormat("00,000.00",issD);  gD.setNumberFormat("00,000.00",issA);   gD.setNumberFormat("00,000.00",issO);



        gD.attachFooter(",,,,Усього<br><span style='color:#cc0000'>не сплачено</span>,,,<div id='sumD'></div>,<div id='sumA'></div>,<div id='sumO'></div>",["text-align:right;"]);
            //gD.attachFooter("Итого по договорам,#cspan,#cspan,<div id='sumD'></div>","Итого по актам,#cspan,#cspan,<div id='sumA'></div>",["text-align:right;"]);
        //gD.splitAt(4);
        gD.enableHeaderMenu("true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,true");
        gD.attachEvent("onResizeEnd", function(obj){
            //var ind=gD.getColIndexById("sEDRP");

        });

        //var arr1 = ["datOpl","datIsp","sDTD", "sPLAT" , "sGRUP", "sKOM", "stan", "sKOSHT", "regDog", "sSTAN"];
        var arr1 = ["datOpl","datIsp","sDTD","sSFK", "sPLAT" , "sGRUP", "stan", "regDog", "sSTAN","speak","koment","period"];
        for (var a in arr1) gD.setColumnHidden(gD.getColIndexById(arr1[a]),true);
        /*
        gD.enableAutoHiddenColumnsSaving("gD");
        gD.loadHiddenColumnsFromCookie("gD");
        gD.enableAutoSizeSaving("gD");
        gD.enableAutoSaving();
        gD.loadSizeFromCookie("gD");
        */
        //                  0   1     2    3    4     5    6   7   8   9    10   11   12   13   14   15   16     17     18
        //gD.setColumnIds("sND,sDTD,sSFK,sKOD,sORGK,sEDRP,tip,ssD,ssA,ssO,sPLAT,city,obl,sGRUP,sKOM,stan,sKOSHT,regDog,sSTAN");
        //cellNumDog=gD.getColIndexById("regDog");


        gD.attachEvent("onFilterEnd", function(elements){  CntSum();
                                                           mainB.setText(cntOrg+gD.getRowsNum()+' '+cntSumT + SumI.sumD1+' '+cntSumTO + SumI.sumO1);
                                                           $("#sumD").html(SumI.sumD+'<br>&nbsp;');
                                                           $("#sumA").html(SumI.sumA+'<br>&nbsp;');
                                                           var ras=SumI.sumA-SumI.sumO;
                                                           ras='<br><span style="color:#cc0000">' + ras.toFixed(2) + '</span>';
                                                           $("#sumO").html(SumI.sumO + ras);
                                                           return true
                                                            });
        //iasufr.enableRowselectMode(gD);
    }  // InitTable()

    // фильтр слева
    var idOrg=0;   if (selOrg) idOrg=selOrg.id;
    
    var json={idOrg:idOrg};
    iasufr.ajax({
        url:'fin.Dog.cls',
        data:{func:'DogFilter', json: JSON.stringify(json) },
        success: function (data) {
            var jso=JSON.parse(data);
            form = main.cells("a").attachForm(jso);
            form.forEachItem(function(id){ if (id.indexOf('z')!=-1) form.hideItem(id); });
            form.setItemValue('idOrg',orgName);
            //$(form.getInput("op777")).attr('title',"555");
			
			if (!admin) form.setNote("idOrg", { text:"(можна вибрати органiз.,з якою є договори)" , width:300 });  // є
            //form.setItemToolTip("idOrg", "Please select a project.");
            TitleWrite();
            /* myPop = new dhtmlXPopup({ form: form, id: ["idOrg","idOrgK","idOrgP"] });
             form.attachEvent("onFocus", function(id,value){return
             itemId = id+value||"";
             //if (typeof(value) != "undefined") id=[id,value]; // for radiobutton
             var name=form.getItemValue(id);
             myPop.attachHTML('<br>'+name+'<br>&nbsp;');
             myPop.show(id);
             });

             form.attachEvent("onBlur", function(id,value){ return
             window.setTimeout(function(){ myPop.hide(id);
             //if ((id+value||"") == itemId) myPop.hide();
             },1);
             });
             */
            form.attachEvent("onChange", function(name, value, is_checked) {
                if (name=="Grup") { SelTable(); return}
                var t;
                if (name=="L1") t="zo";
                if (name=="L2") t="zk";
                if (name=="L3") t="zp";

                form.forEachItem(function(id){
                    if (is_checked) {if (id.indexOf(t)!=-1) form.showItem(id);  }
                    else            {if (id.indexOf(t)!=-1) form.hideItem(id); }
                });
                if (name=="L3") form.setItemFocus('opYear');
            });
			$(form.base[0]).find(".block_dhxform_item_label_top").css("display","inline");
			$(form.base[0]).find(".dhxform_base_nested.in_block").css("display","inline");
			
            var pDog=1; if (iasufr.pGrp(1)) pDog=0;  //pDog=1 - показать тодько огранич.список организаций для выбора
            iasufr.attachSelector(form.getInput("idOrg"), "OrgSelector",  { pDog:pDog,  onSelect: OrgSelect});
            iasufr.attachSelector(form.getInput("idOrgK"), "OrgSelector",  { onSelect: OrgSelectK});
            iasufr.attachSelector(form.getInput("idOrgP"), "OrgSelector",  { onSelect: OrgSelectP});
            iasufr.attachSelector(form.getInput("Grp"), "DogGrp", {onSelect: GrpSelect, idOrg:selOrg.id, orgName:orgName} );

            //form.attachEvent("onChange", function (id, value){ if ((id=='idKP')||(id=='Frm')) SelTable();  });
            //$(form.getInput("Kosht")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("Kosht")).blur()  });

            SelTable();
            mainB.setText(' ');
            StanAkt();
        }
    });  // ajax
    function OrgSelect(o, $txt)   { selOrg = o;
                                    if ( o ) { orgName="(" + o.code + ") " + o.name;
                                                            $txt.val(orgName);
                                        //if  ( (dost) && (!admin)  && (selOrg.id != idOrgUser) )   toolbar.disableItem("new");
                                        //else  toolbar.enableItem("new");
                                        form.setItemValue("Grp",""); selGrp=null;  selGrp = {};
                                        iasufr.updateSelectorParam(form.getInput("Grp"), { idOrg:selOrg.id, orgName:orgName } );

                                    }
        SelTable(); TitleWrite(); StanAkt();
    }
    function OrgSelectK(o, $txt)   { selOrgK = o;    if ( o ) $txt.val("(" + o.code + ") " + o.name);
        TitleWrite()  }
    function OrgSelectP(o, $txt)   { selOrgP = o;    if ( o ) $txt.val("(" + o.code + ") " + o.name);
        TitleWrite() }
    function GrpSelect(o, $txt)  { selGrp = o;   $txt.val(o.name);  }

    function TitleWrite() {
        var data  = [selOrg,selOrgK,selOrgP];
        var data1 = ['idOrg','idOrgK','idOrgP'];
        var title;
        for (var a in data1) {
            title="";  if (data[a]) title=data[a].name;
            $(form.getInput(data1[a])).attr('title',title);
        }
    }
    function StanAkt() {
        var idOrg=0;   if (selOrg) idOrg=selOrg.id;
        iasufr.ajax({
            url:'fin.Dog.cls',
            data:{func:'GetSprStan', json: JSON.stringify( {idOrg:idOrg} ) },
            success: function (data) {
                var jso=JSON.parse(data);
                var objAkt=form.getSelect('op7');
                var objDog=form.getSelect('op77');
                var dl=objAkt.options.length;
                if (dl>0)   for (var i = 1; i < dl; i++)  {  objAkt.options.remove(1); objDog.options.remove(1);   }
                var dls=jso.stan.length;
                for ( i = 0; i < dls; i++)  { objAkt.options.add( new Option(jso.stan[i][1] , jso.stan[i][0]) );
                                              objDog.options.add( new Option(jso.stan[i][1] , jso.stan[i][0]) );
                }
                //(obj.options.length);
            }
        });

        /*
        var w = 0;
        var ind = -1;
        while (w < sa.options.length) {
            if (k[sa.options[w].value]) {
                sb.options.add(new Option(sa.options[w].text,sa.options[w].value));
                sa.options.remove(w);
                ind = w;
            } else {
                w++;
            }
        }
        */

    }
    // таблица в правой части - перечень договоров
    function SelTable() {
        if (pSelTable) return;
        pSelTable=1;
        gD.clearAll();
        mainB.progressOn();

        var dateN=iasufr.formatDateStr(form.getCalendar("Date").getDate(true));
        var dateK=iasufr.formatDateStr(form.getCalendar("DateK").getDate(true));
        var idOrg="";  if (selOrg) idOrg=selOrg.id;
        var idOrgK=""; if (selOrgK) idOrgK=selOrgK.id;
        var idOrgP=""; if (selOrgP) idOrgP=selOrgP.id;
        var idGrp=""; if (selGrp) idGrp=selGrp.id;
        
        var zo=""; var zk=""; var zp=""; var zd="";
        form.forEachItem(function(id){
            if (id.indexOf('zo')!=-1) { if ((form.isItemChecked(id)) && (form.getItemValue('L1')))  zo+=form.getItemValue(id)+',';  }
            if (id.indexOf('zk')!=-1) { if ((form.isItemChecked(id)) && (form.getItemValue('L2')))  zk+=form.getItemValue(id)+',';  }
            if (id.indexOf('op')!=-1) { if ( form.getItemValue('L3') )  { if ( (id!='op10') && (id!='op11') && (id!='op12') && (id!='op13') && (id!='op77') && (id!='op777') ) {
                                                                               if ( (form.getItemType(id)=='select')||(form.getItemType(id)=='input') ) zp+=form.getItemValue(id)+',';
                                                                               else { if (form.isItemChecked(id)) zp+=form.getItemValue(id)+',';   }
                                                                          }
                                                                           if (id=='op77')  zd+=form.getItemValue(id)+',';  //стан договору
                                                                           if (id=='op777') {  //показать весь список состояний по договору
                                                                               var p777=0; if (form.isItemChecked("op777")) p777=1;
                                                                               zd+=p777+',';
                                                                           }
                                                                        }
                                      }
        });
        var dtOplN=""; var dtOplK="";
        var dtIspN=""; var dtIspK="";
        if (form.isItemChecked('L3')) { dtOplN=iasufr.formatDateStr(form.getCalendar("op10").getDate(true));
                                        dtOplK=iasufr.formatDateStr(form.getCalendar("op11").getDate(true));
                                        if (admin) {
                                            dtIspN=iasufr.formatDateStr(form.getCalendar("op12").getDate(true));
                                            dtIspK=iasufr.formatDateStr(form.getCalendar("op13").getDate(true));
                                        }
        }
        var speak=0; if (form.isItemChecked('Speak')) speak=1;
        var json={idOrg:idOrg, idOrgK:idOrgK, idOrgP:idOrgP, Real:form.getItemValue('Real'), Kosht:form.getItemValue('Kosht'), DateN:dateN, DateK:dateK, ZO:zo, ZK:zk, ZP:zp, ZD:zd, dtOplN:dtOplN, dtOplK:dtOplK, dtIspN:dtIspN, dtIspK:dtIspK, speak:speak, idGrp:idGrp};
        iasufr.ajax({
            url:'fin.Dog.cls',
            data:{func:'DogSel', json: JSON.stringify(json) },
            success: function (data) {
                var p   = JSON.parse(data);
                var jso = p.table;

                //gD.enableAutoHiddenColumnsSaving("gD");
                //gD.loadHiddenColumnsFromCookie("gD");
                //gD.enableAutoSizeSaving("gD");
                //gD.enableAutoSaving();
                ///gD.loadSizeFromCookie("gD");

                var dl=p.sizes.length; var ids,wid,ind,vis;

                for ( i = 0; i < dl; i++)  {  ids=p.sizes[i][0]; wid=p.sizes[i][1];
                    ind=gD.getColIndexById(ids);
                    if (wid>0) gD.setColWidth(ind,wid);
                    vis=p.visibl[i][1];
                    if (vis==0) gD.setColumnHidden(ind,true);
                    if (vis==1) gD.setColumnHidden(ind,false);
                }


                gD.parse(jso,'json');

                //gD.sortRows(2);
                /*/------------------------------------
                var arr1 = [1, 5 , 6 , 10 , 12, 14];
                for (var a in arr1) gD.setColumnHidden(arr1[a],true);

                var arr2 = [ 9,13];
                var arr3 = [ 15,16];

                if ( !form.isItemChecked("L3") )  { for (var a in arr3) gD.setColumnHidden(arr3[a],true);
                                                    for (var a in arr2) gD.setColumnHidden(arr2[a],false);
                }
                else                              { for (var a in arr3) gD.setColumnHidden(arr3[a],false);
                                                    for (var a in arr2) gD.setColumnHidden(arr2[a],true);
                }
                */
                //var arr1 = [1,2,3,4];
                var arr = ["tip", "stan", "obl", "city"];
                var pGrup=0;

                //for (var a in arr1) { if (form.isItemChecked("Grup", arr1[a])) { gD.groupBy(arr2[a]); pGrup=1;}  }
                //if (form.isItemChecked("Grup", 3))  gD.collapseAllGroups();
                var ind;
                if (form.getItemValue('Grup') != 5) { for (var a in arr) {  ind=gD.getColIndexById(arr[a]);
                                                                            if (form.getItemValue('Grup')== arr[a]) { gD.groupBy(ind); pGrup=1; }
                                                                          }
                                                      gD.collapseAllGroups();
                }
                else   gD.collapseAllGroups();
                iasufr.gridRowFocusApply(gD);
                //if (!form.isItemChecked("Speak")) gD.setColumnHidden(gD.getColIndexById("speak",true));
                //--------------------------------------------
                if ((gD.getRowsNum() > 0) && (pHeader == 0)) {
                                      // 0            1            2             3             4            5              6              7            8           9           10              11          12            13           14             15             16           17           18          19         20            21
                    gD.attachHeader("#text_filter,#text_filter,#select_filter,#text_filter,#text_filter,#text_filter,#select_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#select_filter,#text_filter,#select_filter,#select_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
                    pHeader = 1;
                }
                if  (gD.getRowsNum() == 0) { gD.detachHeader(1);  pHeader = 0;   }
                gD.setSizes();
                //--------------------------------------------
                
                var cnt = gD.getRowsNum(); var i;
                if (pHeader==1) { for (i = 0; i < gD.getColumnsNum(); i++) $(gD.getFilterElement(i)).val("");  }
                if (cnt>0) { for (i = 0; i < cnt; i++) {
                    //var idr=gK.getRowId(i);
                    if (!pGrup) { gD.cells2(i, 0).setValue("<a href='#'>"+gD.cells2(i, 0).getValue()+"</a>");
                                  $(gD.cells2(i, 0).cell).click(onCellClick);
                    }
                }}
                mainB.progressOff();
                CntSum();
                mainB.setText(cntOrg + gD.getRowsNum() +' '+cntSumT  + SumI.sumD1 +' '+cntSumTO + SumI.sumO1 );
                $("#sumD").html(SumI.sumD+'<br>&nbsp;');
                $("#sumA").html(SumI.sumA+'<br>&nbsp;');
                var ras=SumI.sumA-SumI.sumO;
                ras='<br><span style="color:#cc0000">' + ras.toFixed(2) + '</span>';
                $("#sumO").html(SumI.sumO + ras );
            }
        });
        pSelTable=0;
    }  // SelTable()


    function onCellClick(e){
        //var ind=$(e.currentTarget).parent().index()-1;
        window.setTimeout( function(){
            var ind=$(e.currentTarget).parent().index()-1;
            var idRow=gD.cells2(ind, cellNumDog).getValue();
            
            iasufr.loadForm("DogEdit", {onSave: SelTable, width: 1200, height: bodyhei, idOrg:selOrg.id, idDog:idRow, orgName:orgName });
        }, 1);
        pSelTable=0;
    }


    function SaveTable(){
       //gD.isColumnHidden(3);
        var sizes="";
        for (var c=0; c<gD.getColumnCount(); c++){  sizes+= gD.getColumnId(c) + '^' + gD.getColWidth(c)+';';    }
        iasufr.ajax({
            url:'fin.DogOrg.cls',
            data:{func:'SaveUserTable', json: JSON.stringify( {Sizes:sizes} ) },
            success: function (data) { iasufr.messageSuccess("Збережено !");
            }
        })
    }
    return t;
};

//@ sourceURL=http://12-monu03.donnu.edu.ua:57772/fin/Dog.js


