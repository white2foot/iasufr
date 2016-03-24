//  селектор - список пользователей ^Usr("K")

if (!window.Fin) Fin = {};
if (!Fin.UserSelector) Fin.UserSelector = {};

Fin.UserSelector.Create = function (opt) {
    var _this = iasufr.initForm(this, opt);
    var mygrid = _this.owner.attachGrid();
    _this.owner.progressOn();
    if (opt.multiSelect) InitToolBar();

    function InitToolBar() {
        var toolbar =  _this.owner.attachToolbar();
        toolbar.setIconsPath(iasufr.const.ICO_PATH);
        toolbar.setIconSize(32);
        toolbar.addButton("select", 1, iasufr.lang.ui.select, "32/tick.png", "");

        toolbar.attachEvent("onClick", function (id) {
            //var idGr=GetGrup(); if (id == 'add') idGr=0;
            //iasufr.gridRowFocus(gG, idGr);

             if (id == 'select') {
                 var check=[];
                 check = mygrid.getCheckedRows(0);
                 if (!check) { iasufr.message('Вкажiть строку !'); return; }

                     var rows = mygrid.getCheckedRows(0).split(",");
                     var res = []; var fio; var ff;
                     for (var r = 0; r < rows.length; r++) {
                         fio=mygrid.cells(rows[r], 1).getValue();
                         ff=fio.split(" "); fio=ff[0];
                         if (ff[1]) fio=fio+" "+ff[1].substr(0,1);
                         if (ff[2]) fio=fio+" "+ff[2].substr(0,1);
                         res.push( { id:rows[r], fio:fio } );
                         //res.push([]);
                         //for (var i = 1; i < 3; i++) {  // grid.getColumnsNum()
                         //    res[res.length - 1].push(mygrid.cells(rows[r], i).getValue());
                         //}
                     }
                     if (opt.onSelect) opt.onSelect(res);

                //var code=gG.getSelectedId();
                //opt.onSelect({id:code,name:name});
                iasufr.close(_this);
             }
        });
    }


    iasufr.ajax({ url:'fin.Pers.cls', data:{func:'UserSelector', json: JSON.stringify({admin: 1})}, success: function (data) {
            mygrid.setHeader("Вiдм.,П I Б, Органiзацiя, Посада");
            mygrid.attachHeader("#master_checkbox,#text_filter,#text_filter,#text_filter");
            mygrid.setInitWidths("30,200,400,*");
            mygrid.setColAlign("center,left,left,left");
            mygrid.setColTypes("ch,ro,ro,ro");
            mygrid.setColSorting("str,str,str,str");
            mygrid.init();
        if (!opt.multiSelect) mygrid.setColumnHidden(0,true);
            var jso=JSON.parse(data);
            mygrid.parse(jso.table,'json');

            $(mygrid.getFilterElement(1)).focus();
            _this.owner.progressOff();

          $(mygrid.entBox).css("cursor", "pointer");
          mygrid.enableRowsHover(true, "grid-row-hover");


        if (!opt.multiSelect) {
            mygrid.attachEvent('onRowSelect', function (id)  {
                var fio=mygrid.cells(mygrid.getSelectedId(),1).getValue();

                var orgName=mygrid.cells(mygrid.getSelectedId(),2).getValue();
                var posada=mygrid.cells(mygrid.getSelectedId(),3).getValue();
                if (opt.onSelect) { opt.onSelect({id:id, fio:fio, posada:posada, orgName:orgName}); iasufr.close(_this); }
            });
        }

        }
    });

    return _this;
};




                
     