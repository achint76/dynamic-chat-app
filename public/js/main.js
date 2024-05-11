(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);


// ------------------------------start multi dynamic chat app---------------

function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

var userData = JSON.parse(getCookie('user'));
console.log("Cookie data", userData);

const sender_id = userData._id;
let receiver_id;
var global_group_id;
const socket = io('/user-namespace', {
	auth: {
		token: userData._id
	}
});
$(document).ready(function () {
	$('.user-list').click(function () {

		const userId = $(this).attr('data-id');
		receiver_id = userId;
		$('.start-head').hide();
		$('.chat-section').show();

		//loading old chats
		socket.emit('existsChat', { sender_id: sender_id, receiver_id: receiver_id });
	})
});

//update user online status
socket.on('getOnlineUser', function (data) {
	console.log('Received getOnlineUser event:', data);
	$('#' + data.user_id + '-status').text('Online');
	$('#' + data.user_id + '-status').removeClass('offline-status');
	$('#' + data.user_id + '-status').addClass('online-status');

})

//update user offline status
socket.on('getOfflineUser', function (data) {
	console.log('Received getOfflineUser event:', data);
	$('#' + data.user_id + '-status').text('Offline');
	$('#' + data.user_id + '-status').removeClass('online-status');
	$('#' + data.user_id + '-status').addClass('offline-status');

});

//user chat save
$('#chat-form').submit(function (event) {
	event.preventDefault();

	const message = $('#message').val();
	console.log("senderid receriver id", sender_id, receiver_id, message);
	$.ajax({

		url: '/chat/save-chat',
		type: 'POST',
		data: { sender_id: sender_id, receiver_id: receiver_id, message: message },
		success: function (response) {
			console.log(response, "RESPONSE");
			if (response.success) {
				console.log(response.data.message, "RESPONSE");
				$('#message').val('')
				let chat = response.data.message;
				let html = `<div class="right-chat" id='`+response.data._id+`'>
			<h5><span>`+ chat + `</span>
				<i class="fa fa-trash" aria-hidden="true" data-id='`+response.data._id+`' data-toggle="modal" data-target="#deleteChatModal"></i>
				<i class="fa fa-edit" aria-hidden="true" data-id='`+response.data._id+`' data-msg='`+chat+`' data-toggle="modal" data-target="#editChatModal"></i>
				</h5>
		</div>
			`;
				$('#chat-container').append(html);
				socket.emit('newChat', response.data);
				//console.log(response.data, "NEWCHATRESDATA");
				scrollChat();
			} else {
				alert(response.msg);
			}
		}
	});


})
socket.on('loadNewChat', function (data) {
	console.log(data, ">>LOADNEWCHAT");
	console.log(sender_id, "SENERID");
	if (!data.is_deleted && sender_id === data.receiver_id && receiver_id === data.sender_id) {
		console.log("SUCCESS");
		let html = `<div class="left-chat" id='`+data._id+`'>
			<h5><span>`+ data.message + `</span></h5>
		</div>
			`;
		$('#chat-container').append(html);

		scrollChat();
	}
})

//loading old chats when switchinguser
socket.on('loadChats', function (data) {
	$('#chat-container').html('');

	const chats = data.chats;
	let html = '';
	for (let x = 0; x < chats.length; x++) {
		if(!chats[x].is_deleted){
		let addClass = '';
		if (chats[x]['sender_id'] == sender_id) {
			addClass = 'right-chat';
		} else {
			addClass = 'left-chat';
		}
		html += `
		<div class = '`+ addClass + `' id='`+chats[x]['_id']+`'>
			<h5><span>`+ chats[x]['message'] + `</span>`;

		if (chats[x]['sender_id'] == sender_id) {
			html += `<i class="fa fa-trash" aria-hidden="true" data-id='`+chats[x]['_id']+`' data-toggle="modal" data-target="#deleteChatModal"></i>
			<i class="fa fa-edit" aria-hidden="true" data-id='`+chats[x]['_id']+`' data-msg='`+chats[x]['message']+`' data-toggle="modal" data-target="#editChatModal"></i>`;
					
		}

		html += `
			</h5 >
			
			</div >
			`;
	}
}
	$('#chat-container').append(html);

	scrollChat();
})

