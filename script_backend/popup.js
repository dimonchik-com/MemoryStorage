var config = {
    apiKey: "AIzaSyCMRbZuQQmVc610R3GGb3pGqF81VAyIL7E",
    databaseURL: "https://englishtip-516bc.firebaseio.com",
    storageBucket: "englishtip-516bc.appspot.com"
};
firebase.initializeApp(config);

$( document ).ready(function() {

    $("#form_login").hide();
    $(".p5").show();
    $(".p0").css({"min-width":"800px","height":"600px"});
    $(".p8 a:first").click();

	// Log out
	$("body").on("click",".p5 .p6", function () {
		chrome.storage.local.remove('pickup_session', function (result) {
			$("#form_login").show();
			$(".p5,.p9").hide();
			$(".p0").css({"min-width":"200px","height":"auto"});
		});
	});

	// add new task
	$("body").on("click",".p10", function () {
		$(".p12 input[name=id]").remove();
		$(".p12 input[name=name_task]").val("");
		$(".p13").text("Create task");
		$(".all_task .build_task_table").bootstrapTable('destroy');
		$(".p11").show();
	});

	// create new task
	$("body").on("click",".p13", function () {
		get_storage(function (result) {
			$("input[name='pickup_session']").remove();
			$(".p12").append("<input type='hidden' name='pickup_session' value='"+result.pickup_session+"'>");
			$.ajax({
				method: "POST",
				url: "http://localhost/pickup/create_new_task",
				data: $(".p12").serialize()
			}).done(function(respons) {
				$(".p14").click();
			});
		});
		return false;
	});

	// remove task
	$("body").on("click",".p15", function () {
		var id=$(this).parent().attr("data-id");
		bootbox.confirm("Are you sure you want to delete the task?", function(action) {
			if(action) {
				get_storage(function (result) {
					$.ajax({
						method: "POST",
						url: "http://localhost/pickup/remove_task",
						data: {list_remove_task: [id], pickup_session: result.pickup_session}
					}).done(function (respons) {
						$(".all_task .build_task_table").bootstrapTable('refresh');
					});
				});
			}
		});
		return false;
	});

	// edit task
	$("body").on("click",".p16", function () {
		var id=$(this).parent().attr("data-id");
		var p17=$(this).closest("tr").find(".p17").text();
		$(".p12 input[name=name_task]").val(p17);

		$(".all_task .build_task_table").bootstrapTable('destroy');
		$(".p12 input[name=id]").remove();
		$(".p12").append("<input type='hidden' name='id' value='"+id+"'>");
		$(".p13").text("Save");
		$(".p11").show();
		return false;
	});

	// cancel new or update task
	$("body").on("click",".p14", function () {
		$(".p11").hide();
		$(".p8 a:first").click();
		return false;
	});

	// build different task by action
	$(".p8").on("click", "a",function () {
		var name_tab=$(this).attr("data-name");
		$(".p8 li").removeClass("active");
		$(this).parent().addClass("active");

		$(".p9").hide();
		$("."+name_tab).show();
		$(".p9 .bootstraptable").bootstrapTable('destroy');

        switch (name_tab) {
            case "all_task":
                all_task();
                break;
            case "all_likes":
                all_likes();
                break;
            case "all_black_list":
                all_black_list();
                break;
        }
	});

	// event check or uncheck
	$(".build_task_table").on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
		var check_element=$(".build_task_table input[type='checkbox']:checked").length;
		if(check_element) {
			$(".p19").show();
		} else {
			$(".p19").hide();
		}
	});

	// remove several task
	$("body").on("click",".p19", function () {
		var list_remove_task=[];
		$(".build_task_table input[type='checkbox']:checked, .build_task_table input[type='checkbox']:checked").each(function(){
			var name_domain=$(this).closest("tr").find(".p17").attr("id");
			list_remove_task.push(name_domain);
		});

		bootbox.confirm("Are you sure you want to delete the tasks?", function(action) {
			if(action) {
				get_storage(function (result) {
					$.ajax({
						method: "POST",
						url: "http://localhost/pickup/remove_task",
						data: {list_remove_task: list_remove_task, pickup_session: result.pickup_session}
					}).done(function (respons) {
						$(".all_task .build_task_table").bootstrapTable('refresh');
					});
				});
			}
		});

	});

	// add event click if miss checkbox
	$("body").on('click', ".table td", function (event) {
		var elem=event.target.nodeName;
		if(elem!="INPUT") {
			$(this).find("input").trigger('click');
		}
	});

	// show detal task
	$("body").on("click", ".p17",function () {
		var task_id=$(this).attr("id");
		$(".p9 .bootstraptable").bootstrapTable('destroy');
		create_certain_task(task_id);
		return false;
	});

});

