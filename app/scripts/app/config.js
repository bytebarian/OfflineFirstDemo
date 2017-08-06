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
        
        pouchDB.startListening();
        
        $rootScope.$on("$pouchDB:change", function(event, data){
            activate();
        });
        
        $rootScope.$on("$pouchDB:delete", function(event, data){
            activate();
        });

		activate();

		/**
		 * Initialize sample controller data.
		 */
		function activate() {
			// Fill sample tasks
            console.log("get all documents");
            pouchDB.allDocs().then(function(result){
                result.rows.forEach(addToTasks);
                console.log(todo.tasks);
                refreshTasks();
            })
		}
        
        function addToTasks(item, index){
            todo.tasks.push(item.doc);
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
		}

        /**
         * update completed state of the given task
         */
        function updateTask(task){
            console.log(task);
            pouchDB.save(task)
              .then(activate)
              .catch(error);
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
                  .then(activate)
                  .catch(error);
			}
		}

		/**
		 * Show or hide completed tasks.
		 */
		function toggleCompletedTasks() {
			todo.showCompleted = !todo.showCompleted;
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

        this.save = function(jsonDocument) {
            var deferred = $q.defer();
            if(!jsonDocument._id) {
                database.post(jsonDocument).then(function(response) {
                    deferred.resolve(response);
                }).catch(function(error) {
                    deferred.reject(error);
                });
            } else {
                database.put(jsonDocument).then(function(response) {
                    deferred.resolve(response);
                }).catch(function(error) {
                    deferred.reject(error);
                });
            }
            return deferred.promise;
        }

        this.delete = function(documentId, documentRevision) {
            return database.remove(documentId, documentRevision);
        }

        this.get = function(documentId) {
            return database.get(documentId);
        }
        
        this.allDocs = function(){
            return database.allDocs({include_docs: true, attachments: true});
        }

        this.destroy = function() {
            database.destroy();
        }
        
        return this;
    }

})();
