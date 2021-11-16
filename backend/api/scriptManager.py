# -*- coding:utf-8 -*-
"""
   Copyright 2021 Jerome DE LUCCHI

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
import time
import hashlib
import datetime
import subprocess
from api.discovery import SSH
from api.setting import Setting, decrypt_password
from api import script
from api import reporter
from api import node


class ScriptManager:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.settings = Setting(self.ES)
        self._ansible_inventory_file = None
        self._ansible_playbook_file = None
        self._ansible_session_id = None
        self._ansible_session_dir = None
        self._node_id = None
        self._realm_settings = None
        self._scenario_id = None
        self._script_id = None
        self._script_args = None
        self._script_name = None
        self._script_description = None
        self._script_locker = None
        self._script_realm = None
        self._script_destination = None
        self._script_filename = None
        self._script_output = None
        self._script_report_id = None
        self._script_report = None
        self._script_type = None
        self._script_content = None
        self._execution_id = None

    @property
    def ansible_inventory_file(self):
        return self._ansible_inventory_file

    @ansible_inventory_file.setter
    def ansible_inventory_file(self, ansible_inventory_file):
        self._ansible_inventory_file = ansible_inventory_file

    @property
    def ansible_playbook_file(self):
        return self._ansible_playbook_file

    @ansible_playbook_file.setter
    def ansible_playbook_file(self, ansible_playbook_file):
        self._ansible_playbook_file = ansible_playbook_file

    @property
    def ansible_session_id(self):
        return self._ansible_session_id

    @ansible_session_id.setter
    def ansible_session_id(self, ansible_session_id):
        self._ansible_session_id = ansible_session_id

    @property
    def ansible_session_dir(self):
        return self._ansible_session_dir

    @ansible_session_dir.setter
    def ansible_session_dir(self, ansible_session_dir):
        self._ansible_session_dir = ansible_session_dir

    @property
    def node_id(self):
        return self._node_id

    @node_id.setter
    def node_id(self, node_id: str):
        self._node_id = node_id

    @property
    def realm_settings(self):
        return self._realm_settings

    @realm_settings.setter
    def realm_settings(self, realm_settings):
        self._realm_settings = realm_settings

    @property
    def scenario_id(self):
        return self._scenario_id

    @scenario_id.setter
    def scenario_id(self, scenario_id: str):
        self._scenario_id = scenario_id

    @property
    def script_id(self):
        return self._script_id

    @script_id.setter
    def script_id(self, script_id: str):
        self._script_id = script_id

    @property
    def script_args(self):
        return self._script_args
    
    @script_args.setter
    def script_args(self, script_args: str):
        self._script_args = script_args

    @property
    def script_name(self):
        return self._script_name

    @script_name.setter
    def script_name(self, script_name: str):
        self._script_name = script_name

    @property
    def script_description(self):
        return self._script_description

    @script_description.setter
    def script_description(self, script_description: str):
        self._script_description = script_description

    @property
    def script_output(self):
        return self._script_output

    @script_output.setter
    def script_output(self, script_output: str):
        self._script_output = script_output

    @property
    def script_report(self):
        return self._script_report

    @script_report.setter
    def script_report(self, script_report: dict):
        self._script_report = script_report

    @property
    def script_report_id(self):
        return self._script_report_id

    @script_report_id.setter
    def script_report_id(self, script_report_id: str):
        self._script_report_id = script_report_id

    @property
    def script_realm(self):
        return self._script_realm

    @script_realm.setter
    def script_realm(self, script_realm: str):
        self._script_realm = script_realm

    @property
    def script_type(self):
        return self._script_type

    @script_type.setter
    def script_type(self, script_type: str):
        self._script_type = script_type

    @property
    def script_destination(self):
        return self._script_destination

    @script_destination.setter
    def script_destination(self, script_destination):
        self._script_destination = script_destination

    @property
    def script_locker(self):
        return self._script_locker

    @script_locker.setter
    def script_locker(self, script_locker):
        self._script_locker = script_locker

    @property
    def script_filename(self):
        return self._script_filename

    @script_filename.setter
    def script_filename(self, script_filename):
        self._script_filename = script_filename

    @property
    def script_content(self):
        return self._script_content

    @script_content.setter
    def script_content(self, script_content):
        self._script_content = script_content

    @property
    def execution_id(self):
        return self._execution_id

    @execution_id.setter
    def execution_id(self, execution_id):
        self._execution_id = execution_id

    def __close_script_report(self):
        """
        Thus function close an existing script report
        """
        try:
            print(" >>> Enter file:scenarioManager:class:scenarioManager:func:__close_script_report")
            self.script_report["end_at"] = datetime.datetime.isoformat(datetime.datetime.utcnow())
            self.script_report["status"] = "ended"
            self.script_report["duration"]["end_at"] = datetime.datetime.now().timestamp()
            self.script_report["duration"]["time"] = self.script_report["duration"]["end_at"] - self.script_report["duration"]["start_at"]
            script_reporter = reporter.Reporter(self.ES, report_type="script")
            resp = script_reporter.update(self.script_report_id, self.script_report)
            return True if resp["result"] == "updated" else False

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:__close_script_report")
            print(e)
            return {"failure": str(e)}

    def __update_script_report(self):

        try:
            print(self.script_report_id, self.script_report)
            script_reporter = reporter.Reporter(self.ES, report_type="script")
            resp = script_reporter.update(self.script_report_id, self.script_report)
            return True if resp["result"] == "updated" else False

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:update_script_report")
            print(e)
            return {"failure": str(e)}

    def __open_script_report(self):
        """
        This function open a new script run report
        """
        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:func:__open_script_report")
            self.script_report = {
                "report_type": "script",
                "scenario_id": self.scenario_id,
                "script_id": self.script_id,
                "node_id": self.node_id,
                "name": self.script_name,
                "description": self.script_description,
                "realm": self.script_realm,
                "start_at": datetime.datetime.isoformat(datetime.datetime.utcnow()),
                "status": "running",
                "execution_id": self.execution_id,
                "output": "",
                "duration": {
                    "start_at": datetime.datetime.now().timestamp()
                }
            }
            script_reporter = reporter.Reporter(self.ES, report_type="script")
            resp = script_reporter.__add__(self.script_report)
            print(resp)
            if resp["result"] == "created":
                self.script_report_id = resp["_id"]
                return True
            else:
                return False

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:__open_script_report")
            print(e)
            return {"failure": str(e)}

    def node_details(self, realm: str, node_id: str):

        try:
            nod = node.Node(self.ES)
            return nod.list_by_id(realm, node_id)

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:node_details")
            print(e)
            return {"failure": str(e)}

    def script_details(self, realm: str, script_id: str):

        try:
            scr = script.Script(self.ES)
            return scr.list_by_id(realm, script_id)["hits"]["hits"][0]

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:script_details")
            print(e)
            return {"failure": str(e)}

    def ssh_connector(self, realm: str, node: str):

        try:
            print(" >>> Enter file:scenarioManager:class:scenarioManager:func:ssh_connector")
            return SSH(node, **{"username": self.realm_settings["hits"]["hits"][0]["_source"]["ssh"]["username"],
                                "password": self.settings.list_ssh_password_by_realm(realm),
                                "certificate": self.realm_settings["hits"]["hits"][0]["_source"]["ssh"]["certificate"]})

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:ssh_connector")
            print(e)
            return {"failure": str(e)}

    @staticmethod
    def is_all_threads_alive(thread_list):

        is_terminated = True
        for th in thread_list:
            if th.is_alive():
                is_terminated = False

        return is_terminated

    def build_remote_env(self, node_name, script_content, script_destination):

        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:function:build_remote_env")
            ssh = self.ssh_connector(self.script_realm, node_name)
            ssh.open_ssh_connection()
            ssh_command = 'mkdir -p `dirname ' + script_destination + '`'
            ssh.ssh_client.exec_command(ssh_command)
            ssh_command = '> ' + script_destination + ' ;'\
                + 'chmod 700 ' + script_destination + ' ;'\
                + 'cat <<\'EOF\' >' + script_destination + '\n'\
                + script_content + '\n'\
                'EOF'
            print(ssh_command)
            ssh.ssh_client.exec_command(ssh_command)
            ssh.close_ssh_connection()
            return True

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:send_script_to_remote")
            print(e)
            return {"failure": str(e)}

    def destroy_remote_env(self, node_name, script_destination):

        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:function:destroy_remote_env")
            ssh = self.ssh_connector(self.script_realm, node_name)
            ssh.open_ssh_connection()
            ssh_command = 'rm -fr `dirname ' + script_destination + '`'
            ssh.ssh_client.exec_command(ssh_command)
            ssh.close_ssh_connection()
            return True

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:destroy_remote_env")
            print(e)
            return {"failure": str(e)}

    def exec_remote_script(self, node_name):

        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:function:exec_remote_script")
            run_command = 'echo $$ > ' + self.script_locker + ' ; ' + self.script_destination + " " + self.script_args
            print(run_command)
            ssh = self.ssh_connector(self.script_realm, node_name)
            ssh.open_ssh_connection()
            transport = ssh.ssh_client.get_transport()
            channel = transport.open_session()
            channel.exec_command(run_command)
            while True:
                if channel.exit_status_ready():
                    channel.close()
                    transport.close()
                    ssh.close_ssh_connection()
                    break
                else:
                    self.script_report["output"] = self.script_report["output"] + str(
                        channel.recv(8092).decode('UTF-8'))
                    print("update output of script", self.script_name, self.execution_id, self.script_report["output"])
                    self.__update_script_report()
                    time.sleep(0.5)

            return True

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:exec_remote_script")
            print(e)
            return {"failure": str(e)}

    @staticmethod
    def script_session():

        try:
            """ this function returns a run playbook session """
            # the run playbook session is a hash value from the run date and time
            s = datetime.datetime.isoformat(datetime.datetime.now()).encode()
            return hashlib.sha1(s).hexdigest()

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:script_session")
            print(e)
            return {"failure": str(e)}

    def prepare_ansible_backend_env(self):
        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:func:prepare_ansible_backend_env")
            self.ansible_session_dir = os.path.join(
                self.realm_settings["hits"]["hits"][0]["_source"]["ansible"]["inventory"]["location"],
                self.script_realm
            )
            os.makedirs(self.ansible_session_dir, exist_ok=True)

        except Exception as err:
            print("backend Exception, file:scriptManager:class:scriptManager:func:prepare_ansible_backend_env")
            print(err)
            return {"failure": str(err)}

    def prepare_ansible_playbook(self):

        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:func:prepare_ansible_playbook")
            self.ansible_playbook_file = os.path.join(
                self.ansible_session_dir,
                self.script_filename
            )
            with open(self.ansible_playbook_file, 'w+') as pbf:
                pbf.write(self.script_content)

        except Exception as err:
            print("backend Exception, file:scriptManager:class:scriptManager:func:prepare_ansible_playbook")
            print(err)
            return {"failure": str(err)}

    def make_ansible_inventory_data(self, node_name):

        """ this function returns true if the inventory file is successfully created else false """
        # this function write the ansible inventory for the ongoing session
        # as defined in ansible recommendation. it writes ansible inventory group between [] with
        # the session id name composed of nodes identities such as ip, fqdn or hostnames.
        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:func:make_ansible_inventory_data")
            with open(self.ansible_inventory_file, 'w') as inventory:

                crypto = self.realm_settings["hits"]["hits"][0]["_source"]["crypto"]
                ansible_user = self.realm_settings["hits"]["hits"][0]["_source"]["ansible"]["username"]
                ansible_password = self.realm_settings["hits"]["hits"][0]["_source"]["ansible"]["password"]
                ansible_certificate = self.realm_settings["hits"]["hits"][0]["_source"]["ansible"]["certificate"]

                # write the inventory ansible group to tag with the session id
                # to tag the nodes targeted by this session.
                inventory.write('[' + self.ansible_session_id + ']\n')

                # we have a list of node id we need to map the node id into network element
                # reachable via network.
                for hostname in node_name:
                    inventory.write(hostname + '\n')

                inventory.write('\n')
                inventory.write('[' + self.ansible_session_id + ':vars]\n')
                inventory.write('ansible_ssh_common_args=\'-o StrictHostKeyChecking=no\'\n')
                inventory.write('ansible_user=' + ansible_user + '\n')

                if ansible_password != "":
                    inventory.write(
                        str('ansible_password=' + decrypt_password(crypto, ansible_password) + '\n'))
                elif ansible_certificate != "":
                    inventory.write(str(' ansible_ssh_private_key_file=' + ansible_certificate + '\n'))
                else:
                    pass

            return True

        except Exception as err:
            print("backend Exception, file:scriptManager:class:scriptManager:func:make_ansible_inventory_data")
            print(err)
            return {"failure": str(err)}

    def prepare_ansible_backend_inventory(self, node_name):

        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:func:prepare_ansible_backend_inventory")
            """ this function returns true if the file is created else false """
            self.ansible_inventory_file = os.path.join(self.ansible_session_dir, self.ansible_session_id)
            os.mknod(self.ansible_inventory_file)
            return True if self.make_ansible_inventory_data(node_name) else False

        except Exception as err:
            print("backend Exception, file:scriptManager:class:scriptManager:func:prepare_ansible_backend_inventory")
            print(err)
            return {"failure": str(err)}

    def prepare_ansible_backend(self, node_name: list):

        self.ansible_session_id = self.script_session()
        self.prepare_ansible_backend_env()
        self.prepare_ansible_playbook()
        self.prepare_ansible_backend_inventory(node_name)

    def run_ansible_script(self):

        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:function:run_ansible_script")
            node_name = []
            for ansible_node_id in self.node_id:
                node_data = self.node_details(self.script_realm, ansible_node_id)["hits"]["hits"][0]
                if node_data["_source"]["scan_by_ip"]:
                    node_name.append(node_data["_source"]["ip_reference"])
                else:
                    node_name.append(node_data["_source"]["name"])
            self.prepare_ansible_backend(node_name)
            ansible_cmd = ["ansible-playbook", "-i", self.ansible_inventory_file, self.ansible_playbook_file]
            with subprocess.Popen(ansible_cmd, stdout=subprocess.PIPE) as proc:
                while proc.poll() is None:
                    self.script_report["output"] = self.script_report["output"] + str(proc.stdout.read().decode('UTF-8'))
                    self.__update_script_report()
                    time.sleep(0.5)
            self.__close_script_report()
            return True

        except Exception as err:
            print("backend Exception, file:scriptManager:class:scriptManager:func:run_ansible_script")
            print(err)
            return {"failure": str(err)}

    def run_no_ansible_script(self):
        """
        This function executes a script on a remote node
        :param script_id: is the script_id to be execute
        :param node_id: is the node_id of the target host where to execute the script
        """
        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:function:run_no_ansible_script")
            node_data = self.node_details(self.script_realm, self.node_id)["hits"]["hits"][0]["_source"]
            node_name = node_data["ip_reference"] if node_data["scan_by_ip"] else node_data["name"]
            self.build_remote_env(node_name, self.script_content, self.script_destination)
            self.exec_remote_script(node_name)
            self.__close_script_report()
            self.destroy_remote_env(node_name, self.script_destination)
            return True

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:run_no_ansible_script")
            print(e)
            return {"failure": str(e)}

    def execute_script(self, **kwargs):
        """
        This function executes the script identified by the given script id
        """
        try:
            print(" >>> Enter file:scriptManager:class:scriptManager:function:execute_script")
            self.node_id = kwargs["node_id"]
            self.script_id = kwargs["script_id"]
            self.script_realm = kwargs["script_realm"]
            self.scenario_id = kwargs["scenario_id"]
            self.execution_id = kwargs["execution_id"]
            self.realm_settings = self.settings.list_by_realm(self.script_realm)

            # Get script definition from elasticsearch and assign local variable to prepare script execution
            scr = self.script_details(self.script_realm, self.script_id)
            self.script_name = scr["_source"]["name"]
            self.script_content = scr["_source"]["content"]
            self.script_description = scr["_source"]["description"]
            self.script_type = scr["_source"]["type"]
            self.script_filename = scr["_source"]["filename"]
            self.script_args = scr["_source"]["args"]

            self.script_destination = os.path.join(
                self.realm_settings["hits"]["hits"][0]["_source"]["ssh"]["location"],
                self.script_realm,
                str(self.execution_id + '_' + self.script_id),
                self.script_filename
            )
            self.script_locker = os.path.join(
                self.realm_settings["hits"]["hits"][0]["_source"]["ssh"]["location"],
                self.script_realm,
                str(self.execution_id + '_' + self.script_id),
                self.script_id + '.lock'
            )

            print("execute_script", self.script_name, self.execution_id)
            if self.__open_script_report():
                self.run_ansible_script() if self.script_type == "Ansible" else self.run_no_ansible_script()

        except Exception as e:
            print("backend Exception, file:scriptManager:class:scriptManager:func:execute_script")
            print(e)
            return {"failure": str(e)}
