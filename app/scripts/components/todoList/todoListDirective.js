(function(){

	angular
		.module('app')
		.directive('todoList', todoList);

	function todoList() {

		var directive = {
			scope: {
				tasks: "=",
				updateTask: "&",
                deleteTask: "&"
			},
            controller: function($scope){
                $scope.update = function(task){
                    if($scope.updateTask){
                        $scope.updateTask({task: task});
                    }                 
                };
                $scope.delete = function(task){
                    if($scope.deleteTask){
                        $scope.deleteTask({task: task});
                    }  
                };
            },
			templateUrl: 'scripts/components/todoList/todoListView.html',
			restrict: 'E'
		}

		return directive;
	}

})();
