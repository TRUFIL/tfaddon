# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import frappe 
from frappe import _ 
from datetime import datetime, date, time
from frappe.desk.reportview import get_match_cond, get_filters_cond
from frappe.utils import nowdate
from collections import defaultdict

__version__ = '4.1.5'
__title__ = "TRUFIL Addon"

# Function to generate unique serial number
def generate_unique_serial_no():
	sl_no = datetime.now()
	return "#" + sl_no.strftime('%Y%m%d%H%M%S')

def cur_year():
	cur_date = datetime.now()
	return cur_date.strftime('%Y')

def get_no_of_samples(doctype, docname):
	return frappe.db.count("Samples",filters={"sampling_request":"SRQ-170003"})

@frappe.whitelist()
def update_field(doctype, docname, field, value=None):
	frappe.db.set_value("Doctype", "docname", "field", "value")

@frappe.whitelist()
def get_no_of_bottles(doctype, filters=None):
	conditions = []
	bottles = frappe.db.sql("""SELECT count(*) FROM `tabSampling Containers` 
		WHERE docstatus < 2  {fcond} {mcond} """.format(**{ 
			'fcond': get_filters_cond(doctype, filters, conditions), 
			'mcond': get_match_cond(doctype) 
			}) 
		)
	return bottles[0][0]

@frappe.whitelist()
def get_no_of_samples(doctype, filters=None):
	conditions = []
	samples = frappe.db.sql("""SELECT count(*) FROM `tabSamples`
		WHERE docstatus < 2  {fcond} {mcond} """.format(**{ 
			'fcond': get_filters_cond(doctype, filters, conditions), 
			'mcond': get_match_cond(doctype) 
			}) 
		)
	return samples[0][0]

@frappe.whitelist()
def get_equipment_details(equipment):
	return frappe.get_doc("Equipments", equipment).as_dict()

@frappe.whitelist()
def get_location_details(location):
	return frappe.get_doc("Locations", location).as_dict()

@frappe.whitelist() 
def get_so_details(doctype, docname):
	return frappe.db.sql("""Select name,customer,customer_name,customer_legal_name,transaction_date, 
		po_no,po_date,collected_by,address_display 
		from `tabSales Order`
		where name = %s""",(docname),as_dict=True, formatted=True)[0]

@frappe.whitelist() 
def get_customer_details(doctype, docname):
	
	return frappe.db.sql("""Select name,customer_name,customer_legal_name,customer_type, 
		customer_group,territory,cin,yoi,pan 
		from `tabCustomer` 
		where disabled=0 and name = %s""",(docname), as_dict=True, formatted=True)[0]

@frappe.whitelist()
def get_list(doctype, fields=None, filters=None, order_by=None,
	limit_start=None, limit_page_length=50,ignore_permissions=False):
	'''Returns a list of records by filters, fields, ordering and limit

	:param doctype: DocType of the data to be queried
	:param fields: fields to be returned. Default is `name`
	:param filters: filter list by this dict
	:param order_by: Order by this fieldname
	:param limit_start: Start at this index
	:param limit_page_length: Number of records to be returned (default 50)'''
	return frappe.get_list(doctype, fields=fields, filters=filters, order_by=order_by,
		limit_start=limit_start, limit_page_length=limit_page_length, ignore_permissions=ignore_permissions)

