# -*- coding: utf-8 -*-
# Copyright (c) 2017, DGSOL InfoTech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import frappe.utils
from frappe.utils import cstr, flt, getdate, comma_and, cint
from frappe.model.document import Document
from frappe import _
from datetime import datetime, date, time


class SamplingRequest(Document):
	def validate(self):
		if (self.is_new()):
			self.validate_new_document()

			# Update action_status
			if (not self.action_status):
				if (getdate(self.est_start_date) - getdate(self.creation)).days > 2:
					self.action_status = "Normal"
				else:
					self.action_status = "Urgent"

	def before_submit(self):
		if (self.workflow_state == "In Process"):
			if not (self.assigned_to and self.contact_name and self.contact_no and self.req_remarks):
				self.workflow_state = "To Assign"
				self.docstatus = 0
				frappe.throw(_("Assignment details are required before Assign action"))

	def on_submit(self):
		pass

	def on_cancel(self):
		pass
	
	def validate_new_document(self):
		if self.est_start_date:
			if getdate(self.est_start_date) < getdate():
					frappe.throw(_("Start Date cannot be past date"))
		else:
			frappe.throw(_("Start Date is Required"))
	
		if (self.est_duration == 0):
			frappe.throw(_("Activity Duration must not be 0"))

		if (self.est_samples == 0):
			frappe.throw(_("Estimated No of Samples must not be 0"))

		if (self.est_containers < self.est_samples):
			frappe.throw(_("Estimated No of Bottles can not be less than number of samples"))

	def declare_req_closed(self, args):
		# On 11-09-2017 Sarabjeet demanded that a Sampling request can be closed even if there are 0 samples 
		# available under the given Sampling Request and hence Validation made null 
		frappe.db.set(self, 'job_done_by', args["job_done_by"])
		frappe.db.set(self, 'act_start_date', args["act_start_date"])
		frappe.db.set(self, 'act_duration', args["act_duration"])
		frappe.db.set(self, 'response_remarks', args["response_remarks"])
		frappe.db.set(self, 'closer_date', getdate())
		frappe.db.set(self, 'workflow_state', 'Closed')
		frappe.db.set(self, 'act_samples', self.get_no_of_samples())
		frappe.db.set(self, 'act_containers', self.get_no_of_bottles())

	def declare_req_cancelled(self, args):
		if self.has_samples():
			frappe.throw(_("Cannot set as Cancelled because samples are already created under this sampling request."))
		else:
			frappe.db.set(self, 'response_remarks', args["response_remarks"])
			frappe.db.set(self, 'closer_date', getdate())
			frappe.db.set(self, 'workflow_state', 'Cancelled')
			frappe.db.set(self, 'docstatus', 2)

	def has_samples(self):
		if (self.get_no_of_samples() > 0):
			return 1
		else:
			return 0

	def get_no_of_samples(self):
		return frappe.db.count("Samples", filters={"sampling_request":self.name})

	def get_no_of_bottles(self):
		return frappe.db.count("Sampling Containers", filters={"sampling_request":self.name})

