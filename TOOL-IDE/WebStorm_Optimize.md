- 불필요한 파일은 검색에서 제외(exlcude directory from search)

  - Settings => Scopes => Create a custom scope
  - exclude/include 옵션을 사용하여 디렉토리 지정
  - 제외 옵션이 제대로 동작하는지 확인

- JVM 옵션 설정(Congifure JVM Options)

  - 참고 : https://gist.github.com/P7h/4388881

  ```
  -server
  -Xms1024m
  -Xmx3072m
  -XX:NewSize=512m
  -XX:MaxNewSize=512m
  -XX:PermSize=512m
  -XX:MaxPermSize=512m
  -XX:+UseParNewGC
  -XX:ParallelGCThreads=4
  -XX:MaxTenuringThreshold=1
  -XX:SurvivorRatio=8
  -XX:+UseCodeCacheFlushing
  -XX:+UseConcMarkSweepGC
  -XX:+AggressiveOpts
  -XX:+CMSClassUnloadingEnabled
  -XX:+CMSIncrementalMode
  -XX:+CMSIncrementalPacing
  -XX:+CMSParallelRemarkEnabled
  -XX:CMSInitiatingOccupancyFraction=65
  -XX:+CMSScavengeBeforeRemark
  -XX:+UseCMSInitiatingOccupancyOnly
  -XX:ReservedCodeCacheSize=1024m
  -XX:-TraceClassUnloading
  -ea
  -Dsun.io.useCanonCaches=false
  ```

- Configure idea.properties

  - 소스 코드 편집기에서 편집 시, read/write lock 발생에 따라 지연이 생길 수 있음.

    - [zero-latency mode](https://blog.jetbrains.com/idea/2015/08/experimental-zero-latency-typing-in-intellij-idea-15-eap/)를 활성화하여 지연을 줄임

      ```
      /Applications/WebStorm.app/Contents/bin/idea.properties
      ```

      ```
      editor.zero.latency.typing=true
      ```

      ​

  ​