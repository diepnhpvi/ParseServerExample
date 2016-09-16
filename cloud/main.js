//require("./app.js");
var loginmodule = require("../cloud/loginmodule.js");
var activitymodule = require("../cloud/activitymodule.js");
var analyticsmodule = require("../cloud/analyticsmodule.js");
var userlevelmodule = require("../cloud/userlevelmodule.js");
var challengemodule = require("../cloud/challengefriend.js");
var testmodule = require("../cloud/testmodule.js");
var rankingmodule = require("../cloud/globalrankingmodule.js");
RESULT_CODE={
	OK: 						1,
	NEW_DATA_IN_OTHER_DEVICE: 	2,
	FAILED:						-101,
	ACCOUNT_NOT_EXISTS:			-102,
	QUERY_PARSE_ERROR:			-103
}; 


/// StrongD- Test Parse Cloud
Parse.Cloud.define("hello", function(request, response) {
   result={
   		result_code:1,
   		data:"Hello world Amanotes Dev!"
   }
  response.success(result);
});

Parse.Cloud.define("GetTimeServer", function(request, response) {
   result={
   		result_code:1,
   		server_time	:new Date().getTime()
   }
  response.success(result);
});

/// Login to Server Parse
/// Check Account By Device Id
Parse.Cloud.define("Login", function(request, response) {

	result={
		result_code :RESULT_CODE.FAILED,
		server_time	:new Date().getTime(),// tra ve thoi gian server
		is_new: 	false,
		data 		:{},
		quest		:null,
		achivement	:null,
		inbox		:null,
		extra		:""
	}
	var is_error_input=false;
	//kiem tra pass het toan bo thong tin dau vao
	var userData ={};
	var logAction={};
	var rawData=request.params.user_data_raw;
	var rawLog=request.params.log_action_raw;
	if(rawData!=null&&rawData.length>0)
	{
		userData =JSON.parse(rawData.toString()); 
	}
	if(rawLog!=null&&rawLog.length>0)
	{
		logAction =JSON.parse(rawLog.toString()); 
	}
	request.params.user_data=userData;
	request.params.log_action=logAction;
	
	if(!request.params.hasOwnProperty("user_data")){
		is_error_input=true;
		result.extra="user_data is null";
		console.log("user_datais null");
	}
	else if(!request.params.user_data.hasOwnProperty("device_id")){
		is_error_input=true;
		result.extra="Device id is null";
		console.log("Device Id is null");
	}
	// co loi tu du lieu input
	if(is_error_input)
	{
		response.success(result);
	}
	else
	{
		loginmodule.Login(request,function(loginResult){
			if(loginResult.result>0){
				result.result_code=loginResult.result;
		    	result.data=loginResult.data;
		    	result.is_new=loginResult.is_new;
		    	result.quest=loginResult.quest;
		    	result.achivement=loginResult.achivement;
		    	result.inbox=loginResult.inbox;
		    	if(result.result_code==RESULT_CODE.OK)
		    	{
		    		result.extra="Login Successful";
		    	}
		    	else if(result.result_code==RESULT_CODE.NEW_DATA_IN_OTHER_DEVICE)
		    	{
		    		result.extra="Login Success, But Update to server failed, due to server have new update from another device";
		    	}
		    	var logAction=null;
		    	if(request.params.hasOwnProperty("log_action")!=null)
		    	{
		    		logAction=request.params.log_action;
		    	}
		    	if(loginResult.data!=null){
			    	activitymodule.SaveLogActionUser(logAction,loginResult.data.device_id,true,result.is_new,function(callback){
						response.success(result);
					});
		    	}
		    	else
		    	{
		    		response.success(result);
		    	}
			}
			else
			{
				result.result_code=loginResult.result;
		    	result.data=loginResult.data;
		    	result.extra="Login failed";
				response.success(result);
			}
		});
	}
});

