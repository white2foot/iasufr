if (!window.Fin) Fin = {};
if (!Fin.SelTag) Fin.SelTag = {};

Fin.SelTag.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    //t.owner.setModal(true);
    //t.owner.button("park").disable();
    var main = new dhtmlXLayoutObject(t.owner, '1C');
    main.cells('a').hideHeader();
        var formData = [
            { type:"input", rows:28, name:"sel", inputWidth:470, offsetTop: 10  }
        ];
		
		gD = main.cells('a').attachGrid();
        gD.setImagePath(iasufr.const.IMG_PATH);
        gD.setHeader('Тег, Назва');
        gD.setInitWidths('150,*');
        gD.setColAlign('center,left');
        gD.setColTypes("ed,ro");
        gD.setColSorting('str,str');
        //gD.attachHeader("#rspan,#text_filter,#text_filter,#text_filter");

        gD.init();

		iasufr.ajax({
            url: "fin.Dog.cls",
            data: {func: "getTeg"  },
            success: function(d) {
			                       var jso = JSON.parse(d);
								   gD.parse(jso, 'json');
								   //form.setItemValue("sel",jso.tag);
		        }
        });

    return t;
};
