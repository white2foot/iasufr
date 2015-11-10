// ПОИСК по справочнику городов ^City("N")

if (!window.Fin) Fin = {};
if (!Fin.StrettSelector) Fin.StreetSelector = {};

Fin.StreetSelector.Create = function (opt) {
    var _this = iasufr.initForm(this, opt);
    var mygrid = _this.owner.attachGrid();
    _this.owner.progressOn();
    iasufr.ajax({ url:'fin.Org.cls', data:{func:'GetCity', json: JSON.stringify({Street: 1})}, success: function (data) {
            mygrid.setHeader("Код , Наименование");
            mygrid.attachHeader("#text_filter,#text_filter");
            mygrid.setInitWidths("50,*");
            mygrid.setColAlign("center,left");
            mygrid.setColTypes("ro,ro");
            mygrid.setColSorting("str,str");
            mygrid.init();
            var jso=JSON.parse(data);
            mygrid.parse(jso,'json');
            $(mygrid.getFilterElement(1)).focus();
            _this.owner.progressOff();
           $(mygrid.entBox).css("cursor", "pointer");
            mygrid.enableRowsHover(true, "grid-row-hover");

        mygrid.attachEvent('onRowSelect', function (id)  {
            var code=mygrid.cells(mygrid.getSelectedId(),0).getValue();
            var name=mygrid.cells(mygrid.getSelectedId(),1).getValue();
            if (opt.onSelect) opt.onSelect({id:id,code:code,name:name});
            iasufr.close(_this);
            });

        }
        });

    return _this;
};




                
     