# -*- coding: utf-8 -*-
# Copyright (c) 2017, DGSOL InfoTech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, tfaddon
from frappe import _, msgprint, throw
from frappe.model.document import Document
from frappe.utils import cint, flt, cstr, getdate, get_fullname

class OilTestReports(Document):
	def onload (self):
		pass

	def on_trash(self):
		frappe.db.sql("""update `tabSamples` set status='Received' where name=%s""",
			self.sample)

	def before_submit(self):
		self.report_no = frappe.model.naming.make_autoname("TL/OTR/.YY./", "Oil Test Reports")
		self.report_date = getdate()
		self.approved_on = getdate()
		self.approved_by = get_fullname(frappe.session.user)

		if self.report_date:
			certificate_list = frappe.db.sql("""SELECT * FROM `tabCertificate Validation` WHERE %s BETWEEN validity_from AND validity_upto""", (self.report_date), as_dict=True)
			if certificate_list:
				self.print_accreditation = 1
				frappe.db.set_value("Oil Test Reports", self.name, "print_accreditation", 1)
				frappe.db.commit()

				self.certificate_number = certificate_list[0].certification_number
				frappe.db.set_value("Oil Test Reports", self.name, "certificate_number", certificate_list[0].certification_number)
				frappe.db.commit()
			elif certificate_list:
				if self.print_accrediation:
					prev_certification_list = frappe.db.sql("""SELECT * FROM `tabCertificate Validation` WHERE validity_upto < %s ORDER BY validity_upto DESC LIMIT 1""", (self.report_date), as_dict=True)
					if prev_certification_list:
						self.certificate_number = prev_certification_list[0].certification_number

	def on_update_after_submit(self):
		if self.print_accrediation:
			prev_certification_list = frappe.db.sql("""SELECT * FROM `tabCertificate Validation` WHERE validity_upto < %s ORDER BY validity_upto DESC LIMIT 1""", (self.report_date), as_dict=True)
			if prev_certification_list:
				self.certificate_number = prev_certification_list[0].certification_number

		if not self.print_accrediation:
			self.certificate_number = ''
			frappe.db.set_value("Oil Test Reports", self.name, "certificate_number", '')
			frappe.db.commit()


	def on_submit(self):
		self.update_jc()
		self.update_sample()

	def before_cancel(self):
		self.cancelled_on = getdate()

	def on_cancel(self):
		self.update_jc()
		self.update_sample()

	def update_jc(self):
		jc = frappe.get_doc("Job Card", self.sample_id)
		if (self.workflow_state == 'Approved'):
			jc.is_report_generated = 1
			jc.report_date = self.report_date

		if (self.workflow_state == 'Cancelled'):
			jc.docstatus=2
			jc.cancelled_on = getdate()

		jc.workflow_state = self.workflow_state
		jc.save()
		
		frappe.msgprint(_("Job Card: {0} updated with \
			status: {1}".format(self.sample_id,jc.workflow_state)))

	def update_sample(self):
		smp = frappe.get_doc("Samples", self.sample)
		if (self.workflow_state == 'Approved'):
			smp.is_report_generated = 1
			smp.status = "Completed"

		if (self.workflow_state == 'Cancelled'):
			smp.is_job_card_generated = 0
			smp.is_report_generated = 0
			smp.status = "Received"

		smp.save()
		frappe.msgprint(_("Sample: {0} updated with \
			status: {1}".format(self.sample,smp.status)))		

	def validate(self):
		if self.is_new():
			self.check_duplicate_otr()
		else:
			if not self.testing_date:
				frappe.throw("Testin Date is Mandatory.")
			if not (self.is_ost or self.is_dga or self.is_furan):
				frappe.throw(_("Please select the appropriate tests for which this certificate is generated"))

			if (self.is_ost):
				if not (self.ost_interpretation and self.ost_frequency):
					frappe.throw(_("OST Interpretation and Frequency is required"))

			if (self.is_dga):
				if not (self.dga_interpretation and self.dga_frequency):
					frappe.throw(_("DGA Interpretation and Frequency is required"))

			if (self.is_furan):
				if not (self.furan_interpretation and self.fruan_frequency):
					frappe.throw(_("Furan Interpretation and Frequency is required"))

			if not (self.recommendation):
				frappe.throw(_("Overall recommendation is required"))

			if (self.docstatus == 0):
				self.update_read_only_fields()

			# update Trufil's Container if missing
			if not self.trufil_container:
				tc = [c.container_no for c in frappe.get_all("Sampling Containers", fields=["container_no"], filters={"parent":self.sample})]
				self.trufil_container = "/".join(tc)

			if self.workflow_state=="Pending Approval":
				if not self.created_by:
					self.submitted_on = getdate()
					self.created_by = get_fullname(frappe.session.user)
				self.update_jc()

			if self.workflow_state=="Returned":
				self.returned_on = getdate()
				self.created_by = None
				self.update_jc()

	def update_read_only_fields(self):
		if (self.is_dga):
			self.dga_tdcg = self.calculate_tdcg()
			if (self.dga_tgc != "NT" and flt(self.dga_tgc,6) > 0.000001):
				self.dga_tdcg_tcg = cstr(round(flt(self.dga_tdcg,3) / (flt(self.dga_tgc,3) * 100),4))
			else:
				frappe.throw(_("Total Gas Content is required"))
		if (self.is_furan):
			self.furan_tfc = self.calculate_tfc()

	def calculate_tdcg(self):
		tdcg_fields = [self.dga_h2, self.dga_co, self.dga_ch4, self.dga_c2h6, self.dga_c2h4, self.dga_c2h2, self.dga_c3h8, self.dga_c3h6]
		return calculate_total(tdcg_fields)

	def calculate_tfc(self):
		tfc_fields = [self.furan_5h2f, self.furan_2fa, self.furan_2f, self.furan_2a, self.furan_5m2f]
		return calculate_total(tfc_fields)

	def check_duplicate_otr(self):
		active_otr_list = frappe.get_all('Oil Test Reports', 
			fields=['name'], 
			filters=[['sample_id', '=', self.sample_id],['docstatus','<',2]])
		no_of_active_otr = len(active_otr_list)
		if (no_of_active_otr > 0):
			frappe.throw(_("<a href='#Form/Oil%20Test%20Reports/{0}'>{0}</a> is already exist for given sample_id. Cannot create duplicate Job Card".format(active_otr_list[0].name)))

def calculate_total(field_list, precision = 2):
	total=0.0
	for fld in field_list:
		if (fld == "NT" or fld == "ND"):
			continue
		elif (flt(fld, precision) > 0.000001):
			total += flt(fld,2)
	return total

