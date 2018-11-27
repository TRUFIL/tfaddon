# -*- coding: utf-8 -*-
# Copyright (c) 2017, DGSOL InfoTech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import _
import tfaddon

class VoltageClass(Document):
	# Generate ID automatically
	def autoname(self):
		self.name = generate_voltage_class_id(self.voltage_class)

def generate_voltage_class_id(voltage_class):
	from frappe.utils import cstr, flt
	if (flt(voltage_class, 2) == 0.0):
		return "Not Applicable"
	else:
		return cstr(round(voltage_class, 2)) + " kV"

