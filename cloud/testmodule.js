module.exports.QueryAllUserData=function(callback){
	result={
		is_success:false,
		data:0,
	};
	var UserData = Parse.Object.extend("UserData");
	var query = new Parse.Query(UserData);
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
		    	var data={};
		    	QueryAllUserDataRoutine(data,count,0,0,new Date(2015,0,1),function(res){
		    		result.data=count;
		    		callback(result);
		    	});
		    }
		  },
		  error: function(error) {
		  	console("error query parse:"+error);
		  	callback(result);
		    // The request failed
		  }
	});
}

QueryAllUserDataRoutine=function(data,total,skip_index,cache_index,date,callback){
	//console.log("goi vo day QueryAllDataInADay:"+total+","+skip_index)
	var max=1000;
	result={
		is_success:false,
		data:data,
	};
	var UserData = Parse.Object.extend("UserData");
	var query = new Parse.Query(UserData);
	query.limit(max);// maximum parse for query is 1000

	var daysOld = date; 
	query.greaterThan("createdAt", daysOld);
	query.ascending("createdAt");
	query.skip(skip_index);
	var dateCache=new Date(2016,0,1);
	//query param
	query.select([
		"facebook_id",
		"facebook_name",
		"level",
		"email",
		"createdAt"
		]);
	query.find({
	  success: function(objectList) {
	  		//console.log("here:"+objectList.length);
	  		if(objectList!=null&&objectList.length>0){
	  			//console.log("so item get duoc:"+objectList.length+","+Object.keys(data).length);
	    		for(var i=0;i<objectList.length;i++)
	    		{
	    			if(objectList[i].get("facebook_id")!=null)
	    			{
		    			var facebook_id=objectList[i].get("facebook_id");
		    			if(facebook_id.length>2)
		    			{
		    				if(!data.hasOwnProperty(facebook_id))
			    			{
			    				data[facebook_id]=1;
			    			}
			    			else
			    			{
			    				console.log("trung facebook_id:"+facebook_id);
			    			}
			    		}
			    		if(objectList[i].get("email")!=null&&objectList[i].get("email").length>0)
	    				{
	    					//console.log(objectList[i].get("email")+";"+objectList[i].get("facebook_name")+";"+objectList[i].get("level"));
	    				}
		    		}
	    		}
	    		dateCache=objectList[objectList.length-1].get("createdAt");
	    		//console.log("Max createdAt:"+dateCache);
	    	}
	    	if(skip_index+max+cache_index>=total){// da lay het du lieu
				result.result=true;
				result.data=data;
				callback(result);
	    	}
	    	else// van con du lieu de quy lay cho het
	    	{
	    		skip_index+=max;
	    		if(skip_index>=10000){
	    			cache_index+=10000;
	    			skip_index=0;
	    			date=dateCache;
	    		}
	    		QueryAllUserDataRoutine(data,total,skip_index,cache_index,date,callback);
	    	}
	  },
	  error: function(error) {
	  		console.log("Loi data roi:"+JSON.stringify(error));
	  		result.is_success=false;
	  		callback(true);
	  }
	});
}

