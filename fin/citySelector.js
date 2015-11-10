// ПОИСК по справочнику городов ^City("N")

if (!window.Fin) Fin = {};
if (!Fin.CitySelector) Fin.CitySelector = {};

Fin.CitySelector.Create = function (opt) {
    var _this = iasufr.initForm(this, opt);
    var mygrid = _this.owner.attachGrid();
    _this.owner.progressOn();
    
    iasufr.ajax({ url:'fin.Org.cls', data:{func:'GetCity', json: JSON.stringify({Street: 0})}, success: function (data) {
            mygrid.setHeader("Код , Наименование, Область");
            mygrid.attachHeader("#text_filter,#text_filter,#text_filter");
            mygrid.setInitWidths("30,200,*");
            mygrid.setColAlign("center,left,left");
            mygrid.setColTypes("ro,ro,ro");
            mygrid.setColSorting("str,str,str");
            mygrid.init();
            var jso=JSON.parse(data);
            mygrid.parse(jso,'json');
            mygrid.groupBy(2);
            $(mygrid.getFilterElement(1)).focus();
            _this.owner.progressOff();

          $(mygrid.entBox).css("cursor", "pointer");
          mygrid.enableRowsHover(true, "grid-row-hover");

            mygrid.attachEvent('onRowSelect', function (id)  {
            var code=mygrid.cells(mygrid.getSelectedId(),0).getValue();
            var name=mygrid.cells(mygrid.getSelectedId(),1).getValue();
            var obl=mygrid.cells(mygrid.getSelectedId(),2).getValue(); name=name+","+obl
            if (opt.onSelect) { opt.onSelect({id:code,code:code,name:name}); iasufr.close(_this); }
            });

        }
        });

    return _this;
};




                
     