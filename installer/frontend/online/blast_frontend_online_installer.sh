#!/bin/bash
# Copyright 2021 Jerome DE LUCCHI
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

BLAST_INSTALL_STEP=0
BLAST_FRONTEND_NAME="blast.eu.com"
BLAST_FRONTEND_GIT_URL="https://github.com/blast-eu-com/blast.eu.com"
BLAST_FRONTEND_ACTIVE_PROTO="HTTP"
BLAST_FRONTEND_HTTP_PORT="18080"
BLAST_FRONTEND_HTTPS_PORT="10443"
BLAST_BACKEND_HOSTNAME="127.0.0.1"
BLAST_BACKEND_PORT="28080"
BLAST_FRONTEND_USER="blast"
BLAST_FRONTEND_GRP="blast"
BLAST_FRONTEND_INSTALL_TMP="/tmp/${BLAST_FRONTEND_NAME}"
BLAST_FRONTEND_ROOT_PATH="/opt/${BLAST_FRONTEND_NAME}"
BLAST_FRONTEND_CONFIG_PATH="/etc/${BLAST_FRONTEND_NAME}"
BLAST_FRONTEND_LOG_PATH="/var/log/${BLAST_FRONTEND_NAME}"
BLAST_FRONTEND_RUN_PATH="/var/run/${BLAST_FRONTEND_NAME}"
BLAST_FRONTEND_PATH="${BLAST_FRONTEND_ROOT_PATH}/frontend"
BLAST_FRONTEND_OS=`cat /etc/os-release | egrep "^ID=" | cut --delimiter=\= -f2 | sed 's/"//g'`
case $BLAST_FRONTEND_OS in
  rhel|fedora|centos)
    PKG_MANAGER=`which yum`
    BLAST_REQUIRED_PACKAGES="git nginx"
    ;;
  debian)
    PKG_MANAGER=`which apt-get`
    BLAST_REQUIRED_PACKAGES="git nginx"
    ;;
  *)
    echo "Unknown OS ID: $BLAST_FRONTEND_OS"
    exit 1
    ;;
esac

echo_step_phase () {
  ((BLAST_INSTALL_STEP=$BLAST_INSTALL_STEP+1))
  echo ""
  echo -e "\033[1;37m>>> INSTALL STEP\033[0m (\033[1;34m$BLAST_INSTALL_STEP\033[0m)"
  echo -e "\033[1;32m$1\033[0m"
}

install_blast_frontend_user () {
  echo_step_phase "@blastFront +add user"
  useradd -m -U -c "blast user" -s "/sbin/nologin" $BLAST_FRONTEND_USER
}

install_blast_frontend_root_folder () {
  echo_step_phase "@blastFrontend +install root folder"
  mkdir -p "$BLAST_FRONTEND_ROOT_PATH"
}

install_blast_frontend_run_folder () {
  echo_step_phase "@blastFrontend +install run folder"
  mkdir -p "$BLAST_FRONTEND_RUN_PATH"
}

install_blast_frontend_folder () {
  echo_step_phase "@blastFrontend +install frontend folder"
  mkdir -p "$BLAST_FRONTEND_PATH"
}

install_blast_frontend_config_folder () {
  echo_step_phase "@blastFrontend +install frontend config folder"
  mkdir -p "$BLAST_FRONTEND_CONFIG_PATH"
}

install_blast_frontend_log_folder () {
  echo_step_phase "@blastFrontend +install frontend log folder"
  mkdir -p "$BLAST_FRONTEND_LOG_PATH"
}

install_blast_frontend_folders () {
  install_blast_frontend_root_folder
  install_blast_frontend_folder
  install_blast_frontend_run_folder
  install_blast_frontend_config_folder
  install_blast_frontend_log_folder
}

install_blast_frontend_required_pkg () {
  echo_step_phase "@blastFrontend +install required packages"
  # install packages required no matter what
  $PKG_MANAGER install $BLAST_REQUIRED_PACKAGES -y
}

download_blast_frontend_software () {
  echo_step_phase "@blastFrontend +download frontend software"
  cd `dirname "$BLAST_FRONTEND_INSTALL_TMP"`
  git clone "$BLAST_FRONTEND_GIT_URL"
}

install_blast_frontend_config_system_tree () {
  echo_step_phase "@blastFrontend +install system tree"
  cp -pr "${BLAST_FRONTEND_INSTALL_TMP}/frontend" "$BLAST_FRONTEND_ROOT_PATH"
}