function scrollChat() {

	// console.log("Offset top:", $('#chat-container').offset().top);
	// console.log("Scroll height:", $('#chat-container')[0].scrollHeight);
	$('#chat-container').animate({
		scrollTop:
			//$('#chat-container').offset().top +
			$('#chat-container')[0].scrollHeight
	}, 0);
}
//delete chat work
$(document).on('click', '.fa-trash', function(){
	let msg = $(this).parent().text();
	$('#delete-message').text(msg);
	$('#delete-message-id').val($(this).attr('data-id'));
})

$('#delete-chat-form').submit(function(event){
	event.preventDefault();  //so that form doesn't get refreshed

	var id = $('#delete-message-id').val();
	console.log(id,"DASHOARDID");
	$.ajax({
		url: '/chat/delete-chat/?_id=' + id,
		type: 'PUT',
	   // data: { id: id },
		success: function(res){
			if(res.success == true){
				$('#'+id).remove();
				$('#deleteChatModal').modal('hide');
				socket.emit('chatDeleted', id);
			}else{
				alert(res.msg);
			}
		}
	})
})

socket.on('chatMessageDeleted', function(id){
	$('#'+id).remove();
});

//update user chat functionality

$(document).on('click', '.fa-edit', function(){
	$('#edit-message-id').val( $(this).attr('data-id'));
	$('#edit-message').val( $(this).attr('data-msg'));
});

$('#edit-chat-form').submit(function(event){
	event.preventDefault();
	var id = $('#edit-message-id').val();
	var msg = $('#edit-message').val();
	$.ajax({
		url: '/chat/update-chat',
		type: 'PUT',
		data: { _id: id, message: msg },
		success: function(res){
			if(res.success === true){
				$('#editChatModal').modal('hide');
				$('#'+id).find('span').text(msg);
				$('#'+id).find('.fa-edit').attr('data-msg', msg);
				socket.emit('chatUpdated', { _id: id, message: msg });

			}
		}
	})
})

socket.on('chatMessageUpdated', function(data){
	$('#'+data._id).find('span').text(data.message);
})


//add member
$('.addMember').click(function(){
	var id = $(this).attr('data-id');
	var limit = $(this).attr('data-limit');

	$('#group_id').val(id);
	$('#limit').val(limit);

	console.log("Group ID:", id);

	$.ajax({
		url: '/user/get-members', 
		type: 'POST',
		data: { group_id: id},
		
		success: function(res){
			
			console.log(res,"RES");
			if(res.success == true){
				let users = res.data;
				let html = '';

				for(let i=0;i < users.length;i++){
					let isMemberOfGroup = users[i]['member'].length > 0 ? true:false;
					html +=`
					<tr>
						<td>
							<input type="checkbox" `+(isMemberOfGroup ? 'checked':'')+` name="members[]" value="`+users[i]['_id']+`"/>
						</td>
						<td>`+ users[i]['name']+ `</td>
					</tr>
					`;
				}
				$('.addMembersinTable').html(html);
			}
		}
	})
})



//add member form submit code 
$('#add-member-form').submit(function(event){
	event.preventDefault();

	var formdata = $(this).serialize();
	$.ajax({
		url: "/user/add-members",
		type: "POST",
		data: formdata,
		success: function(res){
			if(res.success){
				alert(res.msg);
				//console.log("MAINJS",$('#add-member-form')[0]);

				$('#memberModal').modal('hide');
				$('#add-member-form')[0].reset();
			}else{
				$('#add-member-error').text(res.msg);
				setTimeout( ()=> {
					$('#add-member-error').text('');
				},3000);
			}
		}
	})
})


//update member in group
$('.updateMember').click(function(){
	var obj = JSON.parse($(this).attr('data-obj'));
	console.log(obj,"OBJID");
	$('#update_group_id').val(obj._id);
	$('#last_limit').val(obj.limit);
	$('#group_name').val(obj.name);
	$('#group_limit').val(obj.limit);

})


$('#updateChatGroupForm').submit(function(event){
	event.preventDefault();

	$.ajax({
		url: "/user/update-chat-group",
		type: "POST",
		data: new FormData(this),
		contentType: false,
		cache: false,
		processData: false,
		success: function(res){
			alert(res.msg);
			if(res.success){
				location.reload();
			}
		}
	});
})


