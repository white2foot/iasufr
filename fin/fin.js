fin = {

    setReadonly: function(form,pRead) {
        var type;
        form.forEachItem(function(name){
            type=form.getItemType(name);
            console.log(name+'---'+type);
            if ( ((type=='input')||(type=='calendar') ) && (pRead==0)) { form.disableItem(name); console.log(555);  }
            if ( (type=='input') && (pRead==1)) { if ( !form.isItemHidden(name) )  form.setReadonly(name, true); }

        });
    },

    initGridCont: function(gD,p) {

            gD.setImagePath(iasufr.const.IMG_PATH);
            gD.setHeader('N, Назва контакту, Змiст контакту, Коментар,Група,');
            gD.setInitWidths('10,150,250,350,200,*');
            gD.setColAlign('center,center,left,left,left,left');
            if (p==1) gD.setColTypes("ro,co,ed,ed,co,ed");
            if (p==0) gD.setColTypes("ro,ro,ro,ro,ro,ro");
            gD.setColSorting('int,str,str,str,str,str');
            gD.setColumnHidden(0,true);
            gD.init();


    }


};

