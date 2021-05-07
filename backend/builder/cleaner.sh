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
# DELETE SCHEDULER
curl -s -XDELETE http://localhost:9200/scheduler
curl -s -XDELETE http://localhost:9200/_template/scheduler

# DELETE STATISTIC
curl -s -XDELETE http://localhost:9200/statistic
curl -s -XDELETE http://localhost:9200/_template/statistic

# DELETE ACCOUNT
curl -s -XDELETE http://localhost:9200/account
curl -s -XDELETE http://localhost:9200/_template/account

# DELETE CLUSTER
curl -s -XDELETE http://localhost:9200/cluster
curl -s -XDELETE http://localhost:9200/_template/cluster

# DELETE INFRASTRUCTURE
curl -s -XDELETE http://localhost:9200/infrastructure
curl -s -XDELETE http://localhost:9200/_template/infrastructure

# DELETE SCRIPT
curl -s -XDELETE http://localhost:9200/script
curl -s -XDELETE http://localhost:9200/_template/script

# DELETE SCRIPTLANG
curl -s -XDELETE http://localhost:9200/scriptlang
curl -s -XDELETE http://localhost:9200/_template/scriptlang

# DELETE SETTING
curl -s -XDELETE http://localhost:9200/setting
curl -s -XDELETE http://localhost:9200/_template/setting

# DELETE MAPPING
curl -s -XDELETE http://localhost:9200/portmap
curl -s -XDELETE http://localhost:9200/_template/portmap

# DELETE REALM
curl -s -XDELETE http://localhost:9200/realm
curl -s -XDELETE http://localhost:9200/_template/realm

# DELETE NODE
curl -s -XDELETE http://localhost:9200/node
curl -s -XDELETE http://localhost:9200/_template/node

# DELETE SCENARIO
curl -s -XDELETE http://localhost:9200/scenario
curl -s -XDELETE http://localhost:9200/_template/scenario

# DELETE REPORT
curl -s -XDELETE http://localhost:9200/report
curl -s -XDELETE http://localhost:9200/_template/report