//delete chat group
$('.deleteGroup').click(function(){
	$('#delete_group_id').val($(this).attr('data-id'));
	$('#delete_group_name').text($(this).attr('data-name'));
});

$('#deleteChatGroupForm').submit(function(e){
	e.preventDefault();
	var formdata = $(this).serialize();

	$.ajax({
		url: "/user/delete-chat-group",
		type: "POST",
		data: formdata,
		success: function(res){
			alert(res.msg);
			if(res.success){
				location.reload();
			}
		}
	})
})


//copy sharable link
$('.copy').click(function(){
	$(this).prepend('<span class="copied_text">Copied</span>')
	var group_id = $(this).attr('data-id');
	var url = window.location.host+'/user/share-group/'+group_id;

	var temp = $('<input>');
	$('body').append(temp);
	temp.val(url).select();
	document.execCommand("copy");
	temp.remove();
	setTimeout(()=>{

		$('.copied_text').remove();
	}, 2000);
})


//join-group
$('.join-now').click(function(){
	$(this).text('Wait...');
	$(this).attr('disasbled','disabled');

	var group_id = $(this).attr('data-id');
	$.ajax({
		url: "/user/join-group",
		type: "POST",
		data: { group_id: group_id },
		success: function(res){
			alert(res.msg);
			if(res.success){
				location.reload();
			}else{
				
				$(this).text('Wait...');
				$(this).removeAttr('disasbled','disabled');

			}
		}
	})
})


// group chatting

function scrollGroupChat() {

	// console.log("Offset top:", $('#chat-container').offset().top);
	// console.log("Scroll height:", $('#chat-container')[0].scrollHeight);
	$('#group-chat-container').animate({
		scrollTop:
			//$('#chat-container').offset().top +
			$('#group-chat-container')[0].scrollHeight
	}, 0);
}


$('.group-list').click(function(){
	$('.group-start-head').hide();
	$('.group-chat-section').show();
	global_group_id = $(this).attr('data-id');

	loadGroupChats();
})


$('#group-chat-form').submit(function (event) {
	event.preventDefault();

	const message = $('#group-message').val();
	console.log(message,"MESSAGE");
	//console.log("senderid receriver id", sender_id, receiver_id, message);
	$.ajax({

		url: '/user/group-chat-save',
		type: 'POST',
		data: { sender_id: sender_id, group_id: global_group_id, message: message },
		success: function (response) {
			console.log(response, "RESPONSE");
			if (response.success) {
				//console.log(response.chat, "RESPONSE");
				
				$('#group-message').val('')
				let message = response.chat.message;
				let html = `<div class="right-chat" id='`+response.chat._id+`'>
			<h5><span>`+ message + `</span>
			<i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='`+response.chat._id+`' data-toggle="modal" data-target="#deleteGroupChatModal"></i>

			<i class="fa fa-edit editGroupChat" aria-hidden="true" 
			data-id='`+response.chat._id+`' data-msg='`+message+`' data-toggle="modal" data-target="#editGroupChatModal"></i>	
			</h5>`;


		var date = new Date(response.chat.createdAt);
		console.log(date);
		let cDate = date.getDate();
		console.log(cDate);
		let cMonth = (date.getMonth()+1) > 9 ? (date.getMonth()+1): '0'+(date.getMonth()+1); 
		let cYear = date.getFullYear();
		let getFullDate = cDate+'-'+cMonth+'-'+cYear;
		console.log(getFullDate);
		
			html += `
			<div class="user-data"><b>Me </b>`+getFullDate+`</div>
			</div>
			`;
		

			
				$('#group-chat-container').append(html);
				socket.emit('newGroupChat', response.chat);
				
				//console.log(response.data, "NEWCHATRESDATA");
				scrollGroupChat();
			} else {
				alert(response.msg);
			}
		}
	});


})


socket.on('loadNewGroupChat', function(data){
	if(global_group_id == data.group_id){
		let html = `<div class="left-chat" id='`+data._id+`'>
		<h5><span>`+ data.message + `</span>
			</h5>`;

			var date = new Date(data.createdAt);
			console.log(date);
			let cDate = date.getDate();
			console.log(cDate);
			let cMonth = (date.getMonth()+1) > 9 ? (date.getMonth()+1): '0'+(date.getMonth()+1); 
			let cYear = date.getFullYear();
			let getFullDate = cDate+'-'+cMonth+'-'+cYear;
			console.log(getFullDate);
			
				html += `
				<div class="user-data">
					<img src = "`+data.sender_id.image+`" class = "user-chat-image"/>
				<b>`+data.sender_id.name+`</b>`+getFullDate+`</div>
				</div>
				`;
			

			
		$('#group-chat-container').append(html);
		scrollGroupChat();
	}
})


