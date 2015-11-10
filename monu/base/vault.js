

if (!window.base) base = {};
if (!base.Vault) base.Vault = {};

base.Vault.Create = function(opt) {
    var dhxLayout = new dhtmlXLayoutObject(opt.owner, "1C");

    var formData = [
        {type: "settings", labelWidth: 130, inputWidth: 170},
        {type: "input", label: "Full Name", value: "Kaapori Lumikaastra"},
        {type: "input", name:"Email",label: "Email", value: "kaapori.lumi@gmail.com"}

    ];
    var dhxLayoutT1= dhxLayout.cells("a").attachForm(formData);
    var t=dhxLayoutT1.getInput("Email")
    iasufr.attachSelector(t,"Selector1",{idDoc:"SummaryReports",idLayout:"T1",idRekv:"idTypeOrg",isMany:1})

};
//@
//@ sourceURL=http://base/vault.js




                
     