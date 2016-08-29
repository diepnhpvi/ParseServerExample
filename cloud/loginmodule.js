
module.exports.Login=function(request,callback){
	var UserData = Parse.Object.extend("UserData");
	var querybyDevice = new Parse.Query(UserData);
	querybyDevice.equalTo("device_id", request.params.user_data.device_id);
	var facebook_id=request.params.user_data.facebook_id;
	var querybyFacebook = new Parse.Query(UserData);
	if(facebook_id==null){
		facebook_id="####";// default
	}
	else if(facebook_id.length<3){
		facebook_id="####";
	}
	querybyFacebook.equalTo("facebook_id", facebook_id);
	
	var query=Parse.Query.or(querybyDevice, querybyFacebook);
	query.limit(6);
	//query param
	query.select([
		"index_update",
		"device_id",
		"push_id",
		"level",
		"facebook_id",
		"facebook_name",
		"email",
		"exp_next_level",
		"last_login",
		"ruby",
		"coin",
		"device_model",
		"device_name",
		"device_os",
		"rubies_achive",
		"dic_easy",
		"dic_normal",
		"dic_hard",
		"song_buy",
		"quest",
		"achivement",
		"inbox",
		"sync_local_data"]);
	query.find({
	  success: function(objectLoginList) {
	  		var objectLogin=null;
	    	if(objectLoginList!=null&&objectLoginList.length>0){
	    		objectLogin=objectLoginList[0];// by default
	    		for(var i=0;i<objectLoginList.length;i++)
	    		{
	    			if(facebook_id==objectLoginList[i].get("facebook_id"))// uu tien lay theo facebook id neu choi tren nhieu may
	    			{
	    				try
	    				{
	    					if(objectLogin.get("facebook_id")!=objectLoginList[i].get("facebook_id")){
	    						objectLogin=objectLoginList[i];
		    				}
		    				else if(objectLogin.get("level")<objectLoginList[i].get("level"))
		    				{
		    					objectLogin=objectLoginList[i];
		    				}
		    			}
		    			catch(error){
		    				objectLogin=objectLoginList[i];
		    			}
	    			}
	    		}
	    	}
	    	if(objectLogin==null)// chua co tai khoan tren server
	    	{
	    		console.log("khong lay duoc du lieu nao ca-> tao moi");
	    		LoginModule_CreateNewAccount(request,function(resCreate){
	    			console.log("CreateNewAccount:"+JSON.stringify(resCreate));
	    			if(resCreate.result>0)// success
	    			{
	    				callback({result:resCreate.result, data:resCreate.data,quest:resCreate.quest,achivement:resCreate.achivement,inbox:resCreate.inbox,is_new:true});
	    			}
	    			else
	    			{
	    				callback({result:resCreate.result, data:null,quest:null,achivement:null,inbox:null,is_new:true});
	    			}

	    		});
	    	}
	    	else
	    	{
	    		//console.log("Da co du lieu cu-> cap nhat du lieu:"+JSON.stringify(objectLogin));
	    		LoginModule_UpdateUserData(request,objectLogin,true,function(resUpdate){
	    			//console.log("Update Data Account:"+JSON.stringify(resUpdate));
	    			if(resUpdate.result>0)// success
	    			{
	    				callback({result:resUpdate.result, data:resUpdate.data,quest:resUpdate.quest,achivement:resUpdate.achivement,inbox:resUpdate.inbox,is_new:false});
	    			}
	    			else
	    			{
	    				callback({result:resUpdate.result, data:null,quest:null,achivement:null,inbox:null,is_new:false});
	    			}

	    		});
	    	}
	  },
	  error: function(error) {
	  		console.log("Login User Data Query Find failed");
	  		callback({result:-103, data:null,quest:null,achivement:null,is_new:false});
	  }
	});
};

