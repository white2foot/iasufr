dhtmlXVaultObject = function()
{
    this.isUploadFile = "false";
    this.isUploadFileAll = "false";
    this.countRows = null;
    this.totalRows = null;
    this.idRowSelected = null;
    this.sessionId = null;
    
    // variable title
    this.Title = null;
    
    // size
    this.Width = null;
    this.Height = null;
    
    // file type
    this.FileType = new Array();
    
    // ImagePath
    this.ImagePath = null; 
    
    // Maximum number of files
    this.MaxNumber = null;
    
    // Maximum size of file 1024 * 1024 * 5 = 5MB
    this.MaxSize = "5242880";
    
    // currentCount
    this.currentCount = 0;
    
    // UploadedCount
    this.UploadedCount = 0;

    // server handlers
    this.pathUploadHandler = null;
    this.pathGetInfoHandler = null;
    this.pathGetIdHandler = null;

    // demo
    this.isDemo = true;
    this.progressDemo = null;

    // from PHP
    this.MAX_FILE_SIZE = null;
    this.UPLOAD_IDENTIFIER = null;
    
    // upload information
    this.NBTUSSourceFileName = new Array();
    this.NBTUSUploadedTempURL = new Array();
    this.NBTUSUploadedTempFileName = new Array();
    this.NBTUSFileSize = new Array();
    this.NBTUSFileExtention = new Array();
    this.NBTUSFileDeleted = new Array();
    
    // after handler
    this.setOnUploadingEnd = function(){};
    this.setOnCleaningEnd = function(){};
    

    
    this.onXLE = null;
}

dhtmlXVaultObject.prototype.setServerHandlers = function(uploadHandler, getInfoHandler, getIdHandler)
{
    this.pathUploadHandler = uploadHandler;
    this.pathGetInfoHandler = getInfoHandler;
    this.pathGetIdHandler = getIdHandler;

}

dhtmlXVaultObject.prototype.setSize = function(Width,Height){this.Width = Width;this.Height = Height;}
dhtmlXVaultObject.prototype.setMaxNumber = function(MaxNumber){this.MaxNumber = MaxNumber;}
dhtmlXVaultObject.prototype.setMaxSize = function(MaxSize){this.MaxSize = MaxSize;}
dhtmlXVaultObject.prototype.setFileType = function(FileType){this.FileType = FileType;}
dhtmlXVaultObject.prototype.setImagePath = function(ImagePath){this.ImagePath = ImagePath;}

dhtmlXVaultObject.prototype.setAfterUpload = function(func){this.setOnUploadingEnd = func;}
dhtmlXVaultObject.prototype.setAfterClean = function(func){this.setOnCleaningEnd = func;}

dhtmlXVaultObject.prototype.getTitle = function(){return this.Title;}
dhtmlXVaultObject.prototype.getSourceFileName = function(id){if(this.NBTUSSourceFileName[id]){return this.NBTUSSourceFileName[id].value;}else{return false;}}
dhtmlXVaultObject.prototype.getUploadedTempURL = function(id){if(this.NBTUSUploadedTempURL[id]){return this.NBTUSUploadedTempURL[id].value;}else{return false;}}
dhtmlXVaultObject.prototype.getLastUploadedTempURL = function(){if(this.NBTUSUploadedTempURL[this.currentCount-1]){return this.NBTUSUploadedTempURL[this.currentCount-1].value;}else{return false;}}
dhtmlXVaultObject.prototype.getUploadedTempFileName = function(id){if(this.NBTUSUploadedTempFileName[id]){return this.NBTUSUploadedTempFileName[id].value;}else{return false}}
dhtmlXVaultObject.prototype.getLastUploadedTempFileName = function(){if(this.NBTUSUploadedTempFileName[this.currentCount-1]){return this.NBTUSUploadedTempFileName[this.currentCount-1].value;}else{return false;}}
dhtmlXVaultObject.prototype.getFileSize = function(id){if(this.NBTUSFileSize[id]){return this.NBTUSFileSize[id].value;}else{return false}}
dhtmlXVaultObject.prototype.getFileExtention = function(id){if(this.NBTUSFileExtention[id]){return this.NBTUSFileExtention[id].value;}else{return false}}
dhtmlXVaultObject.prototype.getTotalRows = function(){return this.totalRows;}
dhtmlXVaultObject.prototype.getUploadedCount = function(){return this.UploadedCount;}


