
if (!window.base) base = {};
if (!base.Confirm) base.Confirm = {};

base.Confirm.Create = function(opt) {
    //1.1 инициализация параметров
    var _this = iasufr.initForm(this, opt);
    _this.title=opt.title;   if (_this.title) _this.owner.setText(_this.title);
    _this.mess=opt.mess;     if (!_this.mess)  _this.mess="";
    _this.onSelect=opt.onSelect;
    _this.param=opt.param;     if (!_this.param)  _this.param="";

    var dhxLayout;
    var dhxLayoutT1;

    dhxLayout = new dhtmlXLayoutObject(_this.owner, "1C");
    dhxLayout.cells("a").setWidth("*");
    dhxLayout.cells("a").hideHeader();

    dhxLayoutT1= dhxLayout.cells("a").attachForm(_this.mess);

    dhxLayoutT1.attachEvent("onChange", function(idRekv, value, is_checked) {
        if (_this.onSelect) {
            if (dhxLayoutT1.getItemType(idRekv)=='calendar') {value=iasufr.formatDateStr(dhxLayoutT1.getCalendar(idRekv).getDate(true));};

            $.extend(_this.param, JSON.parse('{"'+idRekv+'":"'+value+'"}'));
            _this.onSelect({param:_this.param});
            iasufr.close(_this); }
    });

};
//@ sourceURL=http://base/confirm.js





