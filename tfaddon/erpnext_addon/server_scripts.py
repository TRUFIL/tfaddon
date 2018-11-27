# frappe.model.naming.py
def set_name_by_naming_series(doc):
	"""Sets name by the `naming_series` property"""
	if not doc.naming_series:
		doc.naming_series = get_default_naming_series(doc.doctype)

	if not doc.naming_series:
		frappe.throw(frappe._("Naming Series mandatory"))

	##### Modified on 16-01-2018
	if not doc.company:
		frappe.throw(frappe._("Company mandatory"))
	else:
		company = frappe.get_doc("Company",doc.company)

	if doc.doctype in ["Sales Invoice","Delivery Note"]:
		if doc.is_return:
			doc.naming_series = doc.naming_series + "RET-"

	key = company.abbr + "-" + doc.naming_series + ".YY.-.#####"

	doc.name = make_autoname(key, '', doc)
	##### Modified on 16-01-2018


# erpnext.selling.doctype.product_bundle.product_bundle.py
def get_non_bundled_item_code(doctype, txt, searchfield, start, page_len, filters):
	from erpnext.controllers.queries import get_match_cond

	return frappe.db.sql("""select name, item_name, description from tabItem
		where is_product_bundle=0 and is_sales_item=1 
		and %s like %s %s limit %s, %s""" % (searchfield, "%s",
		get_match_cond(doctype),"%s", "%s"),
		("%%%s%%" % txt, start, page_len))

# erpnext.stock.doctype.item.item.py
class Item(WebsiteGenerator):
	def validate(self):
		self.validate_product_bundle()

	def validate_product_bundle(self):
		if (self.is_product_bundle):
			if self.is_stock_item:
				frappe.throw(_("product bundle must be a non-stock item."))

			if self.is_fixed_asset:
				frappe.throw(_("product bundle must be a non-asset item."))

			if self.is_purchase_item:
				frappe.throw(_("product bundle must be a non-purchase item."))

# erpnext.controllers.selling_controller.py

class SellingController(StockController):
	def validate_order_type(self):
		# valid_types = ["Sales", "Maintenance", "Shopping Cart"]
		valid_types = ["Services","Sales", "Maintenance", "Shopping Cart"]
		if not self.order_type:
			self.order_type = "Sales"
		elif self.order_type not in valid_types:
			throw(_("Order Type must be one of {0}").format(comma_or(valid_types)))

# erpnext.selling.doctype.sales_order.sales_order.py
def make_sales_invoice(source_name, target_doc=None, ignore_permissions=False):
	doclist = get_mapped_doc("Sales Order", source_name, {
		"Sales Order": {
			"doctype": "Sales Invoice",
			"field_map": {
				"party_account_currency": "party_account_currency",
				"name": "sales_order" #### Added on 16-01-2018
			},
			"validation": {
				"docstatus": ["=", 1]
			}
		}
	})

# erpnext.selling.doctype.sales_order.sales_invoice.py

class SalesInvoice(SellingController):
	# ...
	# L-105
	def validate(self):
		# ...
		# ...
		# As a Trufil policy default ledger is not allowed for creating Invoice
		self.check_debit_to()

	def check_debit_to(self):
		if "Debtors" in self.debit_to:
			frappe.throw(_("Please create appropriate ledger and attach it with the customer before creating invoice"))			
	# ...
	# L-194
	def update_status_updater_args(self):
		# ...
		# L-229
		# Update Sales Order in case of Return/Credit Note is generated
		if cint(self.update_sales_order):
			self.status_updater.extend([{
				'source_dt': 'Sales Invoice Item',
				'target_dt': 'Sales Order Item',
				'join_field': 'so_detail',
				'target_field': 'billed_amt',
				'target_ref_field': 'amount',
				'target_parent_dt': 'Sales Order',
				'target_parent_field': 'per_billed',
				'source_field': 'amount',
				# 'join_field': 'so_detail',
				'percent_join_field': 'sales_order',
				'status_field': 'billing_status',
				'keyword': 'Billed',
				'overflow_type': 'billing'
			}
		])

