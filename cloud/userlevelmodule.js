
//version 1
module.exports.GetTotalUserByLevel = function(callback){
	var TotalUserByLevelData = Parse.Object.extend("TotalUserByLevel");
	var query = new Parse.Query(TotalUserByLevelData);
	var data={};
	query.equalTo("query_id",0);
	query.limit(1);
	query.select([
		"query_id",
		"total_user_by_level",
		"last_time_update"
		]);
	query.find({
	  success: function(objectTotalList) {
	  		var objectTotal=null;
	  		// co du lieu
	    	if(objectTotalList!=null&&objectTotalList.length>0){
	    		objectTotal=objectTotalList[0];
	    		var lastTime=objectTotal.get("last_time_update");
	    		var dateNow = new Date().getTime();
				// neu lon hon mot gio
				console.log("Current Time "+dateNow+","+lastTime);
				if(dateNow - lastTime > 10*60*1000){// 10 phut
					console.log("Qua han: save lai thoi gian lay truoc");
					var saveData =objectTotal;
					saveData.set("last_time_update", dateNow);
					saveData.save(null, {
						success: function(saveData) {
							console.log("Save thoi gian thanh cong Lay du lieu moi");
					    	QueryLevelUserDataByMaxLevel(data,objectTotal,function(res){
								if(res.result_code==true)
								{
									callback(res.data);
								}
								else
								{
									console.log("Lay du lieu bi loi-> tra ve du lieu cu");
									//query failed-> lay lai du lieu cu
									callback(objectTotal.get("total_user_by_level"));
								}
							});
						},
						error: function(saveData, error) {
						    console.log('Save failed , Error Code: ' + error.message);
						    callback(result);
						}
					});
					
				}
				else
				{
					 console.log("Chua qua han,lay du lieu cache");
					 callback(objectTotal.get("total_user_by_level"));
				}
			}
			// chua dang nhap lan nao trong ngay	
	    	if(objectTotal==null){
	    		console.log("Chua co du lieu tao moi");
	    		objectTotal = new TotalUserByLevelData();
				QueryLevelUserDataByMaxLevel(data,objectTotal,function(res){
					callback(res.data);
				});
	    	}
	   },
	  error: function(error) {
	  		console.log("Loi save login activity roi");
	  		callback({});
		  }
	});
};
QueryLevelUserDataByMaxLevel=function(data,objectTotal,callback){
	var result={
		result_code:false,
		data:{}
	}
	var UserData = Parse.Object.extend("UserData");
	var query = new Parse.Query(UserData);
	query.limit(1);
	query.descending("level");
	query.select["level"];
	query.find({
	  	success: function(listGet) {
	  		var objMaxLevel=null;
	    	if(listGet!=null&&listGet.length>0){

	    		objMaxLevel=listGet[0];// by default
	    		var maxLevel=objMaxLevel.get("level");
				console.log("Max Level is:"+maxLevel);
				QueryLevelUserData(maxLevel,0,data,function(res){
					data=res.data;
					// Total user by level la data.
					// save xuong ban Total User
					var dataLength=JSON.stringify(data).length;
					if(res.result_code==1&&dataLength>4)
					{
						var dateNow = new Date().getTime()
						var saveData =objectTotal;
						saveData.set("query_id", 0);
						saveData.set("total_user_by_level", data);
						saveData.set("last_time_update", dateNow);
						saveData.save(null, {
							success: function(saveData) {
						    	console.log("QueryLevelUserDataByMaxLevel Save success");
								callback(res);
							},
							error: function(saveData, error) {
							    console.log('Save failed , Error Code: ' + error.message);
							    callback(result);
							}
						});
					}
					else
					{
						console.log("Du lieu query bi loi nen khong luu moi");
						callback(result);
					}
				});
	    	}
		},
	 	error: function(error) {
			console.log("Login User Data Query Find failed");
			callback({});
	  	}
	});
};


