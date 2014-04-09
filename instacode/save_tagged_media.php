<?php


/* Set things up */
include('config.php');
include('tag_finder.php');
$instagram_url = 'https://api.instagram.com/v1/users/';
mysql_connect($db_host, $db_user, $db_passwd);
@mysql_select_db($db_name) or die ("Could not connect to " . $db_name);


/* OPTIONS */
$hashtags = array("sparkday", "sparkbrand", "wallofshame");
$number_of_pages_to_search = 1;

// for each user in the users table
// store their instagram pictures in the database, unless they are already there

$user_info_query = mysql_query("SELECT instagram_id, access_token, username FROM users");
while($row = mysql_fetch_array($user_info_query)) {
	$account_id = $row[0];
	$access_token = $row[1];
	$account_username = $row[2];
	
	$url = $instagram_url . 'self/feed?access_token=' . $access_token;
	$json_a = get_json($url);
	
	echo "<h1>Recent Instagrams From @$account_username</h1>\n\n";	
	echo "<h2>Page 1 : $url </h1>";	
	
	for ($i = 0; $i < $number_of_pages_to_search; $i++) {	
		
		if ($i != 0) {
			echo "<h2>Page " . ($i + 1) .  " : $url </h1>";	
			$json_a = get_json($url);
		}		
		
		saveInstagramJSON($json_a, $account_username, $hashtags);
		
		// prepare the url for the next page
		$url = $json_a['pagination']['next_url'];
		echo "\n\n===============================\n\n";

	}

}

function saveInstagramJSON($json_a, $account_username, $hashtags) {
	

	// if the instagram query contains image data, parse it
	if ($json_a['data']) {
		$media_a = $json_a['data']; //get an array of media objects (i.e. pictures)
		
		foreach ($media_a as $value) {										
           	                        
          //  echo "<pre>";
          //  print_r($value);
          //  echo "</pre>";
                    	
			$user_id = $value['user']['id'];            						
			$username = $value['user']['username'];
			$creation_date = intval($value['created_time']);
			$caption = mysql_escape_string($value['caption']['text']);
			$filter = mysql_escape_string($value['filter']);
			$comments = $value['comments'];
			$comments_count = intval($value['comments']['count']);
			$likes_count = intval($value['likes']['count']);
			$thumb_pic_url = mysql_escape_string($value['images']['thumbnail']['url']);
			$low_pic_url = mysql_escape_string($value['images']['low_resolution']['url']);
			$std_pic_url = mysql_escape_string($value['images']['standard_resolution']['url']);
			$tags = $value['tags'];
	
			
			// Search the comments for tags
			foreach ($comments as $comment) {
											
				$comment_text = $comment['text'];
				// Uses Julien's awesome tag finder class!
				$tag_finder = new TagFinder($comment_text);
				$matching_tags = $tag_finder->getMatchedTags();
				
				$tags = array_merge($tags, $matching_tags);				

			}						
			
			// For use in the DB
			$tag_string = mysql_escape_string(implode($value['tags'], " ") .  " ");
			
			
            $good_picture = false;

            // does the picture have a hashtag we're looking for?
            $matched_tags = array_intersect($hashtags, $tags);
            
            if (sizeof($matched_tags) > 0) {
            	$good_picture = true;
            }
            
            // if it doesn't have a good hashtag, is it from @sparkbrand
            if (!$good_picture && $account_username == $username) {
            	$good_picture = true;
            }
				
			//store the image in the media table 
			if ($good_picture) {
			
					
					echo "\n\n<p><a href='$std_pic_url'><img src='$thumb_pic_url' /><br />$caption</a></p>";		
					$query = "INSERT INTO media (creation_date, owner_id, username, thumbnail_url, low_res_url, standard_res_url, filter, comments_count, likes_count, caption, tags) VALUES (" . $creation_date . ", " . $user_id . ", '" . $username . "', '" . $thumb_pic_url . "', '" . $low_pic_url . "', '" . $std_pic_url . "', '" . $filter . "', '" . $comments_count . "', '" . $likes_count . "', '" . $caption . "', '" . $tag_string . "')";	
										
					echo $query;
				
					mysql_query($query);			
		
			}
										
		}
	}		
}


function get_json($url) {
	$c = curl_init($url);
	curl_setopt ($c, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt ($c, CURLOPT_SSL_VERIFYPEER, false);
	$response = curl_exec($c);
	curl_close($c);
	
	if ($response) {
		return json_decode($response, true);
	}
	return false;
}


mysql_close();
?>