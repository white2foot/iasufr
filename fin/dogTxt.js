if (!window.Fin) Fin = {};
if (!Fin.DogTxt) Fin.DogTxt = {};

Fin.DogTxt.Create = function (opt) {
    Linear.Form.Create.apply(this, [opt]);
    var t = this.form;

    var gr = t.owner.detachObject();

    var layout = new dhtmlXLayoutObject(t.owner, "3L");
    // move grid to layout cell
    layout.cells("a").attachObject(gr[1]);
    layout.cells("a").vs["def"].grid = gr[0];

    layout.cells("a").hideHeader();
    layout.cells("b").hideHeader();
    layout.cells("c").hideHeader();

    layout.cells("a").setWidth(this.form.owner.offsetWidth * 0.3);
    layout.cells("b").setHeight(64);
    layout.cells("b").fixSize(false, true);

    //layout.cells("c").collapse();

    var dropName = "dropZone" + Date.parse(new Date()).toString();
    var viewerName = "viewr" + Date.parse(new Date()).toString();

    var viewSrc = "https://view.officeapps.live.com/op/view.aspx?src=";
    var html = "<iframe id='"+viewerName+"' src='' frameborder='0' style='width:100%;height:100%'></iframe>";
    layout.cells("c").attachHTMLString(html);
    var viewer = $("#"+viewerName);

    html = '<form action="/upload.php">'+
                  '<div class="dropZone" id="' + dropName +'">'+
                        'Для загрузки, перетащите файл сюда.'+
                  '</div>'+
                '</form>';


    layout.cells("b").attachHTMLString(html);

    var dropZone = $("#"+dropName);
    var maxFileSize = 5000000; // максимальный размер файла - 1 мб.
    if (typeof(window.FileReader) == 'undefined') {
        dropZone.text('Не поддерживается браузером!');
        dropZone.addClass('error');
    }
    dropZone[0].ondragover = function() {
        dropZone.addClass('hover');
        return false;
    };
    dropZone[0].ondragleave = function() {
        dropZone.removeClass('hover');
        return false;
    };
    dropZone[0].ondrop = function(event) {
        event.preventDefault();
        dropZone.removeClass('hover');
        dropZone.addClass('drop');

        var file = event.dataTransfer.files[0];

        if (file.size > maxFileSize) {
            dropZone.text('Файл слишком большой!');
            dropZone.addClass('error');
            return false;
        }

        /*var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', uploadProgress, false);
        xhr.onreadystatechange = stateChange;
        xhr.open('POST', '/upload.php');
        xhr.setRequestHeader('X-FILE-NAME', file.name);
        xhr.send(file);*/
    };

    function uploadProgress(event) {
        var percent = parseInt(event.loaded / event.total * 100);
        dropZone.text('Загрузка: ' + percent + '%');
    }

    function stateChange(event) {
        if (event.target.readyState == 4) {
            if (event.target.status == 200) {
                dropZone.text('Загрузка успешно завершена!');
            } else {
                dropZone.text('Произошла ошибка!');
                dropZone.addClass('error');
            }
        }
    }

    var g = this.grid;
    g.attachEvent("onRowSelect", function(id,ind){
        var fileName = g.cells(id, 2).getValue();
        if (!fileName) {
            viewer.attr("src", "");
            return;
        }
        viewer.attr("src", viewSrc + "http://monufr.com/Help/Dogovir/" + escape(fileName));
    });

};
//@ sourceURL=/fin/dogTxt.js