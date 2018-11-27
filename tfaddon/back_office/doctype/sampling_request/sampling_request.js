// Copyright (c) 2017, DGSOL InfoTech and contributors
// For license information, please see license.txt

//var doc=frm.doc;
var assignment_fields = ['assigned_to','req_remarks']
var response_fields = ['act_samples','act_bottles','response_remarks'];

frappe.ui.form.on('Sampling Request', {
	onload: function(frm) {
		//frm.events.workflow_state(frm);
	},
	refresh: function(frm, cdt, cdn) {
		var doc = frm.doc;
		frm.set_query("sales_order", function(){
			return {
				"filters": {"docstatus":["<",2], "status":["!=","Closed"]} 
			}
		});
		if(doc.docstatus == 1 && doc.workflow_state == 'In Process') {
			cur_frm.add_custom_button(__('Close'), cur_frm.cscript['Close Request']);
			cur_frm.add_custom_button(__('Cancel'), cur_frm.cscript['Cancel Request']);
		}
		if (!frm.doc.__islocal) {
			frm.events.get_sample_list(frm);
		}
		frm.events.workflow_state(frm);
	},
	validate: function(frm, cdt, cdn) {
		var doc = frm.doc;
		if (doc.__islocal || (doc.workflow_state == "To Assign" && doc.docstatus == 0)) {
			if (doc.est_start_date && doc.est_start_date < get_today()) {
				alert("Estimated Start Date cannot be past Date");
				frappe.validated = false;
			}
			if (!doc.est_duration || doc.est_duration == 0) {
				alert ("Estimated Activity Duration cannot be 0");
				frappe.validated = false;
			}
			if (!doc.site_location || doc.site_location == "") {
				alert ("Site location cannot be blank");
				frappe.validated = false;
			}
			if (!doc.est_samples || doc.est_samples == 0) {
				alert ("Estimated No of Samples cannot be 0");
				frappe.validated = false;
			}
			if (doc.est_containers && doc.est_containers < doc.est_samples) {
				alert ("Estimated No of Bottles cannot be less than No of Samples");
				frappe.validated = false;
			}
		}
	},
	get_sample_list: function(frm) {
		frappe.call({
			'method': 'frappe.client.get_list',
			'args': {
				'doctype': 'Samples',
				'fields': ['name','sample_id','customer','loc_area','loc_location','loc_cd',
					'eq_make','eq_serial','collection_date','status','bag_no','laboratory'],
				'filters': {'sampling_request':frm.doc.name}
			},
			'callback': function(res) {
				if (res.message) {
					frm.set_df_property('list_of_samples', 'options', frappe.render(samples_table_template, {rows: res.message}));
				} else {
					frm.set_df_property('list_of_samples', 'options', frappe.render(samples_empty_template, {rows: []}));						
				}
			}
		});	
		frm.refresh_field('list_of_samples');
	},
	workflow_state: function(frm, cdt, cdn) {
		//alert ("From workflow_state--> Docstatus : " + frm.doc.docstatus + "\n" + "workflow_state : " + frm.doc.workflow_state);
		var doc = frm.doc;
		if (doc.__islocal) {
			frm.toggle_reqd("est_start_date", true);
			frm.toggle_reqd("est_duration", true);
			frm.toggle_reqd("site_location", true);
			frm.toggle_reqd("est_samples", true);
			frm.toggle_reqd("est_containers", true);
		} else if (doc.docstatus == 0){
			if (doc.workflow_state == "To Assign") {
				frm.toggle_reqd("est_start_date", doc.workflow_state == "To Assign"? 1 : 0);
				frm.toggle_reqd("est_duration", doc.workflow_state == "To Assign"? 1 : 0);
				frm.toggle_reqd("site_location", doc.workflow_state == "To Assign"? 1 : 0);
				frm.toggle_reqd("est_samples", doc.workflow_state == "To Assign"? 1 : 0);
				frm.toggle_reqd("est_containers", doc.workflow_state == "To Assign"? 1 : 0);
				frm.toggle_reqd("contact_no", doc.workflow_state == "To Assign"? 1 : 0);
				frm.toggle_reqd("contact_name", doc.workflow_state == "To Assign"? 1 : 0);
				frm.toggle_reqd("assigned_to", doc.workflow_state == "To Assign"? 1 : 0);
				frm.toggle_reqd("req_remarks", doc.workflow_state == "To Assign"? 1 : 0);
				frm.toggle_enable("sales_order", doc.workflow_state == "To Assign"? 0 : 1);
			} else if (doc.workflow_state == "In Process") {
				frm.toggle_enable("sales_order", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_enable("est_start_date", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_enable("est_duration", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_enable("site_location", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_enable("est_samples", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_enable("est_containers", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_enable("contact_name", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_enable("contact_no", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_enable("assigned_to", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_enable("req_remarks", doc.workflow_state == "In Process"? 0 : 1);
				frm.toggle_reqd("act_start_date", doc.workflow_state == "In Process"? 1 : 0);
				frm.toggle_reqd("act_duration", doc.workflow_state == "In Process"? 1 : 0);
				frm.toggle_reqd("act_samples", doc.workflow_state == "In Process"? 1 : 0);
				frm.toggle_reqd("act_containers", doc.workflow_state == "In Process"? 1 : 0);
				frm.toggle_reqd("response_remarks", doc.workflow_state == "In Process"? 1 : 0);
			}
		} else {
			frm.toggle_enable("closer_date", false);
			frm.toggle_enable("act_start_date", false);
			frm.toggle_enable("act_duration", false);
			frm.toggle_enable("act_samples", false);
			frm.toggle_enable("act_containers", false);
			frm.toggle_enable("response_remarks", false);
		} 

	},
});

cur_frm.cscript['Close Request'] = function(){
	var dialog = new frappe.ui.Dialog({
		title: "Close Request",
		fields: [
			{"fieldtype": "Link", "label": __("Job Done By"), "fieldname": "job_done_by", "reqd": 1, "options":"Sampler Master" },
			{"fieldtype": "Date", "label": __("Actual Start Date"), "fieldname": "act_start_date", "reqd": 1 },
			{"fieldtype": "Data", "label": __("Actual Activity Duration (in Days)"), "fieldname": "act_duration", "reqd": 1 },
			{"fieldtype": "Data", "label": __("Closing Remarks"), "fieldname": "response_remarks", "reqd": 1 },
			{"fieldtype": "Button", "label": __("Update"), "fieldname": "update"},
		]
	});

	dialog.fields_dict.update.$input.click(function() {
		var args = dialog.get_values();
		//alert(args.act_start_date + " / " + args.act_duration);
		if(!args) return;
		return cur_frm.call({
			method: "declare_req_closed",
			doc: cur_frm.doc,
			args: {job_done_by:args.job_done_by, act_start_date: args.act_start_date, 
				act_duration: args.act_duration, response_remarks:args.response_remarks},
			callback: function(r) {
				if(r.exc) {
					frappe.msgprint(__("There were errors."));
					return;
				}
				dialog.hide();
				cur_frm.refresh();
			},
			btn: this
		})
	});
	dialog.show();
}

cur_frm.cscript['Cancel Request'] = function(){
	var dialog = new frappe.ui.Dialog({
		title: "Cancel Request",
		fields: [
			{"fieldtype": "Data", "label": __("Cancellation Remarks"), "fieldname": "response_remarks", "reqd": 1 },
			{"fieldtype": "Button", "label": __("Update"), "fieldname": "update"},
		]
	});

	dialog.fields_dict.update.$input.click(function() {
		var args = dialog.get_values();
		//alert(args.act_start_date + " / " + args.act_duration);
		if(!args) return;
		return cur_frm.call({
			method: "declare_req_cancelled",
			doc: cur_frm.doc,
			args: {response_remarks:args.response_remarks},
			callback: function(r) {
				if(r.exc) {
					frappe.msgprint(__("There were errors."));
					return;
				}
				dialog.hide();
				cur_frm.refresh();
			},
			btn: this
		})
	});
	dialog.show();
}

var samples_table_template = `
	<div class="form-group">
		<div class="col-xs-12">
			{% if not rows %}
			<p>No Samples...</p>
			{% else %}
			<table class="table table-bordered" style="width: 100%; font-size:x-small">
				<caption>List of Samples</caption>
				<tbody>
					<tr>
						<th>Sample ID</th>
						<th>Collection Date</th>
						<th>Location</th>
						<th>Equipment</th>
						<th>Destination Lab</th>
						<th>Status</th>
					</tr>
					{% for row in rows %}
					<tr>
						<td><a href="desk#Form/Samples/{{ row.name }}" target="_blank">{{ row.sample_id }}</a></td>
						<td>{{ row.collection_date }}</td>
						<td>{{ row.loc_area }}/{{ row.loc_location }}/{{ row.loc_cd }}</td>
						<td>{{ row.eq_make }}/{{ row.eq_serial }}</td>
						<td>{{ row.laboratory }}</td>
						<td>{{ row.status }}</td>
					</tr>
					{% endfor %}
				</tbody>
			</table>
			{% endif %}
		</div> 
	</div>`;

var samples_empty_template = `
	<div class="form-group">
		<div class="col-xs-12">
			<p>No Samples found...</p> 
		</div> 
	</div>`;

