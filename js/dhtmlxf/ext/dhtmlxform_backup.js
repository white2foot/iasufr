//v.3.6 build 131023

/*
Copyright DHTMLX LTD. http://www.dhtmlx.com
To use this component please contact sales@dhtmlx.com to obtain license
*/
dhtmlXForm.prototype.saveBackup = function() {
	if (!this._backup) {
		this._backup = {};
		this._backupId = new Date().getTime();
	}
	this._backup[++this._backupId] = this.getFormData();
	return this._backupId;
};

dhtmlXForm.prototype.restoreBackup = function(id) {
	if (this._backup != null && this._backup[id] != null) {
		this.setFormData(this._backup[id]);
	}
};

dhtmlXForm.prototype.clearBackup = function(id) {
	if (this._backup != null && this._backup[id] != null) {
		this._backup[id] = null;
		delete this._backup[id];
	}
};
