var app = angular.module('myApp', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider

  .when('/', {
    templateUrl: 'home.html',
  })
  .when('/tasks', {
    templateUrl: 'tasks.html',
  })
  .when('/monitors', {
    template: '<h1>monitors</h1>',
  })
  .when('/proxies', {
    template: '<h1>proxies</h1>',
  })
  .when('/billing', {
    template: '<h1>billing</h1>',
  })
  .when('/options', {
    template: '<h1>options</h1>',
  })
  .when('/license', {
    template: '<h1>license</h1>',
  })
//   .otherwise({redirectTo: '/'});
});

// Event listeners
$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
    });

    $('li > a').click(function() {
      $('li').removeClass();
      $(this).parent().addClass('active');
    });

  });