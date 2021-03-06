/**
 * Initiates custom cert manager.
 * @author yan yan@mit.edu
 */

'use strict';

const { Cc, Ci, Cr, Cu } = require('chrome');
const observer = require('./observer');
const events = require('sdk/system/events');
const { CA_TYPE, UNTRUSTED, TRUSTED_SSL, certDB, nsIXC, nsICC, nsIDB } =
  require('./constants');
const { frame } = require('./ui');

/** @type Ci.nsINssCertCache */
let certCache = Cc['@mozilla.org/security/nsscertcache;1'].
    createInstance(nsICC);

/**
 * Load all the CA certs from the active Firefox profile into a cache.
 * @public
 */
function loadCerts() {
  certCache.cacheAllCerts();
}

/**
 * Untrust all the root CA certs.
 * @public
 */
function untrustCerts() {
  /** @type Ci.nsIX509CertList */
  let certList = certCache.getX509CachedCerts();
  /** @type Ci.nsISimpleEnumerator */
  let certEnum = certList.getEnumerator();
  while (certEnum.hasMoreElements()) {
    /** @type Ci.nsIX09Cert */
    let cert = certEnum.getNext().QueryInterface(nsIXC);
    console.log('untrusting cert for', cert.commonName);
    // TODO: Only unset TRUSTED_SSL bits?
    certDB.setCertTrust(cert, CA_TYPE, UNTRUSTED);
  }
}

/**
 * Trust a single root CA.
 * @param {string} certId
 * @public
 */
function trustCert(certId) {
  let cert = certDB.findCertByDBKey(certId, null);
  certDB.setCertTrust(cert, CA_TYPE, TRUSTED_SSL);
  console.log('trusted:', cert.commonName);
}

/**
 * Attach Firefox API event listeners.
 * @private
 */
function loadObservers_() {
  events.on('http-on-examine-response', observer.onExamineResponse);
}

/**
 * Detach Firefox API event listeners.
 * @private
 */
function unloadObservers_() {
  events.on('http-on-examine-response', observer.onExamineResponse);
}

function main(options) {
  console.log('started up!', options);
  loadCerts();
  loadObservers_();
  if (options.loadReason === 'install') {
    untrustCerts();
  }
}

function unload() {
  console.log('unloading');
  unloadObservers_();
}

exports.main = main;
exports.onUnload = unload;
exports.trustCert = trustCert;
