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
	fy = get_fiscal_year(doc.transaction_date, company=doc.company)[0]
	fy_start_end_date = frappe.db.get_value("Fiscal Year", str(fy), ["year_start_date","year_end_date"])

	fy_start_abbr = fy_start_end_date[0].year
	fy_end_abbr = fy_start_end_date[1].year

	fy_abbr = str(fy_start_abbr)[-2:] + str(fy_end_abbr)[-2:]
	doc_abbr = frappe.db.get_value("Company", doc.company, "abbr")

	doc.name = make_autoname(doc_abbr+"/SO/" + fy_abbr +'/.##')