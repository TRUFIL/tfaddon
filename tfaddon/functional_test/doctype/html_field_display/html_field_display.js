// Copyright (c) 2017, DGSOL InfoTech and contributors
// For license information, please see license.txt

//frappe.provide("erpnext.utils");

frappe.ui.form.on('HTML Field Display', {
	refresh: function(frm, cdt, cdn) {
		frm.events.equipment(frm);
	},
	equipment: function(frm) {
		frappe.call ({
			'method': 'frappe.client.get',
			'args': {
				'doctype': 'Equipments',
				'name': frm.doc.equipment
			},
			'callback': function(res) {
				//alert(JSON.stringify(res.message, null, 4));
				var wrapper = $(frm.fields_dict['equipment_detail'].wrapper);
				wrapper.html(frappe.render(eq_template, {doc: res.message}));
				//frm.set_df_property('equipment_detail', 'options', frappe.render(eq_template, {eq: res.message}));
				frm.refresh_field('equipment_detail');
			}
		});
	}
});

var eq_template = `
	<div class="form-group">
		<div class="col-xs-6">
			<table style="width: 100%"><tbody style="padding: 50px; vertical-align: top;">
				<tr><td>Owner </td><td>: {{ doc.eq_owner }}</td></tr>
				<tr><td>Owner Equipment ID </td><td>: {{ doc.eq_owner_id }}</td></tr>
				<tr><td>Equipment Type </td><td>: {{ doc.eq_type }}</td></tr>
				<tr><td>Manufacturer </td><td>: {{ doc.manufacturer_full_name }}</td></tr>
				<tr><td>Manufacturer’s Serial No </td><td>: {{ doc.eq_sl_no }}</td></tr>
				<tr><td>Manufacturing Year </td><td>: {{ doc.eq_yom }}</td></tr>
				<tr><td>Capacity </td><td>: {{ doc.capacity }}</td></tr>
				<tr><td>Voltage Class </td><td>: {{ doc.voltage_class }}</td></tr>
				<tr><td>Voltage Ratio </td><td>: {{ doc.voltage }}</td></tr>
				<tr><td>Current Ratio </td><td>: {{ doc.current }}</td></tr>
				<tr><td>Phases </td><td>: {{ doc.eq_phases }}</td></tr>
				<tr><td>Oil Type </td><td>: {{ doc.eq_oil_type }}</td></tr>
				<tr><td>Oil Quantity </td><td>: {{ doc.eq_oil_qty }}</td></tr>
				<tr><td>Cooling </td><td>: {{ doc.eq_cooling }}</td></tr>
			</tbody></table>
		</div> 
		<div class="col-xs-6">
			<table><tbody style="padding: 50px; vertical-align: top;">
			</tbody></table>
						
		</div> 
	</div>`;

var loc_template = `
	<div class="form-group">
		<div class="col-xs-6">

		</div> 
		<div class="col-xs-6">

		</div> 
	</div>`;
