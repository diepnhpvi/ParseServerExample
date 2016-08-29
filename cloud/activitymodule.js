// save login user activities
/*module.exports.SaveLoginActivity=function(data,is_new,logData,callback){
	if(!data.hasOwnProperty("device_id")){
		return;
	}
	
	var date=new Date();
	var year=date.getUTCFullYear();
	var month=date.getUTCMonth()+1;
	var day=date.getUTCDate();
	var dateString=year+"/"+month+"/"+day;
	var timestamp=date.getTime();
    
    var rawLoginActivity = Parse.Object.extend("RAW_LOGIN_ACTIVITY");
	var query = new Parse.Query(rawLoginActivity);
	query.equalTo("device_id", data.device_id);
	query.equalTo("day_show", dateString);
	
	query.limit(1);
	//query param
	query.select([
		"device_id",
		"is_new",
		"count_in_day",
		"last_login_in_day",
		"day_show"
		//data log from client
		]);
	
	query.find({
	  success: function(objectLoginList) {
	  		var objectLogin=null;
	    	if(objectLoginList!=null&&objectLoginList.length>0){
	    		objectLogin=objectLoginList[0];
	    	}
	    	if(objectLogin==null)// chua dang nhap lan nao torng ngay
	    	{
	    		// log dang nhap
	    		var saveData = new rawLoginActivity();
	    		saveData.set("device_id",data.device_id);
	    		saveData.set("is_new",is_new);
	    		saveData.set("day_show",dateString);
	    		saveData.set("count_in_day",1);
	    		saveData.set("last_login_in_day",timestamp);
	    		saveData.save(null, {
					success: function(saveData) {
						
				    	// Execute any logic that should take place after the object is saved.
				    	console.log('Log Create New Login Activity in day='+dateString+",with device_id="+ data.device_id);
						callback(true);
					},
					error: function(saveData, error) {
						// Execute any logic that should take place if the save fails.
						// error is a Parse.Error with an error code and message.
					    console.log('Log Failed Create New Login Activity, Error Code: ' + error.message);
					    callback(true);
					}
				});
	    	}
	    	else
	    	{
	    		
	    		// cap nhat chi so
	    		var count_in_day=1;
	    		if(objectLogin.get("count_in_day")!=null){
	    			count_in_day=objectLogin.get("count_in_day");
	    			count_in_day+=1;
	    		}
	    		objectLogin.set("count_in_day",count_in_day);
	    		objectLogin.set("last_login_in_day",timestamp);
	    		objectLogin.save(null, {
				  success: function(saveData2) {
				  
				    // Execute any logic that should take place after the object is saved.
				    console.log('Log Update Login Activity in day='+dateString+", with device_id="+ data.device_id+", count_in_day="+count_in_day);
				  	callback(true);
				  },
				  error: function(saveData2, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    console.log('Log Failed to Update login activity, with error code: ' + error.message);
				    callback(true);
				  }
				});
	    	}
	  },
	  error: function(error) {
	  		console.log("Loi save login activity roi");
	  		callback(true);
	  }
	});
}*/

