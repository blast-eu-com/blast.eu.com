#!/usr/bin/env bash
#
#  Copyright 2022 Jerome DE LUCCHI
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

BLAST_ELASTIC_USER="$1"
BLAST_ELASTIC_USER_PWD="$2"
BLAST_SYSTEMCTL_FILE="/lib/systemd/system/backend.blast.eu.com.service"

sed -ri "s/\[Service\]/\[Service\]\nEnvironment=\"BLAST_ELASTIC_USER=${BLAST_ELASTIC_USER}\"/" $BLAST_SYSTEMCTL_FILE
sed -ri "s/\[Service\]/\[Service\]\nEnvironment=\"BLAST_ELASTIC_USER_PWD=${BLAST_ELASTIC_USER_PWD}\"/" $BLAST_SYSTEMCTL_FILE
exit 0
