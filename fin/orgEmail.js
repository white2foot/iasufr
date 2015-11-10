                         // показ списка єлектронніх адресов организаций из справочника организаций (из списка на єкране)
if (!window.Fin) Fin = {};
if (!Fin.OrgEmail) Fin.OrgEmail = {};

Fin.OrgEmail.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var email=t.opt.Email;
    //toolbar = t.owner.attachToolbar();    //InitToolBar();

    var formData = [
        { type:"settings" , position:"label-top", labelWidth:300, inputWidth:630, offsetLeft:20  },
        { type:"input" ,   name:"em", label:"", value:email, rows:25 }
    ];
    var form = t.owner.attachForm(formData);
    return t;
};
//@ sourceURL=orgEmail.js