/// Update user Data
Parse.Cloud.define("UpdateUserData", function(request, response) {
	result={
		result_code :RESULT_CODE.FAILED,
		server_time	:new Date().getTime(),// tra ve thoi gian server
		data 		:{},
		extra		:""
	}
	var is_error_input=false;
	var userData ={};
	var logAction={};
	var rawData=request.params.user_data_raw;
	var rawLog=request.params.log_action_raw;
	if(rawData!=null&&rawData.length>0)
	{
		userData =JSON.parse(rawData.toString()); 
	}
	if(rawLog!=null&&rawLog.length>0)
	{
		logAction =JSON.parse(rawLog.toString()); 
	}
	request.params.user_data=userData;
	request.params.log_action=logAction;
	//kiem tra pass het toan bo thong tin dau vao
	if(!request.params.hasOwnProperty("user_data")){
		is_error_input=true;
		result.extra="UpdateUserData user_data is null";
		console.log("UpdateUserData user_datais null");
	}
	else if(!request.params.user_data.hasOwnProperty("device_id")){
		is_error_input=true;
		result.extra="UpdateUserData Device Id is null";
		console.log("UpdateUserData Device Id is null");
	}
	// co loi tu du lieu input
	if(is_error_input)
	{
		response.success(result);
	}
	else
	{
		loginmodule.UpdateUserData(request,function(updateDataResult){
			if(updateDataResult.result){
				result.result_code=updateDataResult.result;
		    	result.data=updateDataResult.data;
		    	if(result.result_code==RESULT_CODE.OK)
		    	{
		    		result.extra="update data Successful";
		    	}
		    	else if(result.result_code==RESULT_CODE.NEW_DATA_IN_OTHER_DEVICE)
		    	{
		    		result.extra="account ok but Update to server failed, due to server have new update from another device";
		    	}
		    	var logAction=request.params.log_action;
			    if(updateDataResult.data!=null){
			    	activitymodule.SaveLogActionUser(logAction,updateDataResult.data.device_id,false,false,function(callback){
						response.success(result);
					});
				}
		    	else
		    	{
		    		response.success(result);
		    	}
			}
			else
			{
				result.result_code=RESULT_CODE.FAILED;
		    	result.data=updateDataResult.data;
		    	result.extra="Update Data failed";
				response.success(result);
			}
		});
	}
});


Parse.Cloud.define("GetTime", function (request, response) {
	var dateNow=new Date();
	var date=new Date(dateNow.getTime());// ngay hom qua
	var year=date.getUTCFullYear();
	var month=date.getUTCMonth()+1;
	var day=date.getUTCDate();
	var dateString=year+"/"+month+"/"+day;
	response.success("GetTime finish:"+dateString+","+date.GetTime());
	
});

Parse.Cloud.define("RunAnalytics", function (request, response) {
	var dateNow=new Date();
	var date=new Date(dateNow.getTime()-24*60*60*1000);// ngay hom qua
	var year=date.getUTCFullYear();
	var month=date.getUTCMonth()+1;
	var day=date.getUTCDate();
	
	var dateString=year+"/"+month+"/"+day;
	console.log("Analytics for day:"+dateString);
    analyticsmodule.AnalyticsInADay(year,month,day,function(){
		response.success("JobAnalytics finish for day:"+dateString+",now is:"+dateNow.getTime());
	});
});

Parse.Cloud.define("RunAnalyticsWithTime", function (request, response) {
	var dateNow=new Date();
	var year=request.params.year;
	var month=request.params.month;
	var day=request.params.day;
	if(year==null||month==null||day==null){
		response.success("RunAnalyticsWithTime fail: invalid inputday");
		return;
	}
	var dateString=year+"/"+month+"/"+day;
	console.log("RunAnalyticsWithTime for day:"+dateString);
	analyticsmodule.AnalyticsInADay(year,month,day,function(){
		response.success("RunAnalyticsWithTime finish for day:"+dateString+",now is:"+dateNow.getTime());
	});
});

//Parse.Cloud.job("JobAnalyticsYesterday", function (request, response) {
//	var dateNow=new Date();
//	var date=new Date(dateNow.getTime()-24*60*60*1000);// ngay hom qua
//	var year=date.getUTCFullYear();
//	var month=date.getUTCMonth()+1;
//	var day=date.getUTCDate();
	
