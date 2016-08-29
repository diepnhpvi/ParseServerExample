
var day_retention=[0,1,2,3,7,30]
module.exports.AnalyticsInADay=function(year,month,day,callback){
	var dateString=year+"/"+month+"/"+day;
	var rawLoginActivity = Parse.Object.extend("RAW_LOGIN_ACTIVITY");
	var query = new Parse.Query(rawLoginActivity);
	query.equalTo("day_show", dateString);

	parseAnalytics={};
	parseAnalytics=InitDataCMSSave(parseAnalytics,dateString);// initial
	parseData=[];
	query.count({
	success: function(count) {
	    // The count request succeeded. Show the count
	    if(count==0)
	    {
	    	console.log("no data:"+dateString);
	    	SaveAnalyticsFunction(dateString,parseAnalytics,function(res1){
	    		callback(true);
	    	});
	    }
	    else
	    {
	    	QueryAllDataInADay(parseData,count,0,dateString,function(res2){
	    		parseData=res2.data;
	    		//console.log("tong so record lay duoc la:"+parseData.length);
	    		parseAnalytics=AnalyticsFromRawData(parseAnalytics,parseData);
	    		SaveAnalyticsFunction(dateString,parseAnalytics,function(res3){
	    			CalculationRetention(parseData,year,month,day,0,function(res4){
						callback(true);
	    			});
	    		});
	    	});
	    }
	  },
	  error: function(error) {
	  	console("error query parse:"+error);
	    // The request failed
	  }
	});
};


CalculationRetention=function(data_d0,year,month,day,index_day,callbackRetention){

	if(index_day>=day_retention.length){
		callbackRetention(true);
		return;
	}
	var temp=new Date(year, month-1, day,12,0,0,0);
	//temp=new Date(temp.getTime()+temp.getTimezoneOffset() * 60000);
	//console.log(temp.toString()+","+day_retention[index_day]+","+data_d0.length);
	var timeRetention = new Date(temp.getTime()-day_retention[index_day]*24*60*60*1000);
	var yy=timeRetention.getUTCFullYear();
	var mm=timeRetention.getUTCMonth()+1;
	var dd=timeRetention.getUTCDate();

	var dateStr=yy+"/"+mm+"/"+dd;
	//console.log("CalculationRetention for:"+dateStr+",index_day:"+index_day);
	var isCalculateDay=false;
	if(day_retention[index_day]==0)
	{
		isCalculateDay=true;
	}
	var CMSRetention = Parse.Object.extend("CMS_RETENTION");
	var query = new Parse.Query(CMSRetention);
	query.equalTo("day_show", dateStr);
	
	query.limit(1);
	//query param
	query.select(["day_show",
		"D0",
		"D1",
		"D2",
		"D3",
		"D7",
		"D30",
		"D1_Stat",
		"D2_Stat",
		"D3_Stat",
		"D7_Stat",
		"D30_Stat"]);

	query.find({
	  success: function(objectRetentionList) {
	  		var objRetention=null;
	    	if(objectRetentionList!=null&&objectRetentionList.length>0){
	    		objRetention=objectRetentionList[0];
	    	}
	    	if(objRetention==null)// chua co tai khoan tren server
	    	{
	    		if(isCalculateDay)
	    		{
	    			console.log("Tao moi du lieu du lieu retention:"+dateStr);
	    			var saveData = new CMSRetention();
		    		saveData=SetRetentionData(saveData,data_d0.length,index_day,dateStr);
		    		saveData.save(null, {
						success: function(saveData) {
							console.log("Save CMS retention Finish:"+dateStr);
					    	CalculationRetention(data_d0,year,month,day,++index_day,callbackRetention);
						},
						error: function(saveData, error) {
							console.log('Save CMS retention failed, Error Code: ' + error.message);
						    CalculationRetention(data_d0,year,month,day,++index_day,callbackRetention);
						}
					});
		    	}
		    	else
		    	{
		    		console.log("khong tao table khong co du lieu retention truoc do:"+dateStr);
		    		CalculationRetention(data_d0,year,month,day,++index_day,callbackRetention);
		    	}
	    	}
	    	else
	    	{
	    		if(isCalculateDay)
	    		{
	    			var saveData = objRetention;
	    			saveData=SetRetentionData(saveData,data_d0.length,index_day,dateStr);
	    			saveData.save(null, {
						success: function(saveData) {
							console.log("Save CMS retention Finish:"+dateStr);
					    	CalculationRetention(data_d0,year,month,day,++index_day,callbackRetention);
						},
						error: function(saveData, error) {
							console.log('Save CMS retention failed, Error Code: ' + error.message);
						    CalculationRetention(data_d0,year,month,day,++index_day,callbackRetention);
						}
					});
	    		}
	    		else
	    		{
	    			// tinh toan cho ngay khac
	    			var lastData={};
	    			QueryRetentionDataInADayStep1(lastData,dateStr,function(res){
	    				if(res.result==true){// ket qua tra ve ok
	    					var valueChange=0;
	    					for(var i=0;i<data_d0.length;i++)
	    					{
	    						if(res.data.hasOwnProperty(data_d0[i].get("device_id")))
	    						{
									valueChange++;
	    						}
	    						//console.log(data_d0[i].get("device_id"));

	    					}

	    					//console.log("total retention calculation:"+valueChange);
	    					
	    					var saveData = objRetention;
			    			saveData=SetRetentionData(saveData,valueChange,index_day,dateStr);
			    			saveData.save(null, {
								success: function(saveData) {
									console.log("Save CMS retention Finish:"+dateStr+","+valueChange);
							    	CalculationRetention(data_d0,year,month,day,++index_day,callbackRetention);
								},
								error: function(saveData, error) {
									console.log('Save CMS retention failed, Error Code: ' + error.message);
								    CalculationRetention(data_d0,year,month,day,++index_day,callbackRetention);
								}
							});
	    				}
	    				else{
	    					CalculationRetention(data_d0,year,month,day,++index_day,callbackRetention);
	    				}
	    			});

	    		}
	    	}
	  },
	  error: function(error) {
	  		console.log("Login User Data Query Find failed");
	  		CalculationRetention(data_d0,year,month,day,++index_day,callbackRetention);
	  }
	});
}

