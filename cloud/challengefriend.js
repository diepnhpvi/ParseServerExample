// Design Table Name: ChallengeFriend

// Design In One Doccument
/*
	user_id: // private key from device id of user
	data:{
		//1
		[player_challenge]_[player_invite]:// key de reference la [id nguoi thach dau]_[id nguoi bi thach dau]
		{
			player_challenge: id,//facebook_id-> nguoi thach dau
			player_invite: id,// nguoi bi thach dau
			who_win:// who win
			status:0 // 0:Ready, 
					 // 1: Player 1 start Request
					 // 2: Player 1 send score
					 // 3: Finish game (after player 2 send score).
			time_update:// in UTC time milisecond
			ruby_challenge:1,// so ruby thach dau
			coin_reward:0,// coin bonus
			is_claim:0,// trang thai da nhan duoc ruby hay chua

		},
		//2
	}

*/
RESULT_CODE={
	OK: 						1,
	NEW_DATA_IN_OTHER_DEVICE: 	2,
	FAILED:						-101,
	ACCOUNT_NOT_EXISTS:			-102,
	QUERY_PARSE_ERROR:			-103
}; 
CHALLENGE_STATUS={
	FINISH_LOSE:-1,
	FINISH_WIN:-2,
	FINISH_DRAW:-3,
	CANCEL:-4,
	OPEN:0,
	PLAYER_1_REQUEST:1,
	PLAYER_1_SEND_SCORE:2,
	PLAYER_2_ACCEPT_CHALLENGE:3,
}
module.exports.QueryAllChallenge = function(request,callback){
	var result={
		result_code:RESULT_CODE.FAILED,
		//data:{},
		owner_challenge:{},
		friend_challenge:{},
		friend_info:{},
		extra:"query QueryAllChallenge failed"
	};
	//console.log("RequestChallenge");
	var user_id=request.params.user_id;
	var friend_ids=request.params.friend_ids;
	var data={};
	GetDataChallenge(user_id,function(res){
		//console.log("GetDataChallenge:"+JSON.stringify(res));
		if(res.result_code==RESULT_CODE.OK){
			data=res.data;
			// post processing data in here
	    	GetInfoAllFriend(friend_ids,function(resInfo){
	    		result.result_code=RESULT_CODE.OK;
	    		result.friend_info=resInfo;
	    		result.extra="query successful";
	    		PostProcessingChallengeData(user_id,data,function(resPost){
	    			data=resPost.data;
	    			//result.data=data;
	    			result.owner_challenge=resPost.owner_challenge;
	    			result.friend_challenge=resPost.friend_challenge;
					if(resPost.is_update){// co chinh sua du lieu, can luu lai
						SaveDataChallenge(user_id,res.key,data,function(resSave){
							console.log("QueryAllChallenge Can cap nhat du lieu query ");
							callback(result);
						});
					}
					else{// khong can cap nhat moi
						console.log("QueryAllChallenge Ko can cap nhat du lieu query");
						callback(result);
					}
					
	    		});
	    	});
		}
		else
		{
			callback(result);
		}
	});
};



