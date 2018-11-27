# -*- coding: utf-8 -*-
# Copyright (c) 2018, DGSOL InfoTech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CertificateValidation(Document):
	def autoname(self):
		self.name = str(self.certification_by) + "/" + str(self.certification_number)
