// Copyright (c) 2017, DGSOL InfoTech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Voltage Class', {
	refresh: function(frm) {
		// set the field readonly after first save
		frm.set_df_property("voltage_class", "read_only", frm.doc.__islocal ? 0 : 1);
	}
});