module.exports.RequestChallenge = function(request,callback){
	var result={
		result_code:RESULT_CODE.FAILED,
		data:null,
		extra:"RequestChallenge failed"
	};

	var player_one_id=request.params.player_one_id;
	var player_two_id=request.params.player_two_id;
	var ruby=request.params.ruby;
	var song_id=request.params.song_id;
	var dataOneRes=null;
	var dataTwoRes=null;
	console.log("RequestChallenge 0");
	GetDataChallenge(player_one_id,function(res){
		console.log("RequestChallenge 1");
		if(res.result_code==RESULT_CODE.OK){
			dataOneRes=res;
			GetDataChallenge(player_two_id,function(res2){
				console.log("RequestChallenge 2");
				dataTwoRes=res2;
				var keyMapping=player_one_id+"_"+player_two_id;// nguoi thach dau la player one
				var infoChallenge=null;
				if(dataOneRes.data.hasOwnProperty(keyMapping))
				{
					infoChallenge=dataOneRes.data[keyMapping];
				}
				if(infoChallenge==null){
					infoChallenge=CreateDataAChallenge(player_one_id,player_two_id,song_id,ruby,new Date().getTime());
				}
				//if(infoChallenge.status==CHALLENGE_STATUS.OPEN)
				{
					infoChallenge.status=CHALLENGE_STATUS.PLAYER_1_REQUEST;
					infoChallenge.ruby=ruby;
					infoChallenge.player_one_score=0;
					infoChallenge.player_two_score=0;
					infoChallenge.song_id=song_id;
					infoChallenge.time_update=new Date().getTime();
					infoChallenge.unique_id=new Date().getTime();//create new uniqueId
					dataOneRes.data[keyMapping]=infoChallenge; // one
					dataTwoRes.data[keyMapping]=infoChallenge; // two
					console.log("RequestChallenge 2.1");
					SaveDataChallenge(player_one_id,dataOneRes.key,dataOneRes.data,function(resOne){
						console.log("RequestChallenge 3");
						SaveDataChallenge(player_two_id,dataTwoRes.key,dataTwoRes.data,function(resTwo){
							console.log("RequestChallenge 4");
							result.result_code=RESULT_CODE.OK;
							result.data=infoChallenge;
							result.extra="Request Challenge OK";
							callback(result);
						});
					});

				}
			});
		}
		else
		{
			callback(result);
		}
	});
};

module.exports.SendResultFromPlayerOne = function(request,callback){
	var result={
		result_code:RESULT_CODE.FAILED,
		data:null,
		extra:"SendResultFromPlayerOne failed"
	};

	var player_one_id=request.params.player_one_id;
	var player_two_id=request.params.player_two_id;
	var player_one_score=request.params.score;
	var dataOneRes=null;
	var dataTwoRes=null;
	GetDataChallenge(player_one_id,function(res){
		if(res.result_code==RESULT_CODE.OK){
			dataOneRes=res;
			GetDataChallenge(player_two_id,function(res2){
				dataTwoRes=res2;
				var keyMapping=player_one_id+"_"+player_two_id;// nguoi thach dau la player one
				var infoChallenge=null;
				if(dataOneRes.data.hasOwnProperty(keyMapping))
				{
					infoChallenge=dataOneRes.data[keyMapping];
				}
				//console.log(JSON.stringify(dataOneRes)+","+keyMapping);
				if(infoChallenge==null){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="No record found in data for update score first player";
					callback(result);
				}
				else if(infoChallenge.status!=CHALLENGE_STATUS.PLAYER_1_REQUEST){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="Not in stage update score from first challenge";
					callback(result);
				}
				else
				{
					infoChallenge.status=CHALLENGE_STATUS.PLAYER_1_SEND_SCORE;
					infoChallenge.player_one_score=player_one_score;
					infoChallenge.time_update=new Date().getTime();
					
					dataOneRes.data[keyMapping]=infoChallenge; // one
					dataTwoRes.data[keyMapping]=infoChallenge; // two
					SaveDataChallenge(player_one_id,dataOneRes.key,dataOneRes.data,function(resOne){
						SaveDataChallenge(player_two_id,dataTwoRes.key,dataTwoRes.data,function(resTwo){
							result.result_code=RESULT_CODE.OK;
							result.data=infoChallenge;
							result.extra="Update Score from first challenger successful";
							callback(result);
						});
					});

				}
			});
		}
		else
		{
			callback(result);
		}
	});
};


