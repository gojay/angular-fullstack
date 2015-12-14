(() => {
  'use strict';

  class HomeCtrl {
    constructor($scope, $http, socket) {
      this.$scope = $scope;
      this.$http = $http;
      this.socket = socket;

      this._getThings();

      this.$scope.$on('$destroy', this.destroy());
    }

    _getThings() {
      this.$http.get('/api/things').then((response) => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
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

  HomeCtrl.$inject = ['$scope', '$http', 'socket'];

  angular.module('app.guest')
    .controller('HomeCtrl', HomeCtrl);

})();
