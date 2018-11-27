// Copyright (c) 2016, DGSOL InfoTech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Equipments', {
	refresh: function(frm) {
		doc = frm.doc;
		cur_frm.set_query("eq_oil_type", function(){
			return {
				"filters": {"material_type": "Transformer Oil"}
			}
		});
		frm.events.eq_group(frm);
	},
	eq_group: function(frm) {
		var doc = frm.doc;
		frm.toggle_reqd("eq_manufacturer", true);
		frm.toggle_reqd("eq_sl_no", true);
		frm.toggle_reqd("eq_oil_type", true);
		if (doc.eq_group == "CONTAINER") {
			frm.toggle_reqd("voltage_class", false);
			frm.toggle_reqd("eq_phases", false);
			frm.toggle_reqd("eq_capacity", false);
			frm.toggle_reqd("eq_oil_qty", false);
		} else {
			frm.toggle_reqd("voltage_class", true);
			frm.toggle_reqd("eq_phases", true);
			frm.toggle_reqd("eq_capacity", true);
			frm.toggle_reqd("eq_oil_qty", true);
		}
		if (doc.eq_group == "TRANSFORMER" || doc.eq_group == "INSTRUMENT") {
			frm.toggle_reqd("eq_pv", true);
			frm.toggle_reqd("eq_sv", true);
		} else {
			frm.toggle_reqd("eq_pv", false);
			frm.toggle_reqd("eq_sv", false);
		}
		if (doc.eq_group == "CURRENT") {
			frm.toggle_reqd("eq_pc", true);
			frm.toggle_reqd("eq_sc", true);
		} else {
			frm.toggle_reqd("eq_pc", false);
			frm.toggle_reqd("eq_sc", false);
		}
		if (doc.eq_group == "OCB") {
			frm.set_df_property('eq_capacity', 'label', 'Rating (amps)');
		} else if (doc.eq_group == "REACTOR") {
			frm.set_df_property('eq_capacity', 'label', 'Rating (kVAr)');
		} else if (doc.eq_group == "CURRENT" || doc.eq_group == "INSTRUMENT") {
			frm.set_df_property('eq_capacity', 'label', 'Rating (VA)');
		} else {
			frm.set_df_property('eq_capacity', 'label', 'Rating (kVA)');
		}
	},
});