module.exports.QueryAllLevelRanking=function(callback){
	result={
		is_success:false,
		data:0,
	};
	var LevelRanking = Parse.Object.extend("LevelRanking");
	var query = new Parse.Query(LevelRanking);
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
		    	var data={};
		    	QueryAllLevelRankingRoutine(data,count,0,0,new Date(2015,0,1),function(res){
		    		result.data=count;
		    		callback(result);
		    	});
		    }
		  },
		  error: function(error) {
		  	console("error query parse:"+error);
		  	callback(result);
		    // The request failed
		  }
	});
}
var all=0;
QueryAllLevelRankingRoutine=function(data,total,skip_index,cache_index,date,callback){
	//console.log("goi vo day QueryAllDataInADay:"+total+","+skip_index)
	var max=1000;
	result={
		is_success:false,
		data:data,
	};
	var LevelRanking = Parse.Object.extend("LevelRanking");
	var query = new Parse.Query(LevelRanking);
	query.limit(max);// maximum parse for query is 1000

	var daysOld = date; 
	query.greaterThan("createdAt", daysOld);
	query.ascending("createdAt");
	query.skip(skip_index);
	var dateCache=new Date(2016,0,1);
	//query param
	query.select([
		"user_id",
		"createdAt",
		"one_signal_user_id"
		]);
	query.find({
	  success: function(objectList) {
	  		//console.log("here:"+objectList.length);
	  		//console.log("so item get duoc:"+objectList.length+","+Object.keys(data).length+", signal:"+
	  		if(objectList!=null&&objectList.length>0){
	  			var countsignal=0;
	  			for(var i=0;i<objectList.length;i++)
	    		{
	    			if(objectList[i].get("user_id")!=null)
	    			{
		    			var user_id=objectList[i].get("user_id");
		    			if(user_id.length>2)
		    			{
		    				if(!data.hasOwnProperty(user_id))
			    			{
			    				data[user_id]=1;
			    			}
			    			else
			    			{
			    				console.log("trung user_id:"+user_id);
			    			}
			    		}
		    		}
		    		if(objectList[i].get("one_signal_user_id")!=null){
		    			countsignal++;
		    		}
	    		}
	    		all+=countsignal;
	    		console.log(all+","+countsignal+","+total);
	    		
	    		dateCache=objectList[objectList.length-1].get("createdAt");
	    		console.log("Max createdAt:"+dateCache);
	    	}
	    	if(skip_index+max+cache_index>=total){// da lay het du lieu
				result.result=true;
				result.data=data;
				callback(result);
	    	}
	    	else// van con du lieu de quy lay cho het
	    	{
	    		skip_index+=max;
	    		if(skip_index>=10000){
	    			cache_index+=10000;
	    			skip_index=0;
	    			date=dateCache;
	    		}
	    		QueryAllLevelRankingRoutine(data,total,skip_index,cache_index,date,callback);
	    	}
	  },
	  error: function(error) {
	  		console.log("Loi data roi:"+JSON.stringify(error));
	  		result.is_success=false;
	  		callback(true);
	  }
	});
}


module.exports.QueryAllFeedback=function(callback){
	result={
		is_success:false,
		data:0,
	};
	var LevelRanking = Parse.Object.extend("UserFeedback");
	var query = new Parse.Query(LevelRanking);

	var dateStart=new Date(2016,6,1);
	var dateEnd=new Date(2016,6,8);
	query.greaterThanOrEqualTo("createdAt", dateStart);
	query.lessThan("createdAt", dateEnd);
	query.count({
		success: function(count) {
			console.log("count Feedback:"+","+count);
		    // The count request succeeded. Show the count
		    if(count==0)
		    {
		    	callback(result);
		    }
		    else
		    {
		    	var data={};
		    	QueryAllFeedbackRoutine(data,count,0,0,dateStart,dateEnd,function(res){
		    		result.data=count;
		    		callback(result);
		    	});
		    }
		  },
		  error: function(error) {
		  	console("error query parse:"+error);
		  	callback(result);
		    // The request failed
		  }
	});
}

QueryAllFeedbackRoutine=function(data,total,skip_index,cache_index,date,dateEnd,callback){
	//console.log("goi vo day QueryAllDataInADay:"+total+","+skip_index)
	var max=1000;
	result={
		is_success:false,
		data:data,
	};
	var LevelRanking = Parse.Object.extend("UserFeedback");
	var query = new Parse.Query(LevelRanking);
	query.limit(max);// maximum parse for query is 1000

	var daysOld = date; 
	query.greaterThanOrEqualTo("createdAt", daysOld);
	query.lessThan("createdAt", dateEnd);
	query.ascending("createdAt");
	query.skip(skip_index);
	var dateCache=new Date();
	var message="message";
	//query param
	query.select([
		message,
		"updateAt",
		"email",
		"version"
		]);
	query.find({
	  success: function(objectList) {
	  		//console.log("here:"+objectList.length);
	  		if(objectList!=null&&objectList.length>0){
	  			//console.log("so item get duoc:"+objectList.length+","+Object.keys(data).length);
	    		for(var i=0;i<objectList.length;i++)
	    		{
	    			if(objectList[i].get(message)!=null)
	    			{
	    				var dateNow=new Date(objectList[i].get("updatedAt"));
	    				
		    			console.log((i+1+skip_index)+" \t"+objectList[i].get(message)+" \t"+objectList[i].get("email")+" \t"+objectList[i].get("version")+" \t "+dateNow.toLocaleDateString()+" \t "+dateNow.toLocaleTimeString());
			    	}
	    		}
	    		dateCache=objectList[objectList.length-1].get("createdAt");
	    		dateCache.setSeconds(dateCache.getSeconds() + 10);
	    		//console.log("Max createdAt:"+dateCache);
	    	}
	    	if(skip_index+max+cache_index>=total){// da lay het du lieu
				result.result=true;
				result.data=data;
				callback(result);
	    	}
	    	else// van con du lieu de quy lay cho het
	    	{
	    		skip_index+=max;
	    		if(skip_index>=10000){
	    			cache_index+=10000;
	    			skip_index=0;
	    			date=dateCache;
	    		}
	    		QueryAllFeedbackRoutine(data,total,skip_index,cache_index,date,dateEnd,callback);
	    	}
	  },
	  error: function(error) {
	  		console.log("Loi data roi:"+JSON.stringify(error));
	  		result.is_success=false;
	  		callback(true);
	  }
	});
}

