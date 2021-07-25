#!bin/python3
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
import sys
import copy
import json
import time
import logging
import schedule
import argparse
import threading
import datetime
import requests
import yaml


# -*- SCHEDULER CONFIGURATION -*-
# Load scheduler configuration from local file
# read yaml file content and setup global variables
ARGPARSER = argparse.ArgumentParser()
ARGPARSER.add_argument("--id", help="define the scheduler worker id")
ARGS = ARGPARSER.parse_args()
BACKEND_CONFIG = "/etc/blast.eu.com/backend.yml"
SCHEDULER_WORKER_ID = ARGS.id if ARGS.id else 1
THREAD_LIST = {}
HTTP_TOKEN = None
HTTP_TOKEN_REQUEST_TIME = None
HTTP_TOKEN_MAX_AGE = 10800
STACK_BUILD_TIME = None
sched = schedule.Scheduler()

try:
    f = open(BACKEND_CONFIG, 'r')
    data = yaml.load(f, Loader=yaml.FullLoader)
    f.close()

except FileNotFoundError:
    logging.debug("The server config " + BACKEND_CONFIG + " is missing.")
    sys.exit(1)

try:
    SCHEDULER_LOGGING_PATH = data["scheduler"]["logging"]["path"]
except KeyError:
    SCHEDULER_LOGGING_PATH = "/var/log/blast.eu.com"
finally:
    SCHEDULER_LOGGING_FILE = os.path.join(SCHEDULER_LOGGING_PATH, str("scheduler." + str(SCHEDULER_WORKER_ID) + ".log"))
    logging.basicConfig(filename=SCHEDULER_LOGGING_FILE, level=logging.DEBUG)
    logging.debug(str(" >>> SCHEDULER LOGGING FILE: " + SCHEDULER_LOGGING_FILE))

try:
    PX_HOSTNAME = data["scheduler"]["REST_proxy"]["ip"]
except KeyError:
    # set default nginx proxy hostname value to localhost
    PX_HOSTNAME = "127.0.0.1"
finally:
    logging.debug(str(" >>> PROXY HOSTNAME: " + str(PX_HOSTNAME)))

try:
    PX_PORT = data["scheduler"]["REST_proxy"]["port"]
except KeyError:
    # set default nginx proxy port value to 443
    PX_PORT = "443"
finally:
    logging.debug(str(" >>> PROXY PORT: " + str(PX_PORT)))

try:
    PX_PROTOCOL = data["scheduler"]["REST_proxy"]["protocol"]
except KeyError:
    # set default nginx proxy protocol value to https
    PX_PROTOCOL = "https"
finally:
    logging.debug(str(" >>> PROXY PROTOCOL: " + PX_PROTOCOL))

try:
    SCHEDULER_EMAIL = data["scheduler"]["user"]["email"]
except KeyError:
    # set default scheduler email to scheduler@localhost.localdomain
    SCHEDULER_EMAIL = "scheduler@localhost.localdomain"
finally:
    logging.debug(str(" >>> SCHEDULER EMAIL: " + SCHEDULER_EMAIL))

try:
    SCHEDULER_PASSWORD = data["scheduler"]["user"]["password"]
except KeyError:
    # set default scheduler password to scheduler
    SCHEDULER_PASSWORD = "scheduler"

try:
    SCHEDULER_WORKER_REALMS = data["scheduler"]["worker"][str(SCHEDULER_WORKER_ID)]["realms"]
except KeyError:
    SCHEDULER_WORKER_REALMS = ["default"]
finally:
    logging.debug(str(" >>> SCHEDULER REALMS: " + ','.join(SCHEDULER_WORKER_REALMS)))

try:
    SCHEDULER_STACK_RELOAD = data["scheduler"]["stack"]["reload"]
except KeyError:
    SCHEDULER_STACK_RELOAD = False
finally:
    logging.debug(str(" >>> SCHDEDULER STACK RELOAD: " + str(SCHEDULER_STACK_RELOAD)))

try:
    SCHEDULER_STACK_INTERVAL = data["scheduler"]["stack"]["interval"]
except KeyError:
    SCHEDULER_STACK_INTERVAL = 60
finally:
    logging.debug(str(" >>> SCHEDULER STACK INTERVAL: " + str(SCHEDULER_STACK_INTERVAL)))