install_blast_frontend_config_http () {
  echo_step_phase "@blastFrontend +install nginx config http"
  sed -e "s|%BLAST_BACKEND_HOSTNAME%|${BLAST_BACKEND_HOSTNAME}|g" \
      -e "s|%BLAST_BACKEND_PORT%|${BLAST_BACKEND_PORT}|g" \
      -e "s|%BLAST_FRONTEND_PATH%|${BLAST_FRONTEND_PATH}|g" \
      -e "s|%BLAST_FRONTEND_RUN_PATH%|${BLAST_FRONTEND_RUN_PATH}|g" \
      -e "s|%BLAST_FRONTEND_LOG_PATH%|${BLAST_FRONTEND_LOG_PATH}|g" \
      -e "s|%BLAST_FRONTEND_HTTP_PORT%|${BLAST_FRONTEND_HTTP_PORT}|g" \
      "${BLAST_FRONTEND_INSTALL_TMP}/installer/frontend/http_blast_frontend.conf" >"${BLAST_FRONTEND_PATH}/http_blast_frontend.conf"
}

install_blast_frontend_config_https () {
  echo_step_phase "@blastFrontend +install nginx config https"
  sed -e "s|%BLAST_BACKEND_HOSTNAME%|${BLAST_BACKEND_HOSTNAME}|g" \
      -e "s|%BLAST_BACKEND_PORT%|${BLAST_BACKEND_PORT}|g" \
      -e "s|%BLAST_FRONTEND_PATH%|${BLAST_FRONTEND_PATH}|g" \
      -e "s|%BLAST_FRONTEND_RUN_PATH%|${BLAST_FRONTEND_RUN_PATH}|g" \
      -e "s|%BLAST_FRONTEND_LOG_PATH%|${BLAST_FRONTEND_LOG_PATH}|g" \
      -e "s|%BLAST_FRONTEND_HTTPS_PORT%|${BLAST_FRONTEND_HTTPS_PORT}|g" \
      "${BLAST_FRONTEND_INSTALL_TMP}/installer/frontend/https_blast_frontend.conf" >"${BLAST_FRONTEND_PATH}/https_blast_frontend_conf"
}

install_blast_frontend_config_service () {
  echo_step_phase "@blastFrontend +install service"
  sed -e "s|%BLAST_FRONTEND_RUN_PATH%|${BLAST_FRONTEND_RUN_PATH}|g" \
      -e "s|%BLAST_FRONTEND_CONFIG_PATH%|${BLAST_FRONTEND_CONFIG_PATH}|g" \
      "${BLAST_FRONTEND_INSTALL_TMP}/installer/frontend/frontend.blast.eu.com.service.template" >"/lib/systemd/system/frontend.blast.eu.com.service"
}

install_blast_frontend_activate_nginx_config () {
  echo_step_phase "@blastFrontend +install nginx active config"
  case $BLAST_FRONTEND_ACTIVE_PROTO in
    HTTP|http)
      ln -s ${BLAST_FRONTEND_PATH}/http_blast_frontend.conf ${BLAST_FRONTEND_CONFIG_PATH}/blast_frontend_active.conf
      ;;
    HTTPS|https)
      ln -s ${BLAST_FRONTEND_PATH}/https_blast_frontend.conf ${BLAST_FRONTEND_CONFIG_PATH}/blast_frontend_active.conf
      ;;
    *)
      echo "NOT A VALID ACTIVE PROTO: $BLAST_FRONTEND_ACTIVE_PROTO"
      exit 1
      ;;
  esac
}

install_blast_frontend_config_ownership () {
  echo_step_phase "@blastFrontend +install system tree ownership"
  chown -R ${BLAST_FRONTEND_USER}:${BLAST_FRONTEND_GRP} ${BLAST_FRONTEND_PATH} ${BLAST_FRONTEND_LOG_PATH} ${BLAST_FRONTEND_RUN_PATH}
}

install_blast_frontend_config_main () {
  install_blast_frontend_config_system_tree
  install_blast_frontend_config_http
  install_blast_frontend_config_https
  install_blast_frontend_config_service
  install_blast_frontend_activate_nginx_config
  install_blast_frontend_config_ownership
}

cleanup_blast_frontend_install () {
  echo_step_phase "@blastFront +cleanup blast server install tmp materials"
  rm -fr "$BLAST_FRONTEND_INSTALL_TMP"
}

# @main
# install blast requirements
install_blast_frontend_user
install_blast_frontend_folders

# install packages and pip features
install_blast_frontend_required_pkg

# get blast front software from git
download_blast_frontend_software

# install blast front features
install_blast_frontend_config_main

# cleanup blast front install tmp materials
cleanup_blast_frontend_install