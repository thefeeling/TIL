

# Install
```bash
# 1. Node 버젼의 경우 6.10.X를 지원하고 있음
#    작년까지는 6.10....... 최근에 8.10도 지원하네요
> nvm use v8.10

# 2. Local로 설치하셔도 무관합니다.
> npm install -g serverless

# 3. AWS Credential 셋팅(accessKey / SecretKey / Default region)
> aws configure

# 4. 설치 확인
> sls --help

# 5. 템플릿 생성
> sls create --template aws-nodejs --path my-service
```

# Template
- **aws-nodejs**
- aws-nodejs-typescript
- aws-nodejs-ecma-script
- aws-python
- aws-python3
- **aws-kotlin-jvm-maven**
- **aws-kotlin-nodejs-gradle**
- aws-groovy-gradle
- **aws-java-gradle**
- **aws-java-maven**
- aws-scala-sbt
- aws-csharp
- aws-fsharp
- aws-go

# 기본 폴더 트리(aws-nodejs)
```
drwxr-xr-x   5 Daniel  staff   170  4 11 10:56 .
drwxr-xr-x  15 Daniel  staff   510  4 11 10:56 ..
-rw-r--r--   1 Daniel  staff    86  4 11 10:56 .gitignore
-rw-r--r--   1 Daniel  staff   466  4 11 10:56 handler.js
-rw-r--r--   1 Daniel  staff  2829  4 11 10:56 serverless.yml
```

# Command

```
> sls --help

config ........................ Configure Serverless
config credentials ............ Configures a new provider profile for the Serverless Framework
create ........................ Create new Serverless service
deploy ........................ Deploy a Serverless service
deploy function ............... Deploy a single function from the service
deploy list ................... List deployed version of your Serverless Service
deploy list functions ......... List all the deployed functions and their versions
info .......................... Display information about the service
install ....................... Install a Serverless service from GitHub or a plugin from the Serverless registry
invoke ........................ Invoke a deployed function
invoke local .................. Invoke function locally
logs .......................... Output the logs of a deployed function
metrics ....................... Show metrics for a specific function
offline ....................... Simulates API Gateway to call your lambda functions offline.
offline start ................. Simulates API Gateway to call your lambda functions offline using backward compatible initialization.
remove ........................ Remove Serverless service and all resources

Plugins
... many
```



# Deploy

- [AWS Deploy Guide](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/deploying-lambda-apps.html)

- 배포는 전체 혹은 함수 단위로 가능

  ```bash
  sls deploy --stage test # 전체
  sls deploy function --stage test --function alarm
  sls deploy function --stage test --function alarm -v
  ```

- 배포 플로우

  - `serverless.yml`을 참조하여 CloudFormation을 작성.
  - 함수 코드 압축 후 S3 업로드
  - 이전 배포 버젼의 해시를 참고하여 현재 버젼과 비교
  - 만약 운영중인 소스와 현재 배포 버젼의 해시가 동일하다면 종료됨.

# 구현 사례

- [AWS KMS를 이용한 암호화 API 구축하기](http://woowabros.github.io/experience/2017/02/06/aws-kms.html)
- [AWS Lambda를 이용한 이미지 썸네일 생성 개발 후기](https://medium.com/n42-corp/aws-lambda%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%8D%B8%EB%84%A4%EC%9D%BC-%EC%83%9D%EC%84%B1-%EA%B0%9C%EB%B0%9C-%ED%9B%84%EA%B8%B0-acc278d49980)



# 삽질 내용

- 인텔리제이/웹스톰에서 디버깅 할때는 `serverless-offline` 사용 및 `SLS_DEBUG` 환경 변수 사용
- 코드 실행의 Maximum Time은 5분!, 5분 이내에 수행이 종료되는게 불확실한 경우 Lambda를 이벤트 발생기로만 사용하는 방법을 고려!
- Private VPC를 설정하여 lambda를 사용하는 경우, NAT Gateway 설정을 추가로 해야 외부 서버와 통신 가능
- 중복 호출 및 불필요한 리소스 설정이 안되도록 주의해야 함
  - 폭탄 과금의 위험이….
- CPU 파워는 설정 메모리에 따라 올라가고 내려감.
- Serverless framework, `serverless.yml` 설정 파일의 공백에 주의. 
  - 2space를 기본으로 하며 제대로 공백 처리가 안된경우 배포 시 제대로 설정이 안될 수 있음.
- AWS의 외부 리소스 사용 시, 람다 실행에 대한 롤 설정이 제대로 되어 있어야 함!

# 참고자료
- https://www.slideshare.net/KyuhyunByun1/albec2-to-api-gateway-lambda