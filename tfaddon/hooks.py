# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "tfaddon"
app_title = "TRUFIL Addon"
app_publisher = "DGSOL InfoTech"
app_description = "Addon customisation for TRUFIL"
app_icon = "octicon octicon-file-directory"
app_color = "yellow"
app_email = "info@dgsol-in.com"
app_license = "MIT"

develop_version = '1.x.x-beta'

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/tfaddon/css/tfaddon.css"
# app_include_js = "/assets/tfaddon/js/tfaddon.js"

# include js, css files in header of web template
# web_include_css = "/assets/tfaddon/css/tfaddon.css"
# web_include_js = "/assets/tfaddon/js/tfaddon.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "tfaddon.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "tfaddon.install.before_install"
# after_install = "tfaddon.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "tfaddon.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
	# "Sales Invoice": {
		# "autoname": "tfaddon.trufil_addon.sales_invoice.si_autoname"
	# },
	# "Sales Order": {
		# "autoname": "tfaddon.trufil_addon.sales_order.si_autoname"
	# },
	# "Quotation": {
		# "autoname": "tfaddon.trufil_addon.sales_quotation.si_autoname"
	# },

}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"tfaddon.tasks.all"
# 	],
# 	"daily": [
# 		"tfaddon.tasks.daily"
# 	],
# 	"hourly": [
# 		"tfaddon.tasks.hourly"
# 	],
# 	"weekly": [
# 		"tfaddon.tasks.weekly"
# 	]
# 	"monthly": [
# 		"tfaddon.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "tfaddon.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "tfaddon.event.get_events"
# }

# Fixures
# -------
# fixtures = ["Custom Field"]
fixtures = ["Custom Field", "Custom Script", "Property Setter", "Print Format", "Report", "Workflow", "Workflow State", "Workflow Action"]
