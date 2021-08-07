# blast.eu.com

[![Apache_2 license](https://img.shields.io/badge/License-Apache_2-0995d3.svg)](https://www.apache.org/licenses/LICENSE-2.0.html)
[![Blast.eu.com](https://img.shields.io/badge/www-blast.eu.com-ffe893.svg)](https://www.blast.eu.com)
![Contact](https://img.shields.io/badge/contact-support@blast.eu.com-0995d3.svg)

## About
Blast is an Open Source agentless software scheduling and executing jobs scenarios for all types of cloud solutions. 
It allows you to manage and administer your scheduled jobs via a friendly frontend connected to a backend itself 
connected to Elasticsearch. Blast UI offers to the operators the capability to execute recurrent/one-shot jobs on 
one/serveral nodes sequencially/simultaneously. additionally you can browse through your scripts, playbooks and execution results.

## Technologies
This project is created with:
* Bootstrap 5
* Chart 3.0.0
* Daterangepicker 3.1  
* Elasticsearch-Client 7.10
* Fancytree 2.38.0 
* Flask 1.1.2
* Jquery 1.12.4
* Jquery-cookie 1.4.1
* Popper 1.16.1  
* Python 3.7

## Setup

### Online installation
Installation process has been tested with Debian 10.

#### Frontend
From github repository download the installer/frontend/online/blast_frontend_online_installer.sh
```
$ chmod +x blast_frontend_online_installer.sh
$ sudo ./blast_frontend_online_installer.sh
```

Backend
---
#### Install the backend
From github repository download the installer/backend/online/blast_backend_online_installer.sh
```
$ chmod +x blast_backend_online_installer.sh
$ sudo ./blast_backend_online_installer.sh
```

#### Backend connectivity
At the end of the script run, the blast backend will be ready to start listening on 127.0.0.1:28080 using http protocol
if for some reasons the IP address, the port or the protocol must be changed by yourself, so edit the file:
/opt/blast.eu.com/backend/main.ini then modify the appropriated values.

#### Connect the Backend to Elasticsearch
To inform the backend how to connect to the Elasticsearch API, edit the file: /etc/blast.eu.com/backend.yml then in the
elasticsearch section ( as shown below ) update the ip, protocol, port accordingly.

```
elasticsearch:
    # Set the IP address of the Elasticsearch API
    # This value can be an IP address, a hostname or a FQDN
    ip: 127.0.0.1

    # Set the protocol of the Elasticsearch API
    # This value can be http or https
    protocol: http

    # Set the port of the Elasticsearch API
    # This value should be either 9200 or 9300
    port: 9200

```

#### Backend service
Update the service manager and start the blast backend.
```
$ sudo systemctl enable backend.blast.eu.com.service
Created symlink /etc/systemd/system/multi-user.target.wants/backend.blast.eu.com.service -> /lib/systemd/system/backend.blast.eu.com.service.

$ sudo systemctl start backend.blast.eu.com.service

$ systemctl status backend.blast.eu.com.service
* backend.blast.eu.com.service - uWSGI instance for server.blast.eu.com
   Loaded: loaded (/lib/systemd/system/backend.blast.eu.com.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2021-08-08 10:08:59 CEST; 22s ago
 Main PID: 22968 (uwsgi)
   Status: "uWSGI is ready"
    Tasks: 5 (limit: 467)
   Memory: 38.6M
   CGroup: /system.slice/backend.blast.eu.com.service
           |-22968 /opt/blast.eu.com/backend/bin/uwsgi --ini /opt/blast.eu.com/backend/main.ini --stats /opt/blast.eu.com/backend/tmp/uwsgi-statsock
           |-22971 /opt/blast.eu.com/backend/bin/uwsgi --ini /opt/blast.eu.com/backend/main.ini --stats /opt/blast.eu.com/backend/tmp/uwsgi-statsock
           |-22972 /opt/blast.eu.com/backend/bin/uwsgi --ini /opt/blast.eu.com/backend/main.ini --stats /opt/blast.eu.com/backend/tmp/uwsgi-statsock
           |-22973 /opt/blast.eu.com/backend/bin/uwsgi --ini /opt/blast.eu.com/backend/main.ini --stats /opt/blast.eu.com/backend/tmp/uwsgi-statsock
           `-22974 /opt/blast.eu.com/backend/bin/uwsgi --ini /opt/blast.eu.com/backend/main.ini --stats /opt/blast.eu.com/backend/tmp/uwsgi-statsock
```

## Licensing
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




