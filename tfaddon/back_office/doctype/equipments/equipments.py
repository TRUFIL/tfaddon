# -*- coding: utf-8 -*-
# Copyright (c) 2015, DGSOL InfoTech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import _
import tfaddon

class Equipments(Document):
	def onload(self):
		pass

	def before_insert(self):
		pass
	
	def validate(self):
		self.validate_mandatory_field()

		# Update Serial Number
		if (self.eq_sl_no == "#"):
			self.eq_sl_no = tfaddon.generate_unique_serial_no()

		self.update_read_only_fields()

	def on_update(self):
		pass

	def on_submit(self):
		pass
	
	def on_cancel(self):
		pass
	
	def on_trash (self):
		pass

	def validate_mandatory_field(self):
		if not self.eq_manufacturer:
			frappe.throw(_("Manufacturer is required. Select 'Unknown' if not available"))

		if not self.eq_sl_no:
			frappe.throw(_("Manufacturer's Serial No is required. Type # to generate"))

		if (self.eq_yom):
			import re, datetime
			p = re.compile("[1]{1}[9]{1}[0-9]{2}")
			q = re.compile("[2]{1}[0]{1}[0-9]{2}")
			if not (p.match(self.eq_yom) or q.match(self.eq_yom)):
				frappe.throw(_("Valid Manufacturing Year must be between 1900 to Current Year"))
			cur_year = frappe.utils.data.cint(tfaddon.cur_year())
			if (frappe.utils.data.cint(self.eq_yom) > cur_year):
				frappe.throw(_("Manufacturing Year cannot be future year"))

		# Oil Type is Mandatory 
		if not self.eq_oil_type:
			frappe.throw(_("Oil Type is required"))


		# validate equipment parameters on equipment type
		if (self.eq_group != "CONTAINER"):
			# following Items are mandatory for all equipments except Containers
			if not (self.eq_oil_qty and self.eq_oil_qty != 0):
				frappe.throw(_("Oil Quantity is required"))

			if (not self.voltage_class or self.voltage_class == "NA"):
				frappe.throw(_("Specify appropriate Voltage Class"))

			if (self.eq_group == "TRANSFORMER" or self.eq_group == "INSTRUMENT"):
				if (not self.eq_capacity or self.eq_capacity == 0):
					frappe.throw(_("Rating is Mandatory"), frappe.MandatoryError)
				if (not self.eq_pv or self.eq_pv == 0):
					frappe.throw(_("Primary Voltage is Mandatory"), frappe.MandatoryError)
				if (not self.eq_sv or self.eq_sv == 0):
					frappe.throw(_("Secondary Voltage is Mandatory"), frappe.MandatoryError)
			elif (self.eq_group == "CURRENT"):
				if (not self.eq_capacity or self.eq_capacity == 0):
					frappe.throw(_("Rating is Mandatory"), frappe.MandatoryError)
				if (not self.eq_pc):
					frappe.throw(_("Primary current is Mandatory"), frappe.MandatoryError)
				if (not self.eq_sc):
					frappe.throw(_("Secondary current is Mandatory"), frappe.MandatoryError)
			elif (self.eq_group == "REACTOR"):
				if (not self.eq_capacity or self.eq_capacity == 0):
					frappe.throw(_("Rating is Mandatory"), frappe.MandatoryError)
			elif (self.eq_group == "OCB"):
				if (not self.eq_pc or self.eq_pc == 0):
					frappe.throw(_("Primary current is Mandatory"), frappe.MandatoryError)
			else:
				if (not self.eq_pv or self.eq_pv == 0):
					frappe.throw(_("Primary Voltage is Mandatory"), frappe.MandatoryError)

			if not (self.eq_phases):
				frappe.throw(_("Please select appropriate No of Phases"), frappe.MandatoryError)

			if (self.eq_cooling == "ONAN"):
				self.eq_rating1 = self.eq_capacity
			else:
				self.eq_rating1 = 0
		else:
			self.eq_phases = "NA"
			self.voltage_class = "NA"
			self.eq_oil_qty = 0

	def update_read_only_fields(self):
		self.title = self.eq_manufacturer + '-' + self.eq_sl_no
		self.capacity = self.get_capacity()
		self.voltage = self.get_voltage()
		self.current = self.get_current()

	def get_capacity(self):
		if (self.eq_group == "INSTRUMENT" or self.eq_group == "CURRENT"):
			unit = " VA"
		elif (self.eq_group == "REACTOR"):
			unit = " kVAr"
		else:
			unit = " kVA"

		if (self.eq_group != "CONTAINER" and self.eq_group != "OCB"):
			if (self.eq_capacity):
				capacity = str(self.eq_capacity) + unit
			else:
				capacity = "NS"
		elif (self.eq_group == "OCB"):
			capacity = str(self.eq_pc) + " Amps"

		else:
			capacity = "NA"

		return capacity
		
	def get_voltage(self):
		if(self.eq_group in ["CURRENT","REACTOR","OCB" ,"CONTAINER"]):
			voltage = "NA"
		else:
			if (self.eq_pv and self.eq_sv and self.eq_tv):
				#voltage = str(self.eq_pv) + "/" + str(self.eq_sv) + ("/" + str(self.eq_tv)) + " Volts"
				voltage = "/".join([str(self.eq_pv),str(self.eq_sv),str(self.eq_tv)]) + " Volts"
			elif (self.eq_pv and self.eq_sv):
				#voltage = str(self.eq_pv) + "/" + str(self.eq_sv) + ("/" + str(self.eq_tv)) + " Volts"
				voltage = "/".join([str(self.eq_pv),str(self.eq_sv)]) + " Volts"
			elif (self.eq_pv):
				voltage = str(self.eq_pv) + " Volts"
			else:
				voltage = "NS"

		return voltage

	def get_current(self):
		if(self.eq_group in ["CURRENT","OCB"]):
			if (self.eq_pc and self.eq_sc):
				current = str(self.eq_pc) + "/" + str(self.eq_sc) + " Amps"
			elif (self.eq_pc):
				current = str(self.eq_pc) + " Amps"
			else:
				current = "NS"
		else:
			current = "NA"
			
		return current

	def get_phases(self):
		if (self.eq_group != "CONTAINER"):
			if (self.eq_phases):
				phases = self.eq_phases
			else:
				phases = "NS"
		else:
			phases = "NA"

		return phases

