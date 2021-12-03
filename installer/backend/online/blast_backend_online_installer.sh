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
BLAST_BACKEND_NAME="blast.eu.com"
BLAST_BACKEND_USER="blast"
BLAST_BACKEND_GRP="blast"
BLAST_BACKEND_HOSTNAME="127.0.0.1"
BLAST_BACKEND_PORT="28080"
BLAST_BACKEND_SSL="false"
BLAST_BACKEND_GIT_URL="https://github.com/blast-eu-com/blast.eu.com"
BLAST_BACKEND_INSTALL_PATH="/tmp/${BLAST_BACKEND_NAME}"
BLAST_BACKEND_ROOT_PATH="/opt/${BLAST_BACKEND_NAME}"
BLAST_BACKEND_LOG_PATH="/var/log/${BLAST_BACKEND_NAME}"
BLAST_BACKEND_CONFIG_PATH="/etc/${BLAST_BACKEND_NAME}"
BLAST_BACKEND_RUN_PATH="/var/run/${BLAST_BACKEND_NAME}"
BLAST_BACKEND_PATH="${BLAST_BACKEND_ROOT_PATH}/backend"
BLAST_BACKEND_TMP_PATH="${BLAST_BACKEND_PATH}/tmp"
BLAST_BACKEND_OS=`cat /etc/os-release | egrep "^ID=" | cut --delimiter=\= -f2 | sed 's/"//g'`
case $BLAST_BACKEND_OS in
  rhel|fedora|centos)
    PKG_MANAGER=`which yum`
    BLAST_REQUIRED_PACKAGES="clang git make python3-pip python3-virtualenv dos2unix"
    ;;
  debian)
    PKG_MANAGER=`which apt-get`
    BLAST_REQUIRED_PACKAGES="clang git make python3 python3-dev python3-pip python3-venv dos2unix"
    ;;
  *)
    echo "Unknown OS ID: $BLAST_BACKEND_OS"
    exit 1
    ;;
esac

echo_step_phase () {
  ((BLAST_INSTALL_STEP=$BLAST_INSTALL_STEP+1))
  echo ""
  echo -e "\033[1;37m>>> INSTALL STEP\033[0m (\033[1;34m$BLAST_INSTALL_STEP\033[0m)"
  echo -e "\033[1;32m$1\033[0m"
}

install_blast_backend_user () {
  echo_step_phase "@blastServer +add user"
  useradd -m -U -c "blast user" -s `which nologin` $BLAST_BACKEND_USER
}

install_blast_backend_root_folder () {
  echo_step_phase "@blastServer +install root folder"
  # if [[ -d "$BLAST_BACKEND_ROOT_PATH" ]]; then rm -fr "$BLAST_BACKEND_ROOT_PATH"; fi
  mkdir -p "$BLAST_BACKEND_ROOT_PATH"
}

install_blast_backend_tmp_folder () {
  echo_step_phase "@blastServer +install tmp folder"
  # if [[ -d "$BLAST_BACKEND_TMP_PATH" ]]; then rm -fr "$BLAST_BACKEND_TMP_PATH"; fi
  mkdir -p "$BLAST_BACKEND_TMP_PATH"
}

install_blast_backend_run_folder () {
  echo_step_phase "@blastServer +install run folder"
  mkdir -p "$BLAST_BACKEND_RUN_PATH"
}

install_blast_backend_config_folder () {
  echo_step_phase "@blastServer +install config folder"
  mkdir -p "$BLAST_BACKEND_CONFIG_PATH"
}

install_blast_backend_log_folder () {
  echo_step_phase "@blastServer +install log folder"
  mkdir -p "$BLAST_BACKEND_LOG_PATH"
}

install_blast_backend_folders () {
  install_blast_backend_root_folder
  install_blast_backend_tmp_folder
  install_blast_backend_run_folder
  install_blast_backend_config_folder
  install_blast_backend_log_folder
}

install_blast_backend_required_pkg () {
  echo_step_phase "@blastServer +install required packages"
  # install packages required no matter what
  $PKG_MANAGER install -y $BLAST_REQUIRED_PACKAGES

  if [[ $BLAST_BACKEND_OS == 'rhel' ]] || [[ $BLAST_BACKEND_OS == 'fedora' ]] || [[ $BLAST_BACKEND_OS == 'centos' ]]; then
    # install the python3 devel version for rhel like OS
    # get python version to install devel package
    py_version=`alternatives --display python3 | egrep "points to" | egrep -wo "python[0-9]+.[0-9]+" | sed 's/\.//'`
    $PKG_MANAGER install -y ${py_version}-devel
  fi
}

