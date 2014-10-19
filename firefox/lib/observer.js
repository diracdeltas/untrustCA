/**
 * Implements listeners for Firefox internal events.
 * @author yan yan@mit.edu
 */

'use strict';

const { Ci, Cc, Cr } = require('chrome');
const { XMLHttpRequest } = require('sdk/net/xhr');
const { certDB, TOKEN_NAME_ROOT } = require('./constants');
const { frame } = require('./ui');

/**
 * Retrieves SSL cert chain for a channel if verification failed. If
 * verification was successful, returns null.
 * @param {Ci.nsIChannel} channel
 * @return {?Ci.nsIX509CertList|boolean}
 * @private
 */
function getFailedCertChain_(channel) {
  try {
    if (!(channel instanceof Ci.nsIChannel)) {
      return null;
    }

    let secInfo = channel.securityInfo;
    if (secInfo instanceof Ci.nsITransportSecurityInfo) {
      return secInfo.QueryInterface(Ci.nsITransportSecurityInfo).
        failedCertChain;
    } else {
      return false;
    }
  } catch(e) {
    console.error(e);
    return false;
  }
}

/** @type boolean */
let checkingBadCert = {};

/**
 * http-on-examine-response listener
 * @param {Object} event - The event that was fired.
 * @public
 */
exports.onExamineResponse = function(event) {
  let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
  let uri = channel.URI.spec;
  // First try getting the chain directly from nsITransportSecurityInfo
  let certChain = getFailedCertChain_(channel);
  if (certChain) {
    /** @type Ci.nsISimpleEnumerator */
    let certEnum = certChain.getEnumerator();
    while (certEnum.hasMoreElements()) {
      /** @type Ci.nsIX509Cert */
      let cert = certEnum.getNext().QueryInterface(Ci.nsIX509Cert);
      processCert_(cert);
    }
  } else if (certChain === false && !checkingBadCert[uri]) {
    checkingBadCert[uri] = true; // Avoid infinite recursion
    let req = new XMLHttpRequest();
    req.open('GET', uri);
    req.channel.notificationCallbacks = new badCertListener();
    req.onload = req.onerror = function(e) { checkingBadCert[uri] = false; };
    req.send();
  }
};

/**
 * listener for bad cert warnings.
 * @constructor
 */
function badCertListener() {}
badCertListener.prototype = {
  getInterface: function(id) {
    return this.QueryInterface(id);
  },
  QueryInterface: function(id) {
    if (id.equals(Ci.nsIBadCertListener2) ||
        id.equals(Ci.nsIInterfaceRequestor) ||
        id.equals(Ci.nsISupports)) {
      return this;
    }
    throw Cr.NS_ERROR_NO_INTERFACE;
  },
  notifyCertProblem: function(socketInfo, sslStatus, targetHost) {
    if (sslStatus) {
      console.log('got cert problem for host', targetHost);
      /** @type nsIX509Cert */
      let cert = sslStatus.QueryInterface(Ci.nsISSLStatus).serverCert;
      /** @type nsIArray */
      let certChain = cert.getChain();
      for (var i = 0; i < certChain.length; i++) {
        cert = certChain.queryElementAt(i, Ci.nsIX509Cert);
        processCert_(cert);
      }
    }
    return true;
  }
};

/**
 * Process a cert that fails validation.
 * @param {Ci.nsIX509Cert} cert
 * @private
 */
function processCert_(cert) {
  console.log('processCert_', cert.commonName, cert.dbKey);
  /** @type Ci.nsIX509Cert */
  let dbResult = certDB.findCertByDBKey(cert.dbKey, null);
  if (dbResult && dbResult.tokenName === TOKEN_NAME_ROOT) {
    console.log('found cert in DB', dbResult);
    frame.postMessage({result: dbResult.commonName,
                       certId: dbResult.dbKey}, frame.url);
  }
}
