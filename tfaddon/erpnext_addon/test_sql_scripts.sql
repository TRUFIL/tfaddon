----- Update a field using concatenated multiple row value of another table -----

update `tabSamples` set trufil_container=(select GROUP_CONCAT(container_no SEPARATOR ',') 
	from `tabSampling Containers` 
	where parent="SM-1700123" 
	group by parent) 
where name="SM-1700123";

---- Update trufil_container in Samples using SQL
update `tabSamples` as s 
	set s.trufil_container=(select GROUP_CONCAT(container_no SEPARATOR ',')
		from `tabSampling Containers` 
		where parent=s.name  
		group by parent) 
	where s.trufil_container is null;

---- Check the updated Result
select s.name,s.trufil_container, GROUP_CONCAT(c.container_no SEPARATOR ',')  
from `tabSamples` as s 
join `tabSampling Containers` as c on c.parent=s.name 
where s.trufil_container is null  
group by c.parent;

---- Update customer_container in Samples using SQL
update `tabSamples` as s 
	set s.customer_container=(select GROUP_CONCAT(cust_identification SEPARATOR ',') 
		from `tabSampling Containers` 
		where parent=s.name group by parent) 
	where s.customer_container is null;

---- Check the updated Result
select s.name,s.trufil_container,s.customer_container,GROUP_CONCAT(c.cust_identification SEPARATOR ',') 
from `tabSamples` as s 
join `tabSampling Containers` as c on c.parent=s.name 
where c.cust_identification is not null and s.customer_container is null 
group by c.parent;	
---^^ Tested Code ^^---