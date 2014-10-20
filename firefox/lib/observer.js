/**
 * Implements listeners for Firefox internal events.
 * @author yan yan@mit.edu
 */

'use strict';

const { Ci } = require('chrome');
const { XMLHttpRequest } = require('sdk/net/xhr');
const { certDB, TOKEN_NAME_ROOT } = require('./constants');
const { frame } = require('./ui');
const { BadCertListener } = require('./badCertListener');

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

/** @type Object */
let checkingBadCert_ = {};

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
      processCert(cert);
    }
  } else if (certChain === false && !checkingBadCert_[uri]) {
    checkingBadCert_[uri] = true; // Avoid infinite recursion
    let req = new XMLHttpRequest();
    req.open('GET', uri);
    req.channel.notificationCallbacks = new BadCertListener();
    req.onload = req.onerror = function(e) { checkingBadCert_[uri] = false; };
    req.send();
  }
};

/**
 * Process a cert that fails validation.
 * @param {Ci.nsIX509Cert} cert
 */
exports.processCert = function processCert(cert) {
  console.log('processCert', cert.commonName, cert.dbKey);
  /** @type Ci.nsIX509Cert */
  let dbResult = certDB.findCertByDBKey(cert.dbKey, null);
  if (dbResult && dbResult.tokenName === TOKEN_NAME_ROOT) {
    console.log('found cert in DB', dbResult);
    let prettyCert = new PrettyCert(cert);
    frame.postMessage({
      name: dbResult.commonName,
      certId: dbResult.dbKey,
      details: prettyCert.details,
      validity: prettyCert.validity
    }, frame.url);
  }
}


/**
 * representation of an nsIX509Cert for passing to an HTML template.
 * @param {Ci.nsIX509Cert} cert
 * @constructor
 */
function PrettyCert(cert) {
  this.original = cert;
  this.details = {};
  this.validity = {
    startGMT: null,
    endGMT: null
  };
  this.init_(cert);
}

PrettyCert.prototype.STATIC_ELEMENTS = [
  'subjectName',
  'organization',
  'sha256Fingerprint',
  'sha1Fingerprint',
  'issuerName',
  'issuerOrganization',
  'sha256SubjectPublicKeyInfoDigest'
];

PrettyCert.prototype.init_ = function(cert) {
  let _this = this;
  this.STATIC_ELEMENTS.forEach(function(elem) {
    _this.details[elem] = _this.original[elem];
  });

  this.validity.startGMT = this.original.validity.notBeforeGMT;
  this.validity.endGMT = this.original.validity.notAfterGMT;
};
