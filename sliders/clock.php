<div class="inner" style="width:2420px;background:#fff;">

	<span id="time" class="layer" style="top: 215px; left: 186px; width: 860px;">
		<span id="ampm" class="layer" style="font-size:50px; line-height: 50px; width: 57px; float: left; display: inline-block; margin-top: 371px;" >PM</span>
		<span id="digits" class="layer"  style="font-size:430px; line-height: 430px; width: 700px; margin-left:120px; float: left; display: inline-block; top: 215px;"></span>
	<span id="middleline" style="width: 1130px; height: 27px;left: left:180px;background: white;
display: inline-block;
margin-top: -200px;" ></span>
	</span>
	<span id="words" class="layer" style="left:1275px;">
	
		<span id="block1" class="layer block">
			QUICK!
		</span>
		<span id="block2" class="layer block">
			TAKE
		</span>
		<span id="block3" class="layer block">
			THE
		</span>
		<span id="block4" class="layer block">
			PICTURE.
		</span>
		
	</span>
	
	<span id="clock_instagrams" class="instacontainer" style="left: 2180px; top: 127px; width: auto;">
		<?php
		$section = "clock";
		include ('../instacode/embed_section.php');
		?>
	</span>
	<script type="text/javascript">
		setInterval(function() {
			var time = new Date();
			var hours = time.getHours()%12;
			hours = hours == 0? 12 : hours;
			var minutes = time.getMinutes();
			minutes = (minutes < 10? "0": "") + minutes;
			
		    $('#digits').text(hours + ":" + minutes);
		    if (time.getHours() > 12)
			    $('#ampm').text("PM");
			else
			    $('#ampm').text("AM");
		}, 1000);
	</script>
</div>
