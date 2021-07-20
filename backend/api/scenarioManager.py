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
import yaml
import datetime
import threading
from api import node
from api import scenario
from api import reporter
from api import scriptManager
from api import script


class ScenarioManager:

    def __init__(self, ESConnector):
        try:
            self.ES = ESConnector
            self._backend_config_file = "/etc/blast.eu.com/backend.yml"
            with open(self._backend_config_file, 'r') as file:
                config = yaml.load(file, Loader=yaml.FullLoader)
                self._scenario_max_parallel_script_threads = config["backend"]["manager"]["scenario"]["max_parallel_script_threads"]

        except Exception as e:
            self._scenario_max_parallel_script_threads = 2

        finally:
            # initialize the management doc id this manager will be responsible of
            self._scenario_id = None
            self._scenario_name = None
            self._scenario_description = None
            self._scenario_scripts_id = []
            self._scenario_nodes_id = []
            self._scenario_realm = None
            self._scenario_report = {}
            self._scenario_report_id = None
            self._scenario_exec_script_in_parallel_mode = False
            self._scenario_executor = None
            self._scenario_thread_list = []
            self._scenario_source = {}
            self._execution_id = None

    @property
    def scenario_id(self):
        return self._scenario_id

    @scenario_id.setter
    def scenario_id(self, scenario_id: str):
        self._scenario_id = scenario_id

    @property
    def scenario_name(self):
        return self._scenario_name

    @scenario_name.setter
    def scenario_name(self, scenario_name: str):
        self._scenario_name = scenario_name

    @property
    def scenario_description(self):
        return self._scenario_description

    @scenario_description.setter
    def scenario_description(self, scenario_description: list):
        self._scenario_description = scenario_description

    @property
    def scenario_scripts_id(self):
        return self._scenario_scripts_id

    @scenario_scripts_id.setter
    def scenario_scripts_id(self, scenario_scripts_id: list):
        self._scenario_scripts_id = scenario_scripts_id

    @property
    def scenario_nodes_id(self):
        return self._scenario_nodes_id

    @scenario_nodes_id.setter
    def scenario_nodes_id(self, scenario_nodes_id: list):
        self._scenario_nodes_id = scenario_nodes_id

    @property
    def scenario_realm(self):
        return self._scenario_realm

    @scenario_realm.setter
    def scenario_realm(self, scenario_realm: str):
        self._scenario_realm = scenario_realm

    @property
    def scenario_report(self):
        return self._scenario_report

    @scenario_report.setter
    def scenario_report(self, scenario_report: dict):
        self._scenario_report = scenario_report

    @property
    def scenario_report_id(self):
        return self._scenario_report_id

    @scenario_report_id.setter
    def scenario_report_id(self, scenario_report_id: str):
        self._scenario_report_id = scenario_report_id

    @property
    def scenario_exec_script_in_parallel_mode(self):
        return self._scenario_exec_script_in_parallel_mode

    @scenario_exec_script_in_parallel_mode.setter
    def scenario_exec_script_in_parallel_mode(self, scenario_exec_script_in_parallel_mode: bool):
        self._scenario_exec_script_in_parallel_mode = scenario_exec_script_in_parallel_mode

    @property
    def scenario_max_parallel_script_threads(self):
        return self._scenario_max_parallel_script_threads

    @scenario_max_parallel_script_threads.setter
    def scenario_max_parallel_script_threads(self, scenario_max_parallel_script_threads: str):
        self._scenario_max_parallel_script_threads = scenario_max_parallel_script_threads

    @property
    def scenario_thread_list(self):
        return self._scenario_thread_list

    @scenario_thread_list.setter
    def scenario_thread_list(self, scenario_thread_list):
        self._scenario_thread_list = scenario_thread_list

    @property
    def scenario_executor(self):
        return self._scenario_executor

    @scenario_executor.setter
    def scenario_executor(self, scenario_executor: str):
        self._scenario_executor = scenario_executor

    @property
    def scenario_source(self):
        return self._scenario_source

    @scenario_source.setter
    def scenario_source(self, scenario_source: dict):
        self._scenario_source = scenario_source

    @property
    def execution_id(self):
        return self._execution_id

    @execution_id.setter
    def execution_id(self, execution_id):
        self._execution_id = execution_id

    def __close_scenario_report(self):
        """
        Request the management to create a new doc inside the database with initial informations
        """
        try:
            print(" >>> Enter file:scenarioManager:class:scenarioManager:function:__close_scenario_report")
            self.scenario_report["status"] = "ended"
            self.scenario_report["end_at"] = datetime.datetime.isoformat(datetime.datetime.utcnow())
            self.scenario_report["duration"]["end_at"] = datetime.datetime.now().timestamp()
            self.scenario_report["duration"]["time"] = self.scenario_report["duration"]["end_at"] - self.scenario_report["duration"]["start_at"]
            scenario_reporter = reporter.Reporter(self.ES, report_type="scenario")
            resp = scenario_reporter.update(self.scenario_report_id, self.scenario_report)
            return True if resp["result"] == "updated" else False

        except Exception as e:
            print("backend Exception, file:scenarioManager:class:scenarioManager:func:__close_scenario_report")
            print(e)
            return {"failure": str(e)}

    def update_stack_scripts_in_parallel(self, execute_script_kwargs: dict):

        try:
            print(" >>> Enter file:scenarioManager:class:scenarioManager:function:update_stack_scripts_in_parallel")
            script_manager = scriptManager.ScriptManager(self.ES)
            # check the buffer occupacity
            # we dont want start more thread than requested
            if len(self.scenario_thread_list) < self.scenario_max_parallel_script_threads:
                self.scenario_thread_list.append(
                    threading.Thread(
                        target=script_manager.execute_script,
                        args=(),
                        kwargs=execute_script_kwargs
                    )
                )

            else:
                # if the thread buffer is full
                # wait for all thread finishes before to clean up the buffer
                # then start current thread and continue with new ones
                for thread in self.scenario_thread_list:
                    thread.join()
                self.scenario_thread_list = []
                self.scenario_thread_list.append(
                    threading.Thread(
                        target=script_manager.execute_script,
                        args=(),
                        kwargs=execute_script_kwargs
                    )
                )

            idx = len(self.scenario_thread_list) - 1
            self.scenario_thread_list[idx].start()
            return True

        except Exception as err:
            print("backend Exception, file:scenarioManager:class:scenarioManager:func:update_stack_scripts_in_parallel")
            print(err)
            return {"failure": str(err)}

    def execute_scripts_in_parallel(self):
        """
        This function runs a set of scenario by id
        The execution mode is mandatory, the scenario execution can be parallel or sequential
        :param scenario_ids: the list of scenario to be executed
        :param scenario_parallel_mode: the execution must be parallel or not
        """
        try:
            scr = script.Script(self.ES)
            nod = node.Node(self.ES)
            scr_mapping = scr.map_id_name(self.scenario_realm, self.scenario_scripts_id)
            nod_mapping = nod.map_id_name(self.scenario_realm, self.scenario_nodes_id)
            for script_name in sorted(scr_mapping):
                script_type = scr.list_by_names(self.scenario_realm, script_name.split())["hits"]["hits"][0]["_source"]["type"]
                if script_type != "Ansible":
                    for node_name in sorted(nod_mapping):
                        node_id = nod_mapping[node_name]
                        if nod.is_running(self.scenario_realm, node_id):
                            execute_script_kwargs = {
                                "script_id": scr_mapping[script_name],
                                "node_id": node_id.split(),
                                "script_realm": self.scenario_realm,
                                "scenario_id": self.scenario_id,
                                "execution_id": self.execution_id
                            }
                            self.update_stack_scripts_in_parallel(execute_script_kwargs)

                else:
                    execute_script_kwargs = {
                        "script_id": scr_mapping[script_name],
                        "node_id": [nod_mapping[node_name] for node_name in sorted(nod_mapping) if nod.is_running(self.scenario_realm, nod_mapping[node_name])],
                        "script_realm": self.scenario_realm,
                        "scenario_id": self.scenario_id,
                        "execution_id": self.execution_id
                    }
                    self.update_stack_scripts_in_parallel(execute_script_kwargs)

            # make all threads are done before exiting this function
            if len(self.scenario_thread_list) > 0:
                for thread in self.scenario_thread_list:
                    thread.join()

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def execute_scripts_in_sequential(self):
        """
        This function execute scripts sequentialy
        """
        try:
            scr = script.Script(self.ES)
            nod = node.Node(self.ES)
            scr_mapping = scr.map_id_name(self.scenario_realm, self.scenario_scripts_id)
            nod_mapping = nod.map_id_name(self.scenario_realm, self._scenario_nodes_id)
            for script_name in sorted(scr_mapping):
                for node_name in sorted(nod_mapping):
                    node_id = nod_mapping[node_name]
                    if nod.is_running(self.scenario_realm, node_id):
                        execute_script_kwargs = {
                            "script_id": scr_mapping[script_name],
                            "node_id": node_id.split(),
                            "script_realm": self.scenario_realm,
                            "scenario_id": self.scenario_id,
                            "execution_id": self.execution_id
                        }
                        script_manager = scriptManager.ScriptManager(self.ES)
                        script_manager.execute_script(execute_script_kwargs)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def execute_scenario(self, **kwargs):
        """
        This function is used to execute a given scenario.
        The function arg is an object containing either : scenario_id (identifier) or scenario (source)
        :param scenario_id: the scenario id to be executed
        :param scenario: the source of the scenario to be executed
        """
        try:
            print(" >>> Enter file:scenarioManager:class:scenarioManager:function:execute_scenario")
            self.scenario_source = kwargs["scenario"]
            self.scenario_id = kwargs["scenario_id"]
            self.scenario_realm = kwargs["scenario_realm"]
            self.execution_id = kwargs["execution_id"]

            self.scenario_name = self.scenario_source["name"]
            self.scenario_description = self.scenario_source["description"]
            # self.scenario_exec_script_in_parallel_mode = self.scenario_source["flag_parallel_mode"]
            self.scenario_exec_script_in_parallel_mode = True
            self.scenario_nodes_id = self.scenario_source["nodes"]
            self.scenario_scripts_id = self.scenario_source["scripts"]

            if self.__open_scenario_report(self.scenario_id, self.scenario_source):
                if self.scenario_exec_script_in_parallel_mode:
                    self.execute_scripts_in_parallel()
                else:
                    self.execute_scripts_in_sequential()

            return True if self.__close_scenario_report() else False

        except Exception as e:
            print("backend Exception, file:scenarioManager:class:scenarioManager:func:execute_scenario")
            print(e)
            return {"failure": str(e)}

    def is_all_threads_alive(self):

        is_terminated = True
        for thread in self.scenario_thread_list:
            if thread.is_alive():
                is_terminated = False

        return is_terminated

    def __open_scenario_report(self, scenario_id: str, scenario: dict):
        """
        Request the management to create a new doc inside the database with initial informations
        :param scenario: is a json scenario containing minimal information request passed to the manager
        """
        try:
            print(" >>> Enter file:scenarioManager:class:scenarioManager:function:__open_scenario_report")
            self.scenario_report = {
                "report_type": "scenario",
                "account_email": scenario["account_email"],
                "name": scenario["name"],
                "description": scenario["description"],
                "realm": scenario["realm"],
                "scenario_id": scenario_id,
                "script_ids": self.scenario_scripts_id,
                "status": "running",
                "start_at": datetime.datetime.isoformat(datetime.datetime.utcnow()),
                "execution_id": self.execution_id,
                "duration": {
                    "start_at": datetime.datetime.now().timestamp()
                }
            }
            scenario_reporter = reporter.Reporter(self.ES, report_type="scenario")
            resp = scenario_reporter.__add__(self.scenario_report)
            if resp["result"] == "created":
                self.scenario_report_id = resp["_id"]
                return True
            else:
                return False

        except Exception as e:
            print("backend Exception, file:scenarioManager:class:scenarioManager:func:__open_scenario_report")
            print(e)
            return {"failure": str(e)}
