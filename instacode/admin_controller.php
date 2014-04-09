<pre><?php

include ('dbconnect.php');

$action = $_REQUEST['action'];
$page = $_REQUEST['page'];

if ($action == 'addtosection') {

	$section = mysql_escape_string($_REQUEST['section']);
	
	if ($page == "position") {		
		$creation_date = $_REQUEST['creation_date'];
		$owner_id = $_REQUEST['owner_id'];
	}
	else {
		$id =  $_REQUEST['id'];
		$id = explode(".", $id);
		$creation_date = $id[0];
		$owner_id = $id[1];	
	}
	
	// force sections to exclusively contain elements
	switch ($section) {
	
		case "sparkday":	
			$makeOthersNull = "onset = null, shame = null, trash = null";
			break;
		case "onset":	
			$makeOthersNull = "sparkday = null, shame = null, trash = null";
			break;	
		case "shame":	
			$makeOthersNull = "sparkday = null, onset = null, trash = null";
			break;	
		case "trash":	
			$makeOthersNull = "sparkday = null, onset = null, shame = null";
			break;	
	}
	
	if ($section == 'trash') {
		$query = "UPDATE media
		SET trash = 1, $makeOthersNull
		WHERE owner_id = $owner_id AND creation_date = $creation_date";		
	}
	else {
		$position = max_section_position($section) + 1;
		$query = "UPDATE media
		SET $section = 1, position = $position, approved = 1, $makeOthersNull
		WHERE owner_id = $owner_id AND creation_date = $creation_date";	
		
	}


	echo $query . "\n";
	$result = mysql_query($query);	

}

if ($action == 'order') {

	// update the position of the images in a given section
	
	$section = mysql_escape_string($_REQUEST['section']);
	$positions = $_REQUEST['pos'];
	
	
	$i = 1;
	foreach ($positions as $pos) {
		
		$pos = mysql_real_escape_string($pos);
		$pos = explode(".", $pos);
		
		$owner_id = $pos[2];
		$creation_date = $pos[1];
		$pos = $pos[0];		

		$query = "UPDATE media
		SET position = $i
		WHERE owner_id = $owner_id AND creation_date = $creation_date";		
				
		echo $query . "\n";
		$result = mysql_query($query);
				
		$i++;
	}
	
}


function max_section_position($section) {
	$max = 0;
	
	
	$query = "SELECT MAX(position) FROM media WHERE $section = 1";
	echo "\n $query \n\n";
	$result = mysql_query($query);
	while($row = mysql_fetch_array($result)) {
		$max = $row[0];
	}
	
	return $max;
}

?>
</pre>