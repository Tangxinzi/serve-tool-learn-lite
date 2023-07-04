#!/bin/bash
strUsername="jiangkun"
strToken="f6fe94a2ad2aa310ab9ad0c57aad7f98"
installDir="/usr/local/flynat"
manager="darwin"
distro="Darwin"
serviceStatus=0
scriptAddress="https://flynat.api.51miaole.com/api/v1/download/script/autostart/"

usage()
{
	cat << EOT

Usage :  ${0} [OPTION] ...
  蜻蜓映射客户端管理脚本

Options:
  start     启动服务
  stop      关闭服务
  status    服务状态
  logs      查看客户端日志
  enable    设置开机自启动
  uninstall 卸载客户端
EOT
}


start() {
  pid=$(get_pid)
  if [[ ! -z $pid ]]
  then
    status
  else
    nohup $installDir/flynatc -u $strUsername -k $strToken >>$installDir/logs/flynatc.log 2>&1 &
    status
    if [[ $serviceStatus -eq 1 ]]
    then
        tail -n1 $installDir/logs/flynatc.log
    fi
  fi
}

stop() {
  pid=$(get_pid)
  kill -9 $pid
  status
}
logs() {
  tail -f $installDir/logs/flynatc.log
}




get_pid() {
  if [[ $(command -v pgrep) ]]; then
    pid=$(pgrep flynatc)
    echo $pid
  else
    pid=$(ps aux |grep "flynatc" |grep -v "grep" |awk '{print $2}')
    echo $pid
  fi

}


status() {
  pid=$(get_pid)
  if [[ ! -z $pid ]]
  then
    echo -e "\033[32m flynatc RUNNING pid $pid \033[0m"
  else
    serviceStatus=1
    echo -e "\033[31m flynatc STOP \033[0m"
  fi
}



# 下载管理脚本
downloadAutoStartScript() {
  filename=$1
  distro=$2
  postData="username=$strUsername&token=$strToken&install_dir=$installDir&distro=$distro&manager=$manager"
  curl -so $filename -d $postData $scriptAddress >/dev/null 2>&1
    if [[ $? -ne 0 ]]; then
      # curl not found, try wget download
      wget -qO $filename --post-data=$postData $scriptAddress >/dev/null
  fi
}


# 设置开机自动启动
start_enable() {
    
        echo -e "\033[31m 垃圾脚本不支持您的系统，请手动设置开机自启动 \033[0m"
    
}

# 卸载客户端
uninstall() {
    stop
    rm -rf $installDir
    echo -e "\033[31m 卸载flynatc成功 \033[0m"
    
}


while [[ true ]]; do
	case "$1" in
	  start )
      start
      exit 0
      ;;
    stop )
      stop
      exit 0
      ;;
    logs )
      logs
      exit 0
      ;;
    status )
      status
      exit 0
      ;;
    enable)
      start_enable
      exit 0
      ;;
    uninstall)
      uninstall
      exit 0
      ;;
    --help )
      usage
      exit 0
      ;;
    * )
      usage
      exit 1
      ;;
	esac
	if [[ $# == 0 ]]; then
		break
	fi
done