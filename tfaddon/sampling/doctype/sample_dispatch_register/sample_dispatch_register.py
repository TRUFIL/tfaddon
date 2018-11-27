# -*- coding: utf-8 -*-
# Copyright (c) 2017, DGSOL InfoTech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import frappe.utils
from frappe.utils.data import getdate
from frappe.model.document import Document
from frappe import _, throw

class SampleDispatchRegister(Document):
	def onload(self):
		pass
		
	def validate(self):
		self.update_read_only_fields()
		self.validate_mandatory_field()

	def before_submit(self):
		self.validate_ready_to_dispatch_sample()

	def on_submit(self):
		self.update_sample_status()
		self.update_containers_status()

	def validate_mandatory_field(self):
		# Check for future Dates
		if self.dispatch_date:
			if getdate(self.dispatch_date) > getdate():
				frappe.throw(_("Dispatch Date cannot be future date"))
		else:
			frappe.throw(_("Dispatch Date is required"))

		# Check for valid Dispatch By
		if not self.dispatch_by:
			frappe.throw(_("Dispatched By is required"))

		# Check for Dispatch Mode
		if self.dispatch_mode in ["Courier", "Booking", "Bus", "Train", "Hand"]:
			if not self.person_courier:
				frappe.throw(_("Name of person/Courier is required"))
		else:
			frappe.throw(_("Please select Dispatch Mode"))

		if not self.ref_no and self.dispatch_mode in ["Courier", "Booking"]:
			frappe.throw(_("Reference No is required"))

		if not self.contact_no and self.dispatch_mode in ["Bus", "Train", "Hand"]:
			frappe.throw(_("Contact No is required"))

	def update_read_only_fields(self):
		self.title = self.bag_no + "-" + self.laboratory + "-" + self.name

	def get_no_of_samples(self):
		smp = frappe.db.sql("""SELECT FORMAT(COUNT(s.name),0) as samples 
			FROM `tabSamples` as s 
			WHERE s.docstatus = 1 AND s.status = 'Collected' AND s.bag_no = '{0}' """.format(self.bag_no), as_dict=True, formatted=True)

		return smp[0]["samples"]

	def get_no_of_bottles(self):
		return frappe.db.count("Sampling Containers", 
			filters={"docstatus":1, "bag_no": self.bag_no})

	def get_all_samples(self):
		return frappe.get_all("Samples", 
			filters = {"bag_no":self.bag_no, "status":"Collected", "docstatus":1})


	def update_sample_status(self):
		samples = frappe.get_all("Samples", 
			filters = {"bag_no":self.bag_no, "status":"Collected", "docstatus":1})

		for s in samples:
			doc = frappe.get_doc("Samples",s.name)
			doc.dispatch_id = self.name
			doc.dispatch_date = self.dispatch_date
			doc.dispatched_laboratory = self.laboratory
			doc.dispatch_by = self.dispatch_by
			doc.dispatch_mode = self.dispatch_mode
			doc.ref_no = self.ref_no
			doc.status = "Dispatched"
			doc.save()

	def update_containers_status(self):
		bottles = frappe.get_all("Sampling Containers", 
			filters = {"bag_no":self.bag_no, "status":"Collected", "docstatus":1})

		for bot in bottles:
			doc = frappe.get_doc({"doctype":"Sampling Containers", "bag_no": doc.bag_no})
			doc.status = "Dispatched"
			doc.save()

	def validate_ready_to_dispatch_sample(self):
		slist = [row.status for row in frappe.get_all("Samples", 
			fields=["name", "status"], 
			filters = {"bag_no":self.bag_no})
		]
		total = len(slist)
		collected = slist.count("Collected")
		invalid = total - collected
		if invalid > 0:
			self.docstatus = 0
			frappe.throw(_("{0} samples out of {1} are not ready for dispatch".format(invalid,total)))
		