QueryLevelUserData = function(level,addCount,data,callback){
	var result={
		result_code:-1,
		data:{}
	}
	var UserData = Parse.Object.extend("UserData");
	var query = new Parse.Query(UserData);
	query.equalTo("level", level);

	query.count({
		success: function(count){
			data[level]=count+addCount;
			addCount+=count;	
			console.log("Level:"+level+" has "+data[level]);
			
			if(level>1){
				level--;
				QueryLevelUserData(level,addCount,data,callback);
			}
			else
			{
				result.result_code=1;
				result.data=data;
				callback(result);
			}
		},
		error: function(error){
			result.result_code=-1;
			result.data={};
			callback(result);
			console.log("error query parse:"+error + "at level "+level);
		}
	});	
};


//Version 2
module.exports.GetInfoForLevelAndSong= function(callback){
	var TotalUserByLevelData = Parse.Object.extend("TotalUserByLevel");
	var query = new Parse.Query(TotalUserByLevelData);
	result={
		result_code:-1,
		total_user_by_level:{},
		song_info:{},
		last_time_update:new Date().getTime()
	};
	query.equalTo("query_id",1);
	query.limit(1);
	query.select([
		"query_id",
		"total_user_by_level",
		"song_info",
		"last_time_update"
		]);
	console.log("Here");
	query.find({
	  success: function(objectTotalList) {
	  	console.log("Here1");
	  		var objData=null;
	  		// co du lieu
	    	if(objectTotalList!=null&&objectTotalList.length>0){

	    		objData=objectTotalList[0];
	    		result.result_code=1
				result.total_user_by_level=objData.get("total_user_by_level");
				result.song_info=objData.get("song_info");
				callback(result);
			}
			else
			{
				callback(result);
			}

	   },
	   error: function(error) {
	  		console.log("Loi save login activity roi");
	  		callback(result);
	   }
	});
}
module.exports.JobProcessInfoForSong= function(callback){
	var TotalUserByLevelData = Parse.Object.extend("TotalUserByLevel");
	var query = new Parse.Query(TotalUserByLevelData);
	resultJob={
		result_code:-1,
		total_user_by_level:{},
		song_info:{},
		last_time_update:new Date().getTime()
	};
	query.equalTo("query_id",1);
	query.limit(1);
	query.select([
		"query_id",
		"total_user_by_level",
		"song_info",
		"last_time_update"
		]);
	query.find({
	  success: function(objectTotalList) {
	  		var objectSave=null;
	  		// co du lieu
	    	if(objectTotalList!=null&&objectTotalList.length>0){
	    		objectSave=objectTotalList[0];
			}
			// chua dang nhap lan nao trong ngay	
	    	if(objectSave==null){
	    		objectSave = new TotalUserByLevelData();
			}
			var data={};
			QueryLevelUserDataByMaxLevelVer2(data,function(res){
				resultJob.total_user_by_level=res.data;
				
				QueryAllCMSActionVer2(function(res2){
					resultJob.song_info=res2.data;
					var length1=JSON.stringify(resultJob.total_user_by_level).length;
					var length2=JSON.stringify(resultJob.song_info).length;
					if(length1>4&&length2>4)// phai co  du lieu moi cho save
					{
							objectSave.set("query_id",1);
							objectSave.set("total_user_by_level",resultJob.total_user_by_level);
							objectSave.set("song_info",resultJob.song_info);
							objectSave.set("last_time_update",resultJob.last_time_update);
							objectSave.save(null, {
							success: function(saveData) {
								resultJob.result_code=1;
						    	console.log("JobProcessInfoForSong Save success");
								callback(resultJob);
							},
							error: function(saveData, error) {
							    console.log('Save failed , Error Code: ' + error.message);
							    callback(result);
							}
						});
					}
					else{
						callback(result);
					}
				});
			});
	   },
	   error: function(error) {
	  		console.log("Loi save login activity roi");
	  		callback(result);
	   }
	});
}


