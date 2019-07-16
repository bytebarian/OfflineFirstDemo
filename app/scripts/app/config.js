(function() {

	angular
		.module('app', ['ngMaterial', 'ngAnimate'])
        .config(['$mdThemingProvider', '$httpProvider', configure])  
        .factory("pouchDB", ["$rootScope", "$q", PouchDBService])
        .run(function(pouchDB) {
            pouchDB.initGlobalDatabase("global_todo", "http://127.0.0.1:5984/global_todo");
        })	  
        .controller('TodoController', TodoController);

	function configure($mdThemingProvider, $httpProvider) {
	    // Configure a dark theme with primary foreground yellow
	    $mdThemingProvider
	    	.theme('docs-dark', 'default')
	    	.primaryPalette('yellow')
	    	.dark()
    		.foregroundPalette['3'] = 'yellow';

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
	}
    
    function TodoController($scope, $rootScope, $http, pouchDB) {
		// List of bindable properties and methods
		var todo = this;
		todo.tasks = [];
        todo.globalTasks = [];
		todo.incompleteTasks = [];
		todo.completedTasks = [];
		todo.addTask = addTask;
		todo.inputTask = "";
		todo.refreshTasks = refreshTasks;
        todo.updateTask = updateTask;
        todo.deleteTask = deleteTask;
		todo.showCompleted = false;
		todo.toggleCompletedTasks = toggleCompletedTasks;
        todo.username = "";
        todo.password = "";
        todo.authenticated = false;
        todo.login = login;
        todo.loginazure = loginazure;
        
        $rootScope.$on("$pouchDB:change", function(event, data){
            tryAddTask(data);
            refreshTasks();
        });
        
        $rootScope.$on("$pouchDB:delete", function(event, data){
            todo.tasks.forEach(function(task, index, arr) {
				if (task._id == data._id)
					todo.tasks.splice(index, 1);
			});
            refreshTasks();
        });
        
        $rootScope.$on("$pouchDB:changeGlobal", function(event, data){
            var found = null;
            todo.globalTasks.forEach(function(task, index, arr) {
				if (task._id == item._id)
					found = task;
			});
            if(found === null){
                todo.globalTasks.push(item);
            }
        });
        
        $rootScope.$on("$pouchDB:deleteGlobal", function(event, data){
            todo.globalTasks.forEach(function(task, index, arr) {
				if (task._id == data._id)
					todo.globalTasks.splice(index, 1);
			});
        });
        
        function tryAddTask(item){
            var found = null;
            todo.tasks.forEach(function(task, index, arr) {
				if (task._id == item._id)
					found = task;
			});
            if(found === null){
                todo.tasks.push(item);
            }
        }

		/**
		 * Run through all tasks and see which are complete and which are not.
		 */
		function refreshTasks() {
			todo.completedTasks = [];
			todo.incompleteTasks = [];
			todo.tasks.forEach(function(task, index, arr) {
				if (task.completed)
					todo.completedTasks.push(task);
				else
					todo.incompleteTasks.push(task);
			});
            $scope.$apply()
		}

        /**
         * update completed state of the given task
         */
        function updateTask(task){
            console.log(task);            
            pouchDB.update(task);
        }
        
        function deleteTask(task){
            console.log(task);
            pouchDB.delete(task);
        }
        
        function error(err) {
            console.log(err);
          }

		/**
		 * Add new task to collection.
		 */
		function addTask() {
			// Only add task if something actually exists
			if (todo.inputTask) {
                var newTask = {
                    _id: new Date().toISOString(),
                    text: todo.inputTask,
                    completed: false
                };
                console.log(newTask);
                pouchDB.save(newTask)
			}
		}

		/**
		 * Show or hide completed tasks.
		 */
		function toggleCompletedTasks() {
			todo.showCompleted = !todo.showCompleted;
		}
        
        function init(details){
            
        }
        
        function login(){
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            
            let credentials = {
                username: todo.username,
                password: todo.password
            };
            
            $http.post('http://localhost:3000/auth/login', JSON.stringify(credentials), {headers: headers})
                .subscribe(res => {
                  this.todoService.init(res.json());
                }, (err) => {
                  console.log(err);
                });
        }
        
        function loginazure(){
            $http.post('http://localhost:3000/auth/azure')
                .subscribe(res => {
                  this.todoService.init(res.json());
                }, (err) => {
                  console.log(err);
                });
        }

	}
    
    function PouchDBService($rootScope, $q){
        var database;
        var changeListener;
        var globalDatabase;
        var globalChangeListener;
        
        this.initGlobalDatabase = function(databaseName, remoteDatabase){
            globalDatabase = new PouchDB(databaseName);
            globalDatabase.sync(remoteDatabase, {live: true, retry: true});
            globalChangeListener = globalDatabase.changes({
                live: true,
                include_docs: true
            }).on("change", function(change) {
                if(!change.deleted) {
                    $rootScope.$broadcast("$pouchDB:changeGlobal", change.doc);
                } else {
                    $rootScope.$broadcast("$pouchDB:deleteGlobal", change.doc);
                }
            });
        }

        this.setDatabase = function(databaseName) {
            database = new PouchDB(databaseName);
        }

        this.startListening = function() {
            changeListener = database.changes({
                live: true,
                include_docs: true
            }).on("change", function(change) {
                if(!change.deleted) {
                    $rootScope.$broadcast("$pouchDB:change", change.doc);
                } else {
                    $rootScope.$broadcast("$pouchDB:delete", change.doc);
                }
            });
        }

        this.stopListening = function() {
            changeListener.cancel();
        }

        this.sync = function(remoteDatabase) {
            database.sync(remoteDatabase, {live: true, retry: true});
        }

        this.save = function(doc) {
            return database.put(doc);
        }
        
        this.update = function(doc){
            database.get(doc._id)
                .then(function(d){
                    d.completed = !d.completed;
                    database.put(d)
                    .then(function(x){
                        database.get(doc._id)
                        .then(function(dd){
                            doc = dd;
                            $rootScope.$broadcast("$pouchDB:change", doc);
                        })
                    })
                })
        }

        this.delete = function(doc) {
            database.get(doc._id)
                .then(function(d){
                    database.remove(d);
                    $rootScope.$broadcast("$pouchDB:delete", doc);
                })
        }

        this.get = function(documentId) {
            return database.get(documentId);
        }

        this.destroy = function() {
            database.destroy();
        }
        
        return this;
    }

})();
