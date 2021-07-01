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
${BUILDER_PATH}/build_db_script_lang.py

# BUILD PORTMAP
${BUILDER_PATH}/build_db_port_map.py

# BUILD ACCOUNT
${BUILDER_PATH}/build_db_account.py

# BUILD INFRASTRUCTURE
${BUILDER_PATH}/build_db_infrastructure.py

# BUILD CLUSTER
${BUILDER_PATH}/build_db_cluster.py

# BUILD NODE
${BUILDER_PATH}/build_db_node.py

# BUILD NODE TYPES
${BUILDER_PATH}/build_db_node_type.py

# BUILD NODE MODE
${BUILDER_PATH}/build_db_node_mode.py

# BUILD STATISTIC
${BUILDER_PATH}/build_db_statistic.py

# BUILD SCHEDULER
${BUILDER_PATH}/build_db_scheduler.py

# BUILD SCENARIO
${BUILDER_PATH}/build_db_scenario.py

# BUILD REPORT
${BUILDER_PATH}/build_db_report.py