//	var dateString=year+"/"+month+"/"+day;
//	console.log("JobAnalyticsYesterday for day:"+dateString);
//    analyticsmodule.AnalyticsInADay(year,month,day,function(){
//		response.success("JobAnalyJobAnalyticsYesterdaytics finish for day:"+dateString+",now is:"+dateNow.getTime());
//	});
//});

//Parse.Cloud.job("JobAnalyticsToday", function (request, response) {
//	var dateNow=new Date();
//	var date=new Date(dateNow.getTime());// ngay hom qua
//	var year=date.getUTCFullYear();
//	var month=date.getUTCMonth()+1;
//	var day=date.getUTCDate();
	
//	var dateString=year+"/"+month+"/"+day;
//	console.log("JobAnalyticsToday for day:"+dateString);
//    analyticsmodule.AnalyticsInADay(year,month,day,function(){
//		response.success("JobAnalyticsToday finish for day:"+dateString+",now is:"+dateNow.getTime());
//	});
//});

//Parse.Cloud.job("JobAnalyticsWithTime", function (request, response) {
//	var dateNow=new Date();
//	var year=request.params.year;
//	var month=request.params.month;
//	var day=request.params.day;
//	if(year==null||month==null||day==null){
//		response.success("JobAnalyticsWithTime fail: invalid inputday");
//		return;
//	}

//	var dateString=year+"/"+month+"/"+day;
//	console.log("JobAnalyticsWithTime for day:"+dateString);
//    analyticsmodule.AnalyticsInADay(year,month,day,function(){
//		response.success("JobAnalyticsWithTime finish for day:"+dateString+",now is:"+dateNow.getTime());
//	});
//});
Parse.Cloud.define("helloWorld2", function (request, response) {
    //call 'helloWorld' method from 'util.js' file
    var util = require("cloud/util.js");

    util.helloWorld(function (result) {
        response.success(result);
    });
});

//Parse.Cloud.job("testJOB", function (request, response) {
//    console.log("Test job call success! ");
//});


// for info all song
Parse.Cloud.define("GetTotalUserFriends", function (request, response) {
 	  var result={
 	  	result_code:1,
 	  	data:{}
 	  }
 	  console.log("GetTotalUserFriends:1");
 	  userlevelmodule.GetTotalUserByLevel(function(data){
 	  	console.log("GetTotalUserFriends: finish");
 	  	result.data=data;
 	  	var dataLength=0;
 	  	if(data!=null)
 	  	{
 	  		dataLength=JSON.stringify(data).length;
 	  	}
 	  	if(dataLength>4)
 	  	{
 	  		response.success(result);
 	  	}
 	  	else{
 	  		response.success(null);
 	  	}
 	  });
});
Parse.Cloud.define("GetInfoForLevelAndSong", function (request, response) {
 	  var result={
 	  	
 	  }
 	  userlevelmodule.GetInfoForLevelAndSong(function(res){
 	  	console.log("GetTotalUserFriends: finish");
 	  	result.data=res;
 	  	response.success(res);
 	  });
});

Parse.Cloud.define("TestJobProcessInfoForSong", function (request, response) {
 	  var result={
 	  	
 	  }
 	  userlevelmodule.JobProcessInfoForSong(function(res){
 	  	result.data=res;
 	  	response.success(res);
 	  });
});

//Parse.Cloud.job("JobProcessInfoForSong", function (request, response) {
// 	  var result={
 	  	
// 	  }
// 	  console.log("JobProcessInfoForSong:1");
// 	  userlevelmodule.JobProcessInfoForSong(function(res){
// 	  	console.log("JobProcessInfoForSong: finish");
// 	  	result.data=res;
// 	  	response.success(res);
// 	  });
//});


/// Challenge Friend feature

