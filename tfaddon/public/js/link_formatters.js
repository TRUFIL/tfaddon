// Format the query on Samples using sample_id

frappe.form.link_formatters['Samples'] = function(value, doc) {
    if (doc && doc.sample_id && doc.sample_id !== value) {
        return value? value + ': ' + doc.sample_id: doc.sample_id;
    } else {
        return value;
    }
}
/*
frappe.form.link_formatters['Item'] = function(value, doc) {
	if(doc && doc.item_name && doc.item_name !== value) {
		return value? value + ': ' + doc.item_name: doc.item_name;
	} else {
		return value;
	}
}

frappe.form.link_formatters['Employee'] = function(value, doc) {
	if(doc && doc.employee_name && doc.employee_name !== value) {
		return value? value + ': ' + doc.employee_name: doc.employee_name;
	} else {
		return value;
	}
}
*/
