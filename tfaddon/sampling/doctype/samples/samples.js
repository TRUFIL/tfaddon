// Copyright (c) 2017, DGSOL InfoTech and contributors
// For license information, please see license.txt

//frappe.provide("tfaddon");
frappe.ui.form.on('Samples', {
	refresh: function(frm) {
		var doc = frm.doc;
		if (!doc.__islocal) {
			frm.events.display_job_list(frm);
		}
		frm.set_query("sampling_request", function(){
			return {
				"filters": {"workflow_state": "In Process", "docstatus": 1, "assigned_to": doc.sampler_name}
			}
		});
		frm.set_query("smp_point", function(){
			return {
				"filters": {"sampling_source": doc.smp_source, "sample_type": doc.smp_type}
			}
		});
		frm.set_query("smp_condition", function(){
			return {
				"filters": {"is_active": 1}
			}
		});
		frm.set_query("smp_location", function(){
			return {
				"filters": {"loc_owner": doc.customer}
			}
		});
		frm.set_query("smp_equipment", function(){
			return {
				"filters": {"eq_owner": doc.customer}
			}
		});
		frm.set_query("smp_location", function(){
			return {
				"filters": {"loc_owner": doc.customer}
			}
		});
		$.each(frm.doc.containers || [], function(i, d) {
			d.status = frm.doc.status;
		});
		if(doc.docstatus == 1) {
			// Add Receive Button 
			if ((doc.collected_by == 'TRUFIL' && doc.status == 'Dispatched') || (doc.collected_by == "Customer" && doc.status == 'Collected')) {
				cur_frm.add_custom_button(__('Receive'), cur_frm.cscript['Receive Samples']);
			}
			// Add Diospose Button
			if (doc.status == 'Completed') {
				cur_frm.add_custom_button(__('Dispose'), cur_frm.cscript['Dispose Samples']);
			}
		} 
		frm.events.required_fields(frm);
	},
	collected_by: function(frm) {
		if(frm.doc.__islocal || frm.doc.docstatus == 0) {
			frm.toggle_reqd("bag_no", (frm.doc.collected_by == "TRUFIL") ? 1 : 0);
			frm.toggle_reqd("sampling_request", (frm.doc.collected_by == "TRUFIL") ? 1 : 0);
			frm.toggle_reqd("sampler_name", (frm.doc.collected_by == "TRUFIL") ? 1 : 0);
			frm.toggle_reqd("sales_order", (frm.doc.collected_by == "Customer") ? 1 : 0);
			if (frm.doc.collected_by == "Customer") {
				frm.set_value("sampler_name","");
				frm.set_value("sampling_request","");
			} 
		}
	},
	sampling_request: function(frm) {
		if (frm.doc.sampling_request) {
			frappe.call({
				"method": "frappe.client.get",
				args: {
					doctype: "Sampling Request",
					filters: {"name": frm.doc.sampling_request},
				},
				callback: function(res) {
					if (res.message) {
						frm.set_value("sales_order", res.message.sales_order);
						frm.toggle_enable("sales_order",false);
					}
				}
			});
		} else {
			frm.set_value("sales_order", "");
			frm.toggle_enable("sales_order",true);
		}
		refresh_field("sales_order");
		$.each(frm.doc.containers || [], function(i, d) {
			d.sampling_request = frm.doc.sampling_request;
		});
		refresh_field("containers");
	},
	sales_order: function(frm) {
		if (frm.doc.sales_order) {
			frappe.call({
				"method": "tfaddon.get_so_details",
				args: {
					doctype: "Sales Order",
					docname: frm.doc.sales_order,
				},
				callback: function(res) {
					if (res.message) {
						frm.set_value("customer", res.message["customer"]);
					}
				}
			});			
		} else {
			frm.set_value("customer", "");
		}
		$.each(frm.doc.containers || [], function(i, d) {
			//if(!d.sales_order) d.sales_order = frm.doc.sales_order;
			d.sales_order = frm.doc.sales_order;
		});
		refresh_field("containers");
	},
	eq_not_in_list: function(frm) {
		var doc = frm.doc;
		if(doc.__islocal) {
			frm.toggle_reqd("smp_equipment", true);
		} 
		if(doc.docstatus == 0) {
			frm.toggle_reqd("eq_make", doc.eq_not_in_list? 1: 0)
			frm.toggle_reqd("eq_serial", doc.eq_not_in_list? 1: 0)
			frm.toggle_reqd("eq_rating", doc.eq_not_in_list? 1: 0)
			frm.toggle_reqd("eq_vr", doc.eq_not_in_list? 1: 0)
			frm.toggle_reqd("eq_cr", doc.eq_not_in_list? 1: 0)
			frm.toggle_reqd("eq_no_of_phases", doc.eq_not_in_list? 1: 0)
			frm.toggle_reqd("eq_oil_capacity", doc.eq_not_in_list? 1: 0)
			frm.toggle_reqd("smp_equipment", doc.eq_not_in_list? 0: 1);
			if (doc.eq_not_in_list) {
				frm.set_value("smp_equipment", null);
				refresh_field("smp_equipment");
			}
		}
	},
	loc_not_in_list: function(frm) {
		var doc = frm.doc;
		if(doc.__islocal) {
			frm.toggle_reqd("smp_location", true);
		} 
		if (doc.docstatus == 0) {
			frm.toggle_reqd("loc_area", doc.loc_not_in_list? 1: 0)
			frm.toggle_reqd("loc_location", doc.loc_not_in_list? 1: 0)
			frm.toggle_reqd("loc_cd", doc.loc_not_in_list? 1: 0)
			frm.toggle_reqd("loc_cd", doc.loc_not_in_list? 1: 0)
			frm.toggle_reqd("smp_location", doc.loc_not_in_list? 0: 1);
			if (doc.loc_not_in_list) {
				frm.set_value("smp_location", null);
				refresh_field("smp_location");
			}
		}
	},
	smp_location: function(frm) {
		if (frm.doc.smp_location) {
			frappe.call({
				"method": "frappe.client.get",
				args: {
					doctype: "Locations",
					filters: {"name": frm.doc.smp_location},
				},
				callback: function(res) {
					if (res.message) {
						frm.set_value("loc_area", res.message.area);
						frm.set_value("loc_location", res.message.location);
						frm.set_value("loc_cd", res.message.cd);
						frm.set_value("loc_ccd", res.message.ccd);
						frm.set_value("loc_not_in_list", 0);
					} 
				}
			});
		}
	},
	smp_equipment: function(frm) {
		var doc = frm.doc;
		if (doc.smp_equipment) {
			//alert("Inside smp_location trigger");
			frappe.call({
				"method": "frappe.client.get",
				args: {
					doctype: "Equipments",
					filters: {"name": doc.smp_equipment},
				},
				callback: function(res) {
					if (res.message) {
						//console.log(res.message);
						frm.set_value("eq_make", res.message.eq_manufacturer);
						frm.set_value("eq_serial", res.message.eq_sl_no);
						frm.set_value("eq_rating", res.message.capacity);
						frm.set_value("eq_vr", res.message.voltage);
						frm.set_value("eq_cr", res.message.current);
						frm.set_value("eq_no_of_phases", res.message.eq_phases);
						frm.set_value("eq_oil_capacity", res.message.eq_oil_qty);
						frm.set_value("eq_yom", res.message.eq_yom);
						frm.set_value("owner_eq_id", res.message.owner_eq_id);
						frm.set_value("eq_not_in_list", 0);
					}
				}
			});
		} 
	},
	smp_source: function(frm) {
		if (frm.doc.smp_source == "Storage") {
			frm.set_value("smp_type", "Transformer Oil");
			frm.set_value("eq_rating", "NA");
			frm.set_value("eq_vr", "NA");
			frm.set_value("eq_cr", "NA");
			frm.set_value("eq_no_of_phases", "NA");
			frm.set_value("eq_ott", "0.00");
			frm.set_value("eq_wtt", "0.00");
			frm.set_value("eq_oil_capacity", "0");
			frm.set_value("eq_load", "0.00");
		} else {
			frm.set_value("eq_rating", null);
			frm.set_value("eq_vr", null);
			frm.set_value("eq_cr", null);
			frm.set_value("eq_no_of_phases", null);
			frm.set_value("eq_ott", null);
			frm.set_value("eq_wtt", null);
			frm.set_value("eq_oil_capacity", null);
			frm.set_value("eq_load", null);
			frm.set_value("smp_point", null);
			frm.set_value("smp_type", null);
		}
	},
	smp_type: function(frm) {
		if (frm.doc.smp_source == "Storage") {
			if (frm.doc.smp_type == "Transformer Oil") {
				frm.set_value("smp_point", "Drum");
			} 
		} else {
			if (frm.doc.smp_type == "Buchholz Gas" || frm.doc.smp_type == "Insulating Paper" ) {
				frm.set_value("smp_point", "Others");
			} else {
				frm.set_value("smp_point", null);
			}
		}
	},
	required_fields: function(frm) {
		var doc = frm.doc;
		var to_be_edited = (doc.status == "Draft");
		var sf = ["collection_date","smp_source","smp_type","smp_point",
			"weather_condition","sampler_remarks"];
		// Make basic Fields Mandatory
		if (doc.__islocal || doc.docstatus == 0) {
			for (i = 0; i < sf.length; i++) {
				frm.toggle_reqd(sf[i], to_be_edited? 1: 0);
			}
			frm.toggle_reqd("smp_location", doc.loc_not_in_list? 0: 1);
			frm.toggle_reqd("smp_equipment", doc.eq_not_in_list? 0: 1);
		}

		frm.events.collected_by(frm);
		frm.events.loc_not_in_list(frm);
		frm.events.eq_not_in_list(frm);
	},
	bag_no: function(frm, cdt, cdn) {
		$.each(frm.doc.containers || [], function(i, d) {
			d.bag_no = frm.doc.bag_no;
		});
		refresh_field("containers");
	},
	display_job_list: function(frm) {
		frappe.call({
			'method': 'tfaddon.get_list',
			'args': {
				'doctype': 'Job Card',
				'fields': ['name','workflow_state','creation','owner','modified','modified_by'],
				'filters': {'sample':frm.doc.name},
				'ignore_permissions': true
			},
			'callback': function(res) {
				//console.log(res.message);
				if (res.message) {
					frm.set_df_property('job_list_html', 'options', frappe.render(job_list_template, {rows: res.message}));
				} else {
					frm.set_df_property('job_list_html', 'options', frappe.render(blank_list_template, {rows: []}));
				}
				frm.refresh_field('job_list_html');
			}
		});	
	},
	status: function(frm) {
		frm.refresh();
	}
});

