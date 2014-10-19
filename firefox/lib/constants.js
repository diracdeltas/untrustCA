/**
 * Shared constants across modules.
 * @author yan yan@mit.edu
 */

'use strict';

const { Cc, Ci, Cr, Cu } = require('chrome');

/**
 * Aliases for long-ass XPCOM interface names.
 */
exports.nsIXC = Ci.nsIX509Cert;
exports.nsICC = Ci.nsINSSCertCache;
exports.nsIDB = Ci.nsIX509CertDB;

/**
 * Types of certs. We only care about CA_CERT most likely.
 */
exports.CA_TYPE = exports.nsIXC.CA_CERT;

/**
 * Bitmask values for trust state of a cert.
 */
exports.UNTRUSTED = exports.nsIDB.UNTRUSTED;
exports.TRUSTED_SSL = exports.nsIDB.TRUSTED_SSL;

/**
 * Service for working with the browser's X509 cert database.
 */
exports.certDB = Cc['@mozilla.org/security/x509certdb;1'].
  getService(exports.nsIDB);

/**
 * Service for working with various Mozilla internal token types.
 */
exports.tokenDB = Cc['@mozilla.org/security/pk11tokendb;1'].
  getService(Ci.nsIPK11TokenDB);

/**
 * Name of the token type associated with root certs.
 */
exports.TOKEN_NAME_ROOT = 'Builtin Object Token';
