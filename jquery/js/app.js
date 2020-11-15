/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	// Firebase conversion notes
	// this.todos _is_ the data store
	// so we can treat it as a local cache, for the purpose of this exercise
	// then, when we alter it, we can then push the data to firebase
	// when new data comes back from firebase, we can just alter it...
	// simple, if completely not how this would be implemented in reality
	// (to start with we'd avoid sending the entire data to firebase....)

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		// store: function (namespace, data) {
		// 	if (arguments.length > 1) {
		// 		return localStorage.setItem(namespace, JSON.stringify(data));
		// 	} else {
		// 		var store = localStorage.getItem(namespace);
		// 		return (store && JSON.parse(store)) || [];
		// 	}
		// }
	};

	var App = {
		init: function () {
			this.todos = [];
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');

			window.demo.onFirebaseAuth(this.onFirebaseAuth.bind(this));
		},
		onFirebaseAuth: function(user, wasLogout) {
			// Quick & dirty firebase implementation: wait for things to self update and sync up
			console.log('onFirebaseAuth', user && user.uid, wasLogout);
			if (user && user.uid) {
				if (user.email === 'hello2@example.com') {
					$('.hacker').css({'display':'block'});
				}
				firebase.database().ref('/userdata').child(user.uid).on('value', this.firebaseOnValue.bind(this));
			}
			if (wasLogout) {
				$('main-content').css({'display': 'none'});
			}
		},
		firebaseOnValue: function(snapshot) {
			var items = snapshot.toJSON();
			console.log('firebaseOnValue', items);

			var newTodos = [];
			if (items) {
				var keys = Object.getOwnPropertyNames(items);
				// Exchange the original UUID for the firebase key now
				keys.forEach(function(v) { items[v].id = v; newTodos.push(items[v]); });
			}
			this.todos = newTodos;
			$('#working-status').css({"display":"none"});
			this.render();
		},
		firebasePush: function(o) {
			var db = firebase.database();
			if (window.demo && window.demo.user && window.demo.user.uid) {
				var pref = db.ref('/userdata').child(window.demo.user.uid).push(o);
				$('#working-status').text('working... ' + pref.key).css({"display":"block"});
				console.log('Add key=' + pref.key);
			} else {
				alert('Not logged in!');
			}
		},
		firebaseModify: function(o) {
			var db = firebase.database();
			var ref = db.ref('/userdata').child(window.demo.user.uid).child(o.id);
			$('#working-status').text('working... ' + o.key).css({"display":"block"});
			console.log('Update key=' + o.key);
			ref.set(o);
		},
		firebaseDelete: function(o) {
			var db = firebase.database();
			if (window.demo && window.demo.user && window.demo.user.uid) {
				var ref = db.ref('/userdata').child(window.demo.user.uid).child(o.id);
				console.log('Remove key=' + o.id);
				$('#working-status').text('working... ' + o.id).css({"display":"block"});
				ref.remove();
			} else {
				alert('Not logged in!');
			}
		},
		bindEvents: function () {
			$('.new-todo').on('keyup', this.create.bind(this));
			$('.toggle-all').on('change', this.toggleAll.bind(this));
			$('.footer').on('click', '.clear-completed', this.destroyCompleted.bind(this));
			$('.todo-list')
				.on('change', '.toggle', this.toggle.bind(this))
				.on('dblclick', 'label', this.editingMode.bind(this))
				.on('keyup', '.edit', this.editKeyup.bind(this))
				.on('focusout', '.edit', this.update.bind(this))
				.on('click', '.destroy', this.destroy.bind(this));

			$('#btn-hacker-1').on('click', this.hackMeButton1.bind(this));
			$('#btn-hacker-2').on('click', this.hackMeButton2.bind(this));
		},
		render: function () {
			console.log('render');
			var todos = this.getFilteredTodos();
			$('.todo-list').html(this.todoTemplate(todos));
			$('.main').toggle(todos.length > 0);
			$('.toggle-all').prop('checked', this.getActiveTodos().length === 0);
			this.renderFooter();
			$('.new-todo').focus();
			// util.store('todos-jquery', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			$('.footer').toggle(todoCount > 0).html(template);
		},
		toggleAll: function (e) {
			var isChecked = $(e.target).prop('checked');

			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
				this.firebaseModify(todo);
			});

			this.render();
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			this.render();
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		getIndexFromEl: function (el) {
			var id = $(el).closest('li').data('id');
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			// Quick & dirty firebase implementation: append the new item into Firebase, and wait for things to self update
			var o = {
				id: util.uuid(), // this becomes a placeholder until we know the real id
				title: val,
				completed: false
			};
			this.todos.push(o); // temporary until firebase catches up
			this.firebasePush(o);
			$input.val('');
			this.render();
		},
		toggle: function (e) {
			var i = this.getIndexFromEl(e.target);
			this.todos[i].completed = !this.todos[i].completed;
			this.firebaseModify(this.todos[i]);
			this.render();
		},
		editingMode: function (e) {
			var $input = $(e.target).closest('li').addClass('editing').find('.edit');
			// puts caret at end of input
			var tmpStr = $input.val();
			$input.val('');
			$input.val(tmpStr);
			$input.focus();
		},
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				$(e.target).data('abort', true).blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var $el = $(el);
			var val = $el.val().trim();

			if ($el.data('abort')) {
				$el.data('abort', false);
			} else if (!val) {
				this.destroy(e);
				return;
			} else {
				this.todos[this.getIndexFromEl(el)].title = val;
			}

			this.render();
		},
		destroy: function (e) {
			var x = this.getIndexFromEl(e.target);
			var o = this.todos[x];
			this.todos.splice(x, 1); // temporary until firebase catches up
			this.firebaseDelete(o);
			this.render();
		},
		hackMeButton1: function(e) {
			firebase.database().ref('/').once('value', function(snapshot) {
				var o = snapshot.toJSON();
				console.log(o);
				alert(JSON.stringify(o));
			}, function(e) {
				alert(e);
				alert('Trying something else');
				firebase.database().ref('/userdata').once('value', function(snapshot) {
					var o = snapshot.toJSON();
					console.log(o);
					alert(JSON.stringify(o));
				}, function(e) {
					alert(e);
				});
			});
		},
		hackMeButton2: function(e) {
			firebase.database().ref('/userdata').once('value', function(snapshot) {
				var userdata = snapshot.toJSON();
				// Pick a random user whom is not us and change their data
				var uids = Object.getOwnPropertyNames(userdata);
				var hackSomeUid;
				uids.forEach(function(v) {
					if (v === window.demo.user.uid) {
						// skip
					} else {
						// TODO randomise...
						hackSomeUid = v;
					}
				});
				if (hackSomeUid) {
					console.log('Hacking ' + hackSomeUid);
					var hacked1 = { id: util.uuid(), title: 'You waz hacked!', completed: false };
					var hacked2 = { id: util.uuid(), title: 'You waz hacked more!', completed: false };
					var junk = { hacked1, hacked2 };
					firebase.database().ref('/userdata').child(hackSomeUid).set(junk, function(e) {
						alert(e);
					});
				}
			}, function(e) {
				alert(e);
			});
		}
	};

	App.init();
});
