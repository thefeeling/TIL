---
title: 'NVM 설치 및 기본 사용 방법'
date: 2016/7/12 00:00:00
categories:
- JavaScript
---

### NVM 설치 및 기본 사용 방법
수시로 업데이트 되는 노드 버젼 관리를 위하여 설치.
#### 설치 전 확인사항
> The installer can use git, curl, or wget to download nvm, whatever is available.

1. 인스톨러는 *git*과 *curl* 혹은 *wget*를 사용함.

> First you'll need to make sure your system has a c++ compiler. For OS X, Xcode will work, for Ubuntu, the build-essential and libssl-dev packages work.

2. 시스템에 C++ 컴파일러가 설치 되어 있어야 함. Mac OS의 경우 XCode가 설치 되어 있어야 하며, 우분투 환경에서는 *build-essential*과 *libssl-dev* 패키지가 설치 되어 있어야 함.


>Note: nvm does not support Windows (see #284). Two alternatives exist, which are neither supported nor developed by us:

3. *nvm*은 윈도우 환경에 대하여 지원을 하지 않으나, 공식적으로 지원되지 않거나 개발되지 않은 환경으로 대안이 존재함.(하단 링크 참조)

 - [nvm-windows](https://github.com/coreybutler/nvm-windows)
 - [nodist](https://github.com/marcelklehr/nodist)


> Homebrew installation is not supported

4. *HomeBrew*는 지원하지 않음.(homebrew로 설치한 경우 제거해야 함.)

> Git versions before v1.7 may face a problem of cloning nvm source from GitHub via https protocol, and there is also different behavior of git before v1.6, so the minimum required git version is v1.7.0 and we recommend v1.7.9.5 as it's the default version of the wildly used Ubuntu 12.04 LTS

5. v1.7 이하의 git에서는 nvm 소스를 복사하는 과정에서 https 프로토콜 관련 문제가 생길 수 있으며, v1.6 이하에서도 역시 다른 행동(예상이 안되는)을 보일 수 있음. 그래서, 최소한 v1.7 이상을 권하며, 그 중에서 v1.7.9.5 버젼 설치를 권고함.

#### 설치

```bash
# Curl
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
# wget
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
```
커맨드 라인을 활용하여 설치를 진행하며 *curl* 혹은 *wget*이 사용 가능한 환경이 준비 되어 있어야 한다.

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
```
위 스크립트는 nvm repository에서 ~./nvm으로 복사되며, 해당 소스 라인은 프로파일(*~/.bash_profile*, *~/.zshrc*, *~/.profile*, or *~/.bashrc*)에 추가된다.

OS X 사용자의 경우, 인스톨 스크립트 진행 후 *nvm: command not found*과 같은 메세지를 볼 수도 있는데, 이는 프로파일(<u>.bash_profile</u>)이 추가 되어 있지 않기 때문에 생기는 오류이다. 간단하게 아래와 같이 커맨드 라인을 입력하여 추가 후 인스톨 스크립트를 다시 실행시키면 된다.

```bash
touch ~/.bash_profile
```

설치가 정상적으로 진행되었다면, 아래 커맨드를 입력하여 정상적으로 설치가 되었는지 확인하면 된다.
```bash
command -v nvm
```

#### 수동 설치
[링크](https://github.com/creationix/nvm#manual-install)를 통하여 안내 가이드를 참고하자.



#### 기본 사용 방법
```bash
# 최신 릴리즈 설치 후 해당 버젼 사용
nvm install node
nvm use node
nvm run node --version

# 버젼 지정 후 설치 진행
# 아래 커맨드의 경우, 5.X 버젼대의 최신 버젼 설치를 진행함.
nvm install v5

# 원하는 버젼으로 실행
nvm exec 4.2 node --version

# 설치 되어 있는 노드 버젼 패스 확인
nvm which 5.0

# 사용 가능한(설치 되어 있는) 노드 버젼 리스트
nvm ls

# 설치 가능한 노드 버젼 리스트
nvm ls-remote

# alias 옵션 설정을 통하여
# 전역 쉘 환경에서 사용할 기본 노드 버젼 지정
nvm alias default node
```
#### 기타 참고
- 전역 환경이 아닌 프로젝트별로 환경이 고정되어 있는 경우에는 *.nvmrc*을 루트 폴더 혹은 프로젝트 폴더 최상위에 정의하여 노드 버젼 환경을 관리할 수도 있다.

- 쉘 환경(zsh 등)을 이용하여 nvm과 통합 환경을 구성할 수 있으나, 공식적으로 지원되는 항목이 아니라고 한다.(하지만 nvm 개발팀에서는 여러 유저들의 통합 환경 구성에 대하여 의견은 받고 있는거 같다.)
