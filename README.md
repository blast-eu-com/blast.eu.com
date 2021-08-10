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

Backend
---
#### I. Install the backend
From github repository download the installer /backend/online/blast_backend_online_installer.sh

By default the install script will configure the backend to listen on http://127.0.0.1:28080. If this configuration 
doesn't fit your expectation then you can update the install script by updating the following variables.

> NB: The release 1.1 supports HTTP protocol only ( HTTPS will be supported in coming release .) You can take the
responsibility to update the ini file named further in the documentation.
```buildoutcfg
BLAST_BACKEND_HOSTNAME="127.0.0.1"
BLAST_BACKEND_PORT="28080"
BLAST_BACKEND_PROTOCOL="http"
```

Once the script is updated according to your needs you can start the automatic install as shown below

```buildoutcfg
$ chmod +x blast_backend_online_installer.sh
$ sudo ./blast_backend_online_installer.sh
```

For any late changes you can still edit the file /opt/blast.eu.com/backend/main.ini and update it accordingly.

#### II. Connect the Backend to Elasticsearch
To inform the backend how to connect to the Elasticsearch API, edit the file: /etc/blast.eu.com/backend.yml then in the
elasticsearch section ( as shown below ) update the ip, protocol, port accordingly.

```buildoutcfg
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

#### III. Load Backend datamodel

In order to create the indices and the index mapping in Elasticsearch, you will need to run the builder as shown below

```buildoutcfg
$ cd /opt/blast.eu.com/backend/builder
$ sudo chmod +x builder.sh
$ sudo ./builder.sh
```

> NB: By default every index is configured with 1 Primary shard without replicated shards. You are free to change the number
of replicated shards based on your cluster redundancy and design.

#### IV. Backend service
Update the service manager and start the blast backend.
```buildoutcfg
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

Frontend
---
#### I. Install the Frontend
From github repository download the installer/frontend/online/blast_frontend_online_installer.sh

By default the install script will configure NGINX to listen on http://127.0.0.1:18080 and forward API requests to the backend
listening on http://127.0.0.1:28080. If during the backend installation you have used custom values or if you want
the frontend to start listening on some custom values other than the one set by default, then it will be mandatory
to update the frontend install script to match these new values as shown below.

```buildoutcfg
BLAST_FRONTEND_ACTIVE_PROTO="HTTP"
BLAST_FRONTEND_HTTP_PORT="18080"
BLAST_FRONTEND_HTTPS_PORT="10443"
BLAST_BACKEND_HOSTNAME="127.0.0.1"
BLAST_BACKEND_PORT="28080"
```

Once the script is updated according to your needs you can start the automatic install as shown below

```buildoutcfg
$ chmod +x blast_frontend_online_installer.sh
$ sudo ./blast_frontend_online_installer.sh
```

> NB: The release 1.1 installs a template to support HTTPS but you will have to update manually the .key and .crt.
The full automated install of HTTPS for the Frontend will come in further version.

#### II. Connect the Frontend to the Backend

Edit the file /opt/blast.eu.com/frontend/static/js/frontend.js and update the value of : hostname, port, protocol
with the same value you decided to configure your Frontend.

```buildoutcfg
this.frontend = {
            hostname: "127.0.0.1", // this hostname must be the frontend site url
            port: "18080", // this port must be the frontend port number
            protocol: "http", // this protocol must be the site protocol
            version: "v1",
            webServerPath: "/opt/blast.eu.com/frontend/static",
            httpImgFolder: "/img"
        }
```

#### III. Frontend service

Update the service manager and start the blast frontend

```buildoutcfg
$ sudo systemctl enable frontend.blast.eu.com.service
Created symlink /etc/systemd/system/multi-user.target.wants/frontend.blast.eu.com.service -> /lib/systemd/system/frontend.blast.eu.com.service.
$ sudo systemctl start frontend.blast.eu.com.service
$ sudo systemctl status frontend.blast.eu.com.service
* frontend.blast.eu.com.service - Nginx instance for frontend.blast.eu.com
   Loaded: loaded (/lib/systemd/system/frontend.blast.eu.com.service; enabled; vendor preset: enabled)
   Active: active (running) since Wed 2021-08-08 10:08:59 CEST; 5s ago
  Process: 1982 ExecStartPre=/usr/sbin/nginx -t -q -c /etc/blast.eu.com/blast_frontend_active.conf (code=exited, status=0/SUCCESS)
  Process: 1983 ExecStart=/usr/sbin/nginx -c /etc/blast.eu.com/blast_frontend_active.conf (code=exited, status=0/SUCCESS)
  Process: 1985 ExecStartPost=/bin/sleep 0.1 (code=exited, status=0/SUCCESS)
 Main PID: 1984 (nginx)
    Tasks: 2 (limit: 467)
   Memory: 2.1M
   CGroup: /system.slice/frontend.blast.eu.com.service
           |-1984 nginx: master process /usr/sbin/nginx -c /etc/blast.eu.com/blast_frontend_active.conf
           `-1986 nginx: worker process
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




