# -*- coding: utf-8 -*-
# Copyright (c) 2018, DGSOL InfoTech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
import tfaddon
from frappe.model.document import Document
from frappe.utils import cint, flt, cstr, getdate, get_fullname

class JobCard(Document):
	def autoname(self):
		key = self.laboratory+'-.YY.#####'
		frappe.model.naming.make_autoname(key)

	def validate(self):
		if self.is_new():
			self.check_duplicate_job_card()
		self.validate_mandatory_fields()
		self.validate_alternate_issued_to()

	def before_submit(self):
		go_ahead=True
		if (self.smp_type == "Transformer Oil"):
			if (self.eq_oil_type and (self.eq_oil_type != self.material)):
				if (self.docstatus == 1): 
					self.docstatus = 0
					go_ahead=False
				frappe.throw(_("Oil type in Sample not matching with Oil in Equipment."))

		if (go_ahead):
			self.submitted_on = getdate()

	def on_submit(self):
		self.update_sample()
		self.create_otr()

	def before_cancel(self):
		active_otr_list = frappe.get_all('Oil Test Reports', 
			fields=['name'], 
			filters=[['sample_id', '=', self.name],['docstatus','<',2]])
		no_of_active_otr = len(active_otr_list)
		if (no_of_active_otr > 0):
			if (self.docstatus == 2):
				self.docstatus = 1
			frappe.throw(_("Oil Test Report <a href='#Form/Oil%20Test%20Reports/{0}'>{0}</a> already exist. Cannot cancel this sample".format(active_otr_list[0].name)))
		self.cancelled_on = frappe.utils.data.getdate()

	def on_cancel(self):
		self.update_sample()

	def validate_mandatory_fields(self):
		if not (self.laboratory):
			frappe.throw(_("Receiving Lab is mandatory to proceed. Please select..."))

		if not (self.sample):
			frappe.throw(_("Sample is mandatory to proceed. Please select..."))

		if not (self.eq_owner):
			frappe.throw(_("Equipment/Storage Owner is mandatory to proceed."))

		if not (self.equipment):
			frappe.throw(_("Equipment is mandatory to proceed."))

		if not (self.location):
			frappe.throw(_("Location is mandatory to proceed."))

		if not (self.material):
			frappe.throw(_("Material tested is mandatory to proceed."))

		if not (self.smp_point):
			frappe.throw(_("Sampling Point is mandatory to proceed."))

		if not (self.smp_condition):
			frappe.throw(_("Sample Condition is mandatory to proceed."))

		if not (self.sample_remarks):
			frappe.throw(_("Sample Remarks is mandatory to proceed."))

		if not (self.material):
			frappe.throw(_("Material tested is mandatory to proceed."))

		if (self.last_location):
			if (self.last_location == self.location):
				if (self.accept_change_in_location):
					frappe.throw(_("Current and last location are same. No need to verify change in location"))			
			else:
				if (not self.accept_change_in_location):
					frappe.throw(_("Current Location does not match with last location. Please verify change in location"))			

		if (self.docstatus < 1):
			self.eq_owner_name = frappe.db.get_value("Customer", self.eq_owner,"customer_legal_name")

	def validate_alternate_issued_to(self):
		if (self.is_alt_issued_to == 1):
			# Throw exception if Alt Customer is blank
			if not self.alt_customer or self.alt_customer == "":
				frappe.throw(_("Alt Customer is required"))

			# Throw exception if Alt Address is blank
			if not self.alt_address:
				frappe.throw(_("Alt Address is required"))
		else:
			# Make alt details blank
			self.alt_customer = None
			self.alt_issued_to = None
			self.alt_address = None
			self.alt_issued_to_address = None

	def update_sample(self):
		smp = frappe.get_doc("Samples", self.sample)
		if (self.workflow_state=="In Process"):
			smp.is_job_card_generated = 1
			smp.status = "In Process"

		if (self.workflow_state == 'Cancelled'):
			smp.is_job_card_generated = 0
			smp.status = 'Received'

		smp.save()
		frappe.msgprint(_("Sample: {0} updated with \
			status: {1}".format(self.sample,smp.status)))

	def create_otr(self):
		issued_to = self.alt_customer if self.is_alt_issued_to else self.customer
		otr = frappe.get_doc({
			"doctype":"Oil Test Reports",
			"sample_id": self.name,
			"sample": self.sample,
			"trufil_container": self.trufil_container,
			"collection_date": self.collection_date,
			"smp_point": self.smp_point,
			"sales_order": self.sales_order,
			"equipment": self.equipment,
			"eq_owner": self.eq_owner,
			"eq_manufacturer": self.eq_manufacturer,
			"eq_sl_no": self.eq_sl_no,
			"voltage_class": self.voltage_class,
			"voltage": self.voltage,
			"owner_eq_id": self.owner_eq_id,
			"location": self.location,
			"loc_area": self.loc_area,
			"loc_location": self.loc_location,
			"loc_cd": self.loc_cd,
			"loc_ccd": self.loc_ccd,
			"issued_to": issued_to,
			"customer": self.customer,
			"workflow_state":"Draft"
			})
		otr.save(ignore_permissions=True)

	def check_duplicate_job_card(self):
		active_jo_list = frappe.get_all('Job Card',
			fields=['name'],
			filters=[['sample', '=', self.sample],['docstatus','<',2]])
		no_of_active_jo = len(active_jo_list)
		if (no_of_active_jo > 0):
			frappe.throw(_("Job Card <a href='#Form/Job%20Card/{0}'>{0}</a> is already exist. Cannot create duplicate Job Card".format(active_jo_list[0].name)))

@frappe.whitelist()
def update_eq_location_details(docname,user=''):
	user=frappe.session.user
	frappe.db.sql("""UPDATE `tabJob Card` AS j 
		INNER JOIN `tabLocations` AS l ON j.location=l.name 
		INNER JOIN `tabEquipments` AS e ON j.equipment=e.name 
		SET 
		j.loc_owner=l.loc_owner, 
		j.loc_area=l.area, 
		j.loc_location=l.location, 
		j.loc_cd=l.cd, 
		j.loc_ccd=l.ccd, 
		j.loc_installation=l.installation, 
		j.owner_eq_id=e.owner_eq_id, 
		j.eq_type=e.eq_type, 
		j.eq_group=e.eq_group, 
		j.eq_manufacturer=e.eq_manufacturer, 
		j.manufacturer_full_name=e.manufacturer_full_name, 
		j.eq_sl_no=e.eq_sl_no, 
		j.eq_yom=e.eq_yom, 
		j.eq_cooling=e.eq_cooling, 
		j.eq_oil_type=e.eq_oil_type, 
		j.eq_oil_qty=e.eq_oil_qty, 
		j.voltage_class=e.voltage_class, 
		j.capacity=e.capacity, 
		j.voltage=e.voltage, 
		j.current=e.current,
		j.eq_phases=e.eq_phases,
		j.modified=CURRENT_TIMESTAMP(), 
		j.modified_by=%s 
		WHERE j.name=%s""",(user,docname))
	frappe.msgprint(_("Location and Equipment Details Updated..."))
	return 1

@frappe.whitelist() 
def get_last_location(docname,eq):
	return frappe.db.sql("""SELECT name,equipment,location,modified,workflow_state 
		FROM `tabJob Card` 
		WHERE equipment=%s AND workflow_state="Approved" AND name!=%s 
		ORDER BY modified DESC 
		LIMIT 1""",(eq,docname), as_dict=True, formatted=True)
