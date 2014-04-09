<?php

include('config.php');

$code = $_GET['code'];

$grant_type = 'authorization_code';
$url = 'https://api.instagram.com/oauth/access_token';

echo "<p><a href='https://api.instagram.com/oauth/authorize/?client_id=$client_id&redirect_uri=//save_user.php&response_type=code'>Authorize application</a></p>";

if ($code == null) {
	exit();
}
else echo "Authorization code " . $code . " received.";


function save_user($user_json) {

	global $db_host, $db_user, $db_passwd, $db_name;
	mysql_connect($db_host, $db_user, $db_passwd);

	if (!mysql_select_db($db_name)) {
		mysql_close();
		return false;
	}

	$access_token = mysql_real_escape_string($user_json['access_token']);
	$username = mysql_real_escape_string($user_json['user']['username']);
	$userid = mysql_real_escape_string($user_json['user']['id']);

	$query = "INSERT INTO `users` (`instagram_id`, `username`, `access_token`) VALUES (" . $userid . ", '" . $username . "', '" . $access_token . "')";


	if (!mysql_query($query)) {
		mysql_close();
		return false;
	}

	mysql_close();
	return true;
}



$c = curl_init ($url);

$data = array (
		'client_id' => $client_id,
		'client_secret' => $client_secret,
		'grant_type' => $grant_type,
		'redirect_uri' => $redirect_uri,
		'code' => $code
);

curl_setopt ($c, CURLOPT_POST, true);
curl_setopt ($c, CURLOPT_POSTFIELDS, $data);
curl_setopt ($c, CURLOPT_RETURNTRANSFER, 1);
curl_setopt ($c, CURLOPT_SSL_VERIFYPEER, false);

$page = curl_exec($c);
curl_close ($c);

if ($page)
{

	$json_a = json_decode($page, true);
	$success = save_user($json_a);

	echo "<h3>Result</h3><pre>";
	print_r($json_a);
	echo "</pre>";

	echo $success;


//	header("Location: /confirm.php?success=" . $success);
}
?>
