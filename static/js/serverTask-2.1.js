'use strict';

(function(){
	var toolsOff = 'n'; 
	var checkbox = document.querySelector('.show-done');
	var textField;
	var inputText;
	var TodoList;
	var keyupTimeout;
	var selectDay;
	var selectMonth;
	var selectYear;
	var calendarDay;
	var e;
	
	function taskList(node) {
		this.node = node;
		$(node).append('<div class="filterContainer-2"><input class="filter"  placeholder="Фильтровать"><span class="text-delete">⊗</span><span class="lupa"></span></div><input class="show-done" type="checkbox" checked>Показывать выполненные<div class="table1"><div class="loader"><img src="./ajax-loader.gif" alt="" /></div><div class="tableHead"></div><div class="tableTask"></div></div>');
		$(node).append("<button>Добавить задачу</button>");
		$('.tableHead').append('<table><tr><td class="taskItem head">Что надо сделать</td><td class="taskTerm head">Когда</td><td class="taskDone head">Сделано</td></tr></table>');
		
		$.ajax({
			url: './todos/',
			success: function(response) {
				return response;
			}
		}).then(function(firstElem) {
			return taskList.prototype.loadingTasks(firstElem[0]);
		});

		var checkbox = document.querySelector('.show-done');
		checkbox.onchange = function() {
			var nameActiveCategory = $('table.active').text();
			nameActiveCategory = nameActiveCategory.substr(0, nameActiveCategory.length-2);
			taskList.prototype.loadingTasks(nameActiveCategory, checkbox.checked);
		};

		$('.tasksList button').on('click', function() {
					toolsOff = 'y';
					taskList.prototype.newTask();
					$(".table1").scrollTop($(".table1")[0].scrollHeight);
				});
		$('.tableTask').on('click', function(e){
			if ($(e.target).hasClass('pencil-tool')) {
				taskList.prototype.editTask(e);
			} 
		});
		$('.text-delete').on('click', function(e) {
			$(e.target).parent().find('input.filter').val('');
			var nameActiveCategory = $('table.active').text();
			nameActiveCategory = nameActiveCategory.substr(0, nameActiveCategory.length-2);
			taskList.prototype.loadingTasks(nameActiveCategory);

		});
		$('input.filter').on('keyup', function (event) {
			taskList.prototype.searchSimilarTask(event);	
		});

	}
	
	taskList.prototype.searchSimilarTask = function(event) {
		clearTimeout(keyupTimeout);
		if (event !== undefined) {
			keyupTimeout = setTimeout(function() {
				var text = event.target.value;
				if (text !== '') {
					text = new RegExp(text, "i");
					$('.tableTask table').remove();
					console.log(TodoList.tasks);
					TodoList.tasks.forEach(function(element) {
						if (text.test(element.description)) {
							taskList.prototype.addTask(element);
						}
					});
				} else {
					var nameActiveCategory = $('table.active').text();
					nameActiveCategory = nameActiveCategory.substr(0, nameActiveCategory.length - 2);
					taskList.prototype.loadingTasks(nameActiveCategory);
				}
			}, 700);
		}
	};

	taskList.prototype.cancelEditing = function(e) {
		toolsOff = 'n';
		$('textarea').parent().append('<span class="element-description">'+textField+'</span>');
		$('.tasksList button')[0].disabled = false;
		$('textarea').remove();
		$('.taskItem .saveList').remove();
		$('.taskItem .cancel').remove();

	};

	taskList.prototype.editTask = function(e) {
		toolsOff = 'y';
		textField = $(e.target).parent().parent().find('.element-description').text();
		$(e.target).parent().parent().find('.element-description').remove();
		$(e.target).parent().parent().append('<textarea></textarea><span class="saveList">Сохранить</span>  <span class="cancel">Отмена</span>');
		$('textarea').val(textField);
		$('.tasksList button')[0].disabled = true;
		$('.toolsTask-panel').css('display', 'none');
		$('.taskItem .saveList').on('click', function(e) {
			taskList.prototype.saveEdited(e);
		});
		$('.taskItem .cancel').on('click', function(e) {
			taskList.prototype.cancelEditing(e);
		});
	};

	taskList.prototype.saveEdited = function(e) {
		inputText = $('textarea').val();
		if (inputText !== "") {
			toolsOff = 'n';
			$('textarea').parent().append('<span class="element-description">' + inputText + '</span>')
			$('.tasksList button')[0].disabled = false;
			$('textarea').remove();
			$('.taskItem .saveList').remove();
			$('.taskItem .cancel').remove();
			taskList.prototype.checkTasks(TodoList);
			taskList.prototype.showCalendar();
		}
	};

	taskList.prototype.saveNewTask = function(inputText, nameActiveCategory) {
		var table = $('.tasksList table');
		if (inputText !== "") {
			table[table.length - 1].remove();
			taskList.prototype.addTask(inputText);
			$('.tasksList button')[0].disabled = false;
			$.getJSON('./todos/' + nameActiveCategory).then(function(TodoList) {
				TodoList.tasks.push({
					description: inputText,
					done: false
				})
				console.log(TodoList);
				return TodoList
			}).then(function(TodoList) {
				return $.ajax({
					url: './todos/' + nameActiveCategory,
					method: 'PUT',
					data: {
						todo: JSON.stringify(TodoList)
					}
				});
			});
		}
	};

	taskList.prototype.newTask = function() {
		var nameActiveCategory = $('table.active').text();
		nameActiveCategory = nameActiveCategory.substr(0, nameActiveCategory.length - 2);
		$('.tasksList button')[0].disabled = true;
		$('.tableTask').append('<table><tr><td><input><span class="saveList">Сохранить</span><span class="cancel">Отмена</span></td></tr></table>');
		$('.tasksList .saveList').on('click', function(e) {
			toolsOff = 'n';
			var inputText = $(e.target.previousSibling).val();
			taskList.prototype.saveNewTask(inputText, nameActiveCategory);
			taskList.prototype.showCalendar();
		});
		$('.tableTask .cancel').on('click', function() {
			var table = $('.tableTask table');
			table[table.length - 1].remove();
			$('.tasksList button')[0].disabled = false;
			toolsOff = 'n';
		});
	};
	taskList.prototype.loadingTasks = function(text, taskStatus) {
		$('.tableTask table').remove();
		$('.loader').css('display', 'block');
		var xhr = new XMLHttpRequest();
		xhr.open('GET', './todos/' + text, true);
		xhr.send();
		xhr.onreadystatechange = function() {
			if (xhr.status === 200 && xhr.readyState === 4) {
				var response = JSON.parse(xhr.response);
				response.tasks.forEach(function(element) {
					taskList.prototype.addTask(element, taskStatus);
				});

				$('.tableTask').css('display', 'block');
				var $loader = $('.loader');
				$loader.delay(100).fadeOut('fast');
				$('.taskDone > input').on('click', function() {
					taskList.prototype.checkTasks(TodoList);
				});
				taskList.prototype.showCalendar();
			}
		};
		$.get('./todos/' + text, function(response) {
			TodoList = response;
		});
	};
	
	taskList.prototype.addTask = function(element, taskStatus) {
		var check;
		if (taskStatus === false) {
			if(element.done === false) {
				check = '<input type="checkbox"';
				$('.tableTask').append('<table><tr><td class="taskItem"><span class="element-description">' + (element.description || element) +'</span><div class="toolsTask-panel"><span class="pencil-tool">✎</span></div></td><td class="taskTerm"><span class="calendar">' + (element.term || '') +'</span></td><td class="taskDone">'+ 
		check	+'</td></tr></table>');
			}
		} else {
			if (element.done == true) {
				check = '<input type="checkbox" checked>';
			} else {
				check = '<input type="checkbox"';
			}
			$('.tableTask').append('<table><tr><td class="taskItem"><span class="element-description">' + (element.description || element) +'</span><div class="toolsTask-panel"><span class="pencil-tool">✎</span></div></td><td class="taskTerm"><span class="calendar">' + (element.term || '') +'</span></td><td class="taskDone">'+ 
		check	+'</td></tr></table>');
		}
		
		$('.calendar').each(function(index, element) {
			if (element.textContent) {
				element.style.position = 'relative';
				element.style.width = '80px';
				element.style.background = 'none';
			}
		});

		taskList.prototype.toolsPanelBehaviour();
	};

	
	taskList.prototype.checkTasks = function(TodoList) {
		var nameActiveCategory = $('table.active').text();
		nameActiveCategory = nameActiveCategory.substr(0, nameActiveCategory.length - 2);
		var tasks = [];
		$('.element-description').each(function(index, element) {
			tasks[index] = {};
			tasks[index].description = element.textContent;
		});
		$('.taskDone input').each(function(index, element) {
			tasks[index].done = element.checked;
		});
		TodoList.tasks = tasks;
		$.ajax({
			url: './todos/' + nameActiveCategory,
			method: 'PUT',
			data: {
				todo: JSON.stringify(TodoList)
			}
		});
	};

	taskList.prototype.toolsPanelBehaviour = function() {

		var tables = document.querySelectorAll('.tableTask .taskItem');
		Array.prototype.forEach.call(tables, function(table) {
			var tool = table.querySelector('.toolsTask-panel');
			var hiding;
			table.addEventListener('mouseleave', function() {
				hiding = setTimeout(function() {
					tool.style.display = 'none';
				}, 50);
			});
			table.addEventListener('mouseenter', function() {
				if (table.className !== 'active' && toolsOff === 'n') {
					clearTimeout(hiding);
					tool.style.display = 'block';
				}
			});
		});
	};
	
	taskList.prototype.showCalendar = function() {

		$(".calendar").on('click', function(event) {
			var nameActiveCategory = $('table.active').text();
			nameActiveCategory = nameActiveCategory.substr(0, nameActiveCategory.length - 2);
			$.get('./todos/' + nameActiveCategory, function(response) {
				TodoList = response;
				console.log(TodoList.tasks)
			});
			e = event;
			$(event.target).css('background', 'none');
			$(event.target).css('position', 'relative');
			$(event.target).css('width', '80px');
			$('.ui-state-active').removeClass('ui-state-active');
			$('.hasDatepicker').css('display', 'block');
			calendarDay = $('.ui-state-default');
			$('.ui-datepicker-inline').on('click', function() {
				calendarDay = $('.ui-state-default');
				taskList.prototype.calendarDayBehaviour(calendarDay, nameActiveCategory);
			});
			taskList.prototype.calendarDayBehaviour(calendarDay, nameActiveCategory);

		});
	};
	taskList.prototype.calendarDayBehaviour = function(calendarDay, nameActiveCategory) {

			calendarDay.on('click', function(event) {
				$('.ui-datepicker-current-day').removeClass('ui-datepicker-current-day');
				$('.hasDatepicker').css('display', 'none');
				selectMonth = +($(event.target).parent().attr('data-month')) + 1;
				if (selectMonth.toString().length < 2) {
					selectMonth = '0' + selectMonth;
				}
				selectYear = $(event.target).parent().attr('data-year');
				selectDay = $(event.target).text();
				$(e.target).text(selectDay + '-' + selectMonth + '-' + selectYear);
				
				$('.calendar').each(function(index, element) {
					TodoList.tasks[index].term = element.textContent;
				});
				$.ajax({
					url: './todos/' + nameActiveCategory,
					method: 'PUT',
					data: {
						todo: JSON.stringify(TodoList)
					}
				});
			});
	};
	window.taskList = taskList;
}())


