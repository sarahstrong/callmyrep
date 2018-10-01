// Based on https://represent.opennorth.ca/demo/

var representativeTemplate = _.template(
      '<div class="col-xs-6 col-sm-4 col-md-4 representative">' +
        '<div class="avatar" style="<% if (rep.photo_url) { %>background-image: url(<%= rep.photo_url %>), url(../assets/Missing_avatar.svg)<% } %>"></div> ' +
        '<p><% if (rep.party_name) { %><%= rep.party_name %><% } %> <%= rep.elected_office %> ' +
        '<strong><% if (rep.url) { %><a href="<%= rep.url %>"><%= rep.name %></a><% } else { %><%= rep.name %><% } %></strong></p> ' +
        '<p class="district-name"><%= rep.district_name %></p>' +
        '<p><% if (rep.email) { %><a href="mailto:<%= rep.email %>"> Email <%= rep.first_name %></a><% } %></p> ' +
        '<% if (rep.offices) { %>' +
          '<% for (var i = 0; i < rep.offices.length; ++i) { %>' +
            '<p><% if (rep.offices[i].tel) { %><a href="tel:<%= rep.offices[i].tel %>">' +
            '<% if (rep.offices[i].type) { %>' +
              'Call <%= rep.first_name %> on their <%= rep.offices[i].type %> line<% } %>' +
            '<% } else { %>' +
              'Call <%= rep.first_name %>' +
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
    var $row = $('<div class="row">');
    $representatives.append($row);

    $.each(representatives, function (i, object) {
      if (isElected(object)) {
        $row.append($(representativeTemplate({rep: object})));
      }
    });
    $row.append('</div>');


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