def http_proxy_request(action, url, payload=None, cookie=None, header=None):
    """ Generic function passing http request to the blast front end proxy server
    :param action: maybe post or get
    :param url: url of the http API to trigger
    :param payload: data to be sent to the API
    :param cookie: Http cookie to be passed with the request
    :param header: header params to be passed the request
    """
    try:
        if action == "get":
            response = requests.get(url, json=payload, cookies=cookie, headers=header)
        elif action == "post":
            response = requests.post(url, json=payload, cookies=cookie, headers=header)
        else:
            raise SystemError("http request method is not correct must be [get] or [post]")

    except Exception as e:
        logging.debug(" -*- Exception Function http_proxy_request -*- ")
        logging.debug(e)
        sys.exit(1)

    else:
        if response.status_code == 200:
            return response.text
        else:
            raise SystemError("FUNCTION http_proxy_request: Server Error with HTTP return code: " + str(response.status_code))


def http_token():
    """
    Get http token to pass request to the blast front end proxy server
    """
    try:
        url = str(PX_PROTOCOL) + "://" + str(PX_HOSTNAME) + ":" + str(PX_PORT) + "/api/v1/aaa/accounts/authenticate"
        payload = {"email": SCHEDULER_EMAIL, "password": SCHEDULER_PASSWORD}
        globals()['HTTP_TOKEN_REQUEST_TIME'] = datetime.datetime.now().timestamp()
        return json.loads(http_proxy_request("post", url, payload=payload))["jwt"]

    except Exception as e:
        logging.debug(" -*- Exception Function http_token -*- ")
        logging.debug(e)
        sys.exit(1)


def http_token_expired():
    """
    Check validity of the http token
    return True if the http_token_max_age is passed
    """
    try:
        delta = datetime.datetime.now().timestamp() - HTTP_TOKEN_REQUEST_TIME
        return True if int(delta) > HTTP_TOKEN_MAX_AGE else False

    except Exception as e:
        logging.debug(" -*- Exception Function http_token_validity -*- ")
        logging.debug(e)


def realms():
    """ Get all known realms """
    try:
        if SCHEDULER_WORKER_REALMS == "any":
            url = str(PX_PROTOCOL) + "://" + str(PX_HOSTNAME) + ":" + str(PX_PORT) + "/api/v1/realms"
            header = {"Authorization": "Bearer " + HTTP_TOKEN}
            cookie = dict(account=json.dumps(dict(email=SCHEDULER_EMAIL)))
            return [realm["_source"]["name"] for realm in json.loads(http_proxy_request("get", url, cookie=cookie, header=header))["hits"]["hits"]]
        else:
            return SCHEDULER_WORKER_REALMS

    except Exception as e:
        logging.debug(" -*- Exception realms -*- ")
        logging.debug(e)


class Stack:

    def __init__(self, stack={"restart": [], "start": [], "stop": []}):
        """ Defined a stack of schedule jobs """
        self._stack = stack

    @property
    def stack(self):
        return self._stack

    @stack.setter
    def stack(self, stack):
        self._stack = stack

    def count(self, action):
        return len(self.get_by_action(action))

    def get_by_action(self, action):
        return self.stack[action]

    def flush(self):
        self.stack = {"restart": [], "start": [], "stop": []}

    def add(self, action, data):
        self.stack[action].append(data)

    def rem(self, action, id):
        for i in range(len(self.stack[action])):
            if self.stack[action][i]["id"] == id:
                self.stack[action].pop(i)

    def exist(self, action, id):
        for sched in self.stack[action]:
            if sched["id"] == id:
                return True
        return False


TEMP_STACK = Stack()
PERM_STACK = copy.deepcopy(TEMP_STACK)
HTTP_TOKEN = http_token()


def schedules(realm: str):
    """
    Get all the known schedule jobs by realm
    :param realm: the realm name you want to collect schedules from
    """
    try:
        url = str(PX_PROTOCOL) + "://" + str(PX_HOSTNAME) + ":" + str(PX_PORT) + "/api/v1/realms/" + str(realm) + "/schedulers"
        header = {"Authorization": "Bearer " + HTTP_TOKEN}
        cookie = dict(account=json.dumps(dict(email=SCHEDULER_EMAIL)))
        return http_proxy_request("get", url, cookie=cookie, header=header)

    except Exception as se:
        logging.debug(" -*- Function Schedules -*- ")
        logging.debug(se)


def settings(realm: str):
    """
    Get settings of a given realm
    :param realm: the realm name you want to collect the settings of
    """
    try:
        url = str(PX_PROTOCOL) + "://" + str(PX_HOSTNAME) + ":" + str(PX_PORT) + "/api/v1/realms/" + str(realm) + "/settings"
        header = {"Authorization": "Bearer " + HTTP_TOKEN}
        cookie = dict(account=json.dumps(dict(email=SCHEDULER_EMAIL)))
        return http_proxy_request("get", url, cookie=cookie, header=header)

    except Exception as e:
        logging.debug(" -*- Exception Function Settings -*- ")
        logging.debug(e)