SetRetentionData=function(parseRetention,valueChange,index_day,dayStr ){

	var data={
		D0:0,
		D1:0,
		D2:0,
		D3:0,
		D7:0,
		D30:0,
		D1_Stat:0.0,
		D2_Stat:0.0,
		D3_Stat:0.0,
		D7_Stat:0.0,
		D30_Stat:0.0
	}
	if(null!=parseRetention.get("D0")){
		data.D0=parseRetention.get("D0");
	}
	if(null!=parseRetention.get("D1")){
		data.D1=parseRetention.get("D1");
	}
	if(null!=parseRetention.get("D2")){
		data.D2=parseRetention.get("D2");
	}
	if(null!=parseRetention.get("D3")){
		data.D3=parseRetention.get("D3");
	}
	if(null!=parseRetention.get("D7")){
		data.D7=parseRetention.get("D7");
	}
	if(null!=parseRetention.get("D30")){
		data.D30=parseRetention.get("D30");
	}
	if(null!=parseRetention.get("D1_Stat")){
		data.D1_Stat=parseRetention.get("D1_Stat");
	}
	if(null!=parseRetention.get("D2_Stat")){
		data.D2_Stat=parseRetention.get("D2_Stat");
	}
	if(null!=parseRetention.get("D3_Stat")){
		data.D3_Stat=parseRetention.get("D3_Stat");
	}
	if(null!=parseRetention.get("D7_Stat")){
		data.D7_Stat=parseRetention.get("D7_Stat");
	}
	if(null!=parseRetention.get("D30_Stat")){
		data.D30_Stat=parseRetention.get("D30_Stat");
	}
	if(day_retention[index_day]==0)
	{
		data.D0=valueChange;
	}
	if(day_retention[index_day]==1)
	{
		data.D1=valueChange;
	}
	if(day_retention[index_day]==2)
	{
		data.D2=valueChange;
	}
	if(day_retention[index_day]==3)
	{
		data.D3=valueChange;
	}
	if(day_retention[index_day]==7)
	{
		data.D7=valueChange;
	}
	if(day_retention[index_day]==30)
	{
		data.D30=valueChange;
	}
	if(data.D0>0)
	{
		data.D1_Stat=data.D1*1.0/data.D0;
		data.D2_Stat=data.D2*1.0/data.D0;
		data.D3_Stat=data.D3*1.0/data.D0;
		data.D7_Stat=data.D7*1.0/data.D0;
		data.D30_Stat=data.D30*1.0/data.D0;
	}
	parseRetention.set("day_show",dayStr);
	parseRetention.set("D0",data.D0);
	parseRetention.set("D1",data.D1);
	parseRetention.set("D2",data.D2);
	parseRetention.set("D3",data.D3);
	parseRetention.set("D7",data.D7);
	parseRetention.set("D30",data.D30);
	parseRetention.set("D1_Stat",data.D1_Stat);
	parseRetention.set("D2_Stat",data.D2_Stat);
	parseRetention.set("D3_Stat",data.D3_Stat);
	parseRetention.set("D7_Stat",data.D7_Stat);
	parseRetention.set("D30_Stat",data.D30_Stat);
	
	return parseRetention;
};

