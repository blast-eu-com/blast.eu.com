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

import paramiko
from api.setting import Portmap
from api.db import ESConnector


class SSH:

    def __init__(self, *args, **kwargs):
        print("class SSH function INIT:", args, kwargs)
        self.hostname = args[0]
        self.ssh_username = kwargs["username"] if kwargs["username"] != '' else None
        self.ssh_password = kwargs["password"] if kwargs["password"] != '' else None
        self.ssh_certificate = kwargs["certificate"] if kwargs["certificate"] != '' else None
        print(self.hostname, self.ssh_username, self.ssh_password, self.ssh_certificate)
        self.ssh_client = paramiko.client.SSHClient()
        self.sftp_client = None
        self.ssh_client.set_missing_host_key_policy(paramiko.client.AutoAddPolicy())

    def close_ssh_connection(self):
        print(" >>> Enter file:discovery:class:SSH:function:close_ssh_connections")
        self.ssh_client.close()

    def open_ssh_connection(self) -> bool:
        print(" >>> Enter file:discovery:class:SSH:function:open_ssh_connection")
        try:
            if self.ssh_username and self.ssh_certificate is not None:
                """ we do prefer certificate instead of password """
                print('class SSH::open_ssh_connection: connecting using certificate')
                self.ssh_client.connect(hostname=self.hostname, username=self.ssh_username, pkey=self.ssh_certificate)
                return True

            elif self.ssh_username and self.ssh_password is not None:
                """ we do use password if certificate is not set"""
                print('class SSH::open_ssh_connection: connecting using password')
                self.ssh_client.connect(hostname=self.hostname, username=self.ssh_username, password=self.ssh_password)
                return True

            else:
                """ no certificate and no password raise a failure """
                print('class SSH::open_ssh_connection: no password no certificate')
                self.ssh_client = None
                return False

        except paramiko.ssh_exception.AuthenticationException:
            return False

    def open_sftp_connection(self) -> bool:
        print(" >>> Enter file:discovery:class:SSH:function:open_sftp_connection")
        try:
            print('class SSH:open_sftp_connection: ssh_connection successful')
            self.sftp_client = self.ssh_client.open_sftp()
            return True

        except AttributeError as e:
            if self.open_ssh_connection():
                self.sftp_client = self.ssh_client.open_sftp()
                return True

    def close_sftp_connection(self):
        print(" >>> Enter file:discovery:class:SSH:function:close_sft_connection")
        self.close_ssh_connection()


def get_active_network_connection_ipv4(ssh_client):

    print("get active network connection ipv4")
    ssh_command = 'netstat -an -4| egrep -i "^(tcp|udp)"'
    stdin, stdout, stderr = ssh_client.exec_command(ssh_command)
    active_internet_connection = [
        {
            "protocol": line.split()[0],
            "source_ip": line.split()[3].split(":")[0],
            "source_port": line.split()[3].split(':')[1],
            "destination_ip": line.split()[4].split(':')[0],
            "destination_port": line.split()[4].split(':')[1],
            "connection_status": line.split()[5]
        } for line in list(filter(None, stdout.read().decode("UTF-8").split("\n"))) if len(line.split()) > 5
    ]
    print(active_internet_connection)
    return active_internet_connection


def get_active_network_connection_ipv6(ssh_client):

    print("get active network connection ipv6")
    ssh_command = 'netstat -an| egrep -i "^(tcp|udp)"| egrep -v "[0-9]+(\.[0-9]+){3}:([0-9]+){1}"'
    stdin, stdout, stderr = ssh_client.exec_command(ssh_command)
    active_internet_connection = [
        {
            "protocol": line.split()[0],
            "source_ip": ":".join(line.split()[3].split(":")[:len(line.split()[3].split(":"))-1]),
            "source_port": line.split()[3].split(':')[len(line.split()[3].split(":"))-1],
            "destination_ip": ":".join(line.split()[4].split(':')[:len(line.split()[4].split(":"))-1]),
            "destination_port": line.split()[4].split(':')[len(line.split()[4].split(":"))-1],
            "connection_status": line.split()[5]
        } for line in list(filter(None, stdout.read().decode("UTF-8").split("\n"))) if len(line.split()) > 5
    ]
    print(active_internet_connection)
    return active_internet_connection


def get_active_network_connection_inventory(*args) -> list:

    print("get active network connection inventory function INIT")
    ssh_client = args[0]
    reachable = args[1]
    accessible = args[2]
    active_internet_connection = []

    if ssh_client and reachable and accessible:
        # active_connection_ipv6 = get_active_network_connection_ipv6(ssh_client)
        active_connection_ipv4 = get_active_network_connection_ipv4(ssh_client)
        active_internet_connection = active_connection_ipv4
    return active_internet_connection