module.exports.SaveLogActionUser=function(logData,device_id,is_update_login,is_new,callback){
	if(device_id==null&&device_id.length<1){
		return;
	}
	console.log("module.exports.SaveLogActionUser");
	var date=new Date();
	var year=date.getUTCFullYear();
	var month=date.getUTCMonth()+1;
	var day=date.getUTCDate();
	var dateString=year+"/"+month+"/"+day;
	var timestamp=date.getTime();
    
    var rawLoginActivity = Parse.Object.extend("RAW_LOGIN_ACTIVITY");
	var query = new Parse.Query(rawLoginActivity);
	query.equalTo("device_id", device_id);
	query.equalTo("day_show", dateString);

	var inputData=LogAction_InputData(logData);
	var parseData=null;
	
	query.limit(1);
	//query param
	query.select([
		"device_id",
		"count_in_day",
		"last_login_in_day",
		"day_show",

		//data log from client
		"ruby_reward",
		"count_song_purchase",
		"song_play",
		"song_download_time",
		"ruby_spent",
		"item_spend_ruby",
		"click_ads",
		"native_ads",
		"video_ads",
		"count_invite_challenge",
		"count_accept_challenge",
		"count_cancel_challenge",
		//total play in day
		"play_easy",
		"play_normal",
		"play_hard",
		//total complete in day
		"complete_easy",
		"complete_normal",
		"complete_hard",
		//total star win in day
		"star_easy",
		"star_normal",
		"star_hard",
		// avarage star win in day
		"average_easy",
		"average_normal",
		"average_hard",
		//section duration
		"section_in_day",
		"average_session",
		"total_time_in_game",
		// social
		"count_invite",
		"show_ranking"
		]);
	
	query.find({
	  success: function(objectLoginList) {
	  		var objectLogin=null;
	    	if(objectLoginList!=null&&objectLoginList.length>0){
	    		objectLogin=objectLoginList[0];
	    	}
	    	if(objectLogin==null)// chua dang nhap lan nao torng ngay
	    	{
	    		// log dang nhap
	    		var saveData = new rawLoginActivity();
	    		saveData.set("device_id",device_id);
	    		saveData.set("is_new",is_new);
	    		saveData.set("day_show",dateString);
	    		saveData.set("count_in_day",1);
	    		saveData.set("last_login_in_day",timestamp);

	    		// cache data
	    		var parseData=LogAction_ParseData(saveData);
	    		parseData=LogAction_MergeData(parseData,inputData);
	    		saveData=LogAction_SetDataSave(saveData,parseData);
	    		
	    		saveData.save(null, {
					success: function(saveData) {
						
				    	// Execute any logic that should take place after the object is saved.
				    	console.log('Log Create New Login Activity in day='+dateString+",with device_id="+ device_id);
						callback(true);
					},
					error: function(saveData, error) {
						// Execute any logic that should take place if the save fails.
						// error is a Parse.Error with an error code and message.
					    console.log('Log Failed Create New Login Activity, Error Code: ' + error.message);
					    callback(true);
					}
				});
	    	}
	    	else
	    	{
	    		// cap nhat chi so
	    		if(is_update_login)
	    		{
	    			var count_in_day=1;
		    		if(objectLogin.get("count_in_day")!=null){
		    			count_in_day=objectLogin.get("count_in_day");
		    			count_in_day+=1;
		    		}
		    		objectLogin.set("count_in_day",count_in_day);
		    		objectLogin.set("last_login_in_day",timestamp);
	    		}
	    		var parseData=LogAction_ParseData(objectLogin);
	    		parseData=LogAction_MergeData(parseData,inputData);
	    		// cache data
	    		objectLogin=LogAction_SetDataSave(objectLogin,parseData);
	    		
	    		objectLogin.save(null, {
				  success: function(saveData2) {
				  
				    // Execute any logic that should take place after the object is saved.
				    console.log('Log Update Login Activity in day='+dateString+", with device_id="+ device_id+", count_in_day="+count_in_day);
				  	callback(true);
				  },
				  error: function(saveData2, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    console.log('Log Failed to Update login activity, with error code: ' + error.message);
				    callback(true);
				  }
				});
	    	}
	  },
	  error: function(error) {
	  		console.log("Loi save login activity roi");
	  		callback(true);
	  }
	});
};