SaveAnalyticsFunction=function(dateString,parseAnalytics,callback){
	var CMSLoginActivity = Parse.Object.extend("CMS_ACTION_DATA");
	var query = new Parse.Query(CMSLoginActivity);
	query.equalTo("day_show", dateString);
	
	query.limit(1);
	//query param
	query.select(["day_show"]);
	query.find({
	  success: function(objectLoginList) {
	  		var objectLogin=null;
	    	if(objectLoginList!=null&&objectLoginList.length>0){
	    		objectLogin=objectLoginList[0];
	    	}
	    	if(objectLogin==null)// chua co tai khoan tren server
	    	{
	    		console.log("chua co du lieu CMS -> tao moi ngay:"+dateString);
	    		var saveData = new CMSLoginActivity();
	    		saveData=SetDataSave(saveData,parseAnalytics);
	    		saveData.save(null, {
					success: function(saveData) {
						console.log("Save CMS Finish:"+dateString);
				    	callback(true);
					},
					error: function(saveData, error) {
						console.log('Save CMS failed, Error Code: ' + error.message);
					    callback(true);
					}
				});
	    	}
	    	else
	    	{
	    		console.log("da co du lieu CMS -> chi cap nhat moi cho ngay:"+dateString);
	    		var saveData = objectLogin;
	    		saveData=SetDataSave(saveData,parseAnalytics);
	    		saveData.save(null, {
					success: function(saveData) {
						console.log("Save CMS Finish:"+dateString);
				    	callback(true);
					},
					error: function(saveData, error) {
						console.log('Save CMS failed, Error Code: ' + error.message);
					    callback(true);
					}
				});
	    	}
	  },
	  error: function(error) {
	  		console.log("Login User Data Query Find failed");
	  		callback(false);
	  }
	});
}