def is_accessible(ssh_client) -> bool:

    if ssh_client:
        ssh_command = 'echo -n "success"'
        stdin, stdout, stderr = ssh_client.exec_command(ssh_command)
        return True if stdout.read().decode("UTF-8") == 'success' else False


def is_reachable(ssh_client) -> bool:

    if ssh_client:
        ssh_command = 'echo -n "success"'
        stdin, stdout, stderr = ssh_client.exec_command(ssh_command)
        return True if stdout.read().decode("UTF-8") == 'success' else False


def discover(*args, **kwargs) -> dict:

    """ start the hostname discovery """
    print('discover function', kwargs)
    discovery = Discovery(args[0], args[1], kwargs)
    if discovery.server_authentication:
        discovery.start()
        discovery.end()
        return {"ip": discovery.server_ips, "roles": discovery.server_roles, "peers": discovery.server_peers}

    else:
        return {"failure": "SSH Authentication failure"}


def colonize():
    pass


class Discovery:

    def __init__(self, hostname, realm, ssh_settings):
        print('class Discovery function INIT:', hostname, realm, ssh_settings)
        self.hostname = hostname
        self.realm = realm
        self.server_ips = []
        self.server_peers = []
        self.server_roles = []
        self.server_authentication = False
        self.SSH = SSH(self.hostname, **ssh_settings)
        self.portmap = Portmap(ESConnector().es)
        if self.SSH.open_ssh_connection():
            self.server_authentication = True
            self.is_reachable = is_reachable(self.SSH.ssh_client)
            self.is_accessible = is_accessible(self.SSH.ssh_client)
            self.active_network_connection_inventory = get_active_network_connection_inventory(
                self.SSH.ssh_client, self.is_reachable, self.is_accessible)

    @property
    def server_peers(self):
        return self._server_peers

    @server_peers.setter
    def server_peers(self, peers: list):

        """ this function set the server peers list """
        self._server_peers = peers

    @property
    def server_roles(self):
        return self._server_roles

    @server_roles.setter
    def server_roles(self, roles: list):

        """ this function set the server roles list """
        self._server_roles = roles

    @property
    def server_ips(self):
        return self._server_ips

    @server_ips.setter
    def server_ips(self, ips: list):

        """ this function list the hostname ips """
        self._server_ips = ips

    def get_port_role(self, realm, port):
        """ this function return the role from the port number """
        print(" >>> Enter file:discovery:class:Discovery:function:get_port_role")
        role = self.portmap.map_socket(realm, port)
        if role["hits"]["total"]["value"] == 1:
            role["hits"]["hits"][0]["_source"].pop("realm")
            return role["hits"]["hits"][0]["_source"]

    def extract_server_peers(self, active_network_connections: list) -> list:
        """ extract server peers from active network connections """
        print(" >>> Enter file:discovery:class:Discovery:function:active_network_connections")
        return list(filter(None, list(dict.fromkeys([
            peer["destination_ip"] for peer in active_network_connections
            if peer["connection_status"] == "ESTABLISHED" and peer["destination_ip"] not in self.server_ips
        ]))))

    def extract_server_ips(self) -> list:
        """ extract ips from server network settings """
        print(" >>> Enter file:discovery:class:Discovery:function:extract_server_ips")
        if self.SSH.ssh_client and self.is_reachable and self.is_accessible:
            ssh_command = """ 
                       if [[ `which ifconfig &>/dev/null; echo $?` -eq 0 ]]; then
                       `which ifconfig` -a | grep -ioP '((?<=inet )|(?<=inet6 ))([\:\.0-9a-f]+)';
                       elif [[ `which ip &>/dev/null; echo $?` -eq 0 ]]; then
                       `which ip` addr show | grep -ioP '((?<=inet )|(?<=inet6 ))([\:\.0-9a-f]+)';
                       fi
                   """
            stdin, stdout, stderr = self.SSH.ssh_client.exec_command(ssh_command)
            return list(filter(None, stdout.read().decode("UTF-8").split("\n")))

    def extract_server_roles(self, active_network_connections: list) -> list:
        """ this function returns the server roles from active network connections """
        print(" >>> Enter file:discovery:class:Discovery:function:extract_server_roles")
        return list(filter(None, [
            self.get_port_role(self.realm, local["source_port"]) for local in active_network_connections
            if local["connection_status"] == "LISTEN"
        ]))

    def start(self):
        """ this function starts a sequence of discovery actions """
        print(" >>> Enter file:discovery:class:Discovery:function:start")
        if len(self.active_network_connection_inventory) > 0:
            self.server_ips = self.extract_server_ips()
            self.server_peers = self.extract_server_peers(self.active_network_connection_inventory)
            self.server_roles = self.extract_server_roles(self.active_network_connection_inventory)

    def end(self):
        """ this function ends a sequence of discovery actions """
        print(" >>> Enter file:discovery:class:Discovery:function:end")
        print(self.server_ips, self.server_peers, self.server_roles)
        self.SSH.close_ssh_connection()