module.exports.QueryAllSongRequest=function(callback){
	result={
		is_success:false,
		data:0,
	};
	var LevelRanking = Parse.Object.extend("SongRequest");
	var query = new Parse.Query(LevelRanking);

	var dateStart=new Date(2016,6,1);
	var dateEnd=new Date(2016,6,8);
	query.greaterThanOrEqualTo("createdAt", dateStart);
	query.lessThan("createdAt", dateEnd);
	query.count({
		success: function(count) {
			console.log("count QueryAllSongRequest:"+","+count);
		    // The count request succeeded. Show the count
		    if(count==0)
		    {
		    	callback(result);
		    }
		    else
		    {
		    	var data={};
		    	QueryAllSongRequestRoutine(data,count,0,0,dateStart,dateEnd,function(res){
		    		result.data=count;
		    		callback(result);
		    	});
		    }
		  },
		  error: function(error) {
		  	console("error query parse:"+error);
		  	callback(result);
		    // The request failed
		  }
	});
}

QueryAllSongRequestRoutine=function(data,total,skip_index,cache_index,date,dateEnd,callback){
	//console.log("goi vo day QueryAllDataInADay:"+total+","+skip_index)
	var max=1000;
	result={
		is_success:false,
		data:data,
	};
	var LevelRanking = Parse.Object.extend("SongRequest");
	var query = new Parse.Query(LevelRanking);
	query.limit(max);// maximum parse for query is 1000

	var daysOld = date; 
	query.greaterThanOrEqualTo("createdAt", daysOld);
	query.lessThan("createdAt", dateEnd);
	query.ascending("createdAt");
	query.skip(skip_index);
	var dateCache=new Date();
	//query param
	query.select([
		"message",
		"updateAt"
		]);
	query.find({
	  success: function(objectList) {
	  		//console.log("here:"+objectList.length);
	  		if(objectList!=null&&objectList.length>0){
	  			//console.log("so item get duoc:"+objectList.length+","+Object.keys(data).length);
	    		for(var i=0;i<objectList.length;i++)
	    		{
	    			if(objectList[i].get("message")!=null)
	    			{
	    				var dateNow=new Date(objectList[i].get("updatedAt"));
	    				
		    			console.log((i+1+skip_index)+"\t"+objectList[i].get("message")+"\t"+dateNow.toLocaleDateString()+"\t"+dateNow.toLocaleTimeString());
			    	}
	    		}
	    		dateCache=objectList[objectList.length-1].get("createdAt");
	    		dateCache.setSeconds(dateCache.getSeconds() + 10);
	    		//console.log("Max createdAt:"+dateCache);
	    	}
	    	if(skip_index+max+cache_index>=total){// da lay het du lieu
				result.result=true;
				result.data=data;
				callback(result);
	    	}
	    	else// van con du lieu de quy lay cho het
	    	{
	    		skip_index+=max;
	    		if(skip_index>=10000){
	    			cache_index+=10000;
	    			skip_index=0;
	    			date=dateCache;
	    		}
	    		QueryAllSongRequestRoutine(data,total,skip_index,cache_index,date,dateEnd,callback);
	    	}
	  },
	  error: function(error) {
	  		console.log("Loi data roi:"+JSON.stringify(error));
	  		result.is_success=false;
	  		callback(true);
	  }
	});
}

