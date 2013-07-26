#!/usr/bin/env python

# Script to untrust all the built-in Firefox root CA's.
# Usage: python untrustFF.py [path to FF profile directory]
# If the FF directory is unspecified, this will default to
# ~/.mozilla/firefox/*default

import os
import sys
import glob
import urllib2
import re

if len(sys.argv) > 1:
    PROFILEDIR = sys.argv[1]
else:
    defaults = glob.glob(os.path.expanduser("~/.mozilla/firefox/*default"))
    if len(defaults) == 1:
        PROFILEDIR = defaults[0]
        sys.stderr.write("using default Firefox profile %s\n" % PROFILEDIR)
    else:
        sys.stderr.write("must specify a Firefox profile directory\n")
        sys.exit(1)

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