frappe.ui.form.on("Sampling Containers", {
	containers_add: function(frm, cdt, cdn) {
		var row = frappe.get_doc(cdt, cdn);
		if(frm.doc.bag_no) {
			row.bag_no = frm.doc.bag_no;
			refresh_field("bag_no", cdn, "containers");
		}
		if(frm.doc.sampling_request) {
			row.sampling_request = frm.doc.sampling_request;
			refresh_field("sampling_request", cdn, "containers");
		}
		if(frm.doc.sales_order) {
			row.sales_order = frm.doc.sales_order;
			refresh_field("sales_order", cdn, "containers");
		}
		if(frm.doc.status) {
			row.status = frm.doc.status;
			refresh_field("status", cdn, "containers");
		}
	},
	containers_remove: function(frm, cdt, cdn) {
		// Update trufil_container, customer_container, no_of_containers
		var bottles = frm.doc.containers;
		trufil_container = "";
		customer_container = "";
		no_of_containers = 0;
		for (var i in bottles) {
			if (trufil_container != "") {trufil_container += "-";}
			trufil_container += bottles[i].container_no;

			if (customer_container != "") {customer_container += "-";}
			if (bottles[i].cust_identification) {
				customer_container += bottles[i].cust_identification;
			} else {
				customer_container += "--";
			}

			no_of_containers++;
		}
		frm.set_value("trufil_container", trufil_container);
		frm.set_value("customer_container", customer_container);
		frm.set_value("no_of_containers", no_of_containers);
	},
	bag_no: function(frm, cdt, cdn) {
		if(!frm.doc.bag_no) {
			erpnext.utils.copy_value_in_all_row(frm.doc, cdt, cdn, "containers", "bag_no");
		}
	},	
	sampling_request: function(frm, cdt, cdn) {
		if(!frm.doc.sampling_request) {
			erpnext.utils.copy_value_in_all_row(frm.doc, cdt, cdn, "containers", "sampling_request");
		}
	},	
	sales_order: function(frm, cdt, cdn) {
		if(!frm.doc.sales_order) {
			erpnext.utils.copy_value_in_all_row(frm.doc, cdt, cdn, "containers", "sales_order");
		}
	},
	status: function(frm, cdt, cdn) {
		if (!frm.doc.status) {
			erpnext.utils.copy_value_in_all_row(frm.doc, cdt, cdn, "containers", "status");
		}
	},
	container_no: function(frm) {
		// Update trufil_container
		var bottles = frm.doc.containers;
		trufil_container = "";
		no_of_containers = 0;
		for (var i in bottles) {
			if (trufil_container != "") {trufil_container += "-";}
			trufil_container += bottles[i].container_no;
			no_of_containers++;
		}
		frm.set_value("trufil_container", trufil_container);
		frm.set_value("no_of_containers", no_of_containers);
	},
	cust_identification: function (frm) {
		// Update customer_container
		var bottles = frm.doc.containers;
		customer_container = "";
		for (var i in bottles) {
			if (customer_container != "") {customer_container += "-";}
			if (bottles[i].cust_identification) {
				customer_container += bottles[i].cust_identification;
			} else {
				customer_container += "--";
			}
		}
		frm.set_value("customer_container", customer_container);
	}
});

