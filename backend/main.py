# -*- coding:utf-8 -*-
"""
   Copyright 2020 Jerome DE LUCCHI

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
import re
import sys
import json
import threading
import yaml
from flask_cors import CORS
from flask import Flask, request, Response
from api.db import ESConnector
from api.aaa import Account, Realm
from api.script import Script
from api.scriptlang import Scriptlang
from api.cluster import Cluster
from api.gsearch import Gsearch
from api.node import Node
from api.nodemode import NodeMode
from api.infra import Infra
from api.reporter import Reporter
from api.scenario import Scenario
from api.setting import Setting, Portmap
from api.scheduler import Scheduler
from api.tree import realm_infrastructure_tree

ES = ESConnector().es
app = Flask(__name__, static_url_path='/static')
CORS(app)


try:
    f = open("/etc/blast.eu.com/backend.yml", 'r')
    data = yaml.load(f, Loader=yaml.FullLoader)
    f.close()
    SCHEDULER_EMAIL = data["scheduler"]["user"]["email"]

except FileNotFoundError:
    print("The server config /etc/blast.eu.com/backend.yml is missing.")
    sys.exit(1)

except KeyError:
    # set default scheduler email to scheduler@localhost.localdomain
    SCHEDULER_EMAIL = "scheduler@localhost.localdomain"


@app.before_request
def jwtrequired():

    """ this function is called before processing any request to check the jwt
        except if the request trigger the login endpoint """
    account = Account(ES)
    if request.path in ["/api/v1/aaa/accounts/authenticate", "/api/v1/aaa/accounts"]:
        return None
    elif re.match(r'/api/v1/aaa/accounts/profile', request.path) and request.method == "GET":
        account_email = request.args.get('email')
    else:
        account_email = json.loads(request.cookies.get('account'))["email"]
    token = request.headers['AUTHORIZATION'].split()[1]
    return None if account.is_valid_token(account_email, token) else Response(json.dumps({"tokenExpired": True}))

# * *********************************************************************************************************
# *
# * AAA PART -*- AAA PART -*- AAA PART -*- AAA PART -*- AAA PART -*- AAA PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/aaa/accounts', methods=["POST"])
def aaa_account_add():
    """ this function add a new account using the aaa endpoint """
    account = Account(ES)
    return Response(json.dumps(account.__add__(request.get_json())))

@app.route('/api/v1/aaa/accounts', methods=["GET"])
def aaa_account_list(ids):
    """ this function list all the account """
    account = Account(ES)
    return Response(json.dumps(account.__list__()))

@app.route('/api/v1/aaa/accounts/<ids>', methods=["GET"])
def aaa_account_list_by_id(ids):
    """ this function returns the details of the account with id """
    account = Account(ES)
    return Response(json.dumps(account.list_by_ids(ids.split(','))))

@app.route('/api/v1/aaa/accounts/<id>', methods=["PUT"])
def aaa_account_update(id):
    """ this function update an existing account used for profile details """
    account = Account(ES)
    account_profile_picture = request.form["account_profile_picture"] \
        if "account_profile_picture" in request.form.keys() else request.files["account_profile_picture"]

    account_data = {
        "web_server_path": request.form["web_server_path"],
        "account_picture": account_profile_picture,
        "account_first_name": request.form["account_profile_first_name"],
        "account_family_name": request.form["account_profile_family_name"],
        "account_email": request.form["account_profile_email"]
    }
    return Response(json.dumps(account.update_profile(id, account_data)))

@app.route('/api/v1/aaa/accounts/<ids>', methods=["DELETE"])
def aaa_account_delete(ids):
    """ this function remove an existing account using the aaa endpoint """
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    account_ids = [id.replace("id=", "") for id in ids.split("&")]
    return Response(json.dumps(account.__delete__(account_email, account_ids)))

@app.route('/api/v1/aaa/accounts/authenticate', methods=["POST"])
def aaa_login():
    """ this function login an account """
    account = Account(ES)
    account_email = request.get_json()["email"]
    account_password = request.get_json()["password"]
    return Response(json.dumps(account.authenticate(account_email, account_password)))

@app.route('/api/v1/aaa/accounts/profile', methods=["GET"])
def aaa_load_profile():
    """ this function load the account which will be used as cookie """
    account = Account(ES)
    return Response(json.dumps(account.load_account_profile(request.args.get("email"))))

@app.route('/api/v1/aaa/accounts/realms/<realm>', methods=["POST"])
def aaa_account_activate_realm(realm):
    """ this function activate an account realm """
    account = Account(ES)
    realms = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(account.activate_realm(account_email, realm)))

@app.route('/api/v1/realms/<realm>/accounts', methods=["GET"])
def aaa_account_list_by_realm(realm):
    """ this function return the account by given realm """
    account = Account(ES)
    return Response(json.dumps(account.list_by_realm(realm)))

# * *********************************************************************************************************
# *
# * ANSIBLE PART -*- ANSIBLE PART -*- ANSIBLE PART -*- ANSIBLE PART -*- ANSIBLE PART -*- ANSIBLE PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/scripts', methods=['POST'])
def script_add(realm):
    """ this function add a new ansible playbook """
    script = Script(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    # Build script name based on the script filename
    if len(request.form["script_file_name"].split('.')[:-1]) <= 1:
        script_name = request.form["script_file_name"].split('.')[0]
    else:
        script_name = '.'.join(request.form["script_file_name"].split('.')[:-1])

    data = {
        "account_email": account_email,
        "script_description": request.form["script_description"],
        "script_file_data": request.files["script_file_data"],
        "script_file_name": request.form["script_file_name"],
        "script_name": script_name,
        "script_args": request.form["script_args"],
        "script_shareable": request.form["script_shareable"],
        "script_shareable_realms": request.form["script_shareable_realms"],
        "script_type": request.form["script_type"]
    }

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(script.__add__(realm, data)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scripts', methods=['DELETE'])
def script_delete(realm):
    """ this function delete one script identify by given id from the given realm """
    script = Script(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    script_ids = request.get_json()["script_ids"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(script.__delete__(realm, script_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scripts', methods=['GET'])
def script_list(realm):
    """ this function returns all scripts """
    script = Script(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(script.__list__(realm)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scripts/<ids>', methods=["GET"])
def script_list_by_ids(realm, ids):
    """ this function returns the script for the given id """
    script = Script(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    script_ids = [id.replace("id=", "") for id in ids.split('&')]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(script.list_by_ids(realm, script_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scripts/name/<names>', methods=["GET"])
def script_list_by_names(realm, names):
    """ this function returns the script for the given name """
    script = Script(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    script_names = [name.replace("name=", "") for name in names.split('&')]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(script.list_by_names(realm, script_names)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scripts/roles/<roles>', methods=["GET"])
def script_list_by_roles(realm, roles):
    """ this function returns the script for the given roles """
    script = Script(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    script_roles = [role.replace("role=", "") for role in roles.split('&')]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(script.list_by_roles(realm, script_roles)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/scripts/langs', methods=["GET"])
def script_list_langs():
    scriptlang = Scriptlang(ES)
    return Response(json.dumps(scriptlang.__list__()))

# * *********************************************************************************************************
# *
# * CLUSTER PART -*- CLUSTER PART -*- CLUSTER PART -*- CLUSTER PART -*- CLUSTER PART -*- CLUSTER PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/clusters', methods=['GET'])
def cluster_list(realm):
    """ this function returns all the registered cluster """
    cluster = Cluster(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(cluster.__list__(realm)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/clusters', methods=['POST'])
def cluster_add(realm):
    """ this function add a cluster reference """
    cluster = Cluster(ES)
    account = Account(ES)
    clusters = request.get_json()["clusters"]
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(cluster.__add__(account_email, realm, clusters)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/clusters', methods=["PUT"])
def cluster_update(realm):
    """ This function update one or more clusters """
    cluster = Cluster(ES)
    account = Account(ES)
    clusters = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(cluster.update(account_email, realm, clusters)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/clusters', methods=['DELETE'])
def cluster_delete(realm):
    """ this function delete a cluster reference """
    cluster = Cluster(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    cluster_ids = request.get_json()["cluster_ids"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(cluster.__delete__(account_email, realm, cluster_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/clusters/ids', methods=['GET'])
def cluster_list_by_ids(realm):
    """ this function returns the doc matching the cluster id """

    cluster = Cluster(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    cluster_ids = request.args.getlist('ids[]')

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(cluster.list_by_ids(realm, cluster_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/clusters/<id>/nodes', methods=['GET'])
def cluster_list_node(realm, id):
    """ this function add a cluster node """
    cluster = Cluster(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(cluster.list_nodes(realm, id)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/clusters/<id>/nodes', methods=['POST'])
def cluster_add_node(realm, id):
    """ this function add a cluster node """
    cluster = Cluster(ES)
    account = Account(ES)
    nodes = request.get_json()["nodes"]
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(cluster.add_nodes(account_email, realm, id, nodes)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/clusters/<id>/nodes', methods=['DELETE'])
def cluster_delete_node(realm, id):
    """ this function delete a node from cluster """
    cluster = Cluster(ES)
    account = Account(ES)
    node_ids = request.get_json()["node_ids"]
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(cluster.delete_nodes(account_email, realm, id, node_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

# * *********************************************************************************************************
# *
# * INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/global/filter', methods=['GET'])
def global_filter(realm):
    """ this function returns all objects matching the string passed via the get """
    account = Account(ES)
    gsearch = Gsearch(ES)
    string = request.args.get('string')
    account_email = json.loads(request.cookies.get('account'))['email']

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(gsearch.search(realm, string)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/global/filter/scroll', methods=["GET"])
def global_filter_scroll(realm):
    """ this function returns all objects matching the scroll id passed via the get """
    account = Account(ES)
    gsearch = Gsearch(ES)
    scroll_id = request.args.get('_scroll_id')
    account_email = json.loads(request.cookies.get('account'))['email']

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(gsearch.search_scroll(realm, scroll_id)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})


# * *********************************************************************************************************
# *
# * INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/infrastructures', methods=['GET'])
def infrastructure_list(realm):
    """ this function returns a json string containing all the infrastructure """
    infra = Infra(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(infra.__list__(realm)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/infrastructures', methods=['POST'])
def infrastructure_add(realm):
    """ this function returns a json string containing the result of addition """
    infra = Infra(ES)
    account = Account(ES)
    infrastructures = request.get_json()["infrastructures"]
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(infra.__add__(account_email, realm, infrastructures)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/infrastructures', methods=["PUT"])
def infrastructure_update(realm):
    """ This function update one or more infrastructures """
    infra = Infra(ES)
    account = Account(ES)
    infrastructures = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(infra.update(account_email, realm, infrastructures)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/infrastructures/ids', methods=['GET'])
def infrastructure_list_by_id(realm):
    """ this function returns the doc matching the infrastructure id """
    infra = Infra(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    infra_ids = request.args.getlist('ids[]')

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(infra.list_by_ids(realm, infra_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/infrastructures', methods=['DELETE'])
def infrastructure_delete(realm):
    """ this function returns a json string containing the result of deletion """
    infra = Infra(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    infra_ids = request.get_json()["infrastructure_ids"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(infra.__delete__(account_email, realm, infra_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/infrastructures/<id>/clusters', methods=['POST'])
def infrastructure_add_cluster(realm, id):
    """ this function adds a link between an infrastructure and an existing cluster """
    infra = Infra(ES)
    account = Account(ES)
    clusters = request.get_json()["clusters"]
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(infra.add_clusters(account_email, realm, id, clusters)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/infrastructures/<id>/clusters', methods=['DELETE'])
def infrastructure_delete_cluster(realm, id):
    """ this function remove an existing link between an infrastructure and a cluster"""
    infra = Infra(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    cluster_ids = request.get_json()["cluster_ids"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(infra.delete_clusters(account_email, realm, id, cluster_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realm/<realm>/infrastructures/tree', methods=["GET"])
def ream_infrastructure_tree(realm):
    """ this function returns the tree """
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(realm_infrastructure_tree(ES, realm)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

# * *********************************************************************************************************
# *
# * NODE PART -*- NODE PART -*- NODE PART -*- NODE PART -*- NODE PART -*- NODE PART -*- NODE PART# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/nodes', methods=['GET'])
def node_list(realm):
    """ this function returns the list of nodes by cluster id """
    node = Node(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(node.__list__(realm)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/nodes', methods=['POST'])
def node_add(realm):
    """ this function add a new node into the database """
    node = Node(ES)
    account = Account(ES)
    nodes = request.get_json()["nodes"]
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(node.__add__(account_email, realm, nodes)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/nodes', methods=['PUT'])
def node_update(realm):
    """ this function update the node data """
    node = Node(ES)
    account = Account(ES)
    node_data = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(node.update(node_data["id"], node_data["data"])))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/nodes', methods=['DELETE'])
def node_delete(realm):
    """ this function delete an existing node from the database """
    node = Node(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    node_ids = request.get_json()["node_ids"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(node.__delete__(account_email, realm, node_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/nodes/ids', methods=['GET'])
def node_list_by_id(realm):
    """ this function returns the node details by node id """
    node = Node(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    node_ids = request.args.getlist('ids[]')

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(node.list_by_ids(realm, node_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/nodes/names', methods=["GET"])
def node_list_by_nodename(realm):
    """ this function returns the node details for given realm and name """
    node = Node(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    names = request.args.getlist('names[]')

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(node.list_by_names(realm, names)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/nodes/<id>/rescan', methods=['GET'])
def node_rescan(realm, id):
    """ this function rescan a node which """
    node = Node(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    data = {"id": id, "realm": realm, "account_email": json.loads(request.cookies.get('account'))["email"] }

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(node.rescan(data)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

# * *********************************************************************************************************
# *
# * NODE MODE PART -*- NODE MODE PART -*- NODE MODE PART -*- NODE MODE PART -*- NODE MODE PART -*- NODE MODE
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/nodemode', methods=['GET'])
def nodemode_list(realm):
    """ this function return the node status """
    node_mode = NodeMode(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(node_mode.__list__()))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

# * *********************************************************************************************************
# *
# * PORT MAP PART -*- PORT MAP PART -*- PORT MAP PART -*- PORT MAP PART -*- PORT MAP PART -*- PORT MAP PART
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/portmaps', methods=["GET"])
def portmap_list(realm):
    """ This function list all portmaps that belong to a given realm"""
    portmap = Portmap()
    return Response(json.dumps(portmap.__list__(realm)))


# * *********************************************************************************************************
# *
# * REALM PART -*- ACCREALM PART -*- REALM PART -*- ACCREALM PART -*- REALM PART -*- ACCREALM PART -*- REALM PART# *
# * *********************************************************************************************************
@app.route('/api/v1/realms', methods=["GET"])
def realm_list():
    """ this function list all the realm"""
    realm = Realm(ES)
    return Response(json.dumps(realm.__list__()))

@app.route('/api/v1/realms', methods=["POST"])
def realm_add():
    """ this function create a new realm """
    realm = Realm(ES)
    realms = request.get_json()["realms"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(realm.__add__(account_email, realms)))

@app.route('/api/v1/realms', methods=["PUT"])
def realm_update_by_id(ids):
    """ this function update the realm having id as passed in param """
    realm = Realm(ES)
    realms = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(realm.update(realms)))

@app.route('/api/v1/realms/<ids>', methods=["DELETE"])
def realm_delete(ids):
    """ this function delete realm """
    realm = Realm(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    realm_ids = request.get_json()['realm_ids']
    return Response(json.dumps(realm.__delete__(account_email, realm_ids)))

@app.route('/api/v1/realms/ids', methods=["GET"])
def realm_list_by_id():
    """ this function list the realm having id as passed in param """
    realm = Realm(ES)
    realm_ids = request.args.getlist('ids[]')
    return Response(json.dumps(realm.list_by_ids(realm_ids)))

# * *********************************************************************************************************
# *
# * REPORT PART -*- REPORT PART -*- REPORT PART -*- SCENARIO PART -*- REPORT PART -*- REPORT PART
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/reports/filter/scroll', methods=["POST"])
def report_filter(realm):

    report_data = request.get_json()['report']
    account = Account(ES)
    reporter = Reporter(ES, report_data["object"]["name"])
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        print(report_data)
        if report_data["search"][0]["string"] != "":
            return Response(json.dumps(reporter.filter_regexp_scroll(realm, report_data)))
        else:
            return Response(json.dumps(reporter.filter_list_scroll(realm, report_data)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/reports/filter/scroll/data', methods=["GET"])
def report_scroll_data(realm):

    scroll_id = request.args.get('_scroll_id')
    report_type = request.args.get('report_type')
    account = Account(ES)
    reporter = Reporter(ES, report_type)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(reporter.filter_scroll_data(realm, scroll_id)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/reports/agg', methods=["POST"])
def report_agg(realm):

    report_data = request.get_json()['report']
    account = Account(ES)
    reporter = Reporter(ES, report_data["object"]["name"])
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        if report_data["search"][0]["string"] != "":
            return Response(json.dumps(reporter.filter_agg_data(realm, report_data)))
        else:
            return Response(json.dumps(reporter.list_agg_data(realm, report_data)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/reports/scroll', methods=["POST"])
def report_scroll(realm):

    report_data = request.get_json()['report']
    account = Account(ES)
    reporter = Reporter(ES, report_data["object"]["name"])
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(reporter.filter_scroll(realm, report_scroll)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

# * *********************************************************************************************************
# *
# * SCENARIO PART -*- SCENARIO PART -*- SCENARIO PART -*- SCENARIO PART -*- SCENARIO PART -*- SCENARIO
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/scenarios', methods=["POST"])
def scenario_add(realm):
    """ This function add a new scenario """
    sco = Scenario(ES)
    account = Account(ES)
    scenarios = request.get_json()["scenarios"]
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(sco.__add__(account_email, realm, scenarios)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scenarios', methods=["PUT"])
def scenario_update(realm):
    """ This function update one or more than one scenarios """
    sco = Scenario(ES)
    account = Account(ES)
    data = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(sco.update(account_email, realm, data)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scenarios/ids', methods=['GET'])
def scenario_list_by_ids(realm):
    """ this function returns the doc matching the infrastructure id """
    sco = Scenario(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    scenario_ids = request.args.getlist('ids[]')

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(sco.list_by_ids(realm, scenario_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scenarios', methods=["GET"])
def scenario_list_all(realm):
    """ This function returns all the scenarios present in a given realm """
    sco = Scenario(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(sco.__list__(realm)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scenarios/ids', methods=["DELETE"])
def scenario_delete_by_ids(realm):
    """ This function delete one or more scenarios identified by given ids from a given realm """
    sco = Scenario(ES)
    account = Account(ES)
    ids = request.args.getlist('ids[]')
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(sco.__delete__(account_email, realm, ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/scenarios/execute', methods=["POST"])
def scenario_execute_oneshot(realm):
    """
    This function executes one scenario of a given realm
    receive a json envelop containing:
    scenario name
    scenario description
    scenario nodes
    scenario scripts
    ansible first
    scenario ids
    """
    sco = Scenario(ES)
    account = Account(ES)
    scenario = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    scenario["realm"] = realm
    scenario["account_email"] = account_email
    scenario_id = request.get_json()["scenario_id"] if "scenario_id" in request.get_json().keys() else None

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(sco.execute(scenario=scenario, scenario_realm=realm, scenario_id=scenario_id)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

# * *********************************************************************************************************
# *
# * SCHEDULER PART -*- SCHEDULER PART -*- SCHEDULER PART -*- SCHEDULER PART -*- SCHEDULER PART -*- SCHEDULER
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/schedulers', methods=["POST"])
def scheduler_add(realm):
    """ this function add a new schedule management scenario into the scheduler doc """
    scheduler = Scheduler(ES)
    account = Account(ES)
    data = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    data["realm"] = realm
    data["account_email"] = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(scheduler.__add__(data)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/schedulers', methods=["GET"])
def scheduler_all(realm):
    """ this function list all scheduler """
    scheduler = Scheduler(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm) or account_email == SCHEDULER_EMAIL:
        return Response(json.dumps(scheduler.__list__(realm)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/schedulers/ids', methods=["GET"])
def scheduler_list_by_id(realm):
    """ this function list scheduler by id """
    scheduler = Scheduler(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    scheduler_ids = request.args.getlist('ids[]')

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(scheduler.list_by_ids(realm, scheduler_ids)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/schedulers/action', methods=["POST"])
def scheduler_action(realm):
    """ this function update schedule action for specific schedule """
    scheduler = Scheduler(ES)
    account = Account(ES)
    data = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    data["account_email"] = account_email
    data["realm"] = realm

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(scheduler.action(data)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/schedulers/execute', methods=["POST"])
def scheduler_execute(realm):

    scheduler = Scheduler(ES)
    schedule_data = request.get_json()["schedule_ids"]
    schedule_data["account_email"] = json.loads(request.cookies.get('account'))["email"]
    schedule_data["realm"] = realm
    return Response(json.dumps(scheduler.execute(schedule_data)))

# * *********************************************************************************************************
# *
# * SETTING PART -*- SETTING PART -*- SETTING PART -*- SETTING PART -*- SETTING PART -*- SETTING PART -*-
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/settings', methods=["GET"])
def list_settings(realm):
    """ this function returns the settings per realm """
    setting = Setting(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(setting.__list__(id)))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

@app.route('/api/v1/realms/<realm>/settings/<id>', methods=["PUT"])
def save_setting(realm, id):
    """ this function save the setting of a particular realm """
    setting = Setting(ES)
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]

    if account.is_active_realm_member(account_email, realm):
        return Response(json.dumps(setting.save(id, request.get_json())))
    else:
        return Response({"failure": "account identifier and realm is not an active match"})

# * *********************************************************************************************************
# *
# * MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART
# *
# * *********************************************************************************************************


if __name__ == '__main__':
    # app.run(host="%BLAST_BACKEND_HOSTNAME%", debug=True, port=%BLAST_BACKEND_PORT%)
    app.run()
