<?php

/* include ('config.php');

mysql_connect($db_host, $db_user, $db_passwd);
@mysql_select_db($db_name) or die ("Could not connect to " . $db_name); */


function get_section_query($section) {
	$section = mysql_escape_string($section);
	$sections_query = "SELECT query FROM sections WHERE section = '" . $section.  "'";
	$sections_query = mysql_query($sections_query);
	
	while ($row = mysql_fetch_array($sections_query)) {
		$query = $row[0];
	}
	
	return $query;
}

?>