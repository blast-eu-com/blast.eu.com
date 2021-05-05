#!/usr/bin/env bash
#
#  Copyright 2020 Jerome DE LUCCHI
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
BUILDER_PATH=$(dirname $0)

# BUILD REALM
${BUILDER_PATH}/build_db_realm.py

# BUILD SETTING
${BUILDER_PATH}/build_db_settings.py

# BUILD SCRIPT
${BUILDER_PATH}/build_db_script.py

# BUILD SCRIPT LANG
${BUILDER_PATH}/build_db_scriptlang.py

# BUILD PORTMAP
${BUILDER_PATH}/build_db_portmap.py

# BUILD ACCOUNT
${BUILDER_PATH}/build_db_account.py

# BUILD INFRASTRUCTURE
${BUILDER_PATH}/build_db_infrastructure.py

# BUILD CLUSTER
${BUILDER_PATH}/build_db_cluster.py

# BUILD NODE
${BUILDER_PATH}/build_db_node.py

# BUILD STATISTIC
${BUILDER_PATH}/build_db_statistic.py

# BUILD MANAGEMENT
${BUILDER_PATH}/build_db_managementsce.py

# BUILD MANAGEMENT
${BUILDER_PATH}/build_db_managementsch.py

# BUILD MANAGEMENT
${BUILDER_PATH}/build_db_managementscr.py

# BUILD REALM
${BUILDER_PATH}/build_db_scheduler.py
