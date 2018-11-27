// Copyright (c) 2017, DGSOL InfoTech and contributors
// For license information, please see license.txt

//frappe.provide("tfaddon");
frappe.ui.form.on('Oil Test Reports', {
	refresh: function(frm) {
		var doc = frm.doc;
		frm.set_query("sample_id", function(){
			return {
				"filters": {"docstatus": 1, "workflow_state": "In Process"}
			}
		});
	}
});