module.exports.AcceptChallengeFromPlayerTwo = function(request,callback){
	var result={
		result_code:RESULT_CODE.FAILED,
		data:null,
		extra:"AcceptChallengeFromPlayerTwo failed"
	};

	var player_two_id=request.params.player_two_id;
	var player_one_id=request.params.player_one_id;
	var dataOneRes=null;
	var dataTwoRes=null;
	GetDataChallenge(player_one_id,function(res){
		if(res.result_code==RESULT_CODE.OK){
			dataOneRes=res;
			GetDataChallenge(player_two_id,function(res2){
				dataTwoRes=res2;
				var keyMapping=player_one_id+"_"+player_two_id;// nguoi thach dau la player one
				var infoChallenge=null;
				if(dataTwoRes.data.hasOwnProperty(keyMapping))
				{
					infoChallenge=dataTwoRes.data[keyMapping];
				}
				if(infoChallenge==null){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="No record found in data for accept challgenge from second player";
					callback(result);
				}
				else if(infoChallenge.status!=CHALLENGE_STATUS.PLAYER_1_SEND_SCORE){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="Not in stage accept challgenge  from second challenge";
					callback(result);
				}
				else
				{
					
					infoChallenge.status=CHALLENGE_STATUS.PLAYER_2_ACCEPT_CHALLENGE;
					infoChallenge.player_two_score=0;
					infoChallenge.time_update=new Date().getTime();
					
					dataOneRes.data[keyMapping]=infoChallenge; // one
					dataTwoRes.data[keyMapping]=infoChallenge; // two
					SaveDataChallenge(player_one_id,dataOneRes.key,dataOneRes.data,function(resOne){
						SaveDataChallenge(player_two_id,dataTwoRes.key,dataTwoRes.data,function(resTwo){
							result.result_code=RESULT_CODE.OK;
							result.data=infoChallenge;
							result.extra="accept challgenge from second challenger successful";
							callback(result);
						});
					});
				}
			});
		}
		else
		{
			callback(result);
		}
	});
};

module.exports.SendResultFromPlayerTwo = function(request,callback){
	var result={
		result_code:RESULT_CODE.FAILED,
		data:null,
		extra:"SendResultFromPlayerTwo failed"
	};

	var player_two_id=request.params.player_two_id;
	var player_one_id=request.params.player_one_id;
	var player_two_score=request.params.score;
	var dataOneRes=null;
	var dataTwoRes=null;
	GetDataChallenge(player_one_id,function(res){
		if(res.result_code==RESULT_CODE.OK){
			dataOneRes=res;
			GetDataChallenge(player_two_id,function(res2){
				dataTwoRes=res2;
				var keyMapping=player_one_id+"_"+player_two_id;// nguoi thach dau la player one
				var infoChallenge=null;
				if(dataTwoRes.data.hasOwnProperty(keyMapping))
				{
					infoChallenge=dataTwoRes.data[keyMapping];
				}
				if(infoChallenge==null){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="No record found in data for update score second player";
					callback(result);
				}
				else if(infoChallenge.status!=CHALLENGE_STATUS.PLAYER_1_SEND_SCORE
					&&infoChallenge.status!=CHALLENGE_STATUS.PLAYER_2_ACCEPT_CHALLENGE){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="Not in stage update score from second challenge";
					callback(result);
				}
				else
				{
					
					infoChallenge.player_two_score=player_two_score;
					if(infoChallenge.player_two_score>infoChallenge.player_one_score){
						infoChallenge.status=CHALLENGE_STATUS.FINISH_LOSE;// nguoi thach dau thua
					}
					else if(infoChallenge.player_two_score<infoChallenge.player_one_score){
						infoChallenge.status=CHALLENGE_STATUS.FINISH_WIN;// nguoi thach dau thang
					}
					else
					{
						infoChallenge.status=CHALLENGE_STATUS.FINISH_DRAW;
					}
					infoChallenge.time_update=new Date().getTime();
					
					dataOneRes.data[keyMapping]=infoChallenge; // one
					dataTwoRes.data[keyMapping]=infoChallenge; // two
					SaveDataChallenge(player_one_id,dataOneRes.key,dataOneRes.data,function(resOne){
						SaveDataChallenge(player_two_id,dataTwoRes.key,dataTwoRes.data,function(resTwo){
							result.result_code=RESULT_CODE.OK;
							result.data=infoChallenge;
							result.extra="Update Score from second challenger successful";
							callback(result);
						});
					});
				}
			});
		}
		else
		{
			callback(result);
		}
	});
};

