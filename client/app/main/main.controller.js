'use strict';
(function() {

class MainController {
  constructor($scope, $http, socket) {
    this.$scope = $scope;
    this.$http = $http;
    this.socket = socket;

    this.getThings();

    this.$scope.$on('$destroy', this.destroy);
  }

  getThings() {
    this.$http.get('/api/things').then((response) => {
      this.awesomeThings = response.data;
      this.socket.syncUpdates('thing', self.awesomeThings);
    });
  }

  addThing() {
    if (this.newThing === '') {
      return;
    }
    this.$http.post('/api/things', { name: this.newThing });
    this.newThing = '';
  }

  deleteThing(thing) {
    this.$http.delete('/api/things/' + thing._id);
  }

  destroy() {
    return () => {
      this.socket.unsyncUpdates('thing');
    }
  }
}

MainController.$inject = ['$scope', '$http', 'socket'];

angular.module('fullstackApp')
  .controller('MainController', MainController);

})();