LogAction_SetDataSave=function(parseSaveData,objectData){
	parseSaveData.set("ruby_reward",objectData.ruby_reward);
	parseSaveData.set("count_song_purchase",objectData.count_song_purchase);
	parseSaveData.set("song_play",objectData.song_play);
	parseSaveData.set("song_download_time",objectData.song_download_time);
	parseSaveData.set("ruby_spent",objectData.ruby_spent);
	parseSaveData.set("item_spend_ruby",objectData.item_spend_ruby);
	parseSaveData.set("click_ads",objectData.click_ads);
	parseSaveData.set("native_ads",objectData.native_ads);
	parseSaveData.set("video_ads",objectData.video_ads);
	parseSaveData.set("count_invite_challenge",objectData.count_invite_challenge);
	parseSaveData.set("count_accept_challenge",objectData.count_accept_challenge);
	parseSaveData.set("count_cancel_challenge",objectData.count_cancel_challenge);
	
	//total play in day
	parseSaveData.set("play_easy",objectData.play_easy);
	parseSaveData.set("play_normal",objectData.play_normal);
	parseSaveData.set("play_hard",objectData.play_hard);
	//total complete in day
	parseSaveData.set("complete_easy",objectData.complete_easy);
	parseSaveData.set("complete_normal",objectData.complete_normal);
	parseSaveData.set("complete_hard",objectData.complete_hard);
	//total star win in day
	parseSaveData.set("star_easy",objectData.star_easy);
	parseSaveData.set("star_normal",objectData.star_normal);
	parseSaveData.set("star_hard",objectData.star_hard);
	// avarage star win in day
	parseSaveData.set("average_easy",objectData.average_easy);
	parseSaveData.set("average_normal",objectData.average_normal);
	parseSaveData.set("average_hard",objectData.average_hard);
	//section duration
	parseSaveData.set("section_in_day",objectData.section_in_day);
	parseSaveData.set("average_session",objectData.average_session);
	parseSaveData.set("total_time_in_game",objectData.total_time_in_game);
	// social
	parseSaveData.set("count_invite",objectData.count_invite);
	parseSaveData.set("show_ranking",objectData.show_ranking);
	return parseSaveData;
};