QueryLevelUserDataByMaxLevelVer2=function(data,callback){
	var resultMaxLevel={
		resultMaxLevel_code:-1,
		data:{}
	}
	var UserData = Parse.Object.extend("UserData");
	var query = new Parse.Query(UserData);
	query.limit(1);
	query.descending("level");
	query.select["level"];
	query.find({
	  	success: function(listGet) {
	  		var objMaxLevel=null;
	    	if(listGet!=null&&listGet.length>0){

	    		objMaxLevel=listGet[0];// by default
	    		var maxLevel=objMaxLevel.get("level");
				console.log("Max Level is:"+maxLevel);
				QueryLevelUserDataVer2(maxLevel,data,0,function(res){
					var dataLength=JSON.stringify(res.data).length;
					resultMaxLevel.resultMaxLevel_code=1;
					resultMaxLevel.data=res.data;
					callback(resultMaxLevel);
				});
	    	}
	    	else
	    	{
	    		callback(resultMaxLevel);
	    	}
		},
	 	error: function(error) {
			console.log("QueryLevelUserDataByMaxLevelVer2 Query Find failed");
			callback(resultMaxLevel);
	  	}
	});
};

QueryLevelUserDataVer2 = function(level,data,addCount,callback){
	var result={
		result_code:-1,
		data:{}
	}
	var UserData = Parse.Object.extend("UserData");
	var query = new Parse.Query(UserData);
	query.equalTo("level", level);

	query.count({
		success: function(count){
			data[level]=count+addCount;
			addCount+=count;
			console.log("Level:"+level+" has "+data[level]);
			if(level>1){
				level--;
				QueryLevelUserDataVer2(level,data,addCount,callback);
			}
			else
			{
				result.result_code=1;
				result.data=data;
				callback(result);
			}
		},
		error: function(error){
			result.result_code=-1;
			result.data={};
			callback(result);
			console.log("error query parse:"+error + "at level "+level);
		}
	});	
};


QueryAllCMSActionVer2=function(callback){
	result={
		is_success:false,
		data:{},
	};
	var cmsAction = Parse.Object.extend("CMS_ACTION_DATA");
	var query = new Parse.Query(cmsAction);
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
		    	QueryAllCMSActionRoutine(data,count,0,0,new Date(2015,0,1),function(res){
		    		result.data=res.data;
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

QueryAllCMSActionRoutine=function(data,total,skip_index,cache_index,date,callback){
	var max=1000;
	result={
		is_success:false,
		data:data,
	};
	var cmsAction = Parse.Object.extend("CMS_ACTION_DATA");
	var query = new Parse.Query(cmsAction);
	query.limit(max);// maximum parse for query is 1000

	var daysOld = date; 
	query.greaterThan("createdAt", daysOld);
	query.ascending("createdAt");
	query.skip(skip_index);
	var dateCache=new Date(2016,0,1);
	//query param
	query.select([
		"item_spend_ruby",
		"createdAt"
		]);
	query.find({
	  success: function(objectList) {
	  		//console.log("here:"+objectList.length);
	  		if(objectList!=null&&objectList.length>0){
	  			//console.log("so item get duoc:"+objectList.length+","+Object.keys(data).length);
	    		for(var i=0;i<objectList.length;i++)
	    		{
	    			if(objectList[i].get("item_spend_ruby")!=null)
	    			{
	    				var element=objectList[i].get("item_spend_ruby");
		    			for (var key in element) 
						{
							if(data.hasOwnProperty(key))
							{
								var oldValue=data[key];
								data[key]=oldValue+element[key];
							}
							else
							{
								data[key]=element[key];
							}
						}
						//console.log("item spend:"+JSON.stringify(element));
		    		}
	    		}
	    		result.data=data;
	    		dateCache=objectList[objectList.length-1].get("createdAt");
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
	    		QueryAllCMSActionRoutine(data,total,skip_index,cache_index,date,callback);
	    	}
	  },

	  error: function(error) {
	  		console.log("Loi data roi:"+JSON.stringify(error));
	  		result.is_success=false;
	  		callback(true);
	  }
	});
}

