


    var socket = io({query:'loggeduser='+document.getElementById("myself").value+"&"+"talking_to="+document.getElementById("send_to").value},{forceNew: false});
    


function m(){
    console.log("h")
   //socket.emit('login', {s_username: document.getElementById("myself").value})
    socket.emit("msg",{msg:document.getElementById("msgs").value,send_to:document.getElementById("send_to").value,send_by:document.getElementById("myself").value})
   

//     document.getElementById("conversation").innerHTML+=
//     '<div class="row message-body"><div class="col-sm-12 message-main-sender"><div class="sender"><div class="message-text">'+document.getElementById("msgs").value+
//     '</div><span class="message-time pull-right">Sun</span></div></div></div><br>'
//  ;
 document.getElementById("msgs").value="";
  
 }
  socket.on('msg_rcv', function(data) {
    // console.log(window.location.pathname.split("chat/")[1])
     if(data.s_by==window.location.pathname.split("chat/")[1]){
    document.getElementById("conversation").innerHTML+=
        '<div class="row message-body"><div class="col-sm-12 message-main-receiver"><div class="receiver"><div class="message-text">'+data.message+
        '</div><span class="message-time pull-right">Sun</span></div></div></div><br>'
     ;
     }
     
     var c=document.getElementById("conversation")
     c.scrollTop = c.scrollHeight;
console.log(data)
 })



 socket.on('msg_rcv_own', function(data) {
    // console.log(window.location.pathname.split("chat/")[1])

    
    document.getElementById("conversation").innerHTML+=
    '<div class="row message-body"><div class="col-sm-12 message-main-sender"><div class="sender"><div class="message-text">'+data.message+
    '</div><span class="message-time pull-right">Sun</span></div></div></div><br>'
 ;
     
 var c=document.getElementById("conversation")
 c.scrollTop = c.scrollHeight;
console.log(data)
 })