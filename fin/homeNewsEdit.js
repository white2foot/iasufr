if (!window.Fin) Fin = {};
if (!Fin.HomeNewsEdit) Fin.HomeNewsEdit = {};

Fin.HomeNewsEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idRow=t.opt.idRow;
    var idOrg=t.opt.idOrg;
    t.owner.setModal(true);
    t.owner.button("park").disable();

    var toolbar;
    var form;

    t.owner.progressOn();

    toolbar = t.owner.attachToolbar();
    InitToolBar();

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);

        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {

            if (id == 'save')  {  Save() }
            if (id == 'close') {iasufr.close(t);   }
        }); // onClick
    }

    LoadData();

   function LoadData() { 
         iasufr.ajax({url:'fin.Home.cls', data: {func: "HomeNewsEdit", json: JSON.stringify( {idRow:idRow, idOrg:idOrg} ) } ,
              success: function (data) {
                     var jso = JSON.parse(data);
                     var frm=jso.form;
                     form = t.owner.attachForm(frm);
                    //$(form.getInput("Text")).focus();
                     form.attachEvent("onChange", function (id, value){    iasufr.enableAskBeforClose(t);  });
                     cke();
                     t.owner.progressOff();
              }
         });
   }

    function cke() {
        /// form.getInput("Text")
        var idObj=form.getInput(form.getItemsList()[5]).id;
        window.CKEDITOR.replace(idObj, {
            toolbar : 'Basic',
            uiColor : '#b4cff4',
            language: 'uk',
            resize_enabled: false,
            width: "850px",
            height: "230px",
            enterMode : window.CKEDITOR.ENTER_BR,
            toolbar:[
                { name: 'actions', items: ['Undo', 'Redo'] },
                { name: 'basicstyles', items : [ 'FontSize', 'TextColor','BGColor', '-', 'Bold','Underline','Italic','-','Subscript','Superscript','Link','-','RemoveFormat' ] },
                { name: 'paragraph',   items : [ 'JustifyLeft','JustifyCenter','JustifyRight','-', 'NumberedList','BulletedList'] },
                { name: 'add', items: ['Table','HorizontalRule','PageBreak']},
                { name: 'add2', items: ['ShowBlocks','Maximize']},
                { name: 'src', items: ['Source']}]
        });

        CKEDITOR.instances[idObj].setData(form.getItemValue("Text"));
    }
  
    function Save() {
            if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
            var dateN=iasufr.formatDateStr(form.getCalendar("DateN").getDate(true));
            var dateK=iasufr.formatDateStr(form.getCalendar("DateK").getDate(true));
            if ((dateK > 0) && (dateK < dateN) ) { iasufr.message("Перевiрте перiод поазу новин !"); return; }

            t.owner.progressOn();
            var txt= window.CKEDITOR.instances[form.getInput(form.getItemsList()[5]).id].getData();
            if (txt == "") { iasufr.message("Наберiть текст новини !"); return; }

            var json = {idOrg: idOrg, idRow:idRow, DateN:dateN, DateK:dateK, Num:form.getItemValue("Num"), Url:form.getItemValue("Url"), Text:txt, Nazva:form.getItemValue("Nazva")};

            //var elements = document.getElementsByTagName('input');
            //var idd=elements[2].id;
            //var zn=window.CKEDITOR.instances[idd].getData();
            //alert('555='+zn);  return   //+'--'+elements[0].id +'---'+elements[1].id +'------'+elements[2].id+'---'+idd); return

            iasufr.ajax({
                url: "fin.Home.cls",
                data: {func: "HomeNewsSave", json: JSON.stringify(json)},
                success: onSuccess,
                error: function() {if (t.owner.progressOn) t.owner.progressOff(); }
            });
    }

        function onSuccess(data) { iasufr.disableAskBeforClose(t);
                                   t.owner.progressOff();
                                   iasufr.messageSuccess("Збережено !");
                                   if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список в таблице
                                   iasufr.close(t);                                    
        }
    $( document ).ready(function() {  return
        var idObj=$(form.getInput("Url"));  $('body input'); var idObj=inp[1];
        console.log(idObj);
        return
        var btn="<img src='/images/icons/16/group.png'>";  //.offset();
        $("<div id='d1'>555<div>").insertAfter(idObj);

        //$("<div id='d1'><div>").html(btn);

        var w=$( document ).width()-100;
        $("#d1").offset({left:300});
        $("#d1").offset({top:150});
    });

    return t;
};
