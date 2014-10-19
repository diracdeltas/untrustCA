/**
 * UI module for the addon.
 * @author yan yan@mit.edu
 */

'use strict';

const { Toolbar } = require('sdk/ui/toolbar');
const { Frame } = require('sdk/ui/frame');

let frame = new Frame({
  url: './frame.html',
  name: 'mainframe'
});

let toolbar = Toolbar({
  title: 'Untrust CA',
  items: [frame]
});

exports.frame = frame;
exports.toolbar = toolbar;
