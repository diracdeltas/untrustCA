#!/usr/bin/env python

# Script to automatically untrust all the built-in Firefox root CA's.
# XXX: Doesn't work yet.

import sys
import urllib2
import re
import subprocess


FF_URL = 'https://mxr.mozilla.org/mozilla/source/security/nss/lib/ckfw/builtins/certdata.txt?raw=1F'


def get_CA_names():
    try:
        f = urllib2.urlopen(FF_URL)
    except:
        sys.stderr.write("Could not open %s" % FF_URL)
        sys.exit(1)
    pattern = r'(?:# Certificate )"([^"]*)"'
    for line in f:
        m = re.search(pattern, line)
        if m:
            yield m.group(1)


def revoke_trust():
    for name in get_CA_names():
        try:
            print name
            # TODO: This subprocess call needs a valid cert file as input.
            subprocess.call(['certutil', '-A', '-n', name,
                             '-t', ',,', '-d', PROFILEDIR])
        except OSError:
            sys.stderr.write("Could not edit FF cert file; is libnss3-tools installed?\n")
            sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) == 2:
        PROFILEDIR = sys.argv[1]
        revoke_trust()
    else:
        sys.stderr.write("usage: untrustFF.py path/to/FF_Profile_Directory\n")
        sys.exit(1)
