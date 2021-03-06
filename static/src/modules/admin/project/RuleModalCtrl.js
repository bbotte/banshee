/*@ngInject*/
module.exports = function ($scope, $mdDialog, $stateParams, $translate, toastr, Rule, Util, Config) {
  $scope.isEdit = false;
  $scope.interval = null;

  $scope.loadData = function() {
    // get interval
    Config.getInterval().$promise
      .then(function (res) {
        $scope.interval = res.interval;
        $scope.config = res;
      });
  };

  if(this.rule){
    $scope.isEdit = true;
  }

  $scope.rule = this.rule || {};

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.submit = function() {
    var params = angular.copy($scope.rule);
    if ($scope.isEdit) {
      Rule.update(params).$promise
        .then(function(res) {
          $mdDialog.hide(res);
        })
        .catch(function(err) {
          toastr.error(err.msg);
        });
    } else {
      params.projectId = $stateParams.id;
      Rule.save(params).$promise
        .then(function(res) {
          $mdDialog.hide(res);
          var ruleCheckResult = Util.ruleCheck(res);
          if (ruleCheckResult !== 0) {
            var key = 'ADMIN_RULE_POST_ADD_CHECK_FAILED_TEXT';
            if (ruleCheckResult === 1) {
              key = 'ADMIN_RULE_POST_ADD_CHECK_FAILED_GRAPHITE_NAME_TEXT';
            } else if (ruleCheckResult === 2) {
              key = 'ADMIN_RULE_POST_ADD_CHECK_FAILED_UNSUPPORTED_METRIC_TEXT';
            }
            toastr.warning(
              $translate.instant(key, {'Interval': $scope.interval}),
              {timeOut: 10 * 1000}
            );
          } else {
            toastr.success(
              $translate.instant('ADMIN_RULE_POST_ADD_TEXT', {'Interval': $scope.interval}),
              {timeOut: 10 * 1000}
            );
          }
        })
        .catch(function(err) {
          toastr.error(err.msg);
        });
    }
  };

  $scope.buildRepr = Util.buildRepr;
  $scope.isGraphiteName = Util.isGraphiteName;
  $scope.translateGraphiteName = Util.translateGraphiteName;
  $scope.translateRuleRepr = function(rule) {
    return Util.translateRuleRepr(rule, $scope.config, $translate);
  };
  $scope.loadData();
};