dhtmlXVaultObject.prototype.getParsedMaxSize = function(){
    var sizes = new Array('B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');  
    var tempMaxSize = this.MaxSize;
    for(var i=0; tempMaxSize >= 1024 && i < sizes.length - 1; i++) tempMaxSize /= 1024; 
    return Math.round(tempMaxSize)+sizes[i]; 
}

dhtmlXVaultObject.prototype.create = function(htmlObject,Title,showCleanBtn)
{
	if ( typeof( showCleanBtn ) == "undefined" ) showCleanBtn = true;
    this.parentObject = document.getElementById(htmlObject);
    this.Title = Title;

    this.parentObject.style.position = "relative";
    this.parentObject.innerHTML = "<iframe src='about:blank' id='dhtmlxVaultUploadFrame_"+this.Title+"' name='dhtmlxVaultUploadFrame_"+this.Title+"' style='display:none'></iframe>";

    this.containerDiv = document.createElement("div");
    this.containerDiv.style.cssText = "position:absolute;overflow-y:auto;height:"+(this.Height-10)+"px;background-color:#FFFFFF;border:1px solid #878E95;top:10px;left:10px;z-index:10;width:"+(this.Width-10)+"px";
    this.parentObject.appendChild(this.containerDiv);

    this.container = document.createElement("div");
    this.container.style.position = "relative";

    var str = "<table style='background-color:#EDEEEF;border: 1px solid #7A7C80;' border='0'>" +
              "<tr><td style='width:"+this.Width+"px' colspan=3 align='center' id = 'cellContainer' >" +
              "<div style='height:"+this.Height+"px;'></div>" +
              "</td></tr>" +
              "<tr><td style='width: 84px; height: 32px;' align='left'></td>" +
              "<td style='height: 32px;' align='left'>" +
              "<img _onclick='UploadControl.prototype.uploadAllItems()' _ID='ImageButton3'  src='"+this.ImagePath+"btn_upload.gif' style='cursor:pointer' width='0'/></td>" +
			  "<td style='height: 32px;' align='right'>" ;
if ( showCleanBtn ) {
			  str+=               "<img _onclick='return UploadControl.prototype.removeAllItems()' _ID='ImageButton3'  "+
				"src='"+this.ImagePath+"/btn_clean.gif'" +
			  "style='cursor:pointer;margin-right:20px' width='0'/>";
}
			  str+= "</td></tr></table>" +
			  "<div _id='fileContainer' style='width:84px;overflow:hidden;height:32px;left:0px;direction:rtl;position:absolute;top:"+(this.Height+11)+"px'>" +
              "<img style='z-index:2' src='"+this.ImagePath+"/btn_add.gif'/>" +
              "<input type='file' id='file1'  name='file1' value='' class='hidden' style='cursor:pointer;z-index:3;left:7px;position:absolute;height:25px;top:0px;width:80px;'/></div>";
// Fix for Opera browsers (change made by Rudy, Aug 26).
//              "<input type='file' id='file1'  name='file1' value='' class='hidden' style='cursor:pointer;z-index:3;left:7px;position:absolute;height:25px;top:0px;'/></div>";

    this.container.innerHTML = str;

    var self = this;
    this.container.childNodes[0].rows[1].cells[1].childNodes[0].onclick = function() {
        self.uploadAllItems()
    };
if ( showCleanBtn ) {
    this.container.childNodes[0].rows[1].cells[2].childNodes[0].onclick = function() {
        self.removeAllItems()
    };
}

	this.fileContainer = this.container.childNodes[1];
    this.fileContainer.childNodes[1].onchange = function() {
        self.addFile()
    };

    this.uploadForm = document.createElement("form");

    this.uploadForm.method = "post";
    this.uploadForm.encoding = "multipart/form-data";
    this.uploadForm.target = "dhtmlxVaultUploadFrame_"+this.Title;
	this.uploadForm.name = "dhtmlXVaultForm";							/* Added to allow Firefox to get the form elements when nested in another form (Rudy Bartel, Oct 28, 2008) */
    this.container.appendChild(this.uploadForm);

    //from PHP
    //this.MAX_FILE_SIZE = document.createElement("input");
    //this.MAX_FILE_SIZE.type = "hidden";
    //this.MAX_FILE_SIZE.name = "MAX_FILE_SIZE";
    //this.MAX_FILE_SIZE.value = '200000000';
    //this.uploadForm.appendChild(this.MAX_FILE_SIZE);

    //this.UPLOAD_IDENTIFIER = document.createElement("input");
    //this.UPLOAD_IDENTIFIER.type = "hidden";
    //this.UPLOAD_IDENTIFIER.name = "UPLOAD_IDENTIFIER";
    //this.uploadForm.appendChild(this.UPLOAD_IDENTIFIER);

    this.parentObject.appendChild(this.container);
    this.tblListFiles = null;

    this.currentFile = this.fileContainer.childNodes[1];
    
    

    //create percent panel
    this.percentPanel = this.createPercentPanel();
    this.containerDiv.appendChild(this.percentPanel);
    

    if(navigator.userAgent.indexOf('MSIE') > 0 && navigator.appVersion.indexOf('MSIE 7.') > 0){
        try{
            var fso = new ActiveXObject("Scripting.FileSystemObject");
            //create progress bar
            this.tblProgressBar = this.createProgressBar();
            this.isDemo = false;
        }
        catch(e){
            this.tblProgressBar = this.createProgressDemo(); 
            this.isDemo = true;
        }
    }else{
        //create progress bar
        this.tblProgressBar = this.createProgressBar();
    }


    //if demo
    /*
    if (this.isDemo)
    {
        this.tblProgressBar = this.createProgressDemo();
    }
    */

}

