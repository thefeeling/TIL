# PM2
- Node.js 애플리케이션용 프로덕션 프로세스 관리자
- 로드 밸런서 기본 제공
- 앱을 항상 작동 상태로 유지
- 시스템 가동 중단 없이 앱을 다시 로드
  - **MAX MEMORY RESTART** 기능을 제공하는데 **커맨드라인/JSON/코드(JS)** 등으로 설정 가능하다.
- 일반적인 시스템 관리 태스크를 쉽게 처리 가능
- 애플리케이션 로깅, 모니터링 및 클러스터링을 관리
  - 클러스터 모드의 경우, 여러개의 프로세스를 생성해놓고, 이를 PM2에서 자동으로 로드밸런싱으로 지원해주기 때문에, 앞단 웹 서버(Nginx, Apache Server 등)에서 프록시 설정만 간단히 해줘도 된다.

## 설치
```bash
$ [sudo] npm install pm2 -g
```

## 기본 사용
앱을 시작할때 즉시 백그라운드로 보내진다.
```bash
$ pm2 start app.js
```

메뉴얼을 읽으면서 가장 괜찮다고 생각한 부분이 바로 다른 스크립트 언어도 같이 지원하는 부분이었다.
```
$ pm2 start echo.pl --interpreter=perl

$ pm2 start echo.coffee
$ pm2 start echo.php
$ pm2 start echo.py
$ pm2 start echo.sh
$ pm2 start echo.rb
```

## 어플리케이션 설정 파일 사용
JSON, YML 포맷으로 만들어진 파일을 일종의 시작 프로파일로 사용할 수 있다.
```bash
$ pm2 start start.yml(start.json)
```

**start.yml**
```yml
apps:
  - script   : app.js
    instances: 4
    exec_mode: cluster
  - script : worker.js
    watch  : true
    env    :
      NODE_ENV: development
    env_production:
      NODE_ENV: production
```

**start.json**
```json
{
      "apps" : [
            {
            "name"       : "bash-worker",
            "script"     : "./a-bash-script",
            "exec_interpreter": "bash",
            "exec_mode"  : "fork_mode"
            },
            {
            "name"       : "ruby-worker",
            "script"     : "./some-ruby-script",
            "exec_interpreter": "ruby",
            "exec_mode"  : "fork_mode"
            }
      ]
}
```


## CheatSheat
- 출처 : [PM2 공식 홈페이지](http://pm2.keymetrics.io/docs/usage/quick-start/#cheat-sheet)
```bash
# Fork mode
$ pm2 start app.js --name my-api # 프로세스 네임 지정

# Cluster mode
$ pm2 start app.js -i 0     # 가용한 CPU 갯수만큼 클러스터 확장
$ pm2 start app.js -i max   # 위 설정과 동일하지만 곧 Deprecated 예정?

# Listing
$ pm2 list               # 모든 프로세스 리스트/상태 확인
$ pm2 jlist              # 모든 프로세스 리스트/상태 확인(JSON)
$ pm2 prettylist         # 모든 프로세스 리스트/상태 확인(Beatiful JSON)

$ pm2 describe 0         # 특정 프로세스 정보 확인
$ pm2 monit              # 모든 프로세스 모니터링

# Logs

$ pm2 logs [--raw]       # Display all processes logs in streaming
$ pm2 flush              # Empty all log file
$ pm2 reloadLogs         # Reload all logs

# Actions

$ pm2 stop all           # Stop all processes
$ pm2 restart all        # Restart all processes

$ pm2 reload all         # Will 0s downtime reload (for NETWORKED apps)
$ pm2 gracefulReload all # Send exit message then reload (for networked apps)

$ pm2 stop 0             # Stop specific process id
$ pm2 restart 0          # Restart specific process id

$ pm2 delete 0           # Will remove process from pm2 list
$ pm2 delete all         # Will remove all processes from pm2 list

# Misc

$ pm2 reset <process>    # Reset meta data (restarted time...)
$ pm2 updatePM2          # Update in memory pm2
$ pm2 ping               # Ensure pm2 daemon has been launched
$ pm2 sendSignal SIGUSR2 my-app # Send system signal to script
$ pm2 start app.js --no-daemon
$ pm2 start app.js --no-vizion
$ pm2 start app.js --no-autorestart

```


# 참고
- [Deploying Node.js with PM2 and Nginx](https://doesnotscale.com/deploying-node-js-with-pm2-and-nginx/)
- [PM2 를 이용하여 NodeJS 프로세스 관리하기](http://www.tutorialbook.co.kr/entry/PM2-%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%98%EC%97%AC-NodeJS-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EA%B4%80%EB%A6%AC%ED%95%98%EA%B8%B0)