def get_all_schedule():

    """ Get from elastic all the schedule registered no matter what realm it runs"""
    SCHEDULES = []
    try:
        for realm in realms():
            sched = [sched for sched in json.loads(schedules(realm))["hits"]["hits"]]
            if sched is not None:
                SCHEDULES.extend(sched)
        return SCHEDULES

    except Exception as e:
        logging.debug(" -*- Exception Function Get_all_schedule -*- ")
        logging.debug(e)


def stack_destroy_temp():

    logging.debug(" -*- Function Flust_temp -*- ")
    logging.debug("Flushing temp buffer")
    TEMP_STACK.flush()


def stack_build_temp():

    logging.debug("# function -> build_temp")
    for sched in get_all_schedule():
        if sched["_source"]["status"] == "start":
            logging.debug("* adding " + str(sched["_id"]) + " to start buffer")
            TEMP_STACK.add("start", {"id": sched["_id"], "data": sched["_source"], "status": "new"})

        elif sched["_source"]["status"] == "stop":
            logging.debug("* adding " + str(sched["_id"]) + " to stop buffer")
            TEMP_STACK.add("stop", {"id": sched["_id"], "data": sched["_source"], "status": "new"})

        elif sched["_source"]["status"] == "restart":
            logging.debug("* adding " + str(sched["_id"]) + " to restart buffer")
            TEMP_STACK.add("restart", {"id": sched["_id"], "data": sched["_source"], "status": "new"})


def stack_update_perm():

    try:
        globals()['STACK_BUILD_TIME'] = datetime.datetime.now().timestamp()

        for sched in TEMP_STACK.get_by_action("restart"):
            if not PERM_STACK.exist("restart", sched["id"]):
                PERM_STACK.add("restart", sched)

        for sched in TEMP_STACK.get_by_action("start"):
            if not PERM_STACK.exist("start", sched["id"]):
                PERM_STACK.add("start", sched)

        for sched in TEMP_STACK.get_by_action("stop"):
            if PERM_STACK.exist("start", sched["id"]):
                PERM_STACK.rem("start", sched["id"])
                PERM_STACK.add("stop", sched)

    except Exception as e:
        logging.debug(" -*- Exception Function stack_update_perm -*- ")
        logging.debug(str(e))


def stack_expired():

    try:
        delta = datetime.datetime.now().timestamp() - STACK_BUILD_TIME
        return True if int(delta) > int(SCHEDULER_STACK_INTERVAL) else False

    except Exception as e:
        logging.debug(" -*- Exception Function stack_expired -*- ")
        logging.debug(str(e))


def stack_parse():

    try:
        if PERM_STACK.count("start") > 0:
            schedule_start_runner = threading.Thread(
                target=action_schedule_threads,
                name="starter",
                args=("start",)
            )
            schedule_start_runner.start()

        if PERM_STACK.count("stop") > 0:
            schedule_stop_runner = threading.Thread(
                target=action_schedule_threads,
                name="stopper",
                args=("stop",)
            )
            schedule_stop_runner.start()

        if PERM_STACK.count("restart") > 0:
            schedule_restart_runner = threading.Thread(
                target=action_schedule_threads,
                name="restarter",
                args=("restart",)
            )
            schedule_restart_runner.start()

        if 'schedule_start_runner' in locals() and schedule_start_runner.is_alive():
            schedule_start_runner.join()

        if 'schedule_stop_runner' in locals() and schedule_stop_runner.is_alive():
            schedule_stop_runner.join()

        if 'schedule_restart_runner' in locals() and schedule_restart_runner.is_alive():
            schedule_restart_runner.join()

    except Exception as e:
        logging.debug(" -*- Exception Function stack_parse -*- ")
        logging.debug(str(e))


def stack_init_all():

    stack_destroy_temp()
    stack_build_temp()
    stack_update_perm()
    stack_parse()


def exec_scheduler(realm, schedule_id):
    logging.debug(" -*-*-*- Function exec_scheduler -*-*-*- ")
    url = str(PX_PROTOCOL) + "://" + str(PX_HOSTNAME) + ":" + str(PX_PORT) + "/api/v1/realms/" + str(realm) + "/schedulers/execute"
    header = {"Authorization": "Bearer " + HTTP_TOKEN}
    cookie = dict(account=json.dumps(dict(email=SCHEDULER_EMAIL)))
    payload = {"schedule_ids": {"ids": [schedule_id]}}
    http_proxy_request("post", url, payload=payload, cookie=cookie, header=header)


