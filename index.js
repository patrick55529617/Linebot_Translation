/*

var linebot = require('linebot');
var express = require('express');
var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");

var bot = linebot({
  channelId: '1524608117',
  channelSecret: '3258716e953de8582ffcccab6a26c282',
  channelAccessToken: 'H8sca/5iYvia+e74yG4ESpsfxMZJa/1D/PzMOEzJ6UD0FeSW3M/7GtR3DGb+rmqC0JP8fh5fd/RRS1zquNeGQBegLPm9MV8R3FB4aKSYr1A4SDjnOgyrmTE3fu96Nxu4Rss5+S2tx3Lxq54zAyxqzQdB04t89/1O/w1cDnyilFU='
});



bot.on('message', function(event) {
  if (event.message.type = 'text') {
    var msg = event.message.text;
    
    event.reply(ReplyMessage(msg)).then(function(data) {
      //console.log(ReplyMessage(msg));
    }).catch(function(error) {
     console.log('錯誤產生，錯誤碼：'+error);
    });  
  }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('目前的port是', port);
});

function ReplyMessage (myMSg)
{
  var str_Output = '';

  if(myMSg =='臥吼吼') {
    str_Output = '腦公好帥';
  }else if(myMSg.toUpperCase()=='TAIPEI'){
    request({url: "http://www.cwb.gov.tw/V7/forecast/taiwan/Taipei_City.htm",method: "GET"}, 
    function(e,r,b) {
      if(e || !b) { return; }
      var $ = cheerio.load(b);
      var temperature = $(".FcstBoxTable01 tbody tr td");
      str_Output = '台北現在的溫度大約為: '+$(temperature[0]).text()+' 度';
      //console.log(str_Output);
      return str_Output;
    });
  }else if(myMSg.substring(0,3).toUpperCase()=='DIC'){
    var word = myMSg.substr(4,myMSg.length-4);

    request({url: "https://tw.dictionary.yahoo.com/dictionary?p="+word.toLowerCase(),method: "GET"}, 
    function(e,r,b) {
      if(e || !b) { return; }
      var $ = cheerio.load(b);
      var translation = $("li.ov-a h4");

      var counter = 5; //控制輸出最多5組
      str_Output = word+' 的翻譯為：\n';
      for(var i=0;i<translation.length;i++) {
        str_Output += $(translation[i]).text();
        counter --;
        if(counter > 0) str_Output += '\n';
        else break;
      }
    });

  }else if(myMSg.toUpperCase() == 'KKTV'){
    str_Output = 'KKTV-免費轉轉台 現正播放：\n\n';
    request({
      url: "https://www.kktv.me/channels",
      method: "GET"
    }, function(e,r,b) {
      if(e || !b) { return; }
      var $ = cheerio.load(b);
      var titles = $("div.main-title");
      var content = $("div.text.title");
      var episode = $("span.text.episode");
      
      for(var i=0;i<titles.length;i++) {
        str_Output += $(titles[i]).text();
        str_Output += '：';
        str_Output += $(content[i]).text();
        str_Output +=' ';
        str_Output += $(episode[i]).text();
        if(i!=titles.length-1) str_Output +='\n';
      }
    });
  }else if(myMSg ==='?'){
    str_Output = myLineTemplate;
  }
  else 
    str_Output = '胡斐評也太帥了吧YEE';
  return str_Output;
}


var myLineTemplate={
  type: 'template',
  altText: 'this is a confirm template',
  template: {
      type: 'buttons',
      text: '按下選單可以控制物聯網裝置！\n輸入?可以再看到這個選單！',
      actions: [{
          type: 'postback',
          label: 'LED開',
          data: 'LED開'
      }, {
          type: 'postback',
          label: 'LED關',
          data: 'LED關'
      },{
          type: 'postback',
          label: '電燈開',
          data: '電燈開'
      },{
          type: 'postback',
          label: '電燈關',
          data: '電燈關'
      }]
  }
};

*/

