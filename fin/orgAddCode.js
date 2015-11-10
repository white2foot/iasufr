if (!window.Fin) Fin = {};
if (!Fin.OrgAddCode) Fin.OrgAddCode = {};

Fin.OrgAddCode.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idOrg=0;
	var idOrg1=0;
	//var jsonSel=t.opt.jsonSel;
	//alert(jsonSel);
	//t.owner.setModal(true);
    t.owner.button("park").disable();

    var toolbar;
    var form;
    var selCity={};
    var selStreet={};
    var selMfo={};
	var jso1;

    t.owner.progressOn();

    toolbar = t.owner.attachToolbar();
    InitToolBar();

    function InitToolBar() {
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);

        toolbar.addButton("save", 1, iasufr.lang.ui.save, "32/database_save.png", "32/database_save.png");
        toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");
        
		
        toolbar.attachEvent("onClick", function (id) {

            if (id == 'save')  {  Save() }
            if (id == 'close') {iasufr.close(t);   }
        }); // onClick
    }

    LoadData();

   function LoadData() { 
         iasufr.ajax({url:'fin.DogOrg.cls', data: {func: "OrgAddCode", json: JSON.stringify( {idOrg:0} ) } ,
             success: function (data) { 
			          
                      var jso = JSON.parse(data);
                      var frm  = jso.form;
					  form = t.owner.attachForm(frm);
					  //----------------
					  form.attachEvent("onChange", function (id, value){
                           iasufr.enableAskBeforClose(t);
                              if ( (id=='Okpo')&&(value!='') ) { 
							     iasufr.ajax({url:'fin.DogOrg.cls', data: {func: "OkpoCheck", json: JSON.stringify( {Okpo:value} ) },
                                      success: function (data) {
                                         jso=JSON.parse(data); 
                                         var name=jso.name;
									     var id=jso.idOrg;
									     if (id>0) { iasufr.alert('Такий код має органiзацiя: ' + name , ClearOkpo );  }
                                        }
                                   })
                               }
                        });
					   //-----------------
                          $(form.getInput("Okpo")).keydown(function(e){if (e.keyCode == 13) $(form.getInput("City")).focus()  });
                          iasufr.attachSelector(form.getInput("City"), "CitySelector", {ignoreReadonly:true, onSelect: CitySelect});
                          iasufr.attachSelector(form.getInput("Street"), "CityStreet", {ignoreReadonly:true, onSelect: StreetSelect});
                          iasufr.attachSelector(form.getInput("Mfo"), "OrgSelector", {ignoreReadonly:true, width:1200,height:600,codeAdd:false,accountAdd:true,bankOnly:true,onSelect: MfoSelect});
                          form.setNote("City", { text:'тут можна ввести тiльки iз довiдника' , width:400 });
                          form.setNote("CityT", { text:'тут можна ввести назву населенного пункту текстом,якщо немає у довiднику' , width:400 });
                          form.setNote("Street", { text:'тут можна ввести тiльки iз довiдника' , width:400 });
                          form.setNote("StreetT", { text:'тут можна ввести назву вулицi текстом,якщо немає у довiднику' , width:400 });
                          form.setNote("MfoT", { text:'тут можна ввести МФО банка,якщо немає у довiднику' , width:400 });
                          form.setNote("BankT", { text:'тут можна ввести назву банка текстом,якщо немає у довiднику' , width:400 });
                             form.attachEvent("onChange", function (id, value){
                                 if  (id=="Mfo")    selMfo.id = 0;
                                 if  (id=="Street") selStreet.id = 0;
                                 iasufr.enableAskBeforClose(t);
                             });
                          t.owner.progressOff();
			          $(form.getInput("Okpo")).focus();
			    }
         });
   }  // LoadData

	function ClearOkpo() { form.setItemValue("Okpo",""); $(form.getInput("Okpo")).focus(); }
	
    function CitySelect(o, $txt)  { selCity = o;  
                                	if (o) { $txt.val(o.name); iasufr.enableAskBeforClose(t); }
	}
    function StreetSelect(o, $txt){  selStreet.id = o[0]; $txt.val(o[1]+" "+o[2]); iasufr.enableAskBeforClose(t); }

    function MfoSelect(o, $txt) {
        selMfo = o;    if ( o ) $txt.val(o.mfo + " / " + o.name);
        iasufr.enableAskBeforClose(t);
    }

    function Save() {
            if (!form.validate()) { iasufr.message("Перевiрте вiдмiченi строки !"); return; }
            t.owner.progressOn();
            var city="";   if (selCity) city=selCity.id;
            var street=""; if (selStreet) street=selStreet.id;
            var idMfo="";  if (selMfo) idMfo=selMfo.id;
            var json = form.getFormData();
            json = $.extend(json, {City:city, Street:street, idMfo:idMfo} );
            iasufr.ajax({
                url: "fin.DogOrg.cls",
                data: {func: "OrgCodeSave", json: JSON.stringify(json)},
                success: onSuccess,
                error: function() {if (t.owner.progressOn) t.owner.progressOff(); }
            });
    }

        function onSuccess(data) { jso1 = JSON.parse(data);
                                   idOrg1  = jso1.Id; 
								   t.owner.progressOff();
                                   iasufr.messageSuccess("Збережено ! рег.N " + idOrg1);
								   iasufr.disableAskBeforClose(t);								   
								   if (opt.onSave) opt.onSave();  // ОБНОВИТЬ список в таблице организаций
                                   iasufr.close(t);                                    
        }
        function getId() {  return jso1.Id; }


    return t;
};
