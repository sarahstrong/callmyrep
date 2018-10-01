// Based on https://represent.opennorth.ca/demo/

var representativeTemplate = _.template(
      '<div class="col-xs-6 col-sm-4 col-md-4 representative">' +
        '<div class="avatar" style="<% if (rep.photoUrl) { %>background-image: url(<%= rep.photoUrl %>), url(../assets/Missing_avatar.svg)<% } %>"></div> ' +
        '<p><%= rep.officeName %>, <% if (rep.party) { %><%= rep.party %><% } %></p>' +
        '<p><strong><% if (rep.urls) { %><a href="<%= rep.urls[0] %>"><%= rep.name %></a><% } else { %><%= rep.name %><% } %></strong></p> ' +
        '<p><% if (rep.emails) { %><a href="mailto:<%= rep.emails[0] %>"> Email <%= rep.firstName %></a><% } %></p> ' +
        '<% if (rep.phones) { %><a href="tel:<%= rep.phones[0] %>"> Call <%= rep.firstName %></a><% } %></p> ' +
      '</div>'
    );

function getReps(lat, lon) {

  const url = 'https://us-central1-callmyrepdev.cloudfunctions.net/civicinfo/usreps/' + lat + ',' + lon;

  $.ajax({dataType: 'json', url: url}).then(function (response) {

    if (response.error) {
      $('#no-results').fadeIn('slow');
    }
    var representatives = response.slice();

    if (representatives.length === 0) {
      $('#no-results').fadeIn('slow');
    }

    var $representatives = $('<div id="representatives"></div>');
    var $row = $('<div class="row">');
    $representatives.append($row);

    $.each(representatives, function (i, object) {
      $row.append($(representativeTemplate({rep: object})));
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
