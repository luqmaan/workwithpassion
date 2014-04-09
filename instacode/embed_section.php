<?php

include ('dbconnect.php');

$resizePercent = $_REQUEST['resizePercent'];
if (!is_numeric($resizePercent))
	$resizePercent = 1;

$width = 600 * $resizePercent;

if ($width <= 150)
	$resolution_url = "thumbnail_url";
elseif ($width <= 306)
	$resolution_url = "low_res_url";
else
	$resolution_url = "standard_res_url";	


$section = mysql_escape_string($section);

if ($section == "clock")
	$sections_query = "SELECT * FROM media WHERE TRASH != 1 OR TRASH IS NULL ORDER BY creation_date DESC LIMIT 15";	
else
	$sections_query = "SELECT * FROM media WHERE $section = 1 AND (TRASH != 1 OR TRASH IS NULL) ORDER BY position ASC";

$sections_query = mysql_query($sections_query);
$html = "";
while ($row = mysql_fetch_array($sections_query)) {
	$html .= '<span id="' . $row["owner_id"] . '_' . $row["creation_date"] . '" class="layer instagram">';
	$html .= '<img src="'  . $row[$resolution_url] . '" style="width:' . $width . 'px" />';
	$html .= '</span>';
}

echo $html;

?>