/**
 * Function for get session id
 * @param callback
 */
function get_storage(callback) {
	chrome.storage.local.get('pickup_session', function (result) {
		return callback(result);
	});
}

/**
 * Show all task
 */
function all_task() {
    get_storage(function (result) {
        if(result.pickup_session) {
            $(".all_task .build_task_table").bootstrapTable({
                url: "http://localhost/pickup/get_list_task?pickup_session="+result.pickup_session,
                columns: [
                    {
                        field: 'state',
                        checkbox: true,
                        title: '',
                        align: 'center'
                    },
                    {
                        field: 'name',
                        title: 'Name',
                        align: 'left',
                        formatter :function (data, all_row) {
                            return "<a href='' id='"+all_row.id+"' class='p17'>"+data+"</a>";
                        }
                    },
                    {
                        field: 'statistic',
                        title: 'Statistics',
                        align: 'center',
                        formatter :function (data) {
							if(data=="") {
								data="0%";
							}
                            return data;
                        }
                    },
					{
						field: 'status',
						title: 'Status',
						align: 'center',
						formatter :function (data) {
							var html="";
							if(data==0) {
								html="Disabled";
							} else if(data==1) {
								html="Enable";
							}
							return html;
						}
					},
					{
						field: 'type_network',
						title: 'Network',
						align: 'center',
						formatter :function (data) {
							var html="";
							if(data==0) {
								html="Vk";
							} else if(data==1) {
								html="Facebook";
							}
							return html;
						}
					},
                    {
                        field: 'action',
                        title: 'Action',
                        align: 'center',
                        formatter :function (data, all_row) {
							data='<div data-id="'+all_row.id+'" class="p18">' +
								'<a class="edit p20" href="javascript:void(0)" title="Show"><i class="glyphicon glyphicon-eye-open"></i></a>' +
								'<a class="edit p16" href="javascript:void(0)" title="Edit"><i class="glyphicon glyphicon-edit"></i></a>' +
								'<a class="remove p15" href="javascript:void(0)" title="Remove"><i class="glyphicon glyphicon-remove"></i></a>' +
								'</div>';
                            return data;
                        }
                    }
                ],
                search: true,
                sidePagination: "server",
                pagination: true,
                pageSize: 10,
                showRefresh: true,
                pageList: [10, 25, 50, 'All'],
                cookieIdTable: "all_task",
				height: 529
            });
            $(".fixed-table-toolbar").append('<button type="button" class="btn btn-default p10">Add new task</button> <button type="button" class="btn btn-danger p19">Delete</button>');
        }
    });
}

function create_certain_task(task_id) {
	get_storage(function (result) {
		if(result.pickup_session) {
			$(".p21").show();
			$(".all_task .build_task_id_table").bootstrapTable({
				url: "http://localhost/pickup/get_list_task?pickup_session="+result.pickup_session,
				columns: [
					{
						field: 'state',
						checkbox: true,
						title: '',
						align: 'center'
					},
					{
						field: 'name',
						title: 'Image',
						align: 'left',
						formatter :function (data, all_row) {
							return "<a href='' id='"+all_row.id+"' class='p17'>"+data+"</a>";
						}
					},
					{
						field: 'id_user',
						title: 'User id',
						align: 'center',
						formatter :function (data) {
							if(data=="") {
								data="0%";
							}
							return data;
						}
					},
					{
						field: 'id_user',
						title: 'Network',
						align: 'center',
						formatter :function (data) {
							if(data=="") {
								data="0%";
							}
							return data;
						}
					},
					{
						field: 'status',
						title: 'Status',
						align: 'center',
						formatter :function (data) {
							var html="";
							if(data==0) {
								html="Disabled";
							} else if(data==1) {
								html="Enable";
							}
							return html;
						}
					}
				],
				search: true,
				sidePagination: "server",
				pagination: true,
				pageSize: 10,
				showRefresh: true,
				pageList: [10, 25, 50, 'All'],
				cookieIdTable: "all_task",
				height: 529
			});
			$(".fixed-table-toolbar").append('<button type="button" class="btn btn-default p10">Add new task</button> <button type="button" class="btn btn-danger p19">Delete</button>');
		}
	});
}

function all_likes() {

}

function all_black_list() {

}

// Функция для отправки сообщений
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
		//console.log(response.farewell);
	});
});

// Функция для получения сообщений
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(request.greeting);
		//sendResponse({farewell: "goodbye"});
	}
);