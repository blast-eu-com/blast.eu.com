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
import sys
import re
import json
import yaml
from functools import wraps
from flask_cors import CORS
from flask import Flask, request, Response
from api.db import ESConnector
from api.aaa.account import Account
from api.aaa.realm import Realm
from api.script import Script
from api.scriptlang import Scriptlang
from api.cluster import Cluster
from api.gsearch import Gsearch
from api.node import Node
from api.nodemode import NodeMode
from api.infra import Infra
from api.request import Request
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
    """
        This function is called before processing any request to check
        the jwt except if the request trigger the login endpoint.
        The goal here is to confirm the identity of the requestor.
        The requestor account_email passed in  the cookie is compare
        to the owner of the token.
    """
    account = Account(ES)
    if request.path in ["/api/v1/aaa/accounts/authenticate", "/api/v1/aaa/accounts"]:
        return None
    elif re.match(r'/api/v1/aaa/accounts/profile/[a-zA-Z\-\_\.]{6,}\@[a-zA-z]+\.[a-zA-Z\.]+', request.path) and request.method == "GET":
        account_email = re.search(r'[a-zA-Z\-\_\.]{6,}\@[a-zA-z]+\.[a-zA-Z\.]+', request.path).group()
    else:
        account_email = json.loads(request.cookies.get('account'))["email"]
    token = request.headers['AUTHORIZATION'].split()[1]
    return None if account.is_valid_token(account_email, token) else Response(json.dumps({"tokenExpired": True}))


