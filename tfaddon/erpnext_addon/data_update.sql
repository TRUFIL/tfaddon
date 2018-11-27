---- Create Job Card from OTR ----
INSERT INTO `tabJob Card` (name,creation,modified,modified_by,owner, docstatus,
	sample,transaction_date,eq_owner,equipment,loc_owner,location,sales_order, 
	material,smp_point,smp_condition,sample_remarks, 
	is_alt_issued_to,alt_issued_to_address,
	alt_issued_to,alt_address,alt_customer,workflow_state)  
	SELECT o.sample_id,o.creation,o.modified,o.modified_by,o.owner,1,
	o.sample,o.testing_date,o.eq_owner,o.equipment,o.eq_owner,o.location,o.sales_order,
	o.material,o.smp_point,o.smp_condition,o.sample_remarks,
	o.is_alt_issued_to,o.alt_issued_to_address,
	o.alt_issued_to,o.alt_address,o.alt_customer,o.workflow_state 
	FROM `tabOil Test Reports` AS o  
	WHERE o.workflow_state!='Cancelled' and o.docstatus=1 
	ORDER BY o.sample_id;

---- Update workflow_state in Job Card to "In Process" for "Draft"
UPDATE `tabJob Card` 
 	SET workflow_state="In Process"
 	WHERE workflow_state="Draft"

---- Update is_report_generated to 1 for workflow_state="Approved"
UPDATE `tabJob Card` 
	SET is_report_generated=1
	WHERE workflow_state="Approved"

---- Update Job Cards with Sample Details ----
UPDATE `tabJob Card` AS j 
	INNER JOIN `tabSamples` AS s ON j.sample=s.name 
	SET 
		j.collected_by=s.collected_by,
		j.trufil_container=s.trufil_container,
		j.customer_container=s.customer_container,
		j.collection_date=s.collection_date,
		j.smp_source=s.smp_source,
		j.smp_type=s.smp_type,
		j.weather_condition=s.weather_condition,
		j.receipt_condition=s.receipt_condition,
		j.eq_load=s.eq_load,
		j.eq_ott=s.eq_ott,
		j.eq_wtt=s.eq_wtt,
		j.receipt_date=s.receipt_date,
		j.laboratory=s.laboratory,
		j.sales_order=s.sales_order,
		j.sampling_request=s.sampling_request,
		j.sampler_remarks=s.sampler_remarks;

---- Update Job Cards with Sample Details ----
UPDATE `tabJob Card` AS j 
	INNER JOIN `tabSales Order` AS s ON j.sales_order=s.name 
	SET 
		j.sales_order_date=s.transaction_date,
		j.po_no=s.po_no,
		j.po_date=s.po_date,
		j.issued_to=s.customer_legal_name,
		j.issued_to_address=s.address_display,
		j.customer=s.customer;


---- Update Job Cards with Equipment and Location Details ----
UPDATE `tabJob Card` AS j 
	INNER JOIN `tabLocations` AS l ON j.location=l.name 
	INNER JOIN `tabEquipments` AS e ON j.equipment=e.name 
	SET 
		j.loc_owner=l.loc_owner, 
		j.loc_area=l.area, 
		j.loc_location=l.location, 
		j.loc_cd=l.cd, 
		j.loc_ccd=l.ccd, 
		j.loc_installation=l.installation, 
		j.loc_is_critical=l.is_critical, 
		j.eq_owner=e.eq_owner, 
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
		j.eq_phases=e.eq_phases;

---- Update Job Cards with Equipment Owner Name from Customer
UPDATE `tabJob Card` AS j  
	INNER JOIN `tabCustomer` AS c ON j.eq_owner=c.name 
	SET  
		j.eq_owner_name=c.customer_legal_name;		

---- Update smp_point in Sample using SQL --
UPDATE `tabSamples` set smp_point="Bottom" where smp_point="Equipment-Bottom";
UPDATE `tabSamples` set smp_point="Top" where smp_point="Equipment-Top";
UPDATE `tabSamples` set smp_point="OLTC" where smp_point like "Equipment-OLTC%";
UPDATE `tabSamples` set smp_point="Others" where smp_point like "Equipment-%";

---- Update trufil_container in Samples using SQL
UPDATE `tabSamples` as s 
	SET s.trufil_container=(SELECT GROUP_CONCAT(container_no SEPARATOR ',')
		FROM `tabSampling Containers` 
		WHERE parent=s.name  
		group by parent) 
	WHERE s.trufil_container is null;

---- Update customer_container in Samples using SQL
UPDATE `tabSamples` as s 
	SET s.customer_container=(SELECT GROUP_CONCAT(cust_identification SEPARATOR ',') 
		FROM `tabSampling Containers` 
		WHERE parent=s.name group by parent) 
	WHERE s.customer_container is null;

---- Update is_job_card_generated & is_report_generated in Samples based on 
---- Job Card Doc Status is Approved abd docstatus=1
UPDATE `tabSamples` AS s 
	INNER JOIN `tabJob Card` AS j ON j.sample=s.name 
	SET 
		s.is_job_card_generated=1, 
		s.is_report_generated=1
	WHERE j.workflow_state = "Approved" and j.docstatus=1;

---- Update created_by & approved_by in Oil Test Report with null
UPDATE `tabOil Test Reports` 
	SET 
	approved_by=null,
	created_by=null 
	WHERE approved_by like ".%";