//(function(){
//
//	angular
//		.module('app', ['ngMaterial', 'ngAnimate'])
//		.controller('TodoController', ['$scope', '$http', TodoController]);
//
//	function TodoController($scope, $http, pouchDB) {
//        var db = pouchDB('todos');
//        var remoteDB = 'http://127.0.0.1:5984/todos'
//		// List of bindable properties and methods
//		var todo = this;
//		todo.tasks = [];
//		todo.incompleteTasks = [];
//		todo.completedTasks = [];
//		todo.addTask = addTask;
//		todo.inputTask = "";
//		todo.refreshTasks = refreshTasks;
//        todo.updateTask = updateTask;
//		todo.showCompleted = false;
//		todo.toggleCompletedTasks = toggleCompletedTasks;
//        
//        db.changes({
//          since: 'now',
//          live: true
//        }).on('change', activate);
//
//		activate();
//
//		/**
//		 * Initialize sample controller data.
//		 */
//		function activate() {
//			// Fill sample tasks
//            db.allDocs({include_docs: true, descending: true}, function(err, doc) {
//                tasks = doc.rows;
//                refreshTasks();
//            });
//            
//            db.sync(remoteDB, {
//              live: true,
//              retry: true
//            }).on('change', function (change) {
//              refreshTasks()
//            }).on('paused', function (info) {
//              // replication was paused, usually because of a lost connection
//            }).on('active', function (info) {
//              // replication was resumed
//            }).on('error', function (err) {
//              // totally unhandled error (shouldn't happen)
//            });
//		}
//
//		/**
//		 * Run through all tasks and see which are complete and which are not.
//		 */
//		function refreshTasks() {
//			todo.completedTasks = [];
//			todo.incompleteTasks = [];
//			todo.tasks.forEach(function(task, index, arr) {
//				if (task.completed)
//					todo.completedTasks.push(task);
//				else
//					todo.incompleteTasks.push(task);
//			});
//		}
//
//        /**
//         * update completed state of the given task
//         */
//        function updateTask(task){
//            db.post(task)
//              .then(refreshTasks)
//              .catch(error);
//        }
//        
//        function error(err) {
//            console.log(err);
//          }
//
//		/**
//		 * Add new task to collection.
//		 */
//		function addTask() {
//			// Only add task if something actually exists
//			if (todo.inputTask) {
//                var newTask = {
//                    _id: new Date().toISOString(),
//                    text: todo.inputTask,
//                    completed: false
//                };
//
//                db.post(newTask)
//                  .then(refreshTasks)
//                  .catch(error);
//			}
//		}
//
//		/**
//		 * Show or hide completed tasks.
//		 */
//		function toggleCompletedTasks() {
//			todo.showCompleted = !todo.showCompleted;
//		}
//
//	}
//
//})();