install_blast_backend_virtualenv () {
  echo_step_phase "@blastServer +install server virtual environment"
  python3 -m venv "$BLAST_BACKEND_PATH"
}

download_blast_backend_software () {
  echo_step_phase "@blastServer +download server software"
  cd `dirname "$BLAST_BACKEND_INSTALL_PATH"`
  git clone "$BLAST_BACKEND_GIT_URL"
}

install_blast_backend_config_pip () {
  echo_step_phase "@blastServer +install server config pip"
  source "${BLAST_BACKEND_PATH}/bin/activate"
  pip3 install --upgrade pip
  pip3 install -r "${BLAST_BACKEND_INSTALL_PATH}/installer/backend/requirements.txt"
}

install_blast_backend_config_system_tree () {
  echo_step_phase "@blastServer +install server system tree"
  mkdir "$BLAST_BACKEND_CONFIG_PATH" "$BLAST_BACKEND_TMP_PATH" "${BLAST_BACKEND_PATH}/ansible" "${BLAST_BACKEND_PATH}/script" \
  "${BLAST_BACKEND_PATH}/session"
  cp -pr "${BLAST_BACKEND_INSTALL_PATH}/backend" "$BLAST_BACKEND_ROOT_PATH"
  cp -p "${BLAST_BACKEND_INSTALL_PATH}/installer/backend/backend.yml.template" "${BLAST_BACKEND_CONFIG_PATH}/backend.yml"
}

install_blast_backend_config_uwsgi () {
  echo_step_phase "@blastServer +install server config uwsgi"
  sed -e "s|%BLAST_BACKEND_USER%|${BLAST_BACKEND_USER}|g" \
      -e "s|%BLAST_BACKEND_GRP%|${BLAST_BACKEND_GRP}|g" \
      -e "s|%BLAST_BACKEND_HOSTNAME%|${BLAST_BACKEND_HOSTNAME}|g" \
      -e "s|%BLAST_BACKEND_PORT%|${BLAST_BACKEND_PORT}|g" \
      -e "s|%BLAST_BACKEND_LOG_PATH%|${BLAST_BACKEND_LOG_PATH}|g" \
      "${BLAST_BACKEND_INSTALL_PATH}/installer/backend/main.ini.template" >"${BLAST_BACKEND_PATH}/main.ini"
}

install_blast_backend_config_service () {
  echo_step_phase "@blastServer +install server config service"
  sed -e "s|%BLAST_BACKEND_USER%|${BLAST_BACKEND_USER}|g" \
      -e "s|%BLAST_BACKEND_GRP%|${BLAST_BACKEND_GRP}|g" \
      -e "s|%BLAST_BACKEND_PATH%|${BLAST_BACKEND_PATH}|g" \
      -e "s|%BLAST_BACKEND_TMP_PATH%|${BLAST_BACKEND_TMP_PATH}|g" \
      "${BLAST_BACKEND_INSTALL_PATH}/installer/backend/backend.blast.eu.com.service.template" >/lib/systemd/system/backend.blast.eu.com.service
}

install_blast_backend_software_ownership () {
  echo_step_phase "@blastServer +install server config ownership"
  chown -R ${BLAST_BACKEND_USER}:${BLAST_BACKEND_GRP} $BLAST_BACKEND_CONFIG_PATH $BLAST_BACKEND_PATH \
  $BLAST_BACKEND_LOG_PATH $BLAST_BACKEND_RUN_PATH
}

install_blast_backend_config_main () {
  install_blast_backend_config_pip
  install_blast_backend_config_system_tree
  install_blast_backend_config_uwsgi
  install_blast_backend_config_service
  install_blast_backend_software_ownership
}

cleanup_blast_server_install () {
  echo_step_phase "@blastServer +cleanup install tmp materials"
  rm -fr "$BLAST_BACKEND_INSTALL_PATH"
}


# @main
# install blast base
install_blast_backend_user
install_blast_backend_folders

# install packages and pip features
install_blast_backend_required_pkg

# create virtual env
install_blast_backend_virtualenv

# download blast server software from git
download_blast_backend_software

# install blast server features
install_blast_backend_config_main

# cleanup blast server tmp materials
cleanup_blast_server_install
