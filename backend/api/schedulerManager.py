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

import yaml
import base64
import string
import random
import datetime
import threading
from api import scenario
from api import scenarioManager
from api import reporter


class SchedulerManager:

    def __init__(self, ESConnector):
        try:
            self.ES = ESConnector
            self._backend_config_file = "/etc/blast.eu.com/backend.yml"
            with open(self._backend_config_file, 'r') as f:
                config = yaml.load(f, Loader=yaml.FullLoader)
                self._scheduler_max_parallel_scenario_threads = config["backend"]["manager"]["scheduler"]["max_parallel_scenario_threads"]
                self._scheduler_user = config["scheduler"]["user"]

        except Exception:
            self._scheduler_max_parallel_scenario_threads = 2

        finally:
            self._scheduler_id = None
            self._scheduler_name = None
            self._scheduler_description = None
            self._scheduler_account_email = None
            self._scheduler_exec_scenario_in_parallel_mode = None
            self._scheduler_thread_list = []
            self._scheduler_realm = None
            self._scheduler_scenario_ids = []
            self._scheduler_report = {}
            self._scheduler_report_id = None
            self._execution_id = None

    @property
    def scheduler_id(self):
        return self._scheduler_id

    @scheduler_id.setter
    def scheduler_id(self, scheduler_id: str):
        self._scheduler_id = scheduler_id

    @property
    def scheduler_name(self):
        return self._scheduler_name

    @scheduler_name.setter
    def scheduler_name(self, scheduler_name: str):
        self._scheduler_name = scheduler_name

    @property
    def scheduler_description(self):
        return self._scheduler_description

    @scheduler_description.setter
    def scheduler_description(self, scheduler_description: str):
        self._scheduler_description = scheduler_description

    @property
    def scheduler_scenario_ids(self):
        return self._scheduler_scenario_ids

    @scheduler_scenario_ids.setter
    def scheduler_scenario_ids(self, scheduler_scenario_ids: list):
        self._scheduler_scenario_ids = scheduler_scenario_ids

    @property
    def scheduler_exec_scenario_in_parallel_mode(self):
        return self._scheduler_exec_scenario_in_parallel_mode

    @scheduler_exec_scenario_in_parallel_mode.setter
    def scheduler_exec_scenario_in_parallel_mode(self, scheduler_exec_scenario_in_parallel_mode: bool):
        self._scheduler_exec_scenario_in_parallel_mode = scheduler_exec_scenario_in_parallel_mode

    @property
    def scheduler_realm(self):
        return self._scheduler_realm

    @scheduler_realm.setter
    def scheduler_realm(self, scheduler_realm: str):
        self._scheduler_realm = scheduler_realm

    @property
    def scheduler_account_email(self):
        return self._scheduler_account_email

    @scheduler_account_email.setter
    def scheduler_account_email(self, scheduler_account_email: str):
        self._scheduler_account_email = scheduler_account_email

    @property
    def scheduler_user(self):
        return self._scheduler_user

    @scheduler_user.setter
    def scheduler_user(self, scheduler_user: str):
        self._scheduler_user = scheduler_user

    @property
    def scheduler_max_parallel_scenario_threads(self):
        return self._scheduler_max_parallel_scenario_threads

    @scheduler_max_parallel_scenario_threads.setter
    def scheduler_max_parallel_scenario_threads(self, scheduler_max_parallel_scenario_threads: int):
        self._scheduler_max_parallel_scenario_threads = scheduler_max_parallel_scenario_threads

    @property
    def scheduler_report(self):
        return self._scheduler_report

    @scheduler_report.setter
    def scheduler_report(self, scheduler_report: dict):
        self._scheduler_report = scheduler_report

    @property
    def scheduler_report_id(self):
        return self._scheduler_report_id

    @scheduler_report_id.setter
    def scheduler_report_id(self, scheduler_report_id: str):
        self._scheduler_report_id = scheduler_report_id

    @property
    def scheduler_thread_list(self):
        return self._scheduler_thread_list

    @scheduler_thread_list.setter
    def scheduler_thread_list(self, scheduler_thread_list):
        self._scheduler_thread_list = scheduler_thread_list

    @property
    def execution_id(self):
        return self._execution_id

    @execution_id.setter
    def execution_id(self, execution_id):
        self._execution_id = execution_id

    def __close_scheduler_report(self, ):
        try:
            print(" >>> Enter file:schedulerManager:class:schedulerManager:func:__close_scheduler_report")
            self.scheduler_report["end_at"] = datetime.datetime.isoformat(datetime.datetime.utcnow())
            self.scheduler_report["status"] = "ended"
            self.scheduler_report["duration"]["end_at"] = datetime.datetime.now().timestamp()
            self.scheduler_report["duration"]["time"] = self.scheduler_report["duration"]["end_at"] - self.scheduler_report["duration"]["start_at"]
            new_s = reporter.Reporter(self.ES, report_type="scheduler")
            resp = new_s.update(self.scheduler_report_id, self.scheduler_report)
            return True if resp["result"] == "updated" else False

        except Exception as e:

            print(e)
            return {"failure": str(e)}

    def update_stack_scenario_in_parallel(self, execute_scenario_kwargs: dict):

        scenario_manager = scenarioManager.ScenarioManager(self.ES)
        # check the buffer occupacity because we dont want start more thread than requested
        if len(self.scheduler_thread_list) < self.scheduler_max_parallel_scenario_threads:
            self.scheduler_thread_list.append(
                threading.Thread(
                    target=scenario_manager.execute_scenario,
                    args=(),
                    kwargs=execute_scenario_kwargs
                )
            )

        else:
            # if the thread buffer is full
            # wait for all thread finishes before to clean up the buffer
            # then start current thread and continue with new ones
            for thread in self.scheduler_thread_list:
                thread.join()
            self.scheduler_thread_list = []
            self.scheduler_thread_list.append(
                threading.Thread(
                    target=scenario_manager.execute_scenario,
                    args=(),
                    kwargs=execute_scenario_kwargs
                )
            )

        idx = len(self.scheduler_thread_list) - 1
        self.scheduler_thread_list[idx].start()
        return True

    def execute_scenario_in_parallel(self):

        try:
            print(" >>> Enter file:schedulerManager:class:schedulerManager:func:execute_scenario_in_parallel")

            # request mapping of scenario ids
            # in order to execute scenario by sorted name
            sce = scenario.Scenario(self.ES)
            mapping = sce.map_id_name(self.scheduler_realm, self.scheduler_scenario_ids)

            for sce_name in sorted(mapping):
                scenario_source = sce.list_by_ids(self.scheduler_realm, [mapping[sce_name]])["hits"]["hits"][0]["_source"]
                execute_scenario_kwargs = {
                    "scenario_realm": self.scheduler_realm,
                    "scenario_id": mapping[sce_name],
                    "scenario": scenario_source,
                    "execution_id": self.execution_id
                }
                self.update_stack_scenario_in_parallel(execute_scenario_kwargs)

            # make all threads are done before exiting this function
            if len(self.scheduler_thread_list) > 0:
                for thread in self.scheduler_thread_list:
                    thread.join()

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def execute_scenario_in_sequential(self):

        try:
            print(" >>> Enter file:schedulerManager:class:schedulerManager:func:execute_scenario_in_sequential")
            sce = scenario.Scenario(self.ES)
            scenario_manager = scenarioManager.ScenarioManager(self.ES)
            mapping = sce.map_id_name(self.scheduler_realm, self.scheduler_scenario_ids)

            for sce_name in sorted(mapping):
                scenario_source = sce.list_by_ids(self.scheduler_realm, [mapping[sce_name]])["hits"]["hits"][0]["_source"]
                execute_scenario_kwargs = {
                    "scenario_realm": self.scheduler_realm,
                    "scenario_id": mapping[sce_name],
                    "scenario": scenario_source,
                    "execution_id": self.execution_id
                }
                scenario_manager.execute_scenario(**execute_scenario_kwargs)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def execute_schedule(self, **kwargs):

        try:
            print(" >>> Enter file:schedulerManager:class:schedulerManager:func:execute_schedule")
            self.scheduler_id = kwargs["scheduler_id"]
            self.scheduler_exec_scenario_in_parallel_mode = kwargs["scheduler_source"]["flag_parallel_mode"]
            self.scheduler_name = kwargs["scheduler_source"]["name"]
            self.scheduler_description = kwargs["scheduler_source"]["description"]
            self.scheduler_realm = kwargs["scheduler_source"]["realm"]
            self.scheduler_account_email = kwargs["scheduler_source"]["account_email"]
            self.scheduler_scenario_ids = kwargs["scheduler_source"]["scenario_ids"]
            self.execution_id = str(base64.urlsafe_b64encode(''.join([random.choice(string.ascii_letters + string.digits) for n in range(16)]).encode('utf-8')).decode("utf-8"))

            self.__open_scheduler_report()
            self.execute_scenario_in_parallel() if self.scheduler_exec_scenario_in_parallel_mode else self.execute_scenario_in_sequential()

            return True if self.__close_scheduler_report() else False

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def __open_scheduler_report(self):

        try:
            print(" >>> Enter file:schedulerManager:class:schedulerManager:func:__open_scheduler_report")
            new_s = reporter.Reporter(self.ES, report_type="scheduler")
            self.scheduler_report = {
                "report_type": "scheduler",
                "scheduler_id": self.scheduler_id,
                "name": self.scheduler_name,
                "description": self.scheduler_description,
                "realm": self.scheduler_realm,
                "scenario_ids": self.scheduler_scenario_ids,
                "start_at": datetime.datetime.isoformat(datetime.datetime.utcnow()),
                "status": "running",
                "execution_id": self.execution_id,
                "duration": {
                    "start_at": datetime.datetime.now().timestamp()
                }
            }
            resp = new_s.add(self.scheduler_report)

            if not resp["result"] == "created":
                raise Exception("__open_scheduler_report error: report result not created.")

            self.scheduler_report_id = resp["_id"]

        except Exception as e:
            print(e)
            return {"failure": str(e)}