module.exports.UpdateUserData=function(request,callback){
	var UserData = Parse.Object.extend("UserData");
	var querybyDevice = new Parse.Query(UserData);
	querybyDevice.equalTo("device_id", request.params.user_data.device_id);
	var facebook_id=request.params.user_data.facebook_id;
	var querybyFacebook = new Parse.Query(UserData);
	if(facebook_id==null){
		facebook_id="####";// default
	}
	else if(facebook_id.length<3){
		facebook_id="####";
	}
	querybyFacebook.equalTo("facebook_id", facebook_id);
	
	var query=Parse.Query.or(querybyDevice, querybyFacebook);

	query.limit(1);
	//query param
	query.select([
		"index_update",
		"device_id",
		"push_id",
		"level",
		"facebook_id",
		"facebook_name",
		"email",
		"exp_next_level",
		"last_login",
		"ruby",
		"coin",
		"device_model",
		"device_name",
		"device_os",
		"rubies_achive",
		"dic_easy",
		"dic_normal",
		"dic_hard",
		"song_buy",
		"quest",
		"achivement",
		"inbox",
		"sync_local_data"]);
	query.find({
	  success: function(objectUpdateData) {
	  		var objectUpdate=null;
	    	if(objectUpdateData!=null&&objectUpdateData.length>0){
	    		objectUpdate=objectUpdateData[0];
	    	}
	    	if(objectUpdate==null)// chua co tai khoan tren server -> ket thuc xu ly
	    	{
	    		callback({result:false, data:null,quest:null,achivement:null, is_new:false});
	    	}
	    	else
	    	{
	    		console.log("Da co du lieu cu-> cap nhat du lieu:"+JSON.stringify(objectUpdate));
	    		LoginModule_UpdateUserData(request,objectUpdate,false,function(resUpdate){
	    			//console.log("Update Data Account:"+JSON.stringify(resUpdate));
	    			if(resUpdate>0)// success
	    			{
	    				callback({result:resUpdate.result, data:resUpdate.data,quest:resUpdate.quest,achivement:resUpdate.achivement,inbox:resUpdate.inbox,is_new:false});
	    			}
	    			else
	    			{
	    				callback({result:resUpdate.result, data:resUpdate.data,quest:resUpdate.quest,achivement:resUpdate.achivement,inbox:resUpdate.inbox,is_new:false});
	    			}

	    		});
	    	}
	  },
	  error: function(error) {
	  		console.log("Update User Data Query Find Failed");
	  		callback({result:-103, data:null,quest:null,achivement:null,is_new:false});
	  }
	});
};

module.exports.Test=function(){

}