def active_realm_member(f):
    """
        This decorator forbidden no active realm member to access the data of the realm
        targeted by the route url
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        realm = Realm(ES)
        account_email = json.loads(request.cookies.get('account'))["email"]
        if not realm.is_active_realm_member(account_email, kwargs["realm"]):
            return Response(json.dumps({"failure": "permission_denied", "message": "This realm is not your active realm"}))
        return f(*args, **kwargs)
    return decorated_function


def realm_member(f):
    """ This decorator forbidden no realm member to access the data of the realm
    targeted by the route url """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        realm = Realm(ES)
        account_email = json.loads(request.cookies.get('account'))["email"]
        if not realm.is_realm_member(account_email, kwargs["realm"]):
            return Response(json.dumps({"failure": "permission_denied", "message": "You are not member of this realm"}))
        return f(*args, **kwargs)
    return decorated_function


def regular_realm_member(f):
    """ This decorator forbidden no regular realm member to access the data of the realm
    targeted by the route url """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        realm = Realm(ES)
        account_email = json.loads(request.cookies.get('account'))["email"]
        if not realm.is_regular_realm_member(account_email, kwargs["realm"]):
            return Response(json.dumps({"failure": "permission_denied", "message": "You are not member of this realm"}))
        return f(*args, **kwargs)
    return decorated_function


def delegate_or_owner_realm_member(f):
    """ This decorator forbidden no delegate realm member to access the data of the realm
        targeted by the route url """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        realm = Realm(ES)
        account_email = json.loads(request.cookies.get('account'))["email"]
        if not realm.is_delegate_realm_member(account_email, kwargs["realm"]) and not realm.is_owner_realm_member(account_email, kwargs["realm"]):
            return Response(json.dumps({"failure": "permission_denied", "message": "You are not member of this realm"}))
        return f(*args, **kwargs)

    return decorated_function


def delegate_realm_member(f):
    """ This decorator forbidden no delegate realm member to access the data of the realm
    targeted by the route url """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        realm = Realm(ES)
        account_email = json.loads(request.cookies.get('account'))["email"]
        if not realm.is_delegate_realm_member(account_email, kwargs["realm"]):
            return Response(json.dumps({"failure": "permission_denied", "message": "You are not member of this realm"}))
        return f(*args, **kwargs)
    return decorated_function


def owner_realm_member(f):
    """ This decorator forbidden no owner realm member to access the data of the realm
    targeted by the route url """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        realm = Realm(ES)
        account_email = json.loads(request.cookies.get('account'))["email"]
        if not realm.is_owner_realm_member(account_email, kwargs["realm"]):
            return Response(json.dumps({"failure": "permission_denied", "message": "You are not member of this realm"}))
        return f(*args, **kwargs)
    return decorated_function

# * *********************************************************************************************************
# *
# * AAA PART -*- AAA PART -*- AAA PART -*- AAA PART -*- AAA PART -*- AAA PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/aaa/accounts', methods=["POST"])
def aaa_account_add():
    """ this function add a new account using the aaa endpoint """
    account = Account(ES)
    realm = Realm(ES)
    payload = request.get_json()
    account_data = {"email": payload["email"], "password": payload["password"]}
    realm_data = {"name": payload["realm_name"], "member": payload["email"], "active": payload["realm_active"], "role": payload["realm_role"]}

    account_add_result = account.add(account_data)
    if "failure" in account_add_result.keys():
        return Response(json.dumps(account_add_result))

    realm_add_result = realm.add(realm_data)
    if "failure" in realm_add_result.keys():
        return Response(json.dumps(realm_add_result))

    return Response(json.dumps(account_add_result))

@app.route('/api/v1/aaa/accounts', methods=["GET"])
def aaa_account_list():
    """ this function list all the account """
    account = Account(ES)
    return Response(json.dumps(account.list()))

@app.route('/api/v1/aaa/accounts/<id>', methods=["GET"])
def aaa_account_list_by_id(id):
    """ this function returns the details of the account with id """
    account = Account(ES)
    return Response(json.dumps(account.list_by_id(id)))

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

@app.route('/api/v1/aaa/accounts/<id>', methods=["DELETE"])
def aaa_account_delete(id):
    """ this function remove an existing account using the aaa endpoint """
    account = Account(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(account.delete(account_email, id)))

@app.route('/api/v1/aaa/accounts/authenticate', methods=["POST"])
def aaa_login():
    """ this function login an account """
    account = Account(ES)
    account_email = request.get_json()["email"]
    account_password = request.get_json()["password"]
    return Response(json.dumps(account.authenticate(account_email, account_password)))

@app.route('/api/v1/aaa/accounts/password', methods=["PUT"])
def aaa_account_password_update():
    """ this function update the password of a given account"""
    account = Account(ES)
    account_id = request.get_json()["id"]
    password_data = {"old": request.get_json()["old_password"], "new": request.get_json()["new_password"]}
    return Response(json.dumps(account.update_password(account_id, password_data)))

@app.route('/api/v1/aaa/accounts/profile/<email>', methods=["GET"])
def aaa_load_profile(email):
    """ this function load the account which will be used as cookie """
    account = Account(ES)
    return Response(json.dumps(account.load_account_profile(email)))

# * *********************************************************************************************************
# *
# * ANSIBLE PART -*- ANSIBLE PART -*- ANSIBLE PART -*- ANSIBLE PART -*- ANSIBLE PART -*- ANSIBLE PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/scripts', methods=['POST'])
@active_realm_member
def script_add(realm):
    """ this function add a new ansible playbook """
    script = Script(ES)
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

    return Response(json.dumps(script.add(account_email, realm, data)))

@app.route('/api/v1/realms/<realm>/scripts', methods=['DELETE'])
@active_realm_member
def script_delete(realm):
    """ this function delete one script identify by given id from the given realm """
    script = Script(ES)
    script_id = request.get_json()["script_id"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(script.delete(account_email, realm, script_id)))

@app.route('/api/v1/realms/<realm>/scripts', methods=['GET'])
@active_realm_member
def script_list(realm):
    """ this function returns all scripts """
    script = Script(ES)
    return Response(json.dumps(script.list(realm)))

@app.route('/api/v1/realms/<realm>/scripts/<script_id>', methods=["GET"])
@active_realm_member
def script_list_by_ids(realm, script_id):
    """ this function returns the script for the given id """
    script = Script(ES)
    return Response(json.dumps(script.list_by_id(realm, script_id)))

@app.route('/api/v1/realms/<realm>/scripts/name/<name>', methods=["GET"])
@active_realm_member
def script_list_by_names(realm, name):
    """ this function returns the script for the given name """
    script = Script(ES)
    return Response(json.dumps(script.list_by_name(realm, name)))

@app.route('/api/v1/realms/<realm>/scripts/roles/<role>', methods=["GET"])
@active_realm_member
def script_list_by_roles(realm, role):
    """ this function returns the script for the given roles """
    script = Script(ES)
    return Response(json.dumps(script.list_by_role(realm, role)))

@app.route('/api/v1/scripts/langs', methods=["GET"])
def script_list_langs():
    scriptlang = Scriptlang(ES)
    return Response(json.dumps(scriptlang.list()))

# * *********************************************************************************************************
# *
# * CLUSTER PART -*- CLUSTER PART -*- CLUSTER PART -*- CLUSTER PART -*- CLUSTER PART -*- CLUSTER PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/clusters', methods=['GET'])
@active_realm_member
def cluster_list(realm):
    """ this function returns all the registered cluster """
    cluster = Cluster(ES)
    return Response(json.dumps(cluster.list(realm)))

@app.route('/api/v1/realms/<realm>/clusters', methods=['POST'])
@active_realm_member
def cluster_add(realm):
    """ this function add a cluster reference """
    cluster = Cluster(ES)
    cluster_data = request.get_json()["cluster"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(cluster.add(account_email, realm, cluster_data)))

@app.route('/api/v1/realms/<realm>/clusters', methods=["PUT"])
@active_realm_member
def cluster_update(realm):
    """ This function update one or more clusters """
    cluster = Cluster(ES)
    cluster_data = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(cluster.update(account_email, realm, cluster_data)))

@app.route('/api/v1/realms/<realm>/clusters/<cluster_id>', methods=['DELETE'])
@active_realm_member
def cluster_delete(realm, cluster_id):
    """ this function delete a cluster reference """
    cluster = Cluster(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(cluster.delete(account_email, realm, cluster_id)))

@app.route('/api/v1/realms/<realm>/clusters/<cluster_id>', methods=['GET'])
@active_realm_member
def cluster_list_by_id(realm, cluster_id):
    """ this function returns the doc matching the cluster id """
    cluster = Cluster(ES)
    return Response(json.dumps(cluster.list_by_id(realm, cluster_id)))

@app.route('/api/v1/realms/<realm>/clusters/<cluster_id>/nodes', methods=['POST'])
@active_realm_member
def cluster_add_node(realm, cluster_id):
    """ this function add a cluster node """
    cluster = Cluster(ES)
    node_data = request.get_json()["node"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(cluster.add_node(account_email, realm, cluster_id, node_data)))

@app.route('/api/v1/realms/<realm>/clusters/<cluster_id>/nodes/<node_name>', methods=['DELETE'])
@active_realm_member
def cluster_delete_node(realm, cluster_id, node_name):
    """ this function delete a node from cluster """
    cluster = Cluster(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(cluster.delete_node(account_email, realm, cluster_id, node_name)))

# * *********************************************************************************************************
# *
# * INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/global/filter/<string>', methods=['GET'])
@active_realm_member
def global_filter(realm, string):
    """ this function returns all objects matching the string passed via the get """
    gsearch = Gsearch(ES)
    return Response(json.dumps(gsearch.search(realm, string)))

@app.route('/api/v1/realms/<realm>/global/filter/scroll/<scroll_id>', methods=["GET"])
@active_realm_member
def global_filter_scroll(realm, scroll_id):
    """ this function returns all objects matching the scroll id passed via the get """
    gsearch = Gsearch(ES)
    return Response(json.dumps(gsearch.search_scroll(realm, scroll_id)))


# * *********************************************************************************************************
# *
# * INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART -*- INFRASTRUCTURE PART
# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/infrastructures', methods=['GET'])
@active_realm_member
def infrastructure_list(realm):
    """ this function returns a json string containing all the infrastructure """
    infra = Infra(ES)
    return Response(json.dumps(infra.list(realm)))

@app.route('/api/v1/realms/<realm>/infrastructures', methods=['POST'])
@active_realm_member
def infrastructure_add(realm):
    """ this function returns a json string containing the result of addition """
    infra = Infra(ES)
    infrastructure = request.get_json()["infrastructure"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(infra.add(account_email, realm, infrastructure)))

@app.route('/api/v1/realms/<realm>/infrastructures', methods=["PUT"])
@active_realm_member
def infrastructure_update(realm):
    """ This function update one or more infrastructures """
    infra = Infra(ES)
    infrastructures = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(infra.update(account_email, realm, infrastructures)))

@app.route('/api/v1/realms/<realm>/infrastructures/<infra_id>', methods=['GET'])
@active_realm_member
def infrastructure_list_by_id(realm, infra_id):
    """ this function returns the doc matching the infrastructure id """
    infra = Infra(ES)
    return Response(json.dumps(infra.list_by_id(realm, infra_id)))

@app.route('/api/v1/realms/<realm>/infrastructures', methods=['DELETE'])
@active_realm_member
def infrastructure_delete(realm):
    """ this function returns a json string containing the result of deletion """
    infra = Infra(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    infra_id = request.get_json()["infrastructure_id"]
    return Response(json.dumps(infra.delete(account_email, realm, infra_id)))

@app.route('/api/v1/realms/<realm>/infrastructures/<id>/clusters', methods=['POST'])
@active_realm_member
def infrastructure_add_cluster(realm, id):
    """ this function adds a link between an infrastructure and an existing cluster """
    infra = Infra(ES)
    cluster = request.get_json()["cluster"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(infra.add_cluster(account_email, realm, id, cluster)))

@app.route('/api/v1/realms/<realm>/infrastructures/<id>/clusters', methods=['DELETE'])
@active_realm_member
def infrastructure_delete_cluster(realm, id):
    """ this function remove an existing link between an infrastructure and a cluster"""
    infra = Infra(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    cluster_name = request.get_json()["cluster_name"]
    return Response(json.dumps(infra.delete_cluster(account_email, realm, id, cluster_name)))

@app.route('/api/v1/realm/<realm>/infrastructures/tree', methods=["GET"])
@active_realm_member
def infrastructure_realm_tree(realm):
    """ this function returns the tree """
    return Response(json.dumps(realm_infrastructure_tree(ES, realm)))

# * *********************************************************************************************************
# *
# * NODE PART -*- NODE PART -*- NODE PART -*- NODE PART -*- NODE PART -*- NODE PART -*- NODE PART# *
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/nodes', methods=['GET'])
@active_realm_member
def node_list(realm):
    """ this function returns the list of nodes by cluster id """
    node = Node(ES)
    return Response(json.dumps(node.list(realm)))

@app.route('/api/v1/realms/<realm>/nodes', methods=['POST'])
@active_realm_member
def node_add(realm):
    """ this function add a new node into the database """
    node = Node(ES)
    node_data = request.get_json()["node"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(node.add(account_email, realm, node_data)))

@app.route('/api/v1/realms/<realm>/nodes', methods=['PUT'])
@active_realm_member
def node_update(realm):
    """ this function update the node data """
    node = Node(ES)
    node_data = request.get_json()
    return Response(json.dumps(node.update(node_data["id"], node_data["data"])))

@app.route('/api/v1/realms/<realm>/nodes', methods=['DELETE'])
@active_realm_member
def node_delete(realm):
    """ this function delete an existing node from the database """
    node = Node(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    node_id = request.get_json()["node_id"]
    return Response(json.dumps(node.delete(account_email, realm, node_id)))

@app.route('/api/v1/realms/<realm>/nodes/<node_id>', methods=['GET'])
@active_realm_member
def node_list_by_id(realm, node_id):
    """ this function returns the node details by node id """
    node = Node(ES)
    return Response(json.dumps(node.list_by_id(realm, node_id)))

@app.route('/api/v1/realms/<realm>/nodes/names/<name>', methods=["GET"])
@active_realm_member
def node_list_by_nodename(realm, name):
    """ this function returns the node details for given realm and name """
    node = Node(ES)
    return Response(json.dumps(node.list_by_name(realm, name)))

@app.route('/api/v1/realms/<realm>/nodes/<id>/rescan', methods=['GET'])
@active_realm_member
def node_rescan(realm, id):
    """ this function rescan a node which """
    node = Node(ES)
    data = {"id": id, "realm": realm, "account_email": json.loads(request.cookies.get('account'))["email"]}
    return Response(json.dumps(node.rescan(data)))

# * *********************************************************************************************************
# *
# * NODE MODE PART -*- NODE MODE PART -*- NODE MODE PART -*- NODE MODE PART -*- NODE MODE PART -*- NODE MODE
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/nodemode', methods=['GET'])
@active_realm_member
def nodemode_list(realm):
    """ this function return the node status """
    node_mode = NodeMode(ES)
    return Response(json.dumps(node_mode.list()))

# * *********************************************************************************************************
# *
# * PORT MAP PART -*- PORT MAP PART -*- PORT MAP PART -*- PORT MAP PART -*- PORT MAP PART -*- PORT MAP PART
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/portmaps', methods=["GET"])
def portmap_list(realm):
    """ This function list all portmaps that belong to a given realm"""
    portmap = Portmap()
    return Response(json.dumps(portmap.list(realm)))


# * *********************************************************************************************************
# *
# * REALM PART -*- REALM PART -*- REALM PART -*- ACCREALM PART -*- REALM PART -*- ACCREALM PART -*- REALM PART# *
# * *********************************************************************************************************
@app.route('/api/v1/realms', methods=["GET"])
def realm_list():
    """
        This function returns the full list of the existing realms.
        There are no restrictions for requesting the list of the realms.
        For security reason, the realm owner is not exposed to the no realm members via Blast UI.
    """
    rlm = Realm(ES)
    return Response(json.dumps(rlm.list()))

@app.route('/api/v1/realms', methods=["POST"])
def realm_add():
    """
        This function allows any users to create their own realm.
        There are no restrictions for creating a new realm.
    """
    rlm = Realm(ES)
    payload = request.get_json()["realm"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    payload["member"] = account_email
    return Response(json.dumps(rlm.add(payload)))

@app.route('/api/v1/realms/uniqs', methods=["GET"])
def realm_list_by_uniq_name():
    """
        This function allows any users to create their own realm.
        There are no restrictions for creating a new realm.
    """
    rlm = Realm(ES)
    return Response(json.dumps(rlm.list_by_uniq_name()))

@app.route('/api/v1/realms/members/<member>', methods=["GET"])
def realm_list_by_member(member):
    """
        This function allows any users to create their own realm.
        There are no restrictions for creating a new realm.
    """
    rlm = Realm(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    if account_email == member:
        return Response(json.dumps(rlm.list_by_member(member)))

@app.route('/api/v1/realms/<realm>', methods=["PUT"])
@active_realm_member
@owner_realm_member
def realm_update(realm):
    """
        This function allows to update an existing realm.
        For security reason, only the owner of a realm is allowed to modify the realm definition.
        If a realm member wants to update the realm then he needs to request to owner to do it
        Or he needs to become the owner of this realm.
    """
    rlm = Realm(ES)
    data = request.get_json()
    return Response(json.dumps(rlm.update(data)))

@app.route('/api/v1/realms/<realm>', methods=["DELETE"])
@active_realm_member
@owner_realm_member
def realm_delete(realm):
    """
        This route delete a realm.
        The realm deletion is not recommended because of the destructive action.
        Anyways only a realm owner can destruct a realm. If a no realm owner wants to destroy a realm
        then he needs to requests the ownership of this realm to the current realm owner.
    """
    rlm = Realm(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(rlm.delete(account_email, realm)))

@app.route('/api/v1/realms/<realm>', methods=["GET"])
@realm_member
def realm_list_by_name(realm):
    """
        This route returns the content of a realm by providing the realm name
        for security reason only a realm member can access the content of a realm.
        If a no member user wants to read the content of a realm then he needs to
        subscribe to this realm.
    """
    rlm = Realm(ES)
    return Response(json.dumps(rlm.list_by_name(realm)))

@app.route('/api/v1/realms/<realm>/members/<member>', methods=["GET"])
@realm_member
def realm_list_by_member_and_name(realm, member):
    """
        This route returns the content of a realm by providing the realm name
        for security reason only a realm member can access the content of a realm.
        If a no member user wants to read the content of a realm then he needs to
        subscribe to this realm.
    """
    rlm = Realm(ES)
    return Response(json.dumps(rlm.list_by_member_and_name(member, realm)))

@app.route('/api/v1/realms/<realm>/active', methods=["PUT"])
@realm_member
def switch_realm_active(realm):
    """
        this function switch current active realm
        to another realm
    """
    rlm = Realm(ES)
    payload = request.get_json()["realm"]
    new_current_active = False if payload["active"] else True
    realm_switch_result = rlm.switch_realm_active(realm, payload["member"], new_current_active)
    if realm_switch_result["result"] != "updated":
        return Response(json.dumps(realm_switch_result))

    return Response(json.dumps(rlm.switch_realm_active(payload["name"], payload["member"], payload["active"])))

@app.route('/api/v1/realms/<realm>/role', methods=["PUT"])
@delegate_or_owner_realm_member
def switch_realm_role(realm):
    """
        this function switch current active realm
        to another realm
    """
    rlm = Realm(ES)
    payload = request.get_json()["realm"]
    if payload["role"] == "owner":
        owner = rlm.list_by_member_role_and_name(payload["role"], realm)["hits"]["hits"][0]["_source"]["member"]
        owner_switch_res = rlm.switch_member_role(realm, owner, "delegate")
        if owner_switch_res["result"] == "updated":
            return Response(json.dumps(rlm.switch_member_role(realm, payload["member"], payload["role"])))

# * *********************************************************************************************************
# *
# * REPORT PART -*- REPORT PART -*- REPORT PART -*- SCENARIO PART -*- REPORT PART -*- REPORT PART
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/reports/filter/scroll', methods=["POST"])
@active_realm_member
def report_filter(realm):

    report_data = request.get_json()['report']
    reporter = Reporter(ES, report_data["object"]["name"])
    if report_data["search"][0]["string"] != "":
        return Response(json.dumps(reporter.filter_regexp_scroll(realm, report_data)))
    else:
        return Response(json.dumps(reporter.filter_list_scroll(realm, report_data)))

@app.route('/api/v1/realms/<realm>/reports/filter/scroll/data', methods=["GET"])
@active_realm_member
def report_scroll_data(realm):

    scroll_id = request.args.get('_scroll_id')
    report_type = request.args.get('report_type')
    reporter = Reporter(ES, report_type)
    return Response(json.dumps(reporter.filter_scroll_data(realm, scroll_id)))

@app.route('/api/v1/realms/<realm>/reports/agg', methods=["POST"])
@active_realm_member
def report_agg(realm):

    report_data = request.get_json()['report']
    reporter = Reporter(ES, report_data["object"]["name"])
    if report_data["search"][0]["string"] != "":
        return Response(json.dumps(reporter.filter_agg_data(realm, report_data)))
    else:
        return Response(json.dumps(reporter.list_agg_data(realm, report_data)))

@app.route('/api/v1/realms/<realm>/reports/scroll', methods=["POST"])
@active_realm_member
def report_scroll(realm):

    report_data = request.get_json()['report']
    reporter = Reporter(ES, report_data["object"]["name"])
    return Response(json.dumps(reporter.filter_scroll(realm, report_scroll)))

# * *********************************************************************************************************
# *
# * REQUEST PART -*- REQUEST PART -*- REQUEST PART -*- REQUEST PART -*- REQUEST PART -*- REQUEST PART -*-
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/requests', methods=["POST"])
@active_realm_member
def request_add(realm):
    """
        this function add a new request
    """
    req = Request(ES)
    payload = request.get_json()["request"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(req.add(account_email, payload)))

@app.route('/api/v1/realms/<realm>/requests/actions', methods=["POST"])
@active_realm_member
def request_actions(realm):
    """
        this function add a new request
    """
    req = Request(ES)
    request_id = request.get_json()["requestData"]["requestId"]
    user_action = request.get_json()["requestData"]["userAction"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(req.action(account_email, request_id, user_action)))

@app.route('/api/v1/realms/<realm>/requests', methods=["GET"])
@active_realm_member
def request_list_account(realm):
    """
        this function returns all the requests where the account email
        is equal to the sender value or the receiver value
    """
    req = Request(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(req.list_by_account(account_email)))

@app.route('/api/v1/realms/<realm>/requests/states/<state>', methods=["GET"])
@active_realm_member
def request_list_by_account_and_state(realm, state):
    """
        this function returns all the requests where the account email
        is equal to the sender value or the receiver value and the state is
        equal to the state passed
    """
    req = Request(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(req.list_by_account_and_state(account_email, state)))

@app.route('/api/v1/realms/<realm>/requests/<id>', methods=["GET"])
@active_realm_member
def request_list_by_id(realm, id):
    """
        this function returns all the requests where the account email
        is equal to the sender value or the receiver value
    """
    req = Request(ES)
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(req.list_by_id(account_email, id)))

# * *********************************************************************************************************
# *
# * SCENARIO PART -*- SCENARIO PART -*- SCENARIO PART -*- SCENARIO PART -*- SCENARIO PART -*- SCENARIO
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/scenarios', methods=["POST"])
@active_realm_member
def scenario_add(realm):
    """ This function add a new scenario """
    sco = Scenario(ES)
    payload = request.get_json()["scenario"]
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(sco.add(account_email, realm, payload)))

@app.route('/api/v1/realms/<realm>/scenarios', methods=["PUT"])
@active_realm_member
def scenario_update(realm):
    """ This function update one or more than one scenarios """
    sco = Scenario(ES)
    payload = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(sco.update(account_email, realm, payload)))

@app.route('/api/v1/realms/<realm>/scenarios/<scenario_id>', methods=['GET'])
@active_realm_member
def scenario_list_by_ids(realm, scenario_id):
    """ this function returns the doc matching the infrastructure id """
    sco = Scenario(ES)
    return Response(json.dumps(sco.list_by_id(realm, scenario_id)))

@app.route('/api/v1/realms/<realm>/scenarios', methods=["GET"])
@active_realm_member
def scenario_list_all(realm):
    """ This function returns all the scenarios present in a given realm """
    sco = Scenario(ES)
    return Response(json.dumps(sco.list(realm)))

@app.route('/api/v1/realms/<realm>/scenarios/ids', methods=["DELETE"])
@active_realm_member
def scenario_delete_by_ids(realm):
    """ This function delete one or more scenarios identified by given ids from a given realm """
    sco = Scenario(ES)
    ids = request.args.getlist('ids[]')
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(sco.delete(account_email, realm, ids)))

@app.route('/api/v1/realms/<realm>/scenarios/execute', methods=["POST"])
@active_realm_member
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
    payload = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    payload["realm"] = realm
    payload["account_email"] = account_email
    scenario_id = request.get_json()["scenario_id"] if "scenario_id" in request.get_json().keys() else None
    return Response(json.dumps(sco.execute(scenario=payload, scenario_realm=realm, scenario_id=scenario_id)))

# * *********************************************************************************************************
# *
# * SCHEDULER PART -*- SCHEDULER PART -*- SCHEDULER PART -*- SCHEDULER PART -*- SCHEDULER PART -*- SCHEDULER
# * *********************************************************************************************************
@app.route('/api/v1/realms/<realm>/schedulers', methods=["POST"])
@active_realm_member
def scheduler_add(realm):
    """ this function add a new schedule management scenario into the scheduler doc """
    scheduler = Scheduler(ES)
    data = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    return Response(json.dumps(scheduler.add(account_email, realm, data)))

@app.route('/api/v1/realms/<realm>/schedulers', methods=["GET"])
@active_realm_member
def scheduler_all(realm):
    """ this function list all scheduler """
    scheduler = Scheduler(ES)
    return Response(json.dumps(scheduler.list(realm)))

@app.route('/api/v1/realms/<realm>/schedulers/<scheduler_id>', methods=["GET"])
@active_realm_member
def scheduler_list_by_id(realm, scheduler_id):
    """ this function list scheduler by id """
    scheduler = Scheduler(ES)
    return Response(json.dumps(scheduler.list_by_id(realm, scheduler_id)))

@app.route('/api/v1/realms/<realm>/schedulers/action', methods=["POST"])
@active_realm_member
def scheduler_action(realm):
    """ this function update schedule action for specific schedule """
    scheduler = Scheduler(ES)
    data = request.get_json()
    account_email = json.loads(request.cookies.get('account'))["email"]
    data["account_email"] = account_email
    data["realm"] = realm
    return Response(json.dumps(scheduler.action(data)))

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
@active_realm_member
def list_settings(realm):
    """ this function returns the settings per realm """
    setting = Setting(ES)
    return Response(json.dumps(setting.list(realm)))

@app.route('/api/v1/realms/<realm>/settings/<id>', methods=["PUT"])
@active_realm_member
def save_setting(realm, id):
    """ this function save the setting of a particular realm """
    setting = Setting(ES)
    ssh_certificate = '' if "ssh_certificate" in request.form.keys() else request.files["ssh_certificate"]
    ansible_certificate = '' if "ansible_certificate" in request.form.keys() else request.files["ansible_certificate"]
    setting_data = {
        "ssh": {
            "username": request.form["ssh_username"],
            "password": request.form["ssh_password"],
            "certificate": ssh_certificate,
            "location": request.form["ssh_location"]
        },
        "ansible": {
            "username": request.form["ansible_username"],
            "password": request.form["ansible_password"],
            "certificate": ansible_certificate,
            "inventory": {
                "location": request.form["ansible_inventory_location"]
            }
        }
    }
    return Response(json.dumps(setting.save(id, setting_data)))


# * *********************************************************************************************************
# *
# * MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART -*- MAIN PART
# *
# * *********************************************************************************************************


if __name__ == '__main__':
    # app.run(host="%BLAST_BACKEND_HOSTNAME%", debug=True, port=%BLAST_BACKEND_PORT%)
    app.run()
