window.addEventListener('message', function(msg) {
  $('#acceptButton').click(function() {
    msg.source.postMessage({certId: msg.data.certId}, msg.origin);
  });
  // TODO: Use templates
  $('#textDiv').text('This site uses builtin root CA: ' + msg.data.name);
  // TODO: Turn this into an ActionButton
  /*
  $('#detailsButton').click(function() {
    window.alert(JSON.stringify(msg.data.details) +
                 '\n' +
                 JSON.stringify(msg.data.validity));
  });
 */
}, true);

$(document).ready(function() {
  $('#detailsDiv').hide();
});
