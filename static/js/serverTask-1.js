(function() {
	'use strict';
	var categoryName;
	var toolsOff = 'n';
	var textField;
	var Todo;
	var keyupTimeout;


	function application(node) {
		this.node = node;
		$(node).append('<div class="filterContainer-1"><input class="filter"  placeholder="Фильтровать"><span class="lupa"></span><span class="text-delete">⊗</span></div><div class="table"></div>');

		$.ajax({
			url: './todos/',
			success: function(response) {
				Todo = response; 
				response.forEach(function(element, index) {
					application.prototype.addCategory(element, node);
				});
				$('.containerCategory table:first-child').addClass("active");
				$('.containerCategory td:first-child').addClass("active");
				$(node).append('<button>Новый список</button>');
				$('.containerCategory button').on('click', function() {
					toolsOff = 'y';
					application.prototype.newList();
					$(".table").scrollTop($(".table")[0].scrollHeight);
				});
			}
		});

		$('.table').on('click', function(e) {
			if ($(e.target).hasClass('removal-tool')) {
				application.prototype.removeCategory($(e.target));
			} else if ($(e.target).hasClass('pencil-tool')) {
				application.prototype.editCategory($(e.target));

				$('.containerCategory .saveList').on('click', function(e) {
					application.prototype.saveEdited($(e.target.parentElement));
				});

				$('.containerCategory .cancel').on('click', function(e) {
					application.prototype.cancelEdit($(e.target.parentElement));
				});
			}
			$('.table').on('click', function(e) {
				if ($(e.target).hasClass('active') || $(e.target).hasClass('')) {
					application.prototype.chooseCategory($(e.target));
				}
			});
		});

		$('.text-delete').on('click', function(e) {
			$(e.target).parent().find('input.filter').val('');
			$('.table table').remove();
			Todo.forEach(function(element) {
				application.prototype.addCategory(element);
			});

		});
		
		// search plugin
		$('input.filter').on('keyup', function (event) {
			application.prototype.searchSimilarCategory(event);	
		});
	}

	application.prototype.searchSimilarCategory = function(event) {
		clearTimeout(keyupTimeout);
		if (event !== undefined) {
			keyupTimeout = setTimeout(function() {
				var text = event.target.value;
				if (text !== '') {
					text = new RegExp(text, "i");
					$('.table table').remove();
					Todo.forEach(function(element) {
						if (text.test(element)) {
							application.prototype.addCategory(element);
						}
					});
				} else {
					$('.table table').remove();
					Todo.forEach(function(element) {
						application.prototype.addCategory(element);
					});
				}
			}, 700);
		}
	};

	application.prototype.cancelEdit = function(target) {
		var inputText = $('table input').val();
		target[0].firstChild.textContent = textField;
		$('.containerCategory button')[0].disabled = false;
		$('table input').remove();
		$('.saveList').remove();
		$('.cancel').remove();
		toolsOff = 'n';
	};

	application.prototype.saveEdited = function(target) {
		var inputText = $('.table input').val();
		if (inputText !== "") {
			toolsOff = 'n';
			$('.containerCategory button')[0].disabled = false;
			$('table input').remove();
			$('.saveList').remove();
			$('.cancel').remove();
			target[0].firstChild.textContent = inputText;
			$.ajax({
				type: 'delete',
				url: './todos/' + textField
			});
			$.post('./todos/' + inputText, {
				todo: JSON.stringify({
					title: inputText + " todo list",
					created: new Date().toString(),
					tasks: []
				})
			});
		}
	};

	application.prototype.toolsPanelBehaviour = function() {

		var tables = document.querySelectorAll('.containerCategory table');
		Array.prototype.forEach.call(tables, function(table) {
			var tool = table.querySelector('.tools-panel');
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

	application.prototype.removeCategory = function(target) {
		var inputText = target[0].parentElement.previousSibling.textContent;
		target[0].parentNode.parentElement.parentElement.parentElement.parentElement.remove();

		$.ajax({
			type: 'delete',
			url: './todos/' + inputText,
		});
	};

	application.prototype.editCategory = function(target) {
		toolsOff = 'y';
		textField = (target[0].parentElement.previousSibling.textContent);
		target[0].parentElement.previousSibling.textContent = '';
		target.parent().parent().append('<input value=' + textField + '><span class="saveList">Сохранить</span>  <span class="cancel">Отмена</span>');
		$('.containerCategory button')[0].disabled = true;
		target[0].parentElement.style.display = 'none';
	};

	application.prototype.addCategory = function(element, node) {
		$('.table').append('<table><tr><td>' + element + '<div class="tools-panel"><span class="pencil-tool">✎</span><span class="removal-tool">X</span></div></td></tr></table>');
		application.prototype.toolsPanelBehaviour();
	};

	application.prototype.newList = function() {
		$('.containerCategory button')[0].disabled = true;
		$('.table').append('<table><tr><td><input><span class="saveList">Сохранить</span>  <span class="cancel">Отмена</span></td></tr></table>');
		$('.containerCategory .saveList').on('click', function(e) {
			toolsOff = 'n';
			var table = $('.containerCategory table');
			var inputText = $(e.target.previousSibling).val();
			if (inputText !== "") {
				table[table.length - 1].remove();
				application.prototype.addCategory(inputText);
				$('.containerCategory button')[0].disabled = false;
				$.post('./todos/' + inputText, {
					todo: JSON.stringify({
						title: inputText + " todo list",
						created: new Date().toString(),
						tasks: []
					})
				});
			}
		});
		$('.containerCategory .cancel').on('click', function() {
			var table = $('.containerCategory table');
			table[table.length - 1].remove();
			$('.containerCategory button')[0].disabled = false;
			toolsOff = 'n';
		});
	};


	application.prototype.chooseCategory = function(target) {

		$('.active').removeClass('active');
		target.addClass('active');
		$('.active').parent().parent().parent().addClass('active');
		$('.active > .tools-panel').css('display', 'none');
		var text = target[0].firstChild.textContent;
		var checkbox = document.querySelector('.show-done');
		taskList.prototype.loadingTasks(text, checkbox.checked);

	};

	window.application = application;
}());