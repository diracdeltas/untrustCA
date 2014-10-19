/**
 * UI module for the addon.
 * @author yan yan@mit.edu
 */

'use strict';

const { Toolbar } = require('sdk/ui/toolbar');
const { Frame } = require('sdk/ui/frame');
const main = require('main');

let frame = new Frame({
  url: './frame.html',
  name: 'mainframe',
  onMessage: (e) => {
    console.log('got response', e.data);
    main.trustCert(e.data.certId);
  }
});

let toolbar = Toolbar({
  title: 'Untrust CA',
  items: [frame]
});

exports.frame = frame;
exports.toolbar = toolbar;
