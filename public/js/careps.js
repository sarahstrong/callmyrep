// Based on https://represent.opennorth.ca/demo/

var representativeTemplate = _.template(
      '<div class="col-xs-6 col-sm-4 col-md-2 representative">' +
        '<div class="avatar" style="<% if (photo_url) { %>background-image: url(<%= photo_url %><% } %>)"></div> ' +
        '<p><% if (party_name) { %><%= party_name %><% } %> <%= elected_office %> ' +
        '<strong><% if (url) { %><a href="<%= url %>"><%= name %></a><% } else { %><%= name %><% } %></strong></p> ' +
        '<p class="district-name"><%= district_name %></p>' +
        '<p><% if (email) { %><a href="mailto:<%= email %>"> Email <%= first_name %></a><% } %></p> ' +
        '<% if (offices) { %>' +
          '<% for (var i = 0; i < offices.length; ++i) { %>' +
            '<p><% if (offices[i].tel) { %><a href="tel:<%= offices[i].tel %>">' +
            '<% if (offices[i].type) { %>' +
              'Call <%= first_name %> on their <%= offices[i].type %> line<% } %>' +
            '<% } else { %>' +
              'Call <%= first_name %>' +
            '<% } %></a></p>' +
          '<% } %>' +
        '<% } %>' +
      '</div>'
    );

function isElected(repObj) {
  return repObj['elected_office'] && repObj['related']['representative_set_url'].indexOf('/campaign-set-') === -1;
}

function getReps(lat, lon) {

  url = 'https://represent.opennorth.ca/representatives/?limit=0&point=' + lat + ',' + lon;

  $.ajax({dataType: 'json', url: url}).then(function (response) {

    var representatives = response.objects.slice();

    if (representatives.length === 0) {
      $('#no-results').fadeIn('slow');
    }

    var $representatives = $('<div id="representatives"></div>');
    var $row = $('<div class="row"></div>');
    $representatives.append($row);

    $.each(representatives, function (i, object) {
      if (isElected(object)) {
        $row.append($(representativeTemplate(object)));
      }
    });

    $('#representatives').replaceWith($representatives);
  });
}

$(function ($) {
  const urlParams = new URLSearchParams(window.location.search);
  const lat = urlParams.get('lat');
  const lon = urlParams.get('lon');
  if (!lat || !lon) {
    $('#no-results').fadeIn('slow');
  } else {
    getReps(lat, lon);
  };
});
