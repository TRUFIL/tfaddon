// render
frappe.listview_settings['Sampling Request'] = {
	add_fields: ["workflow_state", "customer", "est_start_date", "sales_order"],
	get_indicator: function(doc) {
		if (doc.workflow_state==='To Assign' && doc.start_date <= frappe.datetime.get_today()) {
			return [__("To Assign"), "red", "workflow_state,=,To Assign|start_date,<=,Today"];
		} else if (doc.workflow_state==='To Assign' && doc.start_date > frappe.datetime.get_today()) {
			return [__("To Assign"), "green", "workflow_state,=,To Assign|start_date,>,Today"];
		} else if (doc.workflow_state==='In Process') {
			return [__("In Process"), "orange", "workflow_state,=,In Process"];
		} else if (doc.workflow_state==='Closed') {
			return [__("Closed"), "grey", "workflow_state,=,Closed"];
		} else if (doc.workflow_state==='Cancelled') {
			return [__("Closed"), "darkgrey", "workflow_state,=,Closed"];
		}
	},
	right_column: "workflow_state"
};


/*frappe.listview_settings['Sales Invoice'] = {
	add_fields: ["customer", "customer_name", "base_grand_total", "outstanding_amount", "due_date", "company",
		"currency", "is_return"],
	get_indicator: function(doc) {
		if(cint(doc.is_return)==1) {
			return [__("Return"), "darkgrey", "is_return,=,Yes"];
		} else if(flt(doc.outstanding_amount)==0) {
			return [__("Paid"), "green", "outstanding_amount,=,0"]
		} else if(flt(doc.outstanding_amount) < 0) {
			return [__("Credit Note Issued"), "darkgrey", "outstanding_amount,<,0"]
		}else if (flt(doc.outstanding_amount) > 0 && doc.due_date >= frappe.datetime.get_today()) {
			return [__("Unpaid"), "orange", "outstanding_amount,>,0|due_date,>,Today"]
		} else if (flt(doc.outstanding_amount) > 0 && doc.due_date < frappe.datetime.get_today()) {
			return [__("Overdue"), "red", "outstanding_amount,>,0|due_date,<=,Today"]
		}
	},
	right_column: "grand_total"
};*/