dhtmlXVaultObject.prototype.createXMLHttpRequest = function()
{
    var xmlHttp = null;
    if (window.ActiveXObject)
    {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    else if (window.XMLHttpRequest)
    {
        xmlHttp = new XMLHttpRequest();
    }
    return xmlHttp
}

//get file name
dhtmlXVaultObject.prototype.getFileName = function(path)
{
    var arr = path.split("\\");
    return arr[arr.length - 1];
}

//get file size
dhtmlXVaultObject.prototype.getFileSize2 = function(path){
    if(navigator.userAgent.indexOf('MSIE') > 0 && navigator.appVersion.indexOf('MSIE 7.') > 0){
        try{
            var fso = new ActiveXObject("Scripting.FileSystemObject");
            var f = fso.GetFile(path);
            var fileSize = f.size;
            f = fso = null;
        }
        catch(e){
            var obj = new Image();
            obj.dynsrc = path;
            var fileSize = obj.fileSize;
        }
    }else{
        var obj = new Image();
        obj.dynsrc = path;
        var fileSize = obj.fileSize;
    }
    return fileSize;
}

dhtmlXVaultObject.prototype.selectItemInExplorer = function(currentId)
{
    var currentRow = this.getCurrentRowListFiles(currentId);
    
    if (this.idRowSelected)
    {
        var row = this.getCurrentRowListFiles(this.idRowSelected);
        if (row)
        {
            if (row.id != currentRow.id)
            {
                currentRow.style.background = "#F3F3F3";
                this.idRowSelected = currentId;
                row.style.background = "#FFFFFF";
            }
            else
            {
                currentRow.style.background = "#FFFFFF";
                this.idRowSelected = "";
            }
        }
        else
        {
            currentRow.style.background = "#F3F3F3";
            this.idRowSelected = currentId;
        }

    } else
    {
        currentRow.style.background = "#F3F3F3";
        this.idRowSelected = currentId;
    }

}

dhtmlXVaultObject.prototype.selectItemInMozilla = function(currentId)
{
    
    var currentRow = this.getCurrentRowListFiles(currentId);

    if (this.idRowSelected)
    {
        var row = this.getCurrentRowListFiles(this.idRowSelected);
        if (row)
        {
            if (row.id != currentRow.id)
            {
                currentRow.style.background = "#F3F3F3";
                this.idRowSelected = currentId;
                row.style.background = "#FFFFFF";
            }
            else
            {
                currentRow.style.background = "#FFFFFF";
                this.idRowSelected = "";
            }
        }
        else
        {
            currentRow.style.background = "#F3F3F3";
            this.idRowSelected = currentId;
        }

    } else
    {
        currentRow.style.background = "#F3F3F3";
        this.idRowSelected = currentId;
    }

}

dhtmlXVaultObject.prototype.checkFileType = function(fileName){
    var Type = fileName.split(".");

    for(var i=0;i<this.FileType.length;i++){
        if(this.FileType[i] == Type[Type.length - 1].toLowerCase()){
            return true;
        }   
    }
    alert("This '"+fileName+"' file is not a valid type.");
    return false;
}

// add item in "upload control"
dhtmlXVaultObject.prototype.addFile = function()
{
    var file = this.currentFile;
    var fileName = this.getFileName(file.value);
    var imgFile = this.getImgFile(fileName);
    
    // check extention
    if(!this.checkFileType(fileName)) return false;
    
    var currentId = this.createId();  
    
    // check Limit
    if(!currentId) return false;    
    
    file.disabled = true;
    file.style.display = "block";
    this.uploadForm.appendChild(file);

    var newInputFile = document.createElement("input");
    newInputFile.type = "file";
    newInputFile.className = "hidden";
//    newInputFile.style.cssText = "cursor:pointer;z-index:3;left:7px;position:absolute;height:30px";
//  Fix for Opera browsers (change made by Rudy, Aug 26).
    newInputFile.style.cssText = "cursor:pointer;z-index:3;left:7px;position:absolute;height:30px;width:80px";
    newInputFile.id = "file" + (currentId + 1);
    newInputFile.name = "file" + (currentId + 1);

    this.currentFile = newInputFile;
    var self = this;
    newInputFile.onchange = function() {
        return self.addFile()
    };
    this.fileContainer.appendChild(newInputFile);
    

    //create table ListFiles
    var containerData = this.containerDiv;
    if (this.tblListFiles == null)
    {
        this.tblListFiles = this.createTblListFiles();
        containerData.appendChild(this.tblListFiles);
    }
    var rowListFiles = this.tblListFiles.insertRow(this.tblListFiles.rows.length);
    rowListFiles.setAttribute("fileItemId", currentId);
    rowListFiles.setAttribute("id", "rowListFiles" + currentId);
    rowListFiles.setAttribute("isUpload", "false");

    if (navigator.appName.indexOf("Explorer") != -1)
    {
        rowListFiles.onclick = function() {
            self.selectItemInExplorer(currentId)
        }

    } else
    {
        rowListFiles.onclick = function(event) {
            self.selectItemInMozilla(currentId)
        }
    }

    var cellListFiles = document.createElement("td");
    cellListFiles.align = "center";
    rowListFiles.appendChild(cellListFiles);


    //create table "content"
    var tblContent = document.createElement("table");
    cellListFiles.appendChild(tblContent);
    tblContent.style.cssText = ";border-bottom: 1px solid #E2E2E2;";
    tblContent.cellPadding = "0px";
    tblContent.cellSpacing = "0px";
    tblContent.border = "0px";
    tblContent.id = "tblContent" + currentId;

    var rowList = tblContent.insertRow(tblContent.rows.length);

    var cellList = document.createElement("td");
    cellList.rowSpan = 2;
    cellList.align = "center";
    if (navigator.appName.indexOf("Explorer") != -1)
    {
        var span = document.createElement("span");
        span.style.cssText = "width: 40px; height: 40px; display: inline-block; filter:progid:DXImageTransform.Microsoft.AlphaImageLoader (src='" + imgFile + " ')";
        cellList.appendChild(span);
    }
    else
    {
        cellList.innerHTML = "<img  src='" + imgFile + "'  />";
    }
    cellList.style.cssText = ";width:60px;";
    rowList.appendChild(cellList);

    //add name of file
    cellList = document.createElement("td");
    cellList.align = "left";
    cellList.vAlign = "bottom";
    cellList.style.cssText = ";width:300px;height:30px;";
    cellList.innerHTML = "<div style='overflow: hidden;height: 12px;'><div class='fileName' style='height: 12px;'>" + fileName + "</div></div> ";
    cellList.className = "filenName";
    rowList.appendChild(cellList);

    // add link Remove
    cellList = document.createElement("td");
    cellList.style.cssText = ";width:140px;height:30px";
    cellList.innerHTML = "<a href='#remove' class='link'>Remove</a>";
    cellList.firstChild.onclick = function() {
        self.removeItem(currentId)
    };
    cellList.vAlign = "bottom";
    cellList.align = "center";
    rowList.appendChild(cellList);
    rowList = tblContent.insertRow(tblContent.rows.length);

    //  progress bar
    cellList = document.createElement("td");
    cellList.align = "left";
    cellList.style.cssText = ";width:300px;height:30px;";
    //cellList.appendChild(tblProgressBar);
    rowList.appendChild(cellList);

    // add link Upload
    cellList = document.createElement("td");
    cellList.style.cssText = ";width:140px;height:30px;";
    cellList.innerHTML = "<a href='#upload' class='link'>Upload</a>";
    //cellList.innerHTML = "Upload";
    cellList.firstChild.onclick = function() {
        self.uploadFile(currentId)
    };
    cellList.vAlign = "middle";
    cellList.align = "center";
    rowList.appendChild(cellList);

}

//get image src
dhtmlXVaultObject.prototype.getImgFile = function(fileName)
{
    //-------------------------------------------
    var srcImgPic = this.ImagePath+"ico_image.png";
    var srcImgVideo = this.ImagePath+"ico_video.png";
    var srcImgSound = this.ImagePath+"ico_sound.png";
    var srcImgArchives = this.ImagePath+"ico_zip.png";
    var srcImgFile = this.ImagePath+"ico_file.png";

    var valueImgPic = "jpg,jpeg,gif,png,bmp,tiff";
    var valueImgVideo = "avi,mpg,mpeg,rm,move";
    var valueImgSound = "wav,mp3,ogg";
    var valueImgArchives = "zip,rar,tar,tgz,arj";
    //------------------------------------------


    var ext = "_";
    var ext0 = fileName.split(".");
    if (ext0.length > 1) ext = ext0[ext0.length - 1].toLowerCase();

    if (valueImgPic.indexOf(ext) != -1)
    {
        return srcImgPic;
    }

    if (valueImgVideo.indexOf(ext) != -1)
    {
        return srcImgVideo;
    }

    if (valueImgSound.indexOf(ext) != -1)
    {
        return srcImgSound;
    }

    if (valueImgArchives.indexOf(ext) != -1)
    {
        return srcImgArchives;
    }

    return srcImgFile;
}

//create id for item control
dhtmlXVaultObject.prototype.createId = function()
{
    if (!this.countRows) this.countRows = 0;
    if (!this.totalRows) this.totalRows = 0;
    
    if(this.MaxNumber && this.MaxNumber <= this.totalRows){
        alert("Maximum number of files is " + this.MaxNumber);
        return false;
    }
    this.countRows++;
    this.totalRows++;
    return this.countRows;
}

dhtmlXVaultObject.prototype.createTblListFiles = function()
{

    var tblListFiles = document.createElement("table");
    tblListFiles.id = "tblListFiles";
    tblListFiles.style.cssText = "background-color:#FFFFFF;";
    tblListFiles.cellPadding = "0";
    tblListFiles.cellSpacing = "0";
    tblListFiles.border = "0";

    return tblListFiles;
}

//remove current item in control
dhtmlXVaultObject.prototype.removeItem = function(id)
{
    this.getCurrentRowListFiles(id).parentNode.removeChild(this.getCurrentRowListFiles(id));

    this.totalRows--;
}

//remove all items in control
dhtmlXVaultObject.prototype.removeAllItems = function()
{
    if (this.isUploadFile == "false")
    {

        if (this.tblListFiles != null)
        {
            this.totalRows = 0;
            this.UploadedCount = 0;
            var count = this.tblListFiles.rows.length;
            if (count > 0)
            {
                for (var i = 0; i < count; i++)
                {
                    this.tblListFiles.deleteRow(0);
                }
            }
            if(this.currentCount > 0){
                for (var i =0; i < this.currentCount; i++){
                    // NBTUSFileDeleted
                    this.NBTUSFileDeleted[i] = document.getElementById(this.Title+"[FileDeleted]["+i+"]");
                    this.NBTUSFileDeleted[i].value = "yes";
                }
            }

        }
    }
    this.setOnCleaningEnd();
}

//upload all items
dhtmlXVaultObject.prototype.uploadAllItems = function()
{
    var flag = -1;

    if (this.tblListFiles != null)
    {
        if (this.tblListFiles.rows.length > 0)
        {
            for (var i = 0; i < this.tblListFiles.rows.length; i++)
            {

                if (this.tblListFiles.rows[i].attributes["isUpload"].value == "false")
                {
                    flag = i;
                    break;
                }

            }

            if (flag != -1)
            {
                this.isUploadFileAll = "true";
                var fileItemId = this.tblListFiles.rows[i].attributes["fileItemId"].value;
                this.uploadFile(fileItemId);
            }
            else
            {
                this.isUploadFileAll = "false";
            }

        }

    }
}

dhtmlXVaultObject.prototype.createProgressDemo = function ()
{
    var srcImgProgress = this.ImagePath+"pb_demoUload.gif";

    var tblProgress = document.createElement("table");
    tblProgress.cellPadding = "0";
    tblProgress.cellSpacing = "0";
    tblProgress.border = "0";
    tblProgress.style.cssText = "height:10px;width:153px;display:none;";
    tblProgress.id = "progress";

    var row = tblProgress.insertRow(tblProgress.rows.length);
    var cell1 = document.createElement("td");
    cell1.style.cssText = "font-size: 1px;border: 1px solid #A9AEB3;"
    cell1.innerHTML = "<img src=" + srcImgProgress + " style = 'width:150px;height:8px;'/>";
    row.appendChild(cell1);

    return tblProgress;

}

//creation progress bar panel
dhtmlXVaultObject.prototype.createProgressBar = function ()
{

    var srcImgProgress = this.ImagePath+"pb_back.gif";
    var srcImgEmpty = this.ImagePath+"pb_empty.gif";

    var tblProgress = document.createElement("table");
    tblProgress.cellPadding = "0";
    tblProgress.cellSpacing = "0";
    tblProgress.border = "0";
    tblProgress.style.cssText = "height:10px;width:153px;display:none;";
    tblProgress.id = "progress";

    var row = tblProgress.insertRow(tblProgress.rows.length);
    var cell1 = document.createElement("td");
    cell1.style.cssText = ";font-size: 1px;background-image: url(" + srcImgProgress + ");width:150px;height:10px;border: 1px solid #A9AEB3;";
    cell1.align = "right";

    var img = document.createElement("img");
    img.src = srcImgEmpty;
    img.style.width = "100%";
    img.style.height = "7px";
    cell1.appendChild(img);
    row.appendChild(cell1);

    return tblProgress;
}

//creation percent panel
dhtmlXVaultObject.prototype.createPercentPanel = function ()
{

    var percentCompleted = document.createElement("div");
    percentCompleted.style.cssText = "font-size:9px;height:8px;position:absolute;left:210px;width:20px;display:none;padding-top: 0px";
    percentCompleted.id = "percentCompletedValue";

    return percentCompleted;
}

dhtmlXVaultObject.prototype.endLoading = function (id)
{
    this.isUploadFile = "false";

    //if (!this.isDemo)
    //{
        this.tblProgressBar.style.display = "none";
        this.percentPanel.style.display = "none";
        this.container.appendChild(this.tblProgressBar);
        this.container.appendChild(this.percentPanel);
    //}
    //else
    //{
        //this.progressDemo.style.display = "none";
        //this.container.appendChild(this.progressDemo);
    //}
    this.getCurrentInputFile(id).parentNode.removeChild(this.getCurrentInputFile(id));

}

//receipt of id
dhtmlXVaultObject.prototype.startRequest = function(id,cnt)
{
   try
   {
    //debugger;
    var xmlHttp = this.createXMLHttpRequest();
        xmlHttp.open("GET", this.pathGetIdHandler, false);
        xmlHttp.send("a=0");
    
    if (xmlHttp.status == 200)
    {
		//alert( xmlHttp.responseText );
        if(!xmlHttp.responseText)
        {
          throw "error";

        }

        this.sessionId = xmlHttp.responseText;
        this.UPLOAD_IDENTIFIER = xmlHttp.responseText;

    }else
    {
        throw "error";

    }
   }
   catch(e)
   {
       throw e;
       return;
   }

}

                                      
dhtmlXVaultObject.prototype.sendIdSession = function (id)
{
//debugger;
try{
    var xmlHttp = this.createXMLHttpRequest();
        xmlHttp.open("GET", this.pathGetInfoHandler+encodeURIComponent("?sessionId="+this.sessionId+"&MaxSize="+this.MaxSize) , false);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        //xmlHttp.send("&sessionId="+this.sessionId+"&MaxSize="+this.MaxSize);
        xmlHttp.send("a=0");
        
        if (xmlHttp.status == 200)
        {
            if (xmlHttp.responseText)
            {
                //debugger;
//                alert(xmlHttp.responseText);
                var Text = xmlHttp.responseText.split("|:|");
                
                if(!this.isDemo){
                    var Percent = Math.round(Text[6] / this.getFileSize2(this.getCurrentInputFile(id).value) * 100);
                }
                
                if(isNaN(parseInt(Text[0])))
                {   
					alert( "Session error" );
                    throw "error";

                }
                
                if (parseInt(Text[0]) == 0)
                {
                    var self=this;
                    if(!this.isDemo)
                    {
                        //if(isNaN(Percent)) Percent = 50;
                        this.tblProgressBar.rows[0].cells[0].firstChild.style.width = 100 - Percent + "%";
                        this.percentPanel.innerHTML = Percent + "%";
                    }
                    try
                    {
                        window.setTimeout( function () {self.sendIdSession(id)} , 500);
                    }catch(e)
                    {

                    }
                } else if(parseInt(Text[0]) == 1){
                    alert("Maximum file size is "+this.getParsedMaxSize()+".");
                    throw "error";
                } else if(parseInt(Text[0]) == 2){
                    alert("The file extention is not allowed.");
                    throw "error";
                } else if(parseInt(Text[0]) == 3){
                    alert("Uploading file is failed.");
                    throw "error";
                } else if(parseInt(Text[0]) == 4){
                    alert("The name of file is error.");
                    throw "error";
                } else if (parseInt(Text[0]) == -1)
                {
                    this.endLoading(id);

                    var tblContent = this.getCurrentTblContent(id);
                    tblContent.rows[1].cells[0].innerHTML += "<font class='vault_text' >Done</font>";
                    tblContent.rows[1].cells[0].vAlign = "top";
                    
                    cnt = this.currentCount;
  
                    // SourceFileName
                    this.NBTUSSourceFileName[cnt] = document.createElement("input");
                    this.NBTUSSourceFileName[cnt].type = "hidden";
                    this.NBTUSSourceFileName[cnt].id = this.Title+"[SourceFileName]["+cnt+"]";
                    this.NBTUSSourceFileName[cnt].name = this.Title+"[SourceFileName]["+cnt+"]";
                    this.NBTUSSourceFileName[cnt].value = Text[1];
                    this.uploadForm.appendChild(this.NBTUSSourceFileName[cnt]); 
                    this.parentObject.appendChild(this.NBTUSSourceFileName[cnt]); 
                    
                    // UploadedTempURL
                    this.NBTUSUploadedTempURL[cnt] = document.createElement("input");
                    this.NBTUSUploadedTempURL[cnt].type = "hidden";
                    this.NBTUSUploadedTempURL[cnt].id = this.Title+"[UploadedTempURL]["+cnt+"]";
                    this.NBTUSUploadedTempURL[cnt].name = this.Title+"[UploadedTempURL]["+cnt+"]";
                    this.NBTUSUploadedTempURL[cnt].value = Text[2];
                    this.uploadForm.appendChild(this.NBTUSUploadedTempURL[cnt]); 
                    this.parentObject.appendChild(this.NBTUSUploadedTempURL[cnt]); 
                    
                    // UploadedTempFileName
                    this.NBTUSUploadedTempFileName[cnt] = document.createElement("input");
                    this.NBTUSUploadedTempFileName[cnt].type = "hidden";
                    this.NBTUSUploadedTempFileName[cnt].id = this.Title+"[UploadedTempFileName]["+cnt+"]";
                    this.NBTUSUploadedTempFileName[cnt].name = this.Title+"[UploadedTempFileName]["+cnt+"]";
                    this.NBTUSUploadedTempFileName[cnt].value = Text[3];
                    this.uploadForm.appendChild(this.NBTUSUploadedTempFileName[cnt]); 
                    this.parentObject.appendChild(this.NBTUSUploadedTempFileName[cnt]); 
                    
                    // FileSize
                    this.NBTUSFileSize[cnt] = document.createElement("input");
                    this.NBTUSFileSize[cnt].type = "hidden";
                    this.NBTUSFileSize[cnt].id = this.Title+"[FileSize]["+cnt+"]";
                    this.NBTUSFileSize[cnt].name = this.Title+"[FileSize]["+cnt+"]";
                    this.NBTUSFileSize[cnt].value = Text[4];
                    this.uploadForm.appendChild(this.NBTUSFileSize[cnt]); 
                    this.parentObject.appendChild(this.NBTUSFileSize[cnt]); 
                    
                    // FileExtention
                    this.NBTUSFileExtention[cnt] = document.createElement("input");
                    this.NBTUSFileExtention[cnt].type = "hidden";
                    this.NBTUSFileExtention[cnt].id = this.Title+"[FileExtention]["+cnt+"]";
                    this.NBTUSFileExtention[cnt].name = this.Title+"[FileExtention]["+cnt+"]";
                    this.NBTUSFileExtention[cnt].value = Text[5];
                    this.uploadForm.appendChild(this.NBTUSFileExtention[cnt]);   
                    this.parentObject.appendChild(this.NBTUSFileExtention[cnt]);   
                    
                    // NBTUSFileDeleted
                    this.NBTUSFileDeleted[cnt] = document.createElement("input");
                    this.NBTUSFileDeleted[cnt].type = "hidden";
                    this.NBTUSFileDeleted[cnt].id = this.Title+"[FileDeleted]["+cnt+"]";
                    this.NBTUSFileDeleted[cnt].name = this.Title+"[FileDeleted]["+cnt+"]";
                    this.NBTUSFileDeleted[cnt].value = "no";
                    this.uploadForm.appendChild(this.NBTUSFileDeleted[cnt]);
                    this.parentObject.appendChild(this.NBTUSFileDeleted[cnt]);

                    this.currentCount++;
                    this.UploadedCount++;
                    if (this.isUploadFileAll == "true")
                    {   
                        this.uploadAllItems();
                    }
                    this.setOnUploadingEnd();
                }
            }
        }else
        {
            throw "error";
        }
     }
     catch(e)
     {
          this.endLoading(id);
          this.isUploadFileAll = "false";
          var tblContent = this.getCurrentTblContent(id);
          tblContent.rows[1].cells[0].innerHTML += "<font class='vault_text' >SESSION ERROR</font>";
          tblContent.rows[1].cells[0].vAlign = "top";

         return;
     }

}

dhtmlXVaultObject.prototype.getCurrentRowListFiles = function(id)
{
    for (var i = 0; i < this.tblListFiles.rows.length; i++)
    {
        if (this.tblListFiles.rows[i].id == "rowListFiles" + id)
        {
            return this.tblListFiles.rows[i];
        }
    }
}

dhtmlXVaultObject.prototype.getCurrentTblContent = function(id)
{
    for (var i = 0; i < this.tblListFiles.rows.length; i++)
    {
        if (this.tblListFiles.rows[i].cells[0].firstChild.id == "tblContent" + id)
        {
            return this.tblListFiles.rows[i].cells[0].firstChild;
        }
    }
}

dhtmlXVaultObject.prototype.getCurrentInputFile = function(id)
{

    var collInputs = this.uploadForm.getElementsByTagName("input");
	for (var i = 0; i < collInputs.length; i++)
    {
        if (collInputs[i].id == "file" + id)
        {
            return collInputs[i];
        }
    }

}

dhtmlXVaultObject.prototype.uploadFile = function (id)
{
    //debugger;
    if ( this.isUploadFile == "false" )
    {
        //debugger;
        if (navigator.appName.indexOf("Explorer") != -1)
        {
               this.selectItemInExplorer(id);
        }else
        {
               this.selectItemInMozilla(id);
        }

        var tblContent = this.getCurrentTblContent(id);
            tblContent.rows[0].cells[2].removeChild(tblContent.rows[0].cells[2].firstChild)
            tblContent.rows[1].cells[1].removeChild(tblContent.rows[1].cells[1].firstChild)
            tblContent.parentNode.parentNode.attributes["isUpload"].value = "true";

        //
        this.isUploadFile = "true";

        //
        this.getCurrentInputFile(id).disabled = false;
        //debugger;
        //if(!this.isDemo)
        //{
            //show progress bar
            this.tblProgressBar.style.display = "inline";
            this.getCurrentRowListFiles(id).cells[0].firstChild.rows[1].cells[0].appendChild(this.tblProgressBar);

            //show percent panel
            this.percentPanel.style.display = "inline";
            this.getCurrentRowListFiles(id).cells[0].firstChild.rows[1].cells[0].appendChild(this.percentPanel);
        //}
        //else
        //{
            //this.progressDemo.style.display = "inline";
            //this.getCurrentRowListFiles(id).cells[0].firstChild.rows[1].cells[0].appendChild(this.progressDemo);
        //}

        try
        {

          //get id
            this.startRequest(id);

          //get info
            this.sendIdSession(id);

        }catch(e)
        {
           this.endLoading(id);
           this.isUploadFileAll = "false";
           var tblContent = this.getCurrentTblContent(id);
           tblContent.rows[1].cells[0].innerHTML += "<font class='vault_text' >UPLOAD ERROR</font>";
           tblContent.rows[1].cells[0].vAlign = "top";

           return;
        }

        this.uploadForm.action = this.pathUploadHandler + "?sessionId=" + this.sessionId + "&MaxSize="+this.MaxSize+"&fileName=" + this.getFileName(this.getCurrentInputFile(id).value)+"&userfile="+this.getCurrentInputFile(id).id;
        this.uploadForm.submit();
    }
}