// QueryAllChallenge
Parse.Cloud.define("QueryAllChallenge", function(request, response) {
	result={
		result_code :RESULT_CODE.FAILED,
		data 		:{},
		friend_info	:{},
		server_time	:new Date().getTime(),// tra ve thoi gian server
		extra:""
	}
	var is_error_input=false;
	var friend_ids =[];
	//kiem tra pass het toan bo thong tin dau vao
	if(!request.params.hasOwnProperty("user_id")){
		is_error_input=true;
		result.extra="user_id is null";
		console.log("user_id null");
	}
	if(request.params.user_id.length<2){
		is_error_input=true;
		result.extra="user_id is invalid";
		console.log("user_id invalid");
	}

	if(request.params.hasOwnProperty("friend_ids")){
		friend_ids_temp=request.params.friend_ids.split(";");
		for(var i=0;i<friend_ids_temp.length;i++)
	    {
	    	if(friend_ids_temp[i].length>2)
	    	{
	    		friend_ids.push(friend_ids_temp[i]);
	    	}
	    }
	}
	console.log(JSON.stringify(friend_ids));
	request.params.friend_ids=friend_ids;
	// co loi tu du lieu input
	if(is_error_input)
	{
		console.log("Have Error");
		response.success(result);
	}
	else
	{
		console.log("QueryAllChallenge module");
		challengemodule.QueryAllChallenge(request,function(res){
			result=res;
			result.server_time=new Date().getTime();
			response.success(result);
		});
	}
});

// Request Challenge
Parse.Cloud.define("RequestChallenge", function(request, response) {
	result={
		result_code :RESULT_CODE.FAILED,
		server_time	:new Date().getTime(),// tra ve thoi gian server
		extra:""
	}
	var is_error_input=false;
	var friend_ids =[];

	//kiem tra pass het toan bo thong tin dau vao
	if(!request.params.hasOwnProperty("player_one_id")){
		is_error_input=true;
		result.extra="player_one_id is null";
		console.log("player_one_id null");
	}
	else if(!request.params.hasOwnProperty("player_two_id")){
		is_error_input=true;
		result.extra="player_two_id is null";
		console.log("player_two_id null");
	}
	else if(request.params.player_one_id.length<2){
		is_error_input=true;
		result.extra="player_one_id is invalid";
		console.log("player_one_id is invalid");
	}
	else if(request.params.player_two_id.length<2){
		is_error_input=true;
		result.extra="player_two_id is invalid";
		console.log("player_two_id is invalid");
	}
	else if(!request.params.hasOwnProperty("song_id")){
		is_error_input=true;
		result.extra="song_id is null";
		console.log("song_id null");
	}
	else if(!request.params.hasOwnProperty("ruby")){
		is_error_input=true;
		result.extra="ruby is null";
		console.log("ruby null");
	}
	else if(request.params.ruby<1){
		is_error_input=true;
		result.extra="ruby is less than 1";
		console.log("ruby is less than 1");
	}

	// co loi tu du lieu input
	if(is_error_input)
	{
		response.success(result);
	}
	else
	{
		challengemodule.RequestChallenge(request,function(res){
			result=res;
			result.server_time=new Date().getTime();
			response.success(result);
		});
	}
});

// SendResultFromPlayerOne
Parse.Cloud.define("SendResultFromPlayerOne", function(request, response) {
	result={
		result_code :RESULT_CODE.FAILED,
		server_time	:new Date().getTime(),// tra ve thoi gian server
		extra:""
	}
	var is_error_input=false;
	var friend_ids =[];

	//kiem tra pass het toan bo thong tin dau vao
	if(!request.params.hasOwnProperty("player_one_id")){
		is_error_input=true;
		result.extra="player_one_id is null";
		console.log("player_one_id null");
	}
	else if(!request.params.hasOwnProperty("player_two_id")){
		is_error_input=true;
		result.extra="player_two_id is null";
		console.log("player_two_id null");
	}
	else if(request.params.player_one_id.length<2){
		is_error_input=true;
		result.extra="player_one_id is invalid";
		console.log("player_one_id is invalid");
	}
	else if(request.params.player_two_id.length<2){
		is_error_input=true;
		result.extra="player_two_id is invalid";
		console.log("player_two_id is invalid");
	}
	else if(!request.params.hasOwnProperty("score")){
		is_error_input=true;
		result.extra="score is null";
		console.log("score null");
	}

	// co loi tu du lieu input
	if(is_error_input)
	{
		response.success(result);
	}
	else
	{
		challengemodule.SendResultFromPlayerOne(request,function(res){
			result=res;
			result.server_time=new Date().getTime();
			response.success(result);
		});
	}
});


