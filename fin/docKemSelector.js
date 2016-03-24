//  селектор - кем выдан документ ^Pers("VD")

if (!window.Fin) Fin = {};
if (!Fin.DocKemSelector) Fin.DocKemSelector = {};

Fin.DocKemSelector.Create = function (opt) {
    var _this = iasufr.initForm(this, opt);
    var mygrid = _this.owner.attachGrid();
    _this.owner.progressOn();
    
    iasufr.ajax({ url:'fin.Pers.cls', data:{func:'GetDocKem', json: JSON.stringify({Kem: 0})}, success: function (data) {
            mygrid.setHeader("Назва");
            mygrid.attachHeader("#text_filter");
            mygrid.setInitWidths("*");
            mygrid.setColAlign("left");
            mygrid.setColTypes("ro");
            mygrid.setColSorting("str");
            mygrid.init();
            var jso=JSON.parse(data);
            mygrid.parse(jso.table,'json');

            $(mygrid.getFilterElement(1)).focus();
            _this.owner.progressOff();

          $(mygrid.entBox).css("cursor", "pointer");
          mygrid.enableRowsHover(true, "grid-row-hover");

            mygrid.attachEvent('onRowSelect', function (id)  {
            var name=mygrid.cells(mygrid.getSelectedId(),0).getValue();

            if (opt.onSelect) { opt.onSelect({name:name}); iasufr.close(_this); }
            });

        }
        });

    return _this;
};




                
     