module.exports.CancelChallengeFromPlayerTwo = function(request,callback){
	var result={
		result_code:RESULT_CODE.FAILED,
		data:null,
		extra:"CancelChallengeFromPlayerTwo failed"
	};

	var player_two_id=request.params.player_two_id;
	var player_one_id=request.params.player_one_id;
	var dataOneRes=null;
	var dataTwoRes=null;
	GetDataChallenge(player_one_id,function(res){
		if(res.result_code==RESULT_CODE.OK){
			dataOneRes=res;
			GetDataChallenge(player_two_id,function(res2){
				dataTwoRes=res2;
				var keyMapping=player_one_id+"_"+player_two_id;// nguoi thach dau la player one
				var infoChallenge=null;
				if(dataOneRes.data.hasOwnProperty(keyMapping))
				{
					infoChallenge=dataOneRes.data[keyMapping];
				}
				if(infoChallenge==null){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="No record found in data for cancel score second player";
					callback(result);
				}
				else if(infoChallenge.status!=CHALLENGE_STATUS.PLAYER_1_REQUEST&&infoChallenge.status!=CHALLENGE_STATUS.PLAYER_1_SEND_SCORE){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="Not in stage update cancel from second challenge";
					callback(result);
				}
				else
				{
					
					infoChallenge.status=CHALLENGE_STATUS.CANCEL;
					infoChallenge.time_update=new Date().getTime();
					
					dataOneRes.data[keyMapping]=infoChallenge; // one
					dataTwoRes.data[keyMapping]=infoChallenge; // two
					SaveDataChallenge(player_one_id,dataOneRes.key,dataOneRes.data,function(resOne){
						SaveDataChallenge(player_two_id,dataTwoRes.key,dataTwoRes.data,function(resTwo){
							result.result_code=RESULT_CODE.OK;
							result.data=infoChallenge;
							result.extra="Cancel Challenge from second challenger successful";
							callback(result);
						});
					});
				}
			});
		}
		else
		{
			callback(result);
		}
	});
};

module.exports.PlayerOneClaim = function(request,callback){
	var result={
		result_code:RESULT_CODE.FAILED,
		data:null,
		extra:"PlayerOneClaim failed"
	};

	var player_one_id=request.params.player_one_id;
	var player_two_id=request.params.player_two_id;
	var dataOneRes=null;
	var dataTwoRes=null;
	GetDataChallenge(player_one_id,function(res){
		if(res.result_code==RESULT_CODE.OK){
			dataOneRes=res;
			GetDataChallenge(player_two_id,function(res2){
				dataTwoRes=res2;
				var keyMapping=player_one_id+"_"+player_two_id;// nguoi thach dau la player one
				var infoChallenge=null;
				if(dataOneRes.data.hasOwnProperty(keyMapping))
				{
					infoChallenge=dataOneRes.data[keyMapping];
				}
				if(infoChallenge==null){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="No record found in data for claim score first player";
					callback(result);
				}
				else if(infoChallenge.status!=CHALLENGE_STATUS.FINISH_WIN
						&&infoChallenge.status!=CHALLENGE_STATUS.FINISH_DRAW
						&&infoChallenge.status!=CHALLENGE_STATUS.CANCEL){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="Not in stage to claim score from first challenge";
					callback(result);
				}
				else if(infoChallenge.player_one_score<infoChallenge.player_two_score){
					result.result_code=RESULT_CODE.FAILED;
					result.extra="Player One lose, thus can not claimed";
					callback(result);
				}
				else
				{
					infoChallenge.status=CHALLENGE_STATUS.OPEN;
					infoChallenge.time_update=new Date().getTime();
					
					dataOneRes.data[keyMapping]=infoChallenge; // one
					dataTwoRes.data[keyMapping]=infoChallenge; // two
					SaveDataChallenge(player_one_id,dataOneRes.key,dataOneRes.data,function(resOne){
						SaveDataChallenge(player_two_id,dataTwoRes.key,dataTwoRes.data,function(resTwo){
							result.result_code=RESULT_CODE.OK;
							result.data=infoChallenge;
							result.extra="Claim from first challenger successful";
							callback(result);
						});
					});

				}
			});
		}
		else
		{
			callback(result);
		}
	});
};

