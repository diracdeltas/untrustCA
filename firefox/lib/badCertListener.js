/**
 * Implements a listener for bad cert warnings.
 * @author yan yan@mit.edu
 */

'use strict';

const { Ci, Cc, Cr } = require('chrome');
const observer = require('./observer');

/**
 * listener for bad cert warnings.
 * @constructor
 */
function BadCertListener() {}

/**
 * getInterface impl for BadCertListener.
 * @param {string} id - The ID of the requested interface.
 * @return {Object}
 */
BadCertListener.prototype.getInterface = function(id) {
  return this.QueryInterface(id);
};

/**
 * QueryInterface impl for BadCertListener.
 * @param {string} id - The ID of the requested interface.
 * @return {Object}
 */
BadCertListener.prototype.QueryInterface = function(id) {
  if (id.equals(Ci.nsIBadCertListener2) ||
      id.equals(Ci.nsIInterfaceRequestor) ||
      id.equals(Ci.nsISupports)) {
    return this;
  }
  throw Cr.NS_ERROR_NO_INTERFACE;
};

/**
 * Notifies of a cert problem.
 * @param {Ci.nsIInterfaceRequestor} socketInfo - Network communication
 *  that can be used to obtain more info about the active connection.
 * @param {Ci.nsISSLStatus} sslStatus - Status of the SSL connection.
 * @param {string} targetHost - The host that opened the connection.
 * @return {boolean} - Whether to supress cert warnings to the user.
 */
BadCertListener.prototype.notifyCertProblem =
  function(socketInfo, sslStatus, targetHost) {
  if (sslStatus) {
    console.log('got cert problem for host', targetHost);
    /** @type Ci.nsIX509Cert */
    let cert = sslStatus.QueryInterface(Ci.nsISSLStatus).serverCert;
    /** @type Ci.nsIArray */
    let certChain = cert.getChain();
    for (var i = 0; i < certChain.length; i++) {
      cert = certChain.queryElementAt(i, Ci.nsIX509Cert);
      observer.processCert(cert);
    }
  }
  return true;
};

exports.BadCertListener = BadCertListener;