def start_schedule_thread(schedule):
    logging.debug(" -*- Function start_schedule_thread -*- ")
    logging.debug("Start schedule job id: " + schedule["id"])
    logging.debug(schedule)
    schedule_id = schedule["id"]
    schedule_data = schedule["data"]
    schedule_frequency = schedule_data["frequency"]
    for day in schedule_frequency["daily"].keys():
        if day == 'all' and schedule_frequency["daily"][day]:
            logging.debug("enter day ALL")
            if schedule_frequency["interval"]["min"] != '0':
                logging.debug("enter exec at min")
                schedule_cmd = "Execute command: sched.every(" + str(schedule_frequency["interval"]["min"]) + ").minutes.do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                logging.debug(str(schedule_cmd))
                sched.every(int(schedule_frequency["interval"]["min"])).minutes.do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))

            elif schedule_frequency["interval"]["sec"] != '0':
                logging.debug("enter exec at sec")
                schedule_cmd = "Execute command: sched.every(" + str(schedule_frequency["interval"]["sec"]) + ").seconds.do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                logging.debug(str(schedule_cmd))
                sched.every(int(schedule_frequency["interval"]["sec"])).seconds.do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))

            elif schedule_frequency["time"] != '1970-01-01T00:00:000Z':
                logging.debug("enter exec at time")
                schedule_cmd = "Execute command : sched.every().day.at(" + str(schedule_frequency["time"]) + ").do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                logging.debug(str(schedule_cmd))
                sched.every().day.at(int(schedule_frequency["time"])).do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))

            break

        elif day != 'all' and schedule_frequency["daily"][day]:
            if "time" in schedule_data.keys() and schedule_frequency["time"] != '':
                if day == "monday":
                    schedule_cmd = "Execute command: sched.every().monday.at(" + str(schedule_frequency["time"]) + ").do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                    logging.debug(str(schedule_cmd))
                    sched.every().monday.at(str(schedule_frequency["time"])).do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))

                elif day == "tuesday":
                    schedule_cmd = "Execute command: sched.every().tuesday.at(" + str(schedule_frequency["time"]) + ").do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                    logging.debug(str(schedule_cmd))
                    sched.every().tuesday.at(str(schedule_frequency["time"])).do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))

                elif day == "wednesday":
                    schedule_cmd = "Execute command: sched.every().wednesday.at(" + str(schedule_frequency["time"]) + ").do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                    logging.debug(str(schedule_cmd))
                    sched.every().tuesday.at(str(schedule_frequency["time"])).do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))

                elif day == "thursday":
                    schedule_cmd = "Execute command: sched.every().thursday.at(" + str(schedule_frequency["time"]) + ").do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                    logging.debug(str(schedule_cmd))
                    sched.every().thursday.at(str(schedule_frequency["time"])).do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))

                elif day == "friday":
                    schedule_cmd = "Execute command: sched.every().friday.at(" + schedule_frequency["time"] + ").do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                    logging.debug(str(schedule_cmd))
                    sched.every().friday.at(str(schedule_frequency["time"])).do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))

                elif day == "saturday":
                    schedule_cmd = "Execute command: sched.every().saturday.at(" + schedule_frequency["time"] + ").do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                    logging.debug(str(schedule_cmd))
                    sched.every().saturday.at(str(schedule_frequency["time"])).do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))

                elif day == "sunday":
                    schedule_cmd = "Execute command: sched.every().sunday.at(" + schedule_frequency["time"] + ").do(" + str(exec_scheduler) + ").tag(" + str(schedule_id) + ")"
                    logging.debug(str(schedule_cmd))
                    sched.every().sunday.at(str(schedule_frequency["time"])).do(exec_scheduler, schedule_data["realm"], schedule_id).tag(str(schedule_id))


def stop_schedule_thread(schedule):

    logging.debug("Function stop_schedule_thread")
    logging.debug("Stop schedule job id: " + schedule["id"])
    sched.clear(schedule["id"])
    PERM_STACK.rem("stop", schedule["id"])


def action_schedule_threads(action):

    if action == "start":
        logging.debug("Function start_schedule_threads")
        for schedule in PERM_STACK.get_by_action("start"):
            if schedule["status"] == "new":
                start_schedule_thread(schedule)
                schedule["status"] = "run"

    elif action == "stop":
        logging.debug("Function stop_schedule_threads")
        for schedule in PERM_STACK.get_by_action("stop"):
            if schedule["status"] == "new":
                stop_schedule_thread(schedule)
                schedule["status"] = "run"

    elif action == "restart":
        logging.debug("Function restart_schedule_threads")
        for schedule in PERM_STACK.get_by_action("restart"):
            if not schedule["restart"] == "new":
                print("boom")
                schedule["status"] = "run"


def main():

    while True:

        if http_token_expired():
            globals()['HTTP_TOKEN'] = http_token()

        if STACK_BUILD_TIME is None or SCHEDULER_STACK_RELOAD and stack_expired():
            stack_init_all()

        # logging.debug(sched.jobs)
        sched.run_pending()
        time.sleep(0.5)


if __name__ == "__main__":
    main()
