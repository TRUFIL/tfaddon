// Copyright (c) 2018, DGSOL InfoTech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Job Card', {
	onload: function(frm) {
		frm.events.eq_loc_details_as_per_sampler_refresh(frm);
		frm.events.display_otr_list(frm);
		frm.events.last_location(frm);
	},
	refresh: function(frm) {
		var doc = frm.doc;
		frm.set_query("sample", function(){
			return {
				"filters": {"docstatus": 1, "status": "Received"}
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
		frm.set_query("material", function(){
			return {
				"filters": {"material_type": doc.smp_type}
			}
		});
		frm.set_query("equipment", function(){
			return {
				"filters": {"eq_owner": doc.eq_owner}
			}
		});
		frm.set_query("location", function(){
			return {
				"filters": {"loc_owner": doc.eq_owner}
			}
		});
		frm.set_query("alt_address", function(){
			if(doc.is_alt_issued_to && (!doc.alt_customer)) {
				frappe.throw(_('Please select Alt Customer'));
			}

			return {
				query: 'frappe.contacts.doctype.address.address.address_query',
				filters: {
					link_doctype: 'Customer',
					link_name: doc.alt_customer
				}
			};
		});
		if(doc.docstatus == 1) {
			// Add Update Button 
			//if (!doc.submitted_on) { return true; }

			//var valid_date = frappe.datetime.add_days(doc.submitted_on, 30) < frappe.datetime.nowdate();
			
			if (doc.is_report_generated) {
				frm.add_custom_button(__('Sync with Masters'), function() {
					//Click
					frappe.call({
						'method': 'tfaddon.back_office.doctype.job_card.job_card.update_eq_location_details',
						'args': {
							'docname': frm.doc.name
						},
						'callback': function(res) {
							if (res) {
								//console.log(res);
								frm.timeline.insert_comment("Submitted", " synchronized Job Card with Equipment and Location details");
								frm.reload_doc();
							}
						}
					});
				});
			}
		}
		frm.events.eq_loc_details_as_per_sampler_refresh(frm);
		frm.events.display_otr_list(frm);
		frm.events.last_location(frm);
	},
	display_otr_list: function(frm) {
		frappe.call({
			'method': 'frappe.client.get_list',
			'args': {
				'doctype': 'Oil Test Reports',
				'fields': ['name','workflow_state','creation','owner','modified','modified_by','report_no'],
				'filters': {'sample_id':frm.doc.name}
			},
			'callback': function(res) {
				if (res.message) {
					frm.set_df_property('otr_list_html', 'options', frappe.render(otr_list_template, {rows: res.message}));
				} else {
					frm.set_df_property('otr_list_html', 'options', frappe.render(blank_list_template, {rows: []}));
				}
				frm.refresh_field('otr_list_html');
			}
		});	
	},
	eq_loc_details_as_per_sampler_refresh: function(frm) {
		if (frm.doc.sample) {
			frappe.call ({
				'method': 'frappe.client.get',
				'args': {
					'doctype': 'Samples',
					'name': frm.doc.sample
				},
				'callback': function(res) {
					if (res.message) {
						var wrapper = $(frm.fields_dict['loc_details_html'].wrapper);
						wrapper.html(frappe.render(loc_template, {doc: res.message}));
						var wrapper = $(frm.fields_dict['eq_details_html'].wrapper);
						wrapper.html(frappe.render(eq_template, {doc: res.message}));
					}
				}
			});
		} else {
			var wrapper = $(frm.fields_dict['loc_details_html'].wrapper);
			wrapper.html(frappe.render(blank_template, {doc: []}));
			var wrapper = $(frm.fields_dict['eq_details_html'].wrapper);
			wrapper.html(frappe.render(blank_template, {doc: []}));
		}
		frm.refresh_field('loc_details_html');
		frm.refresh_field('eq_details_html');
	},
	last_location: function(frm) {
		//console.log(frm.doc.last_location);
		if (frm.doc.last_location) {
			frappe.call ({
				'method': 'frappe.client.get',
				'args': {
					'doctype': 'Locations',
					'name': frm.doc.last_location
				},
				'callback': function(res) {
					console.log(res);
					if (res.message) {
						console.log(res.message);
						var wrapper = $(frm.fields_dict['last_loc_html'].wrapper);
						wrapper.html(frappe.render(last_loc_template, {doc: res.message}));
						var wrapper = $(frm.fields_dict['last_loc_ccd_html'].wrapper);
						wrapper.html(frappe.render(last_loc_ccd_template, {doc: res.message}));
					}
				}
			});
		} else {
			var wrapper = $(frm.fields_dict['last_loc_html'].wrapper);
			wrapper.html(frappe.render(blank_template, {doc: []}));
			var wrapper = $(frm.fields_dict['last_loc_ccd_html'].wrapper);
			wrapper.html(frappe.render(blank_template, {doc: []}));
		}
		frm.refresh_field('last_loc_html');
		frm.refresh_field('last_loc_ccd_html');
	},
	sample: function(frm) {
		if (frm.doc.sample) {
			frappe.call ({
				'method': 'frappe.client.get',
				'args': {
					'doctype': 'Samples',
					'name': frm.doc.sample
				},
				'callback': function(res) {
					if (res.message) {
						frm.set_value("collected_by", res.message.collected_by);
						frm.set_value("trufil_container", res.message.trufil_container);
						frm.set_value("customer_container", res.message.customer_container);
						frm.set_value("collection_date", res.message.collection_date);
						frm.set_value("smp_source", res.message.smp_source);
						frm.set_value("smp_type", res.message.smp_type);
						frm.set_value("weather_condition", res.message.weather_condition);
						frm.set_value("receipt_condition", res.message.receipt_condition);
						frm.set_value("eq_load", res.message.eq_load);
						frm.set_value("eq_ott", res.message.eq_ott);
						frm.set_value("eq_wtt", res.message.eq_wtt);
						frm.set_value("receipt_date", res.message.receipt_date);
						frm.set_value("laboratory", res.message.laboratory);
						frm.set_value("sales_order", res.message.sales_order);
						frm.set_value("sampling_request", res.message.sampling_request);
						frm.set_value("sampler_remarks", res.message.sampler_remarks);
					}
				}
			});
		} else {
			frm.set_value("collected_by", null);
			frm.set_value("trufil_container", null);
			frm.set_value("customer_container", null);
			frm.set_value("collection_date", null);
			frm.set_value("smp_source", null);
			frm.set_value("smp_type", null);
			frm.set_value("weather_condition", null);
			frm.set_value("receipt_condition", null);
			frm.set_value("eq_load", null);
			frm.set_value("eq_ott", null);
			frm.set_value("eq_wtt", null);
			frm.set_value("receipt_date", null);
			frm.set_value("laboratory", null);
			frm.set_value("sales_order", null);
			frm.set_value("sampling_request", null);
			frm.set_value("sampler_remarks", null);
		}
		frm.reload_doc();
		frm.events.eq_loc_details_as_per_sampler_refresh(frm);
	},
	sales_order: function (frm) {
		if (frm.doc.sales_order) {
			frappe.call ({
				'method': 'tfaddon.get_so_details',
				'args': {
					'doctype': 'Sales Order',
					'docname': frm.doc.sales_order
				},
				'callback': function(res) {
					if (res.message) {
						console.log(res.message);
						frm.set_value("sales_order_date", res.message["transaction_date"]);
						frm.set_value("po_no", res.message["po_no"] );
						frm.set_value("po_date", res.message["po_date"]);
						frm.set_value("issued_to", res.message["customer_legal_name"]);
						frm.set_value("issued_to_address", res.message["address_display"]);
						frm.set_value("eq_owner", res.message["customer"]);
						frm.set_value("customer", res.message["customer"]);
					}
				}
			});
		}
	},
	eq_owner: function(frm) {
		if (frm.doc.eq_owner) {
			frappe.call ({
				'method': 'tfaddon.get_customer_details',
				'args': {
					'doctype': 'Customer',
					'docname': frm.doc.eq_owner
				},
				'callback': function(res) {
					if (res.message) {
						frm.set_value("eq_owner_name", res.message["customer_legal_name"]);
					}
				}
			});
		} 
	},
	equipment: function(frm) {
		if (frm.doc.equipment) {
			frappe.call({
				"method": "frappe.client.get",
				args: {
					doctype: "Equipments",
					filters: {"name": frm.doc.equipment},
				},
				callback: function(res) {
					if (res.message) {
						//console.log(res.message);
						frm.set_value("eq_manufacturer", res.message.eq_manufacturer);
						frm.set_value("manufacturer_full_name", res.message.manufacturer_full_name);
						frm.set_value("eq_sl_no", res.message.eq_sl_no);
						frm.set_value("eq_yom", res.message.eq_yom);
						frm.set_value("owner_eq_id", res.message.owner_eq_id);
						frm.set_value("eq_group", res.message.eq_group);
						frm.set_value("eq_type", res.message.eq_type);
						frm.set_value("eq_cooling", res.message.eq_cooling);
						frm.set_value("eq_oil_type", res.message.eq_oil_type);
						frm.set_value("eq_oil_qty", res.message.eq_oil_qty);
						frm.set_value("voltage_class", res.message.voltage_class);
						frm.set_value("capacity", res.message.capacity);
						frm.set_value("voltage", res.message.voltage);
						frm.set_value("current", res.message.current);
						frm.set_value("eq_phases", res.message.eq_phases);
					}
				}
			});
			frappe.call({
				"method": "tfaddon.back_office.doctype.job_card.job_card.get_last_location",
				args: {
					docname: frm.doc.name,
					eq: frm.doc.equipment
				},
				callback: function(res) {
					console.log(res);
					if (res.message) {
						console.log(res.message);
						frm.set_value("last_location", res.message[0]["location"]);
					} else {
						frm.set_value("last_location", null);
					}
				}
			});
			frm.refresh_field('last_location');
		} else {
			frm.set_value("eq_manufacturer", null);
			frm.set_value("manufacturer_full_name", null);
			frm.set_value("eq_sl_no", null);
			frm.set_value("eq_yom", null);
			frm.set_value("owner_eq_id", null);
			frm.set_value("eq_group", null);
			frm.set_value("eq_type", null);
			frm.set_value("eq_cooling", null);
			frm.set_value("eq_oil_type", null);
			frm.set_value("eq_oil_qty", null);
			frm.set_value("voltage_class", null);
			frm.set_value("capacity", null);
			frm.set_value("voltage", null);
			frm.set_value("current", null);
			frm.set_value("eq_phases", null);
		}
	},
	location: function(frm) {
		if (frm.doc.location) {
			frappe.call({
				"method": "frappe.client.get",
				args: {
					doctype: "Locations",
					filters: {"name": frm.doc.location},
				},
				callback: function(res) {
					if (res.message) {
						frm.set_value("loc_owner", res.message.loc_owner);
						frm.set_value("loc_area", res.message.area);
						frm.set_value("loc_location", res.message.location);
						frm.set_value("loc_cd", res.message.cd);
						frm.set_value("loc_ccd", res.message.ccd);
						frm.set_value("loc_installation", res.message.installation);
						frm.set_value("loc_is_critical", res.message.is_critical);
					} 
				}
			});
		} else {
			frm.set_value("loc_owner", null);
			frm.set_value("loc_area", null);
			frm.set_value("loc_location", null);
			frm.set_value("loc_cd", null);
			frm.set_value("loc_ccd", null);
			frm.set_value("loc_installation", null);
		}
	},
	is_alt_issued_to: function(frm) {
		if (!frm.doc.is_alt_issued_to) {
			frm.set_value("alt_customer",null);
			frm.set_value("alt_issued_to",null);
			frm.set_value("alt_address",null);
			frm.set_value("alt_issued_to_address",null);
		} 
		frm.toggle_reqd("alt_customer",frm.doc.is_alt_issued_to?1:0);
		frm.toggle_reqd("alt_address",frm.doc.is_alt_issued_to?1:0);
	},
	alt_customer: function (frm) {
		if (frm.doc.alt_customer) {
			frappe.call ({
				'method': 'tfaddon.get_customer_details',
				'args': {
					'doctype': 'Customer',
					'docname': frm.doc.alt_customer
				},
				'callback': function(res) {
					if (res.message) {
						frm.set_value("alt_issued_to", res.message["customer_legal_name"]);
					}
				}
			});
		} 
		frm.set_value("alt_address",null);
		frm.set_value("alt_issued_to_address",null);
	},
	alt_address: function (frm) {
		if (frm.doc.alt_address) {
			erpnext.utils.get_address_display(frm, "alt_address", "alt_issued_to_address");	
		}
	}
});

var loc_template = `
	<div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Location ID</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					{{ doc.smp_location?doc.smp_location:"--" }}
				</div>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Plant | Substation | Designation</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					{{ doc.loc_area }} | {{ doc.loc_location }} | {{ doc.loc_cd }}
				</div>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Sampling Point</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					{{ doc.smp_point?doc.smp_point:"--" }}
				</div>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Sampler's Remarks</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					 {{ doc.sampler_remarks?doc.sampler_remarks:"--" }}
				</div>
			</div>
		</div>
	</div>`;

var eq_template = `
	<div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Equipment ID</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					{{ doc.smp_equipment?doc.smp_equipment:"--" }}
				</div>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Make | Serial | Manufacturing Year</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					{{ doc.eq_make }} | {{ doc.eq_serial }} | {{ doc.eq_yom?doc.eq_yom:"--" }}</div>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Rating | Voltage Ratio | Current Ratio | Phases</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					{{ doc.eq_rating }} | {{ doc.eq_vr }} | {{ doc.eq_cr }} | {{ doc.eq_no_of_phases }}
				</div>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Owner's Equipment Designation | Equipment ID</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					{{ doc.loc_ccd?doc.loc_ccd:"--" }} | {{ doc.owner_eq_id?doc.owner_eq_id:"--" }}
				</div>
			</div>
		</div>
	</div>`;

var blank_template = `
	<div><p>No Values to display</p></div>
	`;
var otr_list_template = `
	{% for row in rows %}
	<div class="list-row-container">
		<div class="level list-row small">
			<div class="level-left ellipsis">
				<div class="list-row-col ellipsis list-subject level ">
					<span class="level-item  ellipsis" title="">
						<a class="ellipsis" href="#Form/Oil%20Test%20Reports/{{ row.name }}" title="">
							{{ row.report_no? row.report_no: row.name }}
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
					<a class="text-muted ellipsis" href="#Form/Oil%20Test%20Reports/{{ row.name }}">
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
		No Oil Test Reports...
	</div>`

var last_loc_template = `
	<div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Plant | Substation | Designation</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					{{ doc.area }} | {{ doc.location }} | {{ doc.cd }}
				</div>
			</div>
		</div>
	</div>`;

var last_loc_ccd_template = `
	<div>
		<div class="form-group">
			<label class="control-label" style="padding-right: 0px;">Owner's Equipment Designation</label>
			<div class="control-input-wrapper">
				<div class="control-value like-disabled-input" style="">
					{{ doc.loc_ccd?doc.ccd:"--" }} 
				</div>
			</div>
		</div>
	</div>`;