//util function
CreateDataAChallenge=function(player_one_id,player_two_id,song_id,ruby,time_update){
	var infoChallenge={
		//keyMap:user_id+"_"+friend_id,
		unique_id:new Date().getTime(),
		player_one_id:player_one_id, // id player one
		player_two_id:player_two_id,
		player_one_score:0, // score player one
		player_two_score:0, // socre player two
		song_id:song_id,
		ruby:song_id,
		time_update:time_update,
		status:CHALLENGE_STATUS.OPEN,

	}
	return infoChallenge;
}
GetInfoAllFriend=function(friend_ids,callback){
	var UserData = Parse.Object.extend("UserData");
	var query = new Parse.Query(UserData);
	query.containedIn("facebook_id", friend_ids);
	query.select([
		"facebook_id",
		"facebook_name",
		"level",
		"ruby"
		]);
	var friends={};
	query.find({
	  success: function(objectFriendInfo) {
	  	for(var i=0;i<objectFriendInfo.length;i++)
		{
			var element=objectFriendInfo[i];
			var data={};
			data["facebook_id"]	=element.get("facebook_id");
			data["level"]		=element.get("level");
			data["ruby"]		=element.get("ruby");
			data["facebook_name"]=element.get("facebook_name");
			friends[data["facebook_id"]]=data;

		}
		callback(friends);
	  },
	  error: function(error) {
	  		console.log("GetInfoFriend Query  failed");
	  		callback(friends);
	  }
	});
}

SaveDataChallenge=function(user_id,key,data,callback){
	
	var saveData =null;
	if(key!=null){
		saveData=key;
	}
	else
	{
		var UserData = Parse.Object.extend("ChallengeFriend");
		saveData = new UserData();
	}
	saveData.set("user_id",user_id);
	saveData.set("data",data);
	saveData.save(null, {
	  success: function(saveData) {
	    // Execute any logic that should take place after the object is saved.
	    console.log('SaveDataChallenge: ' + user_id);
	    callback(true);
	  },
	  error: function(saveData, error) {
	    // Execute any logic that should take place if the save fails.
	    // error is a Parse.Error with an error code and message.
	    console.log('Failed to SaveDataChallenge, with error code: ' + error.message);
	    callback(false);
	  }
	});
};
GetDataChallenge=function(user_id,callback){
	var result={
		result_code:RESULT_CODE.FAILED,
		data:{},
		key:null
	};
	var ChallengeFriendTable = Parse.Object.extend("ChallengeFriend");
	var query = new Parse.Query(ChallengeFriendTable);
	query.equalTo("user_id",user_id);
	query.limit(1);
	query.select([
		"user_id",
		"point",
		"data"
		]);
	query.find({
	  	success: function(queryListChallenge) {
	  		//console.log("AAAA:"+JSON.stringify(queryListChallenge));
	  		var queryChallenge=null;
	  		// co du lieu
	    	if(queryListChallenge!=null&&queryListChallenge.length>0){
	    		queryChallenge=queryListChallenge[0];
	    	}
	    	result.result_code=RESULT_CODE.OK;
	    	if(queryChallenge!=null){
	    		result.key=queryChallenge;
				result.data=queryChallenge.get("data");
	    		if(result.data==null){
	    			result.data={};
	    		}
	    	}
	    	callback(result);
	   	},
	 	 error: function(error) {
	  		console.log("Loi save login activity roi");
	  		callback(result);
		}
	});
}


