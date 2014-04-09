<?php

header("Content-type: application/json"); 
header('Content-Type: text/javascript; charset=utf8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Max-Age: 3628800');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

$callback = $_GET['callback'];

include ('config.php');

mysql_connect($db_host, $db_user, $db_passwd);
@mysql_select_db($db_name) or die ("Could not connect to " . $db_name);


$section = $_GET['section'];
$section_params = get_section_query($section);

$media = get_section_json($section_params);

echo $callback.'('.$media.');';

function get_section_query($section) {
	$section = mysql_escape_string($section);
	$sections_query = "SELECT query FROM sections WHERE section = '" . $section.  "'";
	$sections_query = mysql_query($sections_query);
	
	while ($row = mysql_fetch_array($sections_query)) {
		$query = $row[0];
	}
	return $query;
}

function get_section_json($params) {
	$q = "SELECT * FROM media WHERE " . $params;
	$sth = mysql_query($q);
	$rows = array();
	while($r = mysql_fetch_assoc($sth)) {
	    $rows[] = $r;
	}
    return stripslashes(json_encode($rows));        
}




?>