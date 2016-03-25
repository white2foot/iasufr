if (!window.Fin) Fin = {};
if (!Fin.OrgSelector) Fin.OrgSelector = {};
// ПОИСК по справочнику организаций ^Org("P")
Fin.OrgSelector.Create = function (opt) {
    var _this = iasufr.initForm(this, opt);
    if (_this.opt.ChangeOrg) { iasufr.close(_this); return _this;  }

    _this.owner.setModal(true);

	//----------------------	
    var pBNK=0;  if (_this.opt.bankOnly) { pBNK=1; }      // показать только банки
    var account=0; if (_this.opt.accountAdd) account=1;  //   показать  банковские реквизиты
    // codeAdd:true - добавить код мережi к наименованию организации
    var isType=0; //if (_this.opt.isType) isType=1;        //показать типы орг - сейчас типы указаны в списке для общего поиска ^Org("OB",ob,"SELH")
    var pDog=0;  if (_this.opt.pDog) { pDog=1; }      // показать только организацию пользователя и те, где эта организация явл. контрагентом в договорах ^Dog
    var idOrg=""; if (_this.opt.idOrg) idOrg=_this.opt.idOrg;
    var tip="";   if (_this.opt.Tip)   tip=_this.opt.Tip;
    var HomeCont=""; if (_this.opt.HomeCont) HomeCont=_this.opt.HomeCont;  // показать только те орган., у к-рых есть контактные данные ^Home("I",idOrg,"K"
    var HomeNews=""; if (_this.opt.HomeNews) HomeNews=_this.opt.HomeNews;  // показать только те орган., у к-рых есть новости           ^Home("I",idOrg,"N"
    var HomeComment=""; if (_this.opt.HomeComment) HomeComment=_this.opt.HomeComment;  // показать только те орган., у к-рых есть отзывы   ^Home("I",idOrg,"V"
    
    var json=$.extend( {accountAdd: account },{pBNK: pBNK, idOrg:idOrg, pDog:pDog, HomeCont: HomeCont, HomeNews: HomeNews , HomeComment: HomeComment } ,{isType: isType });
    json=$.extend( json, {pHelp:1, Tip:tip } );
	var json1={Par:'zag', pHelp:1, accountAdd: account,isType: isType };
	//--------------------------

		var main = new dhtmlXLayoutObject(_this.owner, '1C');
        main.cells('a').hideHeader();
		var toolbar;
        if (_this.opt.AddCode) { toolbar = main.attachToolbar();   InitToolBar();  }
		var mygrid;
		Load();
		
  function Load() {   
     _this.owner.progressOn();
     iasufr.ajax({ url:'fin.Org.cls', data:{func:'OrgSelTable', json: JSON.stringify(json1) }, success: function (data) {
        var t=JSON.parse(data);
        //var mygrid = _this.owner.attachGrid();
		mygrid = main.cells('a').attachGrid();
        var hdr= t.hdr;
        var wid= t.wd;
        var typ= t.tp;
        var al= t.align;
        var src= t.src;
        var sort= t.sort;
        var columnIds= t.columnIds;

        mygrid.setHeader(hdr);
        mygrid.attachHeader(src);
        mygrid.setInitWidths(wid);
        mygrid.setColAlign(al);
        mygrid.setColTypes(typ);
        mygrid.setColSorting(sort);
        mygrid.init();
        mygrid.setColumnHidden(0,true);
        mygrid.setColumnIds(columnIds);
        iasufr.enableRowselectMode(mygrid);

        json5=$.extend(json, {Par:'org'} );
        iasufr.ajax({ url:'fin.Org.cls', data:{func:'OrgSelTable', json: JSON.stringify(json5) },success: function (data) {
            var jso=JSON.parse(data);
            mygrid.parse(jso,'json');
            $(mygrid.getFilterElement(1)).focus();
            _this.owner.progressOff();
			if (_this.opt.AddCode) toolbar.enableItem("add");
            $(mygrid.entBox).css("cursor", "pointer");
            mygrid.enableRowsHover(true, "grid-row-hover");

            mygrid.attachEvent('onRowSelect', function (id)  {
                var idOrg=mygrid.cells(mygrid.getSelectedId(),0).getValue();
                var code=mygrid.cells(mygrid.getSelectedId(),1).getValue();
                var name=mygrid.cells(mygrid.getSelectedId(),2).getValue();
                account=""; var mfo=""; var bank="";
                
                if (_this.opt.accountAdd) { var indAcc=mygrid.getColIndexById("acc");
                    var indMfo=mygrid.getColIndexById("mfo");
                    var indBank=mygrid.getColIndexById("bank");
                    account=mygrid.cells(mygrid.getSelectedId(),indAcc).getValue();
                    mfo = mygrid.cells(mygrid.getSelectedId(),indMfo).getValue();
                    bank= mygrid.cells(mygrid.getSelectedId(),indBank).getValue();
                }

                if (_this.opt.codeAdd)  name="("+code+")"+name;
                if (opt.onSelect) opt.onSelect({id:idOrg, code:code, name:name, account:account, mfo:mfo, bank:bank});
                iasufr.close(_this);
            });

        }});
    }
    });  // ajax
	
   }
	
	
	  function InitToolBar() {
          toolbar.setIconsPath(iasufr.const.ICO_PATH);
          toolbar.setIconSize(32); 
          toolbar.addButton("add", 1, "Додати органiзацiю", "32/toolbar_add.png", "32/toolbar_add.png");
          //toolbar.addButton("close", 8, iasufr.lang.ui.close, "32/door.png", "");
		  toolbar.disableItem("add");
          toolbar.attachEvent("onClick", function (id) {
		    
            if (id == "add") {  iasufr.loadForm("OrgAddCode", {onSave: Reload, width: 580, height: 600, jsonSel:json});
            }
          });
	    }	  
	  
	   function Reload() { mygrid.clearAll(); 
	                       iasufr.ajax({ url:'fin.DogOrg.cls', data:{func:'getCode', json: JSON.stringify( {id:0} ) },success: function (data) {
                                         var jso=JSON.parse(data);
                                         var idOrg=jso.idOrg; 
										 json=$.extend( json, {idOrg:idOrg } );
										 Load();
						   }
						  }) 
       }
    return _this;
};




                
     