cur_frm.cscript['Receive Samples'] = function() {
	var dialog = new frappe.ui.Dialog({
		title: "Receipt Details",
		fields: [
			{"fieldtype": "Date", "label": __("Received Date"), "fieldname": "receipt_date", "reqd": 1 },
			{"fieldtype": "Link", "label": __("Receiving Lab"), "fieldname": "laboratory", "reqd": 1, "options": "Laboratories" },
			{"fieldtype": "Select", "label": __("Condition on Receipt"), "fieldname": "receipt_condition", "reqd": 1, "options": "OK\nBROKEN\nDISPUTED"},
			{"fieldtype": "Button", "label": __("Update"), "fieldname": "update"},
		]
	});
	dialog.fields_dict.update.$input.click(function() {
		var args = dialog.get_values();
		//alert(args.act_start_date + " / " + args.act_duration);
		if(!args) return;
		return cur_frm.call({
			method: "declare_received",
			doc: cur_frm.doc,
			args: {receipt_date:args.receipt_date, laboratory:args.laboratory, 
				receipt_condition:args.receipt_condition},
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

cur_frm.cscript['Dispose Samples'] = function() {
	var dialog = new frappe.ui.Dialog({
		title: "Dispose Details",
		fields: [
			{"fieldtype": "Date", "label": __("Disposed Date"), "fieldname": "disposed_date", "reqd": 1 },
			{"fieldtype": "Button", "label": __("Update"), "fieldname": "update"},
		]
	});
	dialog.fields_dict.update.$input.click(function() {
		var args = dialog.get_values();
		//alert(args.act_start_date + " / " + args.act_duration);
		if(!args) return;
		return cur_frm.call({
			method: "declare_disposed",
			doc: cur_frm.doc,
			args: {disposed_date:args.disposed_date},
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

var job_list_template = `
	{% for row in rows %}
	<div class="list-row-container">
		<div class="level list-row small">
			<div class="level-left ellipsis">
				<div class="list-row-col ellipsis list-subject level ">
					<span class="level-item  ellipsis" title="">
						<a class="ellipsis" href="#Form/Job%20Card/{{ row.name }}" title="">
							{{ row.name }}
						</a>
					</span>
				</div>
				<div class="list-row-col ellipsis hidden-xs ">
					<span class="ellipsis" title="Status: {{ row.workflow_state }}">
						<a class="" data-filter="">
							{{ row.workflow_state }}
						</a>
					</span>
				</div>
				<div class="list-row-col ellipsis hidden-xs ">
					<span class="ellipsis" title="Last Modified: {{ frappe.datetime.str_to_user(row.modified) }}">
						<a class="" data-filter="">
							{{ frappe.datetime.str_to_user(row.modified) }}
						</a>
					</span>
				</div>
				<div class="list-row-col ellipsis hidden-xs ">
					<span class="ellipsis" title="Modified By: {{ row.modified_by }}">
						<a class="" data-filter="">
							{{ row.modified_by }}
						</a>
					</span>
				</div>
			</div>
			<div class="level-right text-muted ellipsis">
				<div class="level-item hidden-xs hidden-sm ellipsis">
					<a class="text-muted ellipsis" href="#Form/Job%20Card/{{ row.name }}">
							{{ row.name }}
					</a>
				</div>
				<!--div class="level-item hidden-xs list-row-activity">
					<span class="frappe-timestamp  mini" data-timestamp="2018-04-14 04:18:29.615027" title="14-04-2018 04:18:29">14 d</span>
					<span class="avatar avatar-small avatar-empty"></span>
					<span class="text-extra-muted comment-count">
						<i class="octicon octicon-comment-discussion"></i>
						0
					</span>
				</div>
				<div class="level-item visible-xs text-right">
				</div-->
			</div>
		</div>
	</div>
	{% endfor %}`;

var blank_list_template = `
	<div> 
		No Job Cards...
	</div>`