// AcceptChallengeFromPlayerTwo
Parse.Cloud.define("AcceptChallengeFromPlayerTwo", function(request, response) {
	result={
		result_code :RESULT_CODE.FAILED,
		server_time	:new Date().getTime(),// tra ve thoi gian server
		extra:""
	}
	var is_error_input=false;
	//kiem tra pass het toan bo thong tin dau vao
	if(!request.params.hasOwnProperty("player_one_id")){
		is_error_input=true;
		result.extra="player_one_id is null";
		console.log("player_one_id null");
	}
	else if(!request.params.hasOwnProperty("player_two_id")){
		is_error_input=true;
		result.extra="player_two_id is null";
		console.log("player_two_id null");
	}
	else if(request.params.player_one_id.length<2){
		is_error_input=true;
		result.extra="player_one_id is invalid";
		console.log("player_one_id is invalid");
	}
	else if(request.params.player_two_id.length<2){
		is_error_input=true;
		result.extra="player_two_id is invalid";
		console.log("player_two_id is invalid");
	}
	// co loi tu du lieu input
	if(is_error_input)
	{
		response.success(result);
	}
	else
	{
		challengemodule.AcceptChallengeFromPlayerTwo(request,function(res){
			result=res;
			result.server_time=new Date().getTime();
			response.success(result);
		});
	}
});

// SendResultFromPlayerTwo
Parse.Cloud.define("SendResultFromPlayerTwo", function(request, response) {
	result={
		result_code :RESULT_CODE.FAILED,
		server_time	:new Date().getTime(),// tra ve thoi gian server
		extra:""
	}
	var is_error_input=false;
	//kiem tra pass het toan bo thong tin dau vao
	if(!request.params.hasOwnProperty("player_one_id")){
		is_error_input=true;
		result.extra="player_one_id is null";
		console.log("player_one_id null");
	}
	else if(!request.params.hasOwnProperty("player_two_id")){
		is_error_input=true;
		result.extra="player_two_id is null";
		console.log("player_two_id null");
	}
	else if(request.params.player_one_id.length<2){
		is_error_input=true;
		result.extra="player_one_id is invalid";
		console.log("player_one_id is invalid");
	}
	else if(request.params.player_two_id.length<2){
		is_error_input=true;
		result.extra="player_two_id is invalid";
		console.log("player_two_id is invalid");
	}
	else if(!request.params.hasOwnProperty("score")){
		is_error_input=true;
		result.extra="score is null";
		console.log("score null");
	}

	// co loi tu du lieu input
	if(is_error_input)
	{
		response.success(result);
	}
	else
	{
		challengemodule.SendResultFromPlayerTwo(request,function(res){
			result=res;
			result.server_time=new Date().getTime();
			response.success(result);
		});
	}
});

// player two reject challenge
Parse.Cloud.define("CancelChallengeFromPlayerTwo", function(request, response) {
	result={
		result_code :RESULT_CODE.FAILED,
		server_time	:new Date().getTime(),// tra ve thoi gian server
		extra:""
	}
	var is_error_input=false;
	//kiem tra pass het toan bo thong tin dau vao
	if(!request.params.hasOwnProperty("player_one_id")){
		is_error_input=true;
		result.extra="player_one_id is null";
		console.log("player_one_id null");
	}
	else if(!request.params.hasOwnProperty("player_two_id")){
		is_error_input=true;
		result.extra="player_two_id is null";
		console.log("player_two_id null");
	}
	else if(request.params.player_one_id.length<2){
		is_error_input=true;
		result.extra="player_one_id is invalid";
		console.log("player_one_id is invalid");
	}
	else if(request.params.player_two_id.length<2){
		is_error_input=true;
		result.extra="player_two_id is invalid";
		console.log("player_two_id is invalid");
	}

	// co loi tu du lieu input
	if(is_error_input)
	{
		response.success(result);
	}
	else
	{
		challengemodule.CancelChallengeFromPlayerTwo(request,function(res){
			result=res;
			result.server_time=new Date().getTime();
			response.success(result);
		});
	}
});