PostProcessingChallengeData=function(user_id,data,callback){
	result={
		data:data,
		owner_challenge:{},
		friend_challenge:{},
		is_update:false,
	};
	var now=new Date().getTime();
	for(var key in data) {
    	var infoChallenge = data[key];
    	if(infoChallenge!=null){
    		if(infoChallenge.status==CHALLENGE_STATUS.PLAYER_1_REQUEST||
    			infoChallenge.status==CHALLENGE_STATUS.PLAYER_1_SEND_SCORE)
    		{
    			var timeUpdate=infoChallenge.time_update;
    			var isOverDay=false;
    			var isOverTimeUpdateScore=false;
    			if(Math.abs(now-timeUpdate)>24*60*60*1000){// qua 24h ke tu luc cap nhat tu player one
    				isOverDay=true;
    			}
    			if(Math.abs(now-timeUpdate>5*60*1000)){// 5 phut
    				isOverTimeUpdateScore=true;
    			}
    			if(isOverDay==true){// player two khong co phan hoi-> chuyen sang cancel
    				result.is_update=true;
    				infoChallenge.status=CHALLENGE_STATUS.CANCEL;
    				data[key]=infoChallenge;
    			}
    			else if(isOverTimeUpdateScore==true){
    				if(infoChallenge.status==CHALLENGE_STATUS.PLAYER_1_REQUEST){
	    				// player one co 5 phut de cap nhat score, neu khong score se set mat dinh la 0(tranh truong hop cheat). 
	    				// sau do chuyen sang trang thai PLAYER_1_SEND_SCORE de Player 2 co the query
	    				result.is_update=true;
	    				infoChallenge.status=CHALLENGE_STATUS.PLAYER_1_SEND_SCORE;
	    				data[key]=infoChallenge;
    				}
    			}
    		}
    		else if(infoChallenge.status==CHALLENGE_STATUS.PLAYER_2_ACCEPT_CHALLENGE)
    		{
				var timeUpdate=infoChallenge.time_update;
    			var isOverDay=false;
    			if(Math.abs(now-timeUpdate>5*60*1000)){// 5 phut
    				isOverTimeUpdateScore=true;
    			}
    			if(infoChallenge.player_two_id==user_id)// nguoi query chinh la nguoi bi challenge -> bo cuoc or cheat nen moi ko update score-> cho thua luon
    			{
    				isOverTimeUpdateScore=true;
    			}
    			if(isOverTimeUpdateScore==true){// qua 5 phut player 2 khong gui ket qua len-> cho score player 2=0

					infoChallenge.player_two_score=0;
					if(infoChallenge.player_two_score>infoChallenge.player_one_score){
						infoChallenge.status=CHALLENGE_STATUS.FINISH_LOSE;// nguoi thach dau thua
					}
					else if(infoChallenge.player_two_score<infoChallenge.player_one_score){
						infoChallenge.status=CHALLENGE_STATUS.FINISH_WIN;// nguoi thach dau thang
					}
					else
					{
						infoChallenge.status=CHALLENGE_STATUS.FINISH_DRAW;
					}
					result.is_update=true;
					infoChallenge.time_update=new Date().getTime();
    			}
    		}
    		if(infoChallenge.status!=CHALLENGE_STATUS.OPEN){
    			if(infoChallenge.player_one_id==user_id)// challenge boi chinh user
    			{
    				result.owner_challenge[key]=infoChallenge;
    			}
    			else
    			{
    				if(infoChallenge.status!=CHALLENGE_STATUS.CANCEL&&
    					infoChallenge.status!=CHALLENGE_STATUS.PLAYER_1_REQUEST){
    					result.friend_challenge[key]=infoChallenge;
    				}
    			}
    		}
    	}
    	result.data=data;
	}
	callback(result);
}