window.addEventListener('message', function(msg) {
  $('#textDiv').text('This site uses root CA: ' + msg.data.result);
  $('#acceptButton').click(function() {
    msg.source.postMessage({certId: msg.data.certId}, msg.origin);
  });
}, true);

$(document).ready(function() {
  $('#detailsDiv').hide();
  $('#detailsButton').click(function() { $('#detailsDiv').show(); });
});
