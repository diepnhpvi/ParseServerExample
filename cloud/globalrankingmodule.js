module.exports.GetGlobalRanking=function(request,callback){
	var result={
		result_code :-1,
		index_me:-1,
		data:[],
		extra: "Get Global Ranking Failed"
	}
	var skip_index=request.params.skip_index;
	var limit=request.params.limit;
	var user_id=request.params.user_id;
	var score=request.params.score;
	QueryMeIndexRanking(user_id,score,function(res1){
		result.index_me=res1;
		QueryGlolablLevelRanking(skip_index,limit,function(res2){
			if(res2.is_success==true){
				result.data=res2.data;
				result.result_code=1;
				result.extra="success";
			}
			callback(result);
		});
	});
}

QueryMeIndexRanking=function(user_id,score,callback)
{
	var indexMe=-1;
	result={
		is_success:false,
		data:0,
	};
	var LevelRanking = Parse.Object.extend("LevelRanking");
	var query = new Parse.Query(LevelRanking);
	query.exists("total_ranking");
	query.greaterThan("total_ranking", score);
	query.descending("total_ranking");
	query.count({
		success: function(count) {
			console.log("AAAAAAAAAAA:"+count);
		    // The count request succeeded. Show the count
		    indexMe=count;
		    callback(indexMe);
		  },
		  error: function(error) {
		  	console("error query parse:"+error);
		  	callback(indexMe);
		    // The request failed
		  }
	});
}

QueryGlolablLevelRanking=function(skip_index,limit,callback){
	console.log("goi vo day QueryAllDataInADay: QueryGlolablLevelRanking,"+skip_index+","+limit);
	var max=1000;
	result={
		is_success:false,
		data:[],
	};
	data=[];
	var LevelRanking = Parse.Object.extend("LevelRanking");
	var query = new Parse.Query(LevelRanking);
	query.limit(limit);// maximum parse for query is 1000
	query.exists("total_ranking");
	query.descending("total_ranking");
	query.skip(skip_index);
	//query param
	query.select([
		"user_id",
		"user_name",
		"level",
		"total_star",
		"total_score",
		"total_ranking",
		]);
	query.find({
	  success: function(objectList) {
	  		//console.log("here:"+objectList.length);
	  		if(objectList!=null&&objectList.length>0){
	  			console.log("so item get duoc:"+objectList.length+","+Object.keys(data).length);
	    		for(var i=0;i<objectList.length;i++)
	    		{
	    			if(objectList[i].get("user_id")!=null)
	    			{
		    			var user_id=objectList[i].get("user_id");
		    			if(user_id.length>2)
		    			{
		    				var element={
		    					"user_id":objectList[i].get("user_id"),
		    					"user_name":objectList[i].get("user_name"),
		    					"level":objectList[i].get("level"),
		    					"total_star":objectList[i].get("total_star"),
		    					"total_score":objectList[i].get("total_score"),
		    					"total_ranking":objectList[i].get("total_ranking")
		    				};
		    				data.push(element);
			    		}
		    		}
	    		}
	    	}
	    	result.data=data;
	    	result.is_success=true;
	    	callback(result);
	  },
	  error: function(error) {
	  		console.log("Loi data roi:"+JSON.stringify(error));
	  		result.is_success=false;
	  		callback(result);
	  }
	});
}