AnalyticsFromRawData=function(parseAnalytics,parseData){
	for(var i=0;i<parseData.length;i++){
		var element=parseData[i];// du lieu 1 nguoi choi trong 1 ngay
		//console.log("not fix:"+JSON.stringify(element));
		
		element=FixDataAUser(element);// fix cac cot undefined
		parseAnalytics.login_user+=1;// moi user tinh la 1
		//console.log("after fix:"+JSON.stringify(element));
		if(element.is_new==true)
		{
			parseAnalytics.new_user+=1;// tinh toan cho new user
		}
		parseAnalytics.ruby_reward+=element.ruby_reward;
		parseAnalytics.count_song_purchase+=element.count_song_purchase;
		

		if(parseAnalytics.song_play==null){
			parseAnalytics.song_play={};
		}
		if(parseAnalytics.song_download_time==null){
			parseAnalytics.song_download_time={};
		}
		
		if(element.song_play==null){
			element.song_play={};
		}
		if(element.song_download_time==null){
			element.song_download_time={};
		}

		// analytics for song play in day
		for (var key in element.song_play) 
		{
			if(parseAnalytics.song_play.hasOwnProperty(key))
			{
				var oldValue=parseAnalytics.song_play[key];
				parseAnalytics.song_play[key]=oldValue+element.song_play[key];
			}
			else
			{
				parseAnalytics.song_play[key]=element.song_play[key];
			}
		}

		// analytics for song download time in day
		for (var key in element.song_download_time) 
		{
			if(parseAnalytics.song_download_time.hasOwnProperty(key))
			{
				var oldValue=parseAnalytics.song_download_time[key];
				parseAnalytics.song_download_time[key].total+=element.song_download_time[key];
				parseAnalytics.song_download_time[key].count++;
				parseAnalytics.song_download_time[key].avarage=parseAnalytics.song_download_time[key].total*1.0/parseAnalytics.song_download_time[key].count;
			}
			else
			{
				// chua co them vo moi
				var dataSongDownload={
					total:0.0,
					count:0,
					avarage:0.0
				}
				dataSongDownload.total=element.song_download_time[key];
				dataSongDownload.count++;
				dataSongDownload.avarage=element.song_download_time[key];
				parseAnalytics.song_download_time[key]=dataSongDownload;
			}
		}

		if(parseAnalytics.item_spend_ruby==null){
			parseAnalytics.item_spend_ruby={};
		}
		if(element.item_spend_ruby==null){
			element.item_spend_ruby={};
		}
		for (var key in element.item_spend_ruby) 
		{
			if(parseAnalytics.item_spend_ruby.hasOwnProperty(key))
			{
				var oldValue=parseAnalytics.item_spend_ruby[key];
				parseAnalytics.item_spend_ruby[key]=oldValue+element.item_spend_ruby[key];
			}
			else
			{
				parseAnalytics.item_spend_ruby[key]=element.item_spend_ruby[key];
			}
		}
			
		parseAnalytics.ruby_spent	+=element.ruby_spent;
		parseAnalytics.click_ads	+=element.click_ads;
		parseAnalytics.native_ads	+=element.native_ads;
		parseAnalytics.video_ads	+=element.video_ads;
		parseAnalytics.count_invite_challenge	+=element.count_invite_challenge;
		parseAnalytics.count_accept_challenge	+=element.count_accept_challenge;
		parseAnalytics.count_cancel_challenge	+=element.count_cancel_challenge;

		//total play in day
		parseAnalytics.play_easy	+=element.play_easy;
		parseAnalytics.play_normal	+=element.play_normal;
		parseAnalytics.play_hard	+=element.play_hard;
		//total complete in day
		parseAnalytics.complete_easy	+=element.complete_easy
		parseAnalytics.complete_normal	+=element.complete_normal
		parseAnalytics.complete_hard	+=element.complete_hard;
		//total star win in day
		parseAnalytics.star_easy	+=element.star_easy;
		parseAnalytics.star_normal	+=element.star_normal;
		parseAnalytics.star_hard	+=element.star_hard;
		// avarage star win in day
		parseAnalytics.average_easy	=-1;
		parseAnalytics.average_normal=-1;
		parseAnalytics.average_hard	=-1;

		if(parseAnalytics.complete_easy>0){// calculation star easy
			parseAnalytics.average_easy=parseAnalytics.star_easy*1.0/parseAnalytics.complete_easy;
		}
		if(parseAnalytics.complete_normal>0){ // calculation star normal
			parseAnalytics.average_normal=parseAnalytics.star_normal*1.0/parseAnalytics.complete_normal;
		}
		if(parseAnalytics.complete_hard>0){//// calculation star hard
			parseAnalytics.average_hard=parseAnalytics.star_hard*1.0/parseAnalytics.complete_hard;
		}
		
		//section duration
		parseAnalytics.section_in_day		+=element.section_in_day;
		parseAnalytics.total_time_in_game	+=element.total_time_in_game;

		parseAnalytics.average_session=-1;
		if(parseAnalytics.section_in_day>0){
			parseAnalytics.average_session=parseAnalytics.total_time_in_game*1.0/parseAnalytics.section_in_day;
		}
		// social
		parseAnalytics.count_invite	+=element.count_invite;
		parseAnalytics.show_ranking	+=element.show_ranking;
	}
	return parseAnalytics;
}
SetDataSave=function(parseSaveData,objectData){
	parseSaveData.set("day_show",objectData.day_show);
	parseSaveData.set("login_user",objectData.login_user);
	parseSaveData.set("new_user",objectData.new_user);
	
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

InitDataCMSSave=function(rParse,dateString){
	var parseData={
		day_show:dateString,
		login_user:0,
		new_user:0,
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
	return parseData;
};

QueryAllDataInADay=function(parseData,total,skip_index,dateString,callback){
	//console.log("goi vo day QueryAllDataInADay:"+total+","+skip_index)
	var max=1000;
	result={
		data:parseData,
		is_finish:false,
		is_success:true
	};
	var rawLoginActivity = Parse.Object.extend("RAW_LOGIN_ACTIVITY");
	var query = new Parse.Query(rawLoginActivity);
	query.equalTo("day_show", dateString);
	query.limit(max);// maximum parse for query is 1000
	query.skip(skip_index);
	//query param
	query.select([
		"device_id",
		"is_new",
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
	  success: function(objectList) {
	  		if(objectList!=null&&objectList.length>0){
	  			//console.log("so item get duoc:"+objectList.length);
	    		for(var i=0;i<objectList.length;i++)
	    		{
	    			parseData.push(objectList[i]);
	    		}
	    	}
	    	if(skip_index+max>=total){// da lay het du lieu
				result.data=parseData;
				result.is_finish=true;
	    		callback(result);
	    	}
	    	else// van con du lieu de quy lay cho het
	    	{
	    		skip_index+=max;
	    		QueryAllDataInADay(parseData,total,skip_index,dateString,callback);
	    	}
	  },
	  error: function(error) {
	  		console.log("Loi save login activity roi");
	  		result.is_success=false;
	  		callback(true);
	  }
	});
}
FixDataAUser=function(rParams){
	if(rParams==null){// check invalid input
		console.log("Request Log Action input parameter is null");
		rParams={};
	}
	var logData={
		device_id:"",
		is_new:false,
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
	if(null!=rParams.get("device_id"))
	{
		logData.is_new=rParams.get("device_id");
	}
	if(null!=rParams.get("is_new"))
	{
		logData.is_new=rParams.get("is_new");
	}
	if(null!=rParams.get("ruby_reward"))
	{
		logData.ruby_reward=rParams.get("ruby_reward");
	}
	if(null!=rParams.get("count_song_purchase"))
	{
		logData.count_song_purchase=rParams.get("count_song_purchase");
	}
	if(null!=rParams.get("song_play"))
	{
		logData.song_play=rParams.get("song_play");
	}
	if(null!=rParams.get("song_download_time"))
	{
		logData.song_download_time=rParams.get("song_download_time");
	}
	if(null!=rParams.get("ruby_spent"))
	{
		logData.ruby_spent=rParams.get("ruby_spent");
	}
	if(null!=rParams.get("item_spend_ruby"))
	{
		logData.item_spend_ruby=rParams.get("item_spend_ruby");
	}
	if(null!=rParams.get("click_ads"))
	{
		logData.click_ads=rParams.get("click_ads");
	}
	if(null!=rParams.get("native_ads"))
	{
		logData.native_ads=rParams.get("native_ads");
	}
	if(null!=rParams.get("video_ads"))
	{
		logData.video_ads=rParams.get("video_ads");
	}
	if(null!=rParams.get("count_invite_challenge"))
	{
		logData.count_invite_challenge=rParams.get("count_invite_challenge");
	}
	if(null!=rParams.get("count_accept_challenge"))
	{
		logData.count_accept_challenge=rParams.get("count_accept_challenge");
	}
	if(null!=rParams.get("count_cancel_challenge"))
	{
		logData.count_cancel_challenge=rParams.get("count_cancel_challenge");
	}

	if(null!=rParams.get("play_easy"))
	{
		logData.play_easy=rParams.get("play_easy");
	}
	if(null!=rParams.get("play_normal"))
	{
		logData.play_normal=rParams.get("play_normal");
	}
	if(null!=rParams.get("play_hard"))
	{
		logData.play_hard=rParams.get("play_hard");
	}
	if(null!=rParams.get("complete_easy"))
	{
		logData.complete_easy=rParams.get("complete_easy");
	}
	if(null!=rParams.get("complete_normal"))
	{
		logData.complete_normal=rParams.get("complete_normal");
	}
	if(null!=rParams.get("complete_hard"))
	{
		logData.complete_hard=rParams.get("complete_hard");
	}
	if(null!=rParams.get("star_easy"))
	{
		logData.star_easy=rParams.get("star_easy");
	}
	if(null!=rParams.get("star_normal"))
	{
		logData.star_normal=rParams.get("star_normal");
	}
	if(null!=rParams.get("star_hard"))
	{
		logData.star_hard=rParams.get("star_hard");
	}

	if(null!=rParams.get("average_easy"))
	{
		logData.average_easy=rParams.get("average_easy");
	}
	if(null!=rParams.get("average_normal"))
	{
		logData.average_normal=rParams.get("average_normal");
	}
	if(null!=rParams.get("average_hard"))
	{
		logData.average_hard=rParams.get("average_hard");
	}
	
	if(null!=rParams.get("section_in_day"))
	{
		logData.section_in_day=rParams.get("section_in_day");
	}

	if(null!=rParams.get("average_session"))
	{
		logData.average_session=rParams.get("average_session");
	}

	if(null!=rParams.get("total_time_in_game"))
	{
		logData.total_time_in_game=rParams.get("total_time_in_game");
	}

	if(null!=rParams.get("count_invite"))
	{
		logData.count_invite=rParams.get("count_invite");
	}

	if(null!=rParams.get("show_ranking"))
	{
		logData.show_ranking=rParams.get("show_ranking");
	}
	//console.log("inputData:"+JSON.stringify(logData));
	return logData;
};

QueryRetentionDataInADayStep1=function(queryRetention,dayQuery,callback){
	result={
		is_success:false,
		data:queryRetention,
	};
	//console.log("date query:"+dayQuery+","+JSON.stringify(queryRetention));
	var rawLoginActivity = Parse.Object.extend("RAW_LOGIN_ACTIVITY");
	var query = new Parse.Query(rawLoginActivity);
	query.equalTo("day_show", dayQuery);
	query.count({
		success: function(count) {
			//console.log("date calculation:"+dayQuery+","+count);
		    // The count request succeeded. Show the count
		    if(count==0)
		    {
		    	callback(result);
		    }
		    else
		    {
		    	QueryRetentionDataInADayStep2(queryRetention,count,0,dayQuery,callback);
		    }
		  },
		  error: function(error) {
		  	console("error query parse:"+error);
		  	callback(result);
		    // The request failed
		  }
	});
}

QueryRetentionDataInADayStep2=function(queryRetention,total,skip_index,dayQuery,callback){
	//console.log("goi vo day QueryAllDataInADay:"+total+","+skip_index)
	var max=1000;
	result={
		is_success:false,
		data:queryRetention,
	};
	var rawLoginActivity = Parse.Object.extend("RAW_LOGIN_ACTIVITY");
	var query = new Parse.Query(rawLoginActivity);
	query.equalTo("day_show", dayQuery);
	query.limit(max);// maximum parse for query is 1000
	query.skip(skip_index);
	//query param
	query.select([
		"device_id"
		]);
	query.find({
	  success: function(objectList) {
	  		if(objectList!=null&&objectList.length>0){
	  			//console.log("so item get duoc:"+objectList.length);
	    		for(var i=0;i<objectList.length;i++)
	    		{
	    			if(objectList[i].get("device_id")!=null)
	    			{
	    				queryRetention[objectList[i].get("device_id")]=1;
	    			}
	    		}
	    	}
	    	if(skip_index+max>=total){// da lay het du lieu
				result.result=true;
				result.data=queryRetention;
				callback(result);
	    	}
	    	else// van con du lieu de quy lay cho het
	    	{
	    		skip_index+=max;
	    		QueryRetentionDataInADayStep2(queryRetention,total,skip_index,dayQuery,callback);
	    	}
	  },
	  error: function(error) {
	  		console.log("Loi QueryRetentionDataInADayStep2 roi");
	  		result.is_success=false;
	  		callback(true);
	  }
	});
}