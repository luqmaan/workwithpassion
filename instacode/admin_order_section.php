<html>
	<head>
		<title>SPARK</title>
		<link href='css/reset.css' rel='stylesheet' type='text/css'>
		<link href='css/style.css' rel='stylesheet' type='text/css'>
		<link href='http://fonts.googleapis.com/css?family=Open+Sans:400italic,700italic,800italic,300italic,600italic,400,800,700,600,300' rel='stylesheet' type='text/css'>
		<link href='http://fonts.googleapis.com/css?family=Gentium+Book+Basic:400,400italic,700italic,700' rel='stylesheet' type='text/css'>
		<style type='text/css'>
		/*
			body {
				margin: auto;
				text-align: center;
				font-family: 'Open Sans', Arial;
				background: #F2F2F2;
			}
			#content {
				background: #F2F2F2;
				padding: 0px 50px 0px;
			}
			
			#save {
				background: #ddd;
				width: 100px;
				height: 30px;
				text-align: center;
				display: block;
				clear: both;
				cursor: pointer;
			}
					
			#sortable {
			}
			#sortable span {
				float: left;
				width: 150px;
				height: 150px;
				margin: 7px;
				border: 1px solid #ddd;
			}
			
			#sortable span:hover {
				cursor: move;
			}
			
			#buckets {
				width: 100%;
				height: 150px;
				text-align: center;
				padding: 10px;
				margin-bottom: 20px;
				border: 0px;

			}
			.droppable {
				background: #444;
				width: 70px;
				height: 70px;
				border-radius: 100px;
				color: white;
				display: inline-block;
				margin: 0px 15px;
				vertical-align: middle;
			}
			.droppable:hover, .hoverClass {
				background: #E7EE33;
				color: #111;
			}
			#instagramContainer {

			}
			#save {
				background: #ddd;
				width: 100px;
				height: 30px;
				text-align: center;
				display: block;
				clear: both;
				cursor: pointer;
			}
			#buckets h3 {
				font: 300 20px/30px "Open Sans";
			}		*/
		</style>
	</head>
	<body>
		<div id="nav">
			<span class="links">
				<a href="index.php">Inbox</a>
				<a href="javascript:void(0)" id="save">Save Order</a>
			</span>
			<span class="status" style="display:none;">
				Saving Order of Instagrams ... 
			</span>
		</div>
		<div id="container">
						
			<div id="content">

				<div id='sortable' class='sortable'>	
				
					<div id="buckets" class="sortable">
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
							<span class="droppable" style="visibility: hidden;"></span>
					</div>
					<div id="instagramContainer">
						<?php 
						include ('dbconnect.php');			
						
						$section = $_REQUEST['section'];				
						$section = mysql_escape_string($section);
										
						$query = "SELECT * FROM media WHERE $section = 1 AND approved = 1 ORDER BY position ASC";
						$query = mysql_query($query);
						
						$output = "";
						while ($row = mysql_fetch_array($query)) {
							
							$output .= "<span id='pos_" .$row["position"] . "." . $row["creation_date"] . "." . $row["owner_id"] ."' class='instagram handle ui-state-default'><img src='" . $row['thumbnail_url'] ."'></span>\n";
							
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
		
			/* Navigation Buckets */
			
			$(".draggable").draggable();
			
			$( ".droppable" ).droppable({
				drop: function( event, ui ) {
					moveToSection(ui.draggable, $(this).attr("id"));
					ui.draggable.fadeOut(500);
													
				},
				hoverClass : "hoverClass"
			});
			
			function moveToSection($el, section) {
								
				var pos_date_owner = $el.attr("id");	
				var date_owner = pos_date_owner.substr(pos_date_owner.indexOf(".") + 1);
				var date = date_owner.substr(0, date_owner.indexOf("."));
				var owner = date_owner.substr(date_owner.indexOf(".") + 1);
				
			
				$.post('admin_controller.php','action=addtosection&section=' + section + '&id=' + $el.attr('id') + '&page=position&owner_id=' + owner + '&creation_date='+ date, function() {
					console.log("success");
					console.log(arguments[0]);				
				});
			};
			
			/* Sortable Images List */
			
			$( "#sortable" ).sortable({
			
				items: ".instagram",
				tolerance: 'pointer',
		        cursor: 'pointer',
		        dropOnEmpty: true,
		        connectWith: 'ul.sortable',
		        update: function(event, ui) {
		        	console.log("Sortable Update");
		        	console.log(ui)
		            if(this.id == 'sortable-delete') {
		            	alert("hai")
		                // Remove the element dropped on #sortable-delete
		                jQuery('#'+ui.item.attr('id')).remove();
		            } else {
		                // Update code for the actual sortable lists
		            }          
		        }    	
					
			});
			$( "#sortable" ).disableSelection();
			
			$("#save").click(function() {
			
				$("#nav .links").hide();
				$("#nav .status").show();
			
				var imageOrder = $('#sortable').sortable('serialize');
				
				$.post('admin_controller.php',imageOrder+'&action=order&section=<?php echo $section; ?>&page=position', function() {
					console.log("success");
					console.log(arguments[0]);
			
					$("#nav .links").show();
					$("#nav .status").hide();
										

				});
			
			});
			
	
		});
							
					
		</script>
		
	</body>
</html>