LogAction_InputData=function(rParams){
	if(rParams==null){// check invalid input
		console.log("Request Log Action input parameter is null");
		rParams={};
	}
	var logData={
		ruby_reward:0,
		count_song_purchase:0,
		song_play:{},
		song_download_time:{},
		ruby_spent:0,
		item_spend_ruby:{},
		click_ads:0,
		native_ads:0,
		video_ads:0,
		count_invite_challenge:0,
		count_accept_challenge:0,
		count_cancel_challenge:0,
		//total play in day
		play_easy:0,
		play_normal:0,
		play_hard:0,
		//total complete in day
		complete_easy:0,
		complete_normal:0,
		complete_hard:0,
		//total star win in day
		star_easy:0,
		star_normal:0,
		star_hard:0,
		// avarage star win in day
		average_easy:-1,
		average_normal:-1,
		average_hard:-1,
		//section duration
		section_in_day:0,
		average_session:-1,
		total_time_in_game:0,
		// social
		count_invite:0,
		show_ranking:0
	}
	if(rParams.hasOwnProperty("ruby_reward"))
	{
		logData.ruby_reward=rParams.ruby_reward;
	}
	if(rParams.hasOwnProperty("count_song_purchase"))
	{
		logData.count_song_purchase=rParams.count_song_purchase;
	}
	if(rParams.hasOwnProperty("song_play"))
	{
		logData.song_play=rParams.song_play;
	}
	if(rParams.hasOwnProperty("song_download_time"))
	{
		logData.song_download_time=rParams.song_download_time;
	}
	if(rParams.hasOwnProperty("ruby_spent"))
	{
		logData.ruby_spent=rParams.ruby_spent;
	}
	if(rParams.hasOwnProperty("item_spend_ruby"))
	{
		logData.item_spend_ruby=rParams.item_spend_ruby;
	}
	if(rParams.hasOwnProperty("click_ads"))
	{
		logData.click_ads=rParams.click_ads;
	}
	if(rParams.hasOwnProperty("native_ads"))
	{
		logData.native_ads=rParams.native_ads;
	}
	if(rParams.hasOwnProperty("video_ads"))
	{
		logData.video_ads=rParams.video_ads;
	}
	if(rParams.hasOwnProperty("count_invite_challenge"))
	{
		logData.count_invite_challenge=rParams.count_invite_challenge;
	}
	if(rParams.hasOwnProperty("count_accept_challenge"))
	{
		logData.count_accept_challenge=rParams.count_accept_challenge;
	}
	if(rParams.hasOwnProperty("count_cancel_challenge"))
	{
		logData.count_cancel_challenge=rParams.count_cancel_challenge;
	}
	if(rParams.hasOwnProperty("play_easy"))
	{
		logData.play_easy=rParams.play_easy;
	}
	if(rParams.hasOwnProperty("play_normal"))
	{
		logData.play_normal=rParams.play_normal;
	}
	if(rParams.hasOwnProperty("play_hard"))
	{
		logData.play_hard=rParams.play_hard;
	}
	if(rParams.hasOwnProperty("complete_easy"))
	{
		logData.complete_easy=rParams.complete_easy;
	}
	if(rParams.hasOwnProperty("complete_normal"))
	{
		logData.complete_normal=rParams.complete_normal;
	}
	if(rParams.hasOwnProperty("complete_hard"))
	{
		logData.complete_hard=rParams.complete_hard;
	}
	if(rParams.hasOwnProperty("star_easy"))
	{
		logData.star_easy=rParams.star_easy;
	}
	if(rParams.hasOwnProperty("star_normal"))
	{
		logData.star_normal=rParams.star_normal;
	}
	if(rParams.hasOwnProperty("star_hard"))
	{
		logData.star_hard=rParams.star_hard;
	}

	if(rParams.hasOwnProperty("average_easy"))
	{
		logData.average_easy=rParams.average_easy;
	}
	if(rParams.hasOwnProperty("average_normal"))
	{
		logData.average_normal=rParams.average_normal;
	}
	if(rParams.hasOwnProperty("average_hard"))
	{
		logData.average_hard=rParams.average_hard;
	}
	
	if(rParams.hasOwnProperty("section_in_day"))
	{
		logData.section_in_day=rParams.section_in_day;
	}

	if(rParams.hasOwnProperty("average_session"))
	{
		logData.average_session=rParams.average_session;
	}

	if(rParams.hasOwnProperty("total_time_in_game"))
	{
		logData.total_time_in_game=rParams.total_time_in_game;
	}

	if(rParams.hasOwnProperty("count_invite"))
	{
		logData.count_invite=rParams.count_invite;
	}

	if(rParams.hasOwnProperty("show_ranking"))
	{
		logData.show_ranking=rParams.show_ranking;
	}
	//console.log("inputData:"+JSON.stringify(logData));
	return logData;
};

