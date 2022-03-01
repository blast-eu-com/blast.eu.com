#!../bin/python3
# -*- coding:utf-8 -*-
"""
   Copyright 2022 Jerome DE LUCCHI

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
"""

import os
import sys
import argparse
from cryptography.fernet import Fernet

ARGPARSER = argparse.ArgumentParser()
ARGPARSER.add_argument("--user", help="username to be added into the environment of the blast user running process")
ARGPARSER.add_argument("--password", help="username password to be added into the environment")
ARGS = ARGPARSER.parse_args()

USER = ARGS.user if ARGS.user else sys.exit("You must provide the --user value")
PASSWORD = bytes(ARGS.password, 'UTF-8') if ARGS.password else sys.exit("You must provide the --password value")
CURRENT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
KEYSTORE_FILE = os.path.join(CURRENT_PATH, '.keystore')

if not os.path.isfile(KEYSTORE_FILE):
    CRYPTO_KEY = Fernet.generate_key()
    with open(KEYSTORE_FILE, 'w') as f:
        f.write(CRYPTO_KEY.decode('UTF-8'))
else:
    with open(KEYSTORE_FILE, 'r') as f:
        CRYPTO_KEY = bytes(f.readline(), 'UTF-8')

FERNET = Fernet(CRYPTO_KEY)
PASSWORD = FERNET.encrypt(PASSWORD)

def main():
    cmd = os.path.join(CURRENT_PATH, "builder") + "/build_elastic_auth.sh " + USER + " " + PASSWORD.decode('UTF-8')
    r = os.popen(cmd).read()

if __name__ == "__main__":
    main()