// Player One Claim: when in status win/draw/ or player two cancel
Parse.Cloud.define("PlayerOneClaim", function(request, response) {
	result={
		result_code :RESULT_CODE.FAILED,
		server_time	:new Date().getTime(),// tra ve thoi gian server
		extra:""
	}
	var is_error_input=false;
	//kiem tra pass het toan bo thong tin dau vao
	if(!request.params.hasOwnProperty("player_one_id")){
		is_error_input=true;
		result.extra="player_one_id is null";
		console.log("player_one_id null");
	}
	else if(!request.params.hasOwnProperty("player_two_id")){
		is_error_input=true;
		result.extra="player_two_id is null";
		console.log("player_two_id null");
	}
	else if(request.params.player_one_id.length<2){
		is_error_input=true;
		result.extra="player_one_id is invalid";
		console.log("player_one_id is invalid");
	}
	else if(request.params.player_two_id.length<2){
		is_error_input=true;
		result.extra="player_two_id is invalid";
		console.log("player_two_id is invalid");
	}
	// co loi tu du lieu input
	if(is_error_input)
	{
		response.success(result);
	}
	else
	{
		challengemodule.PlayerOneClaim(request,function(res){
			result=res;
			result.server_time=new Date().getTime();
			response.success(result);
		});
	}
});

// Player One Claim: when in status win/draw/ or player two cancel
Parse.Cloud.define("GetGlobalRanking", function(request, response) {
	result={
		result_code :RESULT_CODE.FAILED,
		data:[],
		index_me:-1,
		extra:""
	}
	var is_error_input=false;
	//kiem tra pass het toan bo thong tin dau vao
	if(!request.params.hasOwnProperty("user_id")){
		is_error_input=true;
		result.extra="user_id is null";
		console.log("user_id null");
	}
	else if(!request.params.hasOwnProperty("score")){
		is_error_input=true;
		result.extra="score is null";
		console.log("score null");
	}
	else if(!request.params.hasOwnProperty("limit")){
		is_error_input=true;
		result.extra="limit is null";
		console.log("limit null");
	}
	else if(!request.params.hasOwnProperty("skip_index")){
		is_error_input=true;
		result.extra="skip_index is null";
		console.log("skip_index null");
	}
	
	// co loi tu du lieu input
	if(is_error_input)
	{
		response.success(result);
	}
	else
	{
		rankingmodule.GetGlobalRanking(request,function(res){
			result=res;
			result.server_time=new Date().getTime();
			response.success(result);
		});
	}
});

//fix global ranking data module
//check data all user data
Parse.Cloud.define("FixAllRankingLevel", function (request, response) {
 	 console.log("FixAllRankingLevel");
 	  rankingmodule.FixAllRankingLevel(function(res){
 	  	response.success(res);
 	  });
});

//test module
//check data all user data
Parse.Cloud.define("QueryAllUserData", function (request, response) {
 	 console.log("QueryAllUserData");
 	  testmodule.QueryAllUserData(function(res){
 	  	response.success(res);
 	  });
});
//check data all level ranking
Parse.Cloud.define("QueryAllLevelRanking", function (request, response) {
 	 console.log("QueryAllLevelRanking");
 	  testmodule.QueryAllLevelRanking(function(res){
 	  	response.success(res);
 	  });
});

//check all feedback level ranking
Parse.Cloud.define("QueryAllFeedback", function (request, response) {
 	 console.log("QueryAllFeedback");
 	  testmodule.QueryAllFeedback(function(res){
 	  	response.success(res);
 	  });
});

//check all feedback level ranking
Parse.Cloud.define("QueryAllSongRequest", function (request, response) {
 	 console.log("QueryAllSongRequest");
 	  testmodule.QueryAllSongRequest(function(res){
 	  	response.success(res);
 	  });
});