function loadGroupChats(){
	$.ajax({
		url: "/user/load-group-chats",
		type: "POST",
		data: { group_id: global_group_id },
		success: function(res){
			if(res.success){
				var chats = res.chats;
				var html = '';
				console.log(res);
				for(let i=0;i < chats.length;i++){
					let className = 'left-chat';
					if(chats[i]['sender_id']._id == sender_id){
						className = 'right-chat';
					}
					html += `<div class='`+className+`' id='`+chats[i]['_id']+`'>
		<h5><span>`+ chats[i]['message'] + `</span>`;
		if(chats[i]['sender_id']._id == sender_id){
			html += `<i class="fa fa-trash deleteGroupChat" aria-hidden="true" 
			data-id='`+chats[i]['_id']+`' data-toggle="modal" data-target="#deleteGroupChatModal"></i>
			<i class="fa fa-edit editGroupChat" aria-hidden="true" 
			data-id='`+chats[i]['_id']+`' data-msg='`+chats[i]['message']+`' data-toggle="modal" data-target="#editGroupChatModal"></i>	`;

		}
		

		html += `
			</h5>`;

		var date = new Date(chats[i]['createdAt']);
		console.log(date);
		let cDate = date.getDate();
		console.log(cDate);
		let cMonth = (date.getMonth()+1) > 9 ? (date.getMonth()+1): '0'+(date.getMonth()+1); 
		let cYear = date.getFullYear();
		let getFullDate = cDate+'-'+cMonth+'-'+cYear;
		console.log(getFullDate);
		if(chats[i]['sender_id']._id == sender_id){
			html += `
			<div class="user-data"><b>Me </b>`+getFullDate+`</div>
			`;
		}else{
			html += `
			<div class="user-data">
				<img src = "`+chats[i]['sender_id'].image+`" class = "user-chat-image"/>
			<b>`+chats[i]['sender_id'].name+`</b>`+getFullDate+`</div>
			`;
		}

			html += `
	</div>
		`;
				}
				$('#group-chat-container').html(html);
				scrollGroupChat();
			}else{
				alert(res.msg);
			}
		}
	})
}

$(document).on('click', '.deleteGroupChat', function(){
	var msg = $(this).parent().find('span').text();

	$('#delete-group-message').text(msg);
	$('#delete-group-message-id').val($(this).attr('data-id'));
})

$('#delete-group-chat-form').submit(function(e){
	e.preventDefault();
	var id = $('#delete-group-message-id').val();

	$.ajax({
		url: "/user/delete-group-chat",
		type: "POST",
		data: { id: id },
		success: function(res){
			if(res.success){
				$('#'+id).remove();
				$('#deleteGroupChatModal').modal('hide');
				socket.emit('groupChatDeleted', id);
			}else{

			}
		}
	})
})

//lisetn delete chat id using socket
	socket.on('groupChatMessageDeleted', function(id){
		$('#'+id).remove();
	})


	//update group chat messages
	$(document).on('click', '.editGroupChat', function(){
		
	
		$('#edit-group-message-id').val($(this).attr('data-id'));
		$('#edit-group-message').val($(this).attr('data-msg'));
	})
	
	$('#edit-group-chat-form').submit(function(e){
		e.preventDefault();
		var id = $('#edit-group-message-id').val();
		var msg = $('#edit-group-message').val();
	
		$.ajax({
			url: "/user/edit-group-chat",
			type: "POST",
			data: { id: id, message: msg },
			success: function(res){
				if(res.success){
					
					$('#editGroupChatModal').modal('hide');
					$('#'+id).find('span').text(msg);
					$('#'+id).find('.editGroupChat').attr('data-msg', msg);
					socket.emit('groupChatUpdated', { id: id, message: msg });
				}else{
	
				}
			}
		})
	})


	socket.on('groupChatMessageUpdated', function(data){
		$('#'+data.id).find('span').text(data.message);
				
	})