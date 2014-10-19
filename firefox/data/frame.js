window.addEventListener('message', function(event) {
  document.getElementById('textDiv').textContent = 'This site uses root CA: ' +
    event.data.result;
});
