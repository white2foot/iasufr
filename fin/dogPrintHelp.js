                         // показ списка єлектронніх адресов организаций из справочника организаций (из списка на єкране)
if (!window.Fin) Fin = {};
if (!Fin.DogPrintHelp) Fin.DogPrintHelp = {};

Fin.DogPrintHelp.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var email=t.opt.Email;

    var formData = [
        { type:"settings" , position:"label-top", labelWidth:300, inputWidth:430, offsetLeft:5  },
        { type:"input" ,   name:"txt", label:"", value:"", rows:28, readonly:true }
    ];
    var json="";
    iasufr.ajax({
        url:'fin.DogOrg.cls',
        data:{func:'getDogHelp' },
        success: function (data) {
            var jso=JSON.parse(data);
            var txt=jso.Text;
            var form = t.owner.attachForm(formData);
            form.setItemValue('txt',txt)
        }
    })

    return t;
};
//@ sourceURL=dogPrintHelp.js