///
/// Update User Data
///
LoginModule_UpdateUserData=function(request,objectLogin,increaseIndex,callbackUpdate){	
	var saveData = objectLogin;//new UserData();
	var data={};
	var quest="";
	var achivement="";
	var inbox="";
	// default level
	data.device_id=request.params.user_data.device_id;

	if(objectLogin.get("push_id")!=null)
	{	
		data.push_id=	objectLogin.get("push_id");
	}
	else
	{
		data.push_id="";
	}

	data.level=			objectLogin.get("level");
	data.facebook_id=	objectLogin.get("facebook_id");
	if(data.facebook_id.length>2){
		data.device_id=data.facebook_id;// cap nhat lai device_id theo facebook id
	}
	data.facebook_name=	objectLogin.get("facebook_name");
	data.birth_day=		objectLogin.get("birth_day");
	data.email=			objectLogin.get("email");
	data.exp_next_level=objectLogin.get("exp_next_level");
	data.ruby=			objectLogin.get("ruby");
	data.coin=			objectLogin.get("coin");
	data.device_model=	objectLogin.get("device_model");
	data.device_name=	objectLogin.get("device_name");
	data.device_os=		objectLogin.get("device_os");
	data.rubies_achive=	objectLogin.get("rubies_achive");
	data.last_login=new Date().getTime();
	data.dic_easy=		objectLogin.get("dic_easy");
	data.dic_normal=	objectLogin.get("dic_normal");
	data.dic_hard=		objectLogin.get("dic_hard");
	data.song_buy=	objectLogin.get("song_buy");
	data.sync_local_data=objectLogin.get("sync_local_data");
	//quest
	quest=objectLogin.get('quest');
	//inbox
	inbox=objectLogin.get('inbox');
	//achivement
	achivement=objectLogin.get('achivement');

	data.index_update=0;
	if(objectLogin.get("index_update")!=null){
	    data.index_update=objectLogin.get("index_update");
	}
	
	requestIndex_update=0;
	if(request.params.user_data.hasOwnProperty("index_update"))
	{
		requestIndex_update=request.params.user_data.index_update;
	}

	var res=2;
	if(requestIndex_update>=data.index_update)
	{
		res=1;
		console.log("Client have new:"+data.index_update);
		if(request.params.user_data.hasOwnProperty("level"))
		{
			data.level=request.params.user_data.level;
		}
		if(request.params.user_data.hasOwnProperty("push_id"))
		{
			data.push_id=request.params.user_data.push_id;
		}
		if(request.params.user_data.hasOwnProperty("facebook_id"))
		{
			data.facebook_id=request.params.user_data.facebook_id;
		}
		if(request.params.user_data.hasOwnProperty("facebook_name"))
		{		
			data.facebook_name=request.params.user_data.facebook_name;
		}
		if(request.params.user_data.hasOwnProperty("birth_day"))
		{
			data.birth_day=request.params.user_data.birth_day;
		}
		if(request.params.user_data.hasOwnProperty("email"))
		{
			data.email=request.params.user_data.email;
		}
		if(request.params.user_data.hasOwnProperty("exp_next_level"))
		{
			data.exp_next_level=request.params.user_data.exp_next_level;
		}
		if(request.params.user_data.hasOwnProperty("ruby"))
		{
			data.ruby=request.params.user_data.ruby;
		}
		if(request.params.user_data.hasOwnProperty("coin"))
		{
			data.coin=request.params.user_data.coin;
		}
		if(request.params.user_data.hasOwnProperty("device_model"))
		{
			data.device_model=request.params.user_data.device_model;
		}
		if(request.params.user_data.hasOwnProperty("device_name"))
		{
			data.device_name=request.params.user_data.device_name;
		}
		if(request.params.user_data.hasOwnProperty("device_os"))
		{
			data.device_os=request.params.user_data.device_os;
		}
		if(request.params.user_data.hasOwnProperty("rubies_achive"))
		{
			data.rubies_achive=request.params.user_data.rubies_achive;
		}
		if(request.params.user_data.hasOwnProperty("dic_easy"))
		{
			data.dic_easy=request.params.user_data.dic_easy;
		}
		if(request.params.user_data.hasOwnProperty("dic_normal"))
		{
			data.dic_normal=request.params.user_data.dic_normal;
		}
		if(request.params.user_data.hasOwnProperty("dic_hard"))
		{
			data.dic_hard=request.params.user_data.dic_hard;
		}
		if(request.params.user_data.hasOwnProperty("song_buy"))
		{
			data.song_buy=request.params.user_data.song_buy;
		}
		if(request.params.hasOwnProperty("quest"))
		{
			quest=request.params.quest;
		}
		if(request.params.hasOwnProperty("inbox"))
		{
			inbox=request.params.inbox;
		}
		if(request.params.hasOwnProperty("achivement"))
		{
			achivement=request.params.achivement;
		}
		if(request.params.user_data.hasOwnProperty("sync_local_data"))
		{
			data.sync_local_data=request.params.user_data.sync_local_data;
		}
		if(data.facebook_id.length>2)// account da dang nhap facebook
		{
			if(increaseIndex==true)
			{
				data.index_update=requestIndex_update+1;
			}
		}
		
	}
	saveData.set("device_id",data.device_id);
	saveData.set("index_update",data.index_update);
	saveData.set("push_id",data.push_id);
	saveData.set("level",data.level);
	saveData.set("facebook_id",data.facebook_id);
	saveData.set("facebook_name",data.facebook_name);
	saveData.set("email",data.email);
	saveData.set("exp_next_level",data.exp_next_level);
	saveData.set("ruby",data.ruby);
	saveData.set("coin",data.coin);
	saveData.set("device_model",data.device_model);
	saveData.set("device_name",data.device_name);
	saveData.set("device_os",data.device_os);
	saveData.set("last_login",data.last_login);
	saveData.set("rubies_achive",data.rubies_achive);
	saveData.set("dic_easy",data.dic_easy);
	saveData.set("dic_normal",data.dic_normal);
	saveData.set("dic_hard",data.dic_hard);
	saveData.set("song_buy",data.song_buy);
	saveData.set("quest",quest);
	saveData.set("achivement",achivement);
	saveData.set("inbox",inbox);
	saveData.set("sync_local_data",data.sync_local_data);

	
	saveData.save(null, {
	  success: function(saveData2) {
	    // Execute any logic that should take place after the object is saved.
	    console.log('Update User created with device_id: ' + request.params.user_data.device_id);
	    callbackUpdate({result:res,data:data,quest:quest,achivement:achivement,inbox:inbox});
	  },
	  error: function(saveData2, error) {
	    // Execute any logic that should take place if the save fails.
	    // error is a Parse.Error with an error code and message.
	    console.log('Failed to Update data User, with error code: ' + error.message);
	    callbackUpdate({result:-101,data:null,quest:null,achivement:null,inbox:null});
	  }
	});
	
};