var linebot = require('linebot');
var express = require('express');
var translate = require('google-translate-api');

var bot = linebot({
  channelId: '1524608117',
  channelSecret: '3258716e953de8582ffcccab6a26c282',
  channelAccessToken: 'H8sca/5iYvia+e74yG4ESpsfxMZJa/1D/PzMOEzJ6UD0FeSW3M/7GtR3DGb+rmqC0JP8fh5fd/RRS1zquNeGQBegLPm9MV8R3FB4aKSYr1A4SDjnOgyrmTE3fu96Nxu4Rss5+S2tx3Lxq54zAyxqzQdB04t89/1O/w1cDnyilFU='

});

var users=[];
//預設翻譯語言是英文
var defaultLangNum=2;

//以下各國語言陣列，可自行加減，語言代碼參照，請參考以下連結
//https://cloud.google.com/translate/docs/languages
var languages=[
    {language: '繁體中文', code: 'zh-tw'},
    {language: '簡體中文', code: 'zh-cn'},
    {language: '英文', code: 'en'},
    {language: '日文', code: 'ja'},
    {language: '韓文', code: 'ko'},
    {language: '泰文', code: 'th'},
    {language: '越南文', code: 'vi'},
    {language: '印尼文', code: 'id'},
    {language: '德文', code: 'de'},
    {language: '法文', code: 'fr'},
    {language: '俄文', code: 'ru'}
];

//取得第一次交談時的歡迎詞
var welcomeStr=getWelcomeStr();

bot.on('message', function(event) {
   var myReply='';
   var myId=event.source.userId;
   if (event.message.type === 'text') {
      var msg = event.message.text;
      if(msg=='臥吼吼'){
        event.reply('腦公好帥').then(function(data) {
          //console.log(ReplyMessage(msg));
        }).catch(function(error) {
         console.log('錯誤產生，錯誤碼：'+error);
        });
      }
      if (users[myId]===undefined){
         users[myId]=[];
         users[myId].userId=myId;
         users[myId].defaultLangNum=defaultLangNum;
         myReply=welcomeStr+'目前的設定的翻譯語言為：'+languages[users[myId].defaultLangNum].language;
      }else if(event.message.text==='?'){
         myReply=welcomeStr+'目前的設定的翻譯語言為：'+languages[users[myId].defaultLangNum].language;
      }else if(!isNaN(event.message.text)){
         if (Number(event.message.text)<languages.length)
            setLanguage(myId,Number(event.message.text));
      }else{
         translate(event.message.text, {to: languages[users[myId].defaultLangNum].code}).then(res => {
         bot.push(myId,res.text);
         }).catch(err => {
            console.error(err);
         });
      }
      event.reply(myReply).then(function(data) {
         // success 
         console.log(myReply);
      }).catch(function(error){   
         // error 
         console.log('error');
      });
   }
});


//傳送訊息的函式
function sendMessage(eve,msg){
   eve.reply(msg).then(function(data) {
      // success 
      return true;
   }).catch(function(error) {
      // error 
      return false;
   });
}

//此為設定翻譯語言之函式
function setLanguage(userId,myLangNum){
   users[userId].defaultLangNum=myLangNum;
   bot.push(userId,'翻譯的語言已設定為：'+languages[myLangNum].language);
}

//此為處理語言設定字串之函式
function getWelcomeStr(){
   var myResult='您好，歡迎來到阿評的即時翻譯LineBot，讓您用Line就可以翻譯各國語言。您可以輸入各國語言，轉換成您想要翻譯的語言，所以，請先設定您想要轉換成的語言，輸入數字即可設定完成：\n';
   for(var i=0;i<languages.length;i++){
      myResult+=(i+'：'+languages[i].language+'\n');
   }
   myResult+='?：列出語言設定指令\n';
   return myResult;
}

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});