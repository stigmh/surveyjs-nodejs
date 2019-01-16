function getParams() {
  var url = window.location.href
    .slice(window.location.href.indexOf("?") + 1)
    .split("&");
  var result = {};
  url.forEach(function(item) {
    var param = item.split("=");
    result[param[0]] = param[1];
  });
  return result;
}

function init() {
  Survey.dxSurveyService.serviceUrl = "";

  var css = {
    root: "sv_main sv_frame sv_default_css"
  };

  var surveyId = decodeURI(getParams()["id"]);
  var model = new Survey.Model({ surveyId: surveyId, surveyPostId: surveyId });
  model.css = css;
  window.survey = model;
  model.render("surveyElement");
}

init();
