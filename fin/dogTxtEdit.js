if (!window.Fin) Fin = {};
if (!Fin.DogTxtEdit) Fin.DogTxtEdit = {};

Fin.DogTxtEdit.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    //t.owner.setModal(true);
    t.owner.button("park").disable();

    var idDog=t.opt.idDog;
    var idOrg=t.opt.idOrg;
    var jsonOpt = {idDog:idDog, idOrg:idOrg} ;

    var toolbar;
    var form;
    var idObj;

    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells("a").hideHeader();
    main.progressOn();
    toolbar = main.attachToolbar();
    InitToolBar();
    LoadData();

    function LoadData() {
        iasufr.ajax({url:'fin.DogOrg.cls', data: {func: "DogTxtEdit", json: JSON.stringify(jsonOpt) } ,
            success: function (data) {
                var jso = JSON.parse(data);
                form = main.cells("a").attachForm(jso);
                form.attachEvent("onChange", function (id, value){  iasufr.enableAskBeforClose(t);} );
                iasufr.disableAskBeforClose(t);
                Cke();
            }
        });
    }

    function Cke() {
        idObj=form.getInput(form.getItemsList()[2]).id;
        window.CKEDITOR.replace(idObj, {
            toolbar : 'Basic',
            uiColor : '#b4cff4',
            language: 'uk',
            resize_enabled: false,
            width: "770px",
            height: "430px",
            enterMode : window.CKEDITOR.ENTER_BR,
            toolbar:[
                { name: 'actions', items: ['Undo', 'Redo'] },
                { name: 'basicstyles', items : [ 'FontSize', 'TextColor','BGColor', '-', 'Bold','Underline','Italic','-','RemoveFormat' ] },
                { name: 'paragraph',   items : [ 'JustifyLeft','JustifyCenter','JustifyRight','-', 'NumberedList','BulletedList'] },
                { name: 'add', items: ['Table','HorizontalRule','PageBreak']},
                { name: 'add2', items: ['ShowBlocks','Maximize']},
                { name: 'src', items: ['Source']}]
        });

        CKEDITOR.instances[idObj].setData(form.getItemValue("Text"));
        main.progressOff();
    }

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "");
		toolbar.addButton("print", 2,iasufr.lang.ui.print , "32/printer_empty.png", "");
		toolbar.addButton("sel", 3,"Змiннi частини тексту" , "32/document_index.png", "");
		toolbar.addButton("del", 4, iasufr.lang.ui.delete, "32/toolbar_delete.png", "");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");

        toolbar.attachEvent("onClick", function (id) {
            if (id == 'save')  { Save()   }
			if (id == 'sel')   { iasufr.loadForm("SelTag", { width: 500, height: 650} );
                //SelTeg()
            }
            if (id == 'del')   { iasufr.confirm("Пiдтвердiть видалення тексту договору ", Del);   }
			if (id == 'print') { var pu = new PrintUtils();
			                     var text= window.CKEDITOR.instances[idObj].getData();
                                 iasufr.print( text );
			}
			
            if (id == 'close') iasufr.close(t);
        });
    }

    function SelTeg() {
        var w = iasufr.wins.createWindow("sel" + new Date().getTime().toString(), 0, 0, 500, 650);
        w.setText("Змiннi частини тексту");
        w.setModal(true);
        w.centerOnScreen();
        var formData = [
            { type:"input", rows:28, name:"sel", inputWidth:470, offsetTop: 10  }
        ];
		
		gD = w.attachGrid();
        gD.setImagePath(iasufr.const.IMG_PATH);
        gD.setHeader('Тег, Назва');
        gD.setInitWidths('150,*');
        gD.setColAlign('center,left');
        gD.setColTypes("ed,ro");
        gD.setColSorting('str,str');
        //gD.attachHeader("#rspan,#text_filter,#text_filter,#text_filter");

        gD.init();
        //var form = w.attachForm(formData);
		
		
		iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "getTeg"  },
            success: function(d) { //main.progressOff(); 
			                       var jso = JSON.parse(d);
								   gD.parse(jso, 'json');
								   //form.setItemValue("sel",jso.tag);
			
                }
        });
    }
	
    function Del() {
        iasufr.ajax({
            url: "fin.DogOrg.cls",
            data: {func: "DogTxtDel", json: JSON.stringify(jsonOpt) },
            success: function() { main.progressOff(); if (opt.onSave) opt.onSave();
                iasufr.disableAskBeforClose(t);
                iasufr.messageSuccess("Видалено !"); iasufr.close(t); }
        });
    }

    function Save() {
        if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
        main.progressOn();
        var text= window.CKEDITOR.instances[idObj].getData();
        var json = $.extend( jsonOpt, { Name:form.getItemValue("Name"), Text:text, Vid:form.getItemValue("Vid") } );

        iasufr.ajax({
            url: "fin.DogOrg.cls",
            data: {func: "DogTxtSave", json: JSON.stringify(json) },
            success: onSuccess,
            error: function() { if (main.progressOn) main.progressOff(); }
        });
    }

    function onSuccess(data) {
        var json=JSON.parse(data);
        iasufr.disableAskBeforClose(t);
        iasufr.messageSuccess("Збережено !");
        jsonOpt = {idDog:json.Id, idOrg:idOrg};
        Reload();
        if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список в таблице
        //iasufr.close(t);
    }

    function Reload() {
        form.unload(); form=null;
        LoadData();
        main.progressOff();
    }

    return t;
};
//dogTxtEdit.js