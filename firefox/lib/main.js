/**
 * Initiates custom cert manager.
 * @author yan yan@mit.edu
 */

'use strict';

const { Cc, Ci, Cr, Cu } = require('chrome');
const observer = require('./observer');
const events = require('sdk/system/events');

const nsIXC = Ci.nsIX509Cert;
const nsINCC = Ci.nsINSSCertCache;
const nsIDB = Ci.nsIX509CertDB;

const CA_TYPE = nsIXC.CA_CERT;
const UNTRUSTED = nsIDB.UNTRUSTED;
const TRUSTED_SSL = nsIDB.TRUSTED_SSL;


/** @type Ci.nsIX509CertDB */
let certDB = Cc['@mozilla.org/security/x509certdb;1'].
  getService(nsIDB);

/** @type Ci.nsINssCertCache */
let certCache = Cc['@mozilla.org/security/nsscertcache;1'].
    createInstance(nsINCC);

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
 * @param {Ci.nsIX509Cert} cert
 * @public
 */
function trustCert(cert) {
  certDB.setCertTrust(cert, CA_TYPE, TRUSTED_SSL);
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