///
/// Create New Account
///
LoginModule_CreateNewAccount=function(request, callbackCreate){	
	
	var UserData = Parse.Object.extend("UserData");
	var saveData = new UserData();

	var data={};
	var quest="";
	var achivement="";
	var inbox="";

	data.device_id=request.params.user_data.device_id;
	// default level
	if(!request.params.user_data.hasOwnProperty("level"))
	{
		data.level=1;
	}
	else
	{
		data.level=request.params.user_data.level;
	}
	if(!request.params.user_data.hasOwnProperty("index_update"))
	{
		data.index_update=0;
	}
	else
	{
		data.index_update=request.params.user_data.index_update;
	}
	if(!request.params.user_data.hasOwnProperty("push_id"))
	{
		data.push_id="";
	}
	else
	{
		data.push_id=request.params.user_data.push_id;
	}
	// default facebook id
	if(!request.params.user_data.hasOwnProperty("facebook_id"))
	{
		data.facebook_id="";
	}
	else
	{
		data.facebook_id=request.params.user_data.facebook_id;
		if(data.facebook_id.length>2)
		{
			data.device_id=data.facebook_id;// cap nhat lai device_id theo facebook id
		}
	}

	// default facebook_name 
	if(!request.params.user_data.hasOwnProperty("facebook_name"))
	{
		data.facebook_name="";;
	}
	else
	{
		data.facebook_name=request.params.user_data.facebook_name;
	}

	// default birth_day 
	if(!request.params.user_data.hasOwnProperty("birth_day"))
	{
		data.birth_day="";
	}
	else
	{
		data.birth_day=request.params.user_data.birth_day;
	}

	// default email 
	if(!request.params.user_data.hasOwnProperty("email"))
	{
		data.email="";
	}
	else
	{
		data.email=request.params.user_data.email;
	}

	// default exp_next_level 
	if(!request.params.user_data.hasOwnProperty("exp_next_level"))
	{
		data.exp_next_level=0;
	}
	else
	{
		data.exp_next_level=request.params.user_data.exp_next_level;
	}
	// default ruby
	if(!request.params.user_data.hasOwnProperty("ruby"))
	{
		data.ruby=0;
	}
	else
	{
		data.ruby=request.params.user_data.ruby;
	}
	//coin
	if(!request.params.user_data.hasOwnProperty("coin"))
	{
		data.coin=0;
	}
	else
	{
		data.coin=request.params.user_data.coin;
	}
	//device model
	if(!request.params.user_data.hasOwnProperty("device_model"))
	{
		data.device_model="None";
	}
	else
	{
		data.device_model=request.params.user_data.device_model;
	}
	// device name manufactory
	if(!request.params.user_data.hasOwnProperty("device_name"))
	{
		data.device_name="None";
	}
	else
	{
		data.device_name=request.params.user_data.device_name;
	}
	// device os system
	if(!request.params.user_data.hasOwnProperty("device_os"))
	{
		data.device_os="None";
	}
	else
	{
		data.device_os=request.params.user_data.device_os;
	}

	// default last_login 
	data.last_login=new Date().getTime();
	

	// default rubies_achive 
	if(!request.params.user_data.hasOwnProperty("rubies_achive"))
	{
		data.rubies_achive=0;
	}
	else
	{
		data.rubies_achive=request.params.user_data.rubies_achive;
	}

	// default dic_easy 
	if(!request.params.user_data.hasOwnProperty("dic_easy"))
	{
		data.dic_easy=[];
	}
	else
	{
		data.dic_easy=request.params.user_data.dic_easy;
	}

	// default dic_normal 
	if(!request.params.user_data.hasOwnProperty("dic_normal"))
	{
		data.dic_normal=[];
	}
	else
	{
		data.dic_normal=request.params.user_data.dic_normal;
	}

	// default dic_hard 
	if(!request.params.user_data.hasOwnProperty("dic_hard"))
	{
		data.dic_hard=[];
	}
	else
	{
		data.dic_hard=request.params.user_data.dic_hard;
	}

	// default song_buy 
	if(!request.params.user_data.hasOwnProperty("song_buy"))
	{
		data.song_buy={};
	}
	else
	{
		data.song_buy=request.params.user_data.song_buy;
	}
	if(request.params.hasOwnProperty("quest"))
	{
		quest=request.params.quest;
	}
	if(request.params.hasOwnProperty("inbox"))
	{
		inbox=request.params.inbox;
	}
	if(request.params.hasOwnProperty("achivement"))
	{
		achivement=request.params.achivement;
	}
	if(!request.params.user_data.hasOwnProperty("sync_local_data"))
	{
		data.sync_local_data={};
	}
	else
	{
		data.sync_local_data=request.params.user_data.sync_local_data;
	}
	

	saveData.set("index_update",data.index_update);
	saveData.set("device_id",data.device_id); //device id
	saveData.set("level",data.level);
	saveData.set("push_id",data.push_id);
	saveData.set("facebook_id",data.facebook_id);
	saveData.set("facebook_name",data.facebook_name);
	saveData.set("email",data.email);
	saveData.set("exp_next_level",data.exp_next_level);
	saveData.set("ruby",data.ruby);
	saveData.set("coin",data.coin);
	saveData.set("device_model",data.device_model);
	saveData.set("device_name",data.device_name);
	saveData.set("device_os",data.device_os);
	saveData.set("last_login",data.last_login);
	saveData.set("rubies_achive",data.rubies_achive);
	saveData.set("dic_easy",data.dic_easy);
	saveData.set("dic_normal",data.dic_normal);
	saveData.set("dic_hard",data.dic_hard);
	saveData.set("song_buy",data.song_buy);
	saveData.set("quest",quest);
	saveData.set("achivement",achivement);
	saveData.set("inbox",inbox);
	saveData.set("sync_local_data",data.sync_local_data);
	
	saveData.save(null, {
	  success: function(saveData) {
	    // Execute any logic that should take place after the object is saved.
	    console.log('New User created with device_id: ' + request.params.user_data.device_id);
	    callbackCreate({result:1,data:data,quest:quest,achivement:achivement,inbox:inbox});
	  },
	  error: function(saveData, error) {
	    // Execute any logic that should take place if the save fails.
	    // error is a Parse.Error with an error code and message.
	    console.log('Failed to create new User, with error code: ' + error.message);
	    callbackCreate({result:-101,data:null,quest:null,achivement:null,inbox:null});
	  }
	});
};
