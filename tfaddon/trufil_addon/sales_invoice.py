# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt
# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe
from datetime import datetime, timedelta
from frappe.utils import flt, cint, cstr, add_days, getdate
from frappe.model.naming import make_autoname
import json
from frappe import _
import frappe.defaults
from erpnext.accounts.utils import get_fiscal_year

def si_autoname(doc, method):	
	fy = get_fiscal_year(doc.posting_date, company=doc.company)[0]
	fy_start_end_date = frappe.db.get_value("Fiscal Year", str(fy), ["year_start_date","year_end_date"])

	fy_start_abbr = fy_start_end_date[0].year
	fy_end_abbr = fy_start_end_date[1].year

	fy_abbr = str(fy_start_abbr)[-2:] + str(fy_end_abbr)[-2:]
	doc_abbr = frappe.db.get_value("Company", doc.company, "abbr")

	if doc.invoice_type == "Export":
		if doc.is_consignee:
			doc.name = make_autoname(doc_abbr+"/CON/" + fy_abbr +'/.##')
		else:
			doc.name = make_autoname(doc_abbr+"/EXP/" + fy_abbr +'/.##')
	elif not doc.is_return:
		doc.name = make_autoname(doc_abbr+"/SI/" + fy_abbr +'/.##')
	else:
		doc.name = make_autoname(doc_abbr+"/SIR/" + fy_abbr +'/.##')