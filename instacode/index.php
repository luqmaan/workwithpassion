<html>
	<head>
		<title>SPARK</title>
		<link href='css/reset.css' rel='stylesheet' type='text/css'>
		<link href='css/style.css' rel='stylesheet' type='text/css'>
		<link href='http://fonts.googleapis.com/css?family=Open+Sans:400italic,700italic,800italic,300italic,600italic,400,800,700,600,300' rel='stylesheet' type='text/css'>
		<link href='http://fonts.googleapis.com/css?family=Gentium+Book+Basic:400,400italic,700italic,700' rel='stylesheet' type='text/css'>
		<style type='text/css'>
			
			#buckets {
				margin-left: 85px;
			}
			.droppable {
				width: 140px;
				height: 140px;
			}
		
		</style>
	</head>
	<body>
		<div id="nav">
			<a href="index.php">Inbox</a>
		</div>
		<div id="container">
			<div id="buckets">
				<a href="admin_order_section.php?section=sparkday">
					<span id="sparkday" class="droppable"><h3>Spark Day</h3></span>
				</a>
				<a href="admin_order_section.php?section=shame">
					<span id="shame" class="droppable"><h3>Wall of Shame</h3></span>
				</a>
				<a href="admin_order_section.php?section=onset">
					<span id="onset" class="droppable"><h3>Studios</h3></span>
				</a>
				<a href="admin_order_section.php?section=trash">
					<span id="trash" class="droppable"><h3>Trash</h3></span>
				</a>
			</div>
			<div id="content">
				<div id='sortable'>	
				<div id="instagramContainer">	
				<?php 
				include ('dbconnect.php');			
				
				$section = $_REQUEST['section'];				
								
				$query = "SELECT * FROM media WHERE sparkday IS NULL AND onset IS NULL AND shame IS NULL AND trash IS NULL ORDER BY creation_date DESC";
				
				
				$query = mysql_query($query);
				
				$output = "";
				while ($row = mysql_fetch_array($query)) {
					
					$output .= "<span id='" . $row["creation_date"] . "." . $row["owner_id"] ."' class='draggable'><img src='" . $row['thumbnail_url'] ."'></span>\n";
					
				}
							
				echo $output;
				
				?>
				</div>	
				</div>
				
			</div>
		</div>
		<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
		<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js"></script>
		
		
		<script type="text/javascript">
		
		$(document).ready(function () {
			
			
			$(".draggable").draggable();
			
			$( ".droppable" ).droppable({
				drop: function( event, ui ) {
					moveToSection(ui.draggable, $(this).attr("id"));
					ui.draggable.fadeOut(500);					
				},
				hoverClass : "hoverClass"
			});
			
			function moveToSection($el, section) {
				$.post('admin_controller.php','action=addtosection&section=' + section + '&id=' + $el.attr('id'), function() {
					console.log("success");
					console.log(arguments[0]);				
				});
			};
	
		});
							
					
		</script>
		
	</body>
</html>
