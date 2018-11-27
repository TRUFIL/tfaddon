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
		j.eq_phases=e.eq_phases,
		j.modified=CURRENT_TIMESTAMP(), 
		j.modified_by="sayali@trufil.com" 
	WHERE j.name="TL/SM/18/01751" 