LogAction_ParseData=function(rParse){
	var parseData={
		ruby_reward:0,
		count_song_purchase:0,
		song_play:{},
		song_download_time:{},
		ruby_spent:0,
		item_spend_ruby:{},
		click_ads:0,
		native_ads:0,
		video_ads:0,
		count_invite_challenge:0,
		count_accept_challenge:0,
		count_cancel_challenge:0,
		//total play in day
		play_easy:0,
		play_normal:0,
		play_hard:0,
		//total complete in day
		complete_easy:0,
		complete_normal:0,
		complete_hard:0,
		//total star win in day
		star_easy:0,
		star_normal:0,
		star_hard:0,
		// avarage star win in day
		average_easy:-1,
		average_normal:-1,
		average_hard:-1,
		//section duration
		section_in_day:0,
		average_session:-1,
		total_time_in_game:0,
		// social
		count_invite:0,
		show_ranking:0
	}
	if(null!=rParse.get("ruby_reward"))
	{
		parseData.ruby_reward=rParse.get("ruby_reward");
	}
	if(null!=rParse.get("count_song_purchase"))
	{
		parseData.count_song_purchase=rParse.get("count_song_purchase");
	}
	if(null!=rParse.get("song_play"))
	{
		parseData.song_play=rParse.get("song_play");
	}
	if(null!=rParse.get("song_download_time"))
	{
		parseData.song_download_time=rParse.get("song_download_time");
	}
	if(null!=rParse.get("ruby_spent"))
	{
		parseData.ruby_spent=rParse.get("ruby_spent");
	}
	if(null!=rParse.get("item_spend_ruby"))
	{
		parseData.item_spend_ruby=rParse.get("item_spend_ruby");
	}
	if(null!=rParse.get("click_ads"))
	{
		parseData.click_ads=rParse.get("click_ads");
	}
	if(null!=rParse.get("native_ads"))
	{
		parseData.native_ads=rParse.get("native_ads");
	}
	if(null!=rParse.get("video_ads"))
	{
		parseData.video_ads=rParse.get("video_ads");
	}
	if(null!=rParse.get("count_invite_challenge"))
	{
		parseData.count_invite_challenge=rParse.get("count_invite_challenge");
	}
	if(null!=rParse.get("count_accept_challenge"))
	{
		parseData.count_accept_challenge=rParse.get("count_accept_challenge");
	}
	if(null!=rParse.get("count_cancel_challenge"))
	{
		parseData.count_cancel_challenge=rParse.get("count_cancel_challenge");
	}

	if(null!=rParse.get("play_easy"))
	{
		parseData.play_easy=rParse.get("play_easy");
	}
	if(null!=rParse.get("play_normal"))
	{
		parseData.play_normal=rParse.get("play_normal");
	}
	if(null!=rParse.get("play_hard"))
	{
		parseData.play_hard=rParse.get("play_hard");
	}
	if(null!=rParse.get("complete_easy"))
	{
		parseData.complete_easy=rParse.get("complete_easy");
	}
	if(null!=rParse.get("complete_normal"))
	{
		parseData.complete_normal=rParse.get("complete_normal");
	}
	if(null!=rParse.get("complete_hard"))
	{
		parseData.complete_hard=rParse.get("complete_hard");
	}
	if(null!=rParse.get("star_easy"))
	{
		parseData.star_easy=rParse.get("star_easy");
	}
	if(null!=rParse.get("star_normal"))
	{
		parseData.star_normal=rParse.get("star_normal");
	}
	if(null!=rParse.get("star_hard"))
	{
		parseData.star_hard=rParse.get("star_hard");
	}

	if(null!=rParse.get("average_easy"))
	{
		parseData.average_easy=rParse.get("average_easy");
	}
	if(null!=rParse.get("average_normal"))
	{
		parseData.average_normal=rParse.get("average_normal");
	}
	if(null!=rParse.get("average_hard"))
	{
		parseData.average_hard=rParse.get("average_hard");
	}
	
	if(null!=rParse.get("section_in_day"))
	{
		parseData.section_in_day=rParse.get("section_in_day");
	}

	if(null!=rParse.get("average_session"))
	{
		parseData.average_session=rParse.get("average_session");
	}

	if(null!=rParse.get("total_time_in_game"))
	{
		parseData.total_time_in_game=rParse.get("total_time_in_game");
	}

	if(null!=rParse.get("count_invite"))
	{
		parseData.count_invite=rParse.get("count_invite");
	}

	if(null!=rParse.get("show_ranking"))
	{
		parseData.show_ranking=rParse.get("show_ranking");
	}
	//console.log("ParseData:"+JSON.stringify(parseData));
	return parseData;
};

