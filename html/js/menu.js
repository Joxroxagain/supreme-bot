var app = angular.module('myApp', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider

  .when('/', {
    templateUrl: 'home.html',
  })

  .when('/about', {
    templateUrl: 'monitor.html',
  })

  .when('/portfolio', {
    template: '<h1>Portfolio</h1>',
  })

  .when('/contact', {
    template: '<h1>Contact</h1>',
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