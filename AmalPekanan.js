var scriptSet = PropertiesService.getScriptProperties();

//HUBUNGKAN DENGAN TELEGRAM DAN GOOGLE SHEET
var token = '5142560408:AAGvJZUfBb-3t1aafuqPQT_YdED7_TFrBok'; //Isi dengan Token Bot TELEGRAM
var sheetID = "13ecFpgfdGlJH5OJ7mXS6jEMZ6cin04kJXjjmz2kSqMo"; //Isi dengan sheetID Google Sheet
var sheetName = "Amal Pekanan"; //Isi dengan Nama Sheet
var webAppURL = "https://script.google.com/macros/s/AKfycbxjQWeeU8Pl9OTR35gEiYuEkG4DQDCWyPqsAMM8oY-6CB5B2c-M/exec"; //Isi dengan Web URL Google Script Setelah Deploy

//SETTING DATA APA SAJA YANG AKAN DI INPUT
var dataInput = /\/DATA1: (.*)\n\nDATA2: (.*)\n\nDATA3: (.*)\n\nDATA4: (.*)\n\nDATA5: (.*)\n\nDATA6: (.*)\n\nDATA7: (.*)\n\nDATA8: (.*)\n\nDATA9: (.*)\n\nDATA10: (.*)/gmi;
var validasiData = /:\s{0,1}(.+)/ig;

//PESAN JIKA FORMAT DATA YANG DIKIRIM SALAH
var errorMessage = "Maaf, Formatnya salah kak!";

function tulis(dataInput){
	var sheet = SpreadsheetApp.openById(sheetID).getSheetByName(sheetName);
	lRow = sheet.getLastRow();
	sheet.appendRow(dataInput);
	Logger.log(lRow);
}


function breakData(update){
	var ret = errorMessage;
	var msg = update.message;
	var str = msg.text;
	var match = str.match(valdasiData);


//SETTING FORMAT DATA YANG AKAN DIINPUT
	if (match.length == 10){
		for(var i=0; i < match.length; i++){
			match[i] = match[i].replace(':', '').trim();
		}
		ret = "DATA1" + match[0] + "\n\n";
		ret += "DATA2" + match[1] + "\n\n";
		ret += "DATA3" + match[2] + "\n\n";
		ret += "DATA4" + match[3] + "\n\n";
		ret += "DATA5" + match[4] + "\n\n";
		ret += "DATA6" + match[5] + "\n\n";
		ret += "DATA7" + match[6] + "\n\n";
		ret += "DATA8" + match[7] + "\n\n";
		ret += "DATA9" + match[8] + "\n\n";
		ret += "DATA10" + match[9] + "\n\n";
		ret = "Data (<b>" +match[0]+ "</b>) Berhasil Disimpan. Terimakasih!.";
		
		var simpan = match;
		
		var nama = msg.from.first_name;
		if (msg.from.last_name){
			nama += " " + msg.from.last_name;
		}
		
		simpan.unshift(nama);
		
		var waktu = jamConverter(msg.date);
		simpan.unshift(waktu);
		
		var tanggal = tanggalConverter(msg.date);
		simpan.unshift(tanggal);
		
		tulis(simpan);
	}
	return ret;
}


function tanggalConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp * 1000);
	var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var tanggal = date + '/' + month + '/' + year;
	return tanggal;
}

function jamConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp * 1000);
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var jam = hour + ':' + min + ':' + sec;
	return jam;
}

function escapeHtml(text){
	var map = {
		'&' : '&amp;',
		'<' : '&lt;',
		'>' : '&gt;',
		'"' : '&quot;',
		"'" : '&#039;',
	};
		
	return text.replace(/[&<>"']/g, function(m) {return map[m];});
	
}



function doGet(e){
	return HtmlService.createHtmlOutput("Hey there! Send POST request instead!");
}

function doPost(e){
	
	if(e.postData.type == "application/json"){
		
		var update = JSON.parse(e.postData.contens);
		var bot = new Bot(token, update);
		var bus = new CommandBus();
		bus.on(/\/start/i, function(){
			this.replyToSender("<b>Selamat Datang, Perkenalkan Saya BOTSALMAN </b>");
		});
		bus.on (/^[\/!]test/i, function(){
			this.replyToSender("<b>Aman kak!</b>");
		});
		bus.on (/^[\/!]format/i, function(){
			this.replyToSender("<b>/DATA1 : </b>\
								\n<b>DATA2 : </b>\
								\n<b>DATA3 : </b>\
								\n<b>DATA4 : </b>\
								\n<b>DATA5 : </b>\
								\n<b>DATA6 : </b>\
								\n<b>DATA7 : </b>\
								\n<b>DATA8 : </b>\
								\n<b>DATA9 : </b>\
								\n<b>DATA10 : </b>");
		});
		bus.on (/^[\/!]hallo/i, function(){
			this.replyToSender("<b>Hallo selamat datang kak!</b>");
		});
		
		bus.on(validasiData, function(){
			var rtext = breakData(update);
			this.replyToSender(rtext);
		});
		bot.register(bus);
		
		if (update){
			bot.process();
		}
	}
}

function setWebhook(){
	var bot = new Bot(token,{});
	var result = bot.request('setWebhook', {
		url: webAppURL
	});
	Logger.log(ScriptApp.getService().getUrl());
	Logger.log(result);
}

function Bot (token, update){
	this.token = token;
	this.update = update;
	this.handlers = [];
}

Bot.prototype.register = function(handler){
	this.handlers.push(handler);
}

Bot.prototype.process = function(){
	for(var i in this.handlers){
		var event = this.handlers[i];
		var result = event.condition(this);
		if(result){
			return event.handle(this);
		}
	}
}

Bot.prototype.request = function(method, data){
	var options = {
		'method' : 'post',
		'contentType' : 'application/json',
		'payload' : JSON.stringify(data)
	};
	
	var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + this.token + '/' + method, options);
	
	if (response.getResponseCode() == 200){
		return JSON.parse(response.getContentText());
	}
	
	return false;
}


Bot.prototype.replyToSender = function(text){
	return this.request('sendMessage', {
		'chat_id' : this.update.message.chat.id,
		'parse_mode' : 'HTML',
		'reply_to_message_id' : this.update.message.message_id,
		'text' : text
	});
}

function CommandBus(){
	this.commands = [];
}

CommandBus.prototype.on = function(regexp, callback){
	this.commands.push({'regexp' : regexp, 'callback' : callback});
}

CommandBus.prototype.condition = function(bot){
	return bot.update.message.text.charAt(0) === '/';
}

CommandBus.prototype.handle = function(bot){
	for(var i in this.commands){
		var cmd = this.commads[i];
		var tokens = cmd.regexp.exec(bot.update.message.text);
		if (tokens != null){
			return cmd.callback.apply(bot, tokens.splice(1));
		}
	}
	return bot.replyToSender(errorMessage);
}