LogAction_MergeData=function(parseCache,inputCache){
	try
	{
		parseCache.ruby_reward+=inputCache.ruby_reward;
		parseCache.count_song_purchase+=inputCache.count_song_purchase;
		
		//merge song play
		if(parseCache.song_play==null){
			parseCache.song_play={};
		}
		if(inputCache.song_play==null){
			inputCache.song_play={};
		}
		for (var key in inputCache.song_play) 
		{
			if(parseCache.song_play.hasOwnProperty(key))
			{
				var oldValue=parseCache.song_play[key];
				parseCache.song_play[key]=oldValue+inputCache.song_play[key];
			}
			else
			{
				parseCache.song_play[key]=inputCache.song_play[key];
			}
		}

		//merge song Download
		if(parseCache.song_download_time==null){
			parseCache.song_download_time={};
		}
		if(inputCache.song_download_time==null){
			inputCache.song_download_time={};
		}
		for (var key in inputCache.song_download_time) 
		{
			parseCache.song_download_time[key]=inputCache.song_download_time[key];
		}

		if(parseCache.item_spend_ruby==null){
			parseCache.item_spend_ruby={};
		}
		if(inputCache.item_spend_ruby==null){
			inputCache.item_spend_ruby={};
		}
		//fix sau
		
		for (var key in inputCache.item_spend_ruby) 
		{
			if(parseCache.item_spend_ruby.hasOwnProperty(key))
			{
				var oldValue=parseCache.item_spend_ruby[key];
				parseCache.item_spend_ruby[key]=oldValue+inputCache.item_spend_ruby[key];
			}
			else
			{
				parseCache.item_spend_ruby[key]=inputCache.item_spend_ruby[key];
			}
		}
			
		parseCache.ruby_spent	+=inputCache.ruby_spent;
		parseCache.click_ads	+=inputCache.click_ads;
		parseCache.native_ads	+=inputCache.native_ads;
		parseCache.video_ads	+=inputCache.video_ads;
		parseCache.count_invite_challenge	+=inputCache.count_invite_challenge;
		parseCache.count_accept_challenge	+=inputCache.count_accept_challenge;
		parseCache.count_cancel_challenge	+=inputCache.count_cancel_challenge;

		//total play in day
		parseCache.play_easy	+=inputCache.play_easy;
		parseCache.play_normal	+=inputCache.play_normal;
		parseCache.play_hard	+=inputCache.play_hard;
		//total complete in day
		parseCache.complete_easy	+=inputCache.complete_easy
		parseCache.complete_normal	+=inputCache.complete_normal
		parseCache.complete_hard	+=inputCache.complete_hard;
		//total star win in day
		parseCache.star_easy	+=inputCache.star_easy;
		parseCache.star_normal	+=inputCache.star_normal;
		parseCache.star_hard	+=inputCache.star_hard;
		// avarage star win in day
		parseCache.average_easy	=-1;
		parseCache.average_normal=-1;
		parseCache.average_hard	=-1;

		if(parseCache.complete_easy>0){// calculation star easy
			parseCache.average_easy=parseCache.star_easy*1.0/parseCache.complete_easy;
		}
		if(parseCache.complete_normal>0){ // calculation star normal
			parseCache.average_normal=parseCache.star_normal*1.0/parseCache.complete_normal;
		}
		if(parseCache.complete_hard>0){//// calculation star hard
			parseCache.average_hard=parseCache.star_hard*1.0/parseCache.complete_hard;
		}
		
		//section duration
		parseCache.section_in_day		+=inputCache.section_in_day;
		parseCache.total_time_in_game	+=inputCache.total_time_in_game;

		parseCache.average_session=-1;
		if(parseCache.section_in_day>0){
			parseCache.average_session=parseCache.total_time_in_game*1.0/parseCache.section_in_day;
		}
		// social
		parseCache.count_invite	+=inputCache.count_invite;
		parseCache.show_ranking	+=inputCache.show_ranking;
	}
	catch(err) {
		console.log("Merge Data Error with error code:"+JSON.stringify(err));
	}
	//console.log("MergeData:"+JSON.stringify(parseCache));
	return parseCache;
}