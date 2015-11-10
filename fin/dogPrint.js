// печать текста договора  ^Dog(idOrg,"D",idDog)

if (!window.Fin) Fin = {};
if (!Fin.DogPrint) Fin.DogPrint = {};

Fin.DogPrint.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    //var idOrgOsn = t.opt.idOrg;
    //var idGrp = t.opt.idGrp;
    //console.log(idGrp);
    var user=iasufr.user;
    dhtmlx.image_path = iasufr.const.IMG_PATH;

    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells("a").hideHeader();

    var form;
    var gD;
    var idOrgOsn;  // организ. ВИКОНАВЕЦЬ послуг
    var idGrup;
    var orgName;
    var idDog=0;
    var jsoData;
    var toolbar;
    var selOrg=null;  selOrg = {};
    var selOrgP=null; selOrgP = {};
    //----------------------------------------
    ToolB();
    LoadData(0,idDog);
    
    function ToolB() {
        toolbar = main.attachToolbar();
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("new", 1, "Новий договiр", "32/toolbar_add.png", "");
        toolbar.addSeparator("sep1", 2);
        toolbar.addButton("save", 2, "Зареєструвати договiр", "32/database_go.png", "");  //
        toolbar.addSeparator("sep11", 3);
        toolbar.disableItem("save");
        toolbar.addButton("print", 4, "Друк договору", "32/printer_empty.png", "");
        toolbar.addSeparator("sep2", 5);
        toolbar.addText("year", 8, "Рiк");
        var dt=iasufr.formatDate(new Date());
        var month=dt.substr(3,2);
        var rikValue=dt.substr(6,4);
        if (month>9) rikValue=rikValue*1 + 1;
        toolbar.addInput("rik", 10, rikValue,50);
        toolbar.addSeparator("sep2", 11);
        toolbar.addButton("help", 12, "Інструкція", "16/web_template_editor.png", "");
        toolbar.addSeparator("sep2", 13);
        toolbar.addButton("close", 14, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function(id){
            switch (id) {
                case "print": { //if (!form.validate()) { iasufr.message(" Перевiрте вiдмiченi строки !"); return }
                    var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
                    var dateK=iasufr.formatDateStr(form.getCalendar("DateK").getDate(true));
                    var rik=dateN.substr(0,4);
                    if (rik != toolbar.getValue("rik"))  {
                        iasufr.message(" Перiод договору не вiдповiдає вказанному року  ) !"); return
                    }
                    Print();
                    break;
                }
                case "new": {  if (form.getItemValue("regDog")==0) break;
                               selOrg.id=0; LoadData(1,0);  break;
                }
                case "save": {  iasufr.confirm('Зареєструвати у системi договiр ?', ZapSave);  break;
                }
                case "help": {  iasufr.loadForm("DogPrintHelp", { height:500, width:460});  break;
                }
                case "close":   iasufr.close(t);
            }
        });
    }   //------------------------ ToolB()

    function LoadData(pNew,idDog) {
       var idOrg=selOrg.id;
       var json={idOrg:idOrg,idDog:idDog, pNew:pNew};

       iasufr.ajax({
        url:'fin.Dog.cls',
        data:{func:'DogBeforePrint', json: JSON.stringify(json) },
        success: function (data) {
            var jso=JSON.parse(data);
            var frm=jso.form;
            form = main.cells("a").attachForm(frm);

            var obj=$( "div.dhxform_label_align_left:contains('корегуйте')" );
            obj.offset({left:200});
            obj.css( "color", "red" ); // css( "text-decoration", "underline" ).
            $( "input[name='Msg']" ).parent().css( "display", "none" );

            idOrg      = jso.idOrg;
            selOrg.id  = idOrg;
            selOrgP.id = jso.idOrgP;
            var mfo=jso.Mfo;
            form.setNote("Rah", { text: mfo, width:300 });
			form.setNote("regDog", { text:"/номер автоматично сформується при реєстрацii договору у системi/", width:400 });
            if (jso.pKor==0) { fin.setReadonly(form,1); fin.setReadonly(form,0); }
            if ( form.getItemValue("regDog") == 0 ) toolbar.enableItem("save");
            else toolbar.disableItem("save");

            idOrgOsn = jso.idOrgOsn;
            idGrup   = jso.idGrup;

            form.attachEvent("onChange", function(name, value, is_checked) {
                 if (name=="regDog") {  var idDog=form.getItemValue('regDog'); form.unload(); LoadData(0,idDog); }
                 return true
            });

                var id="";  if (!iasufr.pGrp(1)) { id=selOrg.id; form.setReadonly("idOrg", true);     }
                iasufr.attachSelector(form.getInput("idOrg"), "OrgSelector",  { idOrg: id, onSelect: OrgSelect});
                iasufr.attachSelector(form.getInput("idOrgP"), "OrgSelector",  { idOrg: id, onSelect: OrgSelectP});
                var idOrgP=0;   if (selOrgP) idOrgP=selOrgP.id;
                iasufr.attachSelector(form.getInput("Rah"), "OrgSelector", { width:1100,height:600,accountAdd:true,bankOnly:false, idOrg:idOrgP, onSelect: OrgSelectR} );


        }
       });  // ajax
    }

    function OrgSelect(o, $txt)   { selOrg = o;  if ( o ) { var orgName="(" + o.code + ") " + o.name;
                                                            $txt.val(orgName);
                                                            //form.unload();  LoadData(1,0);
                                                          }
    }

    function OrgSelectP(o, $txt)   { selOrgP = o;  if ( o ) { var orgName="(" + o.code + ") " + o.name;
                                                             $txt.val(orgName);    }
    }

    function OrgSelectR(o, $txt)  {
        if ( o ) {
                 iasufr.enableAskBeforClose(t);
                 form.setItemValue("Rah", o.account);
                 var mfo='МФО ' + o.mfo + ' ' + o.bank;
                 form.setNote("Rah", { text: mfo, width:300 });
        }
    }

    function getJso() { jsoData=null;
        var idOrg  = selOrg.id;
        var idOrgP = selOrgP.id;
        var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
        var dateK=iasufr.formatDateStr(form.getCalendar("DateK").getDate(true));
        jsoData = form.getFormData();
        jsoData = $.extend(jsoData, {idOrg:idOrg, idOrgP:idOrgP, DateN:dateN, DateK:dateK, idOrgOsn:idOrgOsn} );
        //jsoData = $.extend(jsoData, {DogNum:DogNum} );
        return jsoData
    }

    function Print() {
           if ( form.getItemValue("regDog") == 0 )  { ZapNo();
                 //iasufr.confirm('Договiр не зареєстрований у системi. Друкувати ?', ZapNo);

           }
           else  SaveBefPrint();
    }

    function ZapNo() { Zap(0);  }
    function ZapSave() { Zap(1);  }

    function SaveBefPrint() {
        jsoData=getJso();
        //alert(JSON.stringify(jsoData));
        iasufr.ajax({
            url:'fin.Dog.cls',
            data:{func:'SaveBeforePrint', json: JSON.stringify(jsoData) },
            success: function (data) {
                var p = JSON.parse(data);
                var idDog= p.Id;
                ToPrint1(idDog);
            }
        });
    }

    function ToPrint1(idDog) {
        jsoData=getJso();
        var pu = new PrintUtils();
        iasufr.ajax({url:'fin.Dog.cls', data: {func: "TextForPrint", json: JSON.stringify( {idOrgOsn:idOrgOsn, idDog:idDog, idOrg:selOrg.id, jsoData:jsoData}) }, success: function (data) {
            var jso = JSON.parse(data);
            var txt =jso.txt;
            iasufr.print( txt );
            t.owner.progressOff();
            if (idDog>0) { form.unload();  LoadData(1,idDog); }
        } });
    }

    function Zap(result) { if (result==null) result=1;
       var DogNum=form.getItemValue('DogNum');
        var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
       if ( (DogNum == '') && (result==1) ) {
         var idOrg  = selOrg.id;
         var json={ idOrg:idOrgOsn, idOrgK:idOrg, idGrp:idGrup, Date:dateN };
         iasufr.ajax({url:'fin.Dog.cls', data: {func: "getDogNum", json: JSON.stringify(json) },
         success:   function (data) {
                             jso=JSON.parse(data);
                             DogNum = jso.num;
                              //alert(DogNum+'---'+data);
                              form.setItemValue('DogNum',DogNum);
                             //jsoData = $.extend(jsoData, {DogNum:DogNum} );
                             SaveBefPrint();
                    }
         })
       }
        jsoData=getJso();
        jsoData = $.extend(jsoData, {DogNum:DogNum} );
        if ( (DogNum !='') && (result==1) )   SaveBefPrint();
        if (result==0)  ToPrint1(0);
    }


    return t;
};

//DogPrint.js


