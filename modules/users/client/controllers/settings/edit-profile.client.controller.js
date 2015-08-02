/*jshint unused: false*/
'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$timeout', '$window',
                                                             'Authentication', 'Users', 'FileUploader',
  function($scope, $http, $timeout, $window, Authentication, Users, FileUploader) {
    $scope.user = Authentication.user;

    // Create file uploader instance.
    $scope.uploader = new FileUploader({
      url: 'api/settings/picture'
    });

    // Set file uploader image filter.
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function(item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';

        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file.
    $scope.uploader.onAfterAddingFile = function(fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function(fileReaderEvent) {
          $timeout(function() {
            $scope.imageUrl = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture.
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
      // Show success message.
      $scope.successUpload = true;

      // Populate user object.
      $scope.user = Authentication.user = response;

      // Clear upload buttons.
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture.
    $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
      // Clear upload buttons.
      $scope.cancelUpload();

      // Show error message.
      $scope.errorUpload = response.message;
    };

    // Change user profile picture.
    $scope.uploadProfilePicture = function() {
      // Clear messages.
      $scope.successUpload = $scope.errorUpload = null;

      // Start upload.
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process.
    $scope.cancelUpload = function() {
      $scope.uploader.clearQueue();
      $scope.imageUrl = $scope.user.imageUrl;
    };

    // Update a user profile.
    $scope.updateUserProfile = function(isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;

        var user = new Users($scope.user);

        $http.post('api/settings/profile', user).success(function(response) {
          $scope.success = true;
          Authentication.user = response;
        }).error(function(response) {
          $scope.error = response.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
  }
]);