module.exports.FixAllRankingLevel=function(callback){
	console.log("Module FixAllRankingLevel");
	result={
		is_success:false,
		data:0,
	};
	var UserData = Parse.Object.extend("UserData");
	var query = new Parse.Query(UserData);
	query.notEqualTo('facebook_id',"");
	query.count({
		success: function(count) {
			//console.log("count calculation:"+count);
		    // The count request succeeded. Show the count
		    if(count==0)
		    {
		    	callback(result);
		    }
		    else
		    {
		    	var data={};
		    	FixAllRankingLevelRoutine(data,count,0,0,new Date(2015,0,1),function(res){
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

FixAllRankingLevelRoutine=function(data,total,skip_index,cache_index,date,callback){
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
	//query.ascending("createdAt");
	query.descending("total_ranking");
	query.notEqualTo('facebook_id',"");
	query.skip(skip_index);
	
	var dateCache=new Date(2016,0,1);
	//query param
	query.select([
		"facebook_id",
		"level",
		"dic_hard",
		"dic_normal",
		"dic_easy",
		"createdAt"
		]);
	query.find({
	  success: function(objectList) {
	  		if(objectList!=null&&objectList.length>0){
	  			FixOneLevelRanking(data,total,skip_index,cache_index,date,objectList,0,function(res){
	  				FixAllRankingLevelRoutineStep2(data,total,skip_index,cache_index,date,max,callback);
	  			});
	    	}
	    	else
	    	{
	    		FixAllRankingLevelRoutineStep2(data,total,skip_index,cache_index,date,max,callback);
	    	}
	    	
	  },
	  error: function(error) {
	  		console.log("Loi data roi:"+JSON.stringify(error));
	  		result.is_success=false;
	  		callback(true);
	  }
	});
}
FixAllRankingLevelRoutineStep2=function(data,total,skip_index,cache_index,date,max,callback){
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
		FixAllRankingLevelRoutine(data,total,skip_index,cache_index,date,callback);
	}
}

FixOneLevelRanking=function(data,total,skip_index,cache_index,date,objectList,index_rank,callback){
	var i=index_rank;
	if(index_rank<objectList.length&&objectList[i].get("facebook_id")!=null)
	{
		var facebook_id=objectList[i].get("facebook_id");
		if(facebook_id!=null&&facebook_id.length>2)
		{	

			if(!data.hasOwnProperty(facebook_id))
			{
				data[facebook_id]=1;
			}
			var dic_hard=objectList[i].get("dic_hard");
			var dic_normal=objectList[i].get("dic_normal");
			var dic_easy=objectList[i].get("dic_easy");
			//console.log(JSON.stringify(dic_easy));
			var level=objectList[i].get("level");
			var star=0;
			var score=0;
			var totalRanking=0;
			for (var i = 0, len = dic_easy.length; i < len; i++) {
					star+= dic_easy[i]["Value"]["star"];
			   		score+=dic_easy[i]["Value"]["score"];
				
			}
			for (var i = 0, len = dic_normal.length; i < len; i++) {
					star+= dic_normal[i]["Value"]["star"];
			   		score+=dic_normal[i]["Value"]["score"];
				
			}
			for (var i = 0, len = dic_hard.length; i < len; i++) {
					star+= dic_hard[i]["Value"]["star"];
			   		score+=dic_hard[i]["Value"]["score"];
			}
			totalRanking=level*10000000+score;
			//console.log("in ra gia tri:"+level+","+star+","+score+","+totalRanking)
			ProcessUpdateLevelRankingOneElement(facebook_id,level,star,score,totalRanking,function(resSave){
				index_rank++;
				FixOneLevelRanking(data,total,skip_index,cache_index,date,objectList,index_rank,callback);
			});
			
		}
		else
		{
			index_rank++;
			FixOneLevelRanking(data,total,skip_index,cache_index,date,objectList,index_rank,callback);
		}
	}
	else
	{
		callback(true);
	}
}
ProcessUpdateLevelRankingOneElement=function(facebook_id,level,star,score,totalRanking,callback){
	var UserData = Parse.Object.extend("LevelRanking");
	var query = new Parse.Query(UserData);
	query.equalTo("user_id", facebook_id);
	query.limit(1);
	//query param
	query.select([
		"user_id",
		"user_name"]);
	query.find({
	  success: function(objectUpdateData) {
	  		var objectUpdate=null;
	    	if(objectUpdateData!=null&&objectUpdateData.length>0){
	    		objectUpdate=objectUpdateData[0];
	    	}
	    	if(objectUpdate==null)// chua co tai khoan tren server -> ket thuc xu ly
	    	{
	    		console.log('NOT Save Ranking: ' + facebook_id+","+level+","+star+","+score+","+totalRanking);
				callback(false);
	    	}
	    	else
	    	{
	    		saveData=objectUpdate;
	    		saveData.set("level",level);
	    		saveData.set("total_star",star);
	    		saveData.set("total_score",score);
	    		saveData.set("total_ranking",totalRanking);
	    		saveData.save(null, {

					  success: function(saveData2) {
					  	// Execute any logic that should take place after the object is saved.
					    console.log('Update Level Raking Success: ' + facebook_id+","+objectUpdate.get("user_name")+","+level+","+star+","+score+","+totalRanking);
					    callback(true);
					  },
					  error: function(saveData2, error) {
					    callback(false);
					  }
				});
	    	}
	  },
	  error: function(error) {

	  		console.log("Update User Data Query Find Failed");
	  		callback({result:-103, data:null,quest:null,achivement:null,is_new:false});
	  }
	});
}