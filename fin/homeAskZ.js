if (!window.Fin) Fin = {};
if (!Fin.HomeAskZ) Fin.HomeAskZ = {};

Fin.HomeAskZ.Create = function (opt) {
    var t = iasufr.initForm(this, opt);
    var idOrg = iasufr.user.orgId;
    //console.log(idOrg);
    iasufr.loadForm("HomeAskEdit", { width: 700, height: 280, idOrg:idOrg, idRow:"0", addZ:"1"});

    return t;
};
