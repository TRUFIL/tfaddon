// Copyright (c) 2017, DGSOL InfoTech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sample Dispatch Register', {
	refresh: function(frm, cdn, cdt) {
		doc = frm.doc;
		if (doc.bag_no) {
			frm.events.bag_no(frm);
		}
	},
	validate: function(frm) {
		doc = frm.doc;
		if (doc.total_samples == 0 || doc.total_samples != doc.act_samples) {
			alert("There is a mismatch in total No of Samples");
			frappe.validated = false;
		}

		if (doc.total_containers == 0 || doc.total_containers != doc.act_containers) {
			alert("There is a mismatch in total No of Bottles");
			frappe.validated = false;
		}

	},
	dispatch_mode: function(frm) {
		frm.set_value("ref_no", "");
		frm.set_value("contact_no", "");
		frm.set_value("person_courier", "");
	},
	bag_no: function(frm, cdt, cdn) {
		//Obtain No of Samples
		if (frm.doc.bag_no) {
			frappe.call({
				'method': 'tfaddon.get_list',
				'args': {
					'doctype': 'Samples',
					'fields': ['name','trufil_container','customer','loc_area','loc_location','loc_cd',
					'eq_make','eq_serial','collection_date','status','bag_no','laboratory'],
					'filters': {'bag_no':doc.bag_no},
					'ignore_permissions': true
				},
				'callback': function(res) {
					//console.log(res.message);
					if (res.message) {
						frm.set_df_property('list_of_samples', 'options', frappe.render(samples_table_template, {rows: res.message}));
					} else {
						frm.set_df_property('list_of_samples', 'options', frappe.render(samples_blank_template, {rows: res.message}));
					}
					frm.refresh_field('list_of_samples');
				}
			});	
			frappe.call({
				'method': 'tfaddon.get_no_of_samples',
				'args': {
					'doctype': 'Samples',
					'filters': {'bag_no':doc.bag_no}
				},
				'callback': function(res) {
					console.log(res.message);
					if (res.message) {
						frm.set_value("act_samples", res.message);
					} else {
						frm.set_value("act_samples", 0);
					}
					frm.refresh_field('act_samples');
				}
			});
			frappe.call({
				'method': 'tfaddon.get_no_of_bottles',
				'args': {
					'doctype': 'Sampling Containers',
					'filters': {'bag_no':doc.bag_no}
				},
				'callback': function(res) {
					console.log(res.message);
					if (res.message) {
						frm.set_value("act_containers", res.message);
					} else {
						frm.set_value("act_containers", 0);
					}
					frm.refresh_field('act_containers');
				}
			});
		} else {
			frm.set_value("sales_order", "");
			frm.toggle_enable("sales_order",true);
		}
	},
});

var samples_table_template = `
	<div class="form-group">
		<div class="col-xs-12">
			<table class="table table-bordered" style="width: 100%; font-size:x-small">
				<caption>List of Samples</caption>
				<tbody>
					<tr>
						<th>Trufil Container</th>
						<th>Collection Date</th>
						<th>Location</th>
						<th>Equipment</th>
						<th>Status</th>
					</tr>
					{% for row in rows %}
					<tr>
						<td><a href="desk#Form/Samples/{{ row.name }}" target="_blank">{% if row.trufil_container %} {{ row.trufil_container }} {% else %} {{ row.name }} {% endif %}</a></td>
						<td>{{ row.collection_date }}</td>
						<td>{{ row.loc_area }}/{{ row.loc_location }}/{{ row.loc_cd }}</td>
						<td>{{ row.eq_make }}/{{ row.eq_serial }}</td>
						<td>{{ row.status }}</td>
					</tr>
					{% endfor %}
				</tbody>
			</table>
		</div> 
	</div>`;

var samples_blank_template = `
	<div class="form-group">
		<div class="col-xs-12">
			<p>No samples found related to above given parameters...
		</div> 
	</div>`;

