/**
 * Created by Anton on 17.02.14.
 */
if (!window["ChangePass"]) ChangePass = {};
if (!ChangePass.Form) ChangePass.Form = {};

ChangePass.Form.Create = function(opt) {
    var t = iasufr.initForm(this, opt)
    t.onChange = opt.onChange;
    t.id = opt.id;
    t.login = "";
    if (opt.login) t.login = opt.login;

    if (!t.id && !t.login) {
        dhtmlx.alert("Не вказан id користувача.");
        iasufr.close(t);
        return;
    }
    var formData = [
        {
            type: "settings",
            position: "label-top",
            labelWidth: 100,
            inputWidth: 100,
            offsetTop: 4
        },
        {
            type: "password",
            label: "Новий пароль",
            required: true,
            validate: CheckPass,
            name: "pass1",
            offsetLeft: 60
        },
        {
            type: "password",
            label: "Новий пароль",
            required: true,
            name: "pass2",
            offsetLeft: 60
        },
        {
            type: "button",
            value: "Змiнити пароль",
            name: "ok",
            offsetLeft: 40
        }


    ];
    var form = t.owner.attachForm(formData);
    form.attachEvent("onButtonClick", DoChangePass);
    t.owner.denyPark();
    t.owner.denyResize();
    t.owner.setModal(true);

    form.attachEvent("onEnter", function() {
        if ($(form.getInput("pass2")).is(":focus")) { $(form.getInput("pass2")).blur(); DoChangePass(); return }
        if ($(form.getInput("pass1")).is(":focus")) $(form.getInput("pass2")).focus();
    });



    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function CheckPass(d) {
        var r = form.getItemValue("pass1") == form.getItemValue("pass2");
        if (!r) dhtmlx.alert("Пароль повинен совпадати!");
        return r;
    }

    function DoChangePass() {
        if (!form.validate()) return;

        iasufr.ajax({
            url: "ac.Usr.cls",
            data: {func: "ChangePass", id: t.id, login: t.login, pass: form.getItemValue("pass1") },
            success: function(){
                if (t.onChange) t.onChange();
                iasufr.close(t);
            },
            error: function(){if (t.owner.progressOn) t.owner.progressOff()}
        });

    }

    return this;
}
//@ sourceURL=ac/changePass.js