# -*- coding: utf-8 -*-
# Copyright (c) 2015, DGSOL InfoTech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document

class Locations(Document):
	# before inserting or updating
	def before_insert(self):
		pass
	
	# before inserting or updating
	def validate(self):
		self.validate_mandatory_field()
		self.generate_title()
		self.update_unique_location()
	
	# after saving
	def on_update(self):
		pass
	# when document is set as submitted
	def on_submit(self):
		pass
	
	# when document is set to be cancellec
	def on_cancel(self):
		pass
	
	# before it is about to be deleted
	def on_trash (self):
		pass

	# validate all the required fields are properly filled up
	def validate_mandatory_field(self):
		if not self.area:
			frappe.throw(_("Plant is Required. Not saved..."))

		if not self.location:
			frappe.throw(_("Substation is Required. Not saved..."))

		if not self.cd:
			frappe.throw(_("Equipment Designation is Required. Not saved..."))

		if not (self.ccd):
			frappe.msgprint(_("Owner’s Location ID is missing. Please update ASAP."))
			
	# update all the derived fields 
	def generate_title(self):
		if (self.area and self.location and self.cd):
				self.title = self.area.strip() + " | " + self.location.strip() + " | " + self.cd.strip()
		else:
			self.title = self.location.strip() + " | " + self.cd.strip()

		if (self.ccd):
			self.title += " | " + self.ccd.strip()

	def update_unique_location(self):
		self.unique_field = self.loc_owner+'|'+self.area+'|'+self.location+'|'+self.cd
