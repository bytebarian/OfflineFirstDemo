(function() {

	angular
		.module('app', ['ngMaterial', 'ngAnimate'])
        .config(['$mdThemingProvider', '$httpProvider', configure])  
        .factory("pouchDB", ["$rootScope", "$q", PouchDBService])
        .run(function(pouchDB) {
            pouchDB.setDatabase("todos");
            pouchDB.sync("http://127.0.0.1:5984/todos");
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
		todo.incompleteTasks = [];
		todo.completedTasks = [];
		todo.addTask = addTask;
		todo.inputTask = "";
		todo.refreshTasks = refreshTasks;
        todo.updateTask = updateTask;
		todo.showCompleted = false;
		todo.toggleCompletedTasks = toggleCompletedTasks;
        todo.username = "";
        todo.password = "";
        
        pouchDB.startListening();
        
        $rootScope.$on("$pouchDB:change", function(event, data){
            tryAddTask(data.doc);
            refreshTasks();
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
                username = todo.username,
                password = todo.password
            };
            
            this.http.post('http://localhost:3000/auth/login', JSON.stringify(credentials), {headers: headers})
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

        this.setDatabase = function(databaseName) {
            database = new PouchDB(databaseName);
        }

        this.startListening = function() {
            changeListener = database.changes({
                live: true,
                include_docs: true
            }).on("change", function(change) {
                if(!change.deleted) {
                    $rootScope.$broadcast("$pouchDB:change", change);
                } else {
                    $rootScope.$broadcast("$pouchDB:delete", change);
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
                        })
                    })
                })
        }

        this.delete = function(documentId, documentRevision) {
            return database.remove(documentId, documentRevision);
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
