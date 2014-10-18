/**
 * Initiates custom cert manager.
 * @author yan yan@mit.edu
 */

'use strict';

const { Cc, Ci, Cr, Cu } = require('chrome');

const nsIXC = Ci.nsIX509Cert;
const nsINCC = Ci.nsINSSCertCache;
const nsIDB = Ci.nsIX509CertDB;

const CA_TYPE = nsIXC.CA_CERT;
const UNTRUSTED = nsIDB.UNTRUSTED;


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
 * @return {boolean}
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
    console.log('untrusting cert for', cert.commonName, cert.dbKey);
    certDB.setCertTrust(cert, CA_TYPE, UNTRUSTED);
  }
  return true;
}

function main(options) {
  console.log('started up!', options);
  loadCerts();
  untrustCerts();
